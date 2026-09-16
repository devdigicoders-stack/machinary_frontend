import React from 'react'
import { Handshake, Truck, TrendingUp, Users, MapPin } from 'lucide-react'
import { MachineryLogo } from '../common/MachineryLogo'
import { TractorIcon } from '../common/TractorIcon'

export function AuthHero() {
  return (
    <div className="w-full lg:w-[54%] xl:w-[55%] relative h-[650px] sm:h-[720px] lg:h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden z-10">
      
      {/* Heavy Machinery Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat z-0 transform scale-100 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/login.png')`,
          backgroundPosition: 'center 45%',
        }}
      />

      {/* Layered Contrast & Legibility Overlays */}
      {/* Top Deep Dark Gradient for Logo, Headline & Badges */}
      <div className="absolute inset-x-0 top-0 h-[68%] bg-gradient-to-b from-black/90 via-black/75 via-45% to-transparent z-1 pointer-events-none" />
      
      {/* Radial soft shadow specifically behind text */}
      <div className="absolute top-0 left-0 w-full h-[540px] bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.5)_50%,transparent_80%)] z-1 pointer-events-none" />
      
      {/* Bottom Gradient for Stats & Quote */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/95 via-black/75 to-transparent z-1 pointer-events-none" />

      {/* Right Edge Soft Blend */}
      <div className="hidden lg:block absolute -right-1 top-0 bottom-0 w-16 bg-gradient-to-r from-transparent to-[#F8FAFC]/40 z-2 pointer-events-none" />

      {/* --- TOP CONTENT AREA --- */}
      <div className="relative z-10">
        {/* MachineryHub Brand Header */}
        <MachineryLogo variant="hero" showSubtext={true} />

        {/* Golden Accent Line */}
        <div className="w-12 h-1.5 bg-[#F5A623] rounded-full mt-7 sm:mt-9 mb-4 sm:mb-5 shadow-[0_2px_10px_rgba(245,166,35,0.5)]" />

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl xl:text-[44px] 2xl:text-[48px] font-black tracking-tight leading-[1.15] drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]">
          <span className="text-white block">Powering Your</span>
          <span className="text-[#F5A623] block mt-1">Machinery Business</span>
        </h1>

        {/* Description Subtitle */}
        <p className="text-slate-200 text-sm sm:text-base font-normal max-w-lg mt-3 sm:mt-4 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          A trusted marketplace for heavy machinery &amp; transport to connect owners, renters and businesses across India.
        </p>

        {/* 3 Interactive Feature Pills */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
          {/* Badge 1: Buy & Rent */}
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="w-11 h-11 rounded-full bg-black/50 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623] shadow-lg backdrop-blur-md group-hover:border-[#F5A623] group-hover:scale-105 transition-all">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold text-xs sm:text-sm block leading-tight drop-shadow-md">
                Buy &amp; Rent
              </span>
              <span className="text-slate-300 text-[11px] font-medium block leading-tight mt-0.5">
                Machinery
              </span>
            </div>
          </div>

          {/* Badge 2: Transport */}
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="w-11 h-11 rounded-full bg-black/50 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623] shadow-lg backdrop-blur-md group-hover:border-[#F5A623] group-hover:scale-105 transition-all">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold text-xs sm:text-sm block leading-tight drop-shadow-md">
                Transport
              </span>
              <span className="text-slate-300 text-[11px] font-medium block leading-tight mt-0.5">
                Services
              </span>
            </div>
          </div>

          {/* Badge 3: Grow Your */}
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="w-11 h-11 rounded-full bg-black/50 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623] shadow-lg backdrop-blur-md group-hover:border-[#F5A623] group-hover:scale-105 transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold text-xs sm:text-sm block leading-tight drop-shadow-md">
                Grow Your
              </span>
              <span className="text-slate-300 text-[11px] font-medium block leading-tight mt-0.5">
                Business
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM STATS & MOTTO --- */}
      <div className="relative z-10 pt-4 mt-auto">
        {/* 3 Columns Stats Bar */}
        <div className="flex items-center gap-4 sm:gap-8 pb-3 border-b border-white/15 max-w-xl">
          {/* Stat 1 */}
          <div className="flex items-center gap-3 pr-4 sm:pr-8 border-r border-white/20">
            <div className="text-[#F5A623] drop-shadow">
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="text-white font-black text-lg sm:text-xl xl:text-2xl leading-none drop-shadow-md">
                10K+
              </div>
              <div className="text-slate-300 text-[11px] sm:text-xs font-medium leading-tight mt-1">
                Happy Customers
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-3 pr-4 sm:pr-8 border-r border-white/20">
            <div className="text-[#F5A623] drop-shadow">
              <TractorIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#F5A623]" />
            </div>
            <div>
              <div className="text-white font-black text-lg sm:text-xl xl:text-2xl leading-none drop-shadow-md">
                5K+
              </div>
              <div className="text-slate-300 text-[11px] sm:text-xs font-medium leading-tight mt-1">
                Listed Machines
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-3">
            <div className="text-[#F5A623] drop-shadow">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="text-white font-black text-lg sm:text-xl xl:text-2xl leading-none drop-shadow-md">
                500+
              </div>
              <div className="text-slate-300 text-[11px] sm:text-xs font-medium leading-tight mt-1">
                Cities Covered
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-slate-300/85 italic text-xs sm:text-[13px] tracking-wide mt-3 drop-shadow">
          &ldquo;Building a stronger tomorrow, together.&rdquo;
        </p>
      </div>
    </div>
  )
}
