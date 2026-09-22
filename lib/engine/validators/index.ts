export * from './hard-audit';

import type { MasterCaseData } from '../../types/master-case';
import { ColoradoJurisdictionPack } from '../../jurisdictions/colorado';

export const COLORADO_MEDIAN_INCOME_2026: Record<number, number> = {
  1: 72450,
  2: 91020,
  3: 108402,
  4: 126440
};

export function getColoradoMedianIncome(householdSize: number): number {
  const size = Math.max(1, Math.trunc(householdSize));
  return COLORADO_MEDIAN_INCOME_2026[size] ?? COLORADO_MEDIAN_INCOME_2026[4] + (size - 4) * 11000;
}

export function calculate6MonthCMI(
  history: Array<{ debtor_1_gross: number; debtor_2_gross: number }>,
  householdSize: number
) {
  if (history.length !== 6) throw new Error('Exactly six calendar months are required.');
  const debtor1 = history.reduce((sum, row) => sum + Number(row.debtor_1_gross || 0), 0) / 6;
  const debtor2 = history.reduce((sum, row) => sum + Number(row.debtor_2_gross || 0), 0) / 6;
  const combined = debtor1 + debtor2;
  const annualized = combined * 12;
  const threshold = getColoradoMedianIncome(householdSize);
  return {
    debtor_1_cmi_monthly: debtor1,
    debtor_2_cmi_monthly: debtor2,
    total_combined_cmi_monthly: combined,
    total_combined_cmi_annualized: annualized,
    months_evaluated: 6,
    colorado_median_threshold: threshold,
    is_above_median: annualized > threshold
  };
}

export function calculateNetCashFlow(data: MasterCaseData) {
  const income = Number(data.schedule_i?.total_monthly_net_income?.value || 0);
  const expenses = Number(data.schedule_j?.total_monthly_expenses?.value || 0)
    + Number(data.schedule_j2?.total_monthly_expenses?.value || 0);
  const net = income - expenses;
  return {
    net_monthly_income: income,
    total_monthly_expenses: expenses,
    net_cash_flow: net,
    status_label: net >= 0 ? 'SURPLUS' : 'DEFICIT'
  };
}

export function validateExemptionCapsAndSummaries(data: MasterCaseData) {
  const rules = ColoradoJurisdictionPack.statutory_rules;
  const issues: string[] = [];
  for (const claim of data.schedule_c?.claimed_exemptions || []) {
    const citation = claim.statute_citation.value;
    const amount = Number(claim.claimed_amount.value || 0);
    const rule = Object.values(rules).find(r => r.statute_citation === citation);
    if (rule && rule.individual_cap !== 'UNLIMITED' && amount > Number(rule.individual_cap)) {
      issues.push(`${claim.id} exceeds the configured individual cap.`);
    }
  }
  return { valid: issues.length === 0, issues };
}
