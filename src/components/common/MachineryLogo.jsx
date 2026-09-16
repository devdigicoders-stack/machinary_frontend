
export function MachineryLogoIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Cabin Roof & Frame */}
      <path
        d="M17 9H27L30 20H14L17 9Z"
        fill="#F5A623"
        fillOpacity="0.3"
        stroke="#F5A623"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Roll Cage Pillar */}
      <line x1="21" y1="9" x2="19" y2="20" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" />
      {/* Main Body */}
      <path
        d="M9 20H33L37 28H7C6 24 7.5 20 9 20Z"
        fill="#F5A623"
      />
      {/* Exhaust pipe */}
      <rect x="12" y="4" width="2" height="7" rx="1" fill="#F5A623" />
      <path d="M12 4L9 2" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" />
      {/* Front Loader / Bucket Arm */}
      <path
        d="M33 22L43 18L46 26H41"
        stroke="#F5A623"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Front Bucket Scoop */}
      <path
        d="M44 19L50 25L47 31H41L45 23Z"
        fill="#F5A623"
      />
      {/* Rear Large Wheel */}
      <circle cx="14" cy="32" r="8" fill="#F5A623" />
      <circle cx="14" cy="32" r="4.5" fill="#1E293B" />
      <circle cx="14" cy="32" r="2" fill="#F5A623" />
      <circle cx="14" cy="27" r="1" fill="#FFFFFF" />
      <circle cx="14" cy="37" r="1" fill="#FFFFFF" />
      <circle cx="9" cy="32" r="1" fill="#FFFFFF" />
      <circle cx="19" cy="32" r="1" fill="#FFFFFF" />

      {/* Front Wheel */}
      <circle cx="34" cy="33" r="6.5" fill="#F5A623" />
      <circle cx="34" cy="33" r="3.5" fill="#1E293B" />
      <circle cx="34" cy="33" r="1.5" fill="#F5A623" />
    </svg>
  )
}

export function MachineryLogo({ 
  variant = 'sidebar', 
  showSubtext = true, 
  size = 'default',
  badgeText = 'Admin Console',
  className = ''
}) {
  // Sidebar variant - sleek, proportionate, balanced with icon
  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Modern Icon Badge with subtle amber glow */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623]/20 via-[#F5A623]/10 to-[#F5A623]/5 border border-[#F5A623]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,166,35,0.15)]">
          <MachineryLogoIcon className="w-6 h-6" />
        </div>
        
        {/* Brand Text - Clean, well-balanced weight */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline leading-none">
            <span className="font-bold text-[17px] text-white tracking-tight">
              Machinery
            </span>
            <span className="font-bold text-[17px] text-[#F5A623] tracking-tight ml-0.5">
              Hub
            </span>
          </div>
          {showSubtext && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider">
                {badgeText}
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Hero / Auth page variant - slightly larger but elegant and proportional
  if (variant === 'hero') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5A623]/25 to-[#F5A623]/10 border border-[#F5A623]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,166,35,0.25)]">
          <MachineryLogoIcon className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-baseline leading-none">
            <span className="font-bold text-2xl text-white tracking-tight">
              Machinery
            </span>
            <span className="font-bold text-2xl text-[#F5A623] tracking-tight ml-0.5">
              Hub
            </span>
          </div>
          {showSubtext && (
            <p className="text-[11px] font-medium tracking-widest text-slate-300 uppercase mt-1">
              Buy · Rent · Move · Grow
            </p>
          )}
        </div>
      </div>
    )
  }

  // Dark variant for light backgrounds
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
        <MachineryLogoIcon className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-baseline leading-none">
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Machinery
          </span>
          <span className="font-bold text-lg text-[#F5A623] tracking-tight ml-0.5">
            Hub
          </span>
        </div>
        {showSubtext && (
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mt-0.5">
            {badgeText}
          </p>
        )}
      </div>
    </div>
  )
}
