import React, { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { ActiveTab } from '../types/crypto';
import { ShieldCheck, Wallet, ArrowUpRight, Database } from 'lucide-react';
import { DatabaseStatusModal } from './DatabaseStatusModal';

export const Navbar: React.FC = () => {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const {
    activeTab,
    setActiveTab,
    portfolioValueUsd,
    walletAddress,
    isWalletConnected,
    toggleWallet,
    dbStatus
  } = useExchange();

  const navLinks: { id: ActiveTab; label: string; highlight?: boolean }[] = [
    { id: 'ecosystem', label: 'Cidadela 2D' },
    { id: 'citadel-3d', label: 'Mundo 3D & Agente', highlight: true },
    { id: 'trading', label: 'Trading Spot' },
    { id: 'ai-agents', label: '10 Agentes IA', highlight: true },
    { id: 'swap', label: 'Swap' },
    { id: 'earn', label: 'Cofres & Staking' },
    { id: 'reserves', label: 'Prova de Reservas' },
  ];

  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand Wordmark */}
      <div 
        onClick={() => setActiveTab('ecosystem')}
        className="flex items-center gap-2 cursor-pointer select-none group shrink-0 min-h-[44px]"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <span className="text-sm sm:text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
          AETHERIA <span className="text-emerald-400 font-light text-[10px] sm:text-xs tracking-widest ml-1 uppercase">EXCHANGE</span>
        </span>
      </div>

      {/* Zone 2: Navigation links */}
      <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs uppercase tracking-wider font-medium text-slate-400">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`relative py-1.5 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <span>{link.label}</span>
              {link.highlight && (
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-mono font-bold lowercase tracking-normal">
                  3D
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Database status & wallet balance */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          onClick={() => setIsDbModalOpen(true)}
          title="Status do Banco de Dados & Vercel"
          className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs transition-colors cursor-pointer min-h-[44px]"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden md:inline font-mono text-[11px] text-slate-300">
            {dbStatus?.provider === 'postgresql' && dbStatus?.connected ? 'DB: Postgres' : 'DB: Vercel Ready'}
          </span>
          <span 
            className={`w-2 h-2 rounded-full shrink-0 ${
              dbStatus?.provider === 'postgresql' && dbStatus?.connected 
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
                : 'bg-amber-400'
            }`} 
          />
        </button>

        <button
          onClick={toggleWallet}
          className="flex items-center gap-2 sm:gap-2.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs transition-colors cursor-pointer min-h-[44px]"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-mono tabular-nums text-slate-200 font-medium text-xs">
            ${portfolioValueUsd.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
            {isWalletConnected ? shortAddress : 'Conectar'}
          </span>
        </button>
      </div>

      <DatabaseStatusModal 
        isOpen={isDbModalOpen} 
        onClose={() => setIsDbModalOpen(false)} 
      />
    </header>
  );
};
