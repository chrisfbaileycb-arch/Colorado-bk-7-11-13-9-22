import type { ExtractedFact, ExtractionResult } from './types';
import type { DocumentType } from '../../types/master-case';
import { parseTaxReturn } from './tax-return-parser';
import { parsePaystub } from './paystub-parser';
import { parseBankStatement } from './bank-statement-parser';
import { parseCreditReport } from './credit-report-parser';

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/** There is no OCR. Only already-structured JSON is accepted; anything else yields no data. */
function parseStructuredInput(content: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function nothingExtracted(document_type: DocumentType, filename: string): ExtractionResult {
  return {
    document_type,
    extracted_data: null,
    confidence_score: 0,
    validation_flags: ['UNSUPPORTED_INPUT'],
    warnings: ['No OCR is available: only structured JSON input can be read. Nothing was extracted.'],
    facts: [],
    source_filename: filename
  };
}

function structuredFact(f: {
  field_id: string;
  document_type: DocumentType;
  filename: string;
  raw_text: string;
  value: number;
  completeness: number;
  mapped_destinations: string[];
}): ExtractedFact {
  return {
    field_id: f.field_id,
    case_id: 'case_default',
    document_id: `doc_${f.filename}`,
    document_type: f.document_type,
    source_filename: f.filename,
    source_page: 1,
    raw_text: f.raw_text,
    normalized_value: f.value,
    value_type: 'currency',
    confidence_score: f.completeness,
    extraction_method: 'STRUCTURED_JSON_FIELD_MAP',
    model_name: 'none (deterministic JSON field mapping, no AI/OCR)',
    model_version: 'n/a',
    extracted_at: new Date().toISOString(),
    // A person must verify every extracted fact; nothing is auto-verified.
    verification_status: 'raw_extracted',
    mapped_destinations: f.mapped_destinations
  };
}

export interface DocumentAdapter {
  document_type: DocumentType;
  supportsExtension(filename: string): boolean;
  extract(rawTextContent: string, filename: string): ExtractionResult;
}

export class PluggableExtractionPipeline {
  private adapters: Map<DocumentType, DocumentAdapter> = new Map();

  constructor() {
    this.registerDefaultAdapters();
  }

  public registerAdapter(adapter: DocumentAdapter) {
    this.adapters.set(adapter.document_type, adapter);
  }

  private registerDefaultAdapters() {
    this.registerAdapter({
      document_type: 'TAX_RETURN',
      supportsExtension: (f) => /\.json$/i.test(f),
      extract: (content, filename) => {
        const rawObj = parseStructuredInput(content);
        if (!rawObj) return nothingExtracted('TAX_RETURN', filename);
        const res = parseTaxReturn(rawObj, filename);
        const facts: ExtractedFact[] = res.warnings.length === 0 ? [structuredFact({
          field_id: `fact_tax_wages_${Date.now()}`,
          document_type: 'TAX_RETURN',
          filename,
          raw_text: `w2_gross_wages_debtor_1: ${res.extracted_data.w2_gross_wages_debtor_1}`,
          value: fromCents(toCents(res.extracted_data.w2_gross_wages_debtor_1)),
          completeness: res.confidence_score,
          mapped_destinations: ['schedule_i.debtor_1_gross_wages', 'form_1040.line1a']
        })] : [];
        return { ...res, facts, source_filename: filename };
      }
    });

    this.registerAdapter({
      document_type: 'PAYSTUB',
      supportsExtension: (f) => /\.json$/i.test(f),
      extract: (content, filename) => {
        const rawObj = parseStructuredInput(content);
        if (!rawObj) return nothingExtracted('PAYSTUB', filename);
        const res = parsePaystub(rawObj, filename);
        const facts: ExtractedFact[] = res.warnings.length === 0 ? [structuredFact({
          field_id: `fact_stub_gross_${Date.now()}`,
          document_type: 'PAYSTUB',
          filename,
          raw_text: `gross_pay_current: ${res.extracted_data.gross_pay_current}`,
          value: fromCents(toCents(res.extracted_data.gross_pay_current)),
          completeness: res.confidence_score,
          mapped_destinations: ['schedule_i.monthly_gross']
        })] : [];
        return { ...res, facts, source_filename: filename };
      }
    });
  }

  public processDocument(documentType: DocumentType, fileContent: string, filename: string): ExtractionResult {
    const adapter = this.adapters.get(documentType);
    if (!adapter) throw new Error(`No extraction adapter registered for document type: ${documentType}`);
    return adapter.extract(fileContent, filename);
  }
}

export const globalExtractionPipeline = new PluggableExtractionPipeline();
