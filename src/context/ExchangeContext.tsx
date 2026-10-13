import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ActiveTab, CryptoAsset, UserOrder, StakingVault, DatabaseStatus } from '../types/crypto';
import { INITIAL_ASSETS, INITIAL_STAKING_VAULTS } from '../data/marketData';

interface ExchangeContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  assets: Record<string, CryptoAsset>;
  orders: UserOrder[];
  stakingVaults: StakingVault[];
  walletAddress: string;
  isWalletConnected: boolean;
  toggleWallet: () => void;
  portfolioValueUsd: number;
  totalStakedUsd: number;
  placeOrder: (order: {
    pair: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    price: number;
    amount: number;
  }) => { success: boolean; message: string };
  cancelOrder: (orderId: string) => void;
  executeSwap: (fromSymbol: string, toSymbol: string, amount: number) => { success: boolean; received: number; message: string };
  stakeAsset: (vaultId: string, amount: number) => { success: boolean; message: string };
  unstakeAsset: (vaultId: string, amount: number) => { success: boolean; message: string };
  claimVaultRewards: (vaultId: string) => { success: boolean; amount: number; message: string };
  depositSimulatedFunds: (symbol: string, amount: number) => void;
  quickNavigateToNodeAction: (action: 'trading' | 'swap' | 'earn' | 'reserves', nodeId?: string) => void;
  isRealFeedActive: boolean;
  toggleRealFeed: () => void;
  lastFeedSync: string;
  syncRealPrices: () => Promise<void>;
  dbStatus: DatabaseStatus | null;
  checkDbStatus: () => Promise<void>;
  initDatabase: () => Promise<boolean>;
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

export const ExchangeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ecosystem');
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('spot-engine');
  const [assets, setAssets] = useState<Record<string, CryptoAsset>>(INITIAL_ASSETS);
  const [stakingVaults, setStakingVaults] = useState<StakingVault[]>(INITIAL_STAKING_VAULTS);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);
  const walletAddress = '0x71C839F6A24D3E5cE646696b99C75988383B39FA';

  const [orders, setOrders] = useState<UserOrder[]>([
    {
      id: 'ord-101',
      pair: 'BTC/USDT',
      type: 'limit',
      side: 'buy',
      price: 66500.00,
      amount: 0.15,
      filled: 0,
      total: 9975.00,
      status: 'open',
      timestamp: 'Hoje, 10:24'
    },
    {
      id: 'ord-102',
      pair: 'ETH/USDT',
      type: 'market',
      side: 'buy',
      price: 3480.00,
      amount: 1.0,
      filled: 1.0,
      total: 3480.00,
      status: 'filled',
      timestamp: 'Hoje, 08:15'
    },
    {
      id: 'ord-103',
      pair: 'SOL/USDT',
      type: 'limit',
      side: 'sell',
      price: 185.00,
      amount: 15.0,
      filled: 0,
      total: 2775.00,
      status: 'open',
      timestamp: 'Ontem, 21:40'
    }
  ]);

  const [isRealFeedActive, setIsRealFeedActive] = useState<boolean>(true);
  const [lastFeedSync, setLastFeedSync] = useState<string>('Sincronizado agora');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const json = await res.json();
        setDbStatus(json);
      }
    } catch (err) {
      console.warn('DB status check notice:', err);
    }
  };

  const initDatabase = async () => {
    try {
      const res = await fetch('/api/db/init', { method: 'POST' });
      if (res.ok) {
        await checkDbStatus();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Init DB error:', err);
      return false;
    }
  };

  const loadDbOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const json = await res.json();
        if (json.orders && json.orders.length > 0) {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const mapped: UserOrder[] = json.orders.map((o: any) => ({
              id: o.id,
              pair: o.pair,
              type: o.type,
              side: o.side,
              price: o.price,
              amount: o.amount,
              filled: o.status === 'filled' ? o.amount : 0,
              total: o.total,
              status: o.status,
              timestamp: o.created_at ? new Date(o.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recente'
            }));
            const newFromDb = mapped.filter((m) => !existingIds.has(m.id));
            return [...newFromDb, ...prev];
          });
        }
      }
    } catch {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    checkDbStatus();
    loadDbOrders();
  }, []);

  const toggleRealFeed = () => {
    setIsRealFeedActive((prev) => !prev);
  };

  const syncRealPrices = async () => {
    try {
      let fetchedPrices: any = null;
      try {
        const res = await fetch('/api/crypto/prices');
        if (res.ok) {
          const json = await res.json();
          if (json.prices) fetchedPrices = json.prices;
        }
      } catch (e) {
        // Fallback to direct public Binance ticker
        const directRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","AVAXUSDT"]');
        if (directRes.ok) {
          const directData = await directRes.json();
          fetchedPrices = {};
          directData.forEach((item: any) => {
            const sym = item.symbol.replace('USDT', '');
            fetchedPrices[sym] = {
              price: parseFloat(item.lastPrice),
              change24h: parseFloat(item.priceChangePercent),
              high24h: parseFloat(item.highPrice),
              low24h: parseFloat(item.lowPrice),
              volume24hUsd: parseFloat(item.quoteVolume),
            };
          });
        }
      }

      if (fetchedPrices) {
        setAssets((prev) => {
          const next = { ...prev };
          Object.keys(fetchedPrices).forEach((sym) => {
            if (next[sym]) {
              const live = fetchedPrices[sym];
              next[sym] = {
                ...next[sym],
                price: Number(live.price.toFixed(sym === 'BTC' ? 1 : 2)),
                change24h: Number(live.change24h.toFixed(2)),
                high24h: Number(live.high24h.toFixed(2)),
                low24h: Number(live.low24h.toFixed(2)),
                volume24hUsd: live.volume24hUsd || next[sym].volume24hUsd,
              };
            }
          });
          return next;
        });
        const now = new Date();
        setLastFeedSync(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      }
    } catch (err) {
      console.warn('Real price sync notice:', err);
    }
  };

  // Sync on mount and periodically
  useEffect(() => {
    if (!isRealFeedActive) return;
    syncRealPrices();
    const timer = setInterval(syncRealPrices, 10000);
    return () => clearInterval(timer);
  }, [isRealFeedActive]);

  // Subtle micro-fluctuations between syncs
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((sym) => {
          if (sym === 'USDT') return;
          const current = next[sym];
          const pct = (Math.random() - 0.49) * 0.0015;
          const newPrice = Math.max(0.01, current.price * (1 + pct));
          const priceFormatted = Number(newPrice.toFixed(sym === 'AETH' ? 2 : sym === 'BTC' ? 1 : 2));
          next[sym] = {
            ...current,
            price: priceFormatted,
          };
        });
        return next;
      });

      // Slowly accumulate staking rewards
      setStakingVaults((prev) =>
        prev.map((vault) => {
          if (vault.userStaked <= 0) return vault;
          const increment = (vault.userStaked * (vault.apy / 100)) / (365 * 24 * 60 * 12);
          return {
            ...vault,
            pendingRewards: Number((vault.pendingRewards + increment).toFixed(5))
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Compute Total Portfolio Value (Liquid balances)
  const portfolioValueUsd = useMemo(() => {
    return Object.values(assets).reduce((total, asset) => {
      return total + (asset.balance * asset.price);
    }, 0);
  }, [assets]);

  // Compute Total Staked Value
  const totalStakedUsd = useMemo(() => {
    return stakingVaults.reduce((total, vault) => {
      const asset = assets[vault.assetSymbol];
      const price = asset ? asset.price : 1;
      return total + (vault.userStaked * price);
    }, 0);
  }, [stakingVaults, assets]);

  const toggleWallet = () => {
    setIsWalletConnected((prev) => !prev);
  };

  const placeOrder = (orderData: {
    pair: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    price: number;
    amount: number;
  }): { success: boolean; message: string } => {
    const [base, quote] = orderData.pair.split('/');
    const baseAsset = assets[base];
    const quoteAsset = assets[quote];

    if (!baseAsset || !quoteAsset) {
      return { success: false, message: 'Par de negociação inválido' };
    }

    const totalCost = orderData.price * orderData.amount;

    if (orderData.side === 'buy') {
      if (quoteAsset.balance < totalCost) {
        return { success: false, message: `Saldo insuficiente de ${quote}. Necessário: ${totalCost.toFixed(2)} ${quote}` };
      }

      // Deduct quote currency
      setAssets((prev) => ({
        ...prev,
        [quote]: { ...prev[quote], balance: prev[quote].balance - totalCost },
        ...(orderData.type === 'market'
          ? { [base]: { ...prev[base], balance: prev[base].balance + orderData.amount } }
          : {})
      }));
    } else {
      // Sell order
      if (baseAsset.balance < orderData.amount) {
        return { success: false, message: `Saldo insuficiente de ${base}. Necessário: ${orderData.amount} ${base}` };
      }

      // Deduct base currency
      setAssets((prev) => ({
        ...prev,
        [base]: { ...prev[base], balance: prev[base].balance - orderData.amount },
        ...(orderData.type === 'market'
          ? { [quote]: { ...prev[quote], balance: prev[quote].balance + totalCost } }
          : {})
      }));
    }

    const newOrder: UserOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      pair: orderData.pair,
      type: orderData.type,
      side: orderData.side,
      price: orderData.price,
      amount: orderData.amount,
      filled: orderData.type === 'market' ? orderData.amount : 0,
      total: totalCost,
      status: orderData.type === 'market' ? 'filled' : 'open',
      timestamp: 'Agora'
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Persist order to database asynchronously
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newOrder.id,
        pair: newOrder.pair,
        type: newOrder.type,
        side: newOrder.side,
        price: newOrder.price,
        amount: newOrder.amount,
        total: newOrder.total,
        status: newOrder.status,
        source: 'Web Trader',
      }),
    }).catch((err) => console.warn('Order DB persist notice:', err));

    return {
      success: true,
      message: orderData.type === 'market'
        ? `Ordem a mercado de ${orderData.side.toUpperCase()} executada com sucesso!`
        : `Ordem limite aberta a $${orderData.price.toLocaleString('pt-BR')}!`
    };
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (!order || order.status !== 'open') return prev;

      const [base, quote] = order.pair.split('/');
      // Refund balance
      if (order.side === 'buy') {
        setAssets((curr) => ({
          ...curr,
          [quote]: { ...curr[quote], balance: curr[quote].balance + order.total }
        }));
      } else {
        setAssets((curr) => ({
          ...curr,
          [base]: { ...curr[base], balance: curr[base].balance + order.amount }
        }));
      }

      return prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o));
    });
  };

  const executeSwap = (fromSymbol: string, toSymbol: string, amount: number) => {
    const fromAsset = assets[fromSymbol];
    const toAsset = assets[toSymbol];

    if (!fromAsset || !toAsset) {
      return { success: false, received: 0, message: 'Ativos inválidos' };
    }

    if (fromAsset.balance < amount) {
      return { success: false, received: 0, message: `Saldo insuficiente de ${fromSymbol}` };
    }

    // Amount in USD
    const fromValueUsd = amount * fromAsset.price;
    // Estimated 0.05% swap fee
    const feeUsd = fromValueUsd * 0.0005;
    const netValueUsd = fromValueUsd - feeUsd;
    const receivedAmount = Number((netValueUsd / toAsset.price).toFixed(toSymbol === 'USDT' ? 2 : 4));

    setAssets((prev) => ({
      ...prev,
      [fromSymbol]: { ...prev[fromSymbol], balance: prev[fromSymbol].balance - amount },
      [toSymbol]: { ...prev[toSymbol], balance: prev[toSymbol].balance + receivedAmount }
    }));

    return {
      success: true,
      received: receivedAmount,
      message: `Swap de ${amount} ${fromSymbol} para ${receivedAmount} ${toSymbol} concluído!`
    };
  };

  const stakeAsset = (vaultId: string, amount: number) => {
    const vault = stakingVaults.find((v) => v.id === vaultId);
    if (!vault) return { success: false, message: 'Cofre não encontrado' };

    const asset = assets[vault.assetSymbol];
    if (!asset || asset.balance < amount) {
      return { success: false, message: `Saldo insuficiente de ${vault.assetSymbol}` };
    }

    // Deduct liquid balance
    setAssets((prev) => ({
      ...prev,
      [vault.assetSymbol]: { ...prev[vault.assetSymbol], balance: prev[vault.assetSymbol].balance - amount }
    }));

    // Add to staked
    setStakingVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId ? { ...v, userStaked: Number((v.userStaked + amount).toFixed(4)) } : v
      )
    );

    return { success: true, message: `${amount} ${vault.assetSymbol} alocados com sucesso no cofre!` };
  };

  const unstakeAsset = (vaultId: string, amount: number) => {
    const vault = stakingVaults.find((v) => v.id === vaultId);
    if (!vault) return { success: false, message: 'Cofre não encontrado' };

    if (vault.userStaked < amount) {
      return { success: false, message: `Saldo em staking insuficiente` };
    }

    // Deduct from vault
    setStakingVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId ? { ...v, userStaked: Number((v.userStaked - amount).toFixed(4)) } : v
      )
    );

    // Return to liquid balance
    setAssets((prev) => ({
      ...prev,
      [vault.assetSymbol]: { ...prev[vault.assetSymbol], balance: prev[vault.assetSymbol].balance + amount }
    }));

    return { success: true, message: `${amount} ${vault.assetSymbol} resgatados para a carteira!` };
  };

  const claimVaultRewards = (vaultId: string) => {
    const vault = stakingVaults.find((v) => v.id === vaultId);
    if (!vault) return { success: false, amount: 0, message: 'Cofre não encontrado' };

    const reward = vault.pendingRewards;
    if (reward <= 0) {
      return { success: false, amount: 0, message: 'Nenhuma recompensa pendente' };
    }

    // Add rewards to liquid balance
    setAssets((prev) => ({
      ...prev,
      [vault.assetSymbol]: { ...prev[vault.assetSymbol], balance: prev[vault.assetSymbol].balance + reward }
    }));

    // Reset pending
    setStakingVaults((prev) =>
      prev.map((v) => (v.id === vaultId ? { ...v, pendingRewards: 0 } : v))
    );

    return {
      success: true,
      amount: reward,
      message: `Recompensas de ${reward.toFixed(4)} ${vault.assetSymbol} reivindicadas!`
    };
  };

  const depositSimulatedFunds = (symbol: string, amount: number) => {
    if (!assets[symbol]) return;
    setAssets((prev) => ({
      ...prev,
      [symbol]: { ...prev[symbol], balance: prev[symbol].balance + amount }
    }));
  };

  const quickNavigateToNodeAction = (action: 'trading' | 'swap' | 'earn' | 'reserves', nodeId?: string) => {
    if (nodeId) setSelectedNodeId(nodeId);
    setActiveTab(action);
  };

  return (
    <ExchangeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedPair,
        setSelectedPair,
        selectedNodeId,
        setSelectedNodeId,
        assets,
        orders,
        stakingVaults,
        walletAddress,
        isWalletConnected,
        toggleWallet,
        portfolioValueUsd,
        totalStakedUsd,
        placeOrder,
        cancelOrder,
        executeSwap,
        stakeAsset,
        unstakeAsset,
        claimVaultRewards,
        depositSimulatedFunds,
        quickNavigateToNodeAction,
        isRealFeedActive,
        toggleRealFeed,
        lastFeedSync,
        syncRealPrices,
        dbStatus,
        checkDbStatus,
        initDatabase
      }}
    >
      {children}
    </ExchangeContext.Provider>
  );
};

export const useExchange = () => {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error('useExchange must be used within an ExchangeProvider');
  }
  return context;
};
