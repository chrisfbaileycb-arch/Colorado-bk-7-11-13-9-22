# Deploying on Cloudflare

Two separate Cloudflare Pages projects:

| Project | Source | Who can reach it |
|---|---|---|
| Marketing site | `marketing/` (static HTML, screenshots only) | Public |
| App | `dist/` (built from this repo) + `functions/` | Only people allowed by a Cloudflare Access policy |

The marketing site must never contain the app bundle. The app is licensed to law firms only.

## 1. App: build and first deploy

```bash
bun install
bun test && bun run typecheck && bun run build
npx wrangler login
npx wrangler pages deploy        # uses wrangler.toml: project "colorado-bk-app", output "dist"
```

`functions/_middleware.ts` rejects every request (HTTP 403) until Access is configured in
step 3. That is intended: the app fails closed.

## 2. Put Cloudflare Access in front of the app

In the Cloudflare dashboard, **Zero Trust**:

1. **Settings → Custom Pages / General:** note your team domain, e.g. `yourfirm.cloudflareaccess.com`.
2. **Settings → Authentication:** add login methods.
   - One-time PIN (email code) works immediately.
   - Add Microsoft Entra ID or Google Workspace for firms that use them.
3. **Access → Applications → Add an application → Self-hosted:**
   - Application domain: the app's Pages domain (and any custom domain).
   - Also protect preview deployments: add `*.colorado-bk-app.pages.dev`.
   - Session duration: 8 hours or less.
4. **Policies:** one Allow policy per firm, e.g. "Firm A — emails ending in `@firma.com`". Do not
   use "Everyone". Add a separate policy for your own admin account.
5. Open the application's **Overview** and copy the **Application Audience (AUD) Tag**.

## 3. Tell the app about Access

Pages project **colorado-bk-app → Settings → Variables and Secrets** (Production *and* Preview):

| Name | Value |
|---|---|
| `ACCESS_TEAM_DOMAIN` | `yourfirm.cloudflareaccess.com` |
| `ACCESS_AUD` | the AUD tag from step 2.5 |

Redeploy (`npx wrangler pages deploy`). Never set `ALLOW_UNAUTHENTICATED_LOCAL_DEV` in the
dashboard; it is for `wrangler pages dev` on your own machine only, and is ignored on any host
other than localhost.

## 4. Verify

- In a private window, open the app URL. You should get the Access login page, not the app.
- After signing in, the cover page should say **"Signed in as you@firm.com (verified by
  Cloudflare Access)"**, and Step 16 should show the same identity.
- `curl -i https://<app-domain>/api/whoami` without logging in returns a redirect to Access
  or a 403, never an email.
- Response headers include `Content-Security-Policy` and `X-Frame-Options: DENY` (from
  `public/_headers`).

## 5. Marketing site

```bash
npx wrangler pages project create colorado-bk-marketing
npx wrangler pages deploy marketing --project-name colorado-bk-marketing
```

No Access policy. Before each deploy, check that every screenshot caption matches what the app
actually does today (see `STATUS.md`).

## Before real client data

Access controls who can open the app. It does not make the app ready for real client data.
Nothing is stored server-side yet; case data lives only in the user's browser tab. Adding
storage (D1/R2) needs the items in the README's "Production-readiness requirements" first:
encryption, per-firm data separation, audit logs, retention and deletion, and backups.
