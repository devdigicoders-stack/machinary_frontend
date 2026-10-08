import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Calendar, Download, ChevronDown, X, RefreshCw, BarChart2 } from 'lucide-react'
import { AnalyticsStatsCards } from '../../components/analytics/AnalyticsStatsCards'
import { AnalyticsTabs } from '../../components/analytics/AnalyticsTabs'
import { UsersGrowthChart } from '../../components/analytics/UsersGrowthChart'
import { ListingsGrowthChart } from '../../components/analytics/ListingsGrowthChart'
import { RevenueOverviewChart } from '../../components/analytics/RevenueOverviewChart'
import { TopCategoriesCard } from '../../components/analytics/TopCategoriesCard'
import { TopLocationsCard } from '../../components/analytics/TopLocationsCard'
import { ListingStatusDonutCard } from '../../components/analytics/ListingStatusDonutCard'
import { RecentEnquiriesCard } from '../../components/analytics/RecentEnquiriesCard'
import { TopPerformingListingsCard } from '../../components/analytics/TopPerformingListingsCard'
import { UserTypeDonutCard } from '../../components/analytics/UserTypeDonutCard'
import { Toast } from '../../components/common/Toast'
import { analyticsService } from '../../services/analyticsService'

export default function ReportsAnalyticsPage() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  const [isLoading, setIsLoading] = useState(false)

  // Live Analytics State from MongoDB Atlas
  const [overviewStats, setOverviewStats] = useState(null)
  const [growthData, setGrowthData] = useState({
    usersGrowth: [],
    listingsGrowth: [],
    revenueOverview: [],
  })
  const [topCategories, setTopCategories] = useState([])
  const [topLocations, setTopLocations] = useState([])
  const [listingStatus, setListingStatus] = useState(null)
  const [recentEnquiries, setRecentEnquiries] = useState([])
  const [topListings, setTopListings] = useState([])
  const [userTypes, setUserTypes] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Range change handler for both header dropdown and individual charts
  const handleRangeChange = async (newRange) => {
    setDateRange(newRange)
    setShowDateDropdown(false)
    try {
      const res = await analyticsService.getGrowth({ range: newRange })
      if (res.success && res.data) {
        setGrowthData(res.data)
      }
      showToast(`Analytics range updated to: ${newRange}`)
    } catch (err) {
      console.error('Failed to change range:', err)
      showToast('Error fetching updated range metrics')
    }
  }

  // Fetch all analytics datasets
  const fetchAllAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      const [
        overviewRes,
        growthRes,
        categoriesRes,
        locationsRes,
        statusRes,
        enquiriesRes,
        listingsRes,
        userTypesRes,
      ] = await Promise.allSettled([
        analyticsService.getOverview(),
        analyticsService.getGrowth({ range: dateRange }),
        analyticsService.getTopCategories(),
        analyticsService.getTopLocations(),
        analyticsService.getListingStatus(),
        analyticsService.getRecentEnquiries(),
        analyticsService.getTopListings(),
        analyticsService.getUserTypes(),
      ])

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
        setOverviewStats(overviewRes.value.data)
      }
      if (growthRes.status === 'fulfilled' && growthRes.value?.success) {
        setGrowthData(growthRes.value.data)
      }
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.success) {
        setTopCategories(categoriesRes.value.data)
      }
      if (locationsRes.status === 'fulfilled' && locationsRes.value?.success) {
        setTopLocations(locationsRes.value.data)
      }
      if (statusRes.status === 'fulfilled' && statusRes.value?.success) {
        setListingStatus(statusRes.value.data)
      }
      if (enquiriesRes.status === 'fulfilled' && enquiriesRes.value?.success) {
        setRecentEnquiries(enquiriesRes.value.data)
      }
      if (listingsRes.status === 'fulfilled' && listingsRes.value?.success) {
        setTopListings(listingsRes.value.data)
      }
      if (userTypesRes.status === 'fulfilled' && userTypesRes.value?.success) {
        setUserTypes(userTypesRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
      showToast('Error loading live analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAllAnalytics()
  }, [fetchAllAnalytics])

  // Handle Export Report (Generates CSV download or PDF notification)
  const handleExport = (e) => {
    e.preventDefault()
    setShowExportModal(false)

    if (exportFormat === 'csv' || exportFormat === 'xlsx') {
      try {
        const rows = [
          ['MACHINE WALLAH - PLATFORM ANALYTICS REPORT'],
          ['Date Generated', new Date().toLocaleString()],
          ['Filter Range', dateRange],
          [],
          ['--- PLATFORM KPI OVERVIEW ---'],
          ['Metric', 'Value'],
          ['Total Users', overviewStats?.totalUsers || '0'],
          ['Total Listings', overviewStats?.totalListings || '0'],
          ['Total Views', overviewStats?.totalViews || '0'],
          ['Total Platform Revenue', overviewStats?.totalRevenue || '₹ 0'],
          [],
          ['--- TOP CATEGORIES ---'],
          ['Category', 'Listings', 'Views'],
          ...topCategories.map((c) => [c.name, c.listings, c.views]),
          [],
          ['--- TOP LOCATIONS ---'],
          ['Location / State', 'Listings', 'Enquiries'],
          ...topLocations.map((l) => [l.name, l.listings, l.enquiries]),
          [],
          ['--- RECENT ENQUIRIES ---'],
          ['Customer', 'Machine / Listing', 'Type', 'Date'],
          ...recentEnquiries.map((enq) => [enq.customer, enq.listing, enq.type, enq.date]),
        ]

        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `MachineWallah_Analytics_${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToast('Analytics CSV report downloaded successfully!')
      } catch (err) {
        console.error('Export error:', err)
        showToast('Export failed')
      }
    } else {
      window.print()
      showToast('Print / Save PDF dialog opened.')
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Reports & Analytics</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Get detailed insights about your platform performance, users, listings and revenue.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap relative">
          {/* Refresh Live Data */}
          <button
            type="button"
            onClick={() => {
              fetchAllAnalytics()
              showToast('Refreshed analytics metrics from MongoDB Atlas.')
            }}
            title="Refresh analytics data"
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 top-10 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 animate-in fade-in duration-150">
                {['Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Year'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleRangeChange(opt)}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      dateRange === opt ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report CTA */}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 1. 4 Metric / KPI Cards */}
      <AnalyticsStatsCards stats={overviewStats} />

      {/* 2. Navigation Tabs */}
      <AnalyticsTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          showToast(`Filtered view: ${tab.toUpperCase()}`)
        }}
      />

      {/* Tab Specific Content Render */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Row 1 - 3 Growth / Overview Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UsersGrowthChart
              points={growthData.usersGrowth}
              range={dateRange}
              onRangeChange={handleRangeChange}
            />
            <ListingsGrowthChart
              points={growthData.listingsGrowth}
              range={dateRange}
              onRangeChange={handleRangeChange}
            />
            <RevenueOverviewChart
              groups={growthData.revenueOverview}
              range={dateRange}
              onRangeChange={handleRangeChange}
            />
          </div>

          {/* Row 2 - Top Categories, Top Locations, Listing Status Donut */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TopCategoriesCard
              categories={topCategories}
              onViewAll={() => navigate('/manage-category')}
            />
            <TopLocationsCard
              locations={topLocations}
              onViewAll={() => navigate('/locations')}
            />
            <ListingStatusDonutCard data={listingStatus} />
          </div>

          {/* Row 3 - Recent Enquiries, Top Performing Listings, User Type Donut */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RecentEnquiriesCard
              enquiries={recentEnquiries}
              onViewAll={() => navigate('/customer-enquiry')}
            />
            <TopPerformingListingsCard
              listings={topListings}
              onViewAll={() => navigate('/listings')}
            />
            <UserTypeDonutCard data={userTypes} />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <UsersGrowthChart
                points={growthData.usersGrowth}
                range={dateRange}
                onRangeChange={handleRangeChange}
              />
            </div>
            <div>
              <UserTypeDonutCard data={userTypes} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RecentEnquiriesCard
                enquiries={recentEnquiries}
                onViewAll={() => navigate('/customer-enquiry')}
              />
            </div>
            <div>
              <TopLocationsCard
                locations={topLocations}
                onViewAll={() => navigate('/locations')}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ListingsGrowthChart
                points={growthData.listingsGrowth}
                range={dateRange}
                onRangeChange={handleRangeChange}
              />
            </div>
            <div>
              <ListingStatusDonutCard data={listingStatus} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TopCategoriesCard
              categories={topCategories}
              onViewAll={() => navigate('/manage-category')}
            />
            <TopPerformingListingsCard
              listings={topListings}
              onViewAll={() => navigate('/listings')}
            />
            <TopLocationsCard
              locations={topLocations}
              onViewAll={() => navigate('/locations')}
            />
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RevenueOverviewChart
                groups={growthData.revenueOverview}
                range={dateRange}
                onRangeChange={handleRangeChange}
              />
            </div>
            <div>
              <ListingStatusDonutCard data={listingStatus} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopPerformingListingsCard
              listings={topListings}
              onViewAll={() => navigate('/listings')}
            />
            <TopCategoriesCard
              categories={topCategories}
              onViewAll={() => navigate('/manage-category')}
            />
          </div>
        </div>
      )}

      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RecentEnquiriesCard
                enquiries={recentEnquiries}
                onViewAll={() => navigate('/customer-enquiry')}
              />
            </div>
            <div>
              <TopLocationsCard
                locations={topLocations}
                onViewAll={() => navigate('/locations')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopCategoriesCard
              categories={topCategories}
              onViewAll={() => navigate('/manage-category')}
            />
            <TopPerformingListingsCard
              listings={topListings}
              onViewAll={() => navigate('/listings')}
            />
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TopPerformingListingsCard
                listings={topListings}
                onViewAll={() => navigate('/listings')}
              />
            </div>
            <div>
              <ListingStatusDonutCard data={listingStatus} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopCategoriesCard
              categories={topCategories}
              onViewAll={() => navigate('/manage-category')}
            />
            <RecentEnquiriesCard
              enquiries={recentEnquiries}
              onViewAll={() => navigate('/customer-enquiry')}
            />
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TopLocationsCard
                locations={topLocations}
                onViewAll={() => navigate('/locations')}
              />
            </div>
            <div>
              <ListingStatusDonutCard data={listingStatus} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopCategoriesCard
              categories={topCategories}
              onViewAll={() => navigate('/manage-category')}
            />
            <RecentEnquiriesCard
              enquiries={recentEnquiries}
              onViewAll={() => navigate('/customer-enquiry')}
            />
          </div>
        </div>
      )}

      {/* --- EXPORT REPORT MODAL --- */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#F5A623]" />
                <span>Export Analytics Report</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      exportFormat === 'csv'
                        ? 'border-[#F5A623] bg-amber-50/40 text-slate-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="text-[#F5A623] focus:ring-[#F5A623]"
                    />
                    <span className="text-xs">Excel / CSV (.csv)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      exportFormat === 'pdf'
                        ? 'border-[#F5A623] bg-amber-50/40 text-slate-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={() => setExportFormat('pdf')}
                      className="text-[#F5A623] focus:ring-[#F5A623]"
                    />
                    <span className="text-xs">PDF Document (.pdf)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Date Range
                </label>
                <input
                  type="text"
                  readOnly
                  value={dateRange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Download Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
