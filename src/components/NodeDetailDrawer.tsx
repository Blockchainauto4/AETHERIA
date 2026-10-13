import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { ECOSYSTEM_NODES } from '../data/ecosystemNodes';
import { 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Sprout, 
  Rocket, 
  Layers, 
  X, 
  ArrowRight, 
  ExternalLink,
  Lock,
  Cpu,
  BarChart3
} from 'lucide-react';

interface Props {
  nodeId: string | null;
  onClose: () => void;
}

export const NodeDetailDrawer: React.FC<Props> = ({ nodeId, onClose }) => {
  const { quickNavigateToNodeAction } = useExchange();

  if (!nodeId) return null;

  const node = ECOSYSTEM_NODES.find((n) => n.id === nodeId);
  if (!node) return null;

  const getIcon = () => {
    switch (node.iconName) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'refresh-cw':
        return <RefreshCw className="w-5 h-5 text-cyan-400" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-lime-400" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-violet-400" />;
      default:
        return <Layers className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 z-50 w-full md:max-w-lg max-h-[85vh] md:max-h-full bg-slate-900/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-slate-800 shadow-2xl rounded-t-3xl md:rounded-none flex flex-col transition-all duration-300">
      {/* Mobile Drag Handle Affordance */}
      <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mt-3 md:hidden shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
            {getIcon()}
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-400 font-semibold block">
              Pilar Estrutural {node.category}
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              {node.name}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description Banner */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4">
          <p className="text-sm font-medium text-emerald-300 mb-1">
            {node.subtitle}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            {node.description}
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
            Métricas em Tempo Real
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {node.metrics.map((metric, idx) => (
              <div 
                key={idx} 
                className="bg-slate-800/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors"
              >
                <span className="text-[11px] text-slate-400 block mb-1">
                  {metric.label}
                </span>
                <span className="text-base font-bold text-slate-100 font-mono tabular-nums block">
                  {metric.value}
                </span>
                {metric.change && (
                  <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
                    {metric.change}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deep Architecture Prose */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Arquitetura & Especificação
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
            {node.longDescription}
          </p>
        </div>

        {/* Technical Features Checklist */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
            Garantias Técnicas & Protocolo
          </h3>
          <div className="space-y-2">
            {node.technicalFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-3">
        <button
          onClick={() => {
            quickNavigateToNodeAction(node.ctaAction, node.id);
            onClose();
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-colors cursor-pointer"
        >
          <span>{node.ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
