-- ============================================================================
-- Worker Referral System
-- Workers earn R2 when someone they referred gets their first 5-star review
-- ============================================================================

-- 1. Add referral_code column to worker_profiles
ALTER TABLE worker_profiles ADD COLUMN referral_code TEXT UNIQUE;

CREATE UNIQUE INDEX idx_worker_profiles_referral_code ON worker_profiles(referral_code);

-- 2. Create referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code_used TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'paid')),
  reward_amount NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  qualified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_worker_profile_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(status) WHERE status = 'pending';

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Workers can view referrals where they are the referrer
CREATE POLICY "Workers can view own referrals" ON referrals
  FOR SELECT USING (
    referrer_worker_profile_id IN (
      SELECT id FROM worker_profiles WHERE user_id = auth.uid()
    )
  );

-- Only service role (API) can insert referrals
CREATE POLICY "Service role can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

-- 3. Auto-generate referral codes on worker_profiles INSERT
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  worker_name TEXT;
  prefix TEXT;
  new_code TEXT;
  attempts INTEGER := 0;
BEGIN
  -- Get the worker's name from profiles
  SELECT UPPER(LEFT(REGEXP_REPLACE(p.full_name, '[^a-zA-Z]', '', 'g'), 3))
  INTO prefix
  FROM profiles p
  WHERE p.id = NEW.user_id;

  -- Fallback if name is too short or missing
  IF prefix IS NULL OR LENGTH(prefix) < 3 THEN
    prefix := 'DQW';
  END IF;

  -- Try to generate a unique code (up to 5 attempts)
  LOOP
    new_code := prefix || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    BEGIN
      NEW.referral_code := new_code;
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts >= 5 THEN
        -- Use a longer random suffix as fallback
        NEW.referral_code := prefix || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
        RETURN NEW;
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER generate_worker_referral_code
  BEFORE INSERT ON worker_profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION generate_referral_code();

-- 4. Backfill existing workers with referral codes
DO $$
DECLARE
  wp RECORD;
  prefix TEXT;
  new_code TEXT;
  attempts INTEGER;
BEGIN
  FOR wp IN SELECT w.id, w.user_id FROM worker_profiles w WHERE w.referral_code IS NULL LOOP
    SELECT UPPER(LEFT(REGEXP_REPLACE(p.full_name, '[^a-zA-Z]', '', 'g'), 3))
    INTO prefix
    FROM profiles p
    WHERE p.id = wp.user_id;

    IF prefix IS NULL OR LENGTH(prefix) < 3 THEN
      prefix := 'DQW';
    END IF;

    attempts := 0;
    LOOP
      new_code := prefix || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      BEGIN
        UPDATE worker_profiles SET referral_code = new_code WHERE id = wp.id;
        EXIT; -- success
      EXCEPTION WHEN unique_violation THEN
        attempts := attempts + 1;
        IF attempts >= 5 THEN
          new_code := prefix || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
          UPDATE worker_profiles SET referral_code = new_code WHERE id = wp.id;
          EXIT;
        END IF;
      END;
    END LOOP;
  END LOOP;
END $$;

-- 5. Qualification trigger: when a referred worker gets their first 5-star review
CREATE OR REPLACE FUNCTION qualify_referral_on_review()
RETURNS TRIGGER AS $$
DECLARE
  referral_row RECORD;
  referrer_user_id UUID;
BEGIN
  -- Only trigger on 5-star reviews
  IF NEW.overall_rating <> 5 THEN
    RETURN NEW;
  END IF;

  -- Check if the reviewed worker (reviewee) has a pending referral
  SELECT r.id, r.referrer_worker_profile_id, r.reward_amount
  INTO referral_row
  FROM referrals r
  JOIN worker_profiles wp ON wp.user_id = NEW.reviewee_id
  WHERE r.referred_user_id = NEW.reviewee_id
    AND r.status = 'pending'
  LIMIT 1;

  IF referral_row IS NOT NULL THEN
    -- Qualify the referral
    UPDATE referrals
    SET status = 'qualified', qualified_at = now()
    WHERE id = referral_row.id;

    -- Get the referrer's user_id for the notification
    SELECT wp.user_id INTO referrer_user_id
    FROM worker_profiles wp
    WHERE wp.id = referral_row.referrer_worker_profile_id;

    -- Create notification for referrer
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        referrer_user_id,
        'referral',
        'Referral Reward Earned!',
        'Your referral earned you R' || referral_row.reward_amount || '! Great job spreading the word.',
        jsonb_build_object('referral_id', referral_row.id, 'amount', referral_row.reward_amount)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_qualify_referral
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION qualify_referral_on_review();
