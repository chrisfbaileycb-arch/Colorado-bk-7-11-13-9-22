import type { ExtractionResult } from './types';

/** Structured-JSON field mapper for credit report tradelines. No OCR; no placeholder creditors. */
export function parseCreditReport(rawArray: any[], filename: string = 'credit_report.json'): ExtractionResult<import('./types').ExtractedCreditReportItem[]> {
  const items = Array.isArray(rawArray) ? rawArray : [];
  const complete = items.filter(c => c?.creditor_name && c?.current_balance !== undefined).length;

  return {
    document_type: 'CREDIT_REPORT',
    extracted_data: items.map((c, idx) => ({
      claim_id: `credit_${idx}`,
      creditor_name: String(c?.creditor_name ?? ''),
      current_balance: Number(c?.current_balance ?? 0),
      is_secured: Boolean(c?.is_secured)
    })),
    confidence_score: items.length ? complete / items.length : 0,
    validation_flags: [],
    warnings: items.length ? [] : ['No tradelines supplied.'],
    facts: [],
    source_filename: filename
  };
}
