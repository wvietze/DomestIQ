-- Migration 00031: Add review traits and review requests
-- Adds trait-based review system for structured quality metrics

-- Add traits column to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS traits TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_reviews_traits ON reviews USING GIN (traits);

-- Review requests table (worker requests review from client)
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(booking_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_review_requests_client
  ON review_requests(client_id) WHERE status = 'pending';

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can create review requests"
  ON review_requests FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Users can view their own review requests"
  ON review_requests FOR SELECT
  USING (auth.uid() = worker_id OR auth.uid() = client_id);

CREATE POLICY "Workers can update their own review requests"
  ON review_requests FOR UPDATE
  USING (auth.uid() = worker_id OR auth.uid() = client_id);

-- Add top_traits to worker_profiles for aggregated trait data
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS top_traits JSONB DEFAULT '{}';

-- Trigger function: aggregate top 6 traits into worker_profiles
CREATE OR REPLACE FUNCTION update_worker_top_traits()
RETURNS TRIGGER AS $$
DECLARE
  worker UUID;
  trait_counts JSONB;
BEGIN
  worker := COALESCE(NEW.reviewee_id, OLD.reviewee_id);

  SELECT jsonb_object_agg(trait, cnt)
  INTO trait_counts
  FROM (
    SELECT unnest(traits) AS trait, COUNT(*) AS cnt
    FROM reviews
    WHERE reviewee_id = worker AND traits IS NOT NULL AND array_length(traits, 1) > 0
    GROUP BY trait
    ORDER BY cnt DESC
    LIMIT 6
  ) AS top;

  UPDATE worker_profiles
  SET top_traits = COALESCE(trait_counts, '{}'::jsonb)
  WHERE user_id = worker;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_worker_top_traits ON reviews;
CREATE TRIGGER trg_update_worker_top_traits
  AFTER INSERT OR UPDATE OF traits OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_worker_top_traits();
