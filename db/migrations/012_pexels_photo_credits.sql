-- Run after migration 011. Store visible attribution for Pexels photos.
ALTER TABLE public.wu_blog_posts ADD COLUMN IF NOT EXISTS cover_photo_credit VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE public.wu_blog_posts ADD COLUMN IF NOT EXISTS cover_photo_source TEXT;
ALTER TABLE public.wu_blog_posts DROP CONSTRAINT IF EXISTS wu_blog_source_url_length;
ALTER TABLE public.wu_blog_posts ADD CONSTRAINT wu_blog_source_url_length CHECK(cover_photo_source IS NULL OR length(cover_photo_source)<=1200);
