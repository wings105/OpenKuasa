# Deploy the validated OpenNext preview to existing Cloudflare Worker

This branch targets the existing Cloudflare **Worker named `openkuasa`**. The application and dependencies are based on `fix/cloudflare-opennext-test`, whose complete Next.js/OpenNext build and local Workers runtime smoke test returned HTTP 200 for `/`, `/command`, `/crm/contacts` and `/finance/dashboard`.

This is a **demo-only deployment** with sample data; no production Supabase database.

Cloudflare Dashboard > Workers & Pages > `openkuasa` > Settings > Build:

| Setting | Value |
| --- | --- |
| GitHub repo | `wings105/OpenKuasa` |
| Production branch (Branch control) | `deploy/openkuasa-preview` |
| Root directory | `/` |
| Build command | `pnpm run build:opennext` |
| Deploy command | `pnpm run deploy:opennext` |
| Build variable `NODE_OPTIONS` | `--max-old-space-size=4096` |
| Node.js | 24, as in successful GitHub Actions build |

Cloudflare Dashboard > Worker `openkuasa` > Settings > Variables and Secrets:
- Variable: `OPENKUASA_PREVIEW`
- Value: `1`
- Do not set production Supabase keys on this demo deployment.

**Do not use `npx wrangler deploy`:** that is the old command, which triggers failed automatic migration. The explicit OpenNext CLI knows how to deploy the `.open-next/worker.js` bundle generated in the build step.

A successful CI build does not guarantee Cloudflare's deployed Worker will have no size limits, runtime issues, or CSP/session problems. After deploying, verify the `*.workers.dev` page and browser console. Do not attach a custom domain until the preview works.

The app's Next.js 16 Node.js `src/proxy.ts` is using an OpenNext feature warned as *experimental*. Keep this deployment on sample data. Never use the existing iCetak Supabase production DB. This branch does not make any changes to `main` or iCetak Worker.

References: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ and https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/.
