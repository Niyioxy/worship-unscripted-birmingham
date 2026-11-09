# Phase 5 — Organic Search Visibility and Measurement

Started: 9 November 2026
Website: https://worship-unscripted-birmingham.vercel.app/
Status: Tracking framework established; actual Search Console data has not been supplied or verified.

## Source of truth
Use Google Search Console (verified URL-prefix property) for Google Search indexing, queries, search appearances and search traffic. Do not infer impressions, clicks or ranks from public site: searches. A submitted sitemap is not proof of indexing. Use page-specific URL Inspection and the Pages indexing report to confirm status. GSC figures can be delayed or withheld at low volumes.

## Baseline checklist (fill in from Search Console)
- Baseline capture date: pending
- Sitemaps > sitemap.xml: submitted successfully (user confirmed), current crawl status: pending verification
- Indexing > Pages: indexed pages: pending; not indexed pages: pending
- Performance > Search results > Last 28 days (Web): total clicks: pending; impressions: pending; CTR: pending; average position: pending
- Search queries > United Kingdom: branded impressions: pending; non-branded impressions: pending
- Pages > filter /gatherings and /get-involved: clicks/impressions: pending
- Core Web Vitals > Mobile / Desktop: pending
- Manual indexing request status: quota exceeded previously; do not repeatedly submit requests

## Eight public URLs to check
1. /
2. /vision
3. /experience
4. /our-story
5. /get-involved
6. /community
7. /gatherings
8. /contact

The /register, /privacy, /admin and /api routes are not part of the public SEO sitemap. Public registration remains closed.

## Weekly scorecard fields
Week ending | Indexed URLs / 8 | Google clicks | Google impressions | CTR | Average position | Branded impressions | Non-branded impressions | /gatherings impressions | /get-involved impressions | Top query | Search Console indexing blockers | Action taken

Prefer comparing complete weeks or matching date ranges after data is available. CTR = clicks / impressions × 100%, only when impressions > 0. Do not assign zeros where data is missing. Track broad changes in impressions and clicks rather than overreacting to average position shifts.

## Keyword families to monitor (hypotheses, not validated search volumes)
- Branded: Worship Unscripted Birmingham; Worship Unscripted
- Local worship: Christian worship Birmingham; worship night Birmingham; live worship Birmingham
- Community: interdenominational worship Birmingham; Christian fellowship Birmingham
- Participation: worship team Birmingham; Christian music volunteers Birmingham

Search Console > Performance > Search results: select Web, compare last 28 days to previous 28 days after enough data accumulates. Enable Clicks, Impressions, CTR, Position. Review Queries, Pages, Countries and Devices. Filter to United Kingdom when interpreting the local audience. Record observed queries, not just proposed ones.

## Prioritisation and next actions
1. If key URLs are not indexed: inspect reason in Pages, check canonical, robots/noindex and response status. Resolve technical barriers before rewriting content.
2. If impressions grow but clicks remain low: review actual search queries and the matching page title/snippet for intent match. Do not promise rankings.
3. If impressions exist for an irrelevant query: revise page wording naturally, avoiding keyword stuffing.
4. Once event date, venue and accessibility are confirmed: publish factual information and consider Event JSON-LD. Do not publish an invented date, location, booking status or event schema prematurely.
5. Only add visitor analytics or conversion tracking after verifying consent, privacy disclosures and lawful basis. Never expose private registrations or contact details in SEO reports.
6. Review monthly in addition to weekly, and log changes so post-release effects can be distinguished from Google indexing delays.

## How to provide baseline data for analysis
In Google Search Console:
- Performance > Search results > Date: Last 28 days > Search type: Web > Export to CSV or Google Sheets (Queries, Pages, Countries, Devices, Dates).
- Indexing > Pages: provide indexed/not indexed counts and issue categories, or screenshot.
- Sitemaps: share the actual status shown for sitemap.xml.

No live production source changes are required for Phase 5 measurement.
