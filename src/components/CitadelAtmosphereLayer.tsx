import React from 'react';

interface Props {
  enabled: boolean;
}

export const CitadelAtmosphereLayer: React.FC<Props> = ({ enabled }) => {
  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
      {/* 1. Upper Skyline Flying Car / Sky Shuttle #1 */}
      <div 
        className="absolute top-[28%] left-0 anim-fly-1 will-change-transform z-20 flex items-center"
        style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))' }}
      >
        {/* Plasma Thruster Exhaust Trail */}
        <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-emerald-300 rounded-full blur-[1px] opacity-80" />
        
        {/* Sleek Hover Shuttle Body */}
        <div className="relative -ml-2">
          {/* Main Craft Fuselage */}
          <div className="w-10 h-3.5 bg-gradient-to-r from-slate-200 via-white to-slate-100 rounded-full border border-cyan-300/80 shadow-md flex items-center justify-between px-1.5">
            {/* Cockpit Canopy Glow */}
            <div className="w-4 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_6px_#38bdf8]" />
            {/* Tail Nav Light */}
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
          </div>
          {/* Anti-Gravity Repulsor Underglow */}
          <div className="absolute -bottom-1 left-2 right-2 h-1 bg-cyan-400/90 rounded-full blur-[2px]" />
        </div>
      </div>

      {/* 2. Mid-Skyline Flying Shuttle #2 (Reverse Direction / Right to Left) */}
      <div 
        className="absolute top-[39%] left-0 anim-fly-2 will-change-transform z-20 flex items-center"
        style={{ filter: 'drop-shadow(0 0 7px rgba(251, 191, 36, 0.7))' }}
      >
        {/* Plasma Trail */}
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-400 to-emerald-400 rounded-full blur-[1px] opacity-75" />
        
        {/* Craft Body */}
        <div className="relative -ml-2">
          <div className="w-12 h-4 bg-gradient-to-r from-slate-100 via-white to-slate-300 rounded-full border border-amber-300/70 shadow-md flex items-center justify-between px-2">
            <div className="w-5 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]" />
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 left-3 right-3 h-1 bg-amber-400/80 rounded-full blur-[2px]" />
        </div>
      </div>

      {/* 3. Distant High-Altitude Autonomous Sky Cruiser #3 */}
      <div 
        className="absolute top-[18%] left-0 anim-fly-3 will-change-transform z-10 flex items-center opacity-85"
        style={{ filter: 'drop-shadow(0 0 5px rgba(129, 140, 248, 0.8))' }}
      >
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-indigo-400 rounded-full opacity-60" />
        <div className="relative -ml-1">
          <div className="w-6 h-2 bg-white/90 rounded-full border border-indigo-300/60 shadow-sm flex items-center px-1">
            <div className="w-2.5 h-1 bg-indigo-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* 4. Maglev Bullet Monorail Train Gliding on Waterfall Bridge */}
      <div 
        className="absolute top-[67%] left-0 w-full anim-maglev will-change-transform z-25 flex items-center"
        style={{ filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.8))' }}
      >
        {/* Streamlined Maglev Train Pods */}
        <div className="flex items-center gap-0.5 bg-slate-900/90 border border-emerald-400/70 px-2 py-0.5 rounded-full shadow-lg">
          {/* Headlight beam */}
          <div className="w-2 h-1 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
          {/* Passenger Windows */}
          <div className="flex gap-1 px-1">
            <div className="w-3 h-1 bg-emerald-400 rounded-sm" />
            <div className="w-3 h-1 bg-cyan-400 rounded-sm" />
            <div className="w-3 h-1 bg-emerald-400 rounded-sm" />
          </div>
          {/* Magnetic Levitation Track Glow */}
          <div className="w-1.5 h-1 bg-amber-400 rounded-full animate-ping" />
        </div>
      </div>

      {/* 5. Holographic Rotating Energy Rings around the Central DeFi Matching Spire */}
      <div 
        className="absolute top-[17%] left-[58%] -translate-x-1/2 w-48 h-48 pointer-events-none z-15 flex items-center justify-center opacity-90"
        style={{ perspective: '800px' }}
      >
        {/* Ring 1 (Tilted Clockwise Spin) */}
        <div 
          className="absolute w-36 h-36 rounded-full border-[1.5px] border-amber-400/60 border-dashed anim-ring-1"
          style={{ transform: 'rotateX(72deg)' }}
        >
          {/* Orbital Light Node */}
          <div className="w-2.5 h-2.5 bg-amber-300 rounded-full shadow-[0_0_10px_#f59e0b] -top-1 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* Ring 2 (Larger Counter-Clockwise Spin) */}
        <div 
          className="absolute w-44 h-44 rounded-full border border-cyan-400/50 anim-ring-2"
          style={{ transform: 'rotateX(74deg)' }}
        >
          <div className="w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_8px_#06b6d4] -bottom-1 left-1/3 absolute" />
        </div>

        {/* Central Spire Energy Core Flare */}
        <div className="w-8 h-8 rounded-full bg-amber-400/20 blur-md animate-pulse" />
      </div>

      {/* 6. Ascending Crypto Data Hologram Packets */}
      <div className="absolute top-[28%] left-[57%] z-15 flex flex-col gap-2 pointer-events-none">
        <div className="anim-data-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-emerald-400/40 text-[9px] font-mono text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]">
          ▲ 250k TPS · 0.34ms
        </div>
        <div className="anim-data-2 px-1.5 py-0.5 rounded bg-slate-900/80 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.5)] -ml-6">
          zk-PROOF VERIFIED
        </div>
        <div className="anim-data-3 px-1.5 py-0.5 rounded bg-slate-900/80 border border-amber-400/40 text-[9px] font-mono text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)] ml-4">
          BTC / USDT $67.8K
        </div>
      </div>

      {/* 7. Holographic Screen Scanner over Ethereum Display on Right Spire */}
      <div className="absolute top-[43%] right-[3%] w-24 h-36 rounded-xl border border-emerald-500/20 pointer-events-none overflow-hidden z-15">
        {/* Sweeping Laser Scanline */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] anim-scanline" />
      </div>

      {/* 8. Waterfall Liquidity Ambient Shimmer Particles */}
      <div className="absolute bottom-[18%] left-[44%] w-32 h-16 pointer-events-none z-10 flex items-center justify-around opacity-60">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="w-1 h-1 rounded-full bg-white animate-ping" style={{ animationDelay: '1.4s' }} />
      </div>
    </div>
  );
};
