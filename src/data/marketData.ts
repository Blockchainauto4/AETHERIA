import { CryptoAsset, CandleData, OrderBookEntry, StakingVault } from '../types/crypto';

export const INITIAL_ASSETS: Record<string, CryptoAsset> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67840.50,
    change24h: 3.42,
    high24h: 68420.00,
    low24h: 65910.20,
    volume24hUsd: 28450120000,
    iconColor: '#F7931A',
    balance: 0.35,
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3520.80,
    change24h: 4.15,
    high24h: 3580.00,
    low24h: 3390.50,
    volume24hUsd: 16820500000,
    iconColor: '#627EEA',
    balance: 2.80,
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    price: 174.60,
    change24h: 6.80,
    high24h: 178.90,
    low24h: 162.30,
    volume24hUsd: 5930100000,
    iconColor: '#14F195',
    balance: 24.50,
  },
  AVAX: {
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 32.40,
    change24h: 1.95,
    high24h: 33.50,
    low24h: 31.10,
    volume24hUsd: 840200000,
    iconColor: '#E84142',
    balance: 85.00,
  },
  AETH: {
    symbol: 'AETH',
    name: 'Aetheria Protocol',
    price: 14.85,
    change24h: 9.40,
    high24h: 15.30,
    low24h: 13.20,
    volume24hUsd: 490200000,
    iconColor: '#10B981',
    balance: 1250.00,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    price: 1.00,
    change24h: 0.01,
    high24h: 1.002,
    low24h: 0.999,
    volume24hUsd: 54100000000,
    iconColor: '#26A17B',
    balance: 14500.00,
  }
};

export const INITIAL_STAKING_VAULTS: StakingVault[] = [
  {
    id: 'vault-eth-beacon',
    assetSymbol: 'ETH',
    name: 'Ethereum Institutional Staking (aeETH)',
    apy: 4.85,
    lockupDays: 0,
    tvlUsd: '$1.84B',
    userStaked: 1.20,
    pendingRewards: 0.0142,
    status: 'active',
    strategy: 'Nós validadores dedicados Tier-1 com MEV Boost e liquidez instantânea através do token aeETH.'
  },
  {
    id: 'vault-sol-validator',
    assetSymbol: 'SOL',
    name: 'Solana High-Yield Liquid Staking (aeSOL)',
    apy: 7.40,
    lockupDays: 0,
    tvlUsd: '$940M',
    userStaked: 10.00,
    pendingRewards: 0.185,
    status: 'active',
    strategy: 'Delegação distribuída em mais de 120 validadores de alta reputação com proteção contra slashing.'
  },
  {
    id: 'vault-usdt-delta',
    assetSymbol: 'USDT',
    name: 'USD Stablecoin Delta-Neutral Vault',
    apy: 11.20,
    lockupDays: 7,
    tvlUsd: '$680M',
    userStaked: 4000.00,
    pendingRewards: 48.60,
    status: 'active',
    strategy: 'Estratégia quantitativa neutra de mercado explorando taxas de financiamento (funding rate arbitrage).'
  },
  {
    id: 'vault-aeth-citadel',
    assetSymbol: 'AETH',
    name: 'Aetheria Protocol Revenue Share Vault',
    apy: 18.60,
    lockupDays: 30,
    tvlUsd: '$410M',
    userStaked: 500.00,
    pendingRewards: 12.40,
    status: 'active',
    strategy: 'Distribuição direta de 30% de todas as taxas de negociação spot e swap coletadas pela corretora.'
  }
];

export function generateCandles(basePrice: number, count: number = 40): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = basePrice * 0.94;
  const now = Date.now();
  const timeStep = 15 * 60 * 1000; // 15 mins

  for (let i = count; i >= 0; i--) {
    const timestamp = now - i * timeStep;
    const date = new Date(timestamp);
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    // Random walk with slight upward drift
    const change = (Math.random() - 0.47) * (basePrice * 0.015);
    const open = currentPrice;
    const close = Math.max(basePrice * 0.5, open + change);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.008);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.008);
    const volume = Math.floor(Math.random() * 85 + 15) * (basePrice > 1000 ? 1 : 100);

    candles.push({
      time: timeStr,
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });

    currentPrice = close;
  }

  return candles;
}

export function generateOrderBook(currentPrice: number): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } {
  const asks: OrderBookEntry[] = [];
  const bids: OrderBookEntry[] = [];
  
  const step = currentPrice * 0.0004;

  let askAccum = 0;
  for (let i = 1; i <= 9; i++) {
    const price = currentPrice + (i * step);
    const amount = Number((Math.random() * 1.5 + 0.2).toFixed(4));
    askAccum += amount;
    asks.push({
      price: Number(price.toFixed(2)),
      amount,
      total: Number(askAccum.toFixed(4))
    });
  }

  let bidAccum = 0;
  for (let i = 1; i <= 9; i++) {
    const price = currentPrice - (i * step);
    const amount = Number((Math.random() * 1.5 + 0.2).toFixed(4));
    bidAccum += amount;
    bids.push({
      price: Number(price.toFixed(2)),
      amount,
      total: Number(bidAccum.toFixed(4))
    });
  }

  return {
    asks: asks.reverse(), // Highest ask at top
    bids
  };
}
