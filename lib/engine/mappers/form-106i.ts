import type { MasterCaseData } from '../../types/master-case';

export function mapForm106I(data: MasterCaseData) {
  const d1Gross = data.schedule_i?.debtor_1_gross_wages?.value || 0;
  const pTax = data.schedule_i?.debtor_1_payroll_deductions?.taxes_and_social_security?.value || 0;
  const deductions = data.schedule_i?.debtor_1_payroll_deductions;
  // Intake UI writes voluntary_contributions_retirement; fixtures use voluntary_401k.
  const p401k = deductions?.voluntary_contributions_retirement?.value || deductions?.voluntary_401k?.value || 0;
  const pIns = deductions?.insurance?.value || 0;
  const netWages = d1Gross - (pTax + p401k + pIns);
  const busInc = data.schedule_i?.other_monthly_income?.business_net_income?.value || 0;
  const totalNet = data.schedule_i?.total_monthly_net_income?.value ?? (netWages + busInc);

  return {
    debtor1_gross_wages: d1Gross,
    debtor1_payroll_deductions: pTax + p401k + pIns,
    debtor1_net_wages: netWages,
    business_income_net: busInc,
    total_combined_monthly_income: totalNet
  };
}
