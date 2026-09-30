import React, { useState } from 'react';
import { DonutSlice } from '../../../types';
import { PieChart as PieIcon, Info } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  slices: DonutSlice[];
  centerTitle?: string;
  centerSubtitle?: string;
}

export const AdminPieChart: React.FC<Props> = ({
  title,
  subtitle,
  slices,
  centerTitle,
  centerSubtitle = 'Total',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = slices.reduce((sum, s) => sum + s.value, 0);

  if (totalValue === 0 || slices.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-center items-center h-full text-center text-slate-400 min-h-[280px]">
        <PieIcon className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
        <p className="text-xs">No distribution data available</p>
      </div>
    );
  }

  // Refined donut geometry that strictly fits within card boundaries
  const size = 130;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

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
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between overflow-hidden w-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="min-w-0 pr-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider truncate">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <span className="p-1 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer" title="Real-time calculated pipeline share">
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Centered Donut SVG */}
        <div className="flex justify-center items-center py-4">
          <div className="relative w-[130px] h-[130px] shrink-0">
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
                  strokeWidth={arc.isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-150 cursor-pointer origin-center"
                  onMouseEnter={() => setHoveredIndex(arc.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>

            {/* Centered Statistic */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              {activeSlice ? (
                <>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[70px]">
                    {activeSlice.label}
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {activeSlice.percentage}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                    {centerSubtitle}
                  </span>
                  <span className="text-xs font-black text-slate-900 font-mono">
                    {centerTitle || totalValue}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Legend List (Sleek rows beneath the donut) */}
        <div className="space-y-1.5 pt-1">
          {slices.map((slice, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
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

                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                  {slice.formattedValue && (
                    <span className="text-slate-500 text-[10px] hidden sm:inline">
                      {slice.formattedValue}
                    </span>
                  )}
                  <span className="font-bold text-slate-900 text-[11px] px-1.5 py-0.2 rounded-xs bg-slate-100 border border-slate-200">
                    {slice.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 mt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center truncate">
        Hover slices for exact figures
      </div>
    </div>
  );
};
