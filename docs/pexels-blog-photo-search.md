# Pexels photo search: Blog Manager integration

## What editors can do
Sign in at `/blog-admin`, open an unpublished draft, and find **Article cover image → Find matching photographs on Pexels**. Search a topic, review 12 landscape photographs, open the photographer's Pexels page and select one. Selection fills cover URL, image alt text, source URL and photographer credit, but **does not save or publish the post**. Click Save draft after review.

## Source, licensing and accuracy
Pexels provides searchable pre-made photos via its API: https://www.pexels.com/api/documentation/. Their general photo licence permits blog use; see https://www.pexels.com/legal-pages/license. The app displays photographer/source credit on the article page and a Pexels link in the editor. Follow applicable API terms; do not crawl or harvest the library in bulk. Do not claim a stock photo depicts an actual Worship Unscripted Birmingham event or any real participant. Review model/property releases and avoid implying an endorsement of faith by people in a stock photo.

## Setup on the Preview branch
1. Run `db/migrations/011_blog_cover_images.sql` if not already applied. This adds cover image URL/alt text fields.
2. Run `db/migrations/012_pexels_photo_credits.sql` in the *same Neon Preview database*. This adds credit/source fields and is additive.
3. Create a Pexels API key using https://www.pexels.com/api/ and the account approval process. Pexels may enforce rate limits.
4. In the Vercel project Settings → Environment Variables, create secret `PEXELS_API_KEY`, target **Preview**, Git branch `feature/self-service-blog-manager`. Do not paste keys in chat, commit them, or expose them to the browser.
5. Redeploy the Preview branch (not Production), open Blog Manager, select New → Find photos and test the Pexels results with a descriptive query such as "Christian worship choir".
6. Choose an appropriate photo, review alt text/source, save a draft and preview. Verify article/card rendering and that attribution links work. Existing posts with no cover use the site's built-in fallback.
7. After successful tests, apply both migrations to the **appropriate Production Neon database** with a restore point and explicitly release the approved branch. Do not accidentally replace Production with unrelated JUDAH code.

## Implementation
- `app/api/blog-admin/photos/route.ts` is authenticated, server-side search with no public API key exposure. The query is limited to 100 characters, 12 results per page, and up to five pages.
- `app/blog-admin/page.tsx` provides photo search, thumbnail results, photographer links and a select action.
- `app/api/blog-admin/posts/route.ts` saves and validates photo URL, alt text, credit and source.
- `app/blog/[slug]/page.tsx` and the first article's page display attribution when provided.
- Existing cover choices and manual HTTPS covers remain supported.

## Limitations
The integration searches stock photos; it does not generate original images or guarantee that photos accurately match a theological theme. Pexels images are externally hosted rather than copied into site storage, and may be removed or change. Optional future upgrade: persistent approved image library, media uploads, cropping, more intelligent search queries and tracked image selection metrics.
