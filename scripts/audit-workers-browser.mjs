#!/usr/bin/env node
/**
 * Browser-level smoke audit for the 100 sample-data OpenKuasa menu routes.
 * Navigates each URL in Chromium, waits for React hydration, and checks for
 * runtime/page exceptions. No buttons are clicked and no data is written.
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { navEntries } from './nav-routes.mjs';

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_IMPORT).href);
const base = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:8787';
const routes = [...new Set([
  '/', '/login', '/account', '/pricing',
  ...navEntries(process.cwd()).flatMap(({ key, slugs }) => [
    `/${key}`,
    ...slugs.map(slug => `/${key}/${slug}`),
  ]),
])].sort();
const reportDir = 'audit-browser-results';
await mkdir(reportDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const results = [];
let index = 0;
const workerCount = 3;
const failurePhrases = [
  "This page couldn't load",
  'This page could not be loaded',
  'A server error occurred',
  'Application error: a server-side exception',
  'Application error: a client-side exception',
];

async function testRoute(context, route) {
  const page = await context.newPage();
  const uncaught = [];
  const errors = [];
  page.on('pageerror', err => uncaught.push(err.stack?.slice(0,900) || err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().slice(0,450));
  });
  let status=0, title='', badText='', ready=false;
  try {
    const response=await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 25000 });
    status=response?.status() ?? 0;
    const productEntry = ['/reach','/crm','/people','/hire','/finance'].includes(route);
    if (productEntry) {
      await page.waitForURL(url => new URL(url).pathname !== route, { timeout: 12000 }).catch(()=>{});
    }
    await page.waitForTimeout(550);
    title=await page.title();
    const body=await page.locator('body').innerText({ timeout: 10000 });
    badText=failurePhrases.find(phrase => body.includes(phrase)) || '';
    ready=body.trim().length > 25;
    const ok=status===200 && !badText && ready && uncaught.length===0;
    if (!ok) await page.screenshot({path:`${reportDir}/fail-${route.replace(/[^a-z0-9]+/gi,'_').slice(0,65)}.png`, fullPage: false }).catch(()=>{});
    return {route,status,ok,title,badText,ready,uncaught,consoleErrors:errors.slice(0,4)};
  } catch (e) {
    await page.screenshot({path:`${reportDir}/fail-${route.replace(/[^a-z0-9]+/gi,'_').slice(0,65)}.png`, fullPage: false }).catch(()=>{});
    return {route,status,ok:false,title,badText,ready,uncaught,consoleErrors:errors.slice(0,4),exception:String(e).slice(0,700)};
  } finally { await page.close(); }
}

const contexts = await Promise.all(Array.from({length:workerCount}, () =>
  browser.newContext({viewport:{width:1366,height:768},deviceScaleFactor:1})));
await Promise.all(contexts.map(async (context) => {
  while(index<routes.length) {
    const route=routes[index++];
    const result=await testRoute(context, route);
    results.push(result);
    console.log(`${result.ok?'PASS':'FAIL'} ${result.status} ${result.route}${result.badText?' — '+result.badText:''}${result.uncaught.length?' — JS '+result.uncaught[0].slice(0,120):''}`);
  }
}));
await Promise.all(contexts.map(context=>context.close()));
await browser.close();
results.sort((a,b)=>a.route.localeCompare(b.route));
const failed=results.filter(r=>!r.ok);
await writeFile(`${reportDir}/report.json`,JSON.stringify({count:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
console.log(`BROWSER AUDIT: ${results.length-failed.length}/${results.length} passed, ${failed.length} failed`);
for (const r of failed) console.log('FAIL_DETAIL '+JSON.stringify(r));
if(failed.length) process.exitCode=1;
