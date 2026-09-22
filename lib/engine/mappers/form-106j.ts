import type { MasterCaseData } from '../../types/master-case';

export function mapForm106J(data: MasterCaseData) {
  const rent = data.schedule_j?.expenses?.rental_mortgage_payment?.value ?? 1850;
  const util = data.schedule_j?.expenses?.utilities?.value ?? 280;
  const food = data.schedule_j?.expenses?.food_and_housekeeping?.value ?? 650;
  const total = data.schedule_j?.total_monthly_expenses?.value ?? (rent + util + food);

  return {
    rental_or_home_ownership_expense: rent,
    utilities_electricity_gas: Number((util * 0.6).toFixed(2)),
    utilities_water_sewer: Number((util * 0.2).toFixed(2)),
    utilities_telephone_internet: Number((util * 0.2).toFixed(2)),
    food_housekeeping_supplies: food,
    total_monthly_expenses: total
  };
}
