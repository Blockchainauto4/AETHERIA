import React, { useState, useEffect, useMemo } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { CandleChart } from './CandleChart';
import { generateCandles, generateOrderBook } from '../data/marketData';
import { CandleData, OrderBookEntry } from '../types/crypto';
import { 
  ArrowUp, 
  ArrowDown, 
  Sliders, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  TrendingUp
} from 'lucide-react';

export const TradingTerminal: React.FC = () => {
  const {
    selectedPair,
    setSelectedPair,
    assets,
    orders,
    placeOrder,
    cancelOrder
  } = useExchange();

  const [baseSymbol, quoteSymbol] = selectedPair.split('/');
  const baseAsset = assets[baseSymbol] || assets.BTC;
  const quoteAsset = assets[quoteSymbol] || assets.USDT;

  const [candles, setCandles] = useState<CandleData[]>(() => generateCandles(baseAsset.price, 36));
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>(() =>
    generateOrderBook(baseAsset.price)
  );

  // Order form state
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [limitPrice, setLimitPrice] = useState<string>(baseAsset.price.toString());
  const [orderAmount, setOrderAmount] = useState<string>('0.1');
  const [mobileTradingTab, setMobileTradingTab] = useState<'chart' | 'book' | 'trade'>('chart');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Regenerate candles & orderbook when selected pair changes
  useEffect(() => {
    setCandles(generateCandles(baseAsset.price, 36));
    setOrderBook(generateOrderBook(baseAsset.price));
    setLimitPrice(baseAsset.price.toString());
  }, [selectedPair]);

  // Micro-fluctuation updates to order book
  useEffect(() => {
    const timer = setInterval(() => {
      setOrderBook(generateOrderBook(baseAsset.price));
    }, 2500);
    return () => clearInterval(timer);
  }, [baseAsset.price]);

  const handlePercentageClick = (pct: number) => {
    if (orderSide === 'buy') {
      const price = orderType === 'market' ? baseAsset.price : parseFloat(limitPrice) || baseAsset.price;
      const maxAmount = (quoteAsset.balance * pct) / price;
      setOrderAmount(maxAmount.toFixed(4));
    } else {
      const maxAmount = baseAsset.balance * pct;
      setOrderAmount(maxAmount.toFixed(4));
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const price = orderType === 'market' ? baseAsset.price : parseFloat(limitPrice);
    const amount = parseFloat(orderAmount);

    if (!price || price <= 0 || !amount || amount <= 0) {
      setFeedback({ type: 'error', message: 'Preço ou quantidade inválidos' });
      return;
    }

    const result = placeOrder({
      pair: selectedPair,
      type: orderType,
      side: orderSide,
      price,
      amount
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: result.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const calculatedTotal = useMemo(() => {
    const p = orderType === 'market' ? baseAsset.price : parseFloat(limitPrice) || 0;
    const a = parseFloat(orderAmount) || 0;
    return p * a;
  }, [baseAsset.price, limitPrice, orderAmount, orderType]);

  const availableBalance = orderSide === 'buy' ? quoteAsset.balance : baseAsset.balance;
  const availableSymbol = orderSide === 'buy' ? quoteSymbol : baseSymbol;

  return (
    <div className="w-full min-h-[calc(100vh-61px)] bg-slate-950 p-4 md:p-6 space-y-4">
      {/* Top Pair Selector & 24h KPI Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
        {/* Pair buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'AETH/USDT'].map((pair) => {
            const isSelected = selectedPair === pair;
            const sym = pair.split('/')[0];
            const asset = assets[sym];
            return (
              <button
                key={pair}
                onClick={() => setSelectedPair(pair)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{pair}</span>
                {asset && (
                  <span className={asset.change24h >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 24h Stats */}
        <div className="flex items-center gap-6 text-xs font-mono tabular-nums text-slate-400">
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Preço 24h</span>
            <span className="text-slate-100 font-bold text-sm">
              ${baseAsset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Máxima 24h</span>
            <span className="text-slate-200">${baseAsset.high24h.toLocaleString('pt-BR')}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Mínima 24h</span>
            <span className="text-slate-200">${baseAsset.low24h.toLocaleString('pt-BR')}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] uppercase text-slate-500 block">Volume 24h</span>
            <span className="text-slate-200">${(baseAsset.volume24hUsd / 1e9).toFixed(2)}B</span>
          </div>
        </div>
      </div>

      {/* Mobile Section View Switcher */}
      <div className="lg:hidden grid grid-cols-3 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setMobileTradingTab('chart')}
          className={`py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
            mobileTradingTab === 'chart'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Gráfico
        </button>
        <button
          type="button"
          onClick={() => setMobileTradingTab('book')}
          className={`py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
            mobileTradingTab === 'book'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Livro de Ofertas
        </button>
        <button
          type="button"
          onClick={() => setMobileTradingTab('trade')}
          className={`py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
            mobileTradingTab === 'trade'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Comprar / Vender
        </button>
      </div>

      {/* Main Grid: Chart + Orderbook + Order Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Candlestick Chart (7 cols) */}
        <div className={`lg:col-span-7 h-[420px] md:h-[460px] ${
          mobileTradingTab === 'chart' ? 'block' : 'hidden lg:block'
        }`}>
          <CandleChart
            candles={candles}
            pair={selectedPair}
            currentPrice={baseAsset.price}
          />
        </div>

        {/* Center: Live Order Book (2 cols) */}
        <div className={`lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col h-[420px] md:h-[460px] overflow-hidden ${
          mobileTradingTab === 'book' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 pb-1 border-b border-slate-800">
            <span>Preço ({quoteSymbol})</span>
            <span>Qtd ({baseSymbol})</span>
          </div>

          {/* Asks (Red) */}
          <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-1">
            {orderBook.asks.slice(-6).map((ask, idx) => (
              <div key={`ask-${idx}`} className="relative flex items-center justify-between text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded overflow-hidden">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-rose-500/15 transition-all duration-500"
                  style={{ width: `${Math.min(100, (ask.amount / 2.2) * 100)}%` }}
                />
                <span className="text-rose-400 font-medium relative z-10">${ask.price.toFixed(2)}</span>
                <span className="text-slate-300 relative z-10">{ask.amount.toFixed(3)}</span>
              </div>
            ))}
          </div>

          {/* Mid Price Separator */}
          <div className="py-2 my-1 border-y border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold px-1">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              ${baseAsset.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Spread: 0.01%</span>
          </div>

          {/* Bids (Green) */}
          <div className="flex-1 overflow-hidden space-y-1">
            {orderBook.bids.slice(0, 6).map((bid, idx) => (
              <div key={`bid-${idx}`} className="relative flex items-center justify-between text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded overflow-hidden">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 transition-all duration-500"
                  style={{ width: `${Math.min(100, (bid.amount / 2.2) * 100)}%` }}
                />
                <span className="text-emerald-400 font-medium relative z-10">${bid.price.toFixed(2)}</span>
                <span className="text-slate-300 relative z-10">{bid.amount.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Entry Desk (3 cols) */}
        <div className={`lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between min-h-[420px] md:h-[460px] ${
          mobileTradingTab === 'trade' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div>
            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setOrderSide('buy')}
                className={`py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'buy'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Comprar {baseSymbol}
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('sell')}
                className={`py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'sell'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Vender {baseSymbol}
              </button>
            </div>

            {/* Market / Limit Selector */}
            <div className="flex items-center justify-between text-xs font-mono mb-3">
              <span className="text-slate-400">Tipo de Ordem:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderType('limit')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    orderType === 'limit' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400'
                  }`}
                >
                  Limite
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('market')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    orderType === 'market' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400'
                  }`}
                >
                  Mercado
                </button>
              </div>
            </div>

            {/* Available Balance */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
              <span>Disponível:</span>
              <span className="text-slate-200 font-semibold tabular-nums">
                {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {availableSymbol}
              </span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitOrder} className="space-y-3">
              {orderType === 'limit' && (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Preço ({quoteSymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Quantidade ({baseSymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Percentage shortcut buttons */}
              <div className="grid grid-cols-4 gap-1">
                {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    className="py-1 bg-slate-800/80 hover:bg-slate-700 rounded text-[10px] font-mono text-slate-300 transition-colors cursor-pointer"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>

              {/* Total calculation */}
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Total Previsto:</span>
                <span className="text-slate-100 font-bold tabular-nums">
                  ${calculatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                  orderSide === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                {orderSide === 'buy' ? `Comprar ${baseSymbol}` : `Vender ${baseSymbol}`}
              </button>
            </form>
          </div>

          {/* Feedback notification */}
          {feedback && (
            <div className={`mt-2 p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{feedback.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Active Orders & Filled Trade History */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
          Histórico de Ordens da Sessão
        </h3>
        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Nenhuma ordem executada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-2">
                  <th className="py-2">Data/Hora</th>
                  <th>Par</th>
                  <th>Tipo</th>
                  <th>Lado</th>
                  <th>Preço</th>
                  <th>Quantidade</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-400">{ord.timestamp}</td>
                    <td className="font-bold text-slate-200">{ord.pair}</td>
                    <td className="uppercase text-[11px]">{ord.type}</td>
                    <td className={`font-bold ${ord.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ord.side.toUpperCase()}
                    </td>
                    <td>${ord.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>{ord.amount}</td>
                    <td>${ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'filled'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.status === 'open'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ord.status === 'filled' ? 'Executada' : ord.status === 'open' ? 'Aberta' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="text-right">
                      {ord.status === 'open' && (
                        <button
                          onClick={() => cancelOrder(ord.id)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
