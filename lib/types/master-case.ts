export type DocumentType = 
  | 'TAX_RETURN' 
  | 'PAYSTUB' 
  | 'BANK_STATEMENT' 
  | 'CREDIT_REPORT' 
  | 'MORTGAGE_STATEMENT'
  | 'VEHICLE_LOAN'
  | 'RETIREMENT_STATEMENT'
  | 'PROPERTY_VALUATION';

export interface FieldSource {
  type: 'ocr_extraction' | 'manual_entry' | 'attorney_override' | 'imported_data' | 'calculated';
  document_id?: string;
  source_filename?: string;
  confidence_score?: number;
  calculated_by?: string;
}

export interface FieldWrapper<T> {
  field_id: string;
  value: T;
  source: FieldSource;
  status: 'raw_extracted' | 'user_verified' | 'attorney_approved' | 'discrepancy_flagged';
  attorney_notes?: string;
  mapped_destinations: string[];
}

export interface DebtorInformation {
  first_name: FieldWrapper<string>;
  middle_name?: FieldWrapper<string>;
  last_name: FieldWrapper<string>;
  ssn_full: FieldWrapper<string>;
  phone_day?: FieldWrapper<string>;
  street_address: FieldWrapper<string>;
  city: FieldWrapper<string>;
  state: FieldWrapper<string>;
  zip_code: FieldWrapper<string>;
}

export interface RealPropertyItem {
  id: string;
  address: FieldWrapper<string>;
  nature_of_interest: FieldWrapper<'SINGLE_FAMILY' | 'CONDO' | 'MULTI_FAMILY' | 'LAND' | 'COMMERCIAL'>;
  ownership_type: FieldWrapper<'FEE_SIMPLE' | 'JOINT_TENANCY' | 'TENANCY_IN_COMMON'>;
  current_value: FieldWrapper<number>;
  total_liens: FieldWrapper<number>;
}

export interface PersonalPropertyItem {
  id: string;
  category: FieldWrapper<'VEHICLE' | 'HOUSEHOLD_GOODS' | 'FINANCIAL_ACCOUNT' | 'RETIREMENT_ACCOUNT' | 'BUSINESS_EQUIPMENT' | 'OTHER'>;
  line_number: FieldWrapper<string>;
  description: FieldWrapper<string>;
  current_value: FieldWrapper<number>;
}

export interface ScheduleABData {
  real_property: RealPropertyItem[];
  personal_property: PersonalPropertyItem[];
  total_real_property_value: FieldWrapper<number>;
  total_personal_property_value: FieldWrapper<number>;
  total_property_value: FieldWrapper<number>;
}

export interface ClaimedExemptionItem {
  id: string;
  property_ref_id: FieldWrapper<string>;
  statute_citation: FieldWrapper<string>;
  description: FieldWrapper<string>;
  claimed_amount: FieldWrapper<number>;
}

export interface SecuredClaimItem {
  id: string;
  creditor_name: FieldWrapper<string>;
  mailing_address: FieldWrapper<string>;
  account_number: FieldWrapper<string>;
  collateral_property_ref_id: FieldWrapper<string>;
  collateral_description: FieldWrapper<string>;
  collateral_value: FieldWrapper<number>;
  total_claim_amount: FieldWrapper<number>;
  secured_amount: FieldWrapper<number>;
  unsecured_amount: FieldWrapper<number>;
}

export interface UnsecuredClaimItem {
  id: string;
  claim_type: 'PRIORITY' | 'NON_PRIORITY';
  creditor_name: FieldWrapper<string>;
  mailing_address: FieldWrapper<string>;
  account_number: FieldWrapper<string>;
  date_incurred: FieldWrapper<string>;
  description: FieldWrapper<string>;
  total_claim_amount: FieldWrapper<number>;
  priority_amount: FieldWrapper<number>;
  is_contingent: FieldWrapper<boolean>;
  is_unliquidated: FieldWrapper<boolean>;
  is_disputed: FieldWrapper<boolean>;
  has_codebtor: FieldWrapper<boolean>;
}

export interface ExecutoryContractItem {
  id: string;
  counterparty_name: FieldWrapper<string>;
  counterparty_address: FieldWrapper<string>;
  description: FieldWrapper<string>;
  expiration_date: FieldWrapper<string>;
  intention: FieldWrapper<'ASSUME' | 'REJECT'>;
}

export interface CodebtorItem {
  id: string;
  codebtor_name: FieldWrapper<string>;
  codebtor_address: FieldWrapper<string>;
  associated_claim_ids: FieldWrapper<string[]>;
}

export interface ScheduleJ2Data {
  has_separate_household: FieldWrapper<boolean>;
  expenses?: any;
  total_monthly_expenses: FieldWrapper<number>;
}

export interface MasterCaseData {
  case_id: string;
  petition_date: string;
  chapter: '7' | '11' | '13';
  jurisdiction: string;
  debtor_1: DebtorInformation;
  debtor_2?: DebtorInformation;
  schedule_ab: ScheduleABData;
  schedule_c: { claimed_exemptions: ClaimedExemptionItem[] };
  schedule_d: { secured_claims: SecuredClaimItem[] };
  schedule_ef: { priority_claims: UnsecuredClaimItem[]; nonpriority_claims: UnsecuredClaimItem[] };
  schedule_g: { contracts: ExecutoryContractItem[] };
  schedule_h: { codebtors: CodebtorItem[] };
  schedule_i: any;
  schedule_j: any;
  schedule_j2?: ScheduleJ2Data;
  sofa_form_107?: any;
  form_108?: any;
  means_test_122a?: any;
}
