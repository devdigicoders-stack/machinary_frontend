import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function RevenueOverviewChart({ groups = [], range = 'Last 30 Days', onRangeChange }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const defaultGroups = [
    { label: '10 Sep', plan: 8, featured: 12, other: 6 },
    { label: '11 Sep', plan: 9, featured: 14, other: 7 },
    { label: '12 Sep', plan: 11, featured: 16, other: 8 },
    { label: '13 Sep', plan: 12, featured: 18, other: 9 },
    { label: '14 Sep', plan: 14, featured: 20, other: 10 },
    { label: '15 Sep', plan: 15, featured: 22, other: 12 },
    { label: '16 Sep', plan: 18, featured: 26, other: 14 },
  ]

  const dataGroups = groups && groups.length > 0 ? groups : defaultGroups

  const width = 360
  const height = 150
  const padLeft = 32
  const padRight = 10
  const padBottom = 22
  const padTop = 15

  // Dynamically compute top Y limit based on actual data
  const rawMax = Math.max(...dataGroups.map((g) => Math.max(g.plan || 0, g.featured || 0, g.other || 0)), 5)
  const topY = Math.ceil(rawMax * 1.25 / 5) * 5 || 25

  const gridSteps = [
    0,
    Math.round(topY * 0.25),
    Math.round(topY * 0.5),
    Math.round(topY * 0.75),
    topY,
  ]

  const scaleY = (val) => height - padBottom - ((val || 0) / topY) * (height - padBottom - padTop)
  const availableWidth = width - padLeft - padRight
  const groupWidth = availableWidth / Math.max(1, dataGroups.length)

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">Revenue Overview</h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <span>{range}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-7 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 animate-in fade-in duration-150">
              {['Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Year'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (onRangeChange) onRangeChange(opt)
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left px-2.5 py-1 text-[11px] ${
                    range === opt ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legends */}
      <div className="flex items-center justify-between gap-2 mb-2 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span>Plans</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Featured</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
            <span>Other</span>
          </div>
        </div>

        {hoveredIndex !== null && dataGroups[hoveredIndex] && (
          <div className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded shadow-xs font-mono">
            {dataGroups[hoveredIndex].label}: ₹{(dataGroups[hoveredIndex].plan + dataGroups[hoveredIndex].featured + dataGroups[hoveredIndex].other)}k
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Y Axis Grid lines & labels */}
          {gridSteps.map((val) => {
            const y = scaleY(val)
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? 'none' : '3 3'}
                />
                <text
                  x={padLeft - 5}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fill="#94A3B8"
                  fontWeight="600"
                >
                  {val === 0 ? '0' : `${val}K`}
                </text>
              </g>
            )
          })}

          {/* Bar Groups */}
          {dataGroups.map((g, i) => {
            const groupCenterX = padLeft + i * groupWidth + groupWidth / 2
            const barW = Math.min(6, groupWidth * 0.22)
            const gap = 1.5
            const isHovered = hoveredIndex === i

            const x1 = groupCenterX - barW * 1.5 - gap
            const x2 = groupCenterX - barW / 2
            const x3 = groupCenterX + barW / 2 + gap

            const y1 = scaleY(g.plan)
            const h1 = Math.max(2, height - padBottom - y1)

            const y2 = scaleY(g.featured)
            const h2 = Math.max(2, height - padBottom - y2)

            const y3 = scaleY(g.other)
            const h3 = Math.max(2, height - padBottom - y3)

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Highlight Background on Hover */}
                {isHovered && (
                  <rect
                    x={groupCenterX - groupWidth / 2}
                    y={padTop}
                    width={groupWidth}
                    height={height - padBottom - padTop}
                    fill="#F8FAFC"
                    rx="2"
                  />
                )}

                {/* Bar 1 (Plans) */}
                <rect
                  x={x1}
                  y={y1}
                  width={barW}
                  height={h1}
                  fill="#3B82F6"
                  rx="1.5"
                  opacity={isHovered ? 1 : 0.9}
                />
                {/* Bar 2 (Featured) */}
                <rect
                  x={x2}
                  y={y2}
                  width={barW}
                  height={h2}
                  fill="#10B981"
                  rx="1.5"
                  opacity={isHovered ? 1 : 0.9}
                />
                {/* Bar 3 (Other) */}
                <rect
                  x={x3}
                  y={y3}
                  width={barW}
                  height={h3}
                  fill="#F5A623"
                  rx="1.5"
                  opacity={isHovered ? 1 : 0.9}
                />

                {/* X Axis Label */}
                <text
                  x={groupCenterX}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={isHovered ? '#1E293B' : '#94A3B8'}
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {g.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
