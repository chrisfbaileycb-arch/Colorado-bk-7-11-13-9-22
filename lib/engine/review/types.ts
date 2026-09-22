import type { MasterCaseData } from '../../types/master-case';

export interface FieldOverride {
  field_id: string;
  original_value: any;
  overridden_value: any;
  attorney_reason: string;
  attorney_name: string;
  bar_number: string;
  timestamp: string;
}

export interface AttorneySignoff {
  attorney_name: string;
  bar_number: string;
  firm_name: string;
  ecf_login_id: string;
  signed_at: string;
  declaration_accepted: boolean;
}

export interface PetitionReviewSummary {
  total_fields: number;
  raw_extracted_count: number;
  user_verified_count: number;
  attorney_approved_count: number;
  flagged_count: number;
  readiness_percentage: number;
  active_overrides_count: number;
  hard_audit_critical_flags_count: number;
  can_execute_signoff: boolean;
  signoff_details?: AttorneySignoff;
}
