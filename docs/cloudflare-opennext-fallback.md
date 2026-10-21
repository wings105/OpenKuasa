# OpenNext Cloudflare Workers fallback test

This branch experiments with OpenNext as a **fallback** because `vinext build` on the complete OpenKuasa source was killed during its first RSC transform, although `vinext check` and TypeScript passed. The existing Next.js `next build` is known to work on Cloudflare with a larger Node heap.

**Do not connect this test branch to production Worker `openkuasa` or the iCetak database.** The generated Worker name is intentionally `openkuasa-opennext-test` to avoid replacing any production deployment.

The OpenNext adapter has been configured explicitly in source control. This prevents Wrangler's interactive automatic migration during Cloudflare CI. OpenNext uses `next build` and adapts its output for Workers; its Next.js 16 `src/proxy.ts` behavior is not proven here.

## Cloudflare Workers Builds settings (only after CI build passes)

- Repository: `wings105/OpenKuasa`
- Branch: `fix/cloudflare-opennext-test` (for test-only deploy, not live main)
- Build: `pnpm run build:opennext`
- Deploy: `pnpm run deploy:opennext`
- Build env: `NODE_OPTIONS=--max-old-space-size=4096`
- Worker runtime/demo env: `OPENKUASA_PREVIEW=1` and no Supabase URL/anon key.

**Important:** `pnpm run deploy:opennext` should only reuse an already built `.open-next` bundle. If Cloudflare's build and deploy commands run in isolated directories, combine them in the deploy command instead: `pnpm run build:opennext && pnpm run deploy:opennext` and leave the Build command empty. Avoid duplicating the expensive Next.js build. The build log will determine the correct setting for that environment.

The app may require additional bindings, middleware changes, cache configuration or a Workers Paid plan if its compressed Worker bundle exceeds Free limits. The current `wrangler.jsonc` intentionally configures no R2 cache. Do not activate scheduled agents; do not insert production keys.

## Checks
1. Confirm the GitHub Actions test of `build:opennext` completed successfully and that `.open-next/worker.js` and assets exist.
2. In a separate test Worker, verify HTTP 200 from the homepage with preview flag.
3. Test CSP nonce/headers, Next.js 16 proxy session refresh, SSR, Server Actions and API routes.
4. Test images, forms/uploads, redirects, and errors.
5. Only after runtime checks and review should a PR become ready for merge. Never infer runtime compatibility from a successful build.

## References
- https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- https://opennext.js.org/cloudflare/get-started
- https://opennext.js.org/cloudflare/cli
