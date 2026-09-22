import { describe, expect, it } from 'bun:test';
import { PluggableExtractionPipeline } from '../lib/engine/extraction/pipeline';
import { parseTaxReturn, parsePaystub, parseBankStatement, parseCreditReport } from '../lib/engine/extraction';

describe('extraction pipeline is honest about what it does', () => {
  const pipeline = new PluggableExtractionPipeline();

  it('non-JSON input (e.g. PDF bytes) yields no data instead of a fabricated debtor', () => {
    const res = pipeline.processDocument('TAX_RETURN', '%PDF-1.4 binary...', 'return.pdf');
    expect(res.facts).toHaveLength(0);
    expect(res.extracted_data).toBeNull();
    expect(JSON.stringify(res)).not.toContain('Jane');
  });

  it('structured JSON maps to facts labeled as non-AI and left unverified', () => {
    const res = pipeline.processDocument('TAX_RETURN', JSON.stringify({ primary_taxpayer_name: 'A B', w2_gross_wages_debtor_1: 50000, tax_year: 2025 }), 'r.json');
    expect(res.facts).toHaveLength(1);
    const fact = res.facts[0]!;
    expect(fact.extraction_method).toBe('STRUCTURED_JSON_FIELD_MAP');
    expect(fact.model_name).not.toContain('VoxelLex');
    expect(fact.verification_status).toBe('raw_extracted');
    expect(fact.normalized_value).toBe(50000);
  });

  it('parsers never invent values for missing fields', () => {
    expect(parseTaxReturn({}).extracted_data.w2_gross_wages_debtor_1).toBe(0);
    expect(parseTaxReturn({}).confidence_score).toBe(0);
    expect(parsePaystub({}).extracted_data.employee_name).toBe('');
    expect(parseBankStatement({}).extracted_data.ending_balance).toBe(0);
    expect(parseCreditReport([]).extracted_data).toHaveLength(0);
  });
});
