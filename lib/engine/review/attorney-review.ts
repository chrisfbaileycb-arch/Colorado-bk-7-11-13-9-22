import type { FieldWrapper, MasterCaseData } from '../../types/master-case';
import { runHardAuditFlags } from '../validators/hard-audit';
import type { AttorneySignoff, FieldOverride, PetitionReviewSummary } from './types';

function isFieldWrapper(value: unknown): value is FieldWrapper<unknown> {
  return Boolean(value && typeof value === 'object' && 'field_id' in value && 'status' in value && 'value' in value);
}

export function extractAllFieldWrappers(data: MasterCaseData): FieldWrapper<unknown>[] {
  const found: FieldWrapper<unknown>[] = [];
  const seen = new Set<object>();
  const walk = (value: unknown) => {
    if (!value || typeof value !== 'object' || seen.has(value as object)) return;
    seen.add(value as object);
    if (isFieldWrapper(value)) { found.push(value); return; }
    for (const child of Object.values(value as Record<string, unknown>)) walk(child);
  };
  walk(data);
  return found;
}

export function calculateReviewSummary(data: MasterCaseData, signoff?: AttorneySignoff): PetitionReviewSummary {
  const fields = extractAllFieldWrappers(data);
  const critical = runHardAuditFlags(data).filter(flag => flag.severity === 'CRITICAL').length;
  const approved = fields.filter(field => field.status === 'attorney_approved').length;
  const verified = fields.filter(field => field.status === 'user_verified').length;
  const flagged = fields.filter(field => field.status === 'discrepancy_flagged').length;
  const ready = fields.length === 0 ? 0 : ((approved + verified) / fields.length) * 100;
  return {
    total_fields: fields.length,
    raw_extracted_count: fields.filter(field => field.status === 'raw_extracted').length,
    user_verified_count: verified,
    attorney_approved_count: approved,
    flagged_count: flagged,
    readiness_percentage: ready,
    active_overrides_count: fields.filter(field => Boolean(field.attorney_notes)).length,
    hard_audit_critical_flags_count: critical,
    can_execute_signoff: critical === 0 && flagged === 0,
    signoff_details: signoff
  };
}

export function applyFieldOverride(data: MasterCaseData, override: FieldOverride) {
  const field = extractAllFieldWrappers(data).find(item => item.field_id === override.field_id);
  if (!field) return { success: false, errors: ['Field not found.'], updated_data: data };
  field.value = override.overridden_value;
  field.status = 'attorney_approved';
  field.attorney_notes = override.attorney_reason;
  field.source = { type: 'attorney_override' };
  return { success: true, errors: [], updated_data: data };
}

export function executeAttorneySignoff(data: MasterCaseData, signoff: AttorneySignoff) {
  const errors: string[] = [];
  if (!signoff.attorney_name.trim()) errors.push('Supervising Attorney Name is required.');
  if (signoff.bar_number.trim().length < 4) errors.push('A valid Attorney Bar Number is required.');
  if (!signoff.declaration_accepted) errors.push('The declaration under penalty of perjury must be accepted.');
  const summary = calculateReviewSummary(data, signoff);
  if (summary.hard_audit_critical_flags_count > 0) errors.push('Critical audit flags must be resolved.');
  if (errors.length === 0) {
    for (const field of extractAllFieldWrappers(data)) field.status = 'attorney_approved';
  }
  return { success: errors.length === 0, errors, summary: calculateReviewSummary(data, signoff) };
}
