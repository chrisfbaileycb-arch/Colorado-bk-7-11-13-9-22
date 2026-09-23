/**
 * Verifies a Cloudflare Access application token (the `Cf-Access-Jwt-Assertion` header).
 *
 * Cloudflare Access sits in front of the app and blocks anyone who has not signed in. This
 * check runs again inside the app's own server code so a misconfigured Access policy, or a
 * request that reaches the origin some other way, still fails closed. It uses only WebCrypto,
 * so it runs unchanged in Cloudflare Pages Functions, Workers, Bun and modern browsers.
 *
 * Docs: https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 */

export interface AccessConfig {
  /** Zero Trust team domain, e.g. "yourfirm.cloudflareaccess.com". */
  teamDomain: string;
  /** Application Audience (AUD) tag from the Access application's settings. */
  audience: string;
}

export interface AccessIdentity {
  email: string;
  subject: string;
  issuedAt: number;
  expiresAt: number;
}

export type JwksFetcher = (url: string) => Promise<{ keys: Array<JsonWebKey & { kid?: string }> }>;

export class AccessVerificationError extends Error {}

const defaultFetcher: JwksFetcher = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new AccessVerificationError(`Could not load Access signing keys (${res.status}).`);
  return res.json();
};

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

function decodeJson(segment: string): any {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(segment)));
}

export async function verifyAccessJwt(
  token: string | null | undefined,
  config: AccessConfig,
  opts: { fetchJwks?: JwksFetcher; now?: number } = {}
): Promise<AccessIdentity> {
  if (!config.teamDomain || !config.audience) throw new AccessVerificationError('Access is not configured.');
  if (!token) throw new AccessVerificationError('Missing Access token.');

  const parts = token.split('.');
  if (parts.length !== 3) throw new AccessVerificationError('Malformed token.');
  const [h, p, sig] = parts as [string, string, string];

  let header: any, payload: any;
  try {
    header = decodeJson(h);
    payload = decodeJson(p);
  } catch {
    throw new AccessVerificationError('Malformed token.');
  }
  if (header.alg !== 'RS256') throw new AccessVerificationError('Unexpected signing algorithm.');

  const teamUrl = `https://${config.teamDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  const jwks = await (opts.fetchJwks ?? defaultFetcher)(`${teamUrl}/cdn-cgi/access/certs`);
  const jwk = jwks.keys.find(k => k.kid === header.kid);
  if (!jwk) throw new AccessVerificationError('Unknown signing key.');

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(sig) as BufferSource,
    new TextEncoder().encode(`${h}.${p}`)
  );
  if (!valid) throw new AccessVerificationError('Invalid signature.');

  const now = Math.floor((opts.now ?? Date.now()) / 1000);
  const aud: string[] = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(config.audience)) throw new AccessVerificationError('Token is for a different application.');
  if (payload.iss !== teamUrl) throw new AccessVerificationError('Unexpected issuer.');
  if (typeof payload.exp !== 'number' || payload.exp <= now) throw new AccessVerificationError('Token expired.');
  if (typeof payload.nbf === 'number' && payload.nbf > now + 60) throw new AccessVerificationError('Token not yet valid.');
  if (!payload.email) throw new AccessVerificationError('Token has no email identity.');

  return { email: String(payload.email), subject: String(payload.sub ?? ''), issuedAt: Number(payload.iat ?? 0), expiresAt: payload.exp };
}
