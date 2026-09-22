export interface ExemptionStatuteRule {
  statute_citation: string;
  category: string;
  description: string;
  individual_cap: number | 'UNLIMITED' | 'PERCENTAGE';
  joint_cap_multiplier: number;
  special_caps?: {
    elderly_or_disabled?: number;
    head_of_household?: number;
  };
  authoritative_source: string;
  citation_url: string;
  effective_date: string;
  expiration_date?: string;
  version: string;
  last_verified_date: string;
  verified_by: string;
}

export interface DistrictCourtRequirement {
  district_name: string;
  local_rule_citation: string;
  paystub_lookback_days: number;
  credit_counseling_required: boolean;
  local_form_requirements: string[];
  creditor_matrix_format: {
    font_family: string;
    font_size_pt: number;
    max_lines_per_creditor: number;
    require_zip_plus_four: boolean;
  };
}

export interface JurisdictionPack {
  jurisdiction_code: string;
  state_name: string;
  exemption_scheme: 'STATE_OPT_OUT' | 'FEDERAL_OR_STATE';
  statutory_rules: Record<string, ExemptionStatuteRule>;
  district_requirements: DistrictCourtRequirement;
  effective_date: string;
  version: string;
}
