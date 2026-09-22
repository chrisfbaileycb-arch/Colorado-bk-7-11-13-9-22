import type { JurisdictionPack } from './types';

export const ColoradoJurisdictionPack: JurisdictionPack = {
  jurisdiction_code: 'CO',
  state_name: 'Colorado',
  exemption_scheme: 'STATE_OPT_OUT',
  effective_date: '2026-01-01',
  version: '2026.1.0',
  district_requirements: {
    district_name: 'United States Bankruptcy Court for the District of Colorado',
    local_rule_citation: 'L.B.F. 1007-6.1 / L.B.F. 3015-1.1',
    paystub_lookback_days: 60,
    credit_counseling_required: true,
    local_form_requirements: ['L.B.F. 1007-6.1 Paystub Cover Sheet', 'L.B.F. 2084-1 Plan'],
    creditor_matrix_format: {
      font_family: 'Courier',
      font_size_pt: 10,
      max_lines_per_creditor: 5,
      require_zip_plus_four: false
    }
  },
  statutory_rules: {
    HOMESTEAD: {
      statute_citation: 'C.R.S. § 38-41-201',
      category: 'Real Estate',
      description: 'Homestead Exemption in Principal Residence',
      individual_cap: 250000,
      joint_cap_multiplier: 1,
      special_caps: {
        elderly_or_disabled: 350000
      },
      authoritative_source: 'Colorado Revised Statutes § 38-41-201 (2026 Legislative Inflation Adjustment)',
      citation_url: 'https://leg.colorado.gov/statutes/crs38-41-201',
      effective_date: '2026-01-01',
      version: '2026.1',
      last_verified_date: 'UNVERIFIED',
      verified_by: 'ATTORNEY VALIDATION REQUIRED BEFORE RELEASE'
    },
    VEHICLE: {
      statute_citation: 'C.R.S. § 13-54-102(1)(j)(I)',
      category: 'Motor Vehicles',
      description: 'Motor Vehicles Exemption',
      individual_cap: 15000,
      joint_cap_multiplier: 2,
      special_caps: {
        elderly_or_disabled: 25000
      },
      authoritative_source: 'Colorado Revised Statutes § 13-54-102(1)(j)(I)',
      citation_url: 'https://leg.colorado.gov/statutes/crs13-54-102',
      effective_date: '2026-01-01',
      version: '2026.1',
      last_verified_date: 'UNVERIFIED',
      verified_by: 'ATTORNEY VALIDATION REQUIRED BEFORE RELEASE'
    },
    HOUSEHOLD_GOODS: {
      statute_citation: 'C.R.S. § 13-54-102(1)(e)',
      category: 'Household Goods',
      description: 'Household Goods, Furnishings & Appliances',
      individual_cap: 6000,
      joint_cap_multiplier: 2,
      authoritative_source: 'Colorado Revised Statutes § 13-54-102(1)(e)',
      citation_url: 'https://leg.colorado.gov/statutes/crs13-54-102',
      effective_date: '2026-01-01',
      version: '2026.1',
      last_verified_date: 'UNVERIFIED',
      verified_by: 'ATTORNEY VALIDATION REQUIRED BEFORE RELEASE'
    },
    TOOLS_OF_TRADE: {
      statute_citation: 'C.R.S. § 13-54-102(1)(i)',
      category: 'Tools of Trade',
      description: 'Stock in Trade, Implements, Professional Books & Tools',
      individual_cap: 60000,
      joint_cap_multiplier: 2,
      authoritative_source: 'Colorado Revised Statutes § 13-54-102(1)(i)',
      citation_url: 'https://leg.colorado.gov/statutes/crs13-54-102',
      effective_date: '2026-01-01',
      version: '2026.1',
      last_verified_date: 'UNVERIFIED',
      verified_by: 'ATTORNEY VALIDATION REQUIRED BEFORE RELEASE'
    },
    RETIREMENT: {
      statute_citation: 'C.R.S. § 13-54-102(1)(s) & 11 U.S.C. § 522(n)',
      category: 'Retirement Accounts',
      description: 'ERISA Qualified Pensions, 401(k), IRA & Annuities',
      individual_cap: 'UNLIMITED',
      joint_cap_multiplier: 1,
      authoritative_source: 'C.R.S. § 13-54-102(1)(s)',
      citation_url: 'https://leg.colorado.gov/statutes/crs13-54-102',
      effective_date: '2026-01-01',
      version: '2026.1',
      last_verified_date: 'UNVERIFIED',
      verified_by: 'ATTORNEY VALIDATION REQUIRED BEFORE RELEASE'
    }
  }
};
