import React, { useState } from 'react';
import { DonutSlice } from '../../../types';
import { PieChart as PieIcon, Info } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  slices: DonutSlice[];
  centerTitle?: string;
  centerSubtitle?: string;
  height?: number;
}

export const AdminPieChart: React.FC<Props> = ({
  title,
  subtitle,
  slices,
  centerTitle,
  centerSubtitle = 'Total',
  height = 220,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = slices.reduce((sum, s) => sum + s.value, 0);

  if (totalValue === 0 || slices.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-center items-center h-full text-center text-slate-400">
        <PieIcon className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-xs">No distribution data available</p>
      </div>
    );
  }

  // Donut geometry constants
  const size = 180;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for each slice
  let accumulatedAngle = 0;
  const sliceArcs = slices.map((slice, index) => {
    const fraction = slice.value / totalValue;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;

    return {
      slice,
      index,
      strokeDasharray,
      strokeDashoffset,
      isHovered: hoveredIndex === index,
    };
  });

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <span className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer" title="Calculated from real-time pipeline">
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Donut and Center Statistic */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-5 pb-2">
          <div className="relative w-[180px] h-[180px] shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90 overflow-visible"
            >
              {sliceArcs.map((arc) => (
                <circle
                  key={arc.slice.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={arc.slice.color}
                  strokeWidth={arc.isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-200 cursor-pointer origin-center"
                  onMouseEnter={() => setHoveredIndex(arc.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    filter: arc.isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none',
                  }}
                />
              ))}
            </svg>

            {/* Center Label inside Donut Hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              {activeSlice ? (
                <>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[90px]">
                    {activeSlice.label}
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono mt-0.5">
                    {activeSlice.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium">
                    {activeSlice.formattedValue || activeSlice.value}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    {centerSubtitle}
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono mt-0.5">
                    {centerTitle || totalValue}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {slices.length} segments
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="flex-1 w-full space-y-2">
            {slices.map((slice, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={slice.label}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isHovered
                      ? 'bg-slate-100 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="truncate text-[11px] text-slate-800">
                      {slice.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    {slice.formattedValue && (
                      <span className="text-slate-500 text-[10px]">
                        {slice.formattedValue}
                      </span>
                    )}
                    <span className="font-bold text-slate-900 text-xs px-1.5 py-0.5 rounded-xs bg-slate-100">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 text-center">
        Hover any segment or item to inspect exact breakdown
      </div>
    </div>
  );
};
