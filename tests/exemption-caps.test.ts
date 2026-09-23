import { describe, expect, it } from 'bun:test';
import { getColoradoExemptionCap } from '../lib/engine/validators';
import { ColoradoJurisdictionPack } from '../lib/jurisdictions/colorado';

const single = { isJoint: false, isElderlyOrDisabled: false };
const joint = { isJoint: true, isElderlyOrDisabled: false };
const elderly = { isJoint: false, isElderlyOrDisabled: true };
const jointElderly = { isJoint: true, isElderlyOrDisabled: true };

describe('Colorado exemption caps come from the jurisdiction pack', () => {
  // The pack configures homestead as a per-homestead cap (joint_cap_multiplier: 1).
  // This test pins that so a doubling can't creep back in via the UI.
  // ATTORNEY REVIEW REQUIRED on the underlying rule and figures.
  it('homestead does not double for joint filers', () => {
    expect(getColoradoExemptionCap('HOMESTEAD', single)).toBe(250000);
    expect(getColoradoExemptionCap('HOMESTEAD', joint)).toBe(250000);
    expect(getColoradoExemptionCap('HOMESTEAD', elderly)).toBe(350000);
    expect(getColoradoExemptionCap('HOMESTEAD', jointElderly)).toBe(350000);
  });

  it('vehicle applies the configured per-debtor multiplier, including elderly/disabled', () => {
    expect(getColoradoExemptionCap('VEHICLE', single)).toBe(15000);
    expect(getColoradoExemptionCap('VEHICLE', joint)).toBe(30000);
    expect(getColoradoExemptionCap('VEHICLE', elderly)).toBe(25000);
    expect(getColoradoExemptionCap('VEHICLE', jointElderly)).toBe(50000);
  });

  // Tripwire: when a Colorado attorney verifies the pack, update last_verified_date/verified_by
  // there and change this test in the same commit so the sign-off is explicit in history.
  it('every capped rule is still flagged as needing attorney verification', () => {
    for (const rule of Object.values(ColoradoJurisdictionPack.statutory_rules)) {
      expect(rule.last_verified_date).toBe('UNVERIFIED');
    }
  });
});

describe('counsel verification status', () => {
  it('reports every exemption rule and the median table, and nothing is verified yet', async () => {
    const { getCounselVerificationStatus } = await import('../lib/jurisdictions/counsel-verification');
    const status = getCounselVerificationStatus();
    expect(status.records.some(r => r.item.startsWith('HOMESTEAD'))).toBe(true);
    expect(status.records.some(r => r.item.includes('median'))).toBe(true);
    // Tripwire: flips to true only when counsel's sign-off is recorded in code.
    expect(status.allVerified).toBe(false);
  });
});
