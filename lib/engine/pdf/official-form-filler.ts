import { PDFDocument, PDFCheckBox, PDFTextField, PDFDropdown, PDFRadioGroup, StandardFonts, rgb } from 'pdf-lib';
import type { MasterCaseData } from '../../types/master-case';
import {
  mapMasterCaseToForm101Fields,
  mapForm106I,
  mapForm106J,
  mapForm122A1
} from '../mappers';

/**
 * Fills the official U.S. Courts fillable PDFs (Form 100 series) from case data.
 *
 * The official PDFs are NOT bundled: download them from uscourts.gov and place them in
 * `public/forms/official/` under the file names in OFFICIAL_FORM_REGISTRY. Each form's
 * `fieldMap` maps the PDF's own AcroForm field names to values from the case data. Field
 * names come from the PDF itself: run `bun run forms:inspect <file>` to list them, then fill
 * in the map. A form with an empty map is reported as "not mapped" and the app falls back to
 * the watermarked data sheet.
 *
 * Every map entry is checked against the PDF on each fill, so a new form edition that renames
 * or removes a field is reported as `missingInPdf` instead of silently leaving it blank.
 */

export type FieldValue = string | boolean;
export type FieldMap = Record<string, (data: MasterCaseData) => FieldValue | undefined>;

export interface OfficialFormSpec {
  formId: string;
  officialNumber: string;
  /** File name under public/forms/official/ (as downloaded from uscourts.gov). */
  templateFile: string;
  /** Form edition the map was written against, e.g. "12/22". Set when the map is built. */
  mappedEdition: string | null;
  fieldMap: FieldMap;
}

export interface FillReport {
  formId: string;
  filled: string[];
  /** Map entries whose field name does not exist in this PDF (edition drift). */
  missingInPdf: string[];
  /** Fields in the PDF with no map entry. Expected to be non-empty; review before release. */
  unmappedPdfFields: string[];
  /** Map entries that produced no value from the case data. */
  noValue: string[];
}

const usd = (n: unknown) => Number(n || 0).toFixed(2);

// Values reused by maps; each map entry picks from these. Keys on the left of each map below
// are placeholders until the maps are built against the downloaded PDFs.
export const officialFormValues = {
  form101: (d: MasterCaseData) => mapMasterCaseToForm101Fields(d),
  form106i: (d: MasterCaseData) => mapForm106I(d),
  form106j: (d: MasterCaseData) => mapForm106J(d),
  form122a1: (d: MasterCaseData) => mapForm122A1(d),
  usd
};

export const OFFICIAL_FORM_REGISTRY: Record<string, OfficialFormSpec> = {
  form101: { formId: 'form101', officialNumber: 'Official Form 101', templateFile: 'form_b101.pdf', mappedEdition: null, fieldMap: {} },
  form106i: { formId: 'form106i', officialNumber: 'Official Form 106I', templateFile: 'form_b106i.pdf', mappedEdition: null, fieldMap: {} },
  form106j: { formId: 'form106j', officialNumber: 'Official Form 106J', templateFile: 'form_b106j.pdf', mappedEdition: null, fieldMap: {} },
  form122a1: { formId: 'form122a1', officialNumber: 'Official Form 122A-1', templateFile: 'form_b122a-1.pdf', mappedEdition: null, fieldMap: {} }
};

export function isFormMapped(formId: string): boolean {
  const spec = OFFICIAL_FORM_REGISTRY[formId];
  return Boolean(spec && spec.mappedEdition !== null && Object.keys(spec.fieldMap).length > 0);
}

export async function listFormFields(pdfBytes: Uint8Array): Promise<Array<{ name: string; type: string }>> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  return doc.getForm().getFields().map(f => ({ name: f.getName(), type: f.constructor.name.replace(/^PDF/, '') }));
}

export async function fillOfficialForm(
  pdfBytes: Uint8Array,
  fieldMap: FieldMap,
  data: MasterCaseData,
  opts: { formId: string; draftStamp?: boolean } = { formId: 'unknown' }
): Promise<{ bytes: Uint8Array; report: FillReport }> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = doc.getForm();
  const pdfFieldNames = new Set(form.getFields().map(f => f.getName()));
  const report: FillReport = { formId: opts.formId, filled: [], missingInPdf: [], unmappedPdfFields: [], noValue: [] };

  for (const [name, resolve] of Object.entries(fieldMap)) {
    if (!pdfFieldNames.has(name)) { report.missingInPdf.push(name); continue; }
    const value = resolve(data);
    if (value === undefined || value === '') { report.noValue.push(name); continue; }
    const field = form.getField(name);
    if (field instanceof PDFTextField) field.setText(String(value));
    else if (field instanceof PDFCheckBox) (value === true || value === 'true') ? field.check() : field.uncheck();
    else if (field instanceof PDFDropdown) field.select(String(value));
    else if (field instanceof PDFRadioGroup) field.select(String(value));
    else { report.noValue.push(name); continue; }
    report.filled.push(name);
  }
  for (const name of pdfFieldNames) if (!(name in fieldMap)) report.unmappedPdfFields.push(name);

  if (opts.draftStamp !== false) {
    // Small header on each page so a filled draft can't be mistaken for a reviewed filing.
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    for (const page of doc.getPages()) {
      const { height } = page.getSize();
      page.drawText('DRAFT - SUPERVISING ATTORNEY REVIEW REQUIRED BEFORE FILING', {
        x: 36, y: height - 14, size: 7, font, color: rgb(0.7, 0.2, 0.1)
      });
    }
  }
  return { bytes: await doc.save(), report };
}
