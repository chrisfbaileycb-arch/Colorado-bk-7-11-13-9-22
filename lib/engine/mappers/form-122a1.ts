import type { MasterCaseData } from '../../types/master-case';

export function mapForm122A1(data: MasterCaseData) {
  return { cmi: data.means_test_122a || {} };
}

export function mapForm122A2(data: MasterCaseData) {
  return { presumption: data.means_test_122a || {} };
}
