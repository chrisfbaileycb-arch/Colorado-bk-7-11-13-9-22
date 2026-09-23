import { ColoradoJurisdictionPack } from './colorado';

/**
 * Where Colorado counsel's sign-off on the app's legal figures is recorded.
 *
 * To record a sign-off (see docs/recording-counsel-signoff.md):
 *   1. For each exemption rule counsel confirmed, set `last_verified_date` (YYYY-MM-DD) and
 *      `verified_by` ("Name, Colorado Reg. #12345") in lib/jurisdictions/colorado.ts.
 *   2. For the median-income table, fill in MEDIAN_INCOME_VERIFICATION below.
 *   3. Update the tripwire test in tests/exemption-caps.test.ts in the same commit.
 * The disclaimer banner and STATUS reads come from getCounselVerificationStatus(), so they
 * update automatically once every item is verified.
 */

export interface VerificationRecord {
  item: string;
  verified: boolean;
  verifiedBy: string | null;
  verifiedOn: string | null;
}

/** Median family income table used by the 122A-1 comparison (lib/engine/validators). */
export const MEDIAN_INCOME_VERIFICATION: { source: string; effectiveFor: string; verifiedBy: string | null; verifiedOn: string | null } = {
  source: 'U.S. Trustee Program census median family income table (Colorado)',
  effectiveFor: 'UNVERIFIED',
  verifiedBy: null,
  verifiedOn: null
};

const isRealDate = (v: string | null | undefined) => Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v));

export function getCounselVerificationStatus(): { allVerified: boolean; records: VerificationRecord[]; latestVerifiedOn: string | null; verifiers: string[] } {
  const records: VerificationRecord[] = Object.entries(ColoradoJurisdictionPack.statutory_rules).map(([key, rule]) => {
    const verified = isRealDate(rule.last_verified_date) && !/REQUIRED|UNVERIFIED/i.test(rule.verified_by);
    return { item: `${key} (${rule.statute_citation})`, verified, verifiedBy: verified ? rule.verified_by : null, verifiedOn: verified ? rule.last_verified_date : null };
  });
  const m = MEDIAN_INCOME_VERIFICATION;
  const medianVerified = isRealDate(m.verifiedOn) && Boolean(m.verifiedBy);
  records.push({ item: 'Colorado median family income table', verified: medianVerified, verifiedBy: medianVerified ? m.verifiedBy : null, verifiedOn: medianVerified ? m.verifiedOn : null });

  const dates = records.map(r => r.verifiedOn).filter((d): d is string => Boolean(d)).sort();
  return {
    allVerified: records.every(r => r.verified),
    records,
    latestVerifiedOn: dates.length ? dates[dates.length - 1]! : null,
    verifiers: [...new Set(records.map(r => r.verifiedBy).filter((v): v is string => Boolean(v)))]
  };
}
