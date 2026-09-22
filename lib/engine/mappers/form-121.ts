import type { MasterCaseData } from '../../types/master-case';

export function mapMasterCaseToForm121Fields(data: MasterCaseData): Record<string, any> {
  return {
    debtor1_full_name: `${data.debtor_1.first_name.value} ${data.debtor_1.last_name.value}`,
    debtor1_ssn_full: data.debtor_1.ssn_full.value,
    debtor2_full_name: data.debtor_2 ? `${data.debtor_2.first_name.value} ${data.debtor_2.last_name.value}` : '',
    debtor2_ssn_full: data.debtor_2?.ssn_full.value || ''
  };
}
