-- ============================================
-- VoltSupply - Migration 003
-- Marketplace profile depth
-- ============================================
-- A marketplace is only credible if a supplier card can answer the questions a
-- buyer actually asks before contacting anyone: what do they sell, how long
-- have they been trading, how fast do they reply, and has anyone vouched for
-- them. None of that was expressible in the schema, so every listing rendered
-- as a bare name and a city.

ALTER TABLE users ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating NUMERIC(2, 1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_in_business INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS response_hours INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Enquiries carry a category so leads can be filtered and illustrated the way
-- a buyer thinks about them, rather than as an undifferentiated list.
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_users_category ON users(category);
CREATE INDEX IF NOT EXISTS idx_enquiries_category ON enquiries(category);
