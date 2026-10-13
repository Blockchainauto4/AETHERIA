-- =============================================================================
-- AETHERIA CITADEL - DATABASE SCHEMA (PostgreSQL / Neon / Supabase / Vercel Postgres)
-- =============================================================================

-- 1. Orders table (Manual & AI Trading orders)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  pair VARCHAR(30) NOT NULL,
  type VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  price NUMERIC(18, 8) NOT NULL,
  amount NUMERIC(18, 8) NOT NULL,
  total NUMERIC(18, 8) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for orders query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pair ON orders(pair);

-- 2. Portfolio table (Multi-asset cryptocurrency balances)
CREATE TABLE IF NOT EXISTS portfolio (
  id VARCHAR(100) PRIMARY KEY,
  balances JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pioneer family state (Survival parameters and habitat data)
CREATE TABLE IF NOT EXISTS pioneer_state (
  id VARCHAR(100) PRIMARY KEY,
  health INTEGER NOT NULL DEFAULT 100,
  energy INTEGER NOT NULL DEFAULT 100,
  food INTEGER NOT NULL DEFAULT 100,
  aeth_balance NUMERIC(18, 4) NOT NULL DEFAULT 450,
  btc_balance NUMERIC(18, 8) NOT NULL DEFAULT 0.042,
  location VARCHAR(120) NOT NULL,
  current_activity VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Pioneer dialogue logs and memories
CREATE TABLE IF NOT EXISTS pioneer_logs (
  id VARCHAR(100) PRIMARY KEY,
  speaker VARCHAR(60) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pioneer_logs_created_at ON pioneer_logs(created_at DESC);

-- 5. AI Agent Signals & Execution logs
CREATE TABLE IF NOT EXISTS ai_agent_signals (
  id VARCHAR(100) PRIMARY KEY,
  agent_type VARCHAR(40) NOT NULL,
  asset_symbol VARCHAR(20) NOT NULL,
  action VARCHAR(10) NOT NULL,
  confidence INTEGER NOT NULL,
  target_price NUMERIC(18, 8),
  stop_loss NUMERIC(18, 8),
  rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_signals_created_at ON ai_agent_signals(created_at DESC);

-- Seed initial Pioneer family state if not present
INSERT INTO pioneer_state (id, health, energy, food, aeth_balance, btc_balance, location, current_activity)
VALUES (
  'kaelen-vane-family',
  96,
  88,
  84,
  450.0,
  0.042,
  'Biodomo Familiar - Nível 3',
  'Manutenção do filtro de CO2 e estufa hidropônica'
)
ON CONFLICT (id) DO NOTHING;

-- Seed default initial portfolio
INSERT INTO portfolio (id, balances)
VALUES (
  'default-user',
  '{"USDT": 14250.00, "BTC": 0.285, "ETH": 3.12, "SOL": 24.5, "AVAX": 85.0, "AETH": 450.0}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
