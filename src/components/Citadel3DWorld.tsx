import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useExchange } from '../context/ExchangeContext';
import { PioneerState } from '../types/pioneer';
import { 
  createAlienTerrainTextures,
  createCyberHexTilesTextures,
  createTitaniumSpireTextures,
  createQuantumWaterTextures,
  createBioDomeGlassTextures,
  createExoSuitTextures,
  createPioneerChestTexture,
  createCrystalVaultTextures,
  createSkyDomeTexture,
  createCryptoBarTexture,
  createCharacterBadgeTexture
} from '../utils/proceduralTextures';
import { 
  Heart, 
  Zap, 
  Apple, 
  Compass, 
  Eye, 
  Sun, 
  Moon, 
  Sunset, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  X,
  Play,
  User,
  Users,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Palette,
  Check,
  Navigation,
  Flame,
  Terminal,
  Radio,
  Cpu,
  Box,
  Pause,
  ShieldAlert,
  CheckCircle2,
  BarChart2,
  BarChart3,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Reusable Three.js Math Objects for Zero-GC Render Loop
const _tmpV1 = new THREE.Vector3();
const _tmpV2 = new THREE.Vector3();
const _tmpDir = new THREE.Vector3();
const _camFollowOffset = new THREE.Vector3();
const _dummyMatrix = new THREE.Matrix4();
const _dummyPosition = new THREE.Vector3();
const _dummyQuaternion = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3(1, 1, 1);
const _tmpColor = new THREE.Color();

export interface CryptoBarConfig {
  symbol: string;
  name: string;
  fallbackPrice: number;
  fallbackChange: number;
  color: number;
  hexColor: string;
  baseHeightLow: number;  // 2.2 - 3.8
  baseHeightHigh: number; // 12.0 - 19.5
  volume24h: string;
  xOffset: number;
}

export const CRYPTO_BAR_CONFIGS: CryptoBarConfig[] = [
  { symbol: 'BTC', name: 'Bitcoin', fallbackPrice: 67840.50, fallbackChange: 3.42, color: 0xf59e0b, hexColor: '#f59e0b', baseHeightLow: 3.8, baseHeightHigh: 18.5, volume24h: '$28.4B', xOffset: -3.2 },
  { symbol: 'ETH', name: 'Ethereum', fallbackPrice: 3520.80, fallbackChange: 4.15, color: 0x6366f1, hexColor: '#6366f1', baseHeightLow: 3.2, baseHeightHigh: 15.6, volume24h: '$16.8B', xOffset: -1.6 },
  { symbol: 'SOL', name: 'Solana', fallbackPrice: 174.60, fallbackChange: 6.80, color: 0xd946ef, hexColor: '#d946ef', baseHeightLow: 2.8, baseHeightHigh: 14.2, volume24h: '$5.9B', xOffset: 0.0 },
  { symbol: 'AETH', name: 'Aetheria Protocol', fallbackPrice: 14.85, fallbackChange: 9.40, color: 0x06b6d4, hexColor: '#06b6d4', baseHeightLow: 2.5, baseHeightHigh: 19.8, volume24h: '$490M', xOffset: 1.6 },
  { symbol: 'AVAX', name: 'Avalanche', fallbackPrice: 32.40, fallbackChange: 1.95, color: 0xef4444, hexColor: '#ef4444', baseHeightLow: 2.1, baseHeightHigh: 11.8, volume24h: '$840M', xOffset: 3.2 }
];

export interface CrewMemberConfig {
  id: 'zara' | 'atlas' | 'nyx' | 'soren' | 'maya' | 'lyra' | 'leo' | 'kaelen';
  name: string;
  role: string;
  station: string;
  cryptoFlow: string;
  cryptoSymbol: string;
  color: string;
  position: [number, number, number];
  actionDesc: string;
}

export const CITADEL_CREW_CONFIGS: CrewMemberConfig[] = [
  {
    id: 'kaelen',
    name: 'Kaelen Vane',
    role: 'Engenheiro Chefe do Câmbio',
    station: 'Console Central de Ordens',
    cryptoFlow: 'Sincronização Neural e Roteamento de Baixa Latência',
    cryptoSymbol: 'AETH / ALL',
    color: '#38bdf8',
    position: [0, 2.2, 4.2],
    actionDesc: 'Calibrar motor de ordens e despachar pulso neural nas 5 barras'
  },
  {
    id: 'zara',
    name: 'Zara Chen',
    role: 'Derivativos & Liquidez de Livro',
    station: 'Plataforma das Barras Cripto 3D',
    cryptoFlow: 'Injeção de Liquidez de Alta Frequência em BTC & SOL',
    cryptoSymbol: 'BTC / SOL',
    color: '#d946ef',
    position: [-1.6, 2.15, 2.2],
    actionDesc: 'Manipular matriz 3D do livro de ofertas e acelerar fluxo de BTC e SOL'
  },
  {
    id: 'atlas',
    name: 'Atlas-9',
    role: 'Androide Sentinela de Flash-Loans',
    station: 'Cofres de Staking & Validação',
    cryptoFlow: 'Travamento de Garantias e Contenção de Staking Líquido',
    cryptoSymbol: 'ETH / AETH',
    color: '#06b6d4',
    position: [14.4, 2.15, -4.8],
    actionDesc: 'Ativar escudo de força de contenção e canalizar garantias nos cofres'
  },
  {
    id: 'nyx',
    name: 'Nyx Solaris',
    role: 'Oráculos RWA & Frotas Espaciais',
    station: 'Hangar Aeroespacial & Shuttles',
    cryptoFlow: 'Transmissão de Feeds de Oráculos em Tempo Real & Cargas RWA',
    cryptoSymbol: 'AVAX / RWA',
    color: '#f59e0b',
    position: [10.8, 2.15, 9.2],
    actionDesc: 'Elevar cetro giroscópio de oráculo e disparar feixe de preços nas frotas'
  },
  {
    id: 'soren',
    name: 'Soren Vance',
    role: 'Operador de Arbitragem Quântica',
    station: 'Terraço da Torre Central',
    cryptoFlow: 'Arbitragem Flash Triangular BTC/SOL/USDT',
    cryptoSymbol: 'BTC / SOL',
    color: '#38bdf8',
    position: [2.2, 2.15, 2.8],
    actionDesc: 'Executar rajada de ordens nos monitores holográficos triplos'
  },
  {
    id: 'maya',
    name: 'Maya Vane',
    role: 'Bio-Sintetizadora & Botânica',
    station: 'Biodomo Familiar Vane',
    cryptoFlow: 'Bio-Rendimento AETH derivado de Clorofila Hidropônica',
    cryptoSymbol: 'AETH',
    color: '#10b981',
    position: [-14.6, 2.15, -7.6],
    actionDesc: 'Colher clorofila enriquecida e verter bio-cripto na barra AETH'
  },
  {
    id: 'lyra',
    name: 'Dr. Lyra Thorne',
    role: 'Engenheira de Nós Validadores',
    station: 'Cofres de Staking Líquido',
    cryptoFlow: 'Emissão de Recompensas de Prova de Participação ETH/AETH',
    cryptoSymbol: 'ETH / AETH',
    color: '#818cf8',
    position: [17.2, 2.15, -6.2],
    actionDesc: 'Girar anel focal de prisma e sincronizar nós validadores de staking'
  },
  {
    id: 'leo',
    name: 'Leo Vane',
    role: 'Explorador Mirim & Piloto de Drones',
    station: 'Mirante das Cachoeiras',
    cryptoFlow: 'Varredura Óptica Aérea de Liquidez no Abismo',
    cryptoSymbol: 'SCOUT',
    color: '#fbbf24',
    position: [-4.8, 2.15, 16.2],
    actionDesc: 'Comandar drone aéreo para sobrevoar e polvilhar centelhas nas barras 3D'
  }
];

export const Citadel3DWorld: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { assets, placeOrder, setActiveTab } = useExchange();

  // Camera & Visual Modes
  const [cameraMode, setCameraMode] = useState<'orbit' | 'follow' | 'top' | 'habitat'>('follow');
  const cameraModeRef = useRef<'orbit' | 'follow' | 'top' | 'habitat'>(cameraMode);
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('sunset');
  const [textureStyle, setTextureStyle] = useState<'realistic-pbr' | 'hologram' | 'solar-gold'>('realistic-pbr');
  const [showTextureMenu, setShowTextureMenu] = useState<boolean>(false);
  const [isCrewPanelOpen, setIsCrewPanelOpen] = useState<boolean>(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMemberConfig | null>(null);
  const cameraFocusTargetRef = useRef<{ x: number; y: number; z: number; dist: number; name: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'pioneer'; text: string; time: string }[]>([
    {
      role: 'pioneer',
      text: 'Olá! Sou Kaelen. Nossa família migrou da Terra para este planeta há 142 ciclos. Aqui sobrevivemos graças aos rendimentos dos nós validadores e à energia pura dos anéis da Cidadela. Como está sua jornada hoje?',
      time: 'Agora'
    }
  ]);

  // Living Pioneer Settler State
  const [pioneer, setPioneer] = useState<PioneerState>({
    name: 'Kaelen & Maya Vane',
    familyMembers: ['Kaelen (Pai / Engenheiro de Nós)', 'Maya (Mãe / Botânica)', 'Leo (Filho, 7 anos)'],
    health: 96,
    energy: 92,
    food: 88,
    cryptoBalanceAeth: 485,
    cryptoBalanceBtc: 0.12,
    currentActivity: 'Coletando rendimento de energia nos cofres solares',
    currentLocationName: 'Torre Central de Trading',
    targetLocation: { x: 0, y: 0, z: 0 },
    latestThought: 'O ar deste planeta tem gosto de ozônio e clorofila. Pela primeira vez em anos, minha família dorme em paz sob os anéis da Cidadela.',
    daysOnPlanet: 142,
    logEntries: [
      {
        id: 'log-1',
        time: 'Hoje, 09:30',
        title: 'Colheita Hidropônica & Staking',
        text: 'Colhemos 12kg de vegetais no biodomo. Destinei 20 AETH para o cofre de rendimento automatizado para pagar a manutenção dos escudos de radiação.',
        type: 'survival'
      },
      {
        id: 'log-2',
        time: 'Ontem, 18:45',
        title: 'Shuttles Noturnos com Leo',
        text: 'Leo passou uma hora na varanda observando os transportes voadores cruzarem as cachoeiras de liquidez. O céu dourado é magnífico.',
        type: 'family'
      }
    ]
  });

  const [thinking, setThinking] = useState<boolean>(false);

  // Station and Object Integration States
  const [autoPatrol, setAutoPatrol] = useState<boolean>(true);
  const autoPatrolRef = useRef<boolean>(true);
  useEffect(() => {
    autoPatrolRef.current = autoPatrol;
  }, [autoPatrol]);

  const [activeStationIdx, setActiveStationIdx] = useState<number>(0);
  const [isAtStation, setIsAtStation] = useState<boolean>(true);
  const [stationActionToast, setStationActionToast] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'crypto' } | null>(null);
  const [hoveredStation, setHoveredStation] = useState<{ name: string; x: number; y: number } | null>(null);
  const [stationOpExecuting, setStationOpExecuting] = useState<boolean>(false);
  const specialEmoteRef = useRef<'none' | 'jetpack' | 'scan' | 'celebrate'>('none');
  const specialEmoteTimerRef = useRef<number>(0);
  const interactionPulseRef = useRef<number>(0);

  // 3D Crypto Bar Graph & Scale Integration States
  const [cryptoScaleMode, setCryptoScaleMode] = useState<'low' | 'high' | 'dynamic'>('dynamic');
  const cryptoScaleModeRef = useRef<'low' | 'high' | 'dynamic'>('dynamic');
  useEffect(() => {
    cryptoScaleModeRef.current = cryptoScaleMode;
  }, [cryptoScaleMode]);

  const [cryptoScaleMultiplier, setCryptoScaleMultiplier] = useState<number>(1.0);
  const cryptoScaleMultiplierRef = useRef<number>(1.0);
  useEffect(() => {
    cryptoScaleMultiplierRef.current = cryptoScaleMultiplier;
  }, [cryptoScaleMultiplier]);

  const [selectedCryptoIdx, setSelectedCryptoIdx] = useState<number | null>(null);
  const [isBarPanelExpanded, setIsBarPanelExpanded] = useState<boolean>(true);
  const [barSurgeTriggerTime, setBarSurgeTriggerTime] = useState<number>(0);

  // Worker Characters & Crypto Flow Animation References for Zero-GC Render Loop
  const workerFlowTimersRef = useRef<{
    maya: number;
    soren: number;
    lyra: number;
    leo: number;
    zara: number;
    atlas: number;
    nyx: number;
  }>({
    maya: 0,
    soren: 0,
    lyra: 0,
    leo: 0,
    zara: 0,
    atlas: 0,
    nyx: 0
  });

  const workerMeshesRef = useRef<{
    maya?: { group: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; light: THREE.PointLight; badge: THREE.Sprite };
    soren?: { group: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; screens: THREE.Group; light: THREE.PointLight; badge: THREE.Sprite };
    lyra?: { group: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; focalRing: THREE.Mesh; light: THREE.PointLight; badge: THREE.Sprite };
    leo?: { group: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; drone: THREE.Group; wandLight: THREE.PointLight; badge: THREE.Sprite };
    zara?: { group: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; orderCube: THREE.Mesh; light: THREE.PointLight; badge: THREE.Sprite };
    atlas?: { group: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; core: THREE.Mesh; shieldField: THREE.Mesh; light: THREE.PointLight; badge: THREE.Sprite };
    nyx?: { group: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; staff: THREE.Group; gyroRings: THREE.Mesh[]; light: THREE.PointLight; badge: THREE.Sprite };
  }>({});

  const cryptoFlowParticlesRef = useRef<{
    points: THREE.Points;
    positions: Float32Array;
    colors: Float32Array;
    seeds: Float32Array;
  } | null>(null);

  // Live 3D Bar Animation References for Zero-GC Render Loop
  const barSurgesRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const barCurrentHeightsRef = useRef<number[]>([3.8, 3.2, 2.8, 2.5, 2.1]);
  const cryptoBarsMeshRef = useRef<{
    bars: THREE.Mesh[];
    sheaths: THREE.Mesh[];
    diamonds: THREE.Mesh[];
    beams: THREE.Mesh[];
    shockwaves: THREE.Mesh[];
  } | null>(null);

  // References to Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pioneerGroupRef = useRef<THREE.Group | null>(null);
  const energyRingsRef = useRef<THREE.Group | null>(null);
  const shuttlesRef = useRef<THREE.Group[]>([]);
  const lightsRef = useRef<{ dirLight: THREE.DirectionalLight; ambientLight: THREE.AmbientLight; skyColor: THREE.Color } | null>(null);
  const skyMeshRef = useRef<THREE.Mesh | null>(null);
  const waterTexturesRef = useRef<{ map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture; normalMap?: THREE.CanvasTexture } | null>(null);

  // Pioneer Waypoints on the 3D Terrain matching interactive stations & terminals
  const waypoints = [
    { 
      id: 'spire',
      name: 'Torre Central de Trading', 
      shortName: 'Torre Trading',
      badge: 'Câmbio Quântico',
      x: 0, 
      z: 4.2, 
      activity: 'Calibrando o motor de ordens de baixa latência no console quântico',
      color: 0x38bdf8,
      status: 'Operando · 12.8k TPS'
    },
    { 
      id: 'biodome',
      name: 'Biodomo Familiar Vane', 
      shortName: 'Biodomo Vane',
      badge: 'Habitação Ecológica',
      x: -13.4, 
      z: -6.0, 
      activity: 'Acessando o terminal da eclusa e regulando a atmosfera com Maya e Leo',
      color: 0x10b981,
      status: 'Pressão 1.02 atm · O₂ 21.4%'
    },
    { 
      id: 'staking',
      name: 'Cofres de Staking Líquido', 
      shortName: 'Cofres Staking',
      badge: 'Criptografia de Nós',
      x: 16.0, 
      z: -7.5, 
      activity: 'Sincronizando nó validador e extraindo dividendos energéticos',
      color: 0x6366f1,
      status: 'Validação Ativa · 18.4% APY'
    },
    { 
      id: 'mirante',
      name: 'Mirante das Cachoeiras', 
      shortName: 'Mirante Balcão',
      badge: 'Observatório Óptico',
      x: -6.0, 
      z: 17.5, 
      activity: 'Operando torre óptica e monitorando correntes de liquidez no abismo',
      color: 0x0ea5e9,
      status: 'Visibilidade 100km · Céu Aberto'
    },
    { 
      id: 'launchpad',
      name: 'Plataforma RWA & Shuttles', 
      shortName: 'Plataforma RWA',
      badge: 'Hangar Aeroespacial',
      x: 12.0, 
      z: 10.2, 
      activity: 'Despachando cargueiros voadores e calibrando guindaste de carga',
      color: 0xf59e0b,
      status: 'Docas Prontas · 3 Shuttles'
    },
  ];
  const waypointIdxRef = useRef<number>(0);
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.2, 4.2));
  const stationTimerRef = useRef<number>(0);

  // Fetch sentient thought from server
  const triggerNewThought = async () => {
    setThinking(true);
    try {
      const res = await fetch('/api/ai/pioneer-think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: pioneer.currentActivity,
          location: pioneer.currentLocationName
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.thought) {
          setPioneer((prev) => ({
            ...prev,
            latestThought: data.thought
          }));
        }
      }
    } catch (e) {
      console.warn('Thought fallback:', e);
    } finally {
      setThinking(false);
    }
  };

  // Chat with Pioneer
  const handleSendPioneerChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userText = chatInput.trim();
    setChatInput('');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChatMessages((prev) => [...prev, { role: 'user', text: userText, time: timeStr }]);
    setSendingChat(true);

    try {
      const res = await fetch('/api/ai/pioneer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          pioneerState: {
            health: pioneer.health,
            energy: pioneer.energy,
            food: pioneer.food,
            activity: pioneer.currentActivity
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: 'pioneer', text: data.reply, time: timeStr }]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'pioneer',
          text: 'Maya e eu estamos muito gratos por seu apoio. Cada transação e staking na cidadela fortalece os escudos que protegem nosso lar contra as tempestades solares!',
          time: timeStr
        }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  // Perform survival support actions
  const feedFamily = () => {
    setPioneer((prev) => ({
      ...prev,
      food: Math.min(100, prev.food + 15),
      cryptoBalanceAeth: Math.max(0, prev.cryptoBalanceAeth - 10),
      latestThought: 'Adquirimos rações de microalgas e frutas hidropônicas frescas. Leo está radiante!'
    }));
  };

  const rechargeShields = () => {
    setPioneer((prev) => ({
      ...prev,
      energy: Math.min(100, prev.energy + 20),
      health: Math.min(100, prev.health + 5),
      latestThought: 'Os escudos do biodomo foram calibrados. O zumbido harmônico dos anéis de energia nos mantém aquecidos.'
    }));
  };

  // Direct Station & Object Navigation
  const dispatchPioneerToStation = (idx: number) => {
    waypointIdxRef.current = idx;
    const wp = waypoints[idx];
    targetPosRef.current.set(wp.x, 2.2, wp.z);
    setActiveStationIdx(idx);
    setIsAtStation(false);
    setPioneer((prev) => ({
      ...prev,
      currentLocationName: wp.name,
      currentActivity: `Navegando pela passarela para ${wp.name}...`
    }));
    stationTimerRef.current = 0; // reset
    setStationActionToast({
      title: '🎯 Rota Traçada',
      desc: `Kaelen está a caminho de: ${wp.name}`,
      type: 'info'
    });
    setTimeout(() => {
      setStationActionToast(null);
    }, 3500);
  };

  // 3D Crypto Bar Waves & Volumetric Interactivity
  const triggerCryptoBarWave = (source: 'trading' | 'staking' | 'biodome' | 'radar' | 'rwa' | 'manual' | 'scale-high' | 'scale-low') => {
    interactionPulseRef.current = 4.0;
    setBarSurgeTriggerTime(Date.now());

    if (source === 'trading' || source === 'manual') {
      // Cascading wave from BTC across to AVAX with 140ms delays
      CRYPTO_BAR_CONFIGS.forEach((_, i) => {
        setTimeout(() => {
          if (barSurgesRef.current) {
            barSurgesRef.current[i] = 1.35;
          }
        }, i * 140);
      });
      setStationActionToast({
        title: '🌊 Onda Quântica nos Gráficos de Barras',
        desc: 'Interação de Kaelen disparou impulsos em cascata de BTC até AVAX!',
        type: 'crypto'
      });
    } else if (source === 'staking') {
      // ETH and AETH surge massively with staking liquid yield
      if (barSurgesRef.current) {
        barSurgesRef.current[1] = 1.8; // ETH
        barSurgesRef.current[3] = 2.2; // AETH
      }
      setStationActionToast({
        title: '⚡ Picos de Staking Líquido (ETH & AETH)',
        desc: 'Nós validadores sincronizados! Barras de ETH e AETH atingiram pico máximo.',
        type: 'crypto'
      });
    } else if (source === 'biodome' || source === 'scale-low') {
      // Smooth stabilization to low scale
      setCryptoScaleMode('low');
      setCryptoScaleMultiplier(0.35);
      CRYPTO_BAR_CONFIGS.forEach((_, i) => {
        if (barSurgesRef.current) barSurgesRef.current[i] = 0.15;
      });
      setStationActionToast({
        title: '🛡️ Estabilização Harmônica (Escala Baixa)',
        desc: 'Mercado calibrado para regime micro/estável com feixes suaves.',
        type: 'info'
      });
    } else if (source === 'radar') {
      // High frequency diagnostic scan
      CRYPTO_BAR_CONFIGS.forEach((_, i) => {
        if (barSurgesRef.current) barSurgesRef.current[i] = 0.8 + (i % 2) * 0.45;
      });
      setStationActionToast({
        title: '🔭 Varredura de Volatilidade 3D',
        desc: 'Radar do mirante mapeou picos de liquidez entre baixa e alta escala.',
        type: 'info'
      });
    } else if (source === 'rwa') {
      // All bars surge together with institutional liquidity
      CRYPTO_BAR_CONFIGS.forEach((_, i) => {
        if (barSurgesRef.current) barSurgesRef.current[i] = 1.5;
      });
      setStationActionToast({
        title: '🚀 Influxo de Liquidez RWA',
        desc: 'Despacho de cargueiros expandiu todas as 5 barras em alta escala simultânea!',
        type: 'crypto'
      });
    } else if (source === 'scale-high') {
      setCryptoScaleMode('high');
      setCryptoScaleMultiplier(2.0);
      CRYPTO_BAR_CONFIGS.forEach((_, i) => {
        setTimeout(() => {
          if (barSurgesRef.current) barSurgesRef.current[i] = 1.6;
        }, i * 90);
      });
      setStationActionToast({
        title: '🔥 Super-Pico Bull Run (Escala Alta)',
        desc: 'Gráficos 3D expandidos verticalmente com lasers em direção ao céu!',
        type: 'crypto'
      });
    }
  };

  const triggerSingleBarSurge = (coinIdx: number) => {
    interactionPulseRef.current = 3.5;
    if (barSurgesRef.current) {
      barSurgesRef.current[coinIdx] = 2.4;
    }
    const coin = CRYPTO_BAR_CONFIGS[coinIdx];
    if (pioneerGroupRef.current) {
      const p = pioneerGroupRef.current;
      const angleToBars = Math.atan2(5.2 - p.position.x, 3.2 - p.position.z);
      p.rotation.y = angleToBars;
    }
    setStationActionToast({
      title: `⚡ Interação 3D: Barra ${coin.symbol}`,
      desc: `Kaelen sincronizou o canal quântico! Pico vertical de ${coin.name} disparado no gráfico 3D.`,
      type: 'crypto'
    });
    setTimeout(() => {
      setStationActionToast(null);
    }, 4500);
  };

  // Execute tactile interactive operations with Citadel 3D objects
  const executeStationAction = (actionType: string) => {
    setStationOpExecuting(true);
    interactionPulseRef.current = 4.0; // intense visual interaction pulse in 3D loop
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (actionType === 'quantum-arbitrage') {
      triggerCryptoBarWave('trading');
      setPioneer((prev) => ({
        ...prev,
        cryptoBalanceAeth: prev.cryptoBalanceAeth + 25,
        energy: Math.max(10, prev.energy - 3),
        latestThought: 'Arbitragem flash de 25 AETH executada no terminal quântico! Onda de liquidez disparada nos gráficos 3D.',
        logEntries: [
          {
            id: `log-${Date.now()}`,
            time: `Hoje, ${timeStr}`,
            title: 'Arbitragem Quântica Executada',
            text: 'Ordens de alta frequência liquidadas (+25 AETH) com onda nas barras 3D.',
            type: 'survival'
          },
          ...prev.logEntries
        ]
      }));
    } else if (actionType === 'rebalance-rings') {
      triggerCryptoBarWave('trading');
      setPioneer((prev) => ({
        ...prev,
        energy: Math.min(100, prev.energy + 18),
        latestThought: 'Os três anéis de energia da Torre foram sincronizados com o núcleo quântico e a matriz de barras 3D.',
      }));
      setStationActionToast({
        title: '🌀 Anéis Quânticos Sincronizados',
        desc: 'Energia da Cidadela calibrada em +18%!',
        type: 'success'
      });
    } else if (actionType === 'harvest-hydroponics') {
      triggerCryptoBarWave('biodome');
      setPioneer((prev) => ({
        ...prev,
        food: Math.min(100, prev.food + 22),
        latestThought: 'Maya e Leo colheram uma nova safra hidropônica! As barras 3D estabilizaram em regime calmo.',
        logEntries: [
          {
            id: `log-${Date.now()}`,
            time: `Hoje, ${timeStr}`,
            title: 'Colheita Hidropônica Concluída',
            text: 'Safra de clorofila colhida (+22% Suprimentos) e gráficos 3D harmonizados.',
            type: 'family'
          },
          ...prev.logEntries
        ]
      }));
      setStationActionToast({
        title: '🌱 Colheita Hidropônica Efetuada',
        desc: 'Suprimentos +22% e gráficos 3D calibrados para Escala Baixa.',
        type: 'success'
      });
    } else if (actionType === 'airlock-stabilize') {
      triggerCryptoBarWave('biodome');
      setPioneer((prev) => ({
        ...prev,
        health: Math.min(100, prev.health + 10),
        energy: Math.min(100, prev.energy + 8),
        latestThought: 'A eclusa do biodomo foi despressurizada e esterilizada com luz ultravioleta.'
      }));
      setStationActionToast({
        title: '🛡️ Eclusa & Filtros Higienizados',
        desc: 'Pressão atmosférica estável em 1.02 atm!',
        type: 'success'
      });
    } else if (actionType === 'claim-staking') {
      triggerCryptoBarWave('staking');
      setPioneer((prev) => ({
        ...prev,
        cryptoBalanceAeth: prev.cryptoBalanceAeth + 32,
        latestThought: 'Coletamos 32 AETH de staking dos nós validadores! Barras 3D de ETH e AETH atingiram pico máximo.',
        logEntries: [
          {
            id: `log-${Date.now()}`,
            time: `Hoje, ${timeStr}`,
            title: 'Dividendos de Staking Coletados',
            text: 'Reivindicação de validadores (+32 AETH) com impulso nas barras 3D.',
            type: 'survival'
          },
          ...prev.logEntries
        ]
      }));
      setStationActionToast({
        title: '💎 Dividendos de Nós Extraídos',
        desc: '+32 AETH coletados e pico de staking nas barras 3D!',
        type: 'crypto'
      });
    } else if (actionType === 'forge-crystal') {
      triggerCryptoBarWave('staking');
      setPioneer((prev) => ({
        ...prev,
        energy: Math.min(100, prev.energy + 15),
        latestThought: 'O cristal octaédrico ressoou em harmonia com a rede. Frequência de nó aprimorada.'
      }));
      setStationActionToast({
        title: '🔮 Cristal Validador Forjado',
        desc: 'Poder criptográfico e feixes de staking 3D ativados!',
        type: 'success'
      });
    } else if (actionType === 'deep-scan') {
      triggerCryptoBarWave('radar');
      setPioneer((prev) => ({
        ...prev,
        latestThought: 'O binóculo óptico do mirante captou um alinhamento estelar raro sobre as quedas d’água.',
        logEntries: [
          {
            id: `log-${Date.now()}`,
            time: `Hoje, ${timeStr}`,
            title: 'Varredura Óptica das Cachoeiras',
            text: 'Correntes de liquidez nas cachoeiras mapeadas em tempo real.',
            type: 'survival'
          },
          ...prev.logEntries
        ]
      }));
      setStationActionToast({
        title: '🔭 Mapeamento Óptico Finalizado',
        desc: 'Setores do cânion e barras cripto 3D mapeadas pelo radar!',
        type: 'info'
      });
    } else if (actionType === 'waterfall-meditate') {
      triggerCryptoBarWave('radar');
      setPioneer((prev) => ({
        ...prev,
        health: Math.min(100, prev.health + 12),
        energy: Math.min(100, prev.energy + 12),
        latestThought: 'A brisa ionizada das cachoeiras limpa a mente de Kaelen. O futuro na Cidadela é promissor.'
      }));
      setStationActionToast({
        title: '🌊 Revigoramento Quântico',
        desc: '+12% de Saúde e Energia restaurados no mirante!',
        type: 'success'
      });
    } else if (actionType === 'dispatch-shuttle') {
      triggerCryptoBarWave('rwa');
      setPioneer((prev) => ({
        ...prev,
        latestThought: 'Shuttle cargueiro Aeth-7 autorizado para manobra orbital. Influxo de liquidez nas barras 3D!'
      }));
      setStationActionToast({
        title: '🚀 Decolagem de Shuttle Autorizada',
        desc: 'Voo Aeth-7 e onda de expansão macro em todas as barras 3D!',
        type: 'info'
      });
    } else if (actionType === 'inspect-cargo') {
      triggerCryptoBarWave('rwa');
      setPioneer((prev) => ({
        ...prev,
        cryptoBalanceAeth: prev.cryptoBalanceAeth + 15,
        latestThought: 'Paletes de RWA inspecionados no hangar e autenticados por assinatura quântica.'
      }));
      setStationActionToast({
        title: '📦 Auditoria de Paletes RWA',
        desc: '+15 AETH e influxo de liquidez nas barras cripto 3D!',
        type: 'crypto'
      });
    }

    setTimeout(() => {
      setStationOpExecuting(false);
    }, 2500);
    setTimeout(() => {
      setStationActionToast(null);
    }, 5000);
  };

  // Execute specialized cryptocurrency action on workspace crew members
  const executeCrewAction = (crewId: string) => {
    interactionPulseRef.current = 4.0;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (workerFlowTimersRef.current) {
      (workerFlowTimersRef.current as any)[crewId] = 4.5;
    }

    const crew = CITADEL_CREW_CONFIGS.find((c) => c.id === crewId);
    if (!crew) return;

    setSelectedCrewMember(crew);

    // Smooth camera focus towards the crew member in workspace
    cameraFocusTargetRef.current = {
      x: crew.position[0],
      y: crew.position[1] + 0.6,
      z: crew.position[2],
      dist: 7.5,
      name: crew.name
    };

    if (crewId === 'zara') {
      // Zara Chen: High-Frequency Liquidity Injection into BTC & SOL
      if (barSurgesRef.current) {
        barSurgesRef.current[0] = 2.4; // BTC
        barSurgesRef.current[2] = 2.6; // SOL
      }
      setPioneer((prev) => ({
        ...prev,
        cryptoBalanceAeth: prev.cryptoBalanceAeth + 18,
        latestThought: 'Zara Chen sincronizou a matriz 3D do livro de ofertas! Injeção de liquidez profunda em BTC e SOL.',
        logEntries: [
          {
            id: `log-${Date.now()}`,
            time: `Hoje, ${timeStr}`,
            title: 'Liquidez de Derivativos (Zara Chen)',
            text: 'Ordens limite BTC/SOL sincronizadas com as colunas 3D (+18 AETH).',
            type: 'survival'
          },
          ...prev.logEntries
        ]
      }));
      setStationActionToast({
        title: '⚡ Injeção de Liquidez: Zara Chen',
        desc: 'Matriz 3D de ordens ativada! Fluxo acelerado nas barras de BTC e SOL.',
        type: 'crypto'
      });
    } else if (crewId === 'atlas') {
      // Atlas-9: Flash-Loans & Vault Collateral Containment
      if (barSurgesRef.current) {
        barSurgesRef.current[1] = 2.5; // ETH
        barSurgesRef.current[3] = 2.8; // AETH
      }
      setPioneer((prev) => ({
        ...prev,
        energy: Math.min(100, prev.energy + 20),
        latestThought: 'Atlas-9 ergueu a blindagem de contenção dos cofres! Garantia de staking travada sem risco de liquidação.',
        logEntries: [
          {
            id: `log-${Date.now()}`,
            time: `Hoje, ${timeStr}`,
            title: 'Contenção de Cofres (Atlas-9)',
            text: 'Escudo de força ativado e garantia líquida travada (+20% Energia).',
            type: 'survival'
          },
          ...prev.logEntries
        ]
      }));
      setStationActionToast({
        title: '🛡️ Sentinela Atlas-9: Cofres Travados',
        desc: 'Escudo de força expandido! Barras de ETH e AETH em canal de rendimento.',
        type: 'crypto'
      });
    } else if (crewId === 'nyx') {
      // Nyx Solaris: Oracle Price Feed & RWA Fleet Influx
      if (barSurgesRef.current) {
        barSurgesRef.current[4] = 2.8; // AVAX
        CRYPTO_BAR_CONFIGS.forEach((_, i) => {
          setTimeout(() => {
            if (barSurgesRef.current) barSurgesRef.current[i] = Math.max(barSurgesRef.current[i], 1.5);
          }, i * 90);
        });
      }
      setPioneer((prev) => ({
        ...prev,
        cryptoBalanceAeth: prev.cryptoBalanceAeth + 22,
        latestThought: 'Nyx Solaris alinhou os oráculos orbitais com as frotas de cargueiros! Feixe de preços transmitido a todas as barras.',
        logEntries: [
          {
            id: `log-${Date.now()}`,
            time: `Hoje, ${timeStr}`,
            title: 'Oráculos RWA Transmitidos (Nyx Solaris)',
            text: 'Feixes de telemetria orbital sincronizados com as 5 barras 3D (+22 AETH).',
            type: 'survival'
          },
          ...prev.logEntries
        ]
      }));
      setStationActionToast({
        title: '🛰️ Oráculos RWA: Nyx Solaris',
        desc: 'Cetro giroscópio acionado! Feixe de dados orbitais propagado em AVAX e frotas.',
        type: 'crypto'
      });
    } else if (crewId === 'soren') {
      executeStationAction('quantum-arbitrage');
    } else if (crewId === 'maya') {
      executeStationAction('harvest-hydroponics');
    } else if (crewId === 'lyra') {
      executeStationAction('claim-staking');
    } else if (crewId === 'leo') {
      executeStationAction('deep-scan');
    } else if (crewId === 'kaelen') {
      triggerCryptoBarWave('trading');
    }

    setTimeout(() => {
      setStationActionToast(null);
    }, 4500);
  };

  // Special Emotes / Quick Actions for Kaelen
  const triggerJetpackBoost = () => {
    specialEmoteRef.current = 'jetpack';
    specialEmoteTimerRef.current = 0;
    setStationActionToast({
      title: '🚀 Propulsores Acionados',
      desc: 'Kaelen testou o sistema de voo a jato com micro-propulsores!',
      type: 'info'
    });
    setTimeout(() => {
      setStationActionToast(null);
    }, 3500);
  };

  const triggerDroneScan = () => {
    specialEmoteRef.current = 'scan';
    specialEmoteTimerRef.current = 0;
    setStationActionToast({
      title: '🛰️ Varredura do Drone Auxiliar',
      desc: 'O assistente robótico de Leo está emitindo feixe holográfico diagnóstico!',
      type: 'info'
    });
    setTimeout(() => {
      setStationActionToast(null);
    }, 3500);
  };

  // 3D Three.js Scene Setup & Animation Loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = Math.max(container.clientWidth || 0, 320);
    const height = Math.max(container.clientHeight || 0, 240);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 38);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // RoomEnvironment for realistic studio reflections on metals & glass
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Procedural 3D Textures Generation with Anisotropic Filtering
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const terrainTex = createAlienTerrainTextures(maxAniso);
    const hexTilesTex = createCyberHexTilesTextures(maxAniso);
    const titaniumSpireTex = createTitaniumSpireTextures(maxAniso);
    const waterTex = createQuantumWaterTextures(maxAniso);
    const domeGlassTex = createBioDomeGlassTextures(maxAniso);
    const exoSuitTex = createExoSuitTextures(maxAniso);
    const crystalVaultTex = createCrystalVaultTextures(maxAniso);
    const skyDomeTex = createSkyDomeTexture();
    waterTexturesRef.current = waterTex;

    // Celestial Alien Sky Dome with Stars, Nebula & Ringed Planet
    const skyGeo = new THREE.SphereGeometry(350, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyDomeTex,
      side: THREE.BackSide,
      fog: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);
    skyMeshRef.current = skyMesh;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 2.2);
    dirLight.position.set(30, 45, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    lightsRef.current = {
      dirLight,
      ambientLight,
      skyColor: new THREE.Color(0x090d16)
    };

    // ==========================================
    // 1. TERRAIN & TERRACED BIO-ISLANDS (PBR TEXTURED)
    // ==========================================
    const terrainGroup = new THREE.Group();

    // Central Main Island Platform with Organic Moss & Lichen PBR Texture
    const islandGeo = new THREE.CylinderGeometry(28, 34, 4.5, 32);
    const islandMat = new THREE.MeshStandardMaterial({
      map: terrainTex.map,
      normalMap: terrainTex.normalMap,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughnessMap: terrainTex.roughnessMap,
      roughness: 0.82,
      metalness: 0.12,
      emissiveMap: terrainTex.emissiveMap,
      emissive: new THREE.Color(textureStyle === 'solar-gold' ? 0xd97706 : (textureStyle === 'hologram' ? 0x06b6d4 : 0x10b981)),
      emissiveIntensity: 0.35,
      wireframe: textureStyle === 'hologram',
      color: textureStyle === 'solar-gold' ? 0xd97706 : (textureStyle === 'hologram' ? 0x06b6d4 : 0xffffff),
    });
    const mainIsland = new THREE.Mesh(islandGeo, islandMat);
    mainIsland.position.y = -2.25;
    mainIsland.receiveShadow = true;
    terrainGroup.add(mainIsland);

    // Stepped Upper Terrace with Cybernetic Hex-Pavers Texture
    const terraceGeo = new THREE.CylinderGeometry(18, 22, 3.2, 24);
    const terraceMat = new THREE.MeshStandardMaterial({
      map: hexTilesTex.map,
      normalMap: hexTilesTex.normalMap,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughnessMap: hexTilesTex.roughnessMap,
      roughness: 0.42,
      metalness: 0.72,
      emissiveMap: hexTilesTex.emissiveMap,
      emissive: new THREE.Color(textureStyle === 'solar-gold' ? 0xf59e0b : (textureStyle === 'hologram' ? 0x06b6d4 : 0x34d399)),
      emissiveIntensity: 0.85,
      wireframe: textureStyle === 'hologram',
    });
    const upperTerrace = new THREE.Mesh(terraceGeo, terraceMat);
    upperTerrace.position.y = 0.6;
    upperTerrace.receiveShadow = true;
    terrainGroup.add(upperTerrace);

    // Glowing Liquidity River Path with Animated Wave Caustics Texture
    const waterGeo = new THREE.TorusGeometry(12, 1.8, 16, 50, Math.PI * 1.2);
    const waterMat = new THREE.MeshStandardMaterial({
      map: waterTex.map,
      normalMap: waterTex.normalMap,
      normalScale: new THREE.Vector2(1.8, 1.8),
      color: textureStyle === 'solar-gold' ? 0xfbbf24 : 0xffffff,
      emissive: new THREE.Color(textureStyle === 'solar-gold' ? 0xd97706 : 0x0284c7),
      emissiveIntensity: 0.65,
      roughness: 0.04,
      metalness: 0.92,
      wireframe: textureStyle === 'hologram',
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = Math.PI / 2;
    waterMesh.position.set(0, 1.25, 2);
    terrainGroup.add(waterMesh);

    // Digital Waterfall Particles Flowing Down the Cliff
    const waterfallParticlesCount = 180;
    const wfPositions = new Float32Array(waterfallParticlesCount * 3);
    for (let i = 0; i < waterfallParticlesCount; i++) {
      wfPositions[i * 3] = (Math.random() - 0.5) * 4;
      wfPositions[i * 3 + 1] = Math.random() * 8 - 4;
      wfPositions[i * 3 + 2] = 18 + (Math.random() - 0.5) * 2;
    }
    const wfGeo = new THREE.BufferGeometry();
    wfGeo.setAttribute('position', new THREE.BufferAttribute(wfPositions, 3));
    const wfMat = new THREE.PointsMaterial({
      color: textureStyle === 'solar-gold' ? 0xfbbf24 : 0x67e8f9,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const waterfallParticles = new THREE.Points(wfGeo, wfMat);
    terrainGroup.add(waterfallParticles);

    // 1B. INSTANCED PERIMETER DEFENSE SHIELD BEACONS (High-Performance 12-Pylon Grid)
    const pylonGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.2, 6);
    const pylonMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      roughness: 0.3,
      metalness: 0.85,
      emissive: new THREE.Color(textureStyle === 'solar-gold' ? 0xf59e0b : 0x06b6d4),
      emissiveIntensity: 0.4,
      wireframe: textureStyle === 'hologram'
    });
    const pylonCount = 12;
    const pylonInstanced = new THREE.InstancedMesh(pylonGeo, pylonMat, pylonCount);
    for (let i = 0; i < pylonCount; i++) {
      const angle = (i / pylonCount) * Math.PI * 2;
      const radius = 27;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      _dummyPosition.set(px, 0.2, pz);
      _dummyQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
      _dummyMatrix.compose(_dummyPosition, _dummyQuaternion, _dummyScale);
      pylonInstanced.setMatrixAt(i, _dummyMatrix);
    }
    pylonInstanced.instanceMatrix.needsUpdate = true;
    pylonInstanced.computeBoundingSphere();
    pylonInstanced.receiveShadow = true;
    terrainGroup.add(pylonInstanced);

    // 1C. INTEGRATED WALKWAY & SKYBRIDGE NETWORK (PERFECT WALKING INTEGRATION)
    const bridgeMat = new THREE.MeshStandardMaterial({
      map: hexTilesTex.map,
      normalMap: hexTilesTex.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: hexTilesTex.roughnessMap,
      roughness: 0.45,
      metalness: 0.72,
      emissiveMap: hexTilesTex.emissiveMap,
      emissive: new THREE.Color(textureStyle === 'solar-gold' ? 0xf59e0b : (textureStyle === 'hologram' ? 0x06b6d4 : 0x34d399)),
      emissiveIntensity: 0.35,
      wireframe: textureStyle === 'hologram'
    });
    const railMat = new THREE.MeshBasicMaterial({
      color: textureStyle === 'solar-gold' ? 0xfbbf24 : (textureStyle === 'hologram' ? 0x06b6d4 : 0x38bdf8)
    });
    const bridgeArchMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      normalMap: titaniumSpireTex.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: titaniumSpireTex.roughnessMap,
      roughness: 0.32,
      metalness: 0.9,
      wireframe: textureStyle === 'hologram'
    });

    // Pathway 1: Central Spire Plaza to Trading Console (x: 0, z: 0 to 4.2)
    const centralPavedPath = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.2, 5.0),
      bridgeMat
    );
    centralPavedPath.position.set(0, 2.15, 2.2);
    centralPavedPath.receiveShadow = true;
    terrainGroup.add(centralPavedPath);

    // Lateral illuminated guide strips for Central Plaza
    const plazaStripL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 5.0), railMat);
    plazaStripL.position.set(-1.45, 2.26, 2.2);
    terrainGroup.add(plazaStripL);
    const plazaStripR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 5.0), railMat);
    plazaStripR.position.set(1.45, 2.26, 2.2);
    terrainGroup.add(plazaStripR);

    // Bridge 1: Terrace to Biodome Airlock Platform (-8.5, -3.5 to -13.4, -6.0)
    // Center: (-11.0, 2.15, -4.8), length ~6.4, angle ~0.52 rad
    const bridge1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 6.4), bridgeMat);
    bridge1.position.set(-11.0, 2.15, -4.8);
    bridge1.rotation.y = 0.52;
    bridge1.receiveShadow = true;
    terrainGroup.add(bridge1);

    // Bridge 1 Handrails & Illuminated Tube Lights
    const rail1L = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 6.4), railMat);
    rail1L.position.set(-1.05, 0.35, 0);
    bridge1.add(rail1L);
    const rail1R = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 6.4), railMat);
    rail1R.position.set(1.05, 0.35, 0);
    bridge1.add(rail1R);

    // Structural Arch Support under Bridge 1
    const arch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 4.0, 8), bridgeArchMat);
    arch1.position.set(-11.0, 0.2, -4.8);
    arch1.rotation.z = 0.25;
    terrainGroup.add(arch1);

    // Bridge 2: Terrace to Liquid Staking Vault Platform (8.5, -3.5 to 16.0, -7.5)
    // Center: (12.3, 2.15, -5.5), length ~9.0, angle ~ -0.49 rad
    const bridge2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 9.0), bridgeMat);
    bridge2.position.set(12.3, 2.15, -5.5);
    bridge2.rotation.y = -0.49;
    bridge2.receiveShadow = true;
    terrainGroup.add(bridge2);

    const rail2L = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 9.0), railMat);
    rail2L.position.set(-1.05, 0.35, 0);
    bridge2.add(rail2L);
    const rail2R = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 9.0), railMat);
    rail2R.position.set(1.05, 0.35, 0);
    bridge2.add(rail2R);

    // Pulsing Energy Conduit embedded in Staking Bridge deck
    const stakingConduit = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.06, 9.0),
      new THREE.MeshBasicMaterial({ color: 0x6366f1 })
    );
    stakingConduit.position.set(0, 0.14, 0);
    bridge2.add(stakingConduit);

    // Structural Pylon under Bridge 2
    const arch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 4.5, 8), bridgeArchMat);
    arch2.position.set(12.3, 0.1, -5.5);
    arch2.rotation.z = -0.22;
    terrainGroup.add(arch2);

    // Bridge 3: Terrace to Aerospace Launchpad Platform (8.5, 7.0 to 12.0, 10.2)
    // Center: (10.2, 2.15, 8.6), length ~4.8, angle ~ -0.74 rad
    const bridge3 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 4.8), bridgeMat);
    bridge3.position.set(10.2, 2.15, 8.6);
    bridge3.rotation.y = -0.74;
    bridge3.receiveShadow = true;
    terrainGroup.add(bridge3);

    const rail3L = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 4.8), railMat);
    rail3L.position.set(-1.05, 0.35, 0);
    bridge3.add(rail3L);
    const rail3R = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 4.8), railMat);
    rail3R.position.set(1.05, 0.35, 0);
    bridge3.add(rail3R);

    // Hazard Stripes on Launchpad Bridge Approach
    const hazardStripeMat = new THREE.MeshBasicMaterial({
      color: textureStyle === 'solar-gold' ? 0xf59e0b : 0xfbbf24
    });
    for (let h = -2; h <= 2; h += 0.8) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.02, 0.15), hazardStripeMat);
      stripe.position.set(0, 0.14, h);
      bridge3.add(stripe);
    }

    // Bridge 4: Promenade from Plaza to Waterfall Observation Balcony (0, 2.1, 7.0 to -6.0, 2.1, 17.5)
    const mirantePromenade = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.22, 11.5),
      bridgeMat
    );
    mirantePromenade.position.set(-3.0, 2.15, 12.2);
    mirantePromenade.rotation.y = 0.52;
    mirantePromenade.receiveShadow = true;
    terrainGroup.add(mirantePromenade);

    const miranteRailL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 11.5), railMat);
    miranteRailL.position.set(-1.15, 0.35, 0);
    mirantePromenade.add(miranteRailL);
    const miranteRailR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 11.5), railMat);
    miranteRailR.position.set(1.15, 0.35, 0);
    mirantePromenade.add(miranteRailR);

    // 1D. CANTILEVERED MIRANTE OBSERVATION BALCONY OVER WATERFALL (x: -6.0, z: 17.5)
    const miranteBalconyGroup = new THREE.Group();
    miranteBalconyGroup.position.set(-6.0, 2.15, 17.5);

    // Circular Glass Deck with Luminescent Safety Rim
    const glassFloorGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.2, 24);
    const glassFloorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
      wireframe: textureStyle === 'hologram'
    });
    const glassFloor = new THREE.Mesh(glassFloorGeo, glassFloorMat);
    glassFloor.receiveShadow = true;
    miranteBalconyGroup.add(glassFloor);

    // Glowing Safety Rim
    const rimGeo = new THREE.TorusGeometry(3.3, 0.1, 16, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    const safetyRim = new THREE.Mesh(rimGeo, rimMat);
    safetyRim.rotation.x = Math.PI / 2;
    safetyRim.position.y = 0.12;
    miranteBalconyGroup.add(safetyRim);

    // High-Tech Optical Observation Mast & Binoculars at eye level (y: 1.1 above floor = 3.25 world)
    const mastGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.4, 12);
    const mastMat = new THREE.MeshStandardMaterial({ map: titaniumSpireTex.map, roughness: 0.25, metalness: 0.9 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 0.7, 1.4);
    miranteBalconyGroup.add(mast);

    // Stereoscopic Optic Binocular Head
    const binoGeo = new THREE.BoxGeometry(0.7, 0.25, 0.45);
    const binoMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.85 });
    const bino = new THREE.Mesh(binoGeo, binoMat);
    bino.position.set(0, 1.45, 1.4);
    miranteBalconyGroup.add(bino);

    // Dual Glowing Scanner Lenses
    const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const lensL = new THREE.Mesh(lensGeo, lensMat);
    lensL.rotation.x = Math.PI / 2;
    lensL.position.set(-0.2, 1.45, 1.6);
    miranteBalconyGroup.add(lensL);
    const lensR = new THREE.Mesh(lensGeo, lensMat);
    lensR.rotation.x = Math.PI / 2;
    lensR.position.set(0.2, 1.45, 1.6);
    miranteBalconyGroup.add(lensR);

    // Rotating Atmospheric Scanner Radar Dish atop the mast
    const dishGeo = new THREE.ConeGeometry(0.5, 0.2, 16);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 1.7, 1.4);
    dish.rotation.x = -Math.PI / 3;
    miranteBalconyGroup.add(dish);

    terrainGroup.add(miranteBalconyGroup);

    // Floor Interaction Ring for Kaelen at Mirante Balcony (Waypoint 3: x: -6.0, z: 17.5)
    const miranteFloorPad = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.88, 24),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    miranteFloorPad.rotation.x = -Math.PI / 2;
    miranteFloorPad.position.set(-6.0, 2.22, 17.5);
    scene.add(miranteFloorPad);

    scene.add(terrainGroup);

    // ==========================================
    // 2. MONUMENTAL CENTRAL SPIRE (OPTIMIZED MULTI-TIER ARCHITECTURE)
    // ==========================================
    const spireGroup = new THREE.Group();

    // 2A. Heavy Foundation Podium & Structural Buttresses
    const podiumGeo = new THREE.CylinderGeometry(5.2, 6.4, 2.5, 6);
    const podiumMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      normalMap: titaniumSpireTex.normalMap,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughnessMap: titaniumSpireTex.roughnessMap,
      roughness: 0.28,
      metalness: 0.9,
      wireframe: textureStyle === 'hologram'
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = 1.6;
    podium.receiveShadow = true;
    podium.castShadow = true;
    spireGroup.add(podium);

    // 4 Cantilevered Hydraulic Buttresses gripping into terrace
    const buttressGeo = new THREE.BoxGeometry(1.2, 3.2, 5.0);
    const buttressMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      normalMap: titaniumSpireTex.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: titaniumSpireTex.roughnessMap,
      roughness: 0.25,
      metalness: 0.92,
      wireframe: textureStyle === 'hologram'
    });
    for (let b = 0; b < 4; b++) {
      const buttress = new THREE.Mesh(buttressGeo, buttressMat);
      buttress.rotation.y = (b * Math.PI) / 2;
      buttress.position.set(Math.sin((b * Math.PI) / 2) * 4.2, 1.8, Math.cos((b * Math.PI) / 2) * 4.2);
      buttress.rotation.x = 0.25 * (b % 2 === 0 ? (b === 0 ? 1 : -1) : 0);
      buttress.castShadow = true;
      spireGroup.add(buttress);
    }

    // 2B. Main Spire Core Shaft
    const towerGeo = new THREE.CylinderGeometry(1.4, 3.2, 38, 16);
    const towerMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      normalMap: titaniumSpireTex.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: titaniumSpireTex.roughnessMap,
      roughness: 0.22,
      metalness: 0.92,
      wireframe: textureStyle === 'hologram',
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 20;
    tower.castShadow = true;
    spireGroup.add(tower);

    // 4 Vertical Quantum Radiator Cooling Fin Blades
    const finGeo = new THREE.BoxGeometry(0.18, 26, 1.6);
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.8,
      emissive: new THREE.Color(textureStyle === 'solar-gold' ? 0xd97706 : 0x0284c7),
      emissiveIntensity: 0.45,
      wireframe: textureStyle === 'hologram'
    });
    for (let f = 0; f < 4; f++) {
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.y = 18;
      fin.rotation.y = (f * Math.PI) / 2;
      fin.position.x = Math.sin((f * Math.PI) / 2) * 2.2;
      fin.position.z = Math.cos((f * Math.PI) / 2) * 2.2;
      spireGroup.add(fin);
    }

    // 2C. Cantilever Observation & Trading Floor Deck
    const deckGeo = new THREE.CylinderGeometry(4.2, 4.2, 1.4, 24);
    const deckMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      roughness: 0.2,
      metalness: 0.88,
      wireframe: textureStyle === 'hologram'
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 16.5;
    deck.castShadow = true;
    spireGroup.add(deck);

    // Panoramic Visor Window Belt
    const visorBeltGeo = new THREE.CylinderGeometry(4.25, 4.25, 0.5, 24);
    const visorBeltMat = new THREE.MeshBasicMaterial({
      color: textureStyle === 'solar-gold' ? 0xfbbf24 : 0x38bdf8
    });
    const visorBelt = new THREE.Mesh(visorBeltGeo, visorBeltMat);
    visorBelt.position.y = 16.5;
    spireGroup.add(visorBelt);

    // 2D. Levitating Quantum Crystal Monolith Tip
    const crystalGeo = new THREE.OctahedronGeometry(2.4, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: textureStyle === 'solar-gold' ? 0xfbbf24 : 0x34d399,
      emissive: textureStyle === 'solar-gold' ? 0xd97706 : 0x10b981,
      emissiveIntensity: 1.1,
      roughness: 0.08,
      metalness: 0.95,
      wireframe: textureStyle === 'hologram'
    });
    const crystalTip = new THREE.Mesh(crystalGeo, crystalMat);
    crystalTip.position.y = 40;
    spireGroup.add(crystalTip);

    // Orbital Corona Halo around Crystal Apex
    const haloGeo = new THREE.TorusGeometry(3.4, 0.08, 16, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: textureStyle === 'solar-gold' ? 0xfbbf24 : 0x67e8f9
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 40;
    halo.rotation.x = Math.PI / 2.3;
    spireGroup.add(halo);

    // 2E. Rotating 3D Energy Rings around the Tower
    const ringsGroup = new THREE.Group();
    ringsGroup.position.y = 27;

    const ring1Geo = new THREE.TorusGeometry(6.4, 0.2, 16, 48);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.25,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ringsGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(9.0, 0.18, 16, 48);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.25,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = 0.4;
    ringsGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(11.6, 0.16, 16, 48);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 1.1,
      roughness: 0.2,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ringsGroup.add(ring3);

    spireGroup.add(ringsGroup);
    energyRingsRef.current = ringsGroup;

    // 2F. INTERACTIVE QUANTUM TRADING CONSOLE (Central Spire Station - Waypoint 0)
    const tradingConsoleGroup = new THREE.Group();
    tradingConsoleGroup.position.set(0, 2.15, 3.2);

    // Operator Desk
    const tradeDesk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 0.9, 12, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ map: titaniumSpireTex.map, roughness: 0.3, metalness: 0.88 })
    );
    tradeDesk.rotation.y = Math.PI;
    tradeDesk.position.y = 0.45;
    tradingConsoleGroup.add(tradeDesk);

    // Holographic Orderbook Screen Ring (Rotating in loop)
    const tradeHoloRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.05, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    tradeHoloRing.position.set(0, 1.25, 0);
    tradeHoloRing.rotation.x = Math.PI / 3;
    tradingConsoleGroup.add(tradeHoloRing);

    // Uplink Conduit Beam into Spire Core
    const tradeUplink = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
    );
    tradeUplink.position.set(0, 1.6, -1.2);
    tradeUplink.rotation.x = -0.3;
    tradingConsoleGroup.add(tradeUplink);

    spireGroup.add(tradingConsoleGroup);

    // Floor Interaction Ring for Kaelen (Waypoint 0: x: 0, z: 4.2)
    const tradeFloorPad = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.88, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    tradeFloorPad.rotation.x = -Math.PI / 2;
    tradeFloorPad.position.set(0, 2.22, 4.2);
    scene.add(tradeFloorPad);

    scene.add(spireGroup);

    // ==========================================
    // 3. PIONEER'S FAMILY BIO-DOME HABITAT (ARCHITECTURAL ECO-COMPLEX)
    // ==========================================
    const habitatGroup = new THREE.Group();
    habitatGroup.position.set(-16, 2, -10);

    // 3A. Heavy Structural Titanium Base Ring
    const baseRingGeo = new THREE.CylinderGeometry(5.8, 6.2, 0.8, 24);
    const baseRingMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      roughness: 0.35,
      metalness: 0.85,
      wireframe: textureStyle === 'hologram'
    });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.position.y = 0.4;
    baseRing.receiveShadow = true;
    habitatGroup.add(baseRing);

    // 3B. Pressurized Airlock Module
    const airlockGeo = new THREE.BoxGeometry(1.6, 1.8, 2.6);
    const airlockMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      roughness: 0.25,
      metalness: 0.9,
      wireframe: textureStyle === 'hologram'
    });
    const airlock = new THREE.Mesh(airlockGeo, airlockMat);
    airlock.position.set(2.4, 0.9, 4.4);
    airlock.rotation.y = -0.52;
    airlock.castShadow = true;
    habitatGroup.add(airlock);

    const airlockDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.4, 0.1),
      new THREE.MeshBasicMaterial({ color: textureStyle === 'solar-gold' ? 0xf59e0b : 0x34d399 })
    );
    airlockDoor.position.set(0, 0, 1.32);
    airlock.add(airlockDoor);

    // 3B-1. Airlock Biometric Pedestal & Environmental Terminal (Waypoint 1: x: -13.4, z: -6.0)
    // Relative to habitatGroup (-16, 2, -10): local x: 2.6, y: 0.15, z: 4.0
    const bioTerminalGroup = new THREE.Group();
    bioTerminalGroup.position.set(2.6, 0.15, 4.0);

    const bioPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.25, 0.9, 12),
      new THREE.MeshStandardMaterial({ map: titaniumSpireTex.map, roughness: 0.3, metalness: 0.85 })
    );
    bioPedestal.position.y = 0.45;
    bioTerminalGroup.add(bioPedestal);

    const bioHandScanner = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.1, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    bioHandScanner.position.set(0, 0.92, 0);
    bioTerminalGroup.add(bioHandScanner);

    // Floating Eco-Dashboard Hologram
    const bioScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.5),
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    bioScreen.position.set(0, 1.35, 0);
    bioScreen.rotation.y = -0.52;
    bioTerminalGroup.add(bioScreen);

    habitatGroup.add(bioTerminalGroup);

    // Floor Non-slip Ring for Kaelen at Biodome Airlock
    const bioFloorPad = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.88, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    bioFloorPad.rotation.x = -Math.PI / 2;
    bioFloorPad.position.set(-13.4, 2.22, -6.0);
    scene.add(bioFloorPad);

    // 3C. Geodesic Dome Glass Structure
    const domeGeo = new THREE.SphereGeometry(5.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      map: domeGlassTex.map,
      color: textureStyle === 'solar-gold' ? 0xfde047 : 0x6ee7b7,
      roughness: 0.08,
      metalness: 0.4,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      wireframe: textureStyle === 'hologram',
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.8;
    habitatGroup.add(dome);

    // Dome Hexagonal Lattice Wireframe
    const domeWireMat = new THREE.MeshBasicMaterial({ 
      color: textureStyle === 'solar-gold' ? 0xf59e0b : 0x34d399, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.7 
    });
    const domeWire = new THREE.Mesh(domeGeo, domeWireMat);
    domeWire.position.y = 0.8;
    habitatGroup.add(domeWire);

    // 3D. Articulating Photovoltaic Solar Wings
    const solarWingGeo = new THREE.BoxGeometry(3.6, 0.08, 1.6);
    const solarWingMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.9,
      wireframe: textureStyle === 'hologram'
    });
    // Left Solar Wing
    const leftWing = new THREE.Mesh(solarWingGeo, solarWingMat);
    leftWing.position.set(-6.5, 2.5, 0);
    leftWing.rotation.z = 0.25;
    leftWing.rotation.x = -0.3;
    leftWing.castShadow = true;
    habitatGroup.add(leftWing);
    // Right Solar Wing
    const rightWing = new THREE.Mesh(solarWingGeo, solarWingMat);
    rightWing.position.set(6.5, 2.5, 0);
    rightWing.rotation.z = -0.25;
    rightWing.rotation.x = -0.3;
    rightWing.castShadow = true;
    habitatGroup.add(rightWing);

    // 3E. Internal Habitat Hearth Warm Light & Life-Support Column
    const hearthLight = new THREE.PointLight(0xf59e0b, 2.8, 15);
    hearthLight.position.set(0, 2.2, 0);
    habitatGroup.add(hearthLight);

    // Central Life-Support Column
    const scrubberGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.8, 12);
    const scrubberMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      roughness: 0.3,
      metalness: 0.85
    });
    const scrubber = new THREE.Mesh(scrubberGeo, scrubberMat);
    scrubber.position.y = 1.9;
    habitatGroup.add(scrubber);

    // Hydroponic Tree Inside Dome
    const treeTrunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.6, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
    trunk.position.set(-1.8, 1.3, -1.2);
    habitatGroup.add(trunk);

    const foliageGeo = new THREE.SphereGeometry(1.6, 12, 12);
    const foliageMat = new THREE.MeshStandardMaterial({ 
      color: textureStyle === 'solar-gold' ? 0xca8a04 : 0x22c55e, 
      roughness: 0.6 
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(-1.8, 3.0, -1.2);
    habitatGroup.add(foliage);

    scene.add(habitatGroup);

    // ==========================================
    // 4. SECONDARY SPIRES & INFRASTRUCTURE VAULTS
    // ==========================================
    // 4A. LIQUID STAKING VAULT (x: 18, z: -8)
    const stakingGroup = new THREE.Group();
    stakingGroup.position.set(18, 0, -8);

    const stakPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.8, 1.6, 6),
      new THREE.MeshStandardMaterial({ map: titaniumSpireTex.map, roughness: 0.3, metalness: 0.9 })
    );
    stakPedestal.position.y = 0.8;
    stakPedestal.receiveShadow = true;
    stakingGroup.add(stakPedestal);

    // Twin Server Pillars
    const stakPillarMat = new THREE.MeshStandardMaterial({
      map: crystalVaultTex.map,
      normalMap: crystalVaultTex.normalMap,
      normalScale: new THREE.Vector2(1.0, 1.0),
      emissiveMap: crystalVaultTex.emissiveMap,
      color: 0x818cf8,
      emissive: 0x6366f1,
      emissiveIntensity: 0.9,
      roughness: 0.12,
      metalness: 0.88,
      wireframe: textureStyle === 'hologram',
    });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 16, 1.2), stakPillarMat);
    p1.position.set(-1.2, 8.8, 0);
    p1.castShadow = true;
    stakingGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 16, 1.2), stakPillarMat);
    p2.position.set(1.2, 8.8, 0);
    p2.castShadow = true;
    stakingGroup.add(p2);

    // Floating Staking Core Crystal suspended between pillars
    const stakCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.8, 0),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.0,
        roughness: 0.05,
        metalness: 0.95
      })
    );
    stakCore.position.set(0, 9.5, 0);
    stakingGroup.add(stakCore);

    // Quantum Accumulator Ring atop Staking Pillars
    const accumRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.15, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x3b82f6, emissiveIntensity: 0.9 })
    );
    accumRing.position.y = 17;
    accumRing.rotation.x = Math.PI / 2;
    stakingGroup.add(accumRing);

    // 4A-1. VALIDATOR EXTRACTION CONSOLE & LIQUID HARVESTER (Waypoint 2: x: 16.0, z: -7.5)
    // Relative to stakingGroup (18, 0, -8): local x: -1.2, y: 2.15, z: 0.5
    const stakConsoleGroup = new THREE.Group();
    stakConsoleGroup.position.set(-1.2, 2.15, 0.5);

    const stakDesk = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.85, 0.9),
      new THREE.MeshStandardMaterial({ 
        map: titaniumSpireTex.map, 
        normalMap: titaniumSpireTex.normalMap,
        roughnessMap: titaniumSpireTex.roughnessMap,
        roughness: 0.25, 
        metalness: 0.9 
      })
    );
    stakDesk.position.y = 0.42;
    stakConsoleGroup.add(stakDesk);

    // Glowing Coolant Liquid Cylinder
    const stakCoolant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.7, 16),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.85 })
    );
    stakCoolant.position.set(0, 0.95, 0);
    stakConsoleGroup.add(stakCoolant);

    // Floating Staking Reward Shard Glyph (Rotating in loop)
    const stakShard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.25, 0),
      new THREE.MeshStandardMaterial({ color: 0xa5b4fc, emissive: 0x6366f1, emissiveIntensity: 1.2 })
    );
    stakShard.position.set(0, 1.5, 0);
    stakConsoleGroup.add(stakShard);

    stakingGroup.add(stakConsoleGroup);

    // Floor Rune Pad for Kaelen at Staking Station
    const stakFloorPad = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.88, 24),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    stakFloorPad.rotation.x = -Math.PI / 2;
    stakFloorPad.position.set(16.0, 2.22, -7.5);
    scene.add(stakFloorPad);

    scene.add(stakingGroup);

    // 4B. COLD STORAGE CRYPT MONOLITH (x: -12, z: 14)
    const cryptGroup = new THREE.Group();
    cryptGroup.position.set(-12, 0, 14);

    const cryptBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.4, 1.4, 8),
      new THREE.MeshStandardMaterial({ 
        map: titaniumSpireTex.map, 
        normalMap: titaniumSpireTex.normalMap,
        roughnessMap: titaniumSpireTex.roughnessMap,
        roughness: 0.3, 
        metalness: 0.9 
      })
    );
    cryptBase.position.y = 0.7;
    cryptGroup.add(cryptBase);

    // Levitating Crypt Obelisk
    const cryptObelisk = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 14, 6),
      new THREE.MeshStandardMaterial({
        map: crystalVaultTex.map,
        normalMap: crystalVaultTex.normalMap,
        normalScale: new THREE.Vector2(1.0, 1.0),
        emissiveMap: crystalVaultTex.emissiveMap,
        color: 0xa78bfa,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.85,
        roughness: 0.12,
        metalness: 0.9,
        wireframe: textureStyle === 'hologram'
      })
    );
    cryptObelisk.position.y = 9.2;
    cryptObelisk.castShadow = true;
    cryptGroup.add(cryptObelisk);
    scene.add(cryptGroup);

    // 4C. LAUNCHPAD & AEROSPACE TERMINAL (x: 14, z: 12)
    const launchpadGroup = new THREE.Group();
    launchpadGroup.position.set(14, 0, 12);

    const padPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(6.4, 7.2, 1.4, 8),
      new THREE.MeshStandardMaterial({
        map: hexTilesTex.map,
        normalMap: hexTilesTex.normalMap,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughnessMap: hexTilesTex.roughnessMap,
        roughness: 0.45,
        metalness: 0.72,
        emissiveMap: hexTilesTex.emissiveMap,
        emissive: new THREE.Color(textureStyle === 'solar-gold' ? 0xf59e0b : 0x34d399),
        emissiveIntensity: 0.3,
        wireframe: textureStyle === 'hologram'
      })
    );
    padPlatform.position.y = 0.7;
    padPlatform.receiveShadow = true;
    launchpadGroup.add(padPlatform);

    // Landing Ring Target Markings (PolygonOffset to avoid z-fighting)
    const targetRing = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.6, 32),
      new THREE.MeshBasicMaterial({
        color: textureStyle === 'solar-gold' ? 0xf59e0b : 0x34d399,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 1.42;
    launchpadGroup.add(targetRing);

    // 8 Instanced Runway Approach Lights on Launchpad Perimeter
    const beaconGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: textureStyle === 'solar-gold' ? 0xfbbf24 : 0x38bdf8
    });
    const padBeaconInstanced = new THREE.InstancedMesh(beaconGeo, beaconMat, 8);
    for (let i = 0; i < 8; i++) {
      const bAngle = (i / 8) * Math.PI * 2;
      _dummyPosition.set(Math.cos(bAngle) * 5.2, 1.5, Math.sin(bAngle) * 5.2);
      _dummyQuaternion.identity();
      _dummyMatrix.compose(_dummyPosition, _dummyQuaternion, _dummyScale);
      padBeaconInstanced.setMatrixAt(i, _dummyMatrix);
    }
    padBeaconInstanced.instanceMatrix.needsUpdate = true;
    padBeaconInstanced.computeBoundingSphere();
    launchpadGroup.add(padBeaconInstanced);

    // Launch Gantry Crane Tower
    const gantry = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 14, 8),
      new THREE.MeshStandardMaterial({ map: titaniumSpireTex.map, roughness: 0.3, metalness: 0.9 })
    );
    gantry.position.set(4.5, 7, 0);
    gantry.castShadow = true;
    launchpadGroup.add(gantry);

    // Articulated Docking Boom Arm
    const boom = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 })
    );
    boom.position.set(2.4, 13.5, 0);
    launchpadGroup.add(boom);

    // 4C-1. FLIGHT DISPATCH PULPIT & RADAR CONSOLE (Waypoint 4: x: 12.0, z: 10.2)
    // Relative to launchpadGroup (14, 0, 12): local x: -1.4, y: 2.15, z: -1.2
    const launchConsoleGroup = new THREE.Group();
    launchConsoleGroup.position.set(-1.4, 2.15, -1.2);

    const dispatchDesk = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.85, 0.7),
      new THREE.MeshStandardMaterial({ map: hexTilesTex.map, roughness: 0.35, metalness: 0.8 })
    );
    dispatchDesk.position.y = 0.42;
    dispatchDesk.rotation.y = -Math.PI / 4;
    launchConsoleGroup.add(dispatchDesk);

    // 3D Rotating Airspace Radar Hologram Cone
    const radarHolo = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 0.7, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true, transparent: true, opacity: 0.8 })
    );
    radarHolo.position.set(0, 1.15, 0);
    launchConsoleGroup.add(radarHolo);

    // Stack of Cargo Pallets beside console
    const cargo1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.5, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 })
    );
    cargo1.position.set(0.8, 0.25, 0.2);
    launchConsoleGroup.add(cargo1);

    launchpadGroup.add(launchConsoleGroup);

    // Floor Docking Pad for Kaelen at Launchpad Station
    const launchFloorPad = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.88, 24),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    launchFloorPad.rotation.x = -Math.PI / 2;
    launchFloorPad.position.set(12.0, 2.22, 10.2);
    scene.add(launchFloorPad);

    scene.add(launchpadGroup);

    // ==========================================
    // 5. 3D AEROSPACE HOVER SHUTTLES (AERODYNAMIC OPTIMIZED DESIGN)
    // ==========================================
    const shuttles: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const shuttle = new THREE.Group();

      // Fuselage Main Body
      const bodyGeo = new THREE.ConeGeometry(0.7, 3.2, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ 
        map: titaniumSpireTex.map,
        bumpMap: titaniumSpireTex.bumpMap,
        bumpScale: 0.08,
        color: 0xf8fafc, 
        roughness: 0.2, 
        metalness: 0.88,
        wireframe: textureStyle === 'hologram',
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI / 2;
      body.castShadow = true;
      shuttle.add(body);

      // Cockpit Canopy Glass
      const cockpitGeo = new THREE.BoxGeometry(0.5, 0.3, 1.1);
      const cockpitMat = new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xfbbf24 : 0x38bdf8
      });
      const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
      cockpit.position.set(0, 0.3, 0.4);
      shuttle.add(cockpit);

      // Swept Delta Wings
      const wingGeo = new THREE.BoxGeometry(3.4, 0.08, 1.4);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.3,
        metalness: 0.85
      });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, -0.05, -0.4);
      shuttle.add(wings);

      // Dual Twin Plasma Engine Nacelles
      const nacelleMat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xfbbf24 : 0x38bdf8 });
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.6, 8), nacelleMat);
      engL.rotation.x = Math.PI / 2;
      engL.position.set(-0.6, -0.1, -1.6);
      shuttle.add(engL);

      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.6, 8), nacelleMat);
      engR.rotation.x = Math.PI / 2;
      engR.position.set(0.6, -0.1, -1.6);
      shuttle.add(engR);

      shuttle.position.set(
        Math.cos(i * 2.1) * 22,
        14 + i * 5,
        Math.sin(i * 2.1) * 22
      );

      scene.add(shuttle);
      shuttles.push(shuttle);
    }
    shuttlesRef.current = shuttles;

    // ==========================================
    // 5B. MONUMENTAL 3D CRYPTO BAR GRAPH MATRIX (VOLUMETRIC LIQUIDITY BARS)
    // ==========================================
    const cryptoPlatformGroup = new THREE.Group();
    // Positioned on the open cyber-terrace overlooking central plaza:
    cryptoPlatformGroup.position.set(5.2, 2.15, 3.2);

    // Platform Base with Cyber Hex Geometry & Glowing Trim
    const cryptoPodiumGeo = new THREE.BoxGeometry(8.6, 0.28, 3.4);
    const cryptoPodiumMat = new THREE.MeshStandardMaterial({
      map: hexTilesTex.map,
      bumpMap: hexTilesTex.bumpMap,
      bumpScale: 0.08,
      roughness: 0.35,
      metalness: 0.85,
      wireframe: textureStyle === 'hologram'
    });
    const cryptoPodium = new THREE.Mesh(cryptoPodiumGeo, cryptoPodiumMat);
    cryptoPodium.position.y = 0.14;
    cryptoPodium.receiveShadow = true;
    cryptoPlatformGroup.add(cryptoPodium);

    // Glowing Neon Perimeter Border Trim for the Bar Matrix
    const cryptoBorderGeo = new THREE.BoxGeometry(8.75, 0.06, 3.55);
    const cryptoBorderMat = new THREE.MeshBasicMaterial({
      color: textureStyle === 'solar-gold' ? 0xf59e0b : 0x06b6d4,
      transparent: true,
      opacity: 0.9
    });
    const cryptoBorder = new THREE.Mesh(cryptoBorderGeo, cryptoBorderMat);
    cryptoBorder.position.y = 0.29;
    cryptoPlatformGroup.add(cryptoBorder);

    // Lateral Cyber Pylons framing the Bar Matrix
    const framePylonGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.4, 8);
    const framePylonMat = new THREE.MeshStandardMaterial({
      map: titaniumSpireTex.map,
      roughness: 0.25,
      metalness: 0.9
    });
    const pylonLeft = new THREE.Mesh(framePylonGeo, framePylonMat);
    pylonLeft.position.set(-4.2, 1.2, 0);
    cryptoPlatformGroup.add(pylonLeft);
    const pylonRight = new THREE.Mesh(framePylonGeo, framePylonMat);
    pylonRight.position.set(4.2, 1.2, 0);
    cryptoPlatformGroup.add(pylonRight);

    // Array of Bar Meshes and their companion components
    const barMeshes: THREE.Mesh[] = [];
    const barSheaths: THREE.Mesh[] = [];
    const barDiamonds: THREE.Mesh[] = [];
    const barBeams: THREE.Mesh[] = [];
    const barShockwaves: THREE.Mesh[] = [];

    // Unit Box Geometry with base anchored at y = 0
    const barBoxGeo = new THREE.BoxGeometry(0.72, 1.0, 0.72);
    barBoxGeo.translate(0, 0.5, 0); // Bottom pivot: scale.y expands upward!

    const sheathBoxGeo = new THREE.BoxGeometry(0.82, 1.0, 0.82);
    sheathBoxGeo.translate(0, 0.5, 0);

    const beamCylGeo = new THREE.CylinderGeometry(0.08, 0.35, 24, 12);
    beamCylGeo.translate(0, 12, 0); // Bottom pivot for beam

    CRYPTO_BAR_CONFIGS.forEach((coin) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(coin.xOffset, 0.28, 0);

      // 1. Cyber Base Pedestal
      const pedGeo = new THREE.CylinderGeometry(0.52, 0.62, 0.32, 12);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.85,
        emissive: new THREE.Color(coin.color),
        emissiveIntensity: 0.3
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.16;
      colGroup.add(pedestal);

      // Neon LED Ring around Pedestal
      const ledRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.04, 12, 24),
        new THREE.MeshBasicMaterial({ color: coin.color })
      );
      ledRing.position.y = 0.31;
      ledRing.rotation.x = Math.PI / 2;
      colGroup.add(ledRing);

      // 2. Main Volumetric 3D Bar Column with Holographic Grid & Ticker Texture
      const cryptoBarTex = createCryptoBarTexture(coin.symbol, coin.hexColor);
      const barMat = new THREE.MeshStandardMaterial({
        map: cryptoBarTex,
        color: coin.color,
        emissiveMap: cryptoBarTex,
        emissive: new THREE.Color(coin.color),
        emissiveIntensity: 0.85,
        roughness: 0.14,
        metalness: 0.92,
        wireframe: textureStyle === 'hologram'
      });
      const barMesh = new THREE.Mesh(barBoxGeo, barMat);
      barMesh.position.y = 0.32;
      barMesh.scale.y = coin.baseHeightLow;
      barMesh.castShadow = true;
      colGroup.add(barMesh);
      barMeshes.push(barMesh);

      // 3. Outer Translucent Holographic Wireframe Aura Sheath
      const sheathMat = new THREE.MeshBasicMaterial({
        color: coin.color,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const sheathMesh = new THREE.Mesh(sheathBoxGeo, sheathMat);
      sheathMesh.position.y = 0.32;
      sheathMesh.scale.y = coin.baseHeightLow;
      colGroup.add(sheathMesh);
      barSheaths.push(sheathMesh);

      // 4. Floating Crystalline Diamond Apex
      const diamondGeo = new THREE.OctahedronGeometry(0.28, 0);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(coin.color),
        emissiveIntensity: 1.25,
        roughness: 0.05,
        metalness: 0.95
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.y = 0.32 + coin.baseHeightLow + 0.28;
      colGroup.add(diamond);
      barDiamonds.push(diamond);

      // 5. Skyward Volumetric Light Laser Beam
      const beamMat = new THREE.MeshBasicMaterial({
        color: coin.color,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const beam = new THREE.Mesh(beamCylGeo, beamMat);
      beam.position.y = 0.32 + coin.baseHeightLow;
      colGroup.add(beam);
      barBeams.push(beam);

      // 6. Expanding Ground Shockwave Ripple Ring
      const shockwaveGeo = new THREE.RingGeometry(0.55, 0.75, 24);
      const shockwaveMat = new THREE.MeshBasicMaterial({
        color: coin.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });
      const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
      shockwave.position.y = 0.32;
      shockwave.rotation.x = -Math.PI / 2;
      colGroup.add(shockwave);
      barShockwaves.push(shockwave);

      cryptoPlatformGroup.add(colGroup);
    });

    scene.add(cryptoPlatformGroup);
    cryptoBarsMeshRef.current = {
      bars: barMeshes,
      sheaths: barSheaths,
      diamonds: barDiamonds,
      beams: barBeams,
      shockwaves: barShockwaves
    };

    // ==========================================
    // 6. THE LIVING PIONEER CHARACTER (KAELEN - CARBON WEAVE EXOSUIT & FULL ARTICULATION)
    // ==========================================
    const pioneerGroup = new THREE.Group();

    // High-resolution dedicated chestplate texture with real HUD telemetry
    const chestTex = createPioneerChestTexture();

    // Torso (Exo-Suit Armor with Clean Carbon-Fiber Micro-Weave & Normal Mapping)
    const torsoGeo = new THREE.BoxGeometry(0.7, 1.0, 0.45);
    const suitMat = new THREE.MeshStandardMaterial({ 
      map: exoSuitTex.map,
      normalMap: exoSuitTex.normalMap,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughnessMap: exoSuitTex.roughnessMap,
      roughness: 0.42, 
      metalness: 0.65,
      wireframe: textureStyle === 'hologram',
    });
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    pioneerGroup.add(torso);

    // Armor Chestplate Accent with dynamic emissive responsive color & HUD telemetry
    const chestGeo = new THREE.BoxGeometry(0.5, 0.4, 0.15);
    const chestMat = new THREE.MeshStandardMaterial({ 
      map: chestTex,
      emissiveMap: chestTex,
      color: 0x10b981, 
      emissive: new THREE.Color(0x059669), 
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.75
    });
    const chest = new THREE.Mesh(chestGeo, chestMat);
    chest.position.set(0, 1.4, 0.22);
    pioneerGroup.add(chest);

    // Life-Support Jump-Pack on Back of Torso
    const packGeo = new THREE.BoxGeometry(0.52, 0.75, 0.22);
    const packMat = new THREE.MeshStandardMaterial({ map: titaniumSpireTex.map, roughness: 0.3, metalness: 0.88 });
    const backpack = new THREE.Mesh(packGeo, packMat);
    backpack.position.set(0, 1.35, -0.32);
    pioneerGroup.add(backpack);

    // Pulsing Fuel Cell Canister on Backpack
    const cellGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 12);
    const cellMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.0 });
    const cell = new THREE.Mesh(cellGeo, cellMat);
    cell.position.set(0, 1.35, -0.45);
    pioneerGroup.add(cell);

    // Dual Micro-Thruster Nozzles
    const thrustGeo = new THREE.CylinderGeometry(0.07, 0.11, 0.25, 8);
    const thrustMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });
    const thrusterL = new THREE.Mesh(thrustGeo, thrustMat);
    thrusterL.position.set(-0.16, 0.92, -0.34);
    pioneerGroup.add(thrusterL);
    const thrusterR = new THREE.Mesh(thrustGeo, thrustMat);
    thrusterR.position.set(0.16, 0.92, -0.34);
    pioneerGroup.add(thrusterR);

    // Helmet & Glowing Biometric Visor
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const helmetMat = new THREE.MeshStandardMaterial({ 
      map: exoSuitTex.map,
      roughness: 0.3, 
      metalness: 0.7 
    });
    const head = new THREE.Mesh(headGeo, helmetMat);
    head.position.y = 2.05;
    head.castShadow = true;
    pioneerGroup.add(head);

    const visorGeo = new THREE.BoxGeometry(0.4, 0.18, 0.2);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.05, 0.25);
    pioneerGroup.add(visor);

    // Articulated Left Arm (Shoulder Pivot at -0.45, 1.75, 0)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.45, 1.75, 0);
    const upperArmGeo = new THREE.BoxGeometry(0.18, 0.42, 0.18);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, suitMat);
    leftUpperArm.position.y = -0.21;
    leftUpperArm.castShadow = true;
    leftArmGroup.add(leftUpperArm);
    const foreArmGeo = new THREE.BoxGeometry(0.16, 0.38, 0.16);
    const leftForeArm = new THREE.Mesh(foreArmGeo, suitMat);
    leftForeArm.position.set(0, -0.56, 0.04);
    leftForeArm.castShadow = true;
    leftArmGroup.add(leftForeArm);
    // Left Gauntlet Tactile Comm Pad
    const commPadMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const commPadL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), commPadMat);
    commPadL.position.set(0, -0.68, 0.04);
    leftArmGroup.add(commPadL);
    pioneerGroup.add(leftArmGroup);

    // Articulated Right Arm (Shoulder Pivot at 0.45, 1.75, 0)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.45, 1.75, 0);
    const rightUpperArm = new THREE.Mesh(upperArmGeo, suitMat);
    rightUpperArm.position.y = -0.21;
    rightUpperArm.castShadow = true;
    rightArmGroup.add(rightUpperArm);
    const rightForeArm = new THREE.Mesh(foreArmGeo, suitMat);
    rightForeArm.position.set(0, -0.56, 0.04);
    rightForeArm.castShadow = true;
    rightArmGroup.add(rightForeArm);
    const commPadR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), commPadMat);
    commPadR.position.set(0, -0.68, 0.04);
    rightArmGroup.add(commPadR);
    pioneerGroup.add(rightArmGroup);

    // Legs with Carbon Weave Armor & Magnet Boots
    const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.25);
    const leftLeg = new THREE.Mesh(legGeo, suitMat);
    leftLeg.position.set(-0.2, 0.5, 0);
    leftLeg.castShadow = true;
    pioneerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, suitMat);
    rightLeg.position.set(0.2, 0.5, 0);
    rightLeg.castShadow = true;
    pioneerGroup.add(rightLeg);

    // Ground Contact Shadow Disk (anchors character visually to walkways)
    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x020617, transparent: true, opacity: 0.45 });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.02;
    pioneerGroup.add(contactShadow);

    // Floating Companion Drone / Android Child Helper
    const droneGroup = new THREE.Group();
    droneGroup.position.set(0.7, 2.2, -0.2);

    const droneGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const droneMat = new THREE.MeshStandardMaterial({ 
      map: titaniumSpireTex.map,
      roughness: 0.2, 
      metalness: 0.9 
    });
    const drone = new THREE.Mesh(droneGeo, droneMat);
    droneGroup.add(drone);

    const droneEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
    droneEye.position.set(0, 0, 0.18);
    droneGroup.add(droneEye);

    // Downward Diagnostic Holographic Scan Cone from Drone
    const scanConeGeo = new THREE.CylinderGeometry(0.03, 0.65, 1.3, 16, 1, true);
    const scanConeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const scanCone = new THREE.Mesh(scanConeGeo, scanConeMat);
    scanCone.position.set(0, -0.7, 0.2);
    scanCone.rotation.x = -0.25;
    droneGroup.add(scanCone);

    pioneerGroup.add(droneGroup);

    // Floating nametag badge for Pioneer Kaelen
    const kaelenBadgeMat = new THREE.SpriteMaterial({
      map: createCharacterBadgeTexture('Kaelen Vane', 'Engenheiro Chefe', '#38bdf8'),
      transparent: true
    });
    const kaelenBadge = new THREE.Sprite(kaelenBadgeMat);
    kaelenBadge.position.set(0, 2.5, 0);
    kaelenBadge.scale.set(2.2, 0.73, 1);
    pioneerGroup.add(kaelenBadge);

    // Position pioneer initially on terrace at Trading Station
    pioneerGroup.position.set(0, 2.2, 4.2);
    scene.add(pioneerGroup);
    pioneerGroupRef.current = pioneerGroup;

    // ==========================================
    // 6B. SPECIALIZED WORKER CHARACTERS IN CITADEL WORKSPACES
    // ==========================================

    // 1. MAYA VANE (Botânica & Bio-Sintetizadora at Biodome: -14.6, 2.15, -7.6)
    const mayaGroup = new THREE.Group();
    mayaGroup.position.set(-14.6, 2.15, -7.6);
    mayaGroup.rotation.y = -0.4;

    const mayaTorsoMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 0.4,
      roughness: 0.35,
      metalness: 0.65
    });
    const mayaTorso = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.94, 0.42), mayaTorsoMat);
    mayaTorso.position.y = 1.25;
    mayaTorso.castShadow = true;
    mayaGroup.add(mayaTorso);

    const mayaChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.36, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: new THREE.Color(0x059669), emissiveIntensity: 0.85 })
    );
    mayaChest.position.set(0, 1.35, 0.22);
    mayaGroup.add(mayaChest);

    const mayaHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 })
    );
    mayaHead.position.y = 1.95;
    mayaHead.castShadow = true;
    mayaGroup.add(mayaHead);

    const mayaVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.16, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    mayaVisor.position.set(0, 1.95, 0.22);
    mayaGroup.add(mayaVisor);

    // Maya Articulated Arms
    const mayaArmMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4, metalness: 0.6 });
    const mayaLeftArm = new THREE.Group();
    mayaLeftArm.position.set(-0.42, 1.65, 0);
    const mayaLU = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), mayaArmMat);
    mayaLU.position.y = -0.19;
    mayaLeftArm.add(mayaLU);
    const mayaLF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.34, 0.15), mayaArmMat);
    mayaLF.position.set(0, -0.5, 0.04);
    mayaLeftArm.add(mayaLF);
    mayaGroup.add(mayaLeftArm);

    const mayaRightArm = new THREE.Group();
    mayaRightArm.position.set(0.42, 1.65, 0);
    const mayaRU = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), mayaArmMat);
    mayaRU.position.y = -0.19;
    mayaRightArm.add(mayaRU);
    const mayaRF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.34, 0.15), mayaArmMat);
    mayaRF.position.set(0, -0.5, 0.04);
    // Handheld Bio-Pipette / Scanner
    const pipette = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    pipette.rotation.x = Math.PI / 2;
    pipette.position.set(0, -0.2, 0.15);
    mayaRF.add(pipette);
    mayaRightArm.add(mayaRF);
    mayaGroup.add(mayaRightArm);

    // Maya Legs
    const mayaLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 0.24), mayaArmMat);
    mayaLLeg.position.set(-0.18, 0.48, 0);
    mayaGroup.add(mayaLLeg);
    const mayaRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 0.24), mayaArmMat);
    mayaRLeg.position.set(0.18, 0.48, 0);
    mayaGroup.add(mayaRLeg);

    // Maya Botanical Life-Support Backpack
    const mayaPack = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.68, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 })
    );
    mayaPack.position.set(0, 1.3, -0.28);
    const bioVial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    bioVial.position.set(0, 0, -0.12);
    mayaPack.add(bioVial);
    mayaGroup.add(mayaPack);

    // Maya Floating Nametag Sprite
    const mayaBadge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createCharacterBadgeTexture('Maya Vane', 'Bio-Síntese AETH', '#10b981'),
        transparent: true
      })
    );
    mayaBadge.position.set(0, 2.45, 0);
    mayaBadge.scale.set(2.2, 0.73, 1);
    mayaGroup.add(mayaBadge);

    const mayaLight = new THREE.PointLight(0x10b981, 0.8, 8);
    mayaLight.position.set(0, 1.8, 0.4);
    mayaGroup.add(mayaLight);

    scene.add(mayaGroup);

    // 2. SOREN VANCE (Operador de Arbitragem Quântica at Spire Terrace: 2.2, 2.15, 2.8)
    const sorenGroup = new THREE.Group();
    sorenGroup.position.set(2.2, 2.15, 2.8);
    sorenGroup.rotation.y = 0.35;

    const sorenTorsoMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.75
    });
    const sorenTorso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.98, 0.44), sorenTorsoMat);
    sorenTorso.position.y = 1.28;
    sorenTorso.castShadow = true;
    sorenGroup.add(sorenTorso);

    const sorenChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.38, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: new THREE.Color(0x38bdf8), emissiveIntensity: 0.9 })
    );
    sorenChest.position.set(0, 1.38, 0.23);
    sorenGroup.add(sorenChest);

    const sorenHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.8 })
    );
    sorenHead.position.y = 2.0;
    sorenHead.castShadow = true;
    sorenGroup.add(sorenHead);

    const sorenVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.18, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    sorenVisor.position.set(0, 2.0, 0.23);
    sorenGroup.add(sorenVisor);

    // Soren Floating Curved Multi-Monitor Holographic Array
    const sorenScreens = new THREE.Group();
    sorenScreens.position.set(0, 1.35, 0.65);
    [-0.55, 0, 0.55].forEach((offset, idx) => {
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.48, 0.32),
        new THREE.MeshBasicMaterial({
          color: idx === 1 ? 0x38bdf8 : 0x06b6d4,
          transparent: true,
          opacity: 0.82,
          side: THREE.DoubleSide
        })
      );
      scr.position.set(offset, 0, idx === 1 ? 0.05 : 0);
      scr.rotation.y = -offset * 0.45;
      sorenScreens.add(scr);
    });
    sorenGroup.add(sorenScreens);

    // Soren Articulated Arms for Quantum Keystrokes
    const sorenArmMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
    const sorenLeftArm = new THREE.Group();
    sorenLeftArm.position.set(-0.44, 1.7, 0);
    const sorenLU = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.18), sorenArmMat);
    sorenLU.position.y = -0.2;
    sorenLeftArm.add(sorenLU);
    const sorenLF = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.16), sorenArmMat);
    sorenLF.position.set(0, -0.54, 0.05);
    const sorenGauntletL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    sorenGauntletL.position.set(0, -0.66, 0.05);
    sorenLeftArm.add(sorenGauntletL);
    sorenLeftArm.add(sorenLF);
    sorenGroup.add(sorenLeftArm);

    const sorenRightArm = new THREE.Group();
    sorenRightArm.position.set(0.44, 1.7, 0);
    const sorenRU = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.18), sorenArmMat);
    sorenRU.position.y = -0.2;
    sorenRightArm.add(sorenRU);
    const sorenRF = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.16), sorenArmMat);
    sorenRF.position.set(0, -0.54, 0.05);
    const sorenGauntletR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    sorenGauntletR.position.set(0, -0.66, 0.05);
    sorenRightArm.add(sorenGauntletR);
    sorenRightArm.add(sorenRF);
    sorenGroup.add(sorenRightArm);

    // Soren Legs
    const sorenLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.25), sorenArmMat);
    sorenLLeg.position.set(-0.2, 0.5, 0);
    sorenGroup.add(sorenLLeg);
    const sorenRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.25), sorenArmMat);
    sorenRLeg.position.set(0.2, 0.5, 0);
    sorenGroup.add(sorenRLeg);

    // Soren Floating Nametag Sprite
    const sorenBadge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createCharacterBadgeTexture('Soren Vance', 'Arbitragem BTC/SOL', '#38bdf8'),
        transparent: true
      })
    );
    sorenBadge.position.set(0, 2.5, 0);
    sorenBadge.scale.set(2.2, 0.73, 1);
    sorenGroup.add(sorenBadge);

    const sorenLight = new THREE.PointLight(0x38bdf8, 0.9, 8);
    sorenLight.position.set(0, 1.8, 0.5);
    sorenGroup.add(sorenLight);

    scene.add(sorenGroup);

    // 3. DR. LYRA THORNE (Engenheira Chefe de Staking at Staking Platform: 17.2, 2.15, -6.2)
    const lyraGroup = new THREE.Group();
    lyraGroup.position.set(17.2, 2.15, -6.2);
    lyraGroup.rotation.y = -1.2;

    const lyraTorsoMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: new THREE.Color(0x6366f1),
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.8
    });
    const lyraTorso = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.96, 0.43), lyraTorsoMat);
    lyraTorso.position.y = 1.26;
    lyraTorso.castShadow = true;
    lyraGroup.add(lyraTorso);

    const lyraChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.36, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: new THREE.Color(0x818cf8), emissiveIntensity: 0.9 })
    );
    lyraChest.position.set(0, 1.36, 0.23);
    lyraGroup.add(lyraChest);

    const lyraHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.8 })
    );
    lyraHead.position.y = 1.98;
    lyraHead.castShadow = true;
    lyraGroup.add(lyraHead);

    const lyraVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.16, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x818cf8 })
    );
    lyraVisor.position.set(0, 1.98, 0.22);
    lyraGroup.add(lyraVisor);

    // Lyra Rotating Prismatic Wrist Focal Ring
    const focalRingGeo = new THREE.TorusGeometry(0.24, 0.035, 12, 24);
    const focalRingMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa });
    const focalRing = new THREE.Mesh(focalRingGeo, focalRingMat);
    focalRing.position.set(-0.42, 1.15, 0.15);
    lyraGroup.add(focalRing);

    // Lyra Articulated Arms
    const lyraArmMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.75 });
    const lyraLeftArm = new THREE.Group();
    lyraLeftArm.position.set(-0.43, 1.68, 0);
    const lyraLU = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.39, 0.17), lyraArmMat);
    lyraLU.position.y = -0.19;
    lyraLeftArm.add(lyraLU);
    const lyraLF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), lyraArmMat);
    lyraLF.position.set(0, -0.52, 0.04);
    lyraLeftArm.add(lyraLF);
    lyraGroup.add(lyraLeftArm);

    const lyraRightArm = new THREE.Group();
    lyraRightArm.position.set(0.43, 1.68, 0);
    const lyraRU = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.39, 0.17), lyraArmMat);
    lyraRU.position.y = -0.19;
    lyraRightArm.add(lyraRU);
    const lyraRF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), lyraArmMat);
    lyraRF.position.set(0, -0.52, 0.04);
    lyraRightArm.add(lyraRF);
    lyraGroup.add(lyraRightArm);

    // Lyra Legs
    const lyraLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.79, 0.24), lyraArmMat);
    lyraLLeg.position.set(-0.19, 0.49, 0);
    lyraGroup.add(lyraLLeg);
    const lyraRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.79, 0.24), lyraArmMat);
    lyraRLeg.position.set(0.19, 0.49, 0);
    lyraGroup.add(lyraRLeg);

    // Lyra Floating Nametag Sprite
    const lyraBadge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createCharacterBadgeTexture('Dr. Lyra', 'Staking & Validadores', '#818cf8'),
        transparent: true
      })
    );
    lyraBadge.position.set(0, 2.5, 0);
    lyraBadge.scale.set(2.2, 0.73, 1);
    lyraGroup.add(lyraBadge);

    const lyraLight = new THREE.PointLight(0x818cf8, 0.85, 8);
    lyraLight.position.set(0, 1.8, 0.4);
    lyraGroup.add(lyraLight);

    scene.add(lyraGroup);

    // 4. LEO VANE (Pequeno Explorador & Piloto de Drones at Mirante Balcony: -4.8, 2.15, 16.2)
    const leoGroup = new THREE.Group();
    leoGroup.position.set(-4.8, 2.15, 16.2);
    leoGroup.scale.set(0.68, 0.68, 0.68); // 7-year old proportion
    leoGroup.rotation.y = 0.5;

    const leoTorsoMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.5
    });
    const leoTorso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.76, 0.36), leoTorsoMat);
    leoTorso.position.y = 1.05;
    leoTorso.castShadow = true;
    leoGroup.add(leoTorso);

    const leoHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.6 })
    );
    leoHead.position.y = 1.65;
    leoHead.castShadow = true;
    leoGroup.add(leoHead);

    const leoGoggles = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.14, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    leoGoggles.position.set(0, 1.65, 0.2);
    leoGroup.add(leoGoggles);

    // Leo Articulated Arms
    const leoArmMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4, metalness: 0.5 });
    const leoLeftArm = new THREE.Group();
    leoLeftArm.position.set(-0.35, 1.35, 0);
    const leoLU = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), leoArmMat);
    leoLU.position.y = -0.15;
    leoLeftArm.add(leoLU);
    const leoLF = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), leoArmMat);
    leoLF.position.set(0, -0.4, 0.04);
    leoLeftArm.add(leoLF);
    leoGroup.add(leoLeftArm);

    const leoRightArm = new THREE.Group();
    leoRightArm.position.set(0.35, 1.35, 0);
    const leoRU = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), leoArmMat);
    leoRU.position.y = -0.15;
    leoRightArm.add(leoRU);
    const leoRF = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), leoArmMat);
    leoRF.position.set(0, -0.4, 0.04);
    // Navigational Scanner Wand
    const wand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    wand.rotation.x = Math.PI / 3;
    wand.position.set(0, -0.2, 0.18);
    leoRF.add(wand);
    leoRightArm.add(leoRF);
    leoGroup.add(leoRightArm);

    // Leo Legs
    const leoLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.2), leoArmMat);
    leoLLeg.position.set(-0.15, 0.4, 0);
    leoGroup.add(leoLLeg);
    const leoRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.2), leoArmMat);
    leoRLeg.position.set(0.15, 0.4, 0);
    leoGroup.add(leoRLeg);

    // Leo Personal Companion Drone (Aerial Scout)
    const leoDrone = new THREE.Group();
    leoDrone.position.set(0.6, 1.8, -0.2);
    const ldBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: new THREE.Color(0xd97706), emissiveIntensity: 0.6 })
    );
    leoDrone.add(ldBody);
    const ldEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ldEye.position.set(0, 0, 0.13);
    leoDrone.add(ldEye);
    leoGroup.add(leoDrone);

    // Leo Floating Nametag Sprite
    const leoBadge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createCharacterBadgeTexture('Leo Vane', 'Piloto de Shuttles', '#fbbf24'),
        transparent: true
      })
    );
    leoBadge.position.set(0, 2.2, 0);
    leoBadge.scale.set(2.2, 0.73, 1);
    leoGroup.add(leoBadge);

    const wandLight = new THREE.PointLight(0xfbbf24, 1.0, 6);
    wandLight.position.set(0, 1.5, 0.4);
    leoGroup.add(wandLight);

    scene.add(leoGroup);

    // 5. ZARA CHEN (Operadora Chefe de Derivativos & Liquidez at Plataforma das Barras: -1.6, 2.15, 2.2)
    const zaraGroup = new THREE.Group();
    zaraGroup.position.set(-1.6, 2.15, 2.2);
    zaraGroup.rotation.y = Math.PI * 0.9; // Facing the crypto bar columns

    const zaraTorsoMat = new THREE.MeshStandardMaterial({
      color: 0x831843,
      emissive: new THREE.Color(0xd946ef),
      emissiveIntensity: 0.45,
      roughness: 0.28,
      metalness: 0.72
    });
    const zaraTorso = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.96, 0.42), zaraTorsoMat);
    zaraTorso.position.y = 1.26;
    zaraTorso.castShadow = true;
    zaraGroup.add(zaraTorso);

    const zaraChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.36, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: new THREE.Color(0xf43f5e), emissiveIntensity: 0.95 })
    );
    zaraChest.position.set(0, 1.36, 0.22);
    zaraGroup.add(zaraChest);

    const zaraHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.75 })
    );
    zaraHead.position.y = 1.98;
    zaraHead.castShadow = true;
    zaraGroup.add(zaraHead);

    const zaraVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.16, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xd946ef })
    );
    zaraVisor.position.set(0, 1.98, 0.22);
    zaraGroup.add(zaraVisor);

    // Zara Articulated Arms
    const zaraArmMat = new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.3, metalness: 0.7 });
    const zaraLeftArm = new THREE.Group();
    zaraLeftArm.position.set(-0.43, 1.68, 0);
    const zaraLU = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.39, 0.17), zaraArmMat);
    zaraLU.position.y = -0.19;
    zaraLeftArm.add(zaraLU);
    const zaraLF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), zaraArmMat);
    zaraLF.position.set(0, -0.52, 0.04);
    zaraLeftArm.add(zaraLF);
    zaraGroup.add(zaraLeftArm);

    const zaraRightArm = new THREE.Group();
    zaraRightArm.position.set(0.43, 1.68, 0);
    const zaraRU = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.39, 0.17), zaraArmMat);
    zaraRU.position.y = -0.19;
    zaraRightArm.add(zaraRU);
    const zaraRF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), zaraArmMat);
    zaraRF.position.set(0, -0.52, 0.04);
    zaraRightArm.add(zaraRF);
    zaraGroup.add(zaraRightArm);

    // Zara Legs
    const zaraLegMat = new THREE.MeshStandardMaterial({ color: 0x4c0519, roughness: 0.35, metalness: 0.65 });
    const zaraLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.79, 0.24), zaraLegMat);
    zaraLLeg.position.set(-0.19, 0.49, 0);
    zaraGroup.add(zaraLLeg);
    const zaraRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.79, 0.24), zaraLegMat);
    zaraRLeg.position.set(0.19, 0.49, 0);
    zaraGroup.add(zaraRLeg);

    // Floating Holographic 3D Order Book Matrix Cube between Zara's hands
    const orderCubeGroup = new THREE.Group();
    orderCubeGroup.position.set(0, 1.35, 0.48);
    const orderCubeGeo = new THREE.BoxGeometry(0.34, 0.34, 0.34);
    const orderCubeMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const orderCube = new THREE.Mesh(orderCubeGeo, orderCubeMat);
    orderCubeGroup.add(orderCube);

    // Inner Bid & Ask depth level planes
    const bidPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.26),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    bidPlane.position.y = -0.06;
    bidPlane.rotation.x = Math.PI / 2;
    orderCubeGroup.add(bidPlane);

    const askPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.26),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    askPlane.position.y = 0.06;
    askPlane.rotation.x = Math.PI / 2;
    orderCubeGroup.add(askPlane);

    zaraGroup.add(orderCubeGroup);

    // Zara Floating Nametag Sprite
    const zaraBadge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createCharacterBadgeTexture('Zara Chen', 'Derivativos & Liquidez', '#d946ef'),
        transparent: true
      })
    );
    zaraBadge.position.set(0, 2.5, 0);
    zaraBadge.scale.set(2.2, 0.73, 1);
    zaraGroup.add(zaraBadge);

    const zaraLight = new THREE.PointLight(0xd946ef, 1.1, 8);
    zaraLight.position.set(0, 1.8, 0.4);
    zaraGroup.add(zaraLight);

    scene.add(zaraGroup);

    // 6. ATLAS-9 (Androide Sentinela de Flash-Loans at Cofres de Staking: 14.4, 2.15, -4.8)
    const atlasGroup = new THREE.Group();
    atlasGroup.position.set(14.4, 2.15, -4.8);
    atlasGroup.rotation.y = -0.8;

    const atlasTorsoMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: new THREE.Color(0x06b6d4),
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.94
    });
    const atlasTorso = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.08, 0.52), atlasTorsoMat);
    atlasTorso.position.y = 1.34;
    atlasTorso.castShadow = true;
    atlasGroup.add(atlasTorso);

    // Reinforced Heavy Shoulder Pauldrons
    const pauldronGeo = new THREE.BoxGeometry(0.32, 0.24, 0.36);
    const pauldronMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.92 });
    const pL = new THREE.Mesh(pauldronGeo, pauldronMat);
    pL.position.set(-0.54, 1.82, 0);
    atlasGroup.add(pL);
    const pR = new THREE.Mesh(pauldronGeo, pauldronMat);
    pR.position.set(0.54, 1.82, 0);
    atlasGroup.add(pR);

    // Glowing Chest Reactor Core
    const atlasCoreGeo = new THREE.TorusGeometry(0.18, 0.05, 12, 24);
    const atlasCoreMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const atlasCore = new THREE.Mesh(atlasCoreGeo, atlasCoreMat);
    atlasCore.position.set(0, 1.45, 0.28);
    atlasGroup.add(atlasCore);

    // Atlas Angular Robot Head
    const atlasHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.42, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.9 })
    );
    atlasHead.position.y = 2.12;
    atlasHead.castShadow = true;
    atlasGroup.add(atlasHead);

    const atlasVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.12, 0.15),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    atlasVisor.position.set(0, 2.12, 0.22);
    atlasGroup.add(atlasVisor);

    // Heavy Hydraulic Servo Arms
    const atlasArmMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.22, metalness: 0.92 });
    const atlasLeftArm = new THREE.Group();
    atlasLeftArm.position.set(-0.52, 1.74, 0);
    const aLU = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.44, 0.22), atlasArmMat);
    aLU.position.y = -0.22;
    atlasLeftArm.add(aLU);
    const aLF = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), atlasArmMat);
    aLF.position.set(0, -0.6, 0.06);
    atlasLeftArm.add(aLF);
    atlasGroup.add(atlasLeftArm);

    const atlasRightArm = new THREE.Group();
    atlasRightArm.position.set(0.52, 1.74, 0);
    const aRU = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.44, 0.22), atlasArmMat);
    aRU.position.y = -0.22;
    atlasRightArm.add(aRU);
    const aRF = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), atlasArmMat);
    aRF.position.set(0, -0.6, 0.06);
    atlasRightArm.add(aRF);
    atlasGroup.add(atlasRightArm);

    // Heavy Magnetic Legs
    const atlasLegMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.88 });
    const aLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.86, 0.3), atlasLegMat);
    aLLeg.position.set(-0.24, 0.52, 0);
    atlasGroup.add(aLLeg);
    const aRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.86, 0.3), atlasLegMat);
    aRLeg.position.set(0.24, 0.52, 0);
    atlasGroup.add(aRLeg);

    // Holographic Containment Forcefield Matrix Sphere
    const shieldGeo = new THREE.SphereGeometry(0.52, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const atlasShieldField = new THREE.Mesh(shieldGeo, shieldMat);
    atlasShieldField.position.set(0, 1.35, 0.65);
    atlasGroup.add(atlasShieldField);

    // Atlas Floating Nametag Sprite
    const atlasBadge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createCharacterBadgeTexture('Atlas-9', 'Sentinela de Cofres', '#06b6d4'),
        transparent: true
      })
    );
    atlasBadge.position.set(0, 2.65, 0);
    atlasBadge.scale.set(2.2, 0.73, 1);
    atlasGroup.add(atlasBadge);

    const atlasLight = new THREE.PointLight(0x06b6d4, 1.2, 8);
    atlasLight.position.set(0, 1.8, 0.4);
    atlasGroup.add(atlasLight);

    scene.add(atlasGroup);

    // 7. NYX SOLARIS (Especialista em Oráculos RWA at Plataforma de Shuttles: 10.8, 2.15, 9.2)
    const nyxGroup = new THREE.Group();
    nyxGroup.position.set(10.8, 2.15, 9.2);
    nyxGroup.rotation.y = -2.2; // Facing the runway & shuttles

    const nyxTorsoMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.45,
      roughness: 0.28,
      metalness: 0.88
    });
    const nyxTorso = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.96, 0.42), nyxTorsoMat);
    nyxTorso.position.y = 1.26;
    nyxTorso.castShadow = true;
    nyxGroup.add(nyxTorso);

    const nyxChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.36, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: new THREE.Color(0xd97706), emissiveIntensity: 0.95 })
    );
    nyxChest.position.set(0, 1.36, 0.22);
    nyxGroup.add(nyxChest);

    const nyxHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 })
    );
    nyxHead.position.y = 1.98;
    nyxHead.castShadow = true;
    nyxGroup.add(nyxHead);

    const nyxVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.16, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    nyxVisor.position.set(0, 1.98, 0.22);
    nyxGroup.add(nyxVisor);

    // Nyx Articulated Arms
    const nyxArmMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, metalness: 0.75 });
    const nyxLeftArm = new THREE.Group();
    nyxLeftArm.position.set(-0.43, 1.68, 0);
    const nLU = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.39, 0.17), nyxArmMat);
    nLU.position.y = -0.19;
    nyxLeftArm.add(nLU);
    const nLF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), nyxArmMat);
    nLF.position.set(0, -0.52, 0.04);
    nyxLeftArm.add(nLF);
    nyxGroup.add(nyxLeftArm);

    const nyxRightArm = new THREE.Group();
    nyxRightArm.position.set(0.43, 1.68, 0);
    const nRU = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.39, 0.17), nyxArmMat);
    nRU.position.y = -0.19;
    nyxRightArm.add(nRU);
    const nRF = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), nyxArmMat);
    nRF.position.set(0, -0.52, 0.04);

    // Oracle Telemetry Staff in right hand
    const nyxStaff = new THREE.Group();
    nyxStaff.position.set(0, -0.3, 0.2);
    const staffShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.25 })
    );
    nyxStaff.add(staffShaft);

    // Glowing Oracle Crystal at staff top
    const oracleCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    oracleCrystal.position.y = 0.95;
    nyxStaff.add(oracleCrystal);

    // Dual Gimbal Gyroscope Rings
    const gyroRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.02, 8, 20),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    gyroRing1.position.y = 0.95;
    nyxStaff.add(gyroRing1);

    const gyroRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.02, 8, 20),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    gyroRing2.position.y = 0.95;
    nyxStaff.add(gyroRing2);

    nRF.add(nyxStaff);
    nyxRightArm.add(nRF);
    nyxGroup.add(nyxRightArm);

    // Nyx Legs
    const nyxLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.79, 0.24), nyxArmMat);
    nyxLLeg.position.set(-0.19, 0.49, 0);
    nyxGroup.add(nyxLLeg);
    const nyxRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.79, 0.24), nyxArmMat);
    nyxRLeg.position.set(0.19, 0.49, 0);
    nyxGroup.add(nyxRLeg);

    // Nyx Floating Nametag Sprite
    const nyxBadge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createCharacterBadgeTexture('Nyx Solaris', 'Oráculos RWA & Frotas', '#f59e0b'),
        transparent: true
      })
    );
    nyxBadge.position.set(0, 2.5, 0);
    nyxBadge.scale.set(2.2, 0.73, 1);
    nyxGroup.add(nyxBadge);

    const nyxLight = new THREE.PointLight(0xf59e0b, 1.1, 8);
    nyxLight.position.set(0, 1.8, 0.4);
    nyxGroup.add(nyxLight);

    scene.add(nyxGroup);

    // Store Worker Meshes References for Zero-GC Render Loop
    workerMeshesRef.current = {
      maya: { group: mayaGroup, leftArm: mayaLeftArm, rightArm: mayaRightArm, light: mayaLight, badge: mayaBadge },
      soren: { group: sorenGroup, leftArm: sorenLeftArm, rightArm: sorenRightArm, screens: sorenScreens, light: sorenLight, badge: sorenBadge },
      lyra: { group: lyraGroup, leftArm: lyraLeftArm, rightArm: lyraRightArm, focalRing, light: lyraLight, badge: lyraBadge },
      leo: { group: leoGroup, leftArm: leoLeftArm, rightArm: leoRightArm, drone: leoDrone, wandLight, badge: leoBadge },
      zara: { group: zaraGroup, leftArm: zaraLeftArm, rightArm: zaraRightArm, orderCube, light: zaraLight, badge: zaraBadge },
      atlas: { group: atlasGroup, leftArm: atlasLeftArm, rightArm: atlasRightArm, core: atlasCore, shieldField: atlasShieldField, light: atlasLight, badge: atlasBadge },
      nyx: { group: nyxGroup, leftArm: nyxLeftArm, rightArm: nyxRightArm, staff: nyxStaff, gyroRings: [gyroRing1, gyroRing2], light: nyxLight, badge: nyxBadge }
    };

    // ==========================================
    // 6C. DYNAMIC CRYPTO FLOW PARTICLE STREAM SYSTEM (6 SPECIALIZED WORKSPACE STREAMS)
    // ==========================================
    const particleCount = 420;
    const flowPositions = new Float32Array(particleCount * 3);
    const flowColors = new Float32Array(particleCount * 3);
    const flowSeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      flowSeeds[i] = Math.random();
      const streamType = i % 6;
      if (streamType === 0) {
        // Zara Chen Liquidity Stream (Magenta / Amber BTC & SOL)
        flowColors[i * 3]     = 0.85;
        flowColors[i * 3 + 1] = 0.27;
        flowColors[i * 3 + 2] = 0.94;
      } else if (streamType === 1) {
        // Soren Vance Arbitrage Stream (Cyan / Electric Blue)
        flowColors[i * 3]     = 0.22;
        flowColors[i * 3 + 1] = 0.74;
        flowColors[i * 3 + 2] = 0.97;
      } else if (streamType === 2) {
        // Maya Vane Bio-Yield Stream (Emerald / Mint AETH)
        flowColors[i * 3]     = 0.06;
        flowColors[i * 3 + 1] = 0.72;
        flowColors[i * 3 + 2] = 0.48;
      } else if (streamType === 3) {
        // Atlas-9 & Dr. Lyra Staking Stream (Indigo / Violet ETH & AETH)
        flowColors[i * 3]     = 0.51;
        flowColors[i * 3 + 1] = 0.55;
        flowColors[i * 3 + 2] = 0.97;
      } else if (streamType === 4) {
        // Nyx Solaris RWA Oracle Stream (Solar Gold / Amber AVAX)
        flowColors[i * 3]     = 0.96;
        flowColors[i * 3 + 1] = 0.62;
        flowColors[i * 3 + 2] = 0.04;
      } else {
        // Kaelen Vane Neural Link Stream (Sky Blue / White)
        flowColors[i * 3]     = 0.38;
        flowColors[i * 3 + 1] = 0.85;
        flowColors[i * 3 + 2] = 0.98;
      }
    }

    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
    flowGeo.setAttribute('color', new THREE.BufferAttribute(flowColors, 3));

    const flowMat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const flowPoints = new THREE.Points(flowGeo, flowMat);
    scene.add(flowPoints);

    cryptoFlowParticlesRef.current = {
      points: flowPoints,
      positions: flowPositions,
      colors: flowColors,
      seeds: flowSeeds
    };

    // Mouse Drag / Touch Orbit Controls & 3D Object Raycasting
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let sphericalTheta = 0.5;
    let sphericalPhi = 1.1;
    let sphericalRadius = 38;

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    const interactiveHitTargets = [
      { mesh: tradeFloorPad, idx: 0, name: 'Torre Central de Trading' },
      { mesh: bioFloorPad, idx: 1, name: 'Biodomo Familiar Vane' },
      { mesh: stakFloorPad, idx: 2, name: 'Cofres de Staking Líquido' },
      { mesh: miranteFloorPad, idx: 3, name: 'Mirante das Cachoeiras' },
      { mesh: launchFloorPad, idx: 4, name: 'Plataforma RWA & Shuttles' },
      { mesh: torso, idx: -1, name: 'Pioneiro Kaelen (Link Neural)' },
      { mesh: mayaTorso, idx: -2, name: 'Maya Vane (Bio-Síntese & Colheita AETH)' },
      { mesh: sorenTorso, idx: -3, name: 'Soren Vance (Arbitragem Quântica BTC/SOL)' },
      { mesh: lyraTorso, idx: -4, name: 'Dr. Lyra Thorne (Staking & Validadores)' },
      { mesh: leoTorso, idx: -5, name: 'Leo Vane (Exploração & Drone Mirim)' },
      { mesh: zaraTorso, idx: -6, name: 'Zara Chen (Derivativos & Liquidez BTC/SOL)' },
      { mesh: atlasTorso, idx: -7, name: 'Atlas-9 (Sentinela de Flash-Loans & Cofres)' },
      { mesh: nyxTorso, idx: -8, name: 'Nyx Solaris (Oráculos & Transmissão RWA)' },
      ...barMeshes.map((bar, i) => ({
        mesh: bar,
        idx: 100 + i,
        name: `Barra 3D ${CRYPTO_BAR_CONFIGS[i].symbol} (${CRYPTO_BAR_CONFIGS[i].name} · +${CRYPTO_BAR_CONFIGS[i].fallbackChange}%)`
      }))
    ];

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      cameraFocusTargetRef.current = null; // restore free view
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        sphericalTheta -= deltaX * 0.008;
        sphericalPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, sphericalPhi - deltaY * 0.008));
      } else {
        // Raycast hover check on 3D objects
        const rect = domEl.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseNDC, camera);
        const hitMeshes = interactiveHitTargets.map((t) => t.mesh);
        const intersects = raycaster.intersectObjects(hitMeshes, true);
        if (intersects.length > 0) {
          const hitTarget = interactiveHitTargets.find((t) => {
            let cur: THREE.Object3D | null = intersects[0].object;
            while (cur) {
              if (cur === t.mesh) return true;
              cur = cur.parent;
            }
            return false;
          });
          if (hitTarget) {
            domEl.style.cursor = 'pointer';
            setHoveredStation({ name: hitTarget.name, x: e.clientX, y: e.clientY });
          } else {
            domEl.style.cursor = 'grab';
            setHoveredStation(null);
          }
        } else {
          domEl.style.cursor = 'grab';
          setHoveredStation(null);
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY);
      if (moveDist < 6) {
        // Clean click on 3D object
        const rect = domEl.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseNDC, camera);
        const hitMeshes = interactiveHitTargets.map((t) => t.mesh);
        const intersects = raycaster.intersectObjects(hitMeshes, true);
        if (intersects.length > 0) {
          const hitTarget = interactiveHitTargets.find((t) => {
            let cur: THREE.Object3D | null = intersects[0].object;
            while (cur) {
              if (cur === t.mesh) return true;
              cur = cur.parent;
            }
            return false;
          });
          if (hitTarget) {
            if (hitTarget.idx >= 100) {
              const coinIdx = hitTarget.idx - 100;
              setSelectedCryptoIdx(coinIdx);
              triggerSingleBarSurge(coinIdx);
            } else if (hitTarget.idx >= 0) {
              dispatchPioneerToStation(hitTarget.idx);
            } else if (hitTarget.idx === -1) {
              setIsChatOpen(true);
            } else if (hitTarget.idx === -2) {
              executeCrewAction('maya');
            } else if (hitTarget.idx === -3) {
              executeCrewAction('soren');
            } else if (hitTarget.idx === -4) {
              executeCrewAction('lyra');
            } else if (hitTarget.idx === -5) {
              executeCrewAction('leo');
            } else if (hitTarget.idx === -6) {
              executeCrewAction('zara');
            } else if (hitTarget.idx === -7) {
              executeCrewAction('atlas');
            } else if (hitTarget.idx === -8) {
              executeCrewAction('nyx');
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      sphericalRadius = Math.max(12, Math.min(85, sphericalRadius + e.deltaY * 0.03));
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      sphericalTheta -= deltaX * 0.008;
      sphericalPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, sphericalPhi - deltaY * 0.008));
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });
    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 1. Rotate Energy Rings
      if (energyRingsRef.current) {
        energyRingsRef.current.children[0].rotation.z = elapsed * 0.8;
        energyRingsRef.current.children[1].rotation.x = -elapsed * 0.6;
        energyRingsRef.current.children[2].rotation.y = elapsed * 0.5;
      }

      // 2. Animate Waterfall Particles
      const posAttr = wfGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < waterfallParticlesCount; i++) {
        positions[i * 3 + 1] -= 0.12;
        if (positions[i * 3 + 1] < -6) {
          positions[i * 3 + 1] = 2;
        }
      }
      posAttr.needsUpdate = true;

      // 3. Move Flying Shuttles with Aerodynamic Banking
      shuttlesRef.current.forEach((shuttle, idx) => {
        const speed = 0.35 + idx * 0.1;
        const angle = elapsed * speed + idx * 2.1;
        const radius = 22 + idx * 4;
        shuttle.position.x = Math.cos(angle) * radius;
        shuttle.position.z = Math.sin(angle) * radius;
        shuttle.position.y = 14 + idx * 4 + Math.sin(elapsed * 2 + idx) * 1.5;
        shuttle.rotation.y = -angle + Math.PI / 2;
        // Aerodynamic bank angle into the curve
        shuttle.rotation.z = Math.sin(elapsed * 1.8 + idx) * 0.12 - 0.08;
      });

      // 3B. Animate Interactive Station Holograms & Machinery
      const pulseSpeed = interactionPulseRef.current > 0 ? 3.0 : 1.0;
      tradeHoloRing.rotation.z = elapsed * 1.2 * pulseSpeed;
      tradeHoloRing.rotation.y = elapsed * 0.8 * pulseSpeed;
      bioScreen.rotation.y = -0.52 + Math.sin(elapsed * 2 * pulseSpeed) * 0.08;
      stakShard.rotation.y = elapsed * 2.2 * pulseSpeed;
      stakShard.position.y = 1.5 + Math.sin(elapsed * 3 * pulseSpeed) * 0.08;
      stakCoolant.scale.y = 1.0 + Math.sin(elapsed * 4 * pulseSpeed) * 0.08;
      dish.rotation.z = elapsed * 1.5 * pulseSpeed;
      radarHolo.rotation.y = elapsed * 2.5 * pulseSpeed;

      // 3C. ANIMATE 3D CRYPTO BAR GRAPH MATRIX & VOLUMETRIC BARS (ESCALA BAIXA / ALTA)
      if (cryptoBarsMeshRef.current) {
        const { bars, sheaths, diamonds, beams, shockwaves } = cryptoBarsMeshRef.current;
        const mode = cryptoScaleModeRef.current;
        const mult = cryptoScaleMultiplierRef.current;
        const isLow = mode === 'low';
        const isHigh = mode === 'high';

        // Scale factor: 'low' = 0.38, 'high' = 1.9, 'dynamic' = oscillates smoothly between 0.55 and 1.95
        const dynamicCycle = (Math.sin(elapsed * 0.8) + 1) / 2;
        const effectiveMultiplier = mode === 'dynamic' 
          ? THREE.MathUtils.lerp(0.55, 1.95, dynamicCycle) * mult
          : (isLow ? 0.38 * mult : 1.9 * mult);

        bars.forEach((bar, i) => {
          const coin = CRYPTO_BAR_CONFIGS[i];
          const surge = barSurgesRef.current[i] || 0;
          if (barSurgesRef.current[i] > 0) {
            barSurgesRef.current[i] = Math.max(0, barSurgesRef.current[i] - 0.016);
          }

          // Target height calculation combining scale mode + harmonic/turbulent wave + character interaction surge
          const baseH = isLow ? coin.baseHeightLow : coin.baseHeightHigh;
          const waveFreq = isLow ? 1.4 : (isHigh ? 4.2 : 2.5);
          const waveAmp = isLow ? 0.12 : (isHigh ? 0.9 : 0.4);
          const oscillation = Math.sin(elapsed * waveFreq + i * 0.85) * waveAmp;

          // Character interaction pulse contribution
          const charPulse = interactionPulseRef.current > 0 ? Math.sin(elapsed * 8 + i * 1.2) * 0.6 : 0;
          const surgeBoost = surge * (isHigh ? 7.0 : 4.0);

          const targetH = Math.max(0.65, (baseH * effectiveMultiplier * 0.65) + oscillation + charPulse + surgeBoost);

          // Smooth lerp to target height
          bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetH, 0.12);
          barCurrentHeightsRef.current[i] = bar.scale.y;

          // Update companion sheath
          if (sheaths[i]) {
            sheaths[i].scale.y = bar.scale.y;
            const sMat = sheaths[i].material as THREE.MeshBasicMaterial;
            sMat.opacity = isLow ? (0.2 + surge * 0.3) : (0.45 + Math.sin(elapsed * 5 + i) * 0.15 + surge * 0.4);
          }

          // Update floating crystalline diamond apex
          if (diamonds[i]) {
            diamonds[i].position.y = 0.32 + bar.scale.y + 0.28;
            diamonds[i].rotation.y = elapsed * (isHigh ? 3.5 : 1.8) + surge * 4.0;
            diamonds[i].rotation.z = Math.sin(elapsed * 2 + i) * 0.25;
            const dMat = diamonds[i].material as THREE.MeshStandardMaterial;
            dMat.emissiveIntensity = 0.8 + surge * 1.5 + (isHigh ? 0.5 : 0);
          }

          // Update skyward laser beam
          if (beams[i]) {
            beams[i].position.y = 0.32 + bar.scale.y;
            beams[i].scale.y = isHigh ? 1.6 : (isLow ? 0.4 : 0.9);
            const bMat = beams[i].material as THREE.MeshBasicMaterial;
            bMat.opacity = isHigh 
              ? (0.4 + Math.sin(elapsed * 6 + i) * 0.18 + surge * 0.4) 
              : (0.10 + surge * 0.35);
          }

          // Update expanding shockwave ripple
          if (shockwaves[i]) {
            if (surge > 0.05) {
              const progress = 1.0 - surge;
              shockwaves[i].scale.setScalar(1.0 + progress * 2.8);
              (shockwaves[i].material as THREE.MeshBasicMaterial).opacity = Math.max(0, surge * 0.8);
            } else {
              (shockwaves[i].material as THREE.MeshBasicMaterial).opacity = 0;
            }
          }

          // Bar material emissive flash
          const bMat = bar.material as THREE.MeshStandardMaterial;
          bMat.emissiveIntensity = 0.5 + surge * 1.2 + (isHigh ? 0.3 : 0);
        });
      }

      // 4. Move Pioneer towards current target workstation with Perfect Structural Integration (Zero-GC)
      if (pioneerGroupRef.current) {
        const p = pioneerGroupRef.current;
        const currentWp = waypoints[waypointIdxRef.current];
        const target = targetPosRef.current;
        _tmpDir.subVectors(target, p.position);
        const dist = _tmpDir.length();

        // Animate all Station Floor Pads based on Pioneer Proximity
        const allPads = [tradeFloorPad, bioFloorPad, stakFloorPad, miranteFloorPad, launchFloorPad];
        allPads.forEach((pad, padIdx) => {
          const pDist = Math.hypot(pad.position.x - p.position.x, pad.position.z - p.position.z);
          const mat = pad.material as THREE.MeshBasicMaterial;
          if (pDist < 1.8) {
            mat.opacity = 0.75 + Math.sin(elapsed * 6) * 0.25;
          } else if (padIdx === waypointIdxRef.current) {
            mat.opacity = 0.45 + Math.sin(elapsed * 3) * 0.2;
          } else {
            mat.opacity = 0.25;
          }
        });

        // Handle Special Emotes (Jetpack Boost or Drone Wide Scan)
        let customY = 2.2;
        if (specialEmoteRef.current === 'jetpack') {
          specialEmoteTimerRef.current += 0.02;
          const jumpArc = Math.sin(Math.min(Math.PI, specialEmoteTimerRef.current * 1.6)) * 2.4;
          customY = 2.2 + jumpArc;
          (thrusterL.material as THREE.MeshStandardMaterial).emissive.setHex(0x38bdf8);
          (thrusterR.material as THREE.MeshStandardMaterial).emissive.setHex(0x38bdf8);
          if (specialEmoteTimerRef.current > 2.0) {
            specialEmoteRef.current = 'none';
            (thrusterL.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
            (thrusterR.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
          }
        }

        if (dist > 0.35) {
          // --- TRAVELING BETWEEN STATIONS ---
          _tmpDir.normalize();
          p.position.addScaledVector(_tmpDir, 0.045);
          p.position.y = customY; // Anchored to walkway surface

          // Face direction of travel
          const travelAngle = Math.atan2(_tmpDir.x, _tmpDir.z);
          p.rotation.y = travelAngle;

          // Leg walking cycle
          leftLeg.rotation.x = Math.sin(elapsed * 8) * 0.5;
          rightLeg.rotation.x = -Math.sin(elapsed * 8) * 0.5;

          // Natural Arm Swing (Humanoid articulated gait)
          leftArmGroup.rotation.x = -Math.sin(elapsed * 8) * 0.42;
          rightArmGroup.rotation.x = Math.sin(elapsed * 8) * 0.42;
          leftArmGroup.rotation.z = -0.05;
          rightArmGroup.rotation.z = 0.05;

          // Subtle hip bobbing
          torso.position.y = 1.3 + Math.abs(Math.sin(elapsed * 8)) * 0.03;

          // Companion Drone hovers faithfully over right shoulder
          droneGroup.position.set(0.7, 2.2 + Math.sin(elapsed * 3) * 0.15, -0.2);
          (scanCone.material as THREE.MeshBasicMaterial).opacity = 0.0;

          // Keep station dwell timer reset while walking
          stationTimerRef.current = elapsed;
        } else {
          // --- AT WORKSTATION: INTERACTIVE TERMINAL OPERATION ---
          p.position.y = customY;
          leftLeg.rotation.x = 0;
          rightLeg.rotation.x = 0;
          torso.position.y = 1.3;

          // Face the station console ergonomics
          const stationFacingAngles = [Math.PI, -0.52, Math.PI / 2, 0, -Math.PI / 4];
          const targetFacing = stationFacingAngles[waypointIdxRef.current] ?? 0;
          p.rotation.y = THREE.MathUtils.lerp(p.rotation.y, targetFacing, 0.08);

          // Articulated Arms operating the console interface / typing
          if (interactionPulseRef.current > 0) {
            interactionPulseRef.current -= 0.016;
            // Rapid energetic typing & gauntlet activation
            leftArmGroup.rotation.x = -1.15 + Math.sin(elapsed * 22) * 0.14;
            rightArmGroup.rotation.x = -1.25 + Math.cos(elapsed * 24) * 0.14;
            leftArmGroup.rotation.z = -0.25;
            rightArmGroup.rotation.z = 0.25;
            commPadMat.color.setHex(0x38bdf8);
          } else {
            // Calm steady operational posture
            leftArmGroup.rotation.x = -1.05 + Math.sin(elapsed * 8) * 0.06;
            rightArmGroup.rotation.x = -1.15 + Math.cos(elapsed * 9) * 0.06;
            leftArmGroup.rotation.z = -0.18;
            rightArmGroup.rotation.z = 0.18;
          }

          // Companion Drone moves forward to inspect and casts diagnostic holographic scan cone!
          if (specialEmoteRef.current === 'scan') {
            specialEmoteTimerRef.current += 0.02;
            const orbitAngle = elapsed * 4;
            droneGroup.position.set(Math.cos(orbitAngle) * 1.3, 2.45, Math.sin(orbitAngle) * 1.3);
            (scanCone.material as THREE.MeshBasicMaterial).opacity = 0.85;
            if (specialEmoteTimerRef.current > 3.0) {
              specialEmoteRef.current = 'none';
            }
          } else {
            droneGroup.position.set(0.1, 2.45 + Math.sin(elapsed * 2) * 0.1, 0.7);
            const coneBaseOpacity = interactionPulseRef.current > 0 ? 0.85 : 0.45;
            (scanCone.material as THREE.MeshBasicMaterial).opacity = coneBaseOpacity + Math.sin(elapsed * 6) * 0.15;
          }

          // Visor & Chestplate synchronize color with station theme
          _tmpColor.setHex(currentWp.color);
          visorMat.color.lerp(_tmpColor, 0.08);
          chestMat.emissive.lerp(_tmpColor, 0.08);

          // Dwell at station then proceed to next waypoint if autoPatrol is enabled
          if (autoPatrolRef.current && (elapsed - stationTimerRef.current > 10.0)) {
            waypointIdxRef.current = (waypointIdxRef.current + 1) % waypoints.length;
            const nextWp = waypoints[waypointIdxRef.current];
            targetPosRef.current.set(nextWp.x, 2.2, nextWp.z);
            setActiveStationIdx(waypointIdxRef.current);
            setPioneer((prev) => ({
              ...prev,
              currentLocationName: nextWp.name,
              currentActivity: nextWp.activity
            }));
            stationTimerRef.current = elapsed;
          }
        }
      }

      // 4B. ANIMATE CITADEL WORKSPACE CREW CHARACTERS & CRYPTO FLOW ACTIONS (Zero-GC)
      const crewTimers = workerFlowTimersRef.current;
      crewTimers.maya = Math.max(0, crewTimers.maya - 0.016);
      crewTimers.soren = Math.max(0, crewTimers.soren - 0.016);
      crewTimers.lyra = Math.max(0, crewTimers.lyra - 0.016);
      crewTimers.leo = Math.max(0, crewTimers.leo - 0.016);
      crewTimers.zara = Math.max(0, crewTimers.zara - 0.016);
      crewTimers.atlas = Math.max(0, crewTimers.atlas - 0.016);
      crewTimers.nyx = Math.max(0, crewTimers.nyx - 0.016);

      // Zara Chen: 3D Order Book matrix manipulation & liquidity injection
      if (workerMeshesRef.current.zara) {
        const { leftArm, rightArm, orderCube, light } = workerMeshesRef.current.zara;
        const isFlowing = crewTimers.zara > 0;
        const wave = isFlowing ? Math.sin(elapsed * 22) : Math.sin(elapsed * 4);
        leftArm.rotation.x = isFlowing ? -1.35 + wave * 0.28 : -0.95 + Math.sin(elapsed * 3) * 0.08;
        rightArm.rotation.x = isFlowing ? -1.2 + Math.cos(elapsed * 20) * 0.28 : -1.05 + Math.cos(elapsed * 3) * 0.08;
        leftArm.rotation.z = isFlowing ? -0.35 : -0.15;
        rightArm.rotation.z = isFlowing ? 0.35 : 0.15;
        orderCube.rotation.y = elapsed * (isFlowing ? 9.0 : 1.8);
        orderCube.rotation.x = Math.sin(elapsed * (isFlowing ? 5.0 : 1.5)) * 0.3;
        orderCube.position.y = 1.35 + Math.sin(elapsed * 3) * 0.05;
        orderCube.scale.setScalar(isFlowing ? 1.35 + Math.sin(elapsed * 16) * 0.15 : 1.0);
        light.intensity = isFlowing ? 2.6 : 1.1 + Math.sin(elapsed * 3) * 0.2;
      }

      // Atlas-9: Heavy hydraulic containment lock & vault shield expansion
      if (workerMeshesRef.current.atlas) {
        const { leftArm, rightArm, core, shieldField, light } = workerMeshesRef.current.atlas;
        const isFlowing = crewTimers.atlas > 0;
        const pulse = isFlowing ? Math.sin(elapsed * 18) : Math.sin(elapsed * 3);
        leftArm.rotation.x = isFlowing ? -1.45 + pulse * 0.18 : -0.75 + Math.sin(elapsed * 2) * 0.05;
        rightArm.rotation.x = isFlowing ? -1.45 - pulse * 0.18 : -0.75 - Math.sin(elapsed * 2) * 0.05;
        leftArm.rotation.z = isFlowing ? -0.65 : -0.25;
        rightArm.rotation.z = isFlowing ? 0.65 : 0.25;
        core.scale.setScalar(isFlowing ? 1.45 + pulse * 0.25 : 1.0 + Math.sin(elapsed * 2) * 0.08);
        shieldField.rotation.y = elapsed * (isFlowing ? 6.0 : 1.2);
        shieldField.rotation.z = elapsed * (isFlowing ? 4.0 : 0.8);
        shieldField.scale.setScalar(isFlowing ? 1.85 + Math.sin(elapsed * 12) * 0.2 : 1.0);
        (shieldField.material as THREE.MeshBasicMaterial).opacity = isFlowing ? 0.75 : 0.28;
        light.intensity = isFlowing ? 2.8 : 1.2;
      }

      // Nyx Solaris: Oracle Staff elevation & gyroscope telemetric transmission
      if (workerMeshesRef.current.nyx) {
        const { leftArm, rightArm, staff, gyroRings, light } = workerMeshesRef.current.nyx;
        const isFlowing = crewTimers.nyx > 0;
        leftArm.rotation.x = isFlowing ? -1.1 + Math.sin(elapsed * 10) * 0.15 : -0.6 + Math.sin(elapsed * 2) * 0.05;
        rightArm.rotation.x = isFlowing ? -2.05 + Math.sin(elapsed * 6) * 0.15 : -0.9 + Math.sin(elapsed * 2) * 0.05;
        staff.rotation.z = isFlowing ? Math.sin(elapsed * 8) * 0.12 : 0;
        gyroRings.forEach((ring, rIdx) => {
          const speed = (rIdx + 1) * (isFlowing ? 18.0 : 2.5);
          ring.rotation.x = elapsed * speed;
          ring.rotation.y = elapsed * (speed * 0.85);
        });
        light.intensity = isFlowing ? 2.8 : 1.1;
      }

      // Soren Vance: Quantum arbitrage triple-monitor high-speed keystrokes
      if (workerMeshesRef.current.soren) {
        const { leftArm, rightArm, screens, light } = workerMeshesRef.current.soren;
        const isFlowing = crewTimers.soren > 0;
        leftArm.rotation.x = isFlowing ? -1.35 + Math.sin(elapsed * 24) * 0.22 : -1.05 + Math.sin(elapsed * 8) * 0.08;
        rightArm.rotation.x = isFlowing ? -1.25 + Math.cos(elapsed * 26) * 0.22 : -1.15 + Math.cos(elapsed * 8) * 0.08;
        leftArm.rotation.z = isFlowing ? -0.28 : -0.16;
        rightArm.rotation.z = isFlowing ? 0.28 : 0.16;
        screens.rotation.y = Math.sin(elapsed * (isFlowing ? 6.0 : 1.5)) * (isFlowing ? 0.2 : 0.06);
        light.intensity = isFlowing ? 2.5 : 1.0;
      }

      // Maya Vane: Hydroponic flora harvest & AETH bio-synthesis
      if (workerMeshesRef.current.maya) {
        const { leftArm, rightArm, light } = workerMeshesRef.current.maya;
        const isFlowing = crewTimers.maya > 0;
        leftArm.rotation.x = isFlowing ? -1.25 + Math.sin(elapsed * 14) * 0.25 : -0.85 + Math.sin(elapsed * 3) * 0.06;
        rightArm.rotation.x = isFlowing ? -1.85 + Math.sin(elapsed * 10) * 0.2 : -1.0 + Math.sin(elapsed * 4) * 0.06;
        light.intensity = isFlowing ? 2.4 : 0.9;
      }

      // Dr. Lyra Thorne: Validator node synchronization & liquid staking crystal channelling
      if (workerMeshesRef.current.lyra) {
        const { leftArm, rightArm, focalRing, light } = workerMeshesRef.current.lyra;
        const isFlowing = crewTimers.lyra > 0;
        focalRing.rotation.z = elapsed * (isFlowing ? 16.0 : 2.5);
        focalRing.scale.setScalar(isFlowing ? 1.4 : 1.0);
        leftArm.rotation.x = isFlowing ? -1.4 + Math.sin(elapsed * 12) * 0.15 : -0.85 + Math.sin(elapsed * 2) * 0.05;
        rightArm.rotation.x = isFlowing ? -1.4 - Math.sin(elapsed * 12) * 0.15 : -0.85 - Math.sin(elapsed * 2) * 0.05;
        light.intensity = isFlowing ? 2.6 : 1.0;
      }

      // Leo Vane: Aerial drone command & canyon reconnaissance
      if (workerMeshesRef.current.leo) {
        const { rightArm, drone, wandLight } = workerMeshesRef.current.leo;
        const isFlowing = crewTimers.leo > 0;
        rightArm.rotation.x = isFlowing ? -1.85 + Math.sin(elapsed * 14) * 0.25 : -0.7 + Math.sin(elapsed * 3) * 0.1;
        if (drone) {
          const dAngle = elapsed * (isFlowing ? 6.0 : 2.0);
          drone.position.set(
            Math.sin(dAngle) * (isFlowing ? 2.2 : 0.8),
            1.8 + Math.cos(dAngle * 0.5) * 0.5,
            Math.cos(dAngle) * (isFlowing ? 2.2 : 0.8)
          );
        }
        wandLight.intensity = isFlowing ? 2.5 : 1.0;
      }

      // 4C. ANIMATE DYNAMIC CRYPTO FLOW PARTICLE STREAM SYSTEM (Zero-GC Bezier Flow)
      if (cryptoFlowParticlesRef.current) {
        const { positions, seeds, points } = cryptoFlowParticlesRef.current;
        const bHeights = barCurrentHeightsRef.current;

        for (let i = 0; i < particleCount; i++) {
          const streamType = i % 6;
          const seed = seeds[i];
          let speed = 0.16;
          let p0x = 0, p0y = 2.2, p0z = 0;
          let c1x = 0, c1y = 5.0, c1z = 0;
          let p2x = 0, p2y = 2.2, p2z = 0;

          if (streamType === 0) {
            // Zara Chen -> BTC / SOL
            speed = crewTimers.zara > 0 ? 0.48 : 0.18;
            p0x = -1.6; p0y = 2.8; p0z = 2.2;
            c1x = -1.5; c1y = 5.5; c1z = 1.0;
            const targetCoin = i % 2 === 0 ? 0 : 2; // BTC or SOL
            p2x = CRYPTO_BAR_CONFIGS[targetCoin].xOffset;
            p2y = 0.32 + (bHeights[targetCoin] || 3.0);
            p2z = 0;
          } else if (streamType === 1) {
            // Soren Vance -> BTC / Spire
            speed = crewTimers.soren > 0 ? 0.48 : 0.18;
            p0x = 2.2; p0y = 2.8; p0z = 2.8;
            c1x = 1.0; c1y = 6.2; c1z = 1.5;
            p2x = -3.2; p2y = 0.32 + (bHeights[0] || 3.8); p2z = 0;
          } else if (streamType === 2) {
            // Maya Vane -> AETH
            speed = crewTimers.maya > 0 ? 0.45 : 0.16;
            p0x = -14.6; p0y = 2.8; p0z = -7.6;
            c1x = -6.0; c1y = 7.5; c1z = -3.0;
            p2x = 1.6; p2y = 0.32 + (bHeights[3] || 2.5); p2z = 0;
          } else if (streamType === 3) {
            // Atlas-9 & Lyra -> ETH & Staking
            speed = (crewTimers.atlas > 0 || crewTimers.lyra > 0) ? 0.48 : 0.18;
            p0x = 14.4; p0y = 2.8; p0z = -4.8;
            c1x = 7.0; c1y = 6.8; c1z = -2.5;
            p2x = -1.6; p2y = 0.32 + (bHeights[1] || 3.2); p2z = 0;
          } else if (streamType === 4) {
            // Nyx Solaris -> AVAX & Runway
            speed = crewTimers.nyx > 0 ? 0.5 : 0.17;
            p0x = 10.8; p0y = 3.2; p0z = 9.2;
            c1x = 7.0; c1y = 7.5; c1z = 4.5;
            p2x = 3.2; p2y = 0.32 + (bHeights[4] || 2.1); p2z = 0;
          } else {
            // Kaelen Vane -> Active Station
            speed = interactionPulseRef.current > 0 ? 0.42 : 0.15;
            if (pioneerGroupRef.current) {
              p0x = pioneerGroupRef.current.position.x;
              p0y = pioneerGroupRef.current.position.y + 1.2;
              p0z = pioneerGroupRef.current.position.z;
            } else {
              p0x = 0; p0y = 2.2; p0z = 4.2;
            }
            const currentWp = waypoints[waypointIdxRef.current];
            p2x = currentWp ? currentWp.x : 0;
            p2y = 2.2;
            p2z = currentWp ? currentWp.z : 4.2;
            c1x = (p0x + p2x) * 0.5;
            c1y = Math.max(p0y, p2y) + 2.5;
            c1z = (p0z + p2z) * 0.5;
          }

          const t = (elapsed * speed + seed) % 1.0;
          const oneMinusT = 1.0 - t;

          // Quadratic Bezier interpolation with dynamic parabolic vertical arc
          const x = oneMinusT * oneMinusT * p0x + 2 * oneMinusT * t * c1x + t * t * p2x;
          const y = oneMinusT * oneMinusT * p0y + 2 * oneMinusT * t * c1y + t * t * p2y + Math.sin(t * Math.PI) * 1.6;
          const z = oneMinusT * oneMinusT * p0z + 2 * oneMinusT * t * c1z + t * t * p2z;

          positions[i * 3]     = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
        }

        const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
        posAttr.needsUpdate = true;
      }

      // 5. Camera Positioning based on Camera Mode (Zero-GC via cameraModeRef)
      const cam = cameraRef.current;
      if (cam && pioneerGroupRef.current) {
        const pPos = pioneerGroupRef.current.position;
        const currentMode = cameraModeRef.current;

        if (cameraFocusTargetRef.current) {
          // Smooth focus on clicked/selected character in workspace
          const target = cameraFocusTargetRef.current;
          _tmpV2.set(target.x, target.y, target.z);
          _tmpV1.set(target.x + 3.2, target.y + 2.0, target.z + target.dist);
          cam.position.lerp(_tmpV1, 0.05);
          cam.lookAt(_tmpV2);
        } else if (currentMode === 'follow') {
          // 3rd Person Follow Camera behind Pioneer
          const angle = pioneerGroupRef.current.rotation.y;
          _camFollowOffset.set(
            -Math.sin(angle) * 9,
            4.5,
            -Math.cos(angle) * 9
          );
          _tmpV1.addVectors(pPos, _camFollowOffset);
          cam.position.lerp(_tmpV1, 0.05);
          cam.lookAt(pPos.x, pPos.y + 1.8, pPos.z);
        } else if (currentMode === 'top') {
          // Bird's Eye View of Citadel
          _tmpV1.set(0, 55, 10);
          cam.position.lerp(_tmpV1, 0.04);
          cam.lookAt(0, 8, 0);
        } else if (currentMode === 'habitat') {
          // Focus on Family Bio-Dome & Airlock Station
          _tmpV1.set(-13.4, 6, 2);
          cam.position.lerp(_tmpV1, 0.04);
          cam.lookAt(-13.4, 2.5, -6.0);
        } else {
          // Free Orbit Camera
          const cx = Math.sin(sphericalTheta) * Math.sin(sphericalPhi) * sphericalRadius;
          const cy = Math.cos(sphericalPhi) * sphericalRadius;
          const cz = Math.cos(sphericalTheta) * Math.sin(sphericalPhi) * sphericalRadius;
          cam.position.set(cx, cy, cz);
          cam.lookAt(0, 10, 0);
        }
      }

      // 6. Dynamic Procedural Texture Animations (Seamless Water Flow & Sky Rotation)
      if (skyMeshRef.current) {
        skyMeshRef.current.rotation.y = elapsed * 0.002;
      }
      if (waterTexturesRef.current) {
        const wOffset = (elapsed * 0.035) % 1;
        waterTexturesRef.current.map.offset.x = wOffset;
        waterTexturesRef.current.bumpMap.offset.x = wOffset;
        if (waterTexturesRef.current.normalMap) {
          waterTexturesRef.current.normalMap.offset.x = wOffset;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(containerRef.current.clientWidth || 0, 320);
      const h = Math.max(containerRef.current.clientHeight || 0, 240);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (domEl.parentElement) {
        domEl.parentElement.removeChild(domEl);
      }
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [textureStyle]);

  // Adjust Sky Lighting & Sky Dome Tint based on timeOfDay
  useEffect(() => {
    if (!sceneRef.current || !lightsRef.current) return;
    const { dirLight, ambientLight } = lightsRef.current;

    if (timeOfDay === 'day') {
      sceneRef.current.background = new THREE.Color(0x38bdf8);
      sceneRef.current.fog = new THREE.FogExp2(0x38bdf8, 0.008);
      dirLight.color.setHex(0xffffff);
      dirLight.intensity = 2.4;
      ambientLight.color.setHex(0xe0f2fe);
      ambientLight.intensity = 1.0;
      if (skyMeshRef.current && (skyMeshRef.current.material as THREE.MeshBasicMaterial).color) {
        (skyMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xdbeafe);
      }
    } else if (timeOfDay === 'sunset') {
      sceneRef.current.background = new THREE.Color(0x1e1b4b);
      sceneRef.current.fog = new THREE.FogExp2(0x1e1b4b, 0.012);
      dirLight.color.setHex(0xfb923c);
      dirLight.intensity = 2.2;
      ambientLight.color.setHex(0xfed7aa);
      ambientLight.intensity = 0.8;
      if (skyMeshRef.current && (skyMeshRef.current.material as THREE.MeshBasicMaterial).color) {
        (skyMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xfb923c);
      }
    } else {
      sceneRef.current.background = new THREE.Color(0x020617);
      sceneRef.current.fog = new THREE.FogExp2(0x020617, 0.015);
      dirLight.color.setHex(0x38bdf8);
      dirLight.intensity = 0.8;
      ambientLight.color.setHex(0x1e293b);
      ambientLight.intensity = 0.5;
      if (skyMeshRef.current && (skyMeshRef.current.material as THREE.MeshBasicMaterial).color) {
        (skyMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      }
    }
  }, [timeOfDay]);

  // Periodic sentient thoughts update every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      triggerNewThought();
    }, 22000);
    return () => clearInterval(timer);
  }, [pioneer.currentLocationName, pioneer.currentActivity]);

  return (
    <div className="relative w-full h-[calc(100vh-61px)] min-h-[640px] bg-slate-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating World Header */}
      <div className="absolute top-4 inset-x-4 md:inset-x-6 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                ECOSSISTEMA 3D VIVO
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                Ciclo #{pioneer.daysOnPlanet}
              </span>
            </div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
              Aetheria Citadel 3D · Família Pioneira Vane
            </h1>
          </div>
        </div>

        {/* Camera & Lighting Controls Toolbar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('ecosystem')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold"
            title="Voltar para a vista 2D da Cidadela"
          >
            <span>🏛️ Mapa 2D</span>
          </button>

          <div className="w-px h-4 bg-slate-800 my-auto" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCameraMode('follow')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                cameraMode === 'follow' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Seguir Pioneiro
            </button>
            <button
              onClick={() => setCameraMode('orbit')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                cameraMode === 'orbit' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Câmera 360°
            </button>
            <button
              onClick={() => setCameraMode('habitat')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                cameraMode === 'habitat' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Biodomo
            </button>
            <button
              onClick={() => setCameraMode('top')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                cameraMode === 'top' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vista Aérea
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800 my-auto" />

          {/* Time of Day Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTimeOfDay('day')}
              title="Dia Solar"
              className={`p-1.5 rounded-lg cursor-pointer ${timeOfDay === 'day' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'}`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTimeOfDay('sunset')}
              title="Entardecer Dourado"
              className={`p-1.5 rounded-lg cursor-pointer ${timeOfDay === 'sunset' ? 'bg-slate-800 text-orange-400' : 'text-slate-500'}`}
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              title="Noite Ciber"
              className={`p-1.5 rounded-lg cursor-pointer ${timeOfDay === 'night' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800 my-auto" />

          {/* 3D Texture Engine Style Picker */}
          <div className="relative">
            <button
              onClick={() => setShowTextureMenu(!showTextureMenu)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold"
              title="Alternar Texturas 3D Procedurais"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Texturas 3D</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 font-normal">
                {textureStyle === 'realistic-pbr' ? 'PBR Ultra' : textureStyle === 'hologram' ? 'Holográfico' : 'Ouro Solar'}
              </span>
            </button>

            {showTextureMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl p-2.5 shadow-2xl z-50 text-xs">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                  <span>Shader & Texturas 3D</span>
                  <span className="text-emerald-400 font-mono">PBR Ultra</span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { setTextureStyle('realistic-pbr'); setShowTextureMenu(false); }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      textureStyle === 'realistic-pbr' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">PBR Realista Ultra HD</div>
                      <div className="text-[10px] text-slate-400">Musgo alien, titânio escovado e relevo</div>
                    </div>
                    {textureStyle === 'realistic-pbr' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => { setTextureStyle('solar-gold'); setShowTextureMenu(false); }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      textureStyle === 'solar-gold' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Ouro Solar Aetheriano</div>
                      <div className="text-[10px] text-slate-400">Brilho âmbar e energia fotovoltaica</div>
                    </div>
                    {textureStyle === 'solar-gold' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => { setTextureStyle('hologram'); setShowTextureMenu(false); }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      textureStyle === 'hologram' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Matriz Holográfica Neon</div>
                      <div className="text-[10px] text-slate-400">Wireframe ciberespacial ciano</div>
                    </div>
                    {textureStyle === 'hologram' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Albedo 512px</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Bump/Normal</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Roughness</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Anisotropia x16</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Céu Nebular HD</span>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-800 my-auto" />

          {/* Citadel Crew & Crypto Flow Deck Toggle */}
          <button
            onClick={() => setIsCrewPanelOpen(!isCrewPanelOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-bold border ${
              isCrewPanelOpen
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}
            title="Equipe de Especialistas & Fluxo Cripto no Meio de Trabalho"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Equipe ({CITADEL_CREW_CONFIGS.length})</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Floating Action / Navigation Toast Notification */}
      {stationActionToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className={`px-4 py-2.5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 text-xs font-mono ${
            stationActionToast.type === 'crypto'
              ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
              : stationActionToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
          }`}>
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '3s' }} />
            <div>
              <div className="font-bold text-white tracking-wide">{stationActionToast.title}</div>
              <div className="text-[11px] opacity-90">{stationActionToast.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Hover Tooltip near mouse pointer */}
      {hoveredStation && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-12 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 px-3 py-1.5 rounded-xl shadow-2xl text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 whitespace-nowrap"
          style={{ left: hoveredStation.x, top: hoveredStation.y }}
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{hoveredStation.name}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 uppercase font-semibold">Clique para Interagir</span>
        </div>
      )}

      {/* Stations & Citadel Crew Navigator Dock (Top-Right / Center-Right) */}
      <div className="absolute top-20 right-4 md:right-6 z-20 flex flex-col items-end gap-2 pointer-events-none max-h-[calc(100vh-190px)] overflow-y-auto scrollbar-none pb-4">
        {/* Dock Container */}
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl max-w-xs w-full text-xs">
          {/* Header Switcher: Estações vs Equipe Cripto */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-mono">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsCrewPanelOpen(false)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  !isCrewPanelOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Estações (5)
              </button>
              <button
                onClick={() => setIsCrewPanelOpen(true)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isCrewPanelOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3 h-3 text-cyan-400" />
                <span>Equipe ({CITADEL_CREW_CONFIGS.length})</span>
              </button>
            </div>

            {!isCrewPanelOpen && (
              <button
                onClick={() => setAutoPatrol(!autoPatrol)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                  autoPatrol
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
                title="Alternar patrulha automática entre as estações"
              >
                {autoPatrol ? <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-2.5 h-2.5" />}
                <span>{autoPatrol ? 'Auto: ON' : 'Manual'}</span>
              </button>
            )}
          </div>

          {/* VIEW A: CITADEL CREW & CRYPTO FLOWS */}
          {isCrewPanelOpen ? (
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center justify-between pb-1">
                <span>Especialistas em Ação</span>
                <span className="text-[9px] text-slate-400 font-normal">Fluxos Cripto Vivos</span>
              </div>

              {CITADEL_CREW_CONFIGS.map((crew) => {
                const isSelected = selectedCrewMember?.id === crew.id;
                const isFlowing = workerFlowTimersRef.current && (workerFlowTimersRef.current as any)[crew.id] > 0;

                return (
                  <div
                    key={crew.id}
                    className={`p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : isFlowing
                        ? 'bg-slate-900/80 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: crew.color }}
                        />
                        <div className="truncate">
                          <div className="font-bold text-[11px] text-white flex items-center gap-1 truncate">
                            <span>{crew.name}</span>
                            {isFlowing && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                            )}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">{crew.role}</div>
                        </div>
                      </div>

                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0"
                        style={{
                          backgroundColor: `${crew.color}20`,
                          color: crew.color,
                          border: `1px solid ${crew.color}40`
                        }}
                      >
                        {crew.cryptoSymbol}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-300 font-mono mb-2 line-clamp-1">
                      📍 {crew.station}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setSelectedCrewMember(crew);
                          cameraFocusTargetRef.current = {
                            x: crew.position[0],
                            y: crew.position[1] + 0.6,
                            z: crew.position[2],
                            dist: 7.5,
                            name: crew.name
                          };
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Focar câmera 3D no personagem"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>Focar 3D</span>
                      </button>

                      <button
                        onClick={() => executeCrewAction(crew.id)}
                        className="p-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-200 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        title={crew.actionDesc}
                      >
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Disparar Fluxo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW B: STATIONS LIST & OPERATIONS */
            <>
              {/* Station Quick-Navigate Buttons */}
              <div className="space-y-1.5 mb-3">
                {waypoints.map((wp, idx) => {
                  const isCurrent = waypointIdxRef.current === idx;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => dispatchPioneerToStation(idx)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer font-mono text-[11px] ${
                        isCurrent
                          ? 'bg-slate-900 border border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                          : 'hover:bg-slate-900/60 border border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: `#${wp.color.toString(16).padStart(6, '0')}` }}
                        />
                        <div className="truncate">
                          <div className="font-semibold truncate">{wp.name}</div>
                          <div className="text-[9px] text-slate-400 truncate">{wp.badge}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-bold ${
                        isCurrent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isCurrent ? 'Aqui' : 'Ir'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contextual Active Station Operations Console */}
              <div className="border-t border-slate-800 pt-2 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-[11px] font-bold text-white uppercase">Terminal Operacional</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    {waypoints[waypointIdxRef.current].badge}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 font-mono mb-2 pb-1.5 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Telemetria:</span>
                  <span className="text-emerald-400 font-semibold">{waypoints[waypointIdxRef.current].status}</span>
                </div>

                {/* Dynamic Actions based on Current Station */}
                <div className="space-y-1.5">
                  {waypointIdxRef.current === 0 && (
                    <>
                      <button
                        onClick={() => executeStationAction('quantum-arbitrage')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 transition-colors cursor-pointer font-mono text-[11px] font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                          <span>Arbitragem Flash</span>
                        </span>
                        <span className="text-emerald-400 font-bold">+25 AETH</span>
                      </button>
                      <button
                        onClick={() => executeStationAction('rebalance-rings')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer font-mono text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sincronizar Anéis</span>
                        </span>
                        <span className="text-amber-400">+18% Energia</span>
                      </button>
                    </>
                  )}

                  {waypointIdxRef.current === 1 && (
                    <>
                      <button
                        onClick={() => executeStationAction('harvest-hydroponics')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 transition-colors cursor-pointer font-mono text-[11px] font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <Apple className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Colher Safra Hidropônica</span>
                        </span>
                        <span className="text-emerald-400 font-bold">+22%</span>
                      </button>
                      <button
                        onClick={() => executeStationAction('airlock-stabilize')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer font-mono text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Esterilizar Eclusa</span>
                        </span>
                        <span className="text-emerald-400">+10% Saúde</span>
                      </button>
                    </>
                  )}

                  {waypointIdxRef.current === 2 && (
                    <>
                      <button
                        onClick={() => executeStationAction('claim-staking')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 transition-colors cursor-pointer font-mono text-[11px] font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Coletar Staking dos Nós</span>
                        </span>
                        <span className="text-emerald-400 font-bold">+32 AETH</span>
                      </button>
                      <button
                        onClick={() => executeStationAction('forge-crystal')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer font-mono text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Forjar Cristal Validador</span>
                        </span>
                        <span className="text-indigo-400">+15% Energia</span>
                      </button>
                    </>
                  )}

                  {waypointIdxRef.current === 3 && (
                    <>
                      <button
                        onClick={() => executeStationAction('deep-scan')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 transition-colors cursor-pointer font-mono text-[11px] font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>Varredura Óptica Profunda</span>
                        </span>
                        <span className="text-sky-400 font-bold">100km Scan</span>
                      </button>
                      <button
                        onClick={() => executeStationAction('waterfall-meditate')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer font-mono text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>Harmonia das Cachoeiras</span>
                        </span>
                        <span className="text-rose-400">+12% Vigor</span>
                      </button>
                    </>
                  )}

                  {waypointIdxRef.current === 4 && (
                    <>
                      <button
                        onClick={() => executeStationAction('dispatch-shuttle')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 transition-colors cursor-pointer font-mono text-[11px] font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>Despachar Shuttle Voador</span>
                        </span>
                        <span className="text-amber-400 font-bold">Voo Aeth-7</span>
                      </button>
                      <button
                        onClick={() => executeStationAction('inspect-cargo')}
                        disabled={stationOpExecuting}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer font-mono text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <Box className="w-3.5 h-3.5 text-amber-400" />
                          <span>Auditar Paletes RWA</span>
                        </span>
                        <span className="text-emerald-400 font-bold">+15 AETH</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Floating Focused Crew Member Quick Card */}
        {selectedCrewMember && (
          <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl p-3 shadow-2xl max-w-xs w-full text-xs font-mono animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedCrewMember.color }}
                />
                <div>
                  <h4 className="font-bold text-white text-[12px]">{selectedCrewMember.name}</h4>
                  <span className="text-[10px] text-cyan-400 block">{selectedCrewMember.role}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCrewMember(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed mb-2.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              {selectedCrewMember.cryptoFlow}
            </p>

            <button
              onClick={() => executeCrewAction(selectedCrewMember.id)}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Disparar Ação Cripto ({selectedCrewMember.cryptoSymbol})</span>
            </button>
          </div>
        )}
      </div>

      {/* Left Column: Living Pioneer Thought Bubble & 3D Crypto Bar Matrix */}
      <div className="absolute top-20 inset-x-4 md:inset-x-auto md:left-6 md:max-w-sm z-20 pointer-events-none flex flex-col gap-2.5 max-h-[calc(100vh-190px)] overflow-y-auto scrollbar-none pb-4">
        {/* Living Pioneer Consciousness Bubble */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-3.5 shadow-2xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Consciência Viva · Kaelen ({pioneer.currentLocationName})
              </span>
            </div>
            <button
              onClick={triggerNewThought}
              disabled={thinking}
              className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 ${thinking ? 'animate-spin' : ''}`} />
              <span>Refletir</span>
            </button>
          </div>

          <p className="text-xs text-slate-100 italic leading-relaxed">
            "{pioneer.latestThought}"
          </p>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Atividade Atual:</span>
            <span className="text-emerald-300 font-semibold truncate max-w-[200px]">
              {pioneer.currentActivity}
            </span>
          </div>
        </div>

        {/* 3D Crypto Bar Graph Matrix & Scale Controller Widget */}
        <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl relative overflow-hidden text-xs font-mono">
          {/* Header & Toggle */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Barras Cripto 3D
                </span>
                <span className="text-[9px] text-cyan-400 font-semibold">
                  {cryptoScaleMode === 'low' && '🟢 Escala Baixa · Micro / Estável'}
                  {cryptoScaleMode === 'high' && '🔥 Escala Alta · Picos Bull Run'}
                  {cryptoScaleMode === 'dynamic' && '🌀 Escala Dinâmica · Ciclo Oscilatório'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBarPanelExpanded(!isBarPanelExpanded)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isBarPanelExpanded ? 'Minimizar Painel' : 'Expandir Painel'}
            >
              {isBarPanelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Scale Selector Buttons (Baixa ⇋ Dinâmica ⇋ Alta) */}
          <div className="grid grid-cols-3 gap-1 mb-2.5">
            <button
              onClick={() => {
                setCryptoScaleMode('low');
                setCryptoScaleMultiplier(0.38);
                triggerCryptoBarWave('scale-low');
              }}
              className={`py-1.5 px-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                cryptoScaleMode === 'low'
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Escala Baixa</span>
              <span className="text-[8px] opacity-75 font-normal">Micro / Estável</span>
            </button>

            <button
              onClick={() => {
                setCryptoScaleMode('dynamic');
                setCryptoScaleMultiplier(1.0);
                triggerCryptoBarWave('manual');
              }}
              className={`py-1.5 px-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                cryptoScaleMode === 'dynamic'
                  ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Dinâmica</span>
              <span className="text-[8px] opacity-75 font-normal">Harmônica</span>
            </button>

            <button
              onClick={() => {
                setCryptoScaleMode('high');
                setCryptoScaleMultiplier(2.0);
                triggerCryptoBarWave('scale-high');
              }}
              className={`py-1.5 px-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                cryptoScaleMode === 'high'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Escala Alta</span>
              <span className="text-[8px] opacity-75 font-normal">Bull Surge</span>
            </button>
          </div>

          {isBarPanelExpanded && (
            <>
              {/* Continuous Multiplier Slider */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2 mb-2.5">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    <span>Multiplicador de Altura:</span>
                  </span>
                  <span className="text-cyan-300 font-bold tabular-nums">
                    {(cryptoScaleMultiplier * 100).toFixed(0)}% ({cryptoScaleMultiplier.toFixed(2)}x)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={cryptoScaleMultiplier}
                  onChange={(e) => setCryptoScaleMultiplier(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
                  <span>0.2x (Micro Mínimo)</span>
                  <span>1.0x (Padrão)</span>
                  <span>3.0x (Pico Máximo)</span>
                </div>
              </div>

              {/* 5 Real-Time Animated Crypto Bars Preview & Quick Action */}
              <div className="space-y-1 mb-2.5">
                {CRYPTO_BAR_CONFIGS.map((coin, i) => {
                  const asset = assets[coin.symbol];
                  const price = asset ? asset.price : coin.fallbackPrice;
                  const change = asset ? asset.change24h : coin.fallbackChange;
                  const isSelected = selectedCryptoIdx === i;
                  const currentH = barCurrentHeightsRef.current[i] || coin.baseHeightLow;
                  const barPercent = Math.min(100, Math.max(12, (currentH / 22) * 100));

                  return (
                    <button
                      key={coin.symbol}
                      onClick={() => {
                        setSelectedCryptoIdx(i);
                        triggerSingleBarSurge(i);
                      }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: coin.hexColor }}
                        />
                        <div>
                          <div className="font-bold text-[11px] leading-tight flex items-center gap-1">
                            <span>{coin.symbol}</span>
                            <span className="text-[9px] text-slate-400 font-normal truncate max-w-[65px]">{coin.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-300 tabular-nums">
                            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Animated 3D Height Indicator Gauge */}
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 flex items-center">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${barPercent}%`,
                              backgroundColor: coin.hexColor,
                              boxShadow: `0 0 8px ${coin.hexColor}`
                            }}
                          />
                        </div>

                        <span className={`text-[10px] font-bold tabular-nums min-w-[42px] text-right flex items-center justify-end ${
                          change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Wave Ripple & Pioneer Dispatch */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => triggerCryptoBarWave('trading')}
                  className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Onda Quântica</span>
                </button>

                <button
                  onClick={() => {
                    dispatchPioneerToStation(0);
                    setTimeout(() => {
                      executeStationAction('quantum-arbitrage');
                    }, 1200);
                  }}
                  className="p-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Kaelen: Arbitrar</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Pioneer Vitals & Survival Command Deck */}
      <div className="absolute bottom-4 inset-x-4 md:inset-x-6 z-20 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
        {/* Vitals Bar */}
        <div className="pointer-events-auto w-full md:w-auto bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 md:px-5 shadow-2xl flex flex-wrap items-center gap-4 text-xs font-mono">
          {/* Health */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Saúde Familiar</span>
              <span className="text-slate-100 font-bold tabular-nums">{pioneer.health}%</span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Energy / Shields */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Energia do Habitat</span>
              <span className="text-slate-100 font-bold tabular-nums">{pioneer.energy}%</span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Food / Hydroponics */}
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Suprimentos</span>
              <span className="text-slate-100 font-bold tabular-nums">{pioneer.food}%</span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Pioneer Balance */}
          <div>
            <span className="text-[10px] text-slate-500 block">Saldo do Pioneiro</span>
            <span className="text-emerald-400 font-bold tabular-nums">{pioneer.cryptoBalanceAeth} AETH</span>
          </div>
        </div>

        {/* Action Buttons: Support Pioneer, Emotes, & Chat */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={feedFamily}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[44px]"
            title="Alimentar a família com colheita hidropônica (-10 AETH)"
          >
            <Apple className="w-4 h-4 text-emerald-400" />
            <span>Alimentar</span>
          </button>

          <button
            onClick={rechargeShields}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[44px]"
            title="Calibrar escudos de radiação solar"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Escudos</span>
          </button>

          {/* Kaelen Direct 3D Emote: Jetpack Boost */}
          <button
            onClick={triggerJetpackBoost}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[44px]"
            title="Disparar propulsores a jato do exosuit"
          >
            <Flame className="w-4 h-4 text-cyan-400" />
            <span>Propulsor</span>
          </button>

          {/* Kaelen Direct 3D Emote: Drone Holographic Scanner */}
          <button
            onClick={triggerDroneScan}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[44px]"
            title="Varredura diagnóstica com o drone auxiliar"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Drone Scan</span>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wide transition-colors cursor-pointer shadow-lg shadow-emerald-500/20 min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Link Neural</span>
          </button>
        </div>
      </div>

      {/* Chat Drawer with the Pioneer Settler Family */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{pioneer.name}</h3>
                <span className="text-[11px] font-mono text-emerald-400">Pioneiros Migrantes · Setor Biodomo</span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Family Dossier Card */}
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Composição da Família:</span>
            {pioneer.familyMembers.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{m}</span>
              </div>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
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
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Kaelen está respondendo pelo link neural...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendPioneerChat} className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Fale com Kaelen e sua família..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
