import type { MasterCaseData } from '../../types/master-case';

export function mapForm106H(data: MasterCaseData) {
  return { codebtors: data.schedule_h?.codebtors || [] };
}
