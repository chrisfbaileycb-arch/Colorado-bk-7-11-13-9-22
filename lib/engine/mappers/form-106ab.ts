import type { MasterCaseData } from '../../types/master-case';

export function mapForm106AB(data: MasterCaseData) {
  const realVal = data.schedule_ab?.total_real_property_value?.value || 0;
  const personalVal = data.schedule_ab?.total_personal_property_value?.value || 0;
  return {
    total_real_property: realVal,
    total_personal_property: personalVal,
    total_property: realVal + personalVal
  };
}
