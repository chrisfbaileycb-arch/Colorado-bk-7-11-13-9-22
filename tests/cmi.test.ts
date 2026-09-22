import { expect, test, describe } from "bun:test";
import { 
  calculate6MonthCMI, 
  getColoradoMedianIncome,
  COLORADO_MEDIAN_INCOME_2026
} from "../lib/index";

describe("6-Month Current Monthly Income (CMI) Engine", () => {
  test("calculates correct 6-month average CMI for single debtor below median", () => {
    const incomeHistory = [
      { year: 2026, month: 1, debtor_1_gross: 4000, debtor_2_gross: 0 },
      { year: 2026, month: 2, debtor_1_gross: 4000, debtor_2_gross: 0 },
      { year: 2026, month: 3, debtor_1_gross: 4000, debtor_2_gross: 0 },
      { year: 2026, month: 4, debtor_1_gross: 4000, debtor_2_gross: 0 },
      { year: 2026, month: 5, debtor_1_gross: 4000, debtor_2_gross: 0 },
      { year: 2026, month: 6, debtor_1_gross: 4000, debtor_2_gross: 0 },
    ];

    const result = calculate6MonthCMI(incomeHistory, 1);
    expect(result.debtor_1_cmi_monthly).toBe(4000);
    expect(result.debtor_2_cmi_monthly).toBe(0);
    expect(result.total_combined_cmi_monthly).toBe(4000);
    expect(result.total_combined_cmi_annualized).toBe(48000);
    expect(result.months_evaluated).toBe(6);
    expect(result.colorado_median_threshold).toBe(72450);
    expect(result.is_above_median).toBe(false);
  });
});
