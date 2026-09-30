import React, { useState } from 'react';
import { TimeframeSlicer, TrendDataPoint } from '../../../types';
import { formatBDT } from '../../../data/bangladeshGeo';
import { TrendingUp, Calendar, BarChart3, ArrowUpRight, DollarSign, Package } from 'lucide-react';

interface Props {
  timeframe: TimeframeSlicer;
  onTimeframeChange: (tf: TimeframeSlicer) => void;
  data: TrendDataPoint[];
}

export const AdminSalesTrendChart: React.FC<Props> = ({
  timeframe,
  onTimeframeChange,
  data,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 border border-[#E2E8F0] rounded-xl text-center text-slate-500 py-12">
        No sales data available for this timeframe.
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const totalRevenueInPeriod = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrdersInPeriod = data.reduce((sum, d) => sum + d.orders, 0);
  const avgRevenuePerPoint = Math.round(totalRevenueInPeriod / data.length);

  // SVG Chart Dimensions
  const svgWidth = 720;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 45;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (d.revenue / maxRevenue) * plotHeight;
    return { x, y, data: d, index: i };
  });

  // Construct Area Path and Line Path
  const linePath = points.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // Smooth cubic bezier curve
    const prev = points[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + plotHeight
  } L ${points[0].x} ${paddingTop + plotHeight} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
      {/* Chart Header & Interactive Slicers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Sales &amp; Revenue Trend
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +18.4%
                </span>
              </h3>
              <p className="text-xs text-slate-700">
                Revenue in BDT and order volume over selected period
              </p>
            </div>
          </div>
        </div>

        {/* Time Slicer Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => onTimeframeChange('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              timeframe === 'day'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day-wise
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              timeframe === 'week'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              timeframe === 'month'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('year')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              timeframe === 'year'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Mini metric strip for selected period */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Period Revenue
          </span>
          <span className="text-base font-bold text-slate-900 font-mono">
            {formatBDT(totalRevenueInPeriod)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Period Orders
          </span>
          <span className="text-base font-bold text-slate-900 font-mono">
            {totalOrdersInPeriod} orders
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Avg / {timeframe === 'day' ? 'Day' : timeframe === 'week' ? 'Week' : timeframe === 'month' ? 'Month' : 'Year'}
          </span>
          <span className="text-base font-bold text-slate-700 font-mono">
            {formatBDT(avgRevenuePerPoint)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Peak Point
          </span>
          <span className="text-base font-bold text-emerald-700 font-mono">
            {formatBDT(maxRevenue)}
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[300px] overflow-visible"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#0F172A" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + plotHeight * (1 - ratio);
            const val = Math.round(maxRevenue * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94A3B8"
                  fontFamily="monospace"
                >
                  ৳{val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Order volume bars in the background */}
          {points.map((pt, i) => {
            const barWidth = Math.min(24, Math.max(8, (plotWidth / data.length) * 0.45));
            const barHeight = Math.max(4, (pt.data.orders / Math.max(...data.map((d) => d.orders), 1)) * (plotHeight * 0.45));
            const barY = paddingTop + plotHeight - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <rect
                key={`bar-${i}`}
                x={pt.x - barWidth / 2}
                y={barY}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill="url(#barGradient)"
                opacity={isHovered ? 0.9 : 0.45}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Area under curve */}
          <path d={areaPath} fill="url(#revenueGradient)" />

          {/* Line curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={`pt-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible larger hit area for easy hover on mobile/desktop */}
                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                {/* Visible node circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#E11D48' : '#0F172A'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* X-axis Label */}
                <text
                  x={pt.x}
                  y={paddingTop + plotHeight + 18}
                  textAnchor="middle"
                  fontSize={data.length > 12 ? '8.5' : '10'}
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#0F172A' : '#64748B'}
                >
                  {pt.data.label}
                </text>
              </g>
            );
          })}

          {/* Vertical crosshair guide on hover */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={paddingTop + plotHeight}
              stroke="#E11D48"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
          )}
        </svg>

        {/* Hover Tooltip Card */}
        {activePoint && (
          <div
            className="absolute z-10 pointer-events-none bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700 transition-all duration-100 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: `${(activePoint.y / svgHeight) * 100}%`,
              marginTop: '-12px',
            }}
          >
            <div className="font-bold text-amber-300 text-[11px] pb-1 border-b border-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>{activePoint.data.label} {activePoint.data.subLabel ? `(${activePoint.data.subLabel})` : ''}</span>
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-[10px]">Revenue:</span>
                <span className="font-mono font-bold text-white">
                  {formatBDT(activePoint.data.revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-[10px]">Orders:</span>
                <span className="font-mono font-bold text-blue-300">
                  {activePoint.data.orders} orders
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-[10px]">Units:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {activePoint.data.units} units
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 pt-3 mt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-1 bg-[#0F172A] rounded-full"></div>
          <span className="font-medium">Gross Revenue (BDT)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600/70 rounded-xs"></div>
          <span className="font-medium">Order Volume (Count)</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-700">
          <span>&bull; Hover any node for instant figures</span>
        </div>
      </div>
    </div>
  );
};
