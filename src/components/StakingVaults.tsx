import React, { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { StakingVault } from '../types/crypto';
import { 
  Sprout, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  Gift, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const StakingVaults: React.FC = () => {
  const { 
    stakingVaults, 
    assets, 
    stakeAsset, 
    unstakeAsset, 
    claimVaultRewards,
    totalStakedUsd
  } = useExchange();

  const [activeModalVault, setActiveModalVault] = useState<{ vault: StakingVault; mode: 'stake' | 'unstake' } | null>(null);
  const [modalAmount, setModalAmount] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenModal = (vault: StakingVault, mode: 'stake' | 'unstake') => {
    setActiveModalVault({ vault, mode });
    setModalAmount('');
  };

  const handleClaim = (vaultId: string) => {
    const res = claimVaultRewards(vaultId);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalVault) return;

    const amount = parseFloat(modalAmount);
    if (!amount || amount <= 0) {
      setFeedback({ type: 'error', message: 'Digite uma quantidade válida' });
      return;
    }

    const { vault, mode } = activeModalVault;
    const res = mode === 'stake' ? stakeAsset(vault.id, amount) : unstakeAsset(vault.id, amount);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setActiveModalVault(null);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Projected yield calculation in modal
  const projectedYearly = activeModalVault
    ? ((parseFloat(modalAmount) || 0) * (activeModalVault.vault.apy / 100))
    : 0;

  return (
    <div className="w-full min-h-[calc(100vh-61px)] bg-slate-950 p-4 md:p-8 space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold mb-1">
              <Sprout className="w-4 h-4" />
              <span>COFRES INTELIGENTES DE RENDIMENTO</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Staking Líquido & Estratégias Quantitativas
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-1">
              Coloque seus ativos para render com os validadores institucionais da Cidadela Aetheria. Receba tokens sintéticos líquidos para continuar negociando enquanto acumula recompensas diárias.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Total em Staking</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                ${totalStakedUsd.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">TVL Geral dos Cofres</span>
              <span className="text-lg font-bold font-mono text-slate-200">
                $3.87B USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stakingVaults.map((vault) => {
          const asset = assets[vault.assetSymbol];
          const assetPrice = asset ? asset.price : 1;
          const stakedValueUsd = vault.userStaked * assetPrice;
          const pendingRewardsUsd = vault.pendingRewards * assetPrice;

          return (
            <div
              key={vault.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                      {vault.assetSymbol} Liquid Vault
                    </span>
                    <h3 className="text-base font-bold text-slate-100">
                      {vault.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold font-mono text-emerald-400 tabular-nums block">
                      {vault.apy.toFixed(2)}% APY
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Compostos Diários</span>
                  </div>
                </div>

                {/* Strategy note */}
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 mb-4">
                  {vault.strategy}
                </p>

                {/* Metrics 2-column strip */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Seu Saldo em Staking</span>
                    <span className="text-sm font-bold text-slate-100 tabular-nums">
                      {vault.userStaked.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} {vault.assetSymbol}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ≈ ${stakedValueUsd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Recompensas Acumuladas</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {vault.pendingRewards.toFixed(5)} {vault.assetSymbol}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ≈ ${pendingRewardsUsd.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleOpenModal(vault, 'stake')}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
                >
                  Alocar {vault.assetSymbol}
                </button>
                {vault.userStaked > 0 && (
                  <button
                    onClick={() => handleOpenModal(vault, 'unstake')}
                    className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer min-h-[44px]"
                  >
                    Resgatar
                  </button>
                )}
                <button
                  disabled={vault.pendingRewards <= 0}
                  onClick={() => handleClaim(vault.id)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[44px] ${
                    vault.pendingRewards > 0
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-800/40 text-slate-600 border border-transparent cursor-not-allowed'
                  }`}
                >
                  Reivindicar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stake/Unstake Modal */}
      {activeModalVault && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            {/* Mobile Grab Bar */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100">
                {activeModalVault.mode === 'stake' ? 'Alocar em Staking' : 'Resgatar do Staking'} - {activeModalVault.vault.name}
              </h3>
              <button
                onClick={() => setActiveModalVault(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                  <span>Quantidade a {activeModalVault.mode === 'stake' ? 'alocar' : 'resgatar'}</span>
                  <span>
                    Disponível:{' '}
                    {activeModalVault.mode === 'stake'
                      ? `${assets[activeModalVault.vault.assetSymbol]?.balance || 0} ${activeModalVault.vault.assetSymbol}`
                      : `${activeModalVault.vault.userStaked} ${activeModalVault.vault.assetSymbol}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="font-mono font-bold text-slate-300 text-sm">
                    {activeModalVault.vault.assetSymbol}
                  </span>
                </div>
              </div>

              {/* Quick Percentage Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      const max = activeModalVault.mode === 'stake'
                        ? assets[activeModalVault.vault.assetSymbol]?.balance || 0
                        : activeModalVault.vault.userStaked;
                      setModalAmount((max * pct).toFixed(4));
                    }}
                    className="py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-300 hover:bg-slate-700"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>

              {/* Yield Projection */}
              {activeModalVault.mode === 'stake' && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa Anual (APY):</span>
                    <span className="text-emerald-400 font-bold">{activeModalVault.vault.apy}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimativa de Rendimento Anual:</span>
                    <span className="text-slate-200">
                      +{projectedYearly.toFixed(4)} {activeModalVault.vault.assetSymbol}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Confirmar {activeModalVault.mode === 'stake' ? 'Alocação' : 'Resgate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
