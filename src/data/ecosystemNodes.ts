import { EcosystemNode } from '../types/crypto';

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: 'reserves',
    name: 'IMMUTABLE RESERVES',
    subtitle: 'Zero-Knowledge Solvency & Cold Custody',
    iconName: 'shield',
    category: 'security',
    description: 'Custódia institucional multi-sig e auditoria criptográfica em tempo real com prova de reservas de 108.4%.',
    longDescription: 'O pilar de Custódia e Reservas Imutáveis da Aetheria opera com arquitetura Zero-Knowledge e computação multipartidária (MPC). 100% dos fundos dos clientes permanecem segregados em cofres de armazenamento a frio com auditoria pública na blockchain atualizada a cada bloco.',
    metrics: [
      { label: 'Índice de Solvência', value: '108.4%', change: '+0.8% este mês' },
      { label: 'Total Sob Custódia (TVL)', value: '$14.28B', change: 'Verificado On-chain' },
      { label: 'Auditoria de Segurança', value: 'CertiK / Trail of Bits', change: 'Nota A+' },
      { label: 'Fundo de Seguro', value: '$750M USDT', change: 'Proteção Total' }
    ],
    technicalFeatures: [
      'Provas de Solvência criptográficas via Merkle Tree atualizadas a cada bloco',
      'Esquema Multi-Sig MPC (Multi-Party Computation) 5-de-7 com chaves geograficamente distribuídas',
      'Isolamento total contra ataques quânticos com algoritmos pós-quânticos Lattice-based',
      'Cobertura securitária institucional apoiada por Lloyd\'s Syndicate de Londres'
    ],
    ctaLabel: 'Verificar Prova de Reservas',
    ctaAction: 'reserves',
    targetPosition: { x: 28, y: 52 },
    labelPosition: { x: 14, y: 22 },
    anchorDirection: 'left'
  },
  {
    id: 'spot-engine',
    name: 'SPOT & PERP MATCHING ENGINE',
    subtitle: 'Ultra-Low Latency Order Book & Liquidity',
    iconName: 'zap',
    category: 'trading',
    description: 'Motor de alta frequência com liquidez profunda institucional e execução sub-milissegundo (< 0.35ms).',
    longDescription: 'A torre central de processamento abriga o motor de ordens proprietário capaz de processar até 250.000 transações por segundo. Sem derrapagem em grandes blocos, com taxas zeradas para formadores de mercado (0% Maker) e alavancagem cruzada flexível.',
    metrics: [
      { label: 'Latência Média de Execução', value: '0.34 ms', change: 'Ultra-Fast' },
      { label: 'Volume Diário (24h)', value: '$5.42B USD', change: '+14.2%' },
      { label: 'Throughput do Motor', value: '250.000 TPS', change: 'Capacidade Pico' },
      { label: 'Taxa Maker / Taker', value: '0.00% / 0.04%', change: 'Menor do Mercado' }
    ],
    technicalFeatures: [
      'Motor de correspondência de livro de ofertas L3 em memória em C++ de alta performance',
      'Roteamento inteligente de ordens (Smart Order Routing) com agregação de liquidez cruzada',
      'Contratos perpétuos com margem isolada ou cruzada até 50x',
      'APIs de baixa latência WebSocket e FIX protocol para traders institucionais'
    ],
    ctaLabel: 'Acessar Terminal de Trading',
    ctaAction: 'trading',
    targetPosition: { x: 58, y: 32 },
    labelPosition: { x: 34, y: 14 },
    anchorDirection: 'left'
  },
  {
    id: 'yield-staking',
    name: 'AUTONOMOUS QUANT VAULTS',
    subtitle: 'Liquid Staking & Algorithmic Yield',
    iconName: 'sprout',
    category: 'yield',
    description: 'Cofres inteligentes de rendimento automatizado, staking líquido com PoS e distribuição diária de dividendos.',
    longDescription: 'Localizados nas biosferas aéreas do ecossistema, os Cofres de Rendimento Automatizado alocam capital em validadores institucionais de Ethereum, Solana e estratégias neutras de mercado (delta-neutral). Os usuários recebem tokens sintéticos líquidos utilizáveis no trading.',
    metrics: [
      { label: 'APY Médio dos Cofres', value: '11.8%', change: 'Compostos Diários' },
      { label: 'Ativos em Staking', value: '$3.89B USD', change: '+6.4% 30d' },
      { label: 'Recompensas Pagas (Total)', value: '$412M USD', change: '100% Distribuído' },
      { label: 'Liquidez Instantânea', value: 'Disponível', change: 'Sem Lockup Forçado' }
    ],
    technicalFeatures: [
      'Rebalanceamento algorítmico automatizado em tempo real baseado em volatilidade',
      'Emissão de derivativos de staking líquido (aeETH, aeSOL) para uso simultâneo em garantia',
      'Proteção contra impermanent loss com oráculos Chainlink descentralizados',
      'Distribuição de 30% das taxas de corretagem para detentores do token do ecossistema'
    ],
    ctaLabel: 'Explorar Cofres de Rendimento',
    ctaAction: 'earn',
    targetPosition: { x: 78, y: 26 },
    labelPosition: { x: 82, y: 16 },
    anchorDirection: 'right'
  },
  {
    id: 'circular-defi',
    name: 'CIRCULAR OMNICHAIN SWAP',
    subtitle: 'Cross-Chain Liquidity Rivers',
    iconName: 'refresh-cw',
    category: 'defi',
    description: 'Ponte e agregador descentralizado multichain com conversão instantânea de tokens e taxa de gás otimizada.',
    longDescription: 'Simbolizado pelas águas cristalinas e rotas de transporte que conectam a cidadela, o protocolo Circular Swap permite troca imediata entre Bitcoin, Ethereum, Solana e redes L2 sem necessidade de pontes lentas ou risco de custódia intermediária.',
    metrics: [
      { label: 'Tempo Médio de Swap', value: '1.8 segundos', change: 'Instantâneo' },
      { label: 'Chains Conectadas', value: '14 Blockchains', change: 'EVM + SVM + BTC' },
      { label: 'Slippage Médio', value: '< 0.02%', change: 'Melhor Preço Garantido' },
      { label: 'Swaps Realizados (24h)', value: '184.290', change: '+22.1%' }
    ],
    technicalFeatures: [
      'Liquidez atômica compartilhada com agregação em tempo real dos maiores pools globais',
      'Proteção nativa contra MEV (Maximal Extractable Value) e ataques de sanduíche',
      'Otimizador inteligente de rotas de gás com abatimento em stablecoins',
      'Liquidação nativa em Bitcoin via Taproot e Lightning Network integrada'
    ],
    ctaLabel: 'Executar Swap Instantâneo',
    ctaAction: 'swap',
    targetPosition: { x: 44, y: 78 },
    labelPosition: { x: 18, y: 86 },
    anchorDirection: 'left'
  },
  {
    id: 'rwa-launchpad',
    name: 'RWA & COSMIC LAUNCHPAD',
    subtitle: 'Tokenized Real-World Assets & Web3 Incubator',
    iconName: 'rocket',
    category: 'innovation',
    description: 'Tokenização de títulos do tesouro soberano, fundos de crédito privado e incubação de novos projetos cripto.',
    longDescription: 'O terminal avançado da cidadela conecta os mercados de capitais tradicionais à fronteira criptográfica. Permite negociar T-Bills norte-americanos tokenizados com rendimento de 5.1% ao ano, debêntures solares sustentáveis e acesso antecipado a pré-lançamentos vetted.',
    metrics: [
      { label: 'Volume RWA Tokenizado', value: '$1.42B USD', change: '+38% no ano' },
      { label: 'Rendimento T-Bills On-Chain', value: '5.10% a.a.', change: 'Tesouro Soberano' },
      { label: 'Projetos Incubados', value: '38 Lançamentos', change: '100% Auditados' },
      { label: 'Retorno Médio IDO', value: '+340%', change: 'Histórico Verificado' }
    ],
    technicalFeatures: [
      'Conformidade regulatória institucional com contratos inteligentes com verificação KYC/KYB on-chain',
      'Tokens ERC-3643 compatíveis com regras de valores mobiliários globais',
      'Distribuição contínua de cupons de rendimento em USDC segundo a segundo',
      'Alocação prioritária garantida baseada no nível de participação no ecossistema'
    ],
    ctaLabel: 'Conhecer Projetos & RWAs',
    ctaAction: 'trading',
    targetPosition: { x: 90, y: 56 },
    labelPosition: { x: 80, y: 88 },
    anchorDirection: 'right'
  }
];
