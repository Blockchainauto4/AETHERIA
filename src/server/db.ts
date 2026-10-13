import { Pool } from 'pg';

export interface OrderRecord {
  id: string;
  pair: string;
  type: 'limit' | 'market' | 'stop_limit';
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  status: 'filled' | 'open' | 'cancelled';
  source?: string;
  created_at?: string;
}

export interface PortfolioRecord {
  id: string;
  balances: Record<string, number>;
  updated_at?: string;
}

export interface PioneerStateRecord {
  id: string;
  health: number;
  energy: number;
  food: number;
  aeth_balance: number;
  btc_balance: number;
  location: string;
  current_activity: string;
  updated_at?: string;
}

export interface PioneerLogRecord {
  id: string;
  speaker: string;
  message: string;
  created_at?: string;
}

export interface AISignalRecord {
  id: string;
  agent_type: string;
  asset_symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  target_price: number;
  stop_loss: number;
  rationale: string;
  created_at?: string;
}

// In-memory fallback storage when DATABASE_URL is not yet configured
class MemoryStorage {
  orders: OrderRecord[] = [
    {
      id: 'ord-seed-001',
      pair: 'BTC/USDT',
      type: 'limit',
      side: 'buy',
      price: 67200,
      amount: 0.15,
      total: 10080,
      status: 'filled',
      source: 'Trader',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'ord-seed-002',
      pair: 'ETH/USDT',
      type: 'market',
      side: 'buy',
      price: 3480,
      amount: 2.0,
      total: 6960,
      status: 'filled',
      source: 'AI Momentum Agent',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  portfolio: Record<string, number> = {
    USDT: 14250.00,
    BTC: 0.285,
    ETH: 3.12,
    SOL: 24.5,
    AVAX: 85.0,
    AETH: 450.0,
  };

  pioneerState: PioneerStateRecord = {
    id: 'kaelen-vane-family',
    health: 96,
    energy: 88,
    food: 84,
    aeth_balance: 450.0,
    btc_balance: 0.042,
    location: 'Biodomo Familiar - Nível 3',
    current_activity: 'Manutenção do filtro de CO2 e estufa hidropônica',
    updated_at: new Date().toISOString(),
  };

  pioneerLogs: PioneerLogRecord[] = [
    {
      id: 'log-1',
      speaker: 'Kaelen Vane',
      message: 'Chegamos ao planeta Aetheria Citadel há 182 ciclos solares. A tecnologia da cidadela nos acolheu com segurança.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'log-2',
      speaker: 'Maya Vane',
      message: 'As sementes que trouxemos da Terra germinaram sob a luz dos anéis energéticos da Torre Central.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  aiSignals: AISignalRecord[] = [
    {
      id: 'sig-1',
      agent_type: 'momentum',
      asset_symbol: 'BTC',
      action: 'BUY',
      confidence: 88,
      target_price: 70800,
      stop_loss: 66500,
      rationale: 'Volume comprador acelerando no rompimento da resistência diária com divergência altista no RSI.',
      created_at: new Date(Date.now() - 1200000).toISOString(),
    },
  ];
}

const memoryDb = new MemoryStorage();

// Connection URL from standard Vercel Postgres / Neon / Supabase environment variables
const dbConnectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.VERCEL_POSTGRES_URL || 
  '';

let pool: Pool | null = null;
let isPostgresAvailable = false;

if (dbConnectionString) {
  try {
    pool = new Pool({
      connectionString: dbConnectionString,
      ssl: dbConnectionString.includes('localhost') 
        ? false 
        : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    isPostgresAvailable = true;
    console.log('[DB] Pool configured for PostgreSQL / Neon / Vercel Postgres');
  } catch (err) {
    console.warn('[DB] Failed to instantiate Postgres Pool, using memory fallback:', err);
    pool = null;
    isPostgresAvailable = false;
  }
} else {
  console.log('[DB] No DATABASE_URL found. Running with high-performance in-memory fallback. Add DATABASE_URL in Vercel to connect persistent PostgreSQL.');
}

/**
 * Initializes database tables if using real PostgreSQL
 */
export async function initializeDatabaseSchema(): Promise<{ success: boolean; message: string; tables: string[] }> {
  if (!pool || !isPostgresAvailable) {
    return {
      success: true,
      message: 'Modo In-Memory Ativo. Nenhuma migração necessária. Para persistir no PostgreSQL, configure DATABASE_URL nas variáveis de ambiente do Vercel.',
      tables: ['orders', 'portfolio', 'pioneer_state', 'pioneer_logs', 'ai_agent_signals'],
    };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Orders table
    await client.query(`
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
    `);

    // 2. Portfolio table
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio (
        id VARCHAR(100) PRIMARY KEY,
        balances JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Pioneer family state
    await client.query(`
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
    `);

    // 4. Pioneer dialogue and history logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS pioneer_logs (
        id VARCHAR(100) PRIMARY KEY,
        speaker VARCHAR(60) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. AI Agent Signals
    await client.query(`
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
    `);

    // Seed default pioneer state if empty
    const pioneerCheck = await client.query('SELECT id FROM pioneer_state WHERE id = $1', ['kaelen-vane-family']);
    if (pioneerCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO pioneer_state (id, health, energy, food, aeth_balance, btc_balance, location, current_activity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'kaelen-vane-family',
        96,
        88,
        84,
        450.0,
        0.042,
        'Biodomo Familiar - Nível 3',
        'Manutenção do filtro de CO2 e estufa hidropônica'
      ]);
    }

    // Seed default portfolio if empty
    const portCheck = await client.query('SELECT id FROM portfolio WHERE id = $1', ['default-user']);
    if (portCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO portfolio (id, balances)
        VALUES ($1, $2)
      `, ['default-user', JSON.stringify(memoryDb.portfolio)]);
    }

    await client.query('COMMIT');
    return {
      success: true,
      message: 'Schema do PostgreSQL inicializado com sucesso no Vercel/Neon!',
      tables: ['orders', 'portfolio', 'pioneer_state', 'pioneer_logs', 'ai_agent_signals'],
    };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[DB] Error initializing schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Returns database health and metadata
 */
export async function getDbStatus(): Promise<{
  connected: boolean;
  provider: 'postgresql' | 'memory';
  databaseName?: string;
  tablesCount?: number;
  message: string;
}> {
  if (!pool || !isPostgresAvailable) {
    return {
      connected: false,
      provider: 'memory',
      message: 'Banco em memória temporária. Para ativar PostgreSQL no Vercel, adicione DATABASE_URL no Dashboard do Vercel.',
      tablesCount: 5,
    };
  }

  try {
    const res = await pool.query('SELECT current_database() as db_name, NOW() as current_time');
    const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    return {
      connected: true,
      provider: 'postgresql',
      databaseName: res.rows[0]?.db_name || 'postgresql',
      tablesCount: tableRes.rows.length,
      message: 'PostgreSQL conectado e operacional.',
    };
  } catch (err: any) {
    return {
      connected: false,
      provider: 'memory',
      message: `Erro ao conectar no PostgreSQL: ${err.message || 'Falha de conexão'}. Operando em modo de contingência em memória.`,
    };
  }
}

// -------------------------------------------------------------
// Orders Database Operations
// -------------------------------------------------------------
export async function dbGetOrders(): Promise<OrderRecord[]> {
  if (pool && isPostgresAvailable) {
    try {
      const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
      return res.rows.map(row => ({
        id: row.id,
        pair: row.pair,
        type: row.type,
        side: row.side,
        price: parseFloat(row.price),
        amount: parseFloat(row.amount),
        total: parseFloat(row.total),
        status: row.status,
        source: row.source,
        created_at: row.created_at,
      }));
    } catch (err) {
      console.warn('[DB] Fallback to memory on dbGetOrders:', err);
    }
  }
  return memoryDb.orders;
}

export async function dbCreateOrder(order: OrderRecord): Promise<OrderRecord> {
  const newOrder: OrderRecord = {
    ...order,
    id: order.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: order.created_at || new Date().toISOString(),
  };

  if (pool && isPostgresAvailable) {
    try {
      await pool.query(`
        INSERT INTO orders (id, pair, type, side, price, amount, total, status, source, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        newOrder.id,
        newOrder.pair,
        newOrder.type,
        newOrder.side,
        newOrder.price,
        newOrder.amount,
        newOrder.total,
        newOrder.status,
        newOrder.source || 'Manual Trader',
        newOrder.created_at
      ]);
      return newOrder;
    } catch (err) {
      console.warn('[DB] Error inserting order in postgres, saving in memory:', err);
    }
  }

  memoryDb.orders.unshift(newOrder);
  return newOrder;
}

// -------------------------------------------------------------
// Portfolio Database Operations
// -------------------------------------------------------------
export async function dbGetPortfolio(userId: string = 'default-user'): Promise<Record<string, number>> {
  if (pool && isPostgresAvailable) {
    try {
      const res = await pool.query('SELECT balances FROM portfolio WHERE id = $1', [userId]);
      if (res.rows.length > 0) {
        return res.rows[0].balances;
      }
    } catch (err) {
      console.warn('[DB] Fallback to memory on dbGetPortfolio:', err);
    }
  }
  return memoryDb.portfolio;
}

export async function dbSavePortfolio(userId: string = 'default-user', balances: Record<string, number>): Promise<Record<string, number>> {
  if (pool && isPostgresAvailable) {
    try {
      await pool.query(`
        INSERT INTO portfolio (id, balances, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET balances = $2, updated_at = NOW()
      `, [userId, JSON.stringify(balances)]);
      return balances;
    } catch (err) {
      console.warn('[DB] Error saving portfolio in postgres:', err);
    }
  }

  memoryDb.portfolio = { ...balances };
  return memoryDb.portfolio;
}

// -------------------------------------------------------------
// Pioneer Settler Family State & Logs Operations
// -------------------------------------------------------------
export async function dbGetPioneerState(): Promise<PioneerStateRecord> {
  if (pool && isPostgresAvailable) {
    try {
      const res = await pool.query('SELECT * FROM pioneer_state WHERE id = $1', ['kaelen-vane-family']);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          health: row.health,
          energy: row.energy,
          food: row.food,
          aeth_balance: parseFloat(row.aeth_balance),
          btc_balance: parseFloat(row.btc_balance),
          location: row.location,
          current_activity: row.current_activity,
          updated_at: row.updated_at,
        };
      }
    } catch (err) {
      console.warn('[DB] Fallback to memory on dbGetPioneerState:', err);
    }
  }
  return memoryDb.pioneerState;
}

export async function dbUpdatePioneerState(state: Partial<PioneerStateRecord>): Promise<PioneerStateRecord> {
  const merged: PioneerStateRecord = {
    ...memoryDb.pioneerState,
    ...state,
    updated_at: new Date().toISOString(),
  };

  if (pool && isPostgresAvailable) {
    try {
      await pool.query(`
        INSERT INTO pioneer_state (id, health, energy, food, aeth_balance, btc_balance, location, current_activity, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET
          health = COALESCE($2, pioneer_state.health),
          energy = COALESCE($3, pioneer_state.energy),
          food = COALESCE($4, pioneer_state.food),
          aeth_balance = COALESCE($5, pioneer_state.aeth_balance),
          btc_balance = COALESCE($6, pioneer_state.btc_balance),
          location = COALESCE($7, pioneer_state.location),
          current_activity = COALESCE($8, pioneer_state.current_activity),
          updated_at = NOW()
      `, [
        'kaelen-vane-family',
        merged.health,
        merged.energy,
        merged.food,
        merged.aeth_balance,
        merged.btc_balance,
        merged.location,
        merged.current_activity
      ]);
    } catch (err) {
      console.warn('[DB] Error updating pioneer_state in postgres:', err);
    }
  }

  memoryDb.pioneerState = merged;
  return merged;
}

export async function dbGetPioneerLogs(limit: number = 20): Promise<PioneerLogRecord[]> {
  if (pool && isPostgresAvailable) {
    try {
      const res = await pool.query('SELECT * FROM pioneer_logs ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows.map(row => ({
        id: row.id,
        speaker: row.speaker,
        message: row.message,
        created_at: row.created_at,
      }));
    } catch (err) {
      console.warn('[DB] Fallback to memory on dbGetPioneerLogs:', err);
    }
  }
  return memoryDb.pioneerLogs.slice(0, limit);
}

export async function dbAddPioneerLog(speaker: string, message: string): Promise<PioneerLogRecord> {
  const log: PioneerLogRecord = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    speaker,
    message,
    created_at: new Date().toISOString(),
  };

  if (pool && isPostgresAvailable) {
    try {
      await pool.query(`
        INSERT INTO pioneer_logs (id, speaker, message, created_at)
        VALUES ($1, $2, $3, $4)
      `, [log.id, log.speaker, log.message, log.created_at]);
      return log;
    } catch (err) {
      console.warn('[DB] Error inserting pioneer log in postgres:', err);
    }
  }

  memoryDb.pioneerLogs.unshift(log);
  return log;
}

// -------------------------------------------------------------
// AI Agent Signals Operations
// -------------------------------------------------------------
export async function dbGetAISignals(limit: number = 20): Promise<AISignalRecord[]> {
  if (pool && isPostgresAvailable) {
    try {
      const res = await pool.query('SELECT * FROM ai_agent_signals ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows.map(row => ({
        id: row.id,
        agent_type: row.agent_type,
        asset_symbol: row.asset_symbol,
        action: row.action,
        confidence: row.confidence,
        target_price: parseFloat(row.target_price),
        stop_loss: parseFloat(row.stop_loss),
        rationale: row.rationale,
        created_at: row.created_at,
      }));
    } catch (err) {
      console.warn('[DB] Fallback to memory on dbGetAISignals:', err);
    }
  }
  return memoryDb.aiSignals.slice(0, limit);
}

export async function dbAddAISignal(signal: Omit<AISignalRecord, 'id' | 'created_at'>): Promise<AISignalRecord> {
  const newSignal: AISignalRecord = {
    ...signal,
    id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };

  if (pool && isPostgresAvailable) {
    try {
      await pool.query(`
        INSERT INTO ai_agent_signals (id, agent_type, asset_symbol, action, confidence, target_price, stop_loss, rationale, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        newSignal.id,
        newSignal.agent_type,
        newSignal.asset_symbol,
        newSignal.action,
        newSignal.confidence,
        newSignal.target_price,
        newSignal.stop_loss,
        newSignal.rationale,
        newSignal.created_at
      ]);
      return newSignal;
    } catch (err) {
      console.warn('[DB] Error inserting ai signal in postgres:', err);
    }
  }

  memoryDb.aiSignals.unshift(newSignal);
  return newSignal;
}
