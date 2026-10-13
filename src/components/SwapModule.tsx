import React, { useState, useMemo } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { 
  ArrowDownUp, 
  Settings2, 
  Fuel, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const SwapModule: React.FC = () => {
  const { assets, executeSwap } = useExchange();

  const [fromSymbol, setFromSymbol] = useState<string>('USDT');
  const [toSymbol, setToSymbol] = useState<string>('AETH');
  const [fromAmount, setFromAmount] = useState<string>('500');
  const [slippage, setSlippage] = useState<number>(0.1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fromAsset = assets[fromSymbol];
  const toAsset = assets[toSymbol];

  const estimatedReceived = useMemo(() => {
    const val = parseFloat(fromAmount) || 0;
    if (!fromAsset || !toAsset || val <= 0) return 0;
    const usdValue = val * fromAsset.price;
    const netUsd = usdValue * 0.9995; // 0.05% protocol fee
    return Number((netUsd / toAsset.price).toFixed(toSymbol === 'USDT' ? 2 : 4));
  }, [fromAmount, fromAsset, toAsset, toSymbol]);

  const exchangeRate = useMemo(() => {
    if (!fromAsset || !toAsset) return 1;
    return fromAsset.price / toAsset.price;
  }, [fromAsset, toAsset]);

  const handleFlip = () => {
    const temp = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(temp);
    setFromAmount(estimatedReceived.toString());
  };

  const handleMax = () => {
    if (fromAsset) {
      setFromAmount(fromAsset.balance.toString());
    }
  };

  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fromAmount);
    if (!amount || amount <= 0) {
      setFeedback({ type: 'error', message: 'Digite um valor válido' });
      return;
    }

    const res = executeSwap(fromSymbol, toSymbol, amount);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const tokenList = Object.keys(assets);

  return (
    <div className="w-full min-h-[calc(100vh-61px)] bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Swap Omnichain Instantâneo</h2>
              <span className="text-[11px] text-slate-400">Zero derrapagem e liquidação atômica</span>
            </div>
          </div>
          <button
            title="Configurações de Slippage"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Swap Form */}
        <form onSubmit={handleExecuteSwap} className="space-y-3">
          {/* FROM Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus-within:border-emerald-500/60 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Você paga</span>
              <span className="font-mono tabular-nums">
                Saldo: {fromAsset?.balance.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} {fromSymbol}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                step="any"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-xl font-bold font-mono text-slate-100 focus:outline-none"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleMax}
                  className="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono font-bold text-emerald-400 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  MÁX
                </button>
                <select
                  value={fromSymbol}
                  onChange={(e) => setFromSymbol(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-200 cursor-pointer focus:outline-none"
                >
                  {tokenList.map((sym) => (
                    <option key={sym} value={sym} disabled={sym === toSymbol}>
                      {sym}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500 block mt-1">
              ≈ ${((parseFloat(fromAmount) || 0) * (fromAsset?.price || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USD
            </span>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleFlip}
              className="p-2.5 rounded-full bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* TO Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Você recebe (estimado)</span>
              <span className="font-mono tabular-nums">
                Saldo: {toAsset?.balance.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} {toSymbol}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="w-full text-xl font-bold font-mono text-slate-100 tabular-nums">
                {estimatedReceived.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}
              </span>
              <select
                value={toSymbol}
                onChange={(e) => setToSymbol(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-200 cursor-pointer focus:outline-none shrink-0"
              >
                {tokenList.map((sym) => (
                  <option key={sym} value={sym} disabled={sym === fromSymbol}>
                    {sym}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] font-mono text-slate-500 block mt-1">
              ≈ ${(estimatedReceived * (toAsset?.price || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USD
            </span>
          </div>

          {/* Route & Rates Breakdown */}
          <div className="bg-slate-950/60 rounded-xl p-3 space-y-1.5 text-xs font-mono text-slate-400 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span>Taxa de Câmbio:</span>
              <span className="text-slate-200 tabular-nums">
                1 {fromSymbol} = {exchangeRate.toFixed(4)} {toSymbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tolerância Slippage:</span>
              <div className="flex items-center gap-1">
                {[0.1, 0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                      slippage === s ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Taxa da Corretora (0.05%):</span>
              <span className="text-emerald-400">ISENTO via Aetheria</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Roteamento de Liquidez:</span>
              <span className="text-slate-300">Aetheria Smart Pool v3</span>
            </div>
          </div>

          {/* Execute Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            Executar Swap Agora
          </button>
        </form>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
