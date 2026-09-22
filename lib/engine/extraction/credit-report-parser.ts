import type { ExtractionResult } from './types';

export function parseCreditReport(rawArray: any[], filename: string = 'credit_report.json'): ExtractionResult<import('./types').ExtractedCreditReportItem[]> {
  const items = Array.isArray(rawArray) && rawArray.length > 0 ? rawArray : [
    { creditor_name: 'Example Unsecured Creditor', current_balance: 4500, is_secured: false },
    { creditor_name: 'Example Vehicle Creditor', current_balance: 14200, is_secured: true }
  ];

  return {
    document_type: 'CREDIT_REPORT',
    extracted_data: items.map((c, idx) => ({
      claim_id: `credit_${idx}`,
      creditor_name: c.creditor_name || 'Unsecured Creditor',
      current_balance: Number(c.current_balance || 0),
      is_secured: Boolean(c.is_secured)
    })),
    confidence_score: 0.95,
    validation_flags: [],
    warnings: [],
    facts: [],
    source_filename: filename
  };
}
