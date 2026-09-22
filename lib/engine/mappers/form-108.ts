import type { MasterCaseData } from '../../types/master-case';

export function mapMasterCaseToForm108(data: MasterCaseData) {
  return { intentions: data.form_108 || {} };
}
