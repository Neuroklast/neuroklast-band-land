# Search discovery and mobile performance

## Crawler access
- Search engines, AI search/answer agents and link-preview clients are welcome.
- `public/robots.txt` excludes account, checkout, admin and API routes from cooperative crawlers.
- `lib/crawler-blocklist.ts` only filters explicit automated scanner signatures, **not** GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, Googlebot or SEO crawlers.
- User-Agent is trivially spoofed and MUST NOT be treated as an access-control or abuse-prevention boundary. Keep authentication, rate limits and Vercel attack protection enabled.
- Check Vercel WAF / bot rules independently: route-level application allowlisting cannot override an upstream block.

## SEO baseline
- Root metadata describes real genres, releases, live gigs and audio software without speculative keyword stuffing.
- Canonical hostname: `https://neuroklast.net`.
- Product pages, news, events and legal pages have individual metadata.
- Dynamic sitemap includes public plugins, published soundpack pages, releases index, event pages and published news.
- Sitemap lastmod appears only where the underlying content actually has a meaningful modification date.
- `/llms.txt` provides optional machine-readable links; this is **not** a ranking mechanism.

## Mobile and animation
- Decorative canvas layers mount when the browser is idle, never on the critical first paint.
- Background images use low request priority and reduced mobile raster dimensions; hero assets keep priority.
- StarField shares the canvas frame budget and pauses when hidden. Scroll throttling is active.
- Reduced-motion users never start the expensive canvases.

## Measurable budgets
Workflow: `.github/workflows/lighthouse.yml` on pull requests.
Runs a Pixel 7 browser smoke audit (public routes, horizontal overflow and reduced motion), then **mobile Lighthouse on the built local app**, not a public production deployment, with 2 samples each for homepage, plugins and releases.

Initial hard caps:
- LCP <= 5500 ms (lab simulated mobile)
- CLS <= 0.15
- Script transfer <= 900 KB
- Total transfer <= 3500 KB
- SEO score >= 0.90
Warnings: performance score < 0.65, TBT > 950 ms.

Outputs are retained as workflow artifacts. Tighten caps after reviewing actual run metrics, rather than claiming improvement from implementation alone. These lab numbers are not Google Search Console field CWV and do not establish real-user INP.

## Manual production verification
1. Compare `curl -I -A 'ChatGPT-User/1.0' https://neuroklast.net/` and OAI-SearchBot, Googlebot, PerplexityBot responses after deploy.
2. Confirm `/robots.txt`, `/sitemap.xml`, `/llms.txt`, canonical URLs and all product route status codes.
3. Use Search Console indexing and rich results tests on public release, news, gig and plugin pages.
4. Measure actual mobile visitors with real-user Web Vitals, including INP, and compare mobile Lighthouse before/after with identical settings.
5. Test mobile width 360px, 390px, 768px; reduced motion; save-data; keyboard navigation; background video; and layout shifts.

No Lighthouse score is claimed until the workflow actually runs. Backend/third-party failures should be fixed, not papered over by lowering assertions.
