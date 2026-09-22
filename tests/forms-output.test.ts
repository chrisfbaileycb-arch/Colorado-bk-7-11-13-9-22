import { describe, expect, it } from 'bun:test';
import { PDFDocument } from 'pdf-lib';
import { createSampleMasterCaseData, fw } from './helpers/sample-case';
import { renderCourtFormHtml } from '../lib/engine/pdf/court-form-renderer';
import { buildDraftFormContent, generateDraftFormPdf, generateForm101Pdf, DRAFT_WATERMARK } from '../lib/engine/pdf/pdf-stamper';
import { mapMasterCaseToForm101Fields, mapForm106J, mapForm122A1 } from '../lib/engine/mappers';
import { DualStateManager } from '../lib/engine/copilot/dual-state-manager';

const FORMS = ['form101', 'form121', 'form106ab', 'form106c', 'form106d', 'form106ef', 'form106g', 'form106h', 'form106i', 'form106j', 'form106j2', 'form107', 'form108', 'form122a1', 'form122a2'];

describe('Form 101 mapper / renderer seam', () => {
  it('renderer uses the keys the mapper returns (no "undefined" in any form)', () => {
    const data = createSampleMasterCaseData();
    for (const formId of FORMS) {
      const html = renderCourtFormHtml(formId, data);
      expect(html).not.toContain('undefined');
      expect(html).not.toContain('NaN');
    }
  });

  it('intake values reach the Form 101 preview', () => {
    const data = createSampleMasterCaseData();
    data.debtor_1.first_name = fw('first', 'Rosa');
    data.debtor_1.last_name = fw('last', 'Quintana');
    data.debtor_1.ssn_full = fw('ssn', '123-45-6789');
    const f = mapMasterCaseToForm101Fields(data);
    expect(f.debtor1_ssn_last4).toBe('6789');
    const html = renderCourtFormHtml('form101', data);
    expect(html).toContain('Rosa Test Quintana');
    expect(html).toContain('***-**-6789');
  });

  it('preview carries no fabricated judge, case number or "verified" stamp', () => {
    const data = createSampleMasterCaseData();
    data.case_id = '';
    const html = renderCourtFormHtml('form101', data);
    expect(html).not.toContain('Hon.');
    expect(html).not.toContain('VERIFIED');
    expect(html).toContain('Not assigned (not filed)');
    expect(html).toContain('NOT FOR FILING');
  });
});

describe('Schedule J / 122A-1 mappers', () => {
  it('reads top-level expense keys written by the intake UI', () => {
    const data = createSampleMasterCaseData();
    data.schedule_j = { rent_or_mortgage: fw('j.rent', 1234), utilities: fw('j.util', 100), total_monthly_expenses: fw('j.tot', 1334) };
    const j = mapForm106J(data);
    expect(j.rental_or_home_ownership_expense).toBe(1234);
    expect(renderCourtFormHtml('form106j', data)).toContain('$1,234.00');
  });

  it('does not invent expenses when none are entered', () => {
    const data = createSampleMasterCaseData();
    data.schedule_j = {};
    expect(mapForm106J(data).total_monthly_expenses).toBe(0);
  });

  it('122A-1 uses the tested CMI engine and draws no conclusion without income data', () => {
    const data = createSampleMasterCaseData();
    data.means_test_122a = {};
    const empty = mapForm122A1(data);
    expect(empty.months_reported).toBe(false);
    expect(renderCourtFormHtml('form122a1', data)).toContain('CMI NOT ENTERED');

    data.means_test_122a = Object.fromEntries([1, 2, 3, 4, 5, 6].map(i => [`gross_wages_month_${i}`, fw(`m${i}`, 4000)]));
    const m = mapForm122A1(data);
    expect(m.cmi_monthly).toBe(4000);
    expect(m.cmi_annualized).toBe(48000);
    expect(m.median_threshold).toBe(72450);
    expect(m.is_above_median).toBe(false);
  });
});

describe('DualStateManager.syncFromIntake', () => {
  it('pushes intake edits into the draft and keeps pending copilot diffs', () => {
    const mgr = new DualStateManager(createSampleMasterCaseData());
    mgr.stageFieldUpdate('ScheduleI', 'total_monthly_net_income', 'Net', 9999);
    const intake = createSampleMasterCaseData();
    intake.debtor_1.first_name = fw('first', 'Updated');
    mgr.syncFromIntake(intake);
    expect(mgr.getDraftFiling().debtor_1.first_name.value).toBe('Updated');
    expect(mgr.getDraftFiling().schedule_i.total_monthly_net_income.value).toBe(9999);
  });
});

describe('Draft PDF generator', () => {
  it('produces a real, non-blank PDF carrying the case data and a draft watermark', async () => {
    const data = createSampleMasterCaseData();
    data.debtor_1.first_name = fw('first', 'Rosa');
    const content = buildDraftFormContent('form101', data);
    expect(content.rows.some(([, v]) => v.includes('Rosa'))).toBe(true);

    const bytes = await generateForm101Pdf(data);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(doc.getTitle()).toContain(DRAFT_WATERMARK);
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it('output depends on the input data', async () => {
    const a = createSampleMasterCaseData();
    const b = createSampleMasterCaseData();
    b.debtor_1.last_name = fw('last', 'Somebody-Else');
    const [pa, pb] = await Promise.all([generateDraftFormPdf('form101', a), generateDraftFormPdf('form101', b)]);
    const strip = (u: Uint8Array) => Buffer.from(u).toString('latin1').replace(/\/(CreationDate|ModDate) \([^)]*\)/g, '');
    expect(strip(pa)).not.toBe(strip(pb));
  });

  it('every form generates a loadable PDF; unimplemented forms say so', async () => {
    const data = createSampleMasterCaseData();
    for (const formId of FORMS) {
      const doc = await PDFDocument.load(await generateDraftFormPdf(formId, data));
      expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    }
    expect(buildDraftFormContent('form107', data).implemented).toBe(false);
  });
});
