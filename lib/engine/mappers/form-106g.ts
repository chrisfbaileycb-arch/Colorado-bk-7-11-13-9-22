import type { MasterCaseData } from '../../types/master-case';

export function mapForm106G(data: MasterCaseData) {
  return { contracts: data.schedule_g?.contracts || [] };
}
