import type { ExtractionResult } from './types';
import { structuredFieldCompleteness } from './completeness';

/** Structured-JSON field mapper for paystubs. No OCR; missing values stay empty. */
export function parsePaystub(rawObj: any, filename: string = 'paystub.json'): ExtractionResult<import('./types').ExtractedPaystub> {
  const src = rawObj && typeof rawObj === 'object' ? rawObj : {};
  const gross = src.gross_pay_current ?? src.gross;
  const net = src.net_pay ?? src.net;
  const { score, missing } = structuredFieldCompleteness({
    employee_name: src.employee_name,
    gross_pay_current: gross,
    net_pay: net,
    pay_date: src.pay_date
  });

  return {
    document_type: 'PAYSTUB',
    extracted_data: {
      employee_name: String(src.employee_name ?? ''),
      employer_name: String(src.employer_name ?? ''),
      gross_pay_current: Number(gross ?? 0),
      net_pay: Number(net ?? 0),
      pay_date: String(src.pay_date ?? '')
    },
    confidence_score: score,
    validation_flags: [],
    warnings: missing.map(f => `Missing field: ${f}`),
    facts: [],
    source_filename: filename
  };
}
