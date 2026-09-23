import { describe, expect, it } from 'bun:test';
import { PDFDocument } from 'pdf-lib';
import { createSampleMasterCaseData } from './helpers/sample-case';
import { fillOfficialForm, listFormFields, isFormMapped, OFFICIAL_FORM_REGISTRY, type FieldMap } from '../lib/engine/pdf/official-form-filler';

// A stand-in for an official fillable PDF: two text fields and a checkbox.
async function syntheticForm(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const form = doc.getForm();
  form.createTextField('Debtor1.First name').addToPage(page, { x: 50, y: 700, width: 200, height: 20 });
  form.createTextField('Debtor1.Last name').addToPage(page, { x: 50, y: 660, width: 200, height: 20 });
  form.createCheckBox('Chapter 7').addToPage(page, { x: 50, y: 620, width: 12, height: 12 });
  form.createTextField('Unmapped field').addToPage(page, { x: 50, y: 580, width: 200, height: 20 });
  return doc.save();
}

describe('official form filler', () => {
  it('lists AcroForm fields', async () => {
    const fields = await listFormFields(await syntheticForm());
    expect(fields.map(f => f.name)).toContain('Debtor1.First name');
  });

  it('fills mapped fields and reports drift and gaps', async () => {
    const data = createSampleMasterCaseData();
    const map: FieldMap = {
      'Debtor1.First name': d => d.debtor_1.first_name.value,
      'Debtor1.Last name': d => d.debtor_1.last_name.value,
      'Chapter 7': d => d.chapter === '7',
      'Field from an older edition': () => 'x'
    };
    const { bytes, report } = await fillOfficialForm(await syntheticForm(), map, data, { formId: 'test' });
    expect(report.filled).toEqual(['Debtor1.First name', 'Debtor1.Last name', 'Chapter 7']);
    expect(report.missingInPdf).toEqual(['Field from an older edition']);
    expect(report.unmappedPdfFields).toEqual(['Unmapped field']);

    const filled = (await PDFDocument.load(bytes)).getForm();
    expect(filled.getTextField('Debtor1.First name').getText()).toBe('Example');
    expect(filled.getCheckBox('Chapter 7').isChecked()).toBe(true);
  });

  it('no form counts as mapped until its map is built against the real PDF', () => {
    for (const id of Object.keys(OFFICIAL_FORM_REGISTRY)) {
      expect(isFormMapped(id)).toBe(OFFICIAL_FORM_REGISTRY[id]!.mappedEdition !== null);
    }
  });
});
