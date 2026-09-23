import type { PagesContext } from '../types';

/** Returns the Access-verified identity of the current user (set by _middleware.ts). */
export const onRequestGet = async (ctx: PagesContext): Promise<Response> => {
  const identity = ctx.data.identity;
  return new Response(JSON.stringify(identity ? { email: identity.email, verifiedBy: 'cloudflare-access' } : { email: null }), {
    status: identity ? 200 : 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
};
