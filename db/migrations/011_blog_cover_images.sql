-- Blog cover imagery, optional and fully backward compatible.
ALTER TABLE public.wu_blog_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.wu_blog_posts ADD COLUMN IF NOT EXISTS cover_image_alt VARCHAR(220) NOT NULL DEFAULT '';
-- Empty cover is allowed for older drafts; public pages use a reviewed local fallback.
ALTER TABLE public.wu_blog_posts
  DROP CONSTRAINT IF EXISTS wu_blog_cover_url_length;
ALTER TABLE public.wu_blog_posts
  ADD CONSTRAINT wu_blog_cover_url_length CHECK(cover_image_url IS NULL OR length(cover_image_url)<=1200);
