import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'

export function ListingsChart() {
  const [selectedRange, setSelectedRange] = useState('Last 30 Days')
  const [rangeKey, setRangeKey] = useState('30d')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activePoint, setActivePoint] = useState(null)
  const [chartData, setChartData] = useState({
    markers: [],
    bounds: { maxVal: 50, step: 12.5 },
    summary: { totalRent: 0, totalBuy: 0, totalListings: 0 },
  })

  const dropdownRef = useRef(null)

  const rangeOptions = [
    { label: 'Last 7 Days', key: '7d' },
    { label: 'Last 30 Days', key: '30d' },
    { label: 'This Quarter', key: 'quarter' },
    { label: 'This Year', key: 'year' },
  ]

  // Fetch dynamic chart data on range change
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    dashboardService
      .getChartData(rangeKey)
      .then((res) => {
        if (isMounted && res?.data) {
          setChartData(res.data)
        }
      })
      .catch((err) => {
        console.error('Failed to load chart data:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [rangeKey])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectRange = (opt) => {
    setSelectedRange(opt.label)
    setRangeKey(opt.key)
    setIsDropdownOpen(false)
  }

  // Dimensions & coordinate mapping
  const width = 640
  const height = 180
  const padLeft = 32
  const padRight = 15
  const padBottom = 26
  const padTop = 18

  const maxVal = chartData.bounds?.maxVal || 50
  const scaleX = (pct) => padLeft + (pct / 100) * (width - padLeft - padRight)
  const scaleY = (val) =>
    height - padBottom - (Math.max(0, val) / Math.max(1, maxVal)) * (height - padBottom - padTop)

  // Markers
  const markers = chartData.markers || []

  // Generate smooth cubic bezier path for any point set
  const generateSmoothPath = (pts) => {
    if (!pts || pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`

    let d = `M ${pts[0].x},${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]
      const next = pts[i + 1]
      const midX = (curr.x + next.x) / 2
      d += ` C ${midX},${curr.y} ${midX},${next.y} ${next.x},${next.y}`
    }
    return d
  }

  const rentCoords = markers.map((m) => ({
    x: scaleX(m.xPercent),
    y: scaleY(m.rent),
  }))

  const buyCoords = markers.map((m) => ({
    x: scaleX(m.xPercent),
    y: scaleY(m.buy),
  }))

  const rentPath = generateSmoothPath(rentCoords)
  const buyPath = generateSmoothPath(buyCoords)

  const rentAreaPath =
    rentCoords.length > 1
      ? `${rentPath} L ${rentCoords[rentCoords.length - 1].x},${height - padBottom} L ${
          rentCoords[0].x
        },${height - padBottom} Z`
      : ''

  const gridSteps = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      
      {/* Header & Legends */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Listings Overview</span>
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
          </h3>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Dynamic Legend Items with Real DB Counts */}
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E2024]" />
              <span className="text-slate-700 font-semibold">Buy</span>
              <span className="text-slate-500 font-bold ml-0.5">
                ({chartData.summary?.totalBuy ?? 0})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
              <span className="text-slate-700 font-semibold">Rent</span>
              <span className="text-slate-500 font-bold ml-0.5">
                ({chartData.summary?.totalRent ?? 0})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FDE7C7] border border-amber-300/60" />
              <span className="text-slate-700 font-semibold">Total</span>
              <span className="text-slate-900 font-extrabold ml-0.5">
                ({chartData.summary?.totalListings ?? 0})
              </span>
            </div>
          </div>

          {/* Dynamic Range Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              <span>{selectedRange}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                {rangeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectRange(opt)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      opt.key === rangeKey
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Canvas with Smooth Dynamic Waves and Gradient Fill */}
      <div className="relative w-full pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 sm:h-52 overflow-visible">
          <defs>
            {/* Soft Warm Golden Gradient under Rent Wave */}
            <linearGradient id="rentDynamicGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#F5A623" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#F5A623" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis labels */}
          {gridSteps.map((val, idx) => {
            const y = scaleY(val)
            return (
              <g key={idx}>
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {val}
                </text>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
              </g>
            )
          })}

          {/* Area Gradient Fill under Rent Curve */}
          {rentAreaPath && (
            <path
              d={rentAreaPath}
              fill="url(#rentDynamicGradient)"
              className="transition-opacity duration-300"
            />
          )}

          {/* Rent Spline Wave (Golden Amber) */}
          {rentPath && (
            <path
              d={rentPath}
              fill="none"
              stroke="#F5A623"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-2xs transition-all duration-300"
            />
          )}

          {/* Buy Spline Wave (Dark Charcoal) */}
          {buyPath && (
            <path
              d={buyPath}
              fill="none"
              stroke="#1E2024"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Key Marker Dots & X Labels */}
          {markers.map((m, idx) => {
            const x = scaleX(m.xPercent)
            const yRent = scaleY(m.rent)
            const yBuy = scaleY(m.buy)

            return (
              <g key={idx}>
                {/* Rent Dot */}
                <circle
                  cx={x}
                  cy={yRent}
                  r="4.5"
                  fill="#F5A623"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-130 transition-transform duration-150"
                  onMouseEnter={() => setActivePoint({ ...m, x, y: yRent, type: 'Rent' })}
                  onMouseLeave={() => setActivePoint(null)}
                />

                {/* Buy Dot */}
                <circle
                  cx={x}
                  cy={yBuy}
                  r="3.8"
                  fill="#1E2024"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  className="cursor-pointer hover:scale-130 transition-transform duration-150"
                  onMouseEnter={() => setActivePoint({ ...m, x, y: yBuy, type: 'Buy' })}
                  onMouseLeave={() => setActivePoint(null)}
                />

                {/* Date Label on Bottom */}
                <text
                  x={x}
                  y={height - 5}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {m.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip */}
        {activePoint && (
          <div
            className="absolute bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-md shadow-xl pointer-events-none -translate-x-1/2 -translate-y-11 transition-all z-20 border border-slate-700"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
            }}
          >
            <div className="font-bold text-[#F5A623]">{activePoint.label}</div>
            <div className="flex items-center gap-2 mt-0.5 text-slate-300 text-[10px]">
              <span>Rent: <strong className="text-white">{activePoint.rent}</strong></span>
              <span>•</span>
              <span>Buy: <strong className="text-white">{activePoint.buy}</strong></span>
              <span>•</span>
              <span>Total: <strong className="text-emerald-400">{activePoint.total}</strong></span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
