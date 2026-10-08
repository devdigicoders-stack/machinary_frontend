
export function MachineryLogoIcon({ className = "w-10 h-10" }) {
  return (
    <img 
      src="/app_icon_transparent.png" 
      alt="Machine Wallah Icon" 
      className={`object-contain shrink-0 ${className}`} 
    />
  )
}

export function MachineryLogo({ 
  variant = 'sidebar', 
  showSubtext = true, 
  size = 'default',
  badgeText = 'Admin Console',
  className = ''
}) {
  // Sidebar variant - sleek, high contrast with app logo
  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Modern Icon Badge with app primary orange glow */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A00]/25 via-[#FF5A00]/15 to-transparent border border-[#FF5A00]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,90,0,0.2)] p-1">
          <img 
            src="/app_icon_transparent.png" 
            alt="Machine Wallah" 
            className="w-full h-full object-contain drop-shadow" 
          />
        </div>
        
        {/* Brand Text */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline leading-none">
            <span className="font-extrabold text-[17px] text-white tracking-tight">
              Machine
            </span>
            <span className="font-extrabold text-[17px] text-[#FF5A00] tracking-tight ml-1">
              Wallah
            </span>
          </div>
          {showSubtext && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                {badgeText}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Hero / Auth page variant - sleek transparent logo on dark backdrop
  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-start ${className}`}>
        <div className="max-w-[240px] sm:max-w-[260px]">
          <img 
            src="/app_logo_transparent.png" 
            alt="Machine Wallah Logo" 
            className="w-full h-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
    )
  }

  // Dark variant for light backgrounds
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-[#FF5A00]/10 border border-[#FF5A00]/25 flex items-center justify-center shrink-0 p-1">
        <img 
          src="/app_icon_transparent.png" 
          alt="Machine Wallah" 
          className="w-full h-full object-contain" 
        />
      </div>
      <div>
        <div className="flex items-baseline leading-none">
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">
            Machine
          </span>
          <span className="font-extrabold text-lg text-[#FF5A00] tracking-tight ml-1">
            Wallah
          </span>
        </div>
        {showSubtext && (
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mt-0.5">
            {badgeText}
          </p>
        )}
      </div>
    </div>
  )
}
