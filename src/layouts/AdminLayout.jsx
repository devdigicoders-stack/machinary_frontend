import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/dashboard/Sidebar'
import { Header } from '../components/dashboard/Header'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active sidebar tab based on current pathname
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('customer-enquiry') || path.includes('enquiries') || path.includes('enquiry')) {
      return 'Manage Customer Enquiry'
    }
    if (path.includes('manage-customers') || path.includes('customer')) {
      return 'Manage Customers'
    }
    if (path.includes('manage-owners') || path.includes('owners') || path.includes('owner')) {
      return 'Manage Owners'
    }
    if (path.includes('manage-machines') || path.includes('machine') || path.includes('vehicle')) {
      return 'Manage Machine / Vehicle'
    }
    if (path.includes('manage-category') || path.includes('categories') || path.includes('category')) {
      return 'Manage Category'
    }
    if (path.includes('approval')) {
      return 'Listing Approval / Rejection'
    }
    if (path.includes('buy-rent')) {
      return 'Manage Buy / Rent Listing'
    }
    if (path.includes('reported')) {
      return 'Manage Reported Listing'
    }
    if (path.includes('promoted') || path.includes('featured')) {
      return 'Featured / Promoted Listings'
    }
    if (path.includes('listings') || path.includes('listing')) {
      return 'Manage Listing'
    }
    if (path.includes('location')) {
      return 'Manage Location'
    }
    if (path.includes('website-content') || path.includes('content')) {
      return 'Manage Website Content'
    }
    if (path.includes('notification')) {
      return 'Manage Notifications'
    }
    if (path.includes('analytics') || path.includes('report')) {
      return 'Reports & Analytics'
    }
    if (path.includes('support') || path.includes('complaint')) {
      return 'Manage Complaint & Support'
    }
    if (path.includes('password')) {
      return 'Change Password'
    }
    if (path.includes('profile/manage') || path.includes('manage-profile')) {
      return 'Manage Profile'
    }
    if (path === '/profile' || path.includes('my-profile')) {
      return 'My profile'
    }
    return 'Dashboard'
  }

  const handleTabChange = (tabName) => {
    setSidebarOpen(false)
    if (tabName === 'Dashboard') {
      navigate('/dashboard')
    } else if (tabName === 'Manage Customers') {
      navigate('/manage-customers')
    } else if (tabName === 'Manage Customer Enquiry' || tabName === 'Customer Enquiry') {
      navigate('/customer-enquiry')
    } else if (tabName === 'Manage Owners') {
      navigate('/manage-owners')
    } else if (tabName === 'Manage Machine / Vehicle') {
      navigate('/manage-machines')
    } else if (tabName === 'Manage Category') {
      navigate('/manage-category')
    } else if (tabName === 'Manage Listing') {
      navigate('/listings')
    } else if (tabName === 'Listing Approval / Rejection') {
      navigate('/listing-approval')
    } else if (tabName === 'Manage Buy / Rent Listing') {
      navigate('/buy-rent-listings')
    } else if (tabName === 'Manage Reported Listing') {
      navigate('/reported-listings')
    } else if (tabName === 'Featured / Promoted Listings') {
      navigate('/promoted-listings')
    } else if (tabName === 'Manage Location') {
      navigate('/locations')
    } else if (tabName === 'Manage Website Content') {
      navigate('/website-content')
    } else if (tabName === 'Manage Notifications') {
      navigate('/notifications')
    } else if (tabName === 'Reports & Analytics') {
      navigate('/analytics')
    } else if (tabName === 'Manage Complaint & Support') {
      navigate('/support')
    } else if (tabName === 'My profile' || tabName === 'My Profile') {
      navigate('/profile')
    } else if (tabName === 'Manage Profile') {
      navigate('/profile/manage')
    } else if (tabName === 'Change Password') {
      navigate('/profile/password')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex antialiased selection:bg-[#F5A623] selection:text-slate-900">
      
      {/* Sidebar - Single persistent instance across all pages */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area - Note: No overflow-x-hidden here so sticky top-0 in Header works reliably */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-68">
        
        {/* Unified Sticky Header - Sticks permanently to top on every page */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
