import type { MasterCaseData } from '../../types/master-case';

export function mapForm106EF(data: MasterCaseData) {
  const priority = data.schedule_ef?.priority_claims || [];
  const nonpriority = data.schedule_ef?.nonpriority_claims || [];
  const priorityTotal = priority.reduce((sum, p) => sum + (p.total_claim_amount?.value || 0), 0);
  const nonpriorityTotal = nonpriority.reduce((sum, n) => sum + (n.total_claim_amount?.value || 0), 0);
  return {
    total_priority_claims: priorityTotal,
    total_nonpriority_claims: nonpriorityTotal,
    total_unsecured_claims: priorityTotal + nonpriorityTotal
  };
}
