-- NexusFlow Database Schema
-- This file contains the complete database schema for the NexusFlow application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table - Core user profiles
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    connected_networks TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{
        "notifications": true,
        "autoSync": true,
        "theme": "dark"
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Network connections table - OAuth tokens and connection status
CREATE TABLE network_connections (
    connection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    network_type TEXT NOT NULL,
    api_token TEXT NOT NULL, -- Encrypted API tokens/credentials
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    connection_metadata JSONB DEFAULT '{}', -- Store network-specific data (FID, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, network_type)
);

-- Messages table - Unified message storage across all networks
CREATE TABLE messages (
    message_id TEXT PRIMARY KEY, -- Network-specific message ID
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    network TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    thread_id TEXT,
    is_read BOOLEAN DEFAULT false,
    type TEXT NOT NULL CHECK (type IN ('incoming', 'outgoing')),
    metadata JSONB DEFAULT '{}', -- Store network-specific metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table - Discovered contacts across networks
CREATE TABLE contacts (
    contact_id TEXT NOT NULL, -- Network-specific contact ID
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    network TEXT NOT NULL,
    profile_url TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    followers INTEGER,
    contact_metadata JSONB DEFAULT '{}', -- Store additional contact data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (contact_id, user_id, network)
);

-- Search history table - Track user searches for AI improvements
CREATE TABLE search_history (
    search_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    networks TEXT[] DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    ai_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message forwarding rules - Cross-network bridging configuration
CREATE TABLE forwarding_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    source_network TEXT NOT NULL,
    target_network TEXT NOT NULL,
    conditions JSONB DEFAULT '{}', -- Filtering conditions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log - Track user interactions for analytics
CREATE TABLE user_activity (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'search', 'message_read', 'contact_view', etc.
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_user_timestamp ON messages(user_id, timestamp DESC);
CREATE INDEX idx_messages_network ON messages(network);
CREATE INDEX idx_messages_unread ON messages(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_thread ON messages(thread_id) WHERE thread_id IS NOT NULL;

CREATE INDEX idx_contacts_user_network ON contacts(user_id, network);
CREATE INDEX idx_contacts_display_name ON contacts(display_name);

CREATE INDEX idx_network_connections_user ON network_connections(user_id);
CREATE INDEX idx_network_connections_active ON network_connections(user_id, is_active) WHERE is_active = true;

CREATE INDEX idx_search_history_user ON search_history(user_id, created_at DESC);

CREATE INDEX idx_user_activity_user_type ON user_activity(user_id, activity_type, created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE forwarding_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Network connections policies
CREATE POLICY "Users can manage own connections" ON network_connections
    FOR ALL USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id::text));

-- Messages policies
CREATE POLICY "Users can access own messages" ON messages
    FOR ALL USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id::text));

-- Contacts policies
CREATE POLICY "Users can manage own contacts" ON contacts
    FOR ALL USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id::text));

-- Search history policies
CREATE POLICY "Users can access own search history" ON search_history
    FOR ALL USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id::text));

-- Forwarding rules policies
CREATE POLICY "Users can manage own forwarding rules" ON forwarding_rules
    FOR ALL USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id::text));

-- User activity policies
CREATE POLICY "Users can access own activity" ON user_activity
    FOR ALL USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id::text));

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_connections_updated_at BEFORE UPDATE ON network_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forwarding_rules_updated_at BEFORE UPDATE ON forwarding_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_messages', (SELECT COUNT(*) FROM messages WHERE user_id = p_user_id),
        'unread_messages', (SELECT COUNT(*) FROM messages WHERE user_id = p_user_id AND is_read = false),
        'total_contacts', (SELECT COUNT(*) FROM contacts WHERE user_id = p_user_id),
        'connected_networks', (SELECT COUNT(*) FROM network_connections WHERE user_id = p_user_id AND is_active = true),
        'recent_activity', (
            SELECT json_agg(
                json_build_object(
                    'type', activity_type,
                    'data', activity_data,
                    'timestamp', created_at
                )
            )
            FROM (
                SELECT activity_type, activity_data, created_at
                FROM user_activity
                WHERE user_id = p_user_id
                ORDER BY created_at DESC
                LIMIT 10
            ) recent
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete search history older than 90 days
    DELETE FROM search_history WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete user activity older than 180 days
    DELETE FROM user_activity WHERE created_at < NOW() - INTERVAL '180 days';
    
    -- Delete read messages older than 1 year
    DELETE FROM messages 
    WHERE created_at < NOW() - INTERVAL '1 year' 
    AND is_read = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');

-- Insert some initial data for supported networks
INSERT INTO public.users (user_id, wallet_address, display_name) VALUES
    ('00000000-0000-0000-0000-000000000001', '0x0000000000000000000000000000000000000000', 'Demo User')
ON CONFLICT (wallet_address) DO NOTHING;
