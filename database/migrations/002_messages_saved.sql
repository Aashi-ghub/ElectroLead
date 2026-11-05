-- ============================================
-- VoltSupply - Migration 002
-- Messaging + saved contacts
-- ============================================
-- Both features are scoped to an existing quote relationship: a buyer and a
-- seller may only talk to (or save) each other once that seller has quoted on
-- that buyer's enquiry. That keeps the marketplace from becoming a directory
-- that either side can scrape for contacts without ever transacting.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 7. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_no_self CHECK (sender_id <> recipient_id)
);

-- Thread lookup: every read is keyed by (enquiry, the two participants).
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(enquiry_id, sender_id, recipient_id, created_at DESC);
-- Unread badge: counts are always "addressed to me and not yet read".
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_id, read_at);
CREATE INDEX IF NOT EXISTS idx_messages_enquiry_id ON messages(enquiry_id);

-- ============================================
-- 8. SAVED_CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, contact_id),
    CONSTRAINT saved_contacts_no_self CHECK (owner_id <> contact_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_contacts_owner_id ON saved_contacts(owner_id);
