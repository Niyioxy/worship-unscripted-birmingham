# Blog images: Phase 1 (cover images)
The Blog Manager now supports editorial cover images. Each article may select one of the approved site-hosted assets or enter a licensed HTTPS image URL, along with meaningful image alternative text.

## Existing assets
- `/intimate-studio-gathering.svg` — generic worship-studio illustration, default cover.
- `/adeniyi-owolabi-portrait.jpg.png` — only suitable for articles about the founder, with truthful descriptive alternative text.

A default cover prevents blank image slots on older posts, but **reusing one image is not a substitute for choosing a relevant, distinctive image for each article**. Before publication, check subject relevance, image authenticity, licensing, accessibility and file quality. Do not suggest that an illustration is a photograph of a past Worship Unscripted event.

## Required one-time database step
Run `db/migrations/011_blog_cover_images.sql` against the same Neon **Preview** database used for the Blog Manager, after checking the intended database branch. This adds `cover_image_url` and `cover_image_alt`. Production must not be released until the migration has also been deliberately applied to its target database.

The migration is additive and preserves existing articles. Until run, the new editor may report a database error when loading articles, because it requests the two new fields.

## Managing covers
1. Open `/blog-admin`, sign in and choose an unpublished draft.
2. In **Article cover image**, choose an approved image or paste a properly licensed **direct HTTPS** image URL.
3. Enter descriptive alt text explaining what is actually shown. The first-party default is used when no cover is selected.
4. Review the image preview. Save your draft. Publishing still requires your explicit action.
5. Existing published posts must be **unpublished before editing** under the current editorial workflow. Be mindful that unpublishing temporarily removes the article from the public listing and search access.
6. Covers appear on blog listing cards, article pages, and in social Open Graph/Twitter metadata.

## Future phase
Optional direct file upload to managed object storage and a larger licensed/original image library are not included yet. Do not paste copyright-infringing URLs or third-party tracking pixels. Unsanctioned hotlinking may violate provider terms. An AI-generated image workflow would need explicit image-generation implementation and storage and should be reviewed for accuracy and permissions. External URLs are rendered by readers' browsers and may leak request metadata to that host.

This feature is independent of the text-generation API and does not automatically invent, fetch or attach AI images.
