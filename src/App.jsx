import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import ManageCustomersPage from './pages/customers/ManageCustomersPage'
import CustomerEnquiryPage from './pages/enquiries/CustomerEnquiryPage'
import ManageOwnersPage from './pages/owners/ManageOwnersPage'
import ManageMachinesPage from './pages/machines/ManageMachinesPage'
import ManageCategoryPage from './pages/categories/ManageCategoryPage'
import ManageListingsPage from './pages/listings/ManageListingsPage'
import ManageReportedListingsPage from './pages/reported/ManageReportedListingsPage'
import ManageFeaturedListingsPage from './pages/featured/ManageFeaturedListingsPage'
import ManageLocationPage from './pages/location/ManageLocationPage'
import ManageWebsiteContentPage from './pages/content/ManageWebsiteContentPage'
import ManageNotificationsPage from './pages/notifications/ManageNotificationsPage'
import ReportsAnalyticsPage from './pages/analytics/ReportsAnalyticsPage'
import ManageComplaintPage from './pages/support/ManageComplaintPage'
import ManageProfilePage from './pages/profile/ManageProfilePage'
import MyProfilePage from './pages/profile/MyProfilePage'
import ChangePasswordPage from './pages/profile/ChangePasswordPage'
import ListingApprovalPage from './pages/listings/ListingApprovalPage'
import ManageBuyRentListingPage from './pages/listings/ManageBuyRentListingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route - Standalone without sidebar/header */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Admin Routes - Wrapped in unified AdminLayout with sticky header */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/manage-customers" element={<ManageCustomersPage />} />
          <Route path="/customers" element={<ManageCustomersPage />} />
          <Route path="/customer-enquiry" element={<CustomerEnquiryPage />} />
          <Route path="/enquiries" element={<CustomerEnquiryPage />} />
          <Route path="/manage-owners" element={<ManageOwnersPage />} />
          <Route path="/owners" element={<ManageOwnersPage />} />
          <Route path="/manage-machines" element={<ManageMachinesPage />} />
          <Route path="/machines" element={<ManageMachinesPage />} />
          <Route path="/manage-category" element={<ManageCategoryPage />} />
          <Route path="/categories" element={<ManageCategoryPage />} />
          
          {/* Listings & Moderation routes */}
          <Route path="/listings" element={<ManageListingsPage />} />
          <Route path="/manage-listings" element={<ManageListingsPage />} />
          <Route path="/listing-approval" element={<ListingApprovalPage />} />
          <Route path="/listing-approvals" element={<ListingApprovalPage />} />
          <Route path="/listings/approval" element={<ListingApprovalPage />} />
          <Route path="/buy-rent-listings" element={<ManageBuyRentListingPage />} />
          <Route path="/manage-buy-rent" element={<ManageBuyRentListingPage />} />
          
          <Route path="/reported-listings" element={<ManageReportedListingsPage />} />
          <Route path="/manage-reported-listing" element={<ManageReportedListingsPage />} />
          <Route path="/promoted-listings" element={<ManageFeaturedListingsPage />} />
          <Route path="/featured-listings" element={<ManageFeaturedListingsPage />} />
          <Route path="/locations" element={<ManageLocationPage />} />
          <Route path="/manage-location" element={<ManageLocationPage />} />
          <Route path="/manage-locations" element={<ManageLocationPage />} />
          <Route path="/website-content" element={<ManageWebsiteContentPage />} />
          <Route path="/manage-website-content" element={<ManageWebsiteContentPage />} />
          <Route path="/notifications" element={<ManageNotificationsPage />} />
          <Route path="/manage-notifications" element={<ManageNotificationsPage />} />
          <Route path="/analytics" element={<ReportsAnalyticsPage />} />
          <Route path="/reports" element={<ReportsAnalyticsPage />} />
          <Route path="/support" element={<ManageComplaintPage />} />
          <Route path="/manage-complaint" element={<ManageComplaintPage />} />
          
          {/* Profile & Security routes */}
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/profile/manage" element={<ManageProfilePage />} />
          <Route path="/manage-profile" element={<ManageProfilePage />} />
          <Route path="/profile/password" element={<ChangePasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          
          <Route path="/reports-analytics" element={<ReportsAnalyticsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
