import * as THREE from 'three';

/**
 * Procedural 3D Texture Generator for Three.js
 * Generates zero-dependency, high-resolution procedural textures (Albedo, Bump, Normal, Emissive, Roughness)
 * using HTML5 Canvas with anisotropic filtering and sRGB color space.
 */

// Helper to configure procedural canvas texture settings
export const setupTexture = (
  texture: THREE.CanvasTexture,
  repeatX = 1,
  repeatY = 1,
  isColorMap = true,
  maxAnisotropy = 4
): THREE.CanvasTexture => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.max(1, maxAnisotropy);
  if (isColorMap) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.needsUpdate = true;
  return texture;
};

// 1. ALIEN TERRAIN & MOSS TEXTURES (Base Island)
export const createAlienTerrainTextures = (maxAnisotropy = 4) => {
  const size = 512;

  // Albedo / Color Map
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  // Base alien soil gradient
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.7);
  bgGrad.addColorStop(0, '#0d543f');
  bgGrad.addColorStop(0.5, '#064e3b');
  bgGrad.addColorStop(0.85, '#043729');
  bgGrad.addColorStop(1, '#022c22');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Layered moss micro-vegetation speckles
  const rand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 4000; i++) {
    const px = rand(i * 1.13) * size;
    const py = rand(i * 2.71) * size;
    const r = 0.8 + rand(i * 3.41) * 2.8;
    const shade = rand(i * 5.17);

    if (shade > 0.65) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.45)'; // Vibrant bio-emerald
    } else if (shade > 0.3) {
      ctx.fillStyle = 'rgba(5, 150, 105, 0.35)'; // Deep forest moss
    } else {
      ctx.fillStyle = 'rgba(2, 44, 34, 0.5)'; // Dark loam crevice
    }
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing bioluminescent mineral veins (Subterranean liquidity energy)
  ctx.lineWidth = 1.6;
  for (let v = 0; v < 8; v++) {
    ctx.beginPath();
    let vx = (v / 8) * size + 20;
    let vy = 0;
    ctx.moveTo(vx, vy);

    ctx.strokeStyle = v % 2 === 0 ? 'rgba(52, 211, 153, 0.6)' : 'rgba(56, 189, 248, 0.5)';
    ctx.shadowColor = v % 2 === 0 ? '#10b981' : '#38bdf8';
    ctx.shadowBlur = 6;

    while (vy < size) {
      vx += (rand(v * 100 + vy) - 0.5) * 16;
      vy += 12;
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Bump / Height Map for relief
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 3000; i++) {
    const px = rand(i * 1.7) * size;
    const py = rand(i * 3.1) * size;
    const r = 1 + rand(i * 4.9) * 3.5;
    const val = Math.floor(rand(i * 7.3) * 180 + 40);
    bCtx.fillStyle = `rgb(${val},${val},${val})`;
    bCtx.beginPath();
    bCtx.arc(px, py, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  // Roughness Map (Veins are slick/smooth, rocks are rough)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  rCtx.fillStyle = '#b0b0b0'; // Mostly rough
  rCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#303030'; // Slick damp areas
  for (let i = 0; i < 60; i++) {
    const px = rand(i * 4.1) * size;
    const py = rand(i * 8.3) * size;
    const r = 8 + rand(i * 12.1) * 22;
    rCtx.beginPath();
    rCtx.arc(px, py, r, 0, Math.PI * 2);
    rCtx.fill();
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 5, 5, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(bumpCanvas), 5, 5, false, maxAnisotropy);
  const roughnessMap = setupTexture(new THREE.CanvasTexture(roughCanvas), 5, 5, false, maxAnisotropy);

  return { map, bumpMap, roughnessMap };
};

// 2. CYBERNETIC HEXAGONAL BIO-TILES (Upper Terrace & Trading Podiums)
export const createCyberHexTilesTextures = (maxAnisotropy = 4) => {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const eCtx = emissiveCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Fill bases
  ctx.fillStyle = '#0f172a'; // Deep slate metal
  ctx.fillRect(0, 0, size, size);
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Draw Hexagonal Grid
  const hexRadius = 40;
  const hexWidth = Math.sqrt(3) * hexRadius;
  const hexHeight = 2 * hexRadius * 0.75;

  const drawHex = (x: number, y: number, r: number) => {
    const points: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push([x + r * Math.cos(angle), y + r * Math.sin(angle)]);
    }
    return points;
  };

  for (let row = -1; row < 10; row++) {
    for (let col = -1; col < 10; col++) {
      const x = col * hexWidth + (row % 2 === 1 ? hexWidth / 2 : 0);
      const y = row * (hexRadius * 1.5);
      const pts = drawHex(x, y, hexRadius - 2);

      // Inner tile fill
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let p = 1; p < 6; p++) ctx.lineTo(pts[p][0], pts[p][1]);
      ctx.closePath();

      // Subtle gradient on each tile
      const grad = ctx.createLinearGradient(x - 20, y - 20, x + 20, y + 20);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fill();

      // Border groove
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Bump groove
      bCtx.beginPath();
      bCtx.moveTo(pts[0][0], pts[0][1]);
      for (let p = 1; p < 6; p++) bCtx.lineTo(pts[p][0], pts[p][1]);
      bCtx.closePath();
      bCtx.strokeStyle = '#303030';
      bCtx.lineWidth = 4;
      bCtx.stroke();

      // Central diamond tread grip
      ctx.fillStyle = 'rgba(52, 211, 153, 0.18)';
      ctx.fillRect(x - 6, y - 6, 12, 12);

      // Occasional glowing quantum energy circuit node
      if ((row + col) % 3 === 0) {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        eCtx.fillStyle = '#10b981';
        eCtx.beginPath();
        eCtx.arc(x, y, 4, 0, Math.PI * 2);
        eCtx.fill();

        // Trace line
        eCtx.strokeStyle = '#059669';
        eCtx.lineWidth = 1.5;
        eCtx.beginPath();
        eCtx.moveTo(x, y);
        eCtx.lineTo(pts[0][0], pts[0][1]);
        eCtx.stroke();
      }
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 3, 3, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(bumpCanvas), 3, 3, false, maxAnisotropy);
  const emissiveMap = setupTexture(new THREE.CanvasTexture(emissiveCanvas), 3, 3, false, maxAnisotropy);

  return { map, bumpMap, emissiveMap };
};

// 3. BRUSHED SCI-FI TITANIUM PLATING (Monumental Spire & Pillars)
export const createTitaniumSpireTextures = (maxAnisotropy = 4) => {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // Titanium silver base
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#404040'; // Low roughness = reflective metal
  rCtx.fillRect(0, 0, size, size);

  // Brushed anisotropic metal micro-streaks
  for (let i = 0; i < 400; i++) {
    const y = (i / 400) * size;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(100, 116, 139, 0.08)';
    ctx.fillRect(0, y, size, 1.2);
  }

  // Panel division seams
  const panelCols = 4;
  const panelRows = 8;
  const colW = size / panelCols;
  const rowH = size / panelRows;

  for (let r = 0; r < panelRows; r++) {
    for (let c = 0; c < panelCols; c++) {
      const px = c * colW;
      const py = r * rowH;

      // Dark panel seam
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, colW - 2, rowH - 2);

      bCtx.strokeStyle = '#202020';
      bCtx.lineWidth = 3;
      bCtx.strokeRect(px + 1, py + 1, colW - 2, rowH - 2);

      // Corner rivets
      const rivetCoords = [
        [px + 6, py + 6],
        [px + colW - 6, py + 6],
        [px + 6, py + rowH - 6],
        [px + colW - 6, py + rowH - 6],
      ];
      rivetCoords.forEach(([rx, ry]) => {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(rx, ry, 2, 0, Math.PI * 2);
        ctx.fill();

        bCtx.fillStyle = '#e0e0e0';
        bCtx.beginPath();
        bCtx.arc(rx, ry, 2, 0, Math.PI * 2);
        bCtx.fill();
      });

      // Sci-Fi Decals & Telemetry typography on select panels
      if ((r + c) % 3 === 0) {
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`AETH-${r}${c} // NODE-PBR`, px + 12, py + 18);

        // Neon telemetry status bar
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + 12, py + 22, colW - 30, 2);
      }

      // Carbon-fiber accent stripe on row 3 and 6
      if (r === 3 || r === 6) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py + rowH - 12, colW, 10);
        rCtx.fillStyle = '#909090'; // Matte carbon
        rCtx.fillRect(px, py + rowH - 12, colW, 10);
      }
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 1, 4, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(bumpCanvas), 1, 4, false, maxAnisotropy);
  const roughnessMap = setupTexture(new THREE.CanvasTexture(roughCanvas), 1, 4, false, maxAnisotropy);

  return { map, bumpMap, roughnessMap };
};

// 4. FLOWING QUANTUM LIQUIDITY RIVER TEXTURE (Dynamic animated caustics)
export const createQuantumWaterTextures = (maxAnisotropy = 4) => {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Deep electric blue to bright turquoise water base
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0284c7');
  grad.addColorStop(0.4, '#06b6d4');
  grad.addColorStop(0.7, '#0ea5e9');
  grad.addColorStop(1, '#059669');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Refractive caustic wave loops
  for (let i = 0; i < 40; i++) {
    const cx = (i * 37) % size;
    const cy = (i * 71) % size;
    const r = 25 + (i % 5) * 15;

    ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 1.4);
    ctx.stroke();

    bCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    bCtx.lineWidth = 4;
    bCtx.beginPath();
    bCtx.arc(cx, cy, r, 0, Math.PI * 1.4);
    bCtx.stroke();
  }

  // Glowing liquidity streams
  ctx.strokeStyle = '#a5f3fc';
  ctx.lineWidth = 2;
  for (let s = 0; s < 12; s++) {
    ctx.beginPath();
    ctx.moveTo(0, s * 42);
    ctx.bezierCurveTo(size * 0.3, s * 42 + 20, size * 0.7, s * 42 - 20, size, s * 42);
    ctx.stroke();
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 4, 1, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(bumpCanvas), 4, 1, false, maxAnisotropy);

  return { map, bumpMap };
};

// 5. FAMILY BIO-DOME GEODESIC GLASS & SOLAR GRID TEXTURE
export const createBioDomeGlassTextures = (maxAnisotropy = 4) => {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  // Clear background with faint iridescent emerald/cyan sheen
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.fillRect(0, 0, size, size);

  // Triangular geodesic framework
  const step = 32;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;

  for (let y = 0; y <= size; y += step) {
    for (let x = 0; x <= size; x += step) {
      ctx.strokeRect(x, y, step, step);
      // Diagonal truss
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + step, y + step);
      ctx.stroke();

      // Micro solar collector dots at vertices
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 2, 2, true, maxAnisotropy);
  return { map };
};

// 6. PIONEER EXOSUITS & ARMOR TEXTURE (Kaelen, Maya & Leo)
export const createExoSuitTextures = (maxAnisotropy = 4) => {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Dark carbon-kevlar composite
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Carbon fiber micro-weave diagonal lattice
  for (let i = 0; i < size; i += 4) {
    ctx.fillStyle = i % 8 === 0 ? '#334155' : '#0f172a';
    ctx.fillRect(0, i, size, 2);
    ctx.fillRect(i, 0, 2, size);

    bCtx.fillStyle = i % 8 === 0 ? '#b0b0b0' : '#505050';
    bCtx.fillRect(0, i, size, 2);
    bCtx.fillRect(i, 0, 2, size);
  }

  // Chest Pioneer Emblems & Vitals Gauge
  ctx.fillStyle = '#10b981';
  ctx.fillRect(size / 2 - 30, 20, 60, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('PIONEER-L2', size / 2 - 25, 32);

  // Battery bar level on suit
  ctx.fillStyle = '#22c55e';
  for (let b = 0; b < 5; b++) {
    ctx.fillRect(size / 2 - 24 + b * 10, 42, 7, 5);
  }

  // Hazard diagonal stripes on shoulder pads
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(10 + s * 14, 180, 7, 30);
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 1, 1, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(bumpCanvas), 1, 1, false, maxAnisotropy);

  return { map, bumpMap };
};

// 7. CRYSTAL STAKING VAULTS & QUANTUM MONOLITHS
export const createCrystalVaultTextures = (maxAnisotropy = 4) => {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const eCtx = emissiveCanvas.getContext('2d')!;

  // Deep gemstone color
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, size, size);
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  // Crystalline internal fractures and runic crypto hash etchings
  ctx.lineWidth = 2;
  for (let i = 0; i < 30; i++) {
    const y = i * 17;
    const isCryptoLine = i % 3 === 0;

    if (isCryptoLine) {
      ctx.fillStyle = '#a78bfa';
      ctx.font = '10px monospace';
      ctx.fillText(`0x${(i * 1874291).toString(16).padStart(8, '0')} // PROOF-OF-STAKE`, 20, y);

      eCtx.fillStyle = '#818cf8';
      eCtx.font = '10px monospace';
      eCtx.fillText(`0x${(i * 1874291).toString(16).padStart(8, '0')} // PROOF-OF-STAKE`, 20, y);
    } else {
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + 10);
      ctx.stroke();
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 1, 2, true, maxAnisotropy);
  const emissiveMap = setupTexture(new THREE.CanvasTexture(emissiveCanvas), 1, 2, false, maxAnisotropy);

  return { map, emissiveMap };
};

// 8. CELESTIAL ALIEN SKY DOME / STARFIELD NEBULA TEXTURE
export const createSkyDomeTexture = () => {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep space cosmic backdrop gradient
  const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
  spaceGrad.addColorStop(0, '#020617');
  spaceGrad.addColorStop(0.4, '#090d16');
  spaceGrad.addColorStop(0.7, '#111827');
  spaceGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = spaceGrad;
  ctx.fillRect(0, 0, width, height);

  // Cosmic Nebula Clouds (Aurora & Star Dust)
  const nebulae = [
    { x: 300, y: 150, r: 180, color: 'rgba(56, 189, 248, 0.12)' },
    { x: 750, y: 200, r: 240, color: 'rgba(168, 85, 247, 0.14)' },
    { x: 500, y: 100, r: 160, color: 'rgba(52, 211, 153, 0.12)' },
    { x: 150, y: 300, r: 140, color: 'rgba(251, 191, 36, 0.10)' },
  ];

  nebulae.forEach((n) => {
    const rad = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
    rad.addColorStop(0, n.color);
    rad.addColorStop(1, 'transparent');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);
  });

  // Distant Celestial Gas Giant with Rings (Planet Aetheria Prime)
  const planetX = 820;
  const planetY = 160;
  const planetR = 52;

  // Planet body
  const planetGrad = ctx.createRadialGradient(planetX - 14, planetY - 14, 5, planetX, planetY, planetR);
  planetGrad.addColorStop(0, '#fed7aa');
  planetGrad.addColorStop(0.5, '#ea580c');
  planetGrad.addColorStop(0.8, '#9a3412');
  planetGrad.addColorStop(1, '#431407');
  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
  ctx.fill();

  // Planetary ring
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(-0.35);
  ctx.scale(1, 0.28);
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(253, 186, 116, 0.65)';
  ctx.beginPath();
  ctx.arc(0, 0, planetR * 1.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Thousands of crisp stars
  for (let i = 0; i < 900; i++) {
    const sx = Math.random() * width;
    const sy = Math.random() * (height * 0.85); // Concentrate towards upper sky
    const sr = Math.random() < 0.9 ? 0.6 + Math.random() * 0.9 : 1.8 + Math.random() * 1.2;
    const alpha = 0.3 + Math.random() * 0.7;

    const starColor = Math.random() > 0.3 ? `rgba(255, 255, 255, ${alpha})` : `rgba(186, 230, 253, ${alpha})`;
    ctx.fillStyle = starColor;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};
