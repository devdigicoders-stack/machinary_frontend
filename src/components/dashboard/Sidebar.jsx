import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserCheck,
  Truck,
  Layers,
  FileText,
  Flag,
  Star,
  MapPin,
  Layout,
  Bell,
  BarChart3,
  Headphones,
  User,
  Sliders,
  Lock,
  LogOut,
  X,
  ShieldCheck,
  Repeat
} from 'lucide-react'
import { MachineryLogo } from '../common/MachineryLogo'
import { authService, getAvatarUrl } from '../../services/authService'
import { listingService } from '../../services/listingService'
import { notificationService } from '../../services/notificationService'
import { supportService } from '../../services/supportService'

export function Sidebar({ isOpen, onClose, activeTab = 'Dashboard', onTabChange }) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser())
  const [badgeCounts, setBadgeCounts] = useState({
    approved: null,
    pending: null,
    reported: null,
    notifications: null,
    support: null,
  })

  useEffect(() => {
    const updateUser = () => {
      const user = authService.getCurrentUser()
      if (user) setCurrentUser(user)
    }
    updateUser()

    window.addEventListener('admin-profile-updated', updateUser)
    return () => window.removeEventListener('admin-profile-updated', updateUser)
  }, [])

  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        const [approvalsRes, reportedRes, notifRes, supportRes] = await Promise.allSettled([
          listingService.getPendingApprovals(),
          listingService.getReportedListings(),
          notificationService.getStats(),
          supportService.getStats(),
        ])
        const approvedCount = approvalsRes.status === 'fulfilled' ? (approvalsRes.value?.data?.stats?.approved ?? 0) : null
        const pendingCount = approvalsRes.status === 'fulfilled' ? (approvalsRes.value?.data?.stats?.pending ?? 0) : null
        const repCount = reportedRes.status === 'fulfilled' ? (reportedRes.value?.data?.stats?.pending ?? reportedRes.value?.data?.reports?.length ?? 0) : null
        const notifCount = notifRes.status === 'fulfilled' ? (notifRes.value?.data?.pending ?? notifRes.value?.data?.unread ?? 0) : null
        const supportCount = supportRes.status === 'fulfilled' ? (supportRes.value?.data?.open ?? 0) : null
        setBadgeCounts({ 
          approved: approvedCount,
          pending: pendingCount, 
          reported: repCount, 
          notifications: notifCount, 
          support: supportCount 
        })
      } catch (e) {
        // silent fallback
      }
    }
    fetchBadgeCounts()
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const menuSections = [
    {
      title: null,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      ],
    },
    {
      title: 'CUSTOMERS',
      items: [
        { name: 'Manage Customers', icon: Users, path: '/manage-customers' },
        { 
          name: 'Manage Customer Enquiry', 
          icon: MessageSquare, 
          path: '/customer-enquiry',
          badge: '3 New',
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        },
      ],
    },
    {
      title: 'OWNERS',
      items: [
        { name: 'Manage Owners', icon: UserCheck, path: '/manage-owners' },
      ],
    },
    {
      title: 'MACHINES / VEHICLES',
      items: [
        
        { name: 'Manage Category', icon: Layers, path: '/manage-category' },
      ],
    },
    {
      title: 'LISTINGS & APPROVALS',
      items: [
        { 
          name: 'Manage Listing', 
          icon: FileText, 
          path: '/listings',
          badge: badgeCounts.approved !== null ? `${badgeCounts.approved} Approved` : null,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        },
        { 
          name: 'Listing Approval / Rejection', 
          icon: ShieldCheck, 
          path: '/listing-approval',
          badge: badgeCounts.pending !== null && badgeCounts.pending > 0 ? `${badgeCounts.pending} Pending` : (badgeCounts.pending !== null ? '0 Pending' : null),
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        },
        { name: 'Manage Buy / Rent Listing', icon: Repeat, path: '/buy-rent-listings' },
        { 
          name: 'Manage Reported Listing', 
          icon: Flag, 
          path: '/reported-listings',
          badge: badgeCounts.reported !== null && badgeCounts.reported > 0 ? `${badgeCounts.reported}` : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        },
        { 
          name: 'Featured / Promoted Listings', 
          icon: Star, 
          path: '/promoted-listings',
          badge: 'PRO',
          badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
        },
      ],
    },
    {
      title: 'LOCATION',
      items: [
        { name: 'Manage Location', icon: MapPin, path: '/locations' },
      ],
    },
    {
      title: 'CONTENT & SETTINGS',
      items: [
        { name: 'Manage Website Content', icon: Layout, path: '/website-content' },
        { 
          name: 'Manage Notifications', 
          icon: Bell, 
          path: '/notifications',
          badge: badgeCounts.notifications !== null ? `${badgeCounts.notifications}` : null,
          badgeColor: 'bg-slate-700/60 text-slate-300 border border-slate-600/40'
        },
        { name: 'Reports & Analytics', icon: BarChart3, path: '/analytics' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { 
          name: 'Manage Complaint & Support', 
          icon: Headphones, 
          path: '/support',
          badge: badgeCounts.support !== null && badgeCounts.support > 0 ? `${badgeCounts.support} Open` : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        },
      ],
    },
    {
      title: 'PROFILE',
      items: [
        { name: 'My profile', icon: User, path: '/profile' },
        { name: 'Manage Profile', icon: Sliders, path: '/profile/manage' },
        { name: 'Change Password', icon: Lock, path: '/profile/password' },
      ],
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 xl:w-68 bg-[#0D0F12] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-white/[0.08] shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Subtle Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FF5A00]/[0.12] via-[#FF5A00]/[0.03] to-transparent pointer-events-none" />

        {/* Top Brand Logo Header */}
        <div className="relative p-4 pb-3.5 flex items-center justify-between border-b border-white/[0.08]">
          <Link 
            to="/dashboard" 
            onClick={() => onTabChange && onTabChange('Dashboard')}
            className="focus:outline-none hover:opacity-95 transition-opacity"
          >
            <MachineryLogo variant="sidebar" showSubtext={true} badgeText="Admin Portal" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar relative z-10">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {section.title}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/[0.05]" />
                </div>
              )}
              {menuSections[idx].items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                const handleClick = () => {
                  if (onTabChange) {
                    onTabChange(item.name)
                  } else {
                    if (item.path) navigate(item.path)
                  }
                }

                if (isActive) {
                  return (
                    <button
                      key={item.name}
                      onClick={handleClick}
                      className="w-full relative group flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-[13px] bg-gradient-to-r from-[#FF5A00]/22 via-[#FF5A00]/12 to-transparent text-[#FF5A00] border border-[#FF5A00]/35 shadow-[0_0_18px_rgba(255,90,0,0.12)] cursor-pointer transition-all"
                    >
                      {/* Active indicator bar */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-[#FF5A00] to-orange-600 rounded-r-full shadow-[0_0_8px_rgba(255,90,0,0.9)]" />
                      
                      {/* Icon container */}
                      <div className="w-7 h-7 rounded-lg bg-[#FF5A00]/20 text-[#FF5A00] flex items-center justify-center shrink-0 shadow-inner shadow-[#FF5A00]/25">
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      
                      <span className="truncate flex-1 text-left font-bold">{item.name}</span>
                      
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                }

                return (
                  <button
                    key={item.name}
                    onClick={handleClick}
                    className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-all duration-150 cursor-pointer"
                  >
                    {/* Inactive Icon container */}
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] group-hover:bg-white/[0.06] text-slate-400 group-hover:text-[#F5A623] flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4 stroke-[1.8]" />
                    </div>
                    
                    <span className="truncate flex-1 text-left transition-colors">
                      {item.name}
                    </span>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-white/10 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Bottom User Card & Quick Logout */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0A0C0E]/90 backdrop-blur-md relative z-10">
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all flex items-center justify-between gap-2.5">
            <div 
              onClick={() => { if (onTabChange) onTabChange('My Profile'); else navigate('/profile') }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#F5A623] to-[#E59715] text-slate-950 font-black text-xs flex items-center justify-center shadow-sm shadow-[#F5A623]/25">
                  {currentUser?.avatar ? (
                    <img
                      src={getAvatarUrl(currentUser.avatar)}
                      alt={currentUser?.name || 'Admin'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    (currentUser?.name || 'AD').slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0C0E]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-bold text-slate-200 group-hover:text-white truncate leading-tight transition-colors">
                  {currentUser?.name || 'Super Admin'}
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {currentUser?.role || 'Online'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
