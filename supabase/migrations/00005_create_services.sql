CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_zu TEXT,
  name_xh TEXT,
  name_af TEXT,
  name_st TEXT,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'wrench',
  category TEXT NOT NULL DEFAULT 'general',
  base_rate NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are publicly viewable" ON services FOR SELECT USING (true);

INSERT INTO services (name, icon, category, sort_order) VALUES
  ('Domestic Worker', 'home', 'household', 1),
  ('Gardener', 'flower-2', 'outdoor', 2),
  ('Painter', 'paintbrush', 'construction', 3),
  ('Welder', 'flame', 'construction', 4),
  ('Electrician', 'zap', 'construction', 5),
  ('Plumber', 'droplets', 'construction', 6),
  ('Carpenter', 'hammer', 'construction', 7),
  ('Tiler', 'grid-3x3', 'construction', 8),
  ('Roofer', 'warehouse', 'construction', 9),
  ('Pool Cleaner', 'waves', 'outdoor', 10),
  ('Pest Control', 'bug', 'household', 11),
  ('Window Cleaner', 'sparkles', 'household', 12),
  ('Handyman', 'wrench', 'general', 13),
  ('Babysitter', 'baby', 'household', 14),
  ('Dog Walker', 'dog', 'outdoor', 15),
  ('Security Guard', 'shield', 'general', 16);
