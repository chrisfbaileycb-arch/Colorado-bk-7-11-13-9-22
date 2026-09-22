import type { MasterCaseData } from '../../types/master-case';

export function mapForm106C(data: MasterCaseData) {
  const exemptions = data.schedule_c?.claimed_exemptions || [];
  const totalExempt = exemptions.reduce((sum, item) => sum + (item.claimed_amount?.value || 0), 0);
  return {
    claimed_exemptions_count: exemptions.length,
    total_claimed_exemption_amount: totalExempt
  };
}
