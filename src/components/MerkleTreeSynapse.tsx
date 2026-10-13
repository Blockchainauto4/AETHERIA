import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Layers, 
  Activity, 
  RotateCcw,
  Play,
  Lock
} from 'lucide-react';

interface Props {
  userWallet: string;
  userBalanceUsd: number;
  merkleRoot: string;
}

interface TreeNode {
  id: string;
  label: string;
  sublabel: string;
  hash: string;
  x: number;
  y: number;
  level: number;
  isUserPath: boolean;
  valueUsd?: number;
}

export const MerkleTreeSynapse: React.FC<Props> = ({ userWallet, userBalanceUsd, merkleRoot }) => {
  const [activeStep, setActiveStep] = useState<number>(0); // 0: Idle, 1: Leaf Hash, 2: Branch Hash, 3: Root Verified
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('leaf-user');
  const [ambientPulse, setAmbientPulse] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 2x

  const shortAddress = `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`;

  // Tree Nodes Coordinates in SVG viewBox (0 0 800 360)
  const nodes: TreeNode[] = [
    // Root (Level 0)
    {
      id: 'root',
      label: 'RAIZ MERKLE (CONSENSO)',
      sublabel: 'Solvência Global 108.4%',
      hash: merkleRoot,
      x: 400,
      y: 50,
      level: 0,
      isUserPath: true,
      valueUsd: 14280000000
    },
    // Level 1 Branches
    {
      id: 'branch-left',
      label: 'SINAPSE INTERMEDIÁRIA H(AB)',
      sublabel: 'Hash Combinado SHA-256',
      hash: '0x4e29b183ac92019485720194857a6b8c9d0e8f4c93a2e7b15d86c478a01f92e3',
      x: 230,
      y: 160,
      level: 1,
      isUserPath: true,
      valueUsd: 137250
    },
    {
      id: 'branch-right',
      label: 'SINAPSE INTERMEDIÁRIA H(CD)',
      sublabel: 'Hash Sibling SHA-256',
      hash: '0x9910f4bc720194857a6b8c9d0e8f4c93a2e7b15d86c478a01f92e34e29b183ac',
      x: 570,
      y: 160,
      level: 1,
      isUserPath: false,
      valueUsd: 2260200
    },
    // Level 2 Leaves
    {
      id: 'leaf-user',
      label: `FOLHA DO USUÁRIO (${shortAddress})`,
      sublabel: 'Seu Saldo Auditado',
      hash: '0x71c839f6a24d3e5ce646696b99c75988383b39fa4e29b183ac92019485720194',
      x: 130,
      y: 290,
      level: 2,
      isUserPath: true,
      valueUsd: userBalanceUsd
    },
    {
      id: 'leaf-b',
      label: 'FOLHA PARCEIRA B (#4081)',
      sublabel: 'Hash do Sibling Irmão',
      hash: '0x3a928475c1029384756102938475610293847561029384756102938475610293',
      x: 330,
      y: 290,
      level: 2,
      isUserPath: false,
      valueUsd: 112400
    },
    {
      id: 'leaf-c',
      label: 'FOLHA VALIDADOR C (#912)',
      sublabel: 'Contrato Staking',
      hash: '0x8849102938475610293847561029384756102938475610293847561029384756',
      x: 490,
      y: 290,
      level: 2,
      isUserPath: false,
      valueUsd: 840200
    },
    {
      id: 'leaf-d',
      label: 'FOLHA INSTITUCIONAL D (#14)',
      sublabel: 'Cofre Frio Segregado',
      hash: '0x5510293847561029384756102938475610293847561029384756102938475610',
      x: 670,
      y: 290,
      level: 2,
      isUserPath: false,
      valueUsd: 1420000
    }
  ];

  // Synaptic Axon Connections (Curved biological/cybernetic dendrite paths)
  const synapticConnections = [
    { from: 'leaf-user', to: 'branch-left', isUserPath: true, id: 'syn-user-left' },
    { from: 'leaf-b', to: 'branch-left', isUserPath: false, id: 'syn-b-left' },
    { from: 'leaf-c', to: 'branch-right', isUserPath: false, id: 'syn-c-right' },
    { from: 'leaf-d', to: 'branch-right', isUserPath: false, id: 'syn-d-right' },
    { from: 'branch-left', to: 'root', isUserPath: true, id: 'syn-left-root' },
    { from: 'branch-right', to: 'root', isUserPath: false, id: 'syn-right-root' },
  ];

  const handleStartSynapse = () => {
    setIsAnimating(true);
    setActiveStep(1); // Igniting Leaf

    setTimeout(() => {
      setActiveStep(2); // Transmitting to Branch H(AB)
    }, 1200 / speedMultiplier);

    setTimeout(() => {
      setActiveStep(3); // Transmitting to Merkle Root
    }, 2400 / speedMultiplier);

    setTimeout(() => {
      setIsAnimating(false);
    }, 3600 / speedMultiplier);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Background Neural Grid Accent */}
      <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Top Header & Synapse Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="text-sm md:text-base font-bold text-slate-100 tracking-tight">
              Árvore Merkle com Sinapse Criptográfica
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulação neural da transmissão de prova de inclusão (Merkle Proof Path) até a raiz do consenso.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAmbientPulse((p) => !p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
              ambientPulse
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {ambientPulse ? 'Sinapses Ativas' : 'Pausado'}
          </button>

          <button
            disabled={isAnimating}
            onClick={handleStartSynapse}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-lg ${
              isAnimating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Disparar Impulso Sináptico</span>
          </button>
        </div>
      </div>

      {/* Step Status Pill Indicator */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">Status da Transmissão:</span>
          <span className={`font-bold ${
            activeStep === 3 ? 'text-emerald-400' : activeStep > 0 ? 'text-amber-400' : 'text-slate-300'
          }`}>
            {activeStep === 0 && 'Aguardando Disparo Sináptico'}
            {activeStep === 1 && 'Etapa 1: Codificando Folha do Usuário com SHA-256...'}
            {activeStep === 2 && 'Etapa 2: Sinapse Axonal transmitindo para H(AB)...'}
            {activeStep === 3 && 'Etapa 3: Raiz Merkle Consolidada! Inclusão 100% Provada.'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className={activeStep >= 1 ? 'text-emerald-400 font-bold' : ''}>Folha</span>
          <span>→</span>
          <span className={activeStep >= 2 ? 'text-emerald-400 font-bold' : ''}>Ramo H(AB)</span>
          <span>→</span>
          <span className={activeStep >= 3 ? 'text-emerald-400 font-bold' : ''}>Raiz</span>
        </div>
      </div>

      {/* Interactive SVG Canvas with Synapse Axons & Neural Nodes */}
      <div className="relative w-full overflow-x-auto bg-slate-950/80 border border-slate-800/90 rounded-2xl flex items-center justify-start md:justify-center p-2 scrollbar-none">
        <svg
          viewBox="0 0 800 360"
          className="w-full min-w-[580px] md:min-w-full h-[300px] sm:h-[340px] md:h-[380px] select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glowing filter for synaptic discharges */}
            <filter id="synapseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Neural Gradient */}
            <linearGradient id="axonGradUser" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#34D399" stopOpacity="1" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="axonGradPassive" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.6" />
            </linearGradient>

            {/* Synaptic Pulse Particle */}
            <radialGradient id="sparkGrad">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="40%" stopColor="#34D399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Synaptic Axons (Connections) */}
          {synapticConnections.map((conn) => {
            const source = nodes.find((n) => n.id === conn.from)!;
            const target = nodes.find((n) => n.id === conn.to)!;

            // Smooth cubic Bezier curves simulating biological neural synapses
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const cpy1 = source.y + dy * 0.45;
            const cpy2 = target.y - dy * 0.45;
            const pathData = `M ${source.x} ${source.y} C ${source.x} ${cpy1}, ${target.x} ${cpy2}, ${target.x} ${target.y}`;

            const isPathActive = 
              (conn.id === 'syn-user-left' && activeStep >= 1) ||
              (conn.id === 'syn-left-root' && activeStep >= 2);

            return (
              <g key={conn.id}>
                {/* Background Axon Conduit */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={conn.isUserPath ? 'rgba(52, 211, 153, 0.25)' : 'rgba(51, 65, 85, 0.3)'}
                  strokeWidth={conn.isUserPath ? 4 : 2}
                  strokeLinecap="round"
                />

                {/* Ambient or Active Synapse Glow Conduit */}
                {conn.isUserPath && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isPathActive ? '#34D399' : 'rgba(52, 211, 153, 0.5)'}
                    strokeWidth={isPathActive ? 3.5 : 2}
                    strokeDasharray={isPathActive ? '8 4' : 'none'}
                    filter={isPathActive ? 'url(#synapseGlow)' : undefined}
                    className={isPathActive ? 'animate-pulse' : ''}
                  />
                )}

                {/* Animated Synaptic Pulse Particle traveling along the axon */}
                {(ambientPulse || isAnimating) && (
                  <circle r={conn.isUserPath ? 5 : 3} fill="url(#sparkGrad)" filter="url(#synapseGlow)">
                    <animateMotion
                      path={pathData}
                      dur={conn.isUserPath ? '2.4s' : '4s'}
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                    />
                  </circle>
                )}

                {/* High-intensity verification surge particle when step is triggered */}
                {isPathActive && isAnimating && (
                  <circle r="7" fill="#FFFFFF" filter="url(#synapseGlow)">
                    <animateMotion
                      path={pathData}
                      dur="1.2s"
                      repeatCount="1"
                      fill="freeze"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Tree Nodes (Synapse Hubs) */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isNodeActive = 
              (node.id === 'leaf-user' && activeStep >= 1) ||
              (node.id === 'branch-left' && activeStep >= 2) ||
              (node.id === 'root' && activeStep >= 3);

            const isRoot = node.level === 0;
            const isUser = node.id === 'leaf-user';

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer group"
              >
                {/* Outer Synaptic Radiance Ring on active/selected */}
                {(isNodeActive || isSelected) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isRoot ? 32 : 24}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="animate-spin opacity-80"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Primary Hub Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isRoot ? 22 : isUser ? 18 : 14}
                  fill={
                    isNodeActive || isSelected
                      ? '#0F172A'
                      : node.isUserPath
                      ? '#0B132B'
                      : '#020617'
                  }
                  stroke={
                    isNodeActive
                      ? '#34D399'
                      : isSelected
                      ? '#60A5FA'
                      : node.isUserPath
                      ? 'rgba(52, 211, 153, 0.6)'
                      : 'rgba(71, 85, 105, 0.7)'
                  }
                  strokeWidth={isNodeActive || isSelected ? 3 : 2}
                  filter={isNodeActive ? 'url(#synapseGlow)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Inner Core Pulse */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isRoot ? 9 : isUser ? 7 : 5}
                  fill={isNodeActive ? '#34D399' : node.isUserPath ? '#10B981' : '#475569'}
                  className={isNodeActive ? 'animate-ping' : ''}
                />

                {/* Text Labels under/above nodes */}
                <text
                  x={node.x}
                  y={node.y + (isRoot ? -32 : 30)}
                  textAnchor="middle"
                  fill={isNodeActive || isSelected ? '#FFFFFF' : '#94A3B8'}
                  fontSize={isRoot ? '11' : '10'}
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="select-none transition-colors"
                >
                  {node.label}
                </text>

                {node.valueUsd && (
                  <text
                    x={node.x}
                    y={node.y + (isRoot ? -44 : 42)}
                    textAnchor="middle"
                    fill={node.isUserPath ? '#34D399' : '#64748B'}
                    fontSize="9"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    ${node.valueUsd.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} USD
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Synapse Inspector Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Inspeção da Sinapse Selecionada:
            </span>
            <span className="text-xs font-bold text-slate-100 font-mono">
              {selectedNode.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Hash SHA-256:</span>
            <span className="text-slate-300 break-all bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
              {selectedNode.hash}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-500 block">Status Criptográfico</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verificado On-Chain
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
