import React, { useState, useMemo } from 'react';
import { CandleData } from '../types/crypto';

interface Props {
  candles: CandleData[];
  pair: string;
  currentPrice: number;
}

export const CandleChart: React.FC<Props> = ({ candles, pair, currentPrice }) => {
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  // Compute scale boundaries
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 100 };
    let min = Infinity;
    let max = -Infinity;
    let volMax = 0;

    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > volMax) volMax = c.volume;
    });

    const padding = (max - min) * 0.08;
    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding,
      maxVolume: volMax || 100
    };
  }, [candles]);

  const chartHeight = 360;
  const chartWidth = 720;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = Math.max(4, (chartWidth / (candles.length || 1)) * 0.7);
  const candleGap = chartWidth / (candles.length || 1);

  // Moving Average 14
  const maPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const period = 9;
    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) continue;
      const slice = candles.slice(i - period + 1, i + 1);
      const avg = slice.reduce((acc, c) => acc + c.close, 0) / period;
      const x = i * candleGap + candleGap / 2;
      const y = getY(avg);
      points.push({ x, y });
    }
    return points;
  }, [candles, candleGap, minPrice, maxPrice]);

  const maPath = useMemo(() => {
    if (maPoints.length < 2) return '';
    return maPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [maPoints]);

  return (
    <div className="flex flex-col h-full bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden p-4">
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-100 font-mono tracking-wide">{pair}</span>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ${currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Hover Info Kicker */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mb-2 h-5">
        {hoveredCandle ? (
          <>
            <span>T: <strong className="text-slate-200">{hoveredCandle.time}</strong></span>
            <span>Abert: <strong className="text-slate-200">${hoveredCandle.open}</strong></span>
            <span>Máx: <strong className="text-slate-200">${hoveredCandle.high}</strong></span>
            <span>Mín: <strong className="text-slate-200">${hoveredCandle.low}</strong></span>
            <span>Fech: <strong className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>${hoveredCandle.close}</strong></span>
            <span>Vol: <strong className="text-slate-200">{hoveredCandle.volume}</strong></span>
          </>
        ) : (
          <span className="text-slate-500">Passe o cursor sobre o gráfico para detalhes do candle</span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 min-h-[340px] w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = chartHeight * ratio;
            const priceLevel = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeDasharray="3 3"
                />
                <text
                  x={chartWidth - 5}
                  y={y - 4}
                  textAnchor="end"
                  fill="rgba(148, 163, 184, 0.6)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${priceLevel.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume Bars */}
          {candles.map((candle, idx) => {
            const x = idx * candleGap + (candleGap - candleWidth) / 2;
            const volHeight = (candle.volume / maxVolume) * 60;
            const y = chartHeight - volHeight;
            const isBullish = candle.close >= candle.open;

            return (
              <rect
                key={`vol-${idx}`}
                x={x}
                y={y}
                width={candleWidth}
                height={volHeight}
                fill={isBullish ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 63, 94, 0.2)'}
              />
            );
          })}

          {/* Candlesticks */}
          {candles.map((candle, idx) => {
            const x = idx * candleGap + (candleGap - candleWidth) / 2;
            const centerX = idx * candleGap + candleGap / 2;
            const isBullish = candle.close >= candle.open;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const topY = Math.min(openY, closeY);
            const height = Math.max(2, Math.abs(closeY - openY));

            return (
              <g
                key={`candle-${idx}`}
                onMouseEnter={() => setHoveredCandle(candle)}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-crosshair"
              >
                {/* Wick */}
                <line
                  x1={centerX}
                  y1={highY}
                  x2={centerX}
                  y2={lowY}
                  stroke={isBullish ? '#34D399' : '#F43F5E'}
                  strokeWidth="1.5"
                />
                {/* Body */}
                <rect
                  x={x}
                  y={topY}
                  width={candleWidth}
                  height={height}
                  fill={isBullish ? '#34D399' : '#F43F5E'}
                  rx="1"
                />
              </g>
            );
          })}

          {/* Moving Average Line */}
          {maPath && (
            <path
              d={maPath}
              fill="none"
              stroke="#60A5FA"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
          )}

          {/* Current Price Line */}
          <line
            x1="0"
            y1={getY(currentPrice)}
            x2={chartWidth}
            y2={getY(currentPrice)}
            stroke="#34D399"
            strokeDasharray="4 2"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Bottom Timeline */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
        <span>{candles[0]?.time}</span>
        <span>{candles[Math.floor(candles.length / 2)]?.time}</span>
        <span>{candles[candles.length - 1]?.time}</span>
      </div>
    </div>
  );
};
