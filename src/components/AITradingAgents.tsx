import React, { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { 
  Bot, 
  Brain, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  MessageSquare
} from 'lucide-react';

interface AgentAnalysis {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidenceScore: number;
  suggestedAmountPercent: number;
  targetPrice: number;
  stopLossPrice: number;
  technicalRationale: string;
  riskRating: string;
  timeframeHorizon: string;
}

export const AITradingAgents: React.FC = () => {
  const { 
    assets, 
    selectedPair, 
    setSelectedPair, 
    portfolioValueUsd, 
    placeOrder,
    lastFeedSync,
    syncRealPrices,
    isRealFeedActive,
    toggleRealFeed
  } = useExchange();

  const [activeAgent, setActiveAgent] = useState<'momentum' | 'risk_sentinel' | 'quantum'>('momentum');
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [syncingPrices, setSyncingPrices] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [executedOrderFeedback, setExecutedOrderFeedback] = useState<string | null>(null);

  // Chat State with AI Agent
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'agent'; text: string; time: string }[]>([
    {
      role: 'agent',
      text: 'Olá! Sou o Agente de Inteligência Artificial da Aetheria Citadel. Posso analisar o fluxo de ordens em tempo real, calcular probabilidades de rompimento e sugerir ou executar ordens automáticas com gerenciamento de risco rigoroso. Como posso otimizar suas operações hoje?',
      time: 'Agora'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  const [baseSymbol, quoteSymbol] = selectedPair.split('/');
  const activeAsset = assets[baseSymbol] || assets.BTC;
  const quoteAsset = assets[quoteSymbol] || assets.USDT;

  const handleSyncPrices = async () => {
    setSyncingPrices(true);
    await syncRealPrices();
    setTimeout(() => setSyncingPrices(false), 800);
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setExecutedOrderFeedback(null);
    try {
      const response = await fetch('/api/ai/agent-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: activeAgent,
          assetSymbol: baseSymbol,
          currentPrice: activeAsset.price,
          change24h: activeAsset.change24h,
          high24h: activeAsset.high24h,
          low24h: activeAsset.low24h,
          volume24h: activeAsset.volume24hUsd,
          userBalance: quoteAsset.balance,
          riskTolerance
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
      }
    } catch (err) {
      console.error('Failed to run agent analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecuteAgentOrder = () => {
    if (!analysis) return;

    if (analysis.action === 'HOLD') {
      setExecutedOrderFeedback('O agente recomenda aguardar melhores condições de mercado para abrir novas posições.');
      return;
    }

    const price = activeAsset.price;
    const side = analysis.action === 'BUY' ? 'buy' : 'sell';

    let amount = 0;
    if (side === 'buy') {
      const budgetUsd = quoteAsset.balance * (analysis.suggestedAmountPercent / 100);
      amount = Number((budgetUsd / price).toFixed(4));
    } else {
      amount = Number((activeAsset.balance * (analysis.suggestedAmountPercent / 100)).toFixed(4));
    }

    if (amount <= 0) {
      setExecutedOrderFeedback(`Saldo insuficiente para executar a alocação de ${analysis.suggestedAmountPercent}%.`);
      return;
    }

    const orderResult = placeOrder({
      pair: selectedPair,
      type: 'market',
      side,
      price,
      amount
    });

    if (orderResult.success) {
      setExecutedOrderFeedback(`Ordem de ${side.toUpperCase()} de ${amount} ${baseSymbol} executada com sucesso pelo Agente IA a $${price.toLocaleString('pt-BR')}!`);
    } else {
      setExecutedOrderFeedback(orderResult.message);
    }
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userText = chatInput.trim();
    setChatInput('');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userText, time: timeStr }
    ]);

    setSendingChat(true);
    try {
      const res = await fetch('/api/ai/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          activePair: selectedPair,
          portfolioSummary: {
            totalUsd: portfolioValueUsd,
            asset: baseSymbol,
            price: activeAsset.price
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        setChatMessages((prev) => [
          ...prev,
          { role: 'agent', text: json.reply, time: timeStr }
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { 
          role: 'agent', 
          text: `Análise técnica para ${baseSymbol}: o mercado apresenta suporte firme a $${activeAsset.low24h.toLocaleString('pt-BR')} e resistência em $${activeAsset.high24h.toLocaleString('pt-BR')}. Recomendo operar com stop loss rigoroso.`, 
          time: timeStr 
        }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-61px)] bg-slate-950 p-4 md:p-8 space-y-6">
      {/* Live Market Real Feed Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
              ORÁCULO DE MERCADO REAL & AGENTES AUTÔNOMOS
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Operações Automatizadas por IA com Cotações Reais
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Conecte agentes quantitativos treinados para analisar os livros de ofertas globais da Binance e On-Chain, gerando recomendações com cálculo estrito de risco e execução com 1 clique.
          </p>
        </div>

        {/* Real-time Status Card */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between md:justify-end gap-4 shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Última Atualização Real</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {lastFeedSync}
            </span>
          </div>
          <button
            onClick={handleSyncPrices}
            disabled={syncingPrices}
            title="Sincronizar Cotações Reais Agora"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingPrices ? 'animate-spin' : ''}`} />
            <span>{syncingPrices ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'momentum',
            name: 'Agente Alpha · Momentum',
            specialty: 'Rompimentos & Tendência',
            desc: 'Analisa médias exponenciais (EMA), volume e momentum de curto a médio prazo para capturar ondas de alta.',
            icon: <Zap className="w-5 h-5 text-amber-400" />,
            badge: 'Alta Frequência'
          },
          {
            id: 'risk_sentinel',
            name: 'Agente Sentinel · DCA & Risco',
            specialty: 'Preservação de Capital',
            desc: 'Otimizador de compras fracionadas inteligentes (Dollar-Cost Averaging) com proteção contra drawdowns acentuados.',
            icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
            badge: 'Conservador'
          },
          {
            id: 'quantum',
            name: 'Agente Quantum · Scalper',
            specialty: 'Micro-Estrutura do Livro',
            desc: 'Detecta desequilíbrios entre compradores e vendedores e identifica pontos de exaustão de liquidez.',
            icon: <Brain className="w-5 h-5 text-cyan-400" />,
            badge: 'Quantitativo'
          }
        ].map((agent) => {
          const isSelected = activeAgent === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => setActiveAgent(agent.id as any)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                    {agent.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {agent.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{agent.name}</h3>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">{agent.specialty}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {agent.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Status Operacional:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ativo
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split: Live Agent Analysis Desk (Left) + Interactive AI Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Analysis & Trade Execution Desk (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Configuração de Alvo</span>
              <h2 className="text-base font-bold text-slate-100">Estação de Decisão do Agente</h2>
            </div>

            {/* Target Pair Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT'].map((pair) => (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    selectedPair === pair
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>

          {/* Active Asset Live Real Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Preço Real ao Vivo</span>
              <span className="text-sm font-bold text-slate-100 tabular-nums">
                ${activeAsset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Variação 24h</span>
              <span className={`text-sm font-bold tabular-nums ${activeAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {activeAsset.change24h >= 0 ? '+' : ''}{activeAsset.change24h}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Máxima 24h</span>
              <span className="text-slate-200">${activeAsset.high24h.toLocaleString('pt-BR')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Mínima 24h</span>
              <span className="text-slate-200">${activeAsset.low24h.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {/* Risk Tolerance Selector & Run Analysis CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-slate-400">Perfil de Risco:</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['conservative', 'moderate', 'aggressive'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskTolerance(r)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono capitalize transition-colors cursor-pointer ${
                      riskTolerance === r
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r === 'conservative' ? 'Conservador' : r === 'moderate' ? 'Moderado' : 'Agressivo'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Consultando Agente Gemini...' : 'Solicitar Análise de IA'}</span>
            </button>
          </div>

          {/* AI Analysis Result Card */}
          {analysis && (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${
                    analysis.action === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : analysis.action === 'SELL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    RECOMENDAÇÃO: {analysis.action === 'BUY' ? 'COMPRA FORTE' : analysis.action === 'SELL' ? 'VENDA' : 'MANTER'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Confiança: <strong className="text-slate-100">{analysis.confidenceScore}%</strong>
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Horizonte: {analysis.timeframeHorizon}
                </span>
              </div>

              {/* Targets and Stop Loss */}
              <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Alocação Sugerida</span>
                  <span className="text-slate-100 font-bold">{analysis.suggestedAmountPercent}% do saldo</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block">Preço Alvo (Take Profit)</span>
                  <span className="text-emerald-400 font-bold">${analysis.targetPrice?.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-rose-400 block">Stop Loss Sugerido</span>
                  <span className="text-rose-400 font-bold">${analysis.stopLossPrice?.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Rationale Prose */}
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-bold">
                  Justificativa Técnica do Agente:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {analysis.technicalRationale}
                </p>
              </div>

              {/* Execute Action Button */}
              <button
                onClick={handleExecuteAgentOrder}
                className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg active:scale-95 cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${
                  analysis.action === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : analysis.action === 'SELL'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {analysis.action === 'BUY' 
                    ? `Executar Compra Automática de ${baseSymbol}` 
                    : analysis.action === 'SELL' 
                    ? `Executar Venda de ${baseSymbol}` 
                    : 'Aguardar Confirmação de Tendência'}
                </span>
              </button>
            </div>
          )}

          {/* Execution Feedback Notification */}
          {executedOrderFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{executedOrderFeedback}</span>
            </div>
          )}
        </div>

        {/* Right: Interactive AI Agent Strategy Chat (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[580px]">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Consultoria Direta com o Agente</h3>
            </div>

            {/* Quick Prompt Pill Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                `Analisar tendência de ${baseSymbol}`,
                'Como proteger meus ganhos?',
                'Qual o risco de alavancagem hoje?'
              ].map((quick) => (
                <button
                  key={quick}
                  onClick={() => {
                    setChatInput(quick);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="h-[360px] overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-xs'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">{msg.time}</span>
                </div>
              ))}
              {sendingChat && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                  <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>O Agente de IA está formulando a resposta...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Pergunte ao Agente sobre ${baseSymbol} ou estratégias...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
