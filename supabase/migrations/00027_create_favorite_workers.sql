-- Favorite Workers: clients can save workers for quick access
CREATE TABLE favorite_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, worker_id)
);

CREATE INDEX idx_favorite_workers_client ON favorite_workers(client_id);

ALTER TABLE favorite_workers ENABLE ROW LEVEL SECURITY;

-- Clients can view their own favorites
CREATE POLICY "Clients can view own favorites"
  ON favorite_workers FOR SELECT
  USING (auth.uid() = client_id);

-- Clients can add favorites
CREATE POLICY "Clients can add favorites"
  ON favorite_workers FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Clients can remove own favorites
CREATE POLICY "Clients can delete own favorites"
  ON favorite_workers FOR DELETE
  USING (auth.uid() = client_id);
