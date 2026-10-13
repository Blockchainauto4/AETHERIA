/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExchangeProvider, useExchange } from './context/ExchangeContext';
import { Navbar } from './components/Navbar';
import { EcosystemMap } from './components/EcosystemMap';
import { TradingTerminal } from './components/TradingTerminal';
import { SwapModule } from './components/SwapModule';
import { StakingVaults } from './components/StakingVaults';
import { ProofOfReserves } from './components/ProofOfReserves';
import { AITradingAgents } from './components/AITradingAgents';
import { Citadel3DWorld } from './components/Citadel3DWorld';
import { MobileBottomNav } from './components/MobileBottomNav';

const MainView: React.FC = () => {
  const { activeTab } = useExchange();

  switch (activeTab) {
    case 'ecosystem':
      return <EcosystemMap />;
    case 'citadel-3d':
      return <Citadel3DWorld />;
    case 'trading':
      return <TradingTerminal />;
    case 'ai-agents':
      return <AITradingAgents />;
    case 'swap':
      return <SwapModule />;
    case 'earn':
      return <StakingVaults />;
    case 'reserves':
      return <ProofOfReserves />;
    default:
      return <EcosystemMap />;
  }
};

export default function App() {
  return (
    <ExchangeProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 flex flex-col pb-16 lg:pb-0">
          <MainView />
        </main>
        <MobileBottomNav />
      </div>
    </ExchangeProvider>
  );
}
