// Minimal Cloudflare Pages Functions types, so this project needs no extra type package.
export interface Env {
  /** Zero Trust team domain, e.g. "yourfirm.cloudflareaccess.com" (Pages > Settings > Variables). */
  ACCESS_TEAM_DOMAIN: string;
  /** Access application AUD tag (Zero Trust > Access > Applications > your app > Overview). */
  ACCESS_AUD: string;
  /** Set to "true" only in local `wrangler pages dev`; ignored unless the host is localhost. */
  ALLOW_UNAUTHENTICATED_LOCAL_DEV?: string;
}

export interface RequestData {
  identity?: { email: string; subject: string } | null;
}

export interface PagesContext {
  request: Request;
  env: Env;
  data: RequestData;
  next: () => Promise<Response>;
}
