import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from 'pdf-lib';
import type { MasterCaseData } from '../../types/master-case';
import {
  mapMasterCaseToForm101Fields,
  mapMasterCaseToForm121Fields,
  mapForm106AB,
  mapForm106C,
  mapForm106D,
  mapForm106EF,
  mapForm106I,
  mapForm106J,
  mapForm106J2,
  mapForm122A1
} from '../mappers';

/**
 * Draft PDF generation.
 *
 * The official fillable court PDFs are NOT bundled with this app, so nothing here "stamps"
 * an official form. Each generator lays out the case data for one form on plain pages and
 * marks every page as an unofficial draft that must not be filed.
 */

export const DRAFT_WATERMARK = 'UNOFFICIAL DRAFT - NOT FOR FILING';

export interface DraftFormContent {
  formNumber: string;
  title: string;
  /** [label, value] pairs; a row with an empty label is rendered as a section heading. */
  rows: Array<[string, string]>;
  implemented: boolean;
}

const usd = (n: unknown) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const txt = (v: unknown) => (v === undefined || v === null || v === '' ? '[not entered]' : String(v));

function notImplemented(formNumber: string, title: string): DraftFormContent {
  return {
    formNumber,
    title,
    implemented: false,
    rows: [['Status', 'Draft output for this form is not implemented. No case data has been rendered.']]
  };
}

export function buildDraftFormContent(formId: string, data: MasterCaseData): DraftFormContent {
  const d1 = data.debtor_1;
  const caption: Array<[string, string]> = [
    ['Court', 'U.S. Bankruptcy Court, District of Colorado'],
    ['Debtor 1', txt([d1?.first_name?.value, d1?.middle_name?.value, d1?.last_name?.value].filter(Boolean).join(' '))],
    ['Chapter', txt(data.chapter)],
    ['Case No.', data.case_id ? String(data.case_id) : 'Not assigned (not filed)'],
    ['', '']
  ];
  const withCaption = (c: DraftFormContent): DraftFormContent => ({ ...c, rows: [...caption, ...c.rows] });

  switch (formId) {
    case 'form101': {
      const f = mapMasterCaseToForm101Fields(data);
      return withCaption({
        formNumber: 'Official Form 101',
        title: 'Voluntary Petition for Individuals Filing for Bankruptcy',
        implemented: true,
        rows: [
          ['Debtor 1 full name', txt(f.debtor1_full_name)],
          ['SSN (last 4)', f.debtor1_ssn_last4 ? `xxx-xx-${f.debtor1_ssn_last4}` : '[not entered]'],
          ['Street address', txt(f.debtor1_street_address)],
          ['City / State / ZIP', `${txt(f.debtor1_city)}, ${txt(f.debtor1_state)} ${txt(f.debtor1_zip_code)}`],
          ['Joint petition', f.has_joint_debtor ? 'Yes' : 'No'],
          ['Chapter requested', `Chapter ${f.chapter}`]
        ]
      });
    }
    case 'form121': {
      const f = mapMasterCaseToForm121Fields(data);
      const rows: Array<[string, string]> = [
        ['Notice', 'Restricted document (Fed. R. Bankr. P. 9037). Not placed on the public docket.'],
        ['Debtor 1', txt(f.debtor1_full_name)],
        ['Debtor 1 SSN/ITIN', txt(f.debtor1_ssn_full)]
      ];
      if (f.debtor2_ssn_full) rows.push(['Debtor 2', txt(f.debtor2_full_name)], ['Debtor 2 SSN/ITIN', f.debtor2_ssn_full]);
      return withCaption({ formNumber: 'Official Form 121', title: 'Your Statement About Your Social Security Numbers', implemented: true, rows });
    }
    case 'form106ab': {
      const ab = mapForm106AB(data);
      const rows: Array<[string, string]> = [['', 'Part 1: Real estate']];
      for (const r of data.schedule_ab?.real_property || []) rows.push([txt(r.address?.value), usd(r.current_value?.value)]);
      if (!(data.schedule_ab?.real_property || []).length) rows.push(['(none reported)', '']);
      rows.push(['', 'Parts 2-7: Personal property']);
      for (const p of data.schedule_ab?.personal_property || []) rows.push([`${txt(p.category?.value)}: ${txt(p.description?.value)}`, usd(p.current_value?.value)]);
      if (!(data.schedule_ab?.personal_property || []).length) rows.push(['(none reported)', '']);
      rows.push(['', 'Totals'], ['Real property', usd(ab.total_real_property)], ['Personal property', usd(ab.total_personal_property)], ['Total', usd(ab.total_property)]);
      return withCaption({ formNumber: 'Official Form 106A/B', title: 'Schedule A/B: Property', implemented: true, rows });
    }
    case 'form106c': {
      const c = mapForm106C(data);
      const rows: Array<[string, string]> = [];
      for (const e of data.schedule_c?.claimed_exemptions || []) rows.push([`${txt(e.description?.value)} (${txt(e.statute_citation?.value)})`, usd(e.claimed_amount?.value)]);
      if (!rows.length) rows.push(['(no exemptions claimed)', '']);
      rows.push(['', 'Totals'], [`Total claimed (${c.claimed_exemptions_count} items)`, usd(c.total_claimed_exemption_amount)]);
      return withCaption({ formNumber: 'Official Form 106C', title: 'Schedule C: The Property You Claim as Exempt', implemented: true, rows });
    }
    case 'form106d': {
      const d = mapForm106D(data);
      const rows: Array<[string, string]> = [];
      for (const s of data.schedule_d?.secured_claims || []) rows.push([`${txt(s.creditor_name?.value)} - ${txt(s.collateral_description?.value)}`, usd(s.total_claim_amount?.value)]);
      if (!rows.length) rows.push(['(no secured claims reported)', '']);
      rows.push(['', 'Totals'], [`Total secured claims (${d.secured_claims_count})`, usd(d.total_secured_claims_amount)]);
      return withCaption({ formNumber: 'Official Form 106D', title: 'Schedule D: Creditors Who Have Claims Secured by Property', implemented: true, rows });
    }
    case 'form106ef': {
      const ef = mapForm106EF(data);
      const rows: Array<[string, string]> = [['', 'Part 1: Priority unsecured claims']];
      for (const p of data.schedule_ef?.priority_claims || []) rows.push([txt(p.creditor_name?.value), usd(p.total_claim_amount?.value)]);
      rows.push(['', 'Part 2: Nonpriority unsecured claims']);
      for (const n of data.schedule_ef?.nonpriority_claims || []) rows.push([txt(n.creditor_name?.value), usd(n.total_claim_amount?.value)]);
      rows.push(['', 'Totals'], ['Priority', usd(ef.total_priority_claims)], ['Nonpriority', usd(ef.total_nonpriority_claims)], ['Total unsecured', usd(ef.total_unsecured_claims)]);
      return withCaption({ formNumber: 'Official Form 106E/F', title: 'Schedule E/F: Creditors Who Have Unsecured Claims', implemented: true, rows });
    }
    case 'form106g': {
      const rows: Array<[string, string]> = (data.schedule_g?.contracts || []).map(c => [txt(c.counterparty_name?.value), txt(c.description?.value)] as [string, string]);
      return withCaption({ formNumber: 'Official Form 106G', title: 'Schedule G: Executory Contracts and Unexpired Leases', implemented: true, rows: rows.length ? rows : [['(none reported)', '']] });
    }
    case 'form106h': {
      const rows: Array<[string, string]> = (data.schedule_h?.codebtors || []).map(c => [txt(c.codebtor_name?.value), txt(c.codebtor_address?.value)] as [string, string]);
      return withCaption({ formNumber: 'Official Form 106H', title: 'Schedule H: Your Codebtors', implemented: true, rows: rows.length ? rows : [['(none reported)', '']] });
    }
    case 'form106i': {
      const i = mapForm106I(data);
      return withCaption({
        formNumber: 'Official Form 106I',
        title: 'Schedule I: Your Income',
        implemented: true,
        rows: [
          ['Debtor 1 gross monthly wages', usd(i.debtor1_gross_wages)],
          ['Payroll deductions', usd(i.debtor1_payroll_deductions)],
          ['Net wages', usd(i.debtor1_net_wages)],
          ['Net business income', usd(i.business_income_net)],
          ['Total monthly net income', usd(i.total_combined_monthly_income)]
        ]
      });
    }
    case 'form106j': {
      const j = mapForm106J(data);
      return withCaption({
        formNumber: 'Official Form 106J',
        title: 'Schedule J: Your Expenses',
        implemented: true,
        rows: [
          ['Rent or home ownership', usd(j.rental_or_home_ownership_expense)],
          ['Utilities', usd(j.utilities_total)],
          ['Food and housekeeping', usd(j.food_housekeeping_supplies)],
          ['Childcare and education', usd(j.childcare_and_education)],
          ['Medical and dental', usd(j.medical_and_dental)],
          ['Transportation', usd(j.transportation)],
          ['Insurance', usd(j.insurance)],
          ['Total monthly expenses', usd(j.total_monthly_expenses)]
        ]
      });
    }
    case 'form106j2': {
      const j2 = mapForm106J2(data);
      return withCaption({
        formNumber: 'Official Form 106J-2',
        title: 'Schedule J-2: Expenses for Separate Household of Debtor 2',
        implemented: true,
        rows: [
          ['Rent or home ownership', usd(j2.rental_or_home_ownership_expense)],
          ['Utilities', usd(j2.utilities_total)],
          ['Total monthly expenses', usd(j2.total_debtor2_separate_expenses)]
        ]
      });
    }
    case 'form122a1': {
      const m = mapForm122A1(data);
      const rows: Array<[string, string]> = m.monthly_gross.map((v, idx) => [`Month ${idx + 1} gross income`, usd(v)] as [string, string]);
      rows.push(
        ['Current monthly income (6-mo avg)', usd(m.cmi_monthly)],
        ['Annualized CMI', usd(m.cmi_annualized)],
        [`Median, household of ${m.household_size} (app-configured; verify)`, usd(m.median_threshold)],
        ['Result', !m.months_reported ? 'CMI not entered - no conclusion drawn' : m.is_above_median ? 'Above configured median - Form 122A-2 required' : 'At or below configured median']
      );
      return withCaption({ formNumber: 'Official Form 122A-1', title: "Chapter 7 Statement of Your Current Monthly Income", implemented: true, rows });
    }
    case 'form107':
      return withCaption(notImplemented('Official Form 107', 'Statement of Financial Affairs'));
    case 'form108':
      return withCaption(notImplemented('Official Form 108', "Statement of Intention"));
    case 'form122a2':
      return withCaption(notImplemented('Official Form 122A-2', 'Chapter 7 Means Test Calculation'));
    default:
      return withCaption(notImplemented(formId.toUpperCase(), 'Unknown form'));
  }
}

// Standard 14 fonts use WinAnsi encoding; replace anything they cannot draw.
const WIN_ANSI_EXTRAS = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'.split(''));
function sanitize(text: string): string {
  return Array.from(text)
    .map(ch => {
      const code = ch.codePointAt(0) ?? 0;
      if (ch === '\n' || ch === '\t') return ' ';
      if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRAS.has(ch)) return ch;
      return '?';
    })
    .join('');
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = sanitize(text).split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export async function generateDraftFormPdf(formId: string, data: MasterCaseData): Promise<Uint8Array> {
  const content = buildDraftFormContent(formId, data);
  const doc = await PDFDocument.create();
  doc.setTitle(`${DRAFT_WATERMARK}: ${content.formNumber}`);
  doc.setSubject('Unofficial draft generated from case data. Not an official court form. Do not file.');
  doc.setProducer('Colorado BK petition prototype (draft generator)');
  doc.setCreationDate(new Date());

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const [W, H] = [612, 792];
  const margin = 50;
  const labelWidth = 220;
  const valueX = margin + labelWidth + 10;
  const valueWidth = W - margin - valueX;
  const size = 10;
  const lineH = 14;

  let page: PDFPage;
  let y = 0;
  const newPage = () => {
    page = doc.addPage([W, H]);
    page.drawText(DRAFT_WATERMARK, {
      x: 110, y: 250, size: 36, font: bold, color: rgb(0.85, 0.3, 0.2), opacity: 0.18, rotate: degrees(40)
    });
    page.drawText(DRAFT_WATERMARK, { x: margin, y: H - 30, size: 9, font: bold, color: rgb(0.7, 0.2, 0.1) });
    page.drawText(sanitize(`${content.formNumber} - ${content.title}`), { x: margin, y: H - 55, size: 13, font: bold });
    y = H - 80;
  };
  newPage();

  for (const [label, value] of content.rows) {
    if (!label) {
      if (!value) { y -= lineH / 2; continue; }
      if (y < margin + lineH * 2) newPage();
      y -= 4;
      page!.drawText(sanitize(value), { x: margin, y, size: 11, font: bold });
      y -= lineH + 2;
      continue;
    }
    const labelLines = wrap(label, font, size, labelWidth);
    const valueLines = wrap(value, bold, size, valueWidth);
    const rowLines = Math.max(labelLines.length, valueLines.length);
    if (y - rowLines * lineH < margin) newPage();
    labelLines.forEach((l, i) => page!.drawText(l, { x: margin, y: y - i * lineH, size, font }));
    valueLines.forEach((l, i) => page!.drawText(l, { x: valueX, y: y - i * lineH, size, font: bold }));
    y -= rowLines * lineH + 2;
  }

  const pages = doc.getPages();
  pages.forEach((p, i) => p.drawText(`Page ${i + 1} of ${pages.length}`, { x: W - margin - 60, y: 25, size: 8, font }));

  return doc.save();
}

// Per-form entry points kept for API compatibility.
export const generateForm101Pdf = (data: MasterCaseData) => generateDraftFormPdf('form101', data);
export const generateForm121Pdf = (data: MasterCaseData) => generateDraftFormPdf('form121', data);
export const generateForm106ABPdf = (data: MasterCaseData) => generateDraftFormPdf('form106ab', data);
export const generateForm106CPdf = (data: MasterCaseData) => generateDraftFormPdf('form106c', data);
export const generateForm106DPdf = (data: MasterCaseData) => generateDraftFormPdf('form106d', data);
export const generateForm106EFPdf = (data: MasterCaseData) => generateDraftFormPdf('form106ef', data);
export const generateForm106GPdf = (data: MasterCaseData) => generateDraftFormPdf('form106g', data);
export const generateForm106HPdf = (data: MasterCaseData) => generateDraftFormPdf('form106h', data);
export const generateForm106IPdf = (data: MasterCaseData) => generateDraftFormPdf('form106i', data);
export const generateForm106JPdf = (data: MasterCaseData) => generateDraftFormPdf('form106j', data);
export const generateForm106J2Pdf = (data: MasterCaseData) => generateDraftFormPdf('form106j2', data);
export const generateForm107Pdf = (data: MasterCaseData) => generateDraftFormPdf('form107', data);
export const generateForm108Pdf = (data: MasterCaseData) => generateDraftFormPdf('form108', data);
export const generateForm122A1Pdf = (data: MasterCaseData) => generateDraftFormPdf('form122a1', data);
export const generateForm122A2Pdf = (data: MasterCaseData) => generateDraftFormPdf('form122a2', data);
