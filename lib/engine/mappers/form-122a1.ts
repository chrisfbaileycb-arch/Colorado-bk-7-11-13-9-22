import type { MasterCaseData } from '../../types/master-case';
import { calculate6MonthCMI } from '../validators';

export function mapForm122A1(data: MasterCaseData) {
  const mt = data.means_test_122a || {};
  const months = [1, 2, 3, 4, 5, 6].map(i => Number(mt[`gross_wages_month_${i}`]?.value ?? 0));
  const householdSize = Number(mt.household_size?.value ?? (data.debtor_2 ? 2 : 1));
  const cmi = calculate6MonthCMI(months.map(v => ({ debtor_1_gross: v, debtor_2_gross: 0 })), householdSize);
  return {
    monthly_gross: months,
    months_reported: months.some(v => v > 0),
    household_size: householdSize,
    cmi_monthly: cmi.total_combined_cmi_monthly,
    cmi_annualized: cmi.total_combined_cmi_annualized,
    median_threshold: cmi.colorado_median_threshold,
    is_above_median: cmi.is_above_median
  };
}

export function mapForm122A2(data: MasterCaseData) {
  return { presumption: data.means_test_122a || {} };
}
