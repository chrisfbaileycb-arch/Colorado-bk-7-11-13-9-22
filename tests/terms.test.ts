import { describe, expect, it } from 'bun:test';
import { needsTermsAcceptance, buildTermsAcceptance, termsStorageKey, TERMS_VERSION } from '../lib/engine/review/terms';

describe('terms acknowledgment', () => {
  it('requires acceptance when none is recorded or the version changed', () => {
    expect(needsTermsAcceptance(null)).toBe(true);
    const rec = buildTermsAcceptance('Pat Example', 'pat@firm.test', new Date('2026-09-23T00:00:00Z'));
    expect(needsTermsAcceptance(rec)).toBe(false);
    expect(needsTermsAcceptance({ ...rec, version: 'older' })).toBe(true);
  });
  it('records version, time, typed name and verified identity', () => {
    const rec = buildTermsAcceptance('  Pat Example ', 'pat@firm.test', new Date('2026-09-23T00:00:00Z'));
    expect(rec).toEqual({ version: TERMS_VERSION, acceptedAt: '2026-09-23T00:00:00.000Z', typedName: 'Pat Example', verifiedEmail: 'pat@firm.test' });
  });
  it('refuses acceptance without a typed name', () => {
    expect(() => buildTermsAcceptance('   ', null)).toThrow();
  });
  it('keeps acceptances separate per signed-in identity', () => {
    expect(termsStorageKey('a@firm.test')).not.toBe(termsStorageKey('b@firm.test'));
  });
});
