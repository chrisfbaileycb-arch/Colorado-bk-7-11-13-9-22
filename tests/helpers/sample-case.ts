import type { DebtorInformation, FieldWrapper, MasterCaseData } from '../../lib/types/master-case';

export function fw<T>(field_id: string, value: T): FieldWrapper<T> {
  return {
    field_id,
    value,
    source: { type: 'manual_entry', calculated_by: 'synthetic test fixture' },
    status: 'user_verified',
    attorney_notes: '',
    mapped_destinations: []
  };
}

export function createSampleMasterCaseData(): MasterCaseData {
  const debtor: DebtorInformation = {
    first_name: fw('first', 'Example'),
    middle_name: fw('middle', 'Test'),
    last_name: fw('last', 'Debtor'),
    ssn_full: fw('ssn', '000-00-0000'),
    phone_day: fw('phone', ''),
    street_address: fw('street', '100 Example Street'),
    city: fw('city', 'Example City'),
    state: fw('state', 'CO'),
    zip_code: fw('zip', '00000')
  };

  return {
    case_id: 'SYNTHETIC-CASE-001',
    petition_date: '2026-08-01',
    chapter: '7',
    jurisdiction: 'CO',
    debtor_1: debtor,
    schedule_ab: {
      real_property: [],
      personal_property: [],
      total_real_property_value: fw('ab.total_real', 0),
      total_personal_property_value: fw('ab.total_personal', 0),
      total_property_value: fw('ab.total', 0)
    },
    schedule_c: { claimed_exemptions: [] },
    schedule_d: { secured_claims: [] },
    schedule_ef: { priority_claims: [], nonpriority_claims: [] },
    schedule_g: { contracts: [] },
    schedule_h: { codebtors: [] },
    schedule_i: {
      debtor_1_gross_wages: fw('i.d1_gross', 5200),
      debtor_1_payroll_deductions: {
        taxes_and_social_security: fw('i.tax', 850),
        mandatory_contributions: fw('i.mandatory', 0),
        voluntary_401k: fw('i.401k', 150),
        insurance: fw('i.insurance', 200),
        union_dues: fw('i.union', 0),
        garnishments: fw('i.garnishments', 0),
        other_deductions: fw('i.other_deductions', 0)
      },
      other_monthly_income: { business_net_income: fw('i.business', 500) },
      total_monthly_net_income: fw('i.net_total', 4500)
    },
    schedule_j: {
      expenses: {
        rental_mortgage_payment: fw('j.housing', 1500),
        utilities: fw('j.utilities', 300),
        food_and_housekeeping: fw('j.food', 600)
      },
      total_monthly_expenses: fw('j.total', 2400)
    },
    schedule_j2: {
      has_separate_household: fw('j2.separate', false),
      total_monthly_expenses: fw('j2.total', 0)
    },
    sofa_form_107: { insider_payments_1_year: fw('sofa.insiders', []) },
    form_108: { secured_asset_intentions: [] },
    means_test_122a: { paystubs_6_months: [{}] }
  };
}
