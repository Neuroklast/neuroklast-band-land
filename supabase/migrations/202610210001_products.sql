-- Editorial products for the public Products section (CMS + homepage).
-- Visibility of the section itself lives in site_config.sections id = products.

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_storage_path text,
  image_url text,
  href text,
  price_label text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  image_content_hash text
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Public read products') THEN
    EXECUTE 'CREATE POLICY "Public read products" ON public.products FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Admin all products') THEN
    EXECUTE $p$CREATE POLICY "Admin all products" ON public.products USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;
