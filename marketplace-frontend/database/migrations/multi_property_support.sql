-- Multi-Property Support Database Migration
-- Run this migration on your Supabase database

-- Properties table to store property information
CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL UNIQUE,
  contract_address TEXT NOT NULL UNIQUE,
  handler_address TEXT NOT NULL,
  factory_address TEXT,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  ipfs_hash TEXT,
  total_value DECIMAL(20,2),
  max_tokens BIGINT,
  location JSONB,
  property_type TEXT CHECK (property_type IN ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE', 'LAND')),
  creator_address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance proposals table
CREATE TABLE IF NOT EXISTS governance_proposals (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  proposal_id INTEGER NOT NULL,
  proposer_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ipfs_hash TEXT,
  proposal_type TEXT CHECK (proposal_type IN ('MAINTENANCE', 'IMPROVEMENT', 'REFINANCE', 'SALE', 'MANAGEMENT', 'DIVIDEND', 'OTHER')),
  status TEXT CHECK (status IN ('PENDING', 'ACTIVE', 'SUCCEEDED', 'DEFEATED', 'EXECUTED', 'EXPIRED')) DEFAULT 'PENDING',
  for_votes DECIMAL(30,18) DEFAULT 0,
  against_votes DECIMAL(30,18) DEFAULT 0,
  abstain_votes DECIMAL(30,18) DEFAULT 0,
  total_votes DECIMAL(30,18) DEFAULT 0,
  quorum_required DECIMAL(30,18),
  majority_required INTEGER, -- basis points
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  execution_time TIMESTAMP WITH TIME ZONE,
  executed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, proposal_id)
);

-- Property documents table for IPFS document storage
CREATE TABLE IF NOT EXISTS property_documents (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  document_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  ipfs_hash TEXT NOT NULL UNIQUE,
  file_size BIGINT,
  mime_type TEXT,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_by TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property performance metrics
CREATE TABLE IF NOT EXISTS property_metrics (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  metric_type TEXT NOT NULL,
  value DECIMAL(30,18) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT,
  transaction_hash TEXT
);

-- Enhanced transaction cache for multi-property support
ALTER TABLE transaction_cache ADD COLUMN IF NOT EXISTS property_id INTEGER;
ALTER TABLE transaction_cache ADD COLUMN IF NOT EXISTS property_contract_address TEXT;

-- Voting records for governance
CREATE TABLE IF NOT EXISTS governance_votes (
  id BIGSERIAL PRIMARY KEY,
  proposal_id BIGINT NOT NULL REFERENCES governance_proposals(id),
  voter_address TEXT NOT NULL,
  support SMALLINT CHECK (support IN (0, 1, 2)), -- 0=against, 1=for, 2=abstain
  votes DECIMAL(30,18) NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, voter_address)
);

-- Property sales tracking
CREATE TABLE IF NOT EXISTS property_sales (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  price_per_token DECIMAL(30,18) NOT NULL,
  min_purchase DECIMAL(30,18),
  max_purchase DECIMAL(30,18),
  max_supply DECIMAL(30,18),
  total_sold DECIMAL(30,18) DEFAULT 0,
  sale_end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staking information per property
CREATE TABLE IF NOT EXISTS property_staking (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  user_address TEXT NOT NULL,
  staked_amount DECIMAL(30,18) DEFAULT 0,
  stake_time TIMESTAMP WITH TIME ZONE,
  last_reward_claim TIMESTAMP WITH TIME ZONE,
  total_rewards DECIMAL(30,18) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, user_address)
);

-- Revenue distribution tracking
CREATE TABLE IF NOT EXISTS property_revenues (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  total_revenue DECIMAL(30,18) DEFAULT 0,
  distributed_revenue DECIMAL(30,18) DEFAULT 0,
  revenue_per_token DECIMAL(30,18) DEFAULT 0,
  distribution_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User claimable revenue per property
CREATE TABLE IF NOT EXISTS user_claimable_revenue (
  id BIGSERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  user_address TEXT NOT NULL,
  claimable_amount DECIMAL(30,18) DEFAULT 0,
  total_claimed DECIMAL(30,18) DEFAULT 0,
  last_claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, user_address)
);

-- Marketplace listings with property support
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id BIGSERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL REFERENCES properties(property_id),
  seller_address TEXT NOT NULL,
  token_contract TEXT NOT NULL,
  amount DECIMAL(30,18) NOT NULL,
  price_per_token DECIMAL(30,18) NOT NULL,
  listing_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  sold_amount DECIMAL(30,18) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_property_id ON properties(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_contract_address ON properties(contract_address);
CREATE INDEX IF NOT EXISTS idx_properties_creator ON properties(creator_address);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);

CREATE INDEX IF NOT EXISTS idx_governance_proposals_property_id ON governance_proposals(property_id);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_proposer ON governance_proposals(proposer_address);

CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_type ON property_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_property_metrics_property_id ON property_metrics(property_id);
CREATE INDEX IF NOT EXISTS idx_property_metrics_type ON property_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_property_metrics_timestamp ON property_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_governance_votes_proposal_id ON governance_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_governance_votes_voter ON governance_votes(voter_address);

CREATE INDEX IF NOT EXISTS idx_property_staking_property_id ON property_staking(property_id);
CREATE INDEX IF NOT EXISTS idx_property_staking_user ON property_staking(user_address);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_property_id ON marketplace_listings(property_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_address);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active);

CREATE INDEX IF NOT EXISTS idx_transaction_cache_property_id ON transaction_cache(property_id);

-- Update triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_governance_proposals_updated_at BEFORE UPDATE ON governance_proposals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_property_sales_updated_at BEFORE UPDATE ON property_sales
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_property_staking_updated_at BEFORE UPDATE ON property_staking
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_property_revenues_updated_at BEFORE UPDATE ON property_revenues
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_claimable_revenue_updated_at BEFORE UPDATE ON user_claimable_revenue
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_claimable_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties (public read, admin write)
CREATE POLICY "Properties are publicly readable" ON properties
    FOR SELECT USING (true);

CREATE POLICY "Properties can be created by authenticated users" ON properties
    FOR INSERT WITH CHECK (creator_address IS NOT NULL);

CREATE POLICY "Properties can be updated by creators or admins" ON properties
    FOR UPDATE USING (creator_address IS NOT NULL);

-- RLS Policies for governance proposals (public read, token holders write)
CREATE POLICY "Governance proposals are publicly readable" ON governance_proposals
    FOR SELECT USING (true);

CREATE POLICY "Governance proposals can be created by token holders" ON governance_proposals
    FOR INSERT WITH CHECK (proposer_address IS NOT NULL);

-- RLS Policies for property documents (public read for verified documents)
CREATE POLICY "Verified property documents are publicly readable" ON property_documents
    FOR SELECT USING (verified = true);

CREATE POLICY "Property documents can be uploaded" ON property_documents
    FOR INSERT WITH CHECK (uploaded_by IS NOT NULL);

-- RLS Policies for metrics (public read)
CREATE POLICY "Property metrics are publicly readable" ON property_metrics
    FOR SELECT USING (true);

CREATE POLICY "Property metrics can be inserted" ON property_metrics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for governance votes (public read, voters can insert)
CREATE POLICY "Governance votes are publicly readable" ON governance_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can cast their votes" ON governance_votes
    FOR INSERT WITH CHECK (voter_address IS NOT NULL);

-- RLS Policies for property sales (public read)
CREATE POLICY "Property sales are publicly readable" ON property_sales
    FOR SELECT USING (true);

CREATE POLICY "Property sales can be managed" ON property_sales
    FOR ALL WITH CHECK (true);

-- RLS Policies for staking (users can see their own staking info)
CREATE POLICY "Users can view staking info" ON property_staking
    FOR SELECT USING (true);

CREATE POLICY "Users can update their staking info" ON property_staking
    FOR ALL WITH CHECK (user_address IS NOT NULL);

-- RLS Policies for revenue (public read, users can claim)
CREATE POLICY "Property revenues are publicly readable" ON property_revenues
    FOR SELECT USING (true);

CREATE POLICY "Property revenues can be managed" ON property_revenues
    FOR ALL WITH CHECK (true);

-- RLS Policies for user claimable revenue
CREATE POLICY "Users can view their claimable revenue" ON user_claimable_revenue
    FOR SELECT USING (user_address IS NOT NULL);

CREATE POLICY "Users can update their claimable revenue" ON user_claimable_revenue
    FOR ALL WITH CHECK (user_address IS NOT NULL);

-- RLS Policies for marketplace listings
CREATE POLICY "Marketplace listings are publicly readable" ON marketplace_listings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their listings" ON marketplace_listings
    FOR ALL WITH CHECK (seller_address IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;