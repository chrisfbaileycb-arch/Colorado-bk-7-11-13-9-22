import type { ExtractionResult } from './types';
import { structuredFieldCompleteness } from './completeness';

/**
 * Maps an already-structured JSON object onto the tax-return shape. There is no OCR:
 * this does not read PDFs or images, and it never invents values for missing fields.
 */
export function parseTaxReturn(rawObj: any, filename: string = 'tax_return.json'): ExtractionResult<import('./types').ExtractedTaxReturn> {
  const src = rawObj && typeof rawObj === 'object' ? rawObj : {};
  const wages = src.w2_gross_wages_debtor_1 ?? src.w2_wages;
  const { score, missing } = structuredFieldCompleteness({
    primary_taxpayer_name: src.primary_taxpayer_name,
    w2_gross_wages_debtor_1: wages,
    tax_year: src.tax_year
  });

  return {
    document_type: 'TAX_RETURN',
    extracted_data: {
      primary_taxpayer_name: String(src.primary_taxpayer_name ?? ''),
      w2_gross_wages_debtor_1: Number(wages ?? 0),
      employer_name_debtor_1: String(src.employer_name_debtor_1 ?? ''),
      tax_year: Number(src.tax_year ?? 0)
    },
    confidence_score: score,
    validation_flags: [],
    warnings: missing.map(f => `Missing field: ${f}`),
    facts: [],
    source_filename: filename
  };
}
