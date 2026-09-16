import React, { useState } from 'react'

export function UserTypeDonutCard({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const segments = data?.segments || [
    { label: 'Customers', count: 0, percent: '0.0%', color: '#3B82F6' },
    { label: 'Owners', count: 0, percent: '0.0%', color: '#10B981' },
    { label: 'Admins', count: 0, percent: '0.0%', color: '#EF4444' },
  ]
  const total = data?.total !== undefined ? data.total : 0
  const radius = 46
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">User Type Distribution</h3>
          {hoveredIdx !== null && segments[hoveredIdx] && (
            <span className="text-[11px] font-bold text-slate-700">
              {segments[hoveredIdx].label}: {segments[hoveredIdx].count} ({segments[hoveredIdx].percent})
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
          {/* Donut SVG */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 transform">
              {/* Background ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />

              {/* Segments */}
              {total > 0 &&
                segments.map((seg, idx) => {
                  const segFraction = seg.count / total
                  const strokeDasharray = `${segFraction * circumference} ${circumference}`
                  const strokeDashoffset = -accumulatedPercent * circumference
                  accumulatedPercent += segFraction
                  const isHovered = hoveredIdx === idx

                  return (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  )
                })}
            </svg>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-lg font-black text-slate-900 leading-tight">{total}</span>
              <span className="text-[9.5px] font-semibold text-slate-400">Total Users</span>
            </div>
          </div>

          {/* Right Legend */}
          <div className="space-y-1.5 min-w-[130px]">
            {segments.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between text-xs p-1 rounded-md cursor-pointer transition-colors ${
                  hoveredIdx === idx ? 'bg-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium text-[11.5px]">{item.label}</span>
                </div>
                <span className="font-bold text-slate-800 text-[11.5px]">
                  {item.count} <span className="font-normal text-slate-400 text-[10px]">({item.percent})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
