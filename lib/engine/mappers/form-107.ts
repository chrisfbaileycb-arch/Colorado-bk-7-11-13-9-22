import type { MasterCaseData } from '../../types/master-case';

export function mapMasterCaseToForm107(data: MasterCaseData) {
  return { sofa: data.sofa_form_107 || {} };
}
