import type { MasterCaseData } from '../../types/master-case';

export function mapForm106I(data: MasterCaseData) {
  const d1Gross = data.schedule_i?.debtor_1_gross_wages?.value || 4850;
  const pTax = data.schedule_i?.debtor_1_payroll_deductions?.taxes_and_social_security?.value || 950;
  const p401k = data.schedule_i?.debtor_1_payroll_deductions?.voluntary_401k?.value || 250;
  const netWages = d1Gross - (pTax + p401k);
  const busInc = data.schedule_i?.other_monthly_income?.business_net_income?.value || 0;
  const totalNet = data.schedule_i?.total_monthly_net_income?.value ?? (netWages + busInc);

  return {
    debtor1_gross_wages: d1Gross,
    debtor1_payroll_deductions: pTax + p401k,
    debtor1_net_wages: netWages,
    business_income_net: busInc,
    total_combined_monthly_income: totalNet
  };
}
