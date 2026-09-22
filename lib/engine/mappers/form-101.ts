import type { MasterCaseData } from '../../types/master-case';

export function mapMasterCaseToForm101Fields(data: MasterCaseData): Record<string, any> {
  return {
    debtor1_first_name: data.debtor_1.first_name.value,
    debtor1_middle_name: data.debtor_1.middle_name?.value || '',
    debtor1_last_name: data.debtor_1.last_name.value,
    debtor1_street_address: data.debtor_1.street_address.value,
    debtor1_city: data.debtor_1.city.value,
    debtor1_state: data.debtor_1.state.value,
    debtor1_zip_code: data.debtor_1.zip_code.value,
    chapter: data.chapter || '7'
  };
}
