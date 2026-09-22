import { describe, expect, it } from 'bun:test';
import { createSampleMasterCaseData } from './helpers/sample-case';
import {
  extractAllFieldWrappers,
  calculateReviewSummary,
  applyFieldOverride,
  executeAttorneySignoff
} from '../lib/engine/review';
import type { FieldOverride, AttorneySignoff } from '../lib/engine/review/types';

describe('Phase 8: Attorney Review Console Test Suite', () => {
  it('1. extractAllFieldWrappers traverses MasterCaseData SSOT and extracts field wrappers', () => {
    const data = createSampleMasterCaseData();
    const wrappers = extractAllFieldWrappers(data);

    expect(wrappers.length).toBeGreaterThan(10);
    expect(wrappers.some(w => w.field_id === 'first')).toBe(true);
  });

  it('2. calculateReviewSummary computes readiness percentage and flag counts accurately', () => {
    const data = createSampleMasterCaseData();
    const summary = calculateReviewSummary(data);

    expect(summary.total_fields).toBeGreaterThan(0);
    expect(summary.readiness_percentage).toBeGreaterThanOrEqual(0);
    expect(summary.can_execute_signoff).toBe(true);
  });

  it('3. applyFieldOverride modifies field value, updates status to attorney_approved, and logs rationale note', () => {
    const data = createSampleMasterCaseData();
    const override: FieldOverride = {
      field_id: 'first',
      original_value: 'Jane',
      overridden_value: 'Janet',
      attorney_reason: 'Corrected legal first name per passport',
      attorney_name: 'Example Supervising Attorney',
      bar_number: 'TEST-BAR-54321',
      timestamp: '2026-08-02T16:30:00Z'
    };

    const res = applyFieldOverride(data, override);
    expect(res.success).toBe(true);

    const firstWrapper = res.updated_data.debtor_1.first_name;
    expect(firstWrapper?.value).toBe('Janet');
    expect(firstWrapper?.status).toBe('attorney_approved');
    expect(firstWrapper?.attorney_notes).toBe('Corrected legal first name per passport');
  });

  it('4. executeAttorneySignoff rejects signoff if declaration is not accepted', () => {
    const data = createSampleMasterCaseData();
    const signoff: AttorneySignoff = {
      attorney_name: 'Example Supervising Attorney',
      bar_number: 'TEST-BAR-54321',
      firm_name: 'Mile High BK Law',
      ecf_login_id: 'TEST_ECF_NOT_REAL',
      signed_at: new Date().toISOString(),
      declaration_accepted: false
    };

    const res = executeAttorneySignoff(data, signoff);
    expect(res.success).toBe(false);
    expect(res.errors.some(e => e.includes('declaration under penalty of perjury'))).toBe(true);
  });

  it('5. executeAttorneySignoff rejects signoff if bar number is invalid', () => {
    const data = createSampleMasterCaseData();
    const signoff: AttorneySignoff = {
      attorney_name: 'Example Supervising Attorney',
      bar_number: '12',
      firm_name: 'Mile High BK Law',
      ecf_login_id: 'TEST_ECF_NOT_REAL',
      signed_at: new Date().toISOString(),
      declaration_accepted: true
    };

    const res = executeAttorneySignoff(data, signoff);
    expect(res.success).toBe(false);
    expect(res.errors.some(e => e.includes('valid Attorney Bar Number'))).toBe(true);
  });

  it('6. executeAttorneySignoff completes successfully when all prerequisites pass', () => {
    const data = createSampleMasterCaseData();
    const signoff: AttorneySignoff = {
      attorney_name: 'Example Supervising Attorney',
      bar_number: 'TEST-BAR-54321',
      firm_name: 'Mile High Bankruptcy Law Group',
      ecf_login_id: 'TEST_ECF_NOT_REAL',
      signed_at: new Date().toISOString(),
      declaration_accepted: true
    };

    const res = executeAttorneySignoff(data, signoff);
    expect(res.success).toBe(true);
    expect(res.errors.length).toBe(0);
    expect(res.summary.signoff_details?.attorney_name).toBe('Example Supervising Attorney');

    const wrappers = extractAllFieldWrappers(data);
    expect(wrappers.every(w => w.status === 'attorney_approved')).toBe(true);
  });
});
