import type { MasterCaseData } from '../../types/master-case';

// The intake UI and DualStateManager write expense lines at the top level of schedule_j
// (e.g. schedule_j.rent_or_mortgage); older fixtures nest them under schedule_j.expenses.
// Read both so neither path silently renders as $0.
function jLine(data: MasterCaseData, topKey: string, nestedKey: string): number {
  const j = data.schedule_j || {};
  return Number(j[topKey]?.value ?? j.expenses?.[nestedKey]?.value ?? 0);
}

export function mapForm106J(data: MasterCaseData) {
  const rent = jLine(data, 'rent_or_mortgage', 'rental_mortgage_payment');
  const util = jLine(data, 'utilities', 'utilities');
  const food = jLine(data, 'food_and_housekeeping', 'food_and_housekeeping');
  const childcare = jLine(data, 'childcare_and_children', 'childcare_and_children');
  const medical = jLine(data, 'medical_and_dental', 'medical_and_dental');
  const transportation = jLine(data, 'transportation_gas', 'transportation_gas');
  const insurance = jLine(data, 'insurance', 'insurance');
  const itemized = rent + util + food + childcare + medical + transportation + insurance;
  const total = data.schedule_j?.total_monthly_expenses?.value ?? itemized;

  return {
    rental_or_home_ownership_expense: rent,
    utilities_total: util,
    food_housekeeping_supplies: food,
    childcare_and_education: childcare,
    medical_and_dental: medical,
    transportation: transportation,
    insurance: insurance,
    total_monthly_expenses: total
  };
}
