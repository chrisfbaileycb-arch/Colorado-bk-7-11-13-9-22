import type { MasterCaseData } from '../../types/master-case';

export function mapForm106J2(data: MasterCaseData) {
  if (!data.schedule_j2 || data.schedule_j2.has_separate_household?.value === false) {
    return { total_debtor2_separate_expenses: 0, rental_or_home_ownership_expense: 0, utilities_total: 0 };
  }
  const rent = data.schedule_j2.expenses?.rental_mortgage_payment?.value ?? 0;
  const util = data.schedule_j2.expenses?.utilities?.value ?? 0;
  const total = data.schedule_j2.total_monthly_expenses?.value ?? 0;
  return {
    total_debtor2_separate_expenses: total,
    rental_or_home_ownership_expense: rent,
    utilities_total: util
  };
}
