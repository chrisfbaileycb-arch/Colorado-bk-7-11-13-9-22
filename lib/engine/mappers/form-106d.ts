import type { MasterCaseData } from '../../types/master-case';

export function mapForm106D(data: MasterCaseData) {
  const secured = data.schedule_d?.secured_claims || [];
  const totalClaims = secured.reduce((sum, s) => sum + (s.total_claim_amount?.value || 0), 0);
  return {
    secured_claims_count: secured.length,
    total_secured_claims_amount: totalClaims
  };
}
