import type { ExtractionResult } from './types';
import { structuredFieldCompleteness } from './completeness';

/** Structured-JSON field mapper for bank statements. No OCR; missing values stay empty. */
export function parseBankStatement(rawObj: any, filename: string = 'bank_statement.json'): ExtractionResult<import('./types').ExtractedBankStatement> {
  const src = rawObj && typeof rawObj === 'object' ? rawObj : {};
  const balance = src.ending_balance ?? src.balance;
  const { score, missing } = structuredFieldCompleteness({
    institution_name: src.institution_name,
    ending_balance: balance,
    statement_date: src.statement_date
  });

  return {
    document_type: 'BANK_STATEMENT',
    extracted_data: {
      institution_name: String(src.institution_name ?? ''),
      account_number_last4: String(src.account_number_last4 ?? ''),
      ending_balance: Number(balance ?? 0),
      statement_date: String(src.statement_date ?? '')
    },
    confidence_score: score,
    validation_flags: [],
    warnings: missing.map(f => `Missing field: ${f}`),
    facts: [],
    source_filename: filename
  };
}
