/**
 * Real SHA-256 digests via WebCrypto. Returns null when WebCrypto is unavailable
 * (e.g. the app is served over plain HTTP from a non-localhost origin), so callers
 * can say "unavailable" instead of printing a made-up hash.
 */
export async function sha256Hex(input: string | Uint8Array): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return null;
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const digest = await subtle.digest('SHA-256', bytes as BufferSource);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

/** Stable serialization so the same case data always hashes the same. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map(k => [k, (v as Record<string, unknown>)[k]]))
      : v
  );
}
