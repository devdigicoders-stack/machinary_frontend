import React from 'react'

export function TractorIcon({ className = "w-6 h-6 text-[#F5A623]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v5" />
      <path d="M11 9h4l2 3h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2" />
      <circle cx="6" cy="16" r="4" />
      <circle cx="18" cy="17" r="2" />
      <path d="M10 16h6" />
    </svg>
  )
}
