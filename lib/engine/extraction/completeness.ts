/**
 * Share of required fields present in structured input. This is what the parsers report as
 * `confidence_score`: a completeness ratio, not an OCR/model confidence (there is no OCR).
 */
export function structuredFieldCompleteness(fields: Record<string, unknown>): { score: number; missing: string[] } {
  const keys = Object.keys(fields);
  const missing = keys.filter(k => fields[k] === undefined || fields[k] === null || fields[k] === '');
  return { score: keys.length ? (keys.length - missing.length) / keys.length : 0, missing };
}
