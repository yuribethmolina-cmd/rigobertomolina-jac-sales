ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_photo_url_len CHECK (photo_url IS NULL OR char_length(photo_url) <= 500);