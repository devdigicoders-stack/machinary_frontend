import React, { useState, useEffect, useCallback } from 'react'
import { PromoBanner } from '../../components/dashboard/PromoBanner'
import { StatsCards } from '../../components/dashboard/StatsCards'
import { ListingsChart } from '../../components/dashboard/ListingsChart'
import { QuickActions } from '../../components/dashboard/QuickActions'
import { RecentListingsTable } from '../../components/dashboard/RecentListingsTable'
import { RecentCustomersTable } from '../../components/dashboard/RecentCustomersTable'
import { Toast } from '../../components/common/Toast'
import { dashboardService } from '../../services/dashboardService'
import { RotateCw } from 'lucide-react'

export default function DashboardPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Dynamic dashboard states from MongoDB Atlas
  const [statsData, setStatsData] = useState(null)
  const [recentListings, setRecentListings] = useState([])
  const [recentCustomers, setRecentCustomers] = useState([])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Load all dynamic data in parallel
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true)
      else setIsRefreshing(true)

      const [statsRes, listingsRes, customersRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentListings(4),
        dashboardService.getRecentCustomers(4),
      ])

      if (statsRes?.data) {
        setStatsData(statsRes.data)
      }
      if (listingsRes?.data) {
        setRecentListings(listingsRes.data)
      }
      if (customersRes?.data) {
        setRecentCustomers(customersRes.data)
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      showToast('Could not sync latest dashboard data from server')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleManualRefresh = () => {
    fetchDashboardData(true)
    showToast('Dashboard refreshed with live data from MongoDB Atlas')
  }

  const kpis = statsData?.kpis
  const badges = statsData?.badges || {}

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* Top Sync Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Marketplace Overview</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">
            Last synced: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 1. Promotional & Welcome Banner */}
      <PromoBanner
        pendingApprovals={badges.pendingApprovals || 0}
        newEnquiries={badges.newEnquiries || 0}
      />

      {/* 2. Key Performance Metrics (KPIs) */}
      <StatsCards kpis={kpis} isLoading={isLoading} />

      {/* 3. Listings Overview Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <ListingsChart />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex">
          <div className="w-full">
            <QuickActions badges={badges} />
          </div>
        </div>
      </div>

      {/* 4. Recent Tables: Recent Listings & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 xl:col-span-7">
          <RecentListingsTable
            listings={recentListings}
            isLoading={isLoading}
            onRefresh={() => fetchDashboardData(true)}
            showToast={showToast}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-5">
          <RecentCustomersTable
            customers={recentCustomers}
            isLoading={isLoading}
            onRefresh={() => fetchDashboardData(true)}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  )
}
