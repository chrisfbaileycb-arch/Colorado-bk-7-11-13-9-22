import { beforeAll, describe, expect, it } from 'bun:test';
import { verifyAccessJwt, AccessVerificationError, type JwksFetcher } from '../lib/engine/access';

const config = { teamDomain: 'examplefirm.cloudflareaccess.com', audience: 'aud-123' };
const NOW = Date.UTC(2026, 8, 23, 12, 0, 0);
let keys: CryptoKeyPair;
let jwks: JwksFetcher;

const b64url = (b: ArrayBuffer | Uint8Array) =>
  Buffer.from(b instanceof Uint8Array ? b : new Uint8Array(b)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sign(payload: object, kid = 'k1', key = keys.privateKey, alg = 'RS256') {
  const h = b64url(new TextEncoder().encode(JSON.stringify({ alg, kid, typ: 'JWT' })));
  const p = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64url(sig)}`;
}

const good = () => ({
  aud: ['aud-123'], iss: 'https://examplefirm.cloudflareaccess.com', email: 'paralegal@examplefirm.test',
  sub: 'u1', iat: NOW / 1000 - 10, exp: NOW / 1000 + 600
});

beforeAll(async () => {
  keys = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true, ['sign', 'verify']
  ) as CryptoKeyPair;
  const pub = await crypto.subtle.exportKey('jwk', keys.publicKey);
  jwks = async url => {
    expect(url).toBe('https://examplefirm.cloudflareaccess.com/cdn-cgi/access/certs');
    return { keys: [{ ...pub, kid: 'k1' }] as any };
  };
});

describe('Cloudflare Access token verification', () => {
  it('accepts a valid token and returns the verified email', async () => {
    const id = await verifyAccessJwt(await sign(good()), config, { fetchJwks: jwks, now: NOW });
    expect(id.email).toBe('paralegal@examplefirm.test');
  });

  const rejects = async (token: string | null, cfg = config) =>
    expect(verifyAccessJwt(token, cfg, { fetchJwks: jwks, now: NOW })).rejects.toBeInstanceOf(AccessVerificationError);

  it('fails closed when Access is not configured', async () => rejects(await sign(good()), { teamDomain: '', audience: '' }));
  it('rejects a missing token', async () => rejects(null));
  it('rejects a tampered payload', async () => {
    const [h, , s] = (await sign(good())).split('.');
    const forged = b64url(new TextEncoder().encode(JSON.stringify({ ...good(), email: 'attacker@evil.test' })));
    await rejects(`${h}.${forged}.${s}`);
  });
  it('rejects the wrong audience', async () => rejects(await sign({ ...good(), aud: ['other-app'] })));
  it('rejects the wrong issuer', async () => rejects(await sign({ ...good(), iss: 'https://evil.cloudflareaccess.com' })));
  it('rejects an expired token', async () => rejects(await sign({ ...good(), exp: NOW / 1000 - 1 })));
  it('rejects an unknown key id', async () => rejects(await sign(good(), 'k2')));
  it('rejects alg other than RS256', async () => rejects(await sign(good(), 'k1', keys.privateKey, 'none')));
});
