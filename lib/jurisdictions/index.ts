import type { JurisdictionPack } from './types';
import { ColoradoJurisdictionPack } from './colorado';

export * from './types';
export * from './colorado';

const JURISDICTION_REGISTRY: Record<string, JurisdictionPack> = {
  CO: ColoradoJurisdictionPack
};

export function getJurisdictionPack(jurisdictionCode: string = 'CO'): JurisdictionPack {
  return JURISDICTION_REGISTRY[jurisdictionCode.toUpperCase()] || ColoradoJurisdictionPack;
}
