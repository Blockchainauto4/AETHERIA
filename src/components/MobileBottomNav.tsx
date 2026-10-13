import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { ActiveTab } from '../types/crypto';
import { 
  Compass, 
  Globe,
  TrendingUp, 
  ArrowLeftRight, 
  Sprout, 
  Bot
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useExchange();

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'ecosystem', label: '2D Mapa', icon: <Compass className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'citadel-3d', label: 'Mundo 3D', icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> },
    { id: 'trading', label: 'Trading', icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'ai-agents', label: 'Agentes', icon: <Bot className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'swap', label: 'Swap', icon: <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'earn', label: 'Staking', icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <nav 
      aria-label="Navegação Principal Mobile" 
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
    >
      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${
                isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400'
              }`}>
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
