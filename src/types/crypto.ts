export interface EcosystemNode {
  id: string;
  name: string;
  subtitle: string;
  iconName: 'shield' | 'zap' | 'refresh-cw' | 'sprout' | 'rocket' | 'layers';
  category: 'security' | 'trading' | 'defi' | 'yield' | 'innovation';
  description: string;
  longDescription: string;
  metrics: {
    label: string;
    value: string;
    change?: string;
  }[];
  technicalFeatures: string[];
  ctaLabel: string;
  ctaAction: 'trading' | 'swap' | 'earn' | 'reserves';
  // Coordinates relative to the 16:9 canvas (percentages 0-100)
  targetPosition: { x: number; y: number }; // Where the pointer dot attaches to the architecture
  labelPosition: { x: number; y: number };  // Where the label box is placed
  anchorDirection: 'left' | 'right' | 'top' | 'bottom';
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  iconColor: string;
  balance: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UserOrder {
  id: string;
  pair: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  total: number;
  status: 'filled' | 'open' | 'cancelled';
  timestamp: string;
}

export interface StakingVault {
  id: string;
  assetSymbol: string;
  name: string;
  apy: number;
  lockupDays: number;
  tvlUsd: string;
  userStaked: number;
  pendingRewards: number;
  status: 'active' | 'upcoming';
  strategy: string;
}

export type ActiveTab = 'ecosystem' | 'citadel-3d' | 'trading' | 'swap' | 'earn' | 'reserves' | 'ai-agents';

export interface DatabaseStatus {
  connected: boolean;
  provider: 'postgresql' | 'memory';
  databaseName?: string;
  tablesCount?: number;
  message: string;
}
