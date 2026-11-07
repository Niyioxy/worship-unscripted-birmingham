# Worship Unscripted Birmingham — SEO launch plan

Updated: 7 November 2026. Status: technical foundation on Preview; not deployed to Production.

## Primary search intent
Target prospective worshippers in Birmingham seeking intimate, Christian, interdenominational gatherings. Use natural phrasing and avoid keyword stuffing. **No venue/date has been confirmed**; do not publish fabricated event dates or address.

### Core phrases
- worship night Birmingham
- Christian worship gathering Birmingham
- interdenominational worship Birmingham
- live worship Birmingham
- prayer and worship Birmingham
- gospel worship Birmingham
- Christian fellowship Birmingham
- worship team Birmingham (volunteers/musicians)

These are **candidate phrases**, not verified traffic or competition estimates. Validate with Google Search Console and keyword research after publication.

## Content map
| Page | Topic | Visitor intent |
| --- | --- | --- |
| / | Worship Unscripted Birmingham / independent Christian worship | Brand and discovery |
| /vision | Christian worship vision / interdenominational | Learn values |
| /experience | What to expect at a worship gathering | Decide whether to attend |
| /our-story | Founder and story | Build trust |
| /get-involved | Worship team, singers, musicians, volunteering | Participate |
| /community | Christian community and fellowship | Belonging |
| /gatherings | Birmingham worship nights | Find upcoming opportunities |
| /contact | Contact organisers | Ask a question |

## Technical SEO completed on Preview
- Root metadata with title, description, UK locale, preferred canonical domain, Open Graph and Twitter image.
- Individual page descriptions, titles, canonical tags and Open Graph URLs.
- Dynamic OG image and branded favicon.
- `/sitemap.xml` listing eight public pages, excluding admin, closed registration and draft privacy information.
- `/robots.txt` allowing production pages and blocking Preview bots.
- Admin, closed registration and unfinished privacy pages have `noindex`.
- JSON-LD Organization information representing an independent local worship programme, **without** a made-up street address, event date, rating or booking status.

## Production verification (not yet done)
1. Review and approve the SEO code changes on branch `feature/complete-site-before-release`.
2. Deploy to production **only after explicit approval**.
3. Open `https://worship-unscripted-birmingham.vercel.app/robots.txt` and `/sitemap.xml`, inspect response codes and sitemap URLs.
4. Inspect each page's HTML meta title, description, canonical and indexing directives.
5. Check `/opengraph-image` renders as an actual 1200x630 image and verify its preview in social link tools.
6. Validate Organization JSON-LD in Google Rich Results Test and Schema Markup Validator.
7. Confirm page accessibility on mobile, alt text, keyboard access and Core Web Vitals (Lighthouse/PageSpeed).
8. Verify domain property in Google Search Console using domain DNS record or a valid verification method. This requires the site owner's Google account action.
9. Submit sitemap in Search Console and monitor Pages / Indexing and Performance reports. Allow for normal search indexing delays.
10. Set up Bing Webmaster Tools after production is approved.
11. Publish original, accurate gathering details and real photography when venue and date are confirmed. Only then add Event structured data with verified properties.
12. Once registration is legally approved and made available, revise the registration page's noindex and content to match actual service availability.

## Content priorities for the next month
- **Week 1:** Review homepage content for clear Birmingham location, audience, mission and honest CTA while registration is closed.
- **Week 2:** Build a detailed FAQ on /experience about format, accessibility, Christian participation, team size, filming consent and costs; avoid unsupported guarantees.
- **Week 3:** Once confirmed, post the real venue and first event date. Consider one dedicated event page with accurate Event schema, not before confirmation.
- **Week 4:** Earn genuine mentions/links from partner churches, musicians and Birmingham community pages. Only request a business profile if eligibility, staffing and real-world presence meet Google requirements.

## SEO success measures
Search Console impressions and clicks, branded searches, impressions for Birmingham worship-related queries, organic visits to /gatherings and /get-involved, and enquiries originating from search (when compliant tracking is configured). Do not promise rankings.

References: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap and https://nextjs.org/docs/15/app/getting-started/metadata-and-og-images
