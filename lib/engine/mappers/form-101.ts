import type { MasterCaseData } from '../../types/master-case';

export function mapMasterCaseToForm101Fields(data: MasterCaseData): Record<string, any> {
  const d1 = data.debtor_1;
  const first = d1.first_name.value;
  const middle = d1.middle_name?.value || '';
  const last = d1.last_name.value;
  const ssnDigits = (d1.ssn_full?.value || '').replace(/\D/g, '');
  return {
    debtor1_first_name: first,
    debtor1_middle_name: middle,
    debtor1_last_name: last,
    debtor1_full_name: [first, middle, last].filter(Boolean).join(' '),
    debtor1_ssn_last4: ssnDigits.length >= 4 ? ssnDigits.slice(-4) : '',
    debtor1_street_address: d1.street_address.value,
    debtor1_city: d1.city.value,
    debtor1_state: d1.state.value,
    debtor1_zip_code: d1.zip_code.value,
    has_joint_debtor: Boolean(data.debtor_2),
    chapter: data.chapter || '7'
  };
}
