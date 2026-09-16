import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function UsersGrowthChart({ points = [], range = 'Last 30 Days', onRangeChange }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const defaultPoints = [
    { label: '10 Sep', newUsers: 4, activeUsers: 8 },
    { label: '11 Sep', newUsers: 5, activeUsers: 9 },
    { label: '12 Sep', newUsers: 6, activeUsers: 11 },
    { label: '13 Sep', newUsers: 7, activeUsers: 12 },
    { label: '14 Sep', newUsers: 8, activeUsers: 14 },
    { label: '15 Sep', newUsers: 8, activeUsers: 15 },
    { label: '16 Sep', newUsers: 9, activeUsers: 16 },
  ]

  const dataPoints = points && points.length > 0 ? points : defaultPoints

  const width = 360
  const height = 150
  const padLeft = 28
  const padRight = 10
  const padBottom = 22
  const padTop = 15

  // Dynamically compute top Y limit based on actual data
  const rawMax = Math.max(...dataPoints.map((p) => Math.max(p.activeUsers || 0, p.newUsers || 0)), 5)
  // Round up to nice number
  const topY = Math.ceil(rawMax * 1.25 / 5) * 5 || 20

  const gridSteps = [
    0,
    Math.round(topY * 0.25),
    Math.round(topY * 0.5),
    Math.round(topY * 0.75),
    topY,
  ]

  const scaleX = (idx) => padLeft + (idx / Math.max(1, dataPoints.length - 1)) * (width - padLeft - padRight)
  const scaleY = (val) => height - padBottom - ((val || 0) / topY) * (height - padBottom - padTop)

  // Smooth line builder
  const buildSmoothPath = (key) => {
    return dataPoints.reduce((acc, pt, i, arr) => {
      const x = scaleX(i)
      const y = scaleY(pt[key])
      if (i === 0) return `M ${x},${y}`
      const prevX = scaleX(i - 1)
      const prevY = scaleY(arr[i - 1][key])
      const cx1 = prevX + (x - prevX) / 2
      const cx2 = cx1
      return `${acc} C ${cx1},${prevY} ${cx2},${y} ${x},${y}`
    }, '')
  }

  const activePath = buildSmoothPath('activeUsers')
  const newPath = buildSmoothPath('newUsers')

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">Users Growth</h3>
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
      <div className="flex items-center justify-between gap-4 mb-2 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span>New Users</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Active Users</span>
          </div>
        </div>

        {hoveredIndex !== null && dataPoints[hoveredIndex] && (
          <div className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded shadow-xs font-mono">
            {dataPoints[hoveredIndex].label}: {dataPoints[hoveredIndex].activeUsers} active, {dataPoints[hoveredIndex].newUsers} new
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
                  {val}
                </text>
              </g>
            )
          })}

          {/* Smooth Lines */}
          <path d={activePath} fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
          <path d={newPath} fill="none" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" />

          {/* Interactive Dots and Vertical Hover Guides */}
          {dataPoints.map((pt, i) => {
            const cx = scaleX(i)
            const isHovered = hoveredIndex === i

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={height - padBottom}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={cx}
                  cy={scaleY(pt.activeUsers)}
                  r={isHovered ? 4.5 : 3}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
                <circle
                  cx={cx}
                  cy={scaleY(pt.newUsers)}
                  r={isHovered ? 4.5 : 3}
                  fill="#3B82F6"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* X Axis Label */}
                <text
                  x={cx}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={isHovered ? '#1E293B' : '#94A3B8'}
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {pt.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
