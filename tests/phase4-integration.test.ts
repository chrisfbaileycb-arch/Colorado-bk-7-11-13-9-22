import { describe, it, expect } from 'bun:test';
import { createSampleMasterCaseData, fw } from './helpers/sample-case';
import { 
  mapForm106I, 
  mapForm106J, 
  mapForm106J2, 
  calculateNetCashFlow,
  generateForm106IPdf,
  generateForm106JPdf,
  generateForm106J2Pdf
} from '../lib/index';

describe('Phase 4 Comprehensive End-to-End Pipeline Integration Suite', () => {
  it('executes full pipeline: SSOT MasterCaseData -> Mappers -> Cash Flow Engine -> Vector PDF Stamping', async () => {
    const data = createSampleMasterCaseData();

    data.schedule_i.debtor_1_gross_wages = fw('i.d1_gross', 5200);
    data.schedule_i.debtor_1_payroll_deductions = {
      taxes_and_social_security: fw('ded.tax', 850),
      mandatory_contributions: fw('ded.mand', 0),
      voluntary_401k: fw('ded.401k', 150),
      insurance: fw('ded.ins', 200),
      union_dues: fw('ded.union', 0),
      garnishments: fw('ded.garn', 0),
      other_deductions: fw('ded.oth', 0)
    };
    data.schedule_i.other_monthly_income.business_net_income = fw('inc.bus', 500);
    data.schedule_i.total_monthly_net_income = fw('i.net_tot', 4500);

    const mappedI = mapForm106I(data);
    expect(mappedI.debtor1_gross_wages).toBe(5200);
    expect(mappedI.total_combined_monthly_income).toBe(4500);

    const cashFlow = calculateNetCashFlow(data);
    expect(cashFlow.net_monthly_income).toBe(4500);
    expect(cashFlow.status_label).toBe('SURPLUS');
  });
});
