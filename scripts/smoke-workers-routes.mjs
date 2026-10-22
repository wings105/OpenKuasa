#!/usr/bin/env node
// Check every navigation route against an actual OpenNext/Cloudflare workerd
// preview without connecting to Supabase or modifying any customer data.
import { navEntries } from './nav-routes.mjs';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8787';
const entries = navEntries(process.cwd());
const routes = [...new Set([
  '/', '/login', '/account', '/pricing',
  ...entries.flatMap(({ key, slugs }) => [
    `/${key}`, ...slugs.map((slug) => `/${key}/${slug}`),
  ]),
])].sort();
const count = Math.min(5, routes.length);
let next = 0;
const results = [];

async function worker() {
  while (next < routes.length) {
    const route = routes[next++];
    try {
      const response = await fetch(base + route, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20000),
        headers: { accept: 'text/html' },
      });
      const body = await response.text();
      const goodStatus = [200, 301, 302, 303, 307, 308].includes(response.status);
      const errorPage = body.includes('This page couldn') && body.includes('A server error occurred');
      results.push({ route, status: response.status, ok: goodStatus && !errorPage,
        detail: goodStatus && !errorPage ? '' : body.slice(0,160).replace(/\s+/g, ' ') });
    } catch (e) {
      results.push({route,status:0,ok:false,detail:String(e)});
    }
  }
}
await Promise.all(Array.from({ length: count }, () => worker()));
results.sort((a,b)=>a.route.localeCompare(b.route));
for(const r of results) console.log(`${r.ok?'PASS':'FAIL'} ${r.status} ${r.route}${r.detail?' — '+r.detail:''}`);
const fails=results.filter(r=>!r.ok);
console.log(`RESULT: ${results.length-fails.length}/${results.length} navigation routes passed; ${fails.length} failed`);
if (fails.length) process.exitCode=1;
