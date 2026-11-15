# Worship Unscripted Birmingham — Self-Service Blog Manager

## Goal
Let the site owner manage worship articles from a browser, without GitHub edits, AI Gateway, JUDAH, or future code deploys for each article.

**Editor URL (after deployment):** `https://worship-unscripted-birmingham.vercel.app/blog-admin`

The existing public article, **Why Worship Unscripted Birmingham Exists**, is imported and editable through a one-time database seed. Other articles can be created, saved as private drafts, previewed, published, unpublished, and archived. Public pages update from Neon at request time.

## Implementation
- `/blog-admin`: password-protected text editor and post list, noindex
- `/api/blog-admin/session`: server-side credential verification, signed HttpOnly/Secure/SameSite session cookie with six-hour expiry, Neon-backed login attempt throttling
- `/api/blog-admin/posts`: authenticated create, edit drafts, publish, unpublish, archive
- `/blog`: original launch article plus newly published articles, with no duplicates
- `/blog/[slug]`: published new articles with canonical URLs, titles and descriptions
- `/blog/why-worship-unscripted-birmingham-exists`: first article reads managed record when CMS enabled, preserves original static fallback until database import
- `/sitemap.xml`: includes newly published CMS articles dynamically
- Blog posts are plain text with `## ` headings, rendered as text (not raw HTML). This prevents injected HTML/script execution.
- No access to attendee registration tables from Blog Manager; avoids mixing participant data and editorial data.
- Blog CMS has no AI dependency, no direct email sending, and no public registration dependency.

## Database
Apply the following migrations against the intended Neon database in sequence (test in Preview/Neon branch first):
1. `db/migrations/008_self_service_blog.sql`: creates `wu_blog_posts` and `wu_blog_login_limits`
2. `db/migrations/009_seed_first_blog_article.sql`: safely imports the initial article as a published editable post, never overwriting existing blog edits

**Important:** The blog manager needs production `DATABASE_URL` only when explicitly deployed and approved. Avoid adding sensitive attendee registration data to content tables. Before a production migration, confirm the exact target database and take a backup or Neon restore point.

## Editor authentication
Store these in Vercel project Environment Variables scoped to **Production** only after production launch approval, and to **Preview** for the isolated test branch:
- `DATABASE_URL`: Neon database connection string (server-side)
- `BLOG_ADMIN_PASSWORD_HASH`: `<hex-salt>:<hex-scrypt-hash>`, as described below
- `BLOG_SESSION_SECRET`: new random string of at least 32 characters
- `BLOG_CMS_ENABLED`: `true` to enable public rendering of database articles

No credentials or keys should be committed to GitHub, sent in chat or exposed to the browser. These credentials are **separate** from JUDAH admin and its broken AI Gateway configuration.

### Generate a local editor password hash
Run from a trusted computer with Node.js installed. In PowerShell:

```powershell
$env:BLOG_EDITOR_PASSWORD = Read-Host "Choose a new Blog Manager password (at least 12 characters)"
node -e "const c=require('node:crypto');const p=process.env.BLOG_EDITOR_PASSWORD||'';if(p.length<12)throw Error('Use 12+ characters');const s=c.randomBytes(32);process.stdout.write(s.toString('hex')+':'+c.scryptSync(p,s,64).toString('hex'))"
Remove-Item Env:BLOG_EDITOR_PASSWORD
```

Copy the resulting **hash only** into `BLOG_ADMIN_PASSWORD_HASH` in Vercel. Do not send the password or hash in public posts. The cleartext password stays with the editor.

Generate a separate session secret with:
```powershell
$bytes = [byte[]]::new(48)
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```
Paste the secret securely into Vercel as `BLOG_SESSION_SECRET`.

### Activation workflow
1. Review changes on `feature/self-service-blog-manager`. Run TypeScript and Next.js build checks.
2. Apply migrations 008 and 009 to a separate Preview Neon branch and configure Preview variables for the same Git branch.
3. Test login, failed-attempt lockout, first article edit, new draft, preview, publish and unpublish; check sitemap and SEO metadata.
4. Deploy an isolated public-site release preserving homepage, Phase 4 SEO, registration-closed rules and original content.
5. Confirm production Neon database/restore point, run migrations once, and configure Production variables. Redeploy with latest settings.
6. Verify production blog-admin and public article URLs, especially mobile and sign-out.
7. Do **not** enable `BLOG_CMS_ENABLED=true` before migration 009 and release verification; the static first article remains visible while the flag is off.

## Practical usage
1. Visit `/blog-admin`, enter the separate Blog Manager password.
2. Select **New**. Write a title, URL slug, excerpt and body. Use blank lines for paragraphs; lines beginning with `## ` become section headings.
3. Select **Preview**, then **Save draft**. Review the saved draft; click **Publish saved draft** when ready.
4. To edit a published post, select **Unpublish**, edit and save, then publish again. This temporarily removes its public URL, so use for substantive updates only.
5. To edit the original introductory article, use the entry seeded by migration 009. Its existing public slug is preserved.
6. Never put participant details, unconfirmed gathering dates, promises of bookings, or sensitive information in articles.

## Limitations
- Plain-text editor, not a rich-text WYSIWYG or media upload system.
- Simple password-based single-editor access; no multi-user roles, password reset email, SSO, image library, or scheduled publication.
- URL slugs should remain stable for SEO. Redirect management is not yet included.
- Publishing is immediate once configured and approved.
- Does not add a public editor navigation link, to avoid confusing ordinary visitors.
- Production deploy requires appropriate Vercel permission; a passing GitHub check or Preview does not mean production is published.

## Preview redeploy after configuration
On 15 November 2026 the project owner confirmed migration 008 and 009, plus all four required Vercel Preview environment variables. This documentation-only commit triggers a fresh Git-connected Preview build to read the updated environment. No secret values are stored here, and Production is untouched. Verify the editor sign-in and post workflow before enabling the CMS in Production.

## Optional AI Writing Assistant (direct OpenAI API, not Vercel AI Gateway)
The editor now contains a separate AI Writing Assistant. It can draft a new worship article from a topic, improve a draft, expand, shorten, or suggest SEO-friendly revisions. The editor reviews the suggested text before selecting **Use this draft in editor**, then saves or publishes it manually. AI never publishes automatically, never changes an article without explicit editorial action, and cannot edit a currently published or archived article.

To enable the AI feature on the `feature/self-service-blog-manager` **Preview** branch:
1. Apply `db/migrations/010_blog_ai_usage.sql` to the **same Neon Preview database** as migrations 008 and 009 (adds an AI request counter only).
2. Create an OpenAI Platform API key at https://platform.openai.com/api-keys under an account with separately configured API billing. A ChatGPT subscription does not automatically provide API billing.
3. In Vercel project environment variables, add `BLOG_OPENAI_API_KEY` with the new secret key, target **Preview**, restricted to `feature/self-service-blog-manager`. Never paste this key in chat, GitHub or screenshots.
4. Optional: set `BLOG_AI_MODEL` to an accessible text-generation model (default: `gpt-6-luna`). Model availability is account-dependent. Never confuse this variable with `JUDAH_MODEL`.
5. Redeploy the **Preview** of this specific branch, not the live Production site, then sign in at `/blog-admin`.

Safety and limits: writing calls require existing Blog Manager authentication and same-origin protection; the API key stays server-side; AI outputs are plain text, editable and manually approved; API responses are not automatically published. The Neon throttle allows at most 15 AI requests per hour per editor fingerprint. Also set an API usage budget/limits in OpenAI Platform to control spending. The feature does not connect to the previously blocked Vercel AI Gateway and will not work until a valid separately billed key is configured.

Recommended Preview check: draft a short article from a harmless topic, review the suggestion, copy it into a new draft, save, then sign out and confirm it is not visible publicly until manually published. Verify generated biblical references and facts before publication.
