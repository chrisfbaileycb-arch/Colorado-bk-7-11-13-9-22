import type { DocumentType, FieldWrapper } from '../../types/master-case';

export type VerificationStatus = FieldWrapper<unknown>['status'];

export interface ExtractedFact {
  field_id: string;
  case_id: string;
  document_id: string;
  document_type: DocumentType;
  source_filename: string;
  source_page: number;
  raw_text: string;
  normalized_value: unknown;
  value_type: string;
  confidence_score: number;
  extraction_method: string;
  model_name: string;
  model_version: string;
  extracted_at: string;
  verification_status: VerificationStatus;
  mapped_destinations: string[];
}

export interface ExtractionResult<T = unknown> {
  document_type: DocumentType;
  extracted_data: T;
  confidence_score: number;
  validation_flags: string[];
  warnings: string[];
  facts: ExtractedFact[];
  source_filename: string;
}

export interface ExtractedTaxReturn {
  tax_year: number;
  filing_status?: 'SINGLE' | 'MARRIED_FILING_JOINTLY' | 'MARRIED_FILING_SEPARATELY' | 'HEAD_OF_HOUSEHOLD';
  primary_taxpayer_name: string;
  spouse_name?: string;
  w2_gross_wages_debtor_1: number;
  w2_gross_wages_debtor_2?: number;
  adjusted_gross_income?: number;
  total_tax?: number;
  employer_name_debtor_1: string;
  employer_name_debtor_2?: string;
}

export interface ExtractedPaystub {
  debtor_index?: 1 | 2;
  employee_name: string;
  employer_name: string;
  gross_pay_current: number;
  net_pay: number;
  pay_date: string;
}

export interface ExtractedBankStatement {
  institution_name: string;
  account_number_last4: string;
  ending_balance: number;
  statement_date: string;
}

export interface ExtractedCreditReportItem {
  claim_id: string;
  creditor_name: string;
  current_balance: number;
  is_secured: boolean;
}
