import { verifyAccessJwt } from '../lib/engine/access/verify-access-jwt';
import type { PagesContext } from './types';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Runs before every request (pages, assets, /api/*). Cloudflare Access already blocks
 * unauthenticated visitors at the edge; this re-verifies the Access token so the app fails
 * closed if the Access policy is ever misconfigured or bypassed.
 */
export const onRequest = async (ctx: PagesContext): Promise<Response> => {
  const url = new URL(ctx.request.url);

  if (ctx.env.ALLOW_UNAUTHENTICATED_LOCAL_DEV === 'true' && LOCAL_HOSTS.has(url.hostname)) {
    ctx.data.identity = null;
    return ctx.next();
  }

  try {
    const identity = await verifyAccessJwt(
      ctx.request.headers.get('Cf-Access-Jwt-Assertion'),
      { teamDomain: ctx.env.ACCESS_TEAM_DOMAIN, audience: ctx.env.ACCESS_AUD }
    );
    ctx.data.identity = { email: identity.email, subject: identity.subject };
  } catch {
    // Do not reveal why verification failed.
    return new Response('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' } });
  }
  return ctx.next();
};
