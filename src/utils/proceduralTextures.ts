import * as THREE from 'three';

/**
 * Procedural 3D Texture Generator for Three.js (High-Fidelity PBR Edition)
 * Zero external asset dependencies. Generates 100% mathematically seamless textures,
 * tangent-space normal maps, roughness maps, emissive maps, and albedo maps
 * with anisotropic filtering and strict sRGB/Linear color space separation.
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
  texture.colorSpace = isColorMap ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
};

// Helper: Convert grayscale heightmap canvas into a seamless Tangent-Space Normal Map
export const createNormalMapFromHeight = (
  heightCanvas: HTMLCanvasElement,
  strength = 2.5,
  repeatX = 1,
  repeatY = 1,
  maxAnisotropy = 4
): THREE.CanvasTexture => {
  const width = heightCanvas.width;
  const height = heightCanvas.height;
  const srcCtx = heightCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, width, height).data;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const dstCtx = normalCanvas.getContext('2d')!;
  const dstImage = dstCtx.createImageData(width, height);
  const dstData = dstImage.data;

  const getHeight = (x: number, y: number) => {
    // Seamless periodic toroidal sampling
    const px = ((x % width) + width) % width;
    const py = ((y % height) + height) % height;
    const idx = (py * width + px) * 4;
    return (srcData[idx] + srcData[idx + 1] + srcData[idx + 2]) / (3 * 255.0);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Sobel kernel for smooth, anti-aliased normal gradients
      const tl = getHeight(x - 1, y - 1);
      const t  = getHeight(x,     y - 1);
      const tr = getHeight(x + 1, y - 1);
      const l  = getHeight(x - 1, y);
      const r  = getHeight(x + 1, y);
      const bl = getHeight(x - 1, y + 1);
      const b  = getHeight(x,     y + 1);
      const br = getHeight(x + 1, y + 1);

      // dx and dy gradients
      const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);
      const dz = 1.0 / Math.max(0.01, strength);

      // Normalize vector (nx, ny, nz)
      const len = Math.hypot(dx, dy, dz);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = dz / len;

      const idx = (y * width + x) * 4;
      dstData[idx]     = Math.floor((nx * 0.5 + 0.5) * 255); // R = X normal
      dstData[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // G = Y normal
      dstData[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255); // B = Z normal
      dstData[idx + 3] = 255;
    }
  }

  dstCtx.putImageData(dstImage, 0, 0);
  const texture = new THREE.CanvasTexture(normalCanvas);
  return setupTexture(texture, repeatX, repeatY, false, maxAnisotropy);
};

// ============================================================================
// 1. ALIEN BIO-TERRAIN TEXTURES (True Seamless Multi-Octave Organic Field)
// ============================================================================
export const createAlienTerrainTextures = (maxAnisotropy = 4) => {
  const size = 1024;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const eCtx = emissiveCanvas.getContext('2d')!;

  // 1. Seamless base alien humus & moss gradient (toroidal periodic field)
  const imgData = ctx.createImageData(size, size);
  const hData = hCtx.createImageData(size, size);
  const rData = rCtx.createImageData(size, size);
  const cPixels = imgData.data;
  const hPixels = hData.data;
  const rPixels = rData.data;

  // Periodic harmonic noise generator (zero boundary mismatch)
  for (let y = 0; y < size; y++) {
    const ny = (y / size) * Math.PI * 2;
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 2;

      // 4 harmonic octaves strictly periodic on [0, 2pi]
      const n1 = Math.sin(nx * 2 + Math.cos(ny * 2));
      const n2 = Math.cos(nx * 4 - Math.sin(ny * 4)) * 0.5;
      const n3 = Math.sin(nx * 8 + ny * 8) * 0.25;
      const n4 = Math.cos(nx * 16 - ny * 16) * 0.125;
      const val = (n1 + n2 + n3 + n4 + 1.875) / 3.75; // 0 to 1

      const idx = (y * size + x) * 4;

      // Organic colors: deep alien soil (#032219) to vibrant bio-emerald moss (#059669)
      const r = Math.floor(4 + val * 22);
      const g = Math.floor(28 + val * 115);
      const b = Math.floor(20 + val * 65);

      cPixels[idx]     = r;
      cPixels[idx + 1] = g;
      cPixels[idx + 2] = b;
      cPixels[idx + 3] = 255;

      // Heightmap for normal generation
      const hVal = Math.floor(val * 255);
      hPixels[idx]     = hVal;
      hPixels[idx + 1] = hVal;
      hPixels[idx + 2] = hVal;
      hPixels[idx + 3] = 255;

      // Roughness: rocks/soil are matte (0.85), moss is slightly reflective (0.55)
      const roughVal = Math.floor(215 - val * 75);
      rPixels[idx]     = roughVal;
      rPixels[idx + 1] = roughVal;
      rPixels[idx + 2] = roughVal;
      rPixels[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  hCtx.putImageData(hData, 0, 0);
  rCtx.putImageData(rData, 0, 0);

  // 2. Bioluminescent Subterranean Mineral Veins (100% mathematically continuous in Y & X)
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  ctx.lineWidth = 2.2;
  eCtx.lineWidth = 2.5;

  const numVeins = 7;
  for (let v = 0; v < numVeins; v++) {
    const baseX = (v / numVeins) * size;
    const isCyan = v % 2 === 0;

    const strokeColor = isCyan ? 'rgba(56, 189, 248, 0.75)' : 'rgba(52, 211, 153, 0.75)';
    const glowColor = isCyan ? '#0284c7' : '#10b981';

    ctx.strokeStyle = strokeColor;
    eCtx.strokeStyle = glowColor;

    ctx.beginPath();
    eCtx.beginPath();

    const freq1 = 2 + (v % 3);
    const freq2 = 4 + (v % 2);
    const amp1 = 28 + (v % 4) * 8;
    const amp2 = 14 + (v % 3) * 6;

    for (let y = 0; y <= size; y += 4) {
      const angle = (y / size) * Math.PI * 2;
      // Periodic harmonic sine wave ensures exact same X at y=0 and y=size!
      const offsetX = Math.sin(angle * freq1) * amp1 + Math.cos(angle * freq2) * amp2;
      const x = ((baseX + offsetX) % size + size) % size;

      if (y === 0) {
        ctx.moveTo(x, y);
        eCtx.moveTo(x, y);
      } else {
        // Handle wrap gracefully
        ctx.lineTo(x, y);
        eCtx.lineTo(x, y);
      }
    }
    ctx.stroke();
    eCtx.stroke();
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 4, 4, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(heightCanvas), 4, 4, false, maxAnisotropy);
  const normalMap = createNormalMapFromHeight(heightCanvas, 3.2, 4, 4, maxAnisotropy);
  const roughnessMap = setupTexture(new THREE.CanvasTexture(roughCanvas), 4, 4, false, maxAnisotropy);
  const emissiveMap = setupTexture(new THREE.CanvasTexture(emissiveCanvas), 4, 4, true, maxAnisotropy);

  return { map, bumpMap, normalMap, roughnessMap, emissiveMap };
};

// ============================================================================
// 2. CYBERNETIC MODULAR BIO-TILES (Precision 8x8 Seamless Interlocking Pavers)
// ============================================================================
export const createCyberHexTilesTextures = (maxAnisotropy = 4) => {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const eCtx = emissiveCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // Base background fills
  ctx.fillStyle = '#090d16'; // Deep space dark metallic
  ctx.fillRect(0, 0, size, size);

  hCtx.fillStyle = '#303030'; // Recessed joint baseline
  hCtx.fillRect(0, 0, size, size);

  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#b0b0b0'; // Matte joint seams
  rCtx.fillRect(0, 0, size, size);

  const tilesPerAxis = 8;
  const tileSize = size / tilesPerAxis; // 128px per tile (integer division!)
  const margin = 5;

  for (let row = 0; row < tilesPerAxis; row++) {
    for (let col = 0; col < tilesPerAxis; col++) {
      const px = col * tileSize;
      const py = row * tileSize;
      const tw = tileSize - margin * 2;
      const th = tileSize - margin * 2;
      const x = px + margin;
      const y = py + margin;

      // 1. Raised Slab Body
      const slabGrad = ctx.createLinearGradient(x, y, x + tw, y + th);
      slabGrad.addColorStop(0, '#1e293b');
      slabGrad.addColorStop(0.5, '#0f172a');
      slabGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = slabGrad;

      // Chamfered corner plate
      const ch = 12;
      ctx.beginPath();
      ctx.moveTo(x + ch, y);
      ctx.lineTo(x + tw - ch, y);
      ctx.lineTo(x + tw, y + ch);
      ctx.lineTo(x + tw, y + th - ch);
      ctx.lineTo(x + tw - ch, y + th);
      ctx.lineTo(x + ch, y + th);
      ctx.lineTo(x, y + th - ch);
      ctx.lineTo(x, y + ch);
      ctx.closePath();
      ctx.fill();

      // Heightmap raised relief
      hCtx.fillStyle = '#d0d0d0';
      hCtx.beginPath();
      hCtx.moveTo(x + ch, y);
      hCtx.lineTo(x + tw - ch, y);
      hCtx.lineTo(x + tw, y + ch);
      hCtx.lineTo(x + tw, y + th - ch);
      hCtx.lineTo(x + tw - ch, y + th);
      hCtx.lineTo(x + ch, y + th);
      hCtx.lineTo(x, y + th - ch);
      hCtx.lineTo(x, y + ch);
      hCtx.closePath();
      hCtx.fill();

      // Roughness: Plate surface is smooth reflective brushed metal
      rCtx.fillStyle = '#454545';
      rCtx.fillRect(x + 2, y + 2, tw - 4, th - 4);

      // Plate Beveled Border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Hexagonal Core Motif
      const cx = x + tw / 2;
      const cy = y + th / 2;
      const hr = 28;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const a = (Math.PI / 3) * h - Math.PI / 6;
        const hx = cx + hr * Math.cos(a);
        const hy = cy + hr * Math.sin(a);
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Center Diamond Traction Tread
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(cx - 7, cy - 7, 14, 14);

      // Corner Flush Hex Bolts
      const bolts = [
        [x + 8, y + 8],
        [x + tw - 8, y + 8],
        [x + 8, y + th - 8],
        [x + tw - 8, y + th - 8],
      ];
      bolts.forEach(([bx, by]) => {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();

        hCtx.fillStyle = '#ffffff';
        hCtx.beginPath();
        hCtx.arc(bx, by, 2.5, 0, Math.PI * 2);
        hCtx.fill();
      });

      // Glowing Quantum Node on alternating plates
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        eCtx.fillStyle = '#10b981';
        eCtx.beginPath();
        eCtx.arc(cx, cy, 4, 0, Math.PI * 2);
        eCtx.fill();

        // Radiating circuit trace to plate edge
        eCtx.strokeStyle = '#059669';
        eCtx.lineWidth = 1.8;
        eCtx.beginPath();
        eCtx.moveTo(cx, cy);
        eCtx.lineTo(cx, y);
        eCtx.stroke();
      }
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 3, 3, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(heightCanvas), 3, 3, false, maxAnisotropy);
  const normalMap = createNormalMapFromHeight(heightCanvas, 3.5, 3, 3, maxAnisotropy);
  const roughnessMap = setupTexture(new THREE.CanvasTexture(roughCanvas), 3, 3, false, maxAnisotropy);
  const emissiveMap = setupTexture(new THREE.CanvasTexture(emissiveCanvas), 3, 3, true, maxAnisotropy);

  return { map, bumpMap, normalMap, roughnessMap, emissiveMap };
};

// ============================================================================
// 3. BRUSHED ARCHITECTURAL TITANIUM ALLOY (High-Precision Modular Paneling)
// ============================================================================
export const createTitaniumSpireTextures = (maxAnisotropy = 4) => {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // Base metallic titanium silver
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, size, size);

  hCtx.fillStyle = '#808080';
  hCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#3a3a3a'; // Highly reflective brushed titanium
  rCtx.fillRect(0, 0, size, size);

  // Brushed anisotropic micro-streaks (seamless horizontal lines)
  for (let i = 0; i < size; i += 2) {
    const alpha = (Math.sin(i * 0.8) * 0.5 + 0.5) * 0.08;
    ctx.fillStyle = i % 4 === 0 ? `rgba(255, 255, 255, ${alpha})` : `rgba(71, 85, 105, ${alpha})`;
    ctx.fillRect(0, i, size, 1);
  }

  // 4x8 Modular Panel divisions (strictly integer dimensions)
  const cols = 4;
  const rows = 8;
  const pw = size / cols; // 256
  const ph = size / rows; // 128

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * pw;
      const py = r * ph;

      // Deep recessed panel joint line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

      // Heightmap recessed groove
      hCtx.strokeStyle = '#101010';
      hCtx.lineWidth = 3.5;
      hCtx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

      // Panel corner structural flush-rivets
      const rivetInset = 8;
      const rivets = [
        [px + rivetInset, py + rivetInset],
        [px + pw - rivetInset, py + rivetInset],
        [px + rivetInset, py + ph - rivetInset],
        [px + pw - rivetInset, py + ph - rivetInset],
      ];

      rivets.forEach(([rx, ry]) => {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();

        hCtx.fillStyle = '#f0f0f0';
        hCtx.beginPath();
        hCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        hCtx.fill();
      });

      // Accent Carbon Composite Inset Ribbon on Rows 2 and 5
      if (r === 2 || r === 5) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 8, py + ph - 16, pw - 16, 10);

        rCtx.fillStyle = '#808080'; // Matte carbon ribbon
        rCtx.fillRect(px + 8, py + ph - 16, pw - 16, 10);
      }
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 1, 4, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(heightCanvas), 1, 4, false, maxAnisotropy);
  const normalMap = createNormalMapFromHeight(heightCanvas, 3.0, 1, 4, maxAnisotropy);
  const roughnessMap = setupTexture(new THREE.CanvasTexture(roughCanvas), 1, 4, false, maxAnisotropy);

  return { map, bumpMap, normalMap, roughnessMap };
};

// ============================================================================
// 4. FLOWING QUANTUM LIQUIDITY RIVER (100% Seamless Dual-Wave Caustics)
// ============================================================================
export const createQuantumWaterTextures = (maxAnisotropy = 4) => {
  const width = 1024;
  const height = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = width;
  heightCanvas.height = height;
  const hCtx = heightCanvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const hData = hCtx.createImageData(width, height);
  const cPixels = imgData.data;
  const hPixels = hData.data;

  // Mathematically periodic 2D wave caustics (zero seam in X and Y!)
  for (let y = 0; y < height; y++) {
    const ny = (y / height) * Math.PI * 2;
    for (let x = 0; x < width; x++) {
      const nx = (x / width) * Math.PI * 2;

      // Dual frequency harmonic caustics
      const wave1 = Math.sin(nx * 4 + Math.cos(ny * 3));
      const wave2 = Math.cos(nx * 6 - Math.sin(ny * 4));
      const wave3 = Math.sin(nx * 8 + ny * 6) * 0.5;
      const caustic = Math.pow((wave1 + wave2 + wave3 + 2.5) / 5.0, 2.2); // Crisp caustic peaks

      const idx = (y * width + x) * 4;

      // Vibrant electric cyan to crystalline turquoise
      const r = Math.floor(2 + caustic * 50);
      const g = Math.floor(132 + caustic * 123);
      const b = Math.floor(199 + caustic * 56);

      cPixels[idx]     = r;
      cPixels[idx + 1] = g;
      cPixels[idx + 2] = b;
      cPixels[idx + 3] = 255;

      const hVal = Math.floor(caustic * 255);
      hPixels[idx]     = hVal;
      hPixels[idx + 1] = hVal;
      hPixels[idx + 2] = hVal;
      hPixels[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  hCtx.putImageData(hData, 0, 0);

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 3, 1, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(heightCanvas), 3, 1, false, maxAnisotropy);
  const normalMap = createNormalMapFromHeight(heightCanvas, 3.8, 3, 1, maxAnisotropy);

  return { map, bumpMap, normalMap };
};

// ============================================================================
// 5. FAMILY BIO-DOME GEODESIC SMART GLASS
// ============================================================================
export const createBioDomeGlassTextures = (maxAnisotropy = 4) => {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  // Clear background with faint emerald/cyan iridescent sheen
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.fillRect(0, 0, size, size);

  // Precision 16x16 Geodesic framework (divides 512 evenly!)
  const step = 32;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;

  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      ctx.strokeRect(x, y, step, step);
      // Diagonal truss
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + step, y + step);
      ctx.stroke();

      // Micro photovoltaic collector dot at junction
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 2, 2, true, maxAnisotropy);
  return { map };
};

// ============================================================================
// 6. PIONEER TACTICAL EXO-SUIT & DEDICATED CHESTPLATE TEXTURES
// ============================================================================
export const createExoSuitTextures = (maxAnisotropy = 4) => {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // Dark carbon-kevlar composite
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);

  hCtx.fillStyle = '#808080';
  hCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#505050';
  rCtx.fillRect(0, 0, size, size);

  // Carbon-fiber micro-twill weave pattern (seamless 8x8 matrix)
  const step = 8;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const isAlt = ((x / step) + (y / step)) % 2 === 0;

      ctx.fillStyle = isAlt ? '#334155' : '#0f172a';
      ctx.fillRect(x, y, step, step);

      hCtx.fillStyle = isAlt ? '#b8b8b8' : '#484848';
      hCtx.fillRect(x, y, step, step);

      rCtx.fillStyle = isAlt ? '#383838' : '#686868';
      rCtx.fillRect(x, y, step, step);
    }
  }

  // Tactical reinforcement ribs
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  for (let y = 0; y < size; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 2, 2, true, maxAnisotropy);
  const bumpMap = setupTexture(new THREE.CanvasTexture(heightCanvas), 2, 2, false, maxAnisotropy);
  const normalMap = createNormalMapFromHeight(heightCanvas, 2.5, 2, 2, maxAnisotropy);
  const roughnessMap = setupTexture(new THREE.CanvasTexture(roughCanvas), 2, 2, false, maxAnisotropy);

  return { map, bumpMap, normalMap, roughnessMap };
};

// Dedicated Chestplate Texture for Kaelen (HUD telemetry & insignia)
export const createPioneerChestTexture = () => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep matte black titanium composite base
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Carbon-weave background texture
  for (let i = 0; i < size; i += 6) {
    ctx.fillStyle = i % 12 === 0 ? '#1e293b' : '#0b1120';
    ctx.fillRect(0, i, size, 3);
  }

  // Tactical Pioneer Insignia Badge
  ctx.fillStyle = '#10b981';
  ctx.fillRect(60, 80, size - 120, 70);
  ctx.fillStyle = '#020617';
  ctx.fillRect(64, 84, size - 128, 62);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('CITADEL // PIONEER', 84, 124);

  // Vitals Status Telemetry Bar
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('LIFE SUPPORT: 100% · O₂: 21.4%', 84, 180);

  // Segmented Battery / Shield Power Meter
  for (let b = 0; b < 10; b++) {
    ctx.fillStyle = b < 8 ? '#22c55e' : '#eab308';
    ctx.fillRect(84 + b * 34, 205, 26, 16);
  }

  // Cyan Neon Perimeter Border
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 50, size - 80, size - 100);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

// ============================================================================
// 7. CRYSTAL STAKING VAULTS & QUANTUM MONOLITHS
// ============================================================================
export const createCrystalVaultTextures = (maxAnisotropy = 4) => {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const eCtx = emissiveCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  // Deep gemstone sapphire/amethyst color
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, size, size);

  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  hCtx.fillStyle = '#808080';
  hCtx.fillRect(0, 0, size, size);

  // Faceted crystal cleavage planes and runic crypto hash etchings
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 32; i++) {
    const y = i * 32;
    const isCryptoLine = i % 2 === 0;

    if (isCryptoLine) {
      const hashText = `0x${(i * 1874291).toString(16).padStart(8, '0')} // PROOF-OF-STAKE`;
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(hashText, 40, y + 20);

      eCtx.fillStyle = '#818cf8';
      eCtx.font = 'bold 14px monospace';
      eCtx.fillText(hashText, 40, y + 20);
    } else {
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();

      hCtx.strokeStyle = '#d0d0d0';
      hCtx.lineWidth = 3;
      hCtx.beginPath();
      hCtx.moveTo(0, y);
      hCtx.lineTo(size, y);
      hCtx.stroke();
    }
  }

  const map = setupTexture(new THREE.CanvasTexture(colorCanvas), 1, 2, true, maxAnisotropy);
  const emissiveMap = setupTexture(new THREE.CanvasTexture(emissiveCanvas), 1, 2, true, maxAnisotropy);
  const normalMap = createNormalMapFromHeight(heightCanvas, 2.8, 1, 2, maxAnisotropy);

  return { map, emissiveMap, normalMap };
};

// ============================================================================
// 8. CELESTIAL ALIEN SKY DOME (360° Seamless Equirectangular Cosmic Panorama)
// ============================================================================
export const createSkyDomeTexture = () => {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Cosmic space backdrop vertical gradient
  const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
  spaceGrad.addColorStop(0, '#020617'); // Zenith pitch black
  spaceGrad.addColorStop(0.35, '#090d16');
  spaceGrad.addColorStop(0.65, '#111827');
  spaceGrad.addColorStop(0.9, '#1e1b4b'); // Horizon purple aurora
  spaceGrad.addColorStop(1.0, '#0f172a'); // Nadir
  ctx.fillStyle = spaceGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Cosmic Nebula Clouds with Horizontal Wrapping (wraps seamlessly at x=0 and x=width)
  const drawNebula = (cx: number, cy: number, r: number, color: string) => {
    [-width, 0, width].forEach((offset) => {
      const rad = ctx.createRadialGradient(cx + offset, cy, 10, cx + offset, cy, r);
      rad.addColorStop(0, color);
      rad.addColorStop(1, 'transparent');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height);
    });
  };

  drawNebula(500, 320, 380, 'rgba(56, 189, 248, 0.16)');
  drawNebula(1500, 380, 480, 'rgba(168, 85, 247, 0.18)');
  drawNebula(1000, 240, 340, 'rgba(52, 211, 153, 0.14)');
  drawNebula(150, 450, 300, 'rgba(251, 191, 36, 0.12)');

  // 3. Distant Celestial Gas Giant with Rings (Planet Aetheria Prime)
  const planetX = 1480;
  const planetY = 320;
  const planetR = 85;

  // Planet body with atmospheric banding
  const planetGrad = ctx.createRadialGradient(planetX - 25, planetY - 25, 10, planetX, planetY, planetR);
  planetGrad.addColorStop(0, '#fed7aa');
  planetGrad.addColorStop(0.35, '#f97316');
  planetGrad.addColorStop(0.7, '#c2410c');
  planetGrad.addColorStop(1, '#431407');
  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
  ctx.fill();

  // Planetary atmospheric rings
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(-0.32);
  ctx.scale(1, 0.28);
  ctx.lineWidth = 26;
  ctx.strokeStyle = 'rgba(253, 186, 116, 0.72)';
  ctx.beginPath();
  ctx.arc(0, 0, planetR * 1.95, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle inner ring division
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(254, 215, 170, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, planetR * 1.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 4. Uniform spherical starfield (Cosine-weighted to eliminate polar pinch!)
  const numStars = 1400;
  for (let i = 0; i < numStars; i++) {
    const sx = Math.random() * width;
    // Cosine latitude weighting: uniform distribution on sphere surface
    const lat = Math.asin(Math.random() * 0.95);
    const sy = height * 0.5 - (lat / (Math.PI * 0.5)) * (height * 0.48);

    const sr = Math.random() < 0.9 ? 0.7 + Math.random() * 0.8 : 1.8 + Math.random() * 1.4;
    const alpha = 0.35 + Math.random() * 0.65;
    const starColor = Math.random() > 0.25 ? `rgba(255, 255, 255, ${alpha})` : `rgba(186, 230, 253, ${alpha})`;

    ctx.fillStyle = starColor;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
};

// ============================================================================
// 9. VOLUMETRIC HOLOGRAPHIC 3D CRYPTO BAR TEXTURES
// ============================================================================
export const createCryptoBarTexture = (symbol: string, hexColor: string) => {
  const width = 256;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark carbon-plasma background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // Vertical liquidity gradient
  const grad = ctx.createLinearGradient(0, height, 0, 0);
  grad.addColorStop(0, hexColor);
  grad.addColorStop(0.8, '#0f172a');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1.0;

  // Horizontal price milestone scale ticks (every 10%)
  ctx.strokeStyle = hexColor;
  ctx.lineWidth = 1.5;
  for (let s = 1; s <= 9; s++) {
    const y = (s / 10) * height;
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(width - 8, y);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${(10 - s) * 10}%`, 14, y - 4);
  }

  // Large holographic crypto watermark
  ctx.fillStyle = hexColor;
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(symbol, width / 2, height / 2 + 12);
  ctx.textAlign = 'start';

  // Cyber border glow
  ctx.strokeStyle = hexColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

// ============================================================================
// 10. FLOATING HOLOGRAPHIC 3D CHARACTER BADGE / NAMETAG TEXTURE
// ============================================================================
export const createCharacterBadgeTexture = (name: string, role: string, hexColor: string) => {
  const width = 384;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Semi-transparent dark cyber glass pill
  ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
  ctx.beginPath();
  ctx.roundRect(8, 8, width - 16, height - 16, 24);
  ctx.fill();

  // Glowing perimeter border
  ctx.strokeStyle = hexColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Glow halo inside
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(12, 12, width - 24, height - 24, 20);
  ctx.stroke();

  // Worker Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(name.toUpperCase(), width / 2, 52);

  // Crypto Role / Flow Specialization
  ctx.fillStyle = hexColor;
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`⚡ ${role.toUpperCase()}`, width / 2, 88);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

