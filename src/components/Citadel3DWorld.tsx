import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useExchange } from '../context/ExchangeContext';
import { PioneerState } from '../types/pioneer';
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
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export const Citadel3DWorld: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { assets, placeOrder, setActiveTab } = useExchange();

  // Camera & Visual Modes
  const [cameraMode, setCameraMode] = useState<'orbit' | 'follow' | 'top' | 'habitat'>('follow');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('sunset');
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

  // References to Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pioneerGroupRef = useRef<THREE.Group | null>(null);
  const energyRingsRef = useRef<THREE.Group | null>(null);
  const shuttlesRef = useRef<THREE.Group[]>([]);
  const lightsRef = useRef<{ dirLight: THREE.DirectionalLight; ambientLight: THREE.AmbientLight; skyColor: THREE.Color } | null>(null);

  // Pioneer Waypoints on the 3D Terrain
  const waypoints = [
    { name: 'Torre Central de Trading', x: 0, z: 4, activity: 'Calibrando o motor de ordens de baixa latência' },
    { name: 'Biodomo Familiar Vane', x: -16, z: -10, activity: 'Cuidando da estufa hidropônica com Maya e Leo' },
    { name: 'Cofres de Staking Líquido', x: 18, z: -8, activity: 'Coletando dividendos energéticos de staking' },
    { name: 'Mirante das Cachoeiras', x: -6, z: 18, activity: 'Observando o vale de liquidez e o tráfego aéreo' },
    { name: 'Plataforma RWA & Shuttles', x: 14, z: 12, activity: 'Negociando suprimentos com os cargueiros voadores' },
  ];
  const waypointIdxRef = useRef<number>(0);
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 4));

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

  // 3D Three.js Scene Setup & Animation Loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

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
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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
    // 1. TERRAIN & TERRACED BIO-ISLANDS
    // ==========================================
    const terrainGroup = new THREE.Group();

    // Central Main Island Platform
    const islandGeo = new THREE.CylinderGeometry(28, 34, 4, 32);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const mainIsland = new THREE.Mesh(islandGeo, islandMat);
    mainIsland.position.y = -2;
    mainIsland.receiveShadow = true;
    terrainGroup.add(mainIsland);

    // Stepped Upper Terrace
    const terraceGeo = new THREE.CylinderGeometry(18, 22, 3, 24);
    const terraceMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.7,
      metalness: 0.15,
    });
    const upperTerrace = new THREE.Mesh(terraceGeo, terraceMat);
    upperTerrace.position.y = 0.5;
    upperTerrace.receiveShadow = true;
    terrainGroup.add(upperTerrace);

    // Glowing Liquidity River Path (Curved Water Flow)
    const waterGeo = new THREE.TorusGeometry(12, 1.8, 16, 50, Math.PI * 1.2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = Math.PI / 2;
    waterMesh.position.set(0, 1.2, 2);
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
      color: 0x67e8f9,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const waterfallParticles = new THREE.Points(wfGeo, wfMat);
    terrainGroup.add(waterfallParticles);

    scene.add(terrainGroup);

    // ==========================================
    // 2. MONUMENTAL CENTRAL MATCHING SPIRE
    // ==========================================
    const spireGroup = new THREE.Group();

    // Tower Body
    const towerGeo = new THREE.CylinderGeometry(1.2, 3.5, 36, 16);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.85,
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 18;
    tower.castShadow = true;
    spireGroup.add(tower);

    // Crystal Spire Tip
    const crystalGeo = new THREE.OctahedronGeometry(2.5, 2);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.95,
      wireframe: false
    });
    const crystalTip = new THREE.Mesh(crystalGeo, crystalMat);
    crystalTip.position.y = 37;
    spireGroup.add(crystalTip);

    // Glowing Rotating 3D Energy Rings around the Tower
    const ringsGroup = new THREE.Group();
    ringsGroup.position.y = 26;

    const ring1Geo = new THREE.TorusGeometry(6, 0.18, 16, 48);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ringsGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(8.5, 0.16, 16, 48);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = 0.4;
    ringsGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(11, 0.14, 16, 48);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = 0.5;
    ringsGroup.add(ring3);

    spireGroup.add(ringsGroup);
    energyRingsRef.current = ringsGroup;
    scene.add(spireGroup);

    // ==========================================
    // 3. PIONEER'S FAMILY BIO-DOME HABITAT
    // ==========================================
    const habitatGroup = new THREE.Group();
    habitatGroup.position.set(-16, 2, -10);

    // Dome Glass Structure
    const domeGeo = new THREE.SphereGeometry(5.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.45,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    habitatGroup.add(dome);

    // Dome Hexagonal Lattice Wireframe
    const domeWireMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, wireframe: true, transparent: true, opacity: 0.6 });
    const domeWire = new THREE.Mesh(domeGeo, domeWireMat);
    habitatGroup.add(domeWire);

    // Internal Habitat Hearth Warm Light
    const hearthLight = new THREE.PointLight(0xf59e0b, 2.5, 14);
    hearthLight.position.set(0, 1.5, 0);
    habitatGroup.add(hearthLight);

    // Hydroponic Tree Inside Dome
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
    trunk.position.y = 1.25;
    habitatGroup.add(trunk);

    const foliageGeo = new THREE.SphereGeometry(1.6, 12, 12);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 3;
    habitatGroup.add(foliage);

    scene.add(habitatGroup);

    // ==========================================
    // 4. SECONDARY SPIRES & STAKING BIO-VAULTS
    // ==========================================
    const spires = [
      { x: 18, z: -8, color: 0x60a5fa, height: 16, name: 'Staking' },
      { x: -12, z: 14, color: 0xa78bfa, height: 14, name: 'ColdVault' },
      { x: 14, z: 12, color: 0x34d399, height: 18, name: 'Launchpad' },
    ];
    spires.forEach((sp) => {
      const sGeo = new THREE.ConeGeometry(2, sp.height, 6);
      const sMat = new THREE.MeshStandardMaterial({
        color: sp.color,
        emissive: sp.color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.8
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.set(sp.x, sp.height / 2, sp.z);
      sMesh.castShadow = true;
      scene.add(sMesh);
    });

    // ==========================================
    // 5. 3D HOVER SHUTTLES (FLYING IN THE SKY)
    // ==========================================
    const shuttles: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const shuttle = new THREE.Group();
      
      const bodyGeo = new THREE.ConeGeometry(0.6, 2.8, 6);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.8 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI / 2;
      shuttle.add(body);

      // Plasma Engine Glow
      const glowGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xfbbf24 : 0x38bdf8 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -1.4;
      shuttle.add(glow);

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
    // 6. THE LIVING PIONEER CHARACTER (KAELEN)
    // ==========================================
    const pioneerGroup = new THREE.Group();

    // Torso (Exo-Suit Armor)
    const torsoGeo = new THREE.BoxGeometry(0.7, 1.0, 0.45);
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    pioneerGroup.add(torso);

    // Armor Chestplate Accent
    const chestGeo = new THREE.BoxGeometry(0.5, 0.4, 0.15);
    const chestMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 });
    const chest = new THREE.Mesh(chestGeo, chestMat);
    chest.position.set(0, 1.4, 0.22);
    pioneerGroup.add(chest);

    // Helmet & Glowing Biometric Visor
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.7 });
    const head = new THREE.Mesh(headGeo, helmetMat);
    head.position.y = 2.05;
    head.castShadow = true;
    pioneerGroup.add(head);

    const visorGeo = new THREE.BoxGeometry(0.4, 0.18, 0.2);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.05, 0.25);
    pioneerGroup.add(visor);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.25);
    const leftLeg = new THREE.Mesh(legGeo, suitMat);
    leftLeg.position.set(-0.2, 0.5, 0);
    pioneerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, suitMat);
    rightLeg.position.set(0.2, 0.5, 0);
    pioneerGroup.add(rightLeg);

    // Floating Companion Drone / Android Child Helper
    const droneGroup = new THREE.Group();
    droneGroup.position.set(0.8, 2.2, 0);

    const droneGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.9 });
    const drone = new THREE.Mesh(droneGeo, droneMat);
    droneGroup.add(drone);

    const droneEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
    droneEye.position.set(0, 0, 0.18);
    droneGroup.add(droneEye);

    pioneerGroup.add(droneGroup);

    // Position pioneer initially on terrace
    pioneerGroup.position.set(0, 2, 4);
    scene.add(pioneerGroup);
    pioneerGroupRef.current = pioneerGroup;

    // Mouse Drag / Touch Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0.5;
    let sphericalPhi = 1.1;
    let sphericalRadius = 38;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.008;
      sphericalPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, sphericalPhi - deltaY * 0.008));
    };

    const onMouseUp = () => {
      isDragging = false;
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

      // 3. Move Flying Shuttles
      shuttlesRef.current.forEach((shuttle, idx) => {
        const speed = 0.35 + idx * 0.1;
        const angle = elapsed * speed + idx * 2.1;
        const radius = 22 + idx * 4;
        shuttle.position.x = Math.cos(angle) * radius;
        shuttle.position.z = Math.sin(angle) * radius;
        shuttle.position.y = 14 + idx * 4 + Math.sin(elapsed * 2 + idx) * 1.5;
        shuttle.rotation.y = -angle + Math.PI / 2;
      });

      // 4. Move Pioneer towards current target waypoint
      if (pioneerGroupRef.current) {
        const p = pioneerGroupRef.current;
        const target = targetPosRef.current;
        const dir = new THREE.Vector3().subVectors(target, p.position);
        const dist = dir.length();

        if (dist > 0.3) {
          dir.normalize();
          p.position.addScaledVector(dir, 0.04);
          // Face direction of travel
          const angle = Math.atan2(dir.x, dir.z);
          p.rotation.y = angle;

          // Leg walking oscillation
          leftLeg.rotation.x = Math.sin(elapsed * 8) * 0.5;
          rightLeg.rotation.x = -Math.sin(elapsed * 8) * 0.5;
        } else {
          // Reached waypoint: pick next
          leftLeg.rotation.x = 0;
          rightLeg.rotation.x = 0;

          // Wait at waypoint then pick next
          if (Math.floor(elapsed) % 12 === 0) {
            waypointIdxRef.current = (waypointIdxRef.current + 1) % waypoints.length;
            const nextWp = waypoints[waypointIdxRef.current];
            targetPosRef.current.set(nextWp.x, 2, nextWp.z);
            setPioneer((prev) => ({
              ...prev,
              currentLocationName: nextWp.name,
              currentActivity: nextWp.activity
            }));
          }
        }

        // Companion Drone Hover Bobbing
        droneGroup.position.y = 2.2 + Math.sin(elapsed * 3) * 0.2;
      }

      // 5. Camera Positioning based on Camera Mode
      const cam = cameraRef.current;
      if (cam && pioneerGroupRef.current) {
        const pPos = pioneerGroupRef.current.position;

        if (cameraMode === 'follow') {
          // 3rd Person Follow Camera behind Pioneer
          const followOffset = new THREE.Vector3(
            -Math.sin(pioneerGroupRef.current.rotation.y) * 9,
            4.5,
            -Math.cos(pioneerGroupRef.current.rotation.y) * 9
          );
          cam.position.lerp(new THREE.Vector3().addVectors(pPos, followOffset), 0.05);
          cam.lookAt(pPos.x, pPos.y + 1.8, pPos.z);
        } else if (cameraMode === 'top') {
          // Bird's Eye View of Citadel
          cam.position.lerp(new THREE.Vector3(0, 55, 10), 0.04);
          cam.lookAt(0, 8, 0);
        } else if (cameraMode === 'habitat') {
          // Focus on Family Bio-Dome
          cam.position.lerp(new THREE.Vector3(-16, 8, 2), 0.04);
          cam.lookAt(-16, 3, -10);
        } else {
          // Free Orbit Camera
          const cx = Math.sin(sphericalTheta) * Math.sin(sphericalPhi) * sphericalRadius;
          const cy = Math.cos(sphericalPhi) * sphericalRadius;
          const cz = Math.cos(sphericalTheta) * Math.sin(sphericalPhi) * sphericalRadius;
          cam.position.set(cx, cy, cz);
          cam.lookAt(0, 10, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
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
      renderer.dispose();
    };
  }, [cameraMode]);

  // Adjust Sky Lighting based on timeOfDay
  useEffect(() => {
    if (!sceneRef.current || !lightsRef.current) return;
    const { dirLight, ambientLight } = lightsRef.current;

    if (timeOfDay === 'day') {
      sceneRef.current.background = new THREE.Color(0x38bdf8);
      sceneRef.current.fog = new THREE.FogExp2(0x38bdf8, 0.012);
      dirLight.color.setHex(0xffffff);
      dirLight.intensity = 2.4;
      ambientLight.color.setHex(0xe0f2fe);
      ambientLight.intensity = 1.0;
    } else if (timeOfDay === 'sunset') {
      sceneRef.current.background = new THREE.Color(0x1e1b4b);
      sceneRef.current.fog = new THREE.FogExp2(0x1e1b4b, 0.015);
      dirLight.color.setHex(0xfb923c);
      dirLight.intensity = 2.2;
      ambientLight.color.setHex(0xfed7aa);
      ambientLight.intensity = 0.8;
    } else {
      sceneRef.current.background = new THREE.Color(0x020617);
      sceneRef.current.fog = new THREE.FogExp2(0x020617, 0.02);
      dirLight.color.setHex(0x38bdf8);
      dirLight.intensity = 0.8;
      ambientLight.color.setHex(0x1e293b);
      ambientLight.intensity = 0.5;
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
        </div>
      </div>

      {/* Floating Sentient Thought Bubble over Pioneer */}
      <div className="absolute top-20 inset-x-4 md:inset-x-auto md:left-6 md:max-w-lg z-20 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
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

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Atividade Atual:</span>
            <span className="text-emerald-300 font-semibold truncate max-w-[240px]">
              {pioneer.currentActivity}
            </span>
          </div>
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

        {/* Action Buttons: Support Pioneer & Chat */}
        <div className="pointer-events-auto flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={feedFamily}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            <Apple className="w-4 h-4 text-emerald-400" />
            <span>Alimentar (-10 AETH)</span>
          </button>

          <button
            onClick={rechargeShields}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Calibrar Escudos</span>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wide transition-colors cursor-pointer shadow-lg shadow-emerald-500/20 min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Conversar com a Família</span>
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
