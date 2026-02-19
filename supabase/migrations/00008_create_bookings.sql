CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  worker_id UUID NOT NULL REFERENCES profiles(id),
  service_id UUID NOT NULL REFERENCES services(id),
  status booking_status NOT NULL DEFAULT 'pending',
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  address TEXT,
  suburb TEXT,
  instructions TEXT,
  total_amount NUMERIC(10,2),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule JSONB,
  parent_booking_id UUID REFERENCES bookings(id),
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = client_id OR auth.uid() = worker_id);
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Booking participants can update" ON bookings FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = worker_id);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
