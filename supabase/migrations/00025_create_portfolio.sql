-- ============================================================================
-- Worker Portfolio / Work Gallery
-- Workers upload photos of their work to build trust with clients
-- ============================================================================

-- Portfolio images table
CREATE TABLE portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  service_id UUID REFERENCES services(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_worker ON portfolio_images(worker_profile_id, sort_order);

ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

-- Public viewing
CREATE POLICY "Portfolio images are publicly viewable" ON portfolio_images
  FOR SELECT USING (true);

-- Workers manage own portfolio
CREATE POLICY "Workers can insert own portfolio" ON portfolio_images
  FOR INSERT WITH CHECK (
    worker_profile_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can update own portfolio" ON portfolio_images
  FOR UPDATE USING (
    worker_profile_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can delete own portfolio" ON portfolio_images
  FOR DELETE USING (
    worker_profile_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

-- Portfolio storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

-- Workers can upload to their own folder
CREATE POLICY "Workers can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Workers can delete their own
CREATE POLICY "Workers can delete own portfolio images" ON storage.objects
  FOR DELETE USING (bucket_id = 'portfolio' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
