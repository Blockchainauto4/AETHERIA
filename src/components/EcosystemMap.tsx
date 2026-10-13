import React, { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { ECOSYSTEM_NODES } from '../data/ecosystemNodes';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { CitadelAtmosphereLayer } from './CitadelAtmosphereLayer';
import { 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Sprout, 
  Rocket, 
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Activity,
  Plane,
  Bot,
  Globe
} from 'lucide-react';

export const EcosystemMap: React.FC = () => {
  const { 
    selectedNodeId, 
    setSelectedNodeId, 
    setActiveTab, 
    assets 
  } = useExchange();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLeaderLines, setShowLeaderLines] = useState<boolean>(true);
  const [showAtmosphere, setShowAtmosphere] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const filteredNodes = ECOSYSTEM_NODES.filter((n) => 
    filterCategory === 'all' ? true : n.category === filterCategory
  );

  const getNodeIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'refresh-cw':
        return <RefreshCw className="w-4 h-4 text-cyan-400" />;
      case 'sprout':
        return <Sprout className="w-4 h-4 text-lime-400" />;
      case 'rocket':
        return <Rocket className="w-4 h-4 text-violet-400" />;
      default:
        return <Layers className="w-4 h-4 text-emerald-400" />;
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="relative w-full h-[calc(100vh-61px)] min-h-[640px] overflow-hidden bg-slate-950 select-none">
      {/* Background Interactive Viewport */}
      <div 
        className="relative w-full h-full transition-transform duration-500 ease-out flex items-center justify-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Main Artwork */}
        <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] overflow-hidden">
          <img
            src="/src/assets/images/crypto_citadel_map_1791924682462.jpg"
            alt="Aetheria Decentralized Financial Citadel"
            className="w-full h-full object-cover object-center pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Vignette & Atmospheric Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-950/40 pointer-events-none" />

          {/* Animated Flying Cars, Maglev Monorail & Hologram Atmosphere Layer */}
          <CitadelAtmosphereLayer enabled={showAtmosphere} />

          {/* Top Brand Banner replicating the reference image structure */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20 text-center">
            {/* Stylized Lotus / Crystal Icon */}
            <div className="w-10 h-10 mb-2 flex items-center justify-center text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C12 2 8 8 8 13C8 15.21 9.79 17 12 17C14.21 17 16 15.21 16 13C16 8 12 2 12 2ZM12 19C7.58 19 4 15.42 4 11C4 8.79 4.9 6.79 6.34 5.34C5.53 7.03 5 8.95 5 11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11C19 8.95 18.47 7.03 17.66 5.34C19.1 6.79 20 8.79 20 11C20 15.42 16.42 19 12 19Z"/>
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              AETHERIA CITADEL
            </h1>
            <p className="text-[11px] md:text-xs font-medium tracking-[0.35em] text-emerald-300/90 uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] mt-1">
              DECENTRALIZED FINANCIAL CIVILIZATION
            </p>

            {/* Viewport Dimension Toggle: 2D Blueprint vs 3D Living Planet */}
            <div className="mt-3 pointer-events-auto inline-flex items-center p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/30 shadow-2xl">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 shadow flex items-center gap-1.5">
                <span>🏛️ Mapa 2D</span>
              </span>
              <button
                onClick={() => setActiveTab('citadel-3d')}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Planeta 3D & Pioneiros</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">NOVO</span>
              </button>
            </div>
          </div>

          {/* SVG Leader Lines Layer connecting Nodes to Architecture */}
          {showLeaderLines && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isActive = isSelected || isHovered;

                // Percentages converted to viewBox points
                const x1 = node.labelPosition.x;
                const y1 = node.labelPosition.y;
                const x2 = node.targetPosition.x;
                const y2 = node.targetPosition.y;

                // Subtle dog-leg / angled line
                const midX = (x1 + x2) / 2;

                return (
                  <g key={`line-${node.id}`} className="transition-opacity duration-300">
                    {/* Background glow path */}
                    {isActive && (
                      <path
                        d={`M ${x1}% ${y1}% L ${midX}% ${y1}% L ${x2}% ${y2}%`}
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="3"
                        strokeOpacity="0.5"
                        filter="url(#glow)"
                      />
                    )}
                    {/* Foreground leader line */}
                    <path
                      d={`M ${x1}% ${y1}% L ${midX}% ${y1}% L ${x2}% ${y2}%`}
                      fill="none"
                      stroke={isActive ? '#34D399' : 'rgba(255, 255, 255, 0.45)'}
                      strokeWidth={isActive ? '1.8' : '1.2'}
                      strokeDasharray={isActive ? 'none' : '4, 2'}
                    />
                    {/* Anchor Dot on the Architecture */}
                    <circle
                      cx={`${x2}%`}
                      cy={`${y2}%`}
                      r={isActive ? 6 : 4}
                      fill={isActive ? '#34D399' : '#FFFFFF'}
                      className="transition-all duration-300"
                    />
                    {isActive && (
                      <circle
                        cx={`${x2}%`}
                        cy={`${y2}%`}
                        r="14"
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Interactive Architectural Nodes (Buttons/Cards) */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isActive = isSelected || isHovered;

            return (
              <div
                key={node.id}
                style={{
                  left: `${node.labelPosition.x}%`,
                  top: `${node.labelPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-20"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                <button
                  onClick={() => handleNodeClick(node.id)}
                  className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-full border backdrop-blur-md transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900/90 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] scale-105'
                      : 'bg-slate-950/70 border-white/20 hover:border-emerald-400/80 hover:bg-slate-900/85'
                  }`}
                >
                  {/* Icon badge matching the reference style */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                    isActive 
                      ? 'bg-emerald-500/20 border-emerald-400' 
                      : 'bg-white/10 border-white/30 group-hover:border-emerald-400'
                  }`}>
                    {getNodeIcon(node.iconName)}
                  </div>

                  {/* Label title */}
                  <div className="text-left whitespace-nowrap">
                    <span className="text-[12px] font-bold tracking-wider uppercase text-white block">
                      {node.name}
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono tracking-tight block">
                      {node.metrics[0].value} · {node.metrics[0].label}
                    </span>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors ml-1 ${
                    isActive ? 'text-emerald-400' : ''
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Horizontal Pillar Carousel (Top Thumb Zone on Small Screens) */}
      <div className="md:hidden absolute top-20 inset-x-3 z-30 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filteredNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <button
              key={`m-p-${node.id}`}
              onClick={() => handleNodeClick(node.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap backdrop-blur-md shrink-0 cursor-pointer min-h-[36px] active:scale-95 transition-all ${
                isSelected
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-md'
                  : 'bg-slate-900/85 border-slate-700/80 text-slate-300'
              }`}
            >
              <div className="w-3.5 h-3.5 text-emerald-400">{getNodeIcon(node.iconName)}</div>
              <span>{node.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Left Filter & Category Bar (Desktop) */}
      <div className="hidden md:flex absolute top-6 left-6 z-30 flex-col gap-2">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex flex-col gap-1 shadow-lg">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1">
            Pilares do Ecossistema
          </span>
          {[
            { id: 'all', label: 'Todos os Pilares' },
            { id: 'trading', label: 'Negociação & Spot' },
            { id: 'security', label: 'Custódia & Reservas' },
            { id: 'yield', label: 'Cofres & Staking' },
            { id: 'defi', label: 'Swap & DeFi' },
            { id: 'innovation', label: 'RWA & Launchpad' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Right Controls (Zoom & Guides) */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            title="Aumentar Zoom"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.1))}
            title="Diminuir Zoom"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="Redefinir Zoom"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-800 my-auto" />
          <button
            onClick={() => setShowLeaderLines((prev) => !prev)}
            title="Alternar Linhas de Conexão"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              showLeaderLines ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Linhas Guia
          </button>
          <button
            onClick={() => setShowAtmosphere((prev) => !prev)}
            title="Alternar Veículos Voadores e Efeitos"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showAtmosphere ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tráfego & FX</span>
          </button>
        </div>
      </div>

      {/* Bottom Live Market Ticker & Quick Gateway */}
      <div className="absolute bottom-2 inset-x-2 md:bottom-6 md:inset-x-6 z-30 flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl md:rounded-2xl p-2.5 md:p-3 md:px-5 shadow-2xl">
        {/* Market Ticker Strip */}
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto w-full md:w-auto text-xs py-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-wider hidden sm:inline">Mercado:</span>
          </div>

          {['BTC', 'ETH', 'SOL', 'AETH'].map((sym) => {
            const asset = assets[sym];
            if (!asset) return null;
            return (
              <div 
                key={sym} 
                onClick={() => {
                  setActiveTab('trading');
                }}
                className="flex items-center gap-2 font-mono whitespace-nowrap cursor-pointer hover:text-emerald-400 transition-colors shrink-0"
              >
                <span className="font-bold text-slate-200">{sym}/USDT</span>
                <span className="text-slate-100 tabular-nums font-semibold">
                  ${asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[11px] font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons to Launch 3D World, AI Agents or Trading Terminal */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('citadel-3d')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold text-xs tracking-wide transition-colors cursor-pointer min-h-[38px]"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Mundo 3D Vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-agents')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs tracking-wide transition-colors cursor-pointer min-h-[38px]"
          >
            <Bot className="w-4 h-4" />
            <span>Agentes IA</span>
          </button>
          <button
            onClick={() => setActiveTab('trading')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-colors cursor-pointer min-h-[38px]"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Terminal Spot</span>
          </button>
        </div>
      </div>

      {/* In-depth Node Inspector Drawer */}
      {isDrawerOpen && (
        <NodeDetailDrawer
          nodeId={selectedNodeId}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};
