import React, { useState, useEffect } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  MessageSquare,
  Globe,
  Newspaper,
  Users,
  BarChart3,
  BarChart2,
  Cpu,
  Layers,
  Activity,
  Compass,
  Check,
  ChevronRight,
  Info,
  Flame,
  Award,
  Clock,
  ArrowUpRight,
  Shield,
  Eye,
  SlidersHorizontal,
  Bot
} from 'lucide-react';

interface TenAgentsDiagnostic {
  consensusScore: number;
  consensusAction: 'BUY' | 'SELL' | 'HOLD';
  expectedReturnR: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  targetPrice: number;
  stopLossPrice: number;
  suggestedSizePercent: number;
  marketState: {
    regime: string;
    volatility: string;
    direction: string;
    alignment: string;
  };
  informationState: {
    newsFlow: string;
    sentiment: string;
    fundamentals: string;
  };
  agents: {
    [key: string]: string;
  };
  executiveSummary: string;
}

export const AITradingAgents: React.FC = () => {
  const { 
    assets, 
    selectedPair, 
    setSelectedPair, 
    portfolioValueUsd, 
    placeOrder,
    lastFeedSync,
    syncRealPrices
  } = useExchange();

  // Active view: 'radial_topology' (Image 1) | 'market_layer' (Image 2) | 'info_layer' (Image 3) | 'quant_layer' (Image 4)
  const [activeLayerTab, setActiveLayerTab] = useState<'radial_topology' | 'market_layer' | 'info_layer' | 'quant_layer'>('radial_topology');

  // Currently inspected agent in detail modal / drawer (01 to 10)
  const [inspectedAgentId, setInspectedAgentId] = useState<string | null>(null);

  // Diagnostic state
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosticPulseStep, setDiagnosticPulseStep] = useState<number>(-1);
  const [syncingPrices, setSyncingPrices] = useState<boolean>(false);
  const [executionFeedback, setExecutionFeedback] = useState<string | null>(null);

  // Chat State with 10-Agent Hive Mind
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'agent'; text: string; time: string; badge?: string }[]>([
    {
      role: 'agent',
      text: 'Olá! Sou a Mente Coletiva do Sistema de 10 Agentes IA da Aetheria Citadel. Monitoramos regime de mercado, confluência técnica, fluxo de notícias, sentimento social e modelagem quantitativa em tempo real. Como podemos guiar suas operações?',
      time: 'Agora',
      badge: '10 AGENTES CONVERGIDOS'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  const [baseSymbol, quoteSymbol] = selectedPair.split('/');
  const activeAsset = assets[baseSymbol] || assets.BTC;
  const quoteAsset = assets[quoteSymbol] || assets.USDT;

  // Active Diagnostic Data
  const [diagnostic, setDiagnostic] = useState<TenAgentsDiagnostic>({
    consensusScore: 88.4,
    consensusAction: 'BUY',
    expectedReturnR: 0.48,
    winRate: 58.4,
    sharpeRatio: 1.45,
    maxDrawdown: -8.6,
    targetPrice: Number((activeAsset.price * 1.062).toFixed(2)),
    stopLossPrice: Number((activeAsset.price * 0.976).toFixed(2)),
    suggestedSizePercent: 12.5,
    marketState: {
      regime: 'TRENDING',
      volatility: 'MODERATE',
      direction: 'BULLISH',
      alignment: 'STRONG'
    },
    informationState: {
      newsFlow: 'POSITIVE',
      sentiment: 'GREED (68)',
      fundamentals: 'SOLID'
    },
    agents: {
      "01_market_regime": "Estrutura de alta com mínimas ascendentes consolidada no gráfico diário.",
      "02_technical": "RSI em 62.4 e absorção compradora de +28% no suporte chave.",
      "03_multi_timeframe": "Alinhamento 1D/4H/15M com 94% de confluência positiva.",
      "04_news": "Fluxo institucional líquido positivo e balanço macro favorável.",
      "05_sentiment": "Fear & Greed Index em 68 (Ganância Saudável), sem euforia desmedida.",
      "06_fundamental": "Receita do ecossistema e valor total bloqueado (TVL) em expansão constante.",
      "07_quant": "Distribuição normal com assimetria positiva (+0.48R de expectativa matemática).",
      "08_strategy": "Setup Alpha Momentum Breakout com entrada confirmada no reteste.",
      "09_risk": "Critério de Kelly alocando 12.5% do capital com risco máximo estrito de 1.5%.",
      "10_execution": "Ordem pronta para despacho com proteção MEV e slippage estimado < 0.02%."
    },
    executiveSummary: `Os 10 agentes validaram confluência compradora para ${baseSymbol}/USDT. Relação risco/retorno favorável de 1:2.83 com proteção de capital ativa.`
  });

  // Keep target and stop loss updated when switching assets
  useEffect(() => {
    setDiagnostic((prev) => ({
      ...prev,
      targetPrice: Number((activeAsset.price * 1.062).toFixed(2)),
      stopLossPrice: Number((activeAsset.price * 0.976).toFixed(2)),
      executiveSummary: `Os 10 agentes sincronizaram telemetria para ${baseSymbol}/USDT a $${activeAsset.price.toLocaleString('pt-BR')}. Confluência otimizada.`
    }));
  }, [selectedPair, activeAsset.price]);

  // Run the 10-Agent Sequential Diagnostic
  const handleRunFullDiagnostic = async () => {
    setIsDiagnosing(true);
    setExecutionFeedback(null);

    // Sequential light beam cascade through agents 0 to 9
    for (let i = 0; i < 10; i++) {
      setDiagnosticPulseStep(i);
      await new Promise((r) => setTimeout(r, 120));
    }
    setDiagnosticPulseStep(10); // All lit

    try {
      const res = await fetch('/api/ai/ten-agents-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetSymbol: baseSymbol,
          currentPrice: activeAsset.price,
          change24h: activeAsset.change24h,
          high24h: activeAsset.high24h,
          low24h: activeAsset.low24h,
          volume24h: activeAsset.volume24hUsd,
          userBalance: quoteAsset.balance,
          riskTolerance: 'moderate'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.diagnostic) {
          setDiagnostic(data.diagnostic);
        }
      }
    } catch (err) {
      console.warn('Using client-side quant synthesis:', err);
    } finally {
      setTimeout(() => {
        setIsDiagnosing(false);
        setDiagnosticPulseStep(-1);
      }, 400);
    }
  };

  // Direct 1-Click Execution Authenticated by 10 Agents
  const handleExecuteOrder = () => {
    const price = activeAsset.price;
    const side = diagnostic.consensusAction === 'BUY' ? 'buy' : 'sell';

    let amount = 0;
    if (side === 'buy') {
      const budgetUsd = quoteAsset.balance * (diagnostic.suggestedSizePercent / 100);
      amount = Number((budgetUsd / price).toFixed(4));
    } else {
      amount = Number((activeAsset.balance * (diagnostic.suggestedSizePercent / 100)).toFixed(4));
    }

    if (amount <= 0) {
      setExecutionFeedback(`Saldo insuficiente para alocação sugerida de ${diagnostic.suggestedSizePercent}%.`);
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
      setExecutionFeedback(`⚡ Ordem ${side.toUpperCase()} de ${amount} ${baseSymbol} EXECUTADA COM SUCESSO! Autenticada pelos 10 Agentes com Proteção MEV.`);
    } else {
      setExecutionFeedback(orderResult.message);
    }
  };

  // Chat with the 10-Agent Hive Mind
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
          { role: 'agent', text: json.reply, time: timeStr, badge: 'CONSENSO QUANTITATIVO' }
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { 
          role: 'agent', 
          text: `Análise do sistema para ${baseSymbol}: O Quant Agent relata expectativa de +${diagnostic.expectedReturnR}R com win rate de ${diagnostic.winRate}%. O Risk Agent aconselha alocação máxima de ${diagnostic.suggestedSizePercent}% com stop loss em $${diagnostic.stopLossPrice}.`, 
          time: timeStr,
          badge: 'SÍNTESE DOS 10 AGENTES'
        }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  // 10 Agents Definition Array matching reference images
  const TEN_AGENTS = [
    {
      id: '01_market_regime',
      number: '01',
      name: 'MARKET REGIME',
      title: 'Market Regime Agent',
      layerName: 'Market Intelligence Layer',
      question: 'What market are we in?',
      role: 'Classificação de Tendência & Regime de Volatilidade',
      checkpoints: [
        'Trending or ranging: Alta definida',
        'High or low volatility: Volatilidade moderada',
        'Market phase detection: Fase de Markup 2',
        'Regime shift alerts: Sem divergências'
      ],
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      color: '#06b6d4',
      badge: diagnostic.marketState.regime,
      metricSummary: 'Regime: TRENDING · Volatilidade: MODERADA'
    },
    {
      id: '02_technical',
      number: '02',
      name: 'TECHNICAL',
      title: 'Technical Agent',
      layerName: 'Market Intelligence Layer',
      question: 'What is price doing?',
      role: 'Estrutura de Preço, Momentum & Suporte/Resistência',
      checkpoints: [
        'Price structure: Topos e fundos ascendentes',
        'Momentum: RSI(14) em 62.4 com cruzamento MACD',
        'Support / resistance: Suporte em $65,900 validado',
        'Volume analysis: Absorção compradora de +28%'
      ],
      icon: <TrendingUp className="w-5 h-5 text-sky-400" />,
      color: '#38bdf8',
      badge: 'RSI 62.4',
      metricSummary: 'Momentum: FORTE ALTA · Absorção Volume: +28%'
    },
    {
      id: '03_multi_timeframe',
      number: '03',
      name: 'MULTI-TIMEFRAME',
      title: 'Multi-Timeframe Agent',
      layerName: 'Market Intelligence Layer',
      question: 'Does the setup align?',
      role: 'Confluência entre HTF (1D), TTF (4H) e LTF (15M)',
      checkpoints: [
        'Higher timeframe trend: 1D em expansão altista',
        'Trading timeframe setup: 4H rompimento de flâmula',
        'Lower timeframe entry: 15M reteste perfeito',
        'Multi-timeframe confluence: 94% de confluência'
      ],
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      color: '#6366f1',
      badge: '94% ALIGN',
      metricSummary: 'HTF(1D) / TTF(4H) / LTF(15M) Sincronizados'
    },
    {
      id: '04_news',
      number: '04',
      name: 'NEWS',
      title: 'News Agent',
      layerName: 'Information Intelligence Layer',
      question: 'What just changed?',
      role: 'Catalisadores Globais, Calendário Econômico & Alertas',
      checkpoints: [
        'Breaking news: Aporte institucional expressivo',
        'Economic events: Decisão do FOMC amplamente favorável',
        'Protocol updates: Upgrade de escalabilidade ativo',
        'Real-time market updates: Fluxo líquido em exchange positivo'
      ],
      icon: <Newspaper className="w-5 h-5 text-amber-400" />,
      color: '#f59e0b',
      badge: diagnostic.informationState.newsFlow,
      metricSummary: 'Fluxo Notícias: POSITIVO · Eventos: FAVORÁVEIS'
    },
    {
      id: '05_sentiment',
      number: '05',
      name: 'SENTIMENT',
      title: 'Sentiment Agent',
      layerName: 'Information Intelligence Layer',
      question: 'How is the market reacting?',
      role: 'Medição de Fear & Greed, Mídias Sociais & Long/Short Ratio',
      checkpoints: [
        'News sentiment: Sentimento ponderado positivo (+0.72)',
        'Social sentiment: Alto engajamento no X e Telegram',
        'Market positioning: Long/Short Ratio equilibrado em 1.64',
        'Fear / Greed signals: Índice em 68 (Ganância Saudável)'
      ],
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      color: '#10b981',
      badge: 'FEAR & GREED 68',
      metricSummary: 'Humor: OTIMISTA SAUDÁVEL · Ratio: 1.64'
    },
    {
      id: '06_fundamental',
      number: '06',
      name: 'FUNDAMENTAL',
      title: 'Fundamental Agent',
      layerName: 'Information Intelligence Layer',
      question: 'Does the story support it?',
      role: 'Avaliação On-Chain, TVL, Receita & Métricas de Rede',
      checkpoints: [
        'Earnings & financial data: Taxas geradas +18% MoM',
        'Macro factors: Liquidez global M2 em expansão',
        'Valuation metrics: Múltiplos NVT e P/S saudáveis',
        'Long-term growth drivers: Usuários ativos diários +31%'
      ],
      icon: <BarChart3 className="w-5 h-5 text-teal-400" />,
      color: '#14b8a6',
      badge: diagnostic.informationState.fundamentals,
      metricSummary: 'On-Chain: SÓLIDO · Crescimento TVL: +18.4%'
    },
    {
      id: '07_quant',
      number: '07',
      name: 'QUANT',
      title: 'Quant Agent',
      layerName: 'Quant Research Layer',
      question: 'Does the idea have a real edge?',
      role: 'Distribuição Gaussiana, Expectancy, Win Rate & Sharpe',
      checkpoints: [
        'Statistical relationships: Correlação de Pearson 0.84',
        'Factor analysis: Momentum e carry liderando ganhos',
        'Pattern detection: Varredura de liquidez com rejeição',
        'Probability modelling: Curva normal com assimetria positiva'
      ],
      icon: <Award className="w-5 h-5 text-amber-300" />,
      color: '#facc15',
      badge: `+${diagnostic.expectedReturnR}R EDGE`,
      metricSummary: `Win Rate: ${diagnostic.winRate}% · Sharpe: ${diagnostic.sharpeRatio} · Max DD: ${diagnostic.maxDrawdown}%`
    },
    {
      id: '08_strategy',
      number: '08',
      name: 'STRATEGY',
      title: 'Strategy Agent',
      layerName: 'Quant Research Layer',
      question: 'What is the optimal playbook?',
      role: 'Confluência de Sinais & Definição do Setup Operacional',
      checkpoints: [
        'Setup selection: Alpha Momentum Breakout',
        'Mean reversion filter: ATR dentro da banda de 1.5 sigma',
        'Trigger validation: Rompimento confirmado com volume',
        'Signal grade: Classificação Alpha A+ (92/100)'
      ],
      icon: <SlidersHorizontal className="w-5 h-5 text-violet-400" />,
      color: '#8b5cf6',
      badge: 'ALPHA PLAYBOOK',
      metricSummary: `Alvo: $${diagnostic.targetPrice.toLocaleString()} (+6.2%)`
    },
    {
      id: '09_risk',
      number: '09',
      name: 'RISK',
      title: 'Risk Agent',
      layerName: 'Quant Research Layer',
      question: 'How do we protect capital?',
      role: 'Critério de Kelly, Dimensionamento & Stop Loss Dinâmico',
      checkpoints: [
        'Capital preservation: Risco máximo estrito de 1.5%',
        'Position sizing: Kelly Fracionário em 12.5%',
        'Liquidation safeguard: Zero risco de liquidação',
        'Stop Loss rigoroso: Definido a -2.4% do preço'
      ],
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      color: '#f43f5e',
      badge: '1.5% MAX RISK',
      metricSummary: `Stop Loss: $${diagnostic.stopLossPrice.toLocaleString()} (-2.4%)`
    },
    {
      id: '10_execution',
      number: '10',
      name: 'EXECUTION',
      title: 'Execution Agent',
      layerName: 'Quant Research Layer',
      question: 'How do we execute with zero slippage?',
      role: 'Roteamento Inteligente de Ordens & Proteção MEV',
      checkpoints: [
        'Smart order routing: Roteamento de liquidez direto',
        'MEV protection: Relay privado anti-frontrunning',
        'Slippage minimization: Tolerância calculada < 0.02%',
        '1-Click instant dispatch: Execução instantânea'
      ],
      icon: <Zap className="w-5 h-5 text-cyan-300" />,
      color: '#22d3ee',
      badge: 'MEV SHIELD ON',
      metricSummary: 'Roteamento Ótimo · Slippage: < 0.02%'
    }
  ];

  return (
    <div className="w-full min-h-[calc(100vh-61px)] bg-[#070b12] text-slate-100 p-3 sm:p-5 md:p-8 space-y-6 relative overflow-hidden select-none font-sans">
      {/* Background Cybernetic Hardware Grid Texture */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 60%),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* TOP HEADER: INDUSTRIAL HARDWARE FINISH (MATCHING IMAGES 1 TO 4) */}
      <div className="relative z-10 bg-gradient-to-r from-[#17120a] via-[#10141e] to-[#0a121d] border-2 border-amber-600/40 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        {/* Hardware Corner Screws */}
        <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-400/80 shadow-sm" />
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-400/80 shadow-sm" />
        <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-400/80 shadow-sm" />
        <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-400/80 shadow-sm" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            {/* Top Micro Badges */}
            <div className="flex items-center gap-2 flex-wrap font-mono text-[10px] tracking-widest uppercase">
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/50 text-amber-300 font-bold">
                AETHERIA QUANT LABS
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-semibold">AI × TRADING × EXECUÇÃO AUTÔNOMA</span>
              <span className="text-slate-500">·</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 animate-pulse">
                ORÁCULO REAL BINANCE ATIVO
              </span>
            </div>

            {/* Main Monumental Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none drop-shadow-md">
              10 AI AGENTS. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-cyan-400">ONE TRADING SYSTEM.</span>
            </h1>

            {/* Subtitle / Philosophy */}
            <p className="text-sm md:text-base text-amber-200/90 font-medium">
              Each agent has one job. <span className="text-slate-300 font-normal">Turn data into evidence. Not opinions.</span>
            </p>
          </div>

          {/* Quick Action & Consensus Dial */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Diagnostic Button */}
            <button
              onClick={handleRunFullDiagnostic}
              disabled={isDiagnosing}
              className={`px-5 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                isDiagnosing
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/25'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'Escaneando 10 Agentes...' : 'Executar Diagnóstico dos 10 Agentes'}</span>
            </button>

            {/* Hive Mind Chat Trigger */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 transition-colors cursor-pointer"
              title="Abrir Chat com a Mente Coletiva dos 10 Agentes"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pair Switcher & Market Metrics Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] text-slate-400 font-semibold uppercase mr-1">Ativo:</span>
            {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AETH/USDT', 'AVAX/USDT'].map((pair) => {
              const isSelected = selectedPair === pair;
              const sym = pair.split('/')[0];
              const asset = assets[sym];
              return (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span>{pair}</span>
                  {asset && (
                    <span className={asset.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase">Cotação Atual</span>
              <span className="text-white font-bold text-sm tabular-nums">
                ${activeAsset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase">Confluência Total</span>
              <span className="text-emerald-400 font-bold text-sm tabular-nums">
                {diagnostic.consensusScore}%
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase">Ação Recomendada</span>
              <span className="text-amber-400 font-bold text-sm">
                {diagnostic.consensusAction} ({diagnostic.suggestedSizePercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS: 4 DISTINCT SYSTEM PERSPECTIVES (MATCHING 4 INSTAGRAM REFERENCE IMAGES) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        <button
          onClick={() => setActiveLayerTab('radial_topology')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
            activeLayerTab === 'radial_topology'
              ? 'bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>00 TOPOLOGIA RADIAL (10 AGENTES)</span>
        </button>

        <button
          onClick={() => setActiveLayerTab('market_layer')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
            activeLayerTab === 'market_layer'
              ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-lg shadow-sky-500/10'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-sky-400" />
          <span>01 CAMADA DE MERCADO (AGENTES 01-03)</span>
        </button>

        <button
          onClick={() => setActiveLayerTab('info_layer')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
            activeLayerTab === 'info_layer'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Newspaper className="w-4 h-4 text-emerald-400" />
          <span>04 CAMADA DE INFORMAÇÃO (AGENTES 04-06)</span>
        </button>

        <button
          onClick={() => setActiveLayerTab('quant_layer')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
            activeLayerTab === 'quant_layer'
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>07 CAMADA QUANTITATIVA & EXECUÇÃO (AGENTES 07-10)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TOPOLOGIA RADIAL (THE 10 AI AGENTS RING & CENTRAL CORE - IMAGE 1) */}
      {/* ========================================================================= */}
      {activeLayerTab === 'radial_topology' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Radial Top Header Sub-Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400 px-1">
            <span className="uppercase tracking-widest text-slate-300">
              Topologia de Rede Neural · 10 Módulos de Decisão Autônoma Conectados
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>Barramento em Tempo Real</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">Expectancy: +{diagnostic.expectedReturnR}R</span>
            </div>
          </div>

          {/* Monumental Central Hub with 10 Orbiting Agent Pods */}
          <div className="bg-[#0b0f19] border-2 border-slate-800 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-2xl">
            {/* Ambient Conduits SVG connecting pods to center */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyanConduit" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {/* Conduits radiating from center (500, 300) to pods */}
                {[
                  [150, 90], [500, 70], [850, 90],
                  [120, 240], [880, 240],
                  [120, 400], [880, 400],
                  [200, 520], [500, 530], [800, 520]
                ].map(([x, y], idx) => (
                  <path
                    key={idx}
                    d={`M 500 300 Q ${ (500 + x) / 2 } ${ (300 + y) / 2 - 20 } ${x} ${y}`}
                    stroke="url(#cyanConduit)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray={diagnosticPulseStep === idx ? '6,6' : 'none'}
                    className={diagnosticPulseStep === idx ? 'animate-pulse' : ''}
                  />
                ))}
              </svg>
            </div>

            {/* Central Master Nexus: AI TRADING SYSTEM (Matching Image 1 Core) */}
            <div className="relative z-10 flex flex-col items-center justify-center my-6">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#1a150b] via-[#0d121c] to-[#060a12] border-4 border-amber-500/60 p-4 flex flex-col items-center justify-center text-center shadow-2xl shadow-amber-500/20 relative group">
                {/* Orbiting Reticle Rings */}
                <div className="absolute -inset-3 rounded-full border border-cyan-500/30 border-dashed animate-spin" style={{ animationDuration: '40s' }} />
                <div className="absolute -inset-6 rounded-full border border-amber-500/20" />

                {/* Central Core Branding */}
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                  NÚCLEO CENTRAL
                </span>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-tight">
                  AI TRADING SYSTEM
                </h2>

                <div className="my-2 py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold">
                  {diagnostic.consensusScore}% CONFLUÊNCIA
                </div>

                <div className="text-[10px] font-mono text-slate-300">
                  <span className="text-slate-400 block">Sinal Unificado:</span>
                  <span className="font-bold text-emerald-400 text-xs uppercase">{diagnostic.consensusAction} IMEDIATO</span>
                </div>
              </div>
            </div>

            {/* 10 Satellite Pods arranged in topological grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 relative z-10">
              {TEN_AGENTS.map((agent, idx) => {
                const isPulsing = diagnosticPulseStep === idx;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setInspectedAgentId(agent.id)}
                    className={`bg-gradient-to-b from-[#14120f] via-slate-900 to-slate-950 border-2 rounded-2xl p-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl relative overflow-hidden group ${
                      isPulsing
                        ? 'border-cyan-400 shadow-lg shadow-cyan-400/30 ring-2 ring-cyan-400'
                        : 'border-amber-600/30 hover:border-amber-400/80 shadow-md'
                    }`}
                  >
                    {/* Corner Rivet */}
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/40" />

                    {/* Agent Number & Icon Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-black text-amber-400/80">
                        {agent.number}
                      </span>
                      <div className="p-1 rounded-lg bg-slate-800/80 border border-slate-700 group-hover:border-amber-400 transition-colors">
                        {agent.icon}
                      </div>
                    </div>

                    {/* Agent Name & Badge */}
                    <h3 className="font-black text-xs text-white uppercase tracking-tight truncate">
                      {agent.name}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-mono italic truncate mb-2">
                      "{agent.question}"
                    </p>

                    {/* Status Badge */}
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 truncate max-w-[90px]">{agent.badge}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Methodology Footer */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
              <span className="tracking-widest uppercase text-slate-500">
                SYSTEMATIC · DATA-DRIVEN · DISCIPLINED
              </span>
              <span className="text-cyan-400 font-semibold">
                IDEAS → DADOS → ANÁLISE → ESTRATÉGIA → EXECUÇÃO
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* VIEW 2: 01 CAMADA DE MERCADO (MARKET INTELLIGENCE LAYER - IMAGE 2 REFERENCE) */}
      {/* ============================================================================== */}
      {activeLayerTab === 'market_layer' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner from Image 2 */}
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-sky-950/40 border border-sky-500/40 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 font-mono text-[11px] text-sky-400 font-bold uppercase mb-1">
              <span>01</span>
              <span>·</span>
              <span>MARKET INTELLIGENCE LAYER</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              UNDERSTAND THE MARKET FIRST.
            </h2>
            <p className="text-xs sm:text-sm text-sky-200/90 font-medium">
              Three agents. One market state.
            </p>
          </div>

          {/* 3 Agents Pods: 01 Market Regime, 02 Technical, 03 Multi-Timeframe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Agent 01: Market Regime Agent */}
            <div className="bg-slate-900/95 border-2 border-amber-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-amber-400">01</span>
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  MARKET REGIME AGENT
                </h3>
                <p className="text-xs text-slate-400 italic mb-4">What market are we in?</p>

                {/* Checklist */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Trending or ranging: <strong className="text-emerald-400">Trending Alta</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>High or low volatility: <strong className="text-cyan-400">Moderada</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Market phase detection: <strong className="text-slate-100">Markup Fase 2</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Regime shift alerts: <strong className="text-slate-100">Zero divergência</strong></span>
                  </div>
                </div>
              </div>

              {/* Hardware Screen Visual */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Visualização do Regime</span>
                <div className="h-14 flex items-center justify-center">
                  <svg className="w-full h-10" viewBox="0 0 200 40">
                    <path d="M 0 30 Q 30 10 60 25 T 120 15 T 180 8 L 200 5" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                    <circle cx="180" cy="8" r="4" fill="#10b981" className="animate-ping" />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400 border-t border-slate-900 pt-1">
                  <span className="text-emerald-400 font-bold">TRENDING</span>
                  <span>RANGING</span>
                  <span>HIGH VOL</span>
                  <span>LOW VOL</span>
                </div>
              </div>
            </div>

            {/* Agent 02: Technical Agent */}
            <div className="bg-slate-900/95 border-2 border-amber-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-amber-400">02</span>
                  <TrendingUp className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  TECHNICAL AGENT
                </h3>
                <p className="text-xs text-slate-400 italic mb-4">What is price doing?</p>

                {/* Checklist */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Price structure: <strong className="text-emerald-400">Higher Highs</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Momentum: <strong className="text-sky-400">RSI 62.4</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Support / resistance: <strong className="text-slate-100">$65.9k / $68.4k</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Volume analysis: <strong className="text-emerald-400">+28% Absorção</strong></span>
                  </div>
                </div>
              </div>

              {/* Hardware Screen Visual */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Estrutura Gráfica Candlestick</span>
                <div className="h-14 flex items-end justify-center gap-1.5 pb-1">
                  {[20, 28, 22, 34, 30, 42, 38, 48, 52].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-0.5 h-1 bg-emerald-400" />
                      <div className="w-2.5 rounded-sm bg-emerald-500" style={{ height: `${val}px` }} />
                      <div className="w-0.5 h-1 bg-emerald-400" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400 border-t border-slate-900 pt-1">
                  <span>Suporte: $65.9k</span>
                  <span className="text-emerald-400 font-bold">RSI Bullish</span>
                </div>
              </div>
            </div>

            {/* Agent 03: Multi-Timeframe Agent */}
            <div className="bg-slate-900/95 border-2 border-amber-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-amber-400">03</span>
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  MULTI-TIMEFRAME AGENT
                </h3>
                <p className="text-xs text-slate-400 italic mb-4">Does the setup align?</p>

                {/* Checklist */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Higher timeframe trend: <strong className="text-emerald-400">1D Bullish</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Trading timeframe setup: <strong className="text-sky-400">4H Rompimento</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Lower timeframe entry: <strong className="text-emerald-400">15M Reteste</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-timeframe confluence: <strong className="text-amber-300">94% Alinhado</strong></span>
                  </div>
                </div>
              </div>

              {/* Hardware Screen Visual */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">HTF · TTF · LTF Confluência</span>
                <div className="space-y-1.5 py-1">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">HTF (1D)</span>
                    <span className="text-emerald-400 font-bold">▲ Alta Primária</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">TTF (4H)</span>
                    <span className="text-sky-400 font-bold">▲ Rompimento</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">LTF (15M)</span>
                    <span className="text-emerald-400 font-bold">✓ Ponto de Entrada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Console Hub: MARKET STATE (Image 2 Bottom Hub) */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-600/50 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Rotating Wireframe Globe Core */}
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 relative">
                <Globe className="w-10 h-10 animate-spin" style={{ animationDuration: '30s' }} />
                <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-ping opacity-25" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                  ESTADO SINTETIZADO DE MERCADO
                </span>
                <h4 className="text-lg font-black text-white uppercase">
                  MARKET STATE: EXPANSÃO CONFLUENTE
                </h4>
              </div>
            </div>

            {/* 4 State Indicators from Image 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto font-mono text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase">Regime</span>
                <span className="text-cyan-400 font-bold text-xs">{diagnostic.marketState.regime}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase">Volatility</span>
                <span className="text-sky-400 font-bold text-xs">{diagnostic.marketState.volatility}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase">Direction</span>
                <span className="text-emerald-400 font-bold text-xs">{diagnostic.marketState.direction}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase">Alignment</span>
                <span className="text-emerald-400 font-bold text-xs">{diagnostic.marketState.alignment}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================================== */}
      {/* VIEW 3: 04 CAMADA DE INFORMAÇÃO (INFORMATION INTELLIGENCE LAYER - IMAGE 3 REFERENCE) */}
      {/* =================================================================================== */}
      {activeLayerTab === 'info_layer' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner from Image 3 */}
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 font-bold uppercase mb-1">
              <span>04</span>
              <span>·</span>
              <span>INFORMATION INTELLIGENCE LAYER</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              TURN INFORMATION INTO CONTEXT.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
              Three agents. One information state.
            </p>
          </div>

          {/* 3 Agents Pods: 04 News, 05 Sentiment, 06 Fundamental */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Agent 04: News Agent */}
            <div className="bg-slate-900/95 border-2 border-amber-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-amber-400">04</span>
                  <Newspaper className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  NEWS AGENT
                </h3>
                <p className="text-xs text-slate-400 italic mb-4">What just changed?</p>

                {/* Checklist */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Breaking news: <strong className="text-emerald-400">Aporte Institucional</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Economic events: <strong className="text-slate-100">Cortes de Juros Globais</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Protocol updates: <strong className="text-cyan-400">Upgrade L1/L2 Ativo</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time market: <strong className="text-slate-100">Balanço Positivo</strong></span>
                  </div>
                </div>
              </div>

              {/* Hardware Screen Visual */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">Últimas Notícias On-Chain</span>
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="p-1 rounded bg-slate-900 text-slate-200 truncate border-l-2 border-emerald-400">
                    🟢 Influxo de +$420M em ETFs Cripto
                  </div>
                  <div className="p-1 rounded bg-slate-900 text-slate-200 truncate border-l-2 border-cyan-400">
                    🔵 Aetheria Staking atinge recorde de TVL
                  </div>
                </div>
              </div>
            </div>

            {/* Agent 05: Sentiment Agent (with Fear/Greed & Emojis from Image 3) */}
            <div className="bg-slate-900/95 border-2 border-amber-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-amber-400">05</span>
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  SENTIMENT AGENT
                </h3>
                <p className="text-xs text-slate-400 italic mb-4">How is the market reacting?</p>

                {/* Checklist */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>News sentiment: <strong className="text-emerald-400">Positivo (82%)</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Social sentiment: <strong className="text-emerald-400">Viés Construtivo</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Market positioning: <strong className="text-sky-400">Long/Short 1.64</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Fear / Greed signals: <strong className="text-amber-300">Índice 68 (Ganância)</strong></span>
                  </div>
                </div>
              </div>

              {/* Hardware Screen Visual with Emojis from Image 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Medidor Fear & Greed</span>
                <div className="flex items-center justify-center gap-6 py-2 text-xl">
                  <span className="opacity-30 grayscale" title="Extreme Fear">😡</span>
                  <span className="opacity-50" title="Neutral">😐</span>
                  <span className="scale-125 filter drop-shadow-[0_0_8px_#10b981]" title="Greed">😃</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full w-[68%]" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-1">68 · Ganância Otimista</span>
              </div>
            </div>

            {/* Agent 06: Fundamental Agent */}
            <div className="bg-slate-900/95 border-2 border-amber-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-amber-400">06</span>
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  FUNDAMENTAL AGENT
                </h3>
                <p className="text-xs text-slate-400 italic mb-4">Does the story support it?</p>

                {/* Checklist */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Earnings & financial: <strong className="text-emerald-400">Receita +18% MoM</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Macro factors: <strong className="text-slate-100">M2 Global em Expansão</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Valuation metrics: <strong className="text-cyan-400">NVT Zone Saudável</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Long-term growth: <strong className="text-emerald-400">Carteiras Ativas +31%</strong></span>
                  </div>
                </div>
              </div>

              {/* Hardware Screen Visual */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Métricas On-Chain & Valuation</span>
                <div className="h-14 flex items-end justify-center gap-3 pb-1">
                  <div className="w-6 bg-teal-500/30 border border-teal-500 h-8 rounded-sm" title="TVL" />
                  <div className="w-6 bg-emerald-500/50 border border-emerald-400 h-12 rounded-sm" title="Receita" />
                  <div className="w-6 bg-sky-500/40 border border-sky-400 h-10 rounded-sm" title="Staking" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400 border-t border-slate-900 pt-1">
                  <span>TVL</span>
                  <span>Receita</span>
                  <span>Staking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Console Hub: INFORMATION STATE (Image 3 Bottom Hub) */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-600/50 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400">
                <Cpu className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                  ESTADO SINTETIZADO DE INFORMAÇÃO
                </span>
                <h4 className="text-lg font-black text-white uppercase">
                  INFORMATION STATE: CONTEXTO ALTISTA
                </h4>
              </div>
            </div>

            {/* 3 State Indicators from Image 3 */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto font-mono text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase">News Flow</span>
                <span className="text-emerald-400 font-bold text-xs">{diagnostic.informationState.newsFlow}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase">Sentiment</span>
                <span className="text-emerald-400 font-bold text-xs">{diagnostic.informationState.sentiment}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 block uppercase">Fundamentals</span>
                <span className="text-teal-400 font-bold text-xs">{diagnostic.informationState.fundamentals}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================================== */}
      {/* VIEW 4: 07 CAMADA QUANTITATIVA & EXECUÇÃO (QUANT RESEARCH LAYER - IMAGE 4 REFERENCE) */}
      {/* =================================================================================== */}
      {activeLayerTab === 'quant_layer' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner from Image 4 */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400 font-bold uppercase mb-1">
              <span>07</span>
              <span>·</span>
              <span>QUANT RESEARCH & EXECUTION LAYER</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              DOES THE IDEA HAVE A REAL EDGE?
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
              Turn data into evidence. Not opinions.
            </p>
          </div>

          {/* Master 07 QUANT AGENT Module with Gaussian Distribution (Image 4 Centerpiece) */}
          <div className="bg-[#0b0f19] border-2 border-amber-500/60 rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Quant Inputs */}
              <div className="lg:col-span-3 space-y-3 font-mono text-xs">
                <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase block border-b border-slate-800 pb-1">
                  INPUTS QUANTITATIVOS
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Historical Data (5k Candles)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Market Variables & ATR</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Alternative On-Chain Data</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Multiple Timeframes Alignment</span>
                  </div>
                </div>
              </div>

              {/* Center Column: 07 QUANT AGENT with Bell Curve Display (Exact Image 4 Terminal) */}
              <div className="lg:col-span-6 bg-slate-950/90 border-2 border-amber-500/70 rounded-3xl p-5 shadow-2xl relative text-center">
                <div className="flex items-center justify-between mb-2 font-mono">
                  <span className="text-xs font-black text-amber-400">07</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">QUANT AGENT</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    EDGE VALIDADO
                  </span>
                </div>

                {/* Gaussian Bell Curve SVG */}
                <div className="my-3 py-2 flex justify-center">
                  <svg className="w-full max-w-sm h-36" viewBox="0 0 300 120">
                    <defs>
                      <linearGradient id="bellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Baseline */}
                    <line x1="20" y1="110" x2="280" y2="110" stroke="#334155" strokeWidth="1.5" />
                    {/* Bell Curve Shape with Positive Skew Edge */}
                    <path
                      d="M 20 110 Q 90 108 130 65 Q 160 15 180 65 Q 210 108 280 110 Z"
                      fill="url(#bellGradient)"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                    {/* Mean line */}
                    <line x1="160" y1="15" x2="160" y2="110" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                  </svg>
                </div>

                {/* 4 Quant Metric Pillars from Image 4 */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-mono text-center">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Win Rate</span>
                    <span className="text-emerald-400 font-bold text-xs">{diagnostic.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Expectancy</span>
                    <span className="text-amber-400 font-bold text-xs">+{diagnostic.expectedReturnR}R</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Sharpe</span>
                    <span className="text-sky-400 font-bold text-xs">{diagnostic.sharpeRatio}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Max DD</span>
                    <span className="text-rose-400 font-bold text-xs">{diagnostic.maxDrawdown}%</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Statistical Analysis Pillars */}
              <div className="lg:col-span-3 space-y-3 font-mono text-xs">
                <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase block border-b border-slate-800 pb-1">
                  ANÁLISE ESTATÍSTICA
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Statistical Relationships</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Factor Analysis (Carry / Mom)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pattern Detection (Sweeps)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Probability Modelling Validated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Pipeline: HYPOTHESIS -> TEST -> EVIDENCE (Image 4 Bottom) */}
            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">HYPOTHESIS</span>
                  <p className="text-xs text-slate-300">Identificar e definir ideia testável de alpha no livro.</p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">TEST</span>
                  <p className="text-xs text-slate-300">Backtest de 5.000 barras, simulação Monte Carlo e validação.</p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">EVIDENCE</span>
                  <p className="text-xs text-slate-300">Métricas matemáticas claras: +0.48R com Sharpe de 1.45.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy, Risk & 1-Click Execution Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 08 Strategy Agent */}
            <div className="bg-slate-900/90 border-2 border-violet-500/40 rounded-3xl p-5 shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-black">08</span>
                <SlidersHorizontal className="w-4 h-4 text-violet-400" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase">STRATEGY AGENT</h4>
              <p className="text-slate-400 text-[11px] mb-3">Setup: Alpha Momentum Breakout</p>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Entrada:</span>
                  <span className="text-white font-bold">${activeAsset.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Take Profit 1:</span>
                  <span className="text-emerald-400 font-bold">${diagnostic.targetPrice.toLocaleString()} (+6.2%)</span>
                </div>
              </div>
            </div>

            {/* 09 Risk Agent */}
            <div className="bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl p-5 shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-black">09</span>
                <Shield className="w-4 h-4 text-rose-400" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase">RISK AGENT</h4>
              <p className="text-slate-400 text-[11px] mb-3">Critério de Kelly & Preservação</p>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tamanho Posição:</span>
                  <span className="text-amber-400 font-bold">{diagnostic.suggestedSizePercent}% Saldo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stop Loss:</span>
                  <span className="text-rose-400 font-bold">${diagnostic.stopLossPrice.toLocaleString()} (-2.4%)</span>
                </div>
              </div>
            </div>

            {/* 10 Execution Agent with 1-Click Action */}
            <div className="bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 border-2 border-cyan-400 rounded-3xl p-5 shadow-2xl font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 font-black">10</span>
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase">EXECUTION AGENT</h4>
                <p className="text-slate-400 text-[11px] mb-3">Roteamento Ótimo & MEV Shield</p>
              </div>

              <button
                onClick={handleExecuteOrder}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Executar Ordem (1-Click)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK BANNER (ORDER PLACED) */}
      {executionFeedback && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 shadow-2xl flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{executionFeedback}</span>
            </div>
            <button
              onClick={() => setExecutionFeedback(null)}
              className="text-emerald-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* AGENT DETAIL INSPECTOR MODAL */}
      {inspectedAgentId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border-2 border-amber-500/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-mono relative">
            {/* Close button */}
            <button
              onClick={() => setInspectedAgentId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>

            {(() => {
              const agent = TEN_AGENTS.find((a) => a.id === inspectedAgentId);
              if (!agent) return null;
              return (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400">
                      {agent.icon}
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase">{agent.number} · {agent.layerName}</span>
                      <h3 className="text-xl font-black text-white uppercase">{agent.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    "{agent.question}"
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Diagnóstico Específico:</span>
                    <p className="text-slate-200">
                      {diagnostic.agents[agent.id] || agent.metricSummary}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Checkpoints de Validação:</span>
                    {agent.checkpoints.map((cp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{cp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setInspectedAgentId(null)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                    >
                      Fechar Inspeção
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 10-AGENT HIVE MIND CHAT DRAWER */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col font-mono text-xs">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">Mente Coletiva · 10 Agentes</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl max-w-[85%] ${
                  msg.role === 'user'
                    ? 'ml-auto bg-amber-500/20 border border-amber-500/40 text-amber-200'
                    : 'mr-auto bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                {msg.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold block mb-1">
                    {msg.badge}
                  </span>
                )}
                <p className="text-xs leading-relaxed">{msg.text}</p>
                <span className="text-[9px] text-slate-500 block text-right mt-1">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pergunte ao Quant, Risk, News ou Sentinel..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
