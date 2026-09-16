import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus, UserPlus, Edit3, Trash2, AlertTriangle, X, Check, Loader2, Camera, UploadCloud } from 'lucide-react'
import { ProfileStatsCards } from '../../components/profile/ProfileStatsCards'
import { ProfileFilters } from '../../components/profile/ProfileFilters'
import { ProfileTable } from '../../components/profile/ProfileTable'
import { UserProfilePanel } from '../../components/profile/UserProfilePanel'
import { Toast } from '../../components/common/Toast'
import { userService } from '../../services/userService'
import { uploadService } from '../../services/uploadService'

// Helper component for Profile Image File Picker & Preview
function AvatarUploadField({ avatar, onFileChange, onRemove, isUploading }) {
  const fullSrc = avatar
    ? avatar.startsWith('http')
      ? avatar
      : avatar.startsWith('/uploads')
      ? `http://localhost:5000${avatar}`
      : avatar
    : ''

  return (
    <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 border-2 border-amber-300 shrink-0 flex items-center justify-center shadow-xs">
        {fullSrc ? (
          <img
            src={fullSrc}
            alt="Profile Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <Camera className="w-6 h-6 text-slate-400" />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-800">Profile Picture</div>
        <div className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WEBP up to 5MB</div>
        <div className="flex items-center gap-2 mt-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#F5A623] hover:text-[#D98200] text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs">
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>{isUploading ? 'Uploading...' : avatar ? 'Change Photo' : 'Upload Photo'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={onFileChange}
            />
          </label>
          {avatar && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ManageProfilePage() {
  const [users, setUsers] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, customers: 0, owners: 0, admins: 0, active: 0, inactive: 0, blocked: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  // Side Drawer
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Pagination & selection
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])

  // Filters
  const [activeTab, setActiveTab] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteModalUser, setDeleteModalUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // Create User Form
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'Customer',
    status: 'Active',
    location: '',
    city: '',
    state: '',
    address: '',
    dob: '',
    gender: 'Male',
    businessName: '',
    password: '',
    role: 'Admin',
    avatar: '',
  })

  // Edit User Form
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'Customer',
    status: 'Active',
    location: '',
    address: '',
    dob: '',
    gender: 'Male',
    businessName: '',
    avatar: '',
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Photo Upload Handler (Uploads image to backend /uploads/profiles, NOT Cloudinary)
  const handlePhotoUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5 MB')
      return
    }

    setIsUploadingPhoto(true)
    try {
      const res = await uploadService.uploadImage(file, 'profiles')
      if (res?.success && res.data) {
        const avatarUrl = res.data.url || res.data.relativePath
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, avatar: avatarUrl }))
        } else {
          setCreateForm((prev) => ({ ...prev, avatar: avatarUrl }))
        }
        showToast('Profile photo uploaded successfully')
      }
    } catch (err) {
      console.error('Photo upload error:', err)
      showToast('Failed to upload profile photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // Quick photo upload from drawer
  const handleDrawerPhotoUpload = async (user, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5 MB')
      return
    }
    try {
      const res = await uploadService.uploadImage(file, 'profiles')
      if (res?.success && res.data) {
        const avatarUrl = res.data.url || res.data.relativePath
        const userId = user._id || user.id
        await userService.updateUser(userId, { avatar: avatarUrl, userType: user.userType })
        showToast('Profile photo updated successfully')
        setSelectedUser((prev) => ({ ...prev, avatar: avatarUrl }))
        fetchUsers()
      }
    } catch (err) {
      console.error('Drawer photo upload error:', err)
      showToast('Failed to update photo')
    }
  }

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)
    try {
      const res = await userService.getStats()
      if (res?.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Error fetching user stats:', err)
    } finally {
      setIsStatsLoading(false)
    }
  }, [])

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }

      if (activeTab !== 'All') {
        params.userType = activeTab
      } else if (userTypeFilter !== 'All') {
        params.userType = userTypeFilter
      }

      if (statusFilter !== 'All') params.status = statusFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const res = await userService.getUsers(params)
      if (res?.success && res.data) {
        setUsers(res.data.users || [])
        setTotalCount(res.data.total || 0)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      showToast('Failed to load users from database')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, activeTab, userTypeFilter, statusFilter, searchTerm])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setUserTypeFilter(tab === 'All' ? 'All' : tab)
    setCurrentPage(1)
  }

  const handleSearchChange = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleUserTypeChange = (type) => {
    setUserTypeFilter(type)
    if (type !== 'All') setActiveTab(type)
    else setActiveTab('All')
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setActiveTab('All')
    setSearchTerm('')
    setUserTypeFilter('All')
    setStatusFilter('All')
    setCurrentPage(1)
    showToast('Filters reset')
  }

  // Row selection
  const handleToggleSelect = (userKey) => {
    setSelectedIds((prev) =>
      prev.includes(userKey) ? prev.filter((id) => id !== userKey) : [...prev, userKey]
    )
  }

  const handleSelectAll = () => {
    if (users.every((u) => selectedIds.includes(u._id || u.id))) {
      setSelectedIds([])
    } else {
      setSelectedIds(users.map((u) => u._id || u.id))
    }
  }

  // Action Menu
  const handleMenuToggle = (id) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const handleAction = async (action, user) => {
    setActiveMenu(null)
    const userId = user._id || user.id

    if (action === 'view') {
      try {
        const detailsRes = await userService.getUserById(userId, user.userType)
        if (detailsRes?.success && detailsRes.data) {
          setSelectedUser(detailsRes.data)
        } else {
          setSelectedUser(user)
        }
      } catch {
        setSelectedUser(user)
      }
    } else if (action === 'edit') {
      setEditingUser(user)
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        userType: user.userType || 'Customer',
        status: user.status || 'Active',
        location: user.location || '',
        address: user.address || '',
        dob: user.dob || '',
        gender: user.gender || 'Male',
        businessName: user.businessName || '',
      })
    } else if (action === 'deactivate' || action === 'activate') {
      const newStatus = action === 'deactivate' ? 'Inactive' : 'Active'
      try {
        await userService.updateStatus(userId, newStatus, user.userType)
        showToast(`${user.name} status updated to ${newStatus}`)
        fetchUsers()
        fetchStats()
        if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
          setSelectedUser((prev) => ({ ...prev, status: newStatus }))
        }
      } catch (err) {
        showToast('Failed to update status')
      }
    } else if (action === 'block' || action === 'unblock') {
      const newStatus = action === 'block' ? 'Blocked' : 'Active'
      try {
        await userService.updateStatus(userId, newStatus, user.userType)
        showToast(`${user.name} ${action === 'block' ? 'blocked' : 'unblocked'}`)
        fetchUsers()
        fetchStats()
        if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
          setSelectedUser((prev) => ({ ...prev, status: newStatus }))
        }
      } catch (err) {
        showToast('Failed to update user status')
      }
    } else if (action === 'delete') {
      setDeleteModalUser(user)
    }
  }

  // Create User Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim() || !createForm.email.trim()) {
      showToast('Name and Email are required')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await userService.createUser(createForm)
      if (res?.success) {
        showToast(`${createForm.userType} user created successfully`)
        setIsCreateModalOpen(false)
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          userType: 'Customer',
          status: 'Active',
          location: '',
          city: '',
          state: '',
          address: '',
          dob: '',
          gender: 'Male',
          businessName: '',
          password: '',
          role: 'Admin',
        })
        fetchUsers()
        fetchStats()
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingUser) return

    setIsSubmitting(true)
    const userId = editingUser._id || editingUser.id
    try {
      const res = await userService.updateUser(userId, editForm)
      if (res?.success) {
        showToast('User profile updated successfully')
        setEditingUser(null)
        fetchUsers()
        fetchStats()
        if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
          setSelectedUser(res.data)
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return
    setIsSubmitting(true)
    const userId = deleteModalUser._id || deleteModalUser.id
    try {
      await userService.deleteUser(userId, deleteModalUser.userType)
      showToast(`User ${deleteModalUser.name} deleted permanently`)
      setDeleteModalUser(null)
      if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
        setSelectedUser(null)
      }
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast('Failed to delete user')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      showToast('No users available to export')
      return
    }

    const headers = ['#', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Location', 'Joined On']
    const rows = users.map((u, i) => [
      i + 1,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      u.userType,
      u.status,
      `"${(u.location || '').replace(/"/g, '""')}"`,
      u.joinedOn,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `machinery_wallah_users_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported users to CSV successfully')
  }

  return (
    <div className="space-y-5" onClick={() => activeMenu && setActiveMenu(null)}>
      <Toast message={toastMessage} />

      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
          <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-semibold">Manage Profile</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
              Manage Profile
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
              Live database directory of platform users (Customers, Owners, and Admins).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F5A623] hover:bg-[#E09400] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F5A623]/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <ProfileStatsCards stats={stats} isLoading={isStatsLoading} />

      {/* Filters & Tabs */}
      <ProfileFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        userTypeFilter={userTypeFilter}
        onUserTypeChange={handleUserTypeChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
        counts={{
          all: stats.total || 0,
          customers: stats.customers || 0,
          owners: stats.owners || 0,
          admins: stats.admins || 0,
        }}
        onExport={handleExportCSV}
      />

      {/* Dynamic Users Table */}
      <ProfileTable
        users={users}
        totalCount={totalCount}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onSelectUser={async (user) => {
          setActiveMenu(null)
          try {
            const res = await userService.getUserById(user._id || user.id, user.userType)
            if (res?.success && res.data) {
              setSelectedUser(res.data)
            } else {
              setSelectedUser(user)
            }
          } catch {
            setSelectedUser(user)
          }
        }}
        activeMenu={activeMenu}
        onMenuToggle={handleMenuToggle}
        onAction={handleAction}
      />

      {/* User Profile Side Panel */}
      {selectedUser && (
        <UserProfilePanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={(u) => {
            setEditingUser(u)
            setEditForm({
              name: u.name || '',
              email: u.email || '',
              phone: u.phone || '',
              userType: u.userType || 'Customer',
              status: u.status || 'Active',
              location: u.location || '',
              address: u.address || '',
              dob: u.dob || '',
              gender: u.gender || 'Male',
              businessName: u.businessName || '',
            })
          }}
          onToggleStatus={async (u) => {
            const newStatus = u.status === 'Active' ? 'Inactive' : 'Active'
            const userId = u._id || u.id
            await userService.updateStatus(userId, newStatus, u.userType)
            showToast(`${u.name} marked ${newStatus}`)
            setSelectedUser((prev) => ({ ...prev, status: newStatus }))
            fetchUsers()
            fetchStats()
          }}
          onToggleBlock={async (u) => {
            const newStatus = u.status === 'Blocked' ? 'Active' : 'Blocked'
            const userId = u._id || u.id
            await userService.updateStatus(userId, newStatus, u.userType)
            showToast(`${u.name} ${newStatus === 'Blocked' ? 'blocked' : 'unblocked'}`)
            setSelectedUser((prev) => ({ ...prev, status: newStatus }))
            fetchUsers()
            fetchStats()
          }}
          onUploadAvatar={handleDrawerPhotoUpload}
        />
      )}

      {/* Modal: Add New User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#F5A623] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Add New User</h3>
                  <p className="text-[11px] text-slate-500">Register Customer, Owner, or Admin into MongoDB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Profile Photo Picker */}
              <AvatarUploadField
                avatar={createForm.avatar}
                isUploading={isUploadingPhoto}
                onFileChange={(e) => handlePhotoUpload(e, false)}
                onRemove={() => setCreateForm((prev) => ({ ...prev, avatar: '' }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    User Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={createForm.userType}
                    onChange={(e) => setCreateForm({ ...createForm, userType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white font-medium"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="ramesh@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={createForm.gender}
                    onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {createForm.userType === 'Admin' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Admin Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Admin Role
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Business / Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={createForm.businessName}
                    onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                    placeholder="e.g. Patel Earthmovers & Machinery"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="Lucknow, Uttar Pradesh"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={createForm.dob}
                    onChange={(e) => setCreateForm({ ...createForm, dob: e.target.value })}
                    placeholder="15 Aug 1995"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#F5A623] hover:bg-[#E09400] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Profile */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !isSubmitting && setEditingUser(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Edit User Profile</h3>
                  <p className="text-[11px] text-slate-500">Update account info for {editingUser.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Profile Photo Picker */}
              <AvatarUploadField
                avatar={editForm.avatar}
                isUploading={isUploadingPhoto}
                onFileChange={(e) => handlePhotoUpload(e, true)}
                onRemove={() => setEditForm((prev) => ({ ...prev, avatar: '' }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  placeholder="Business or firm name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#F5A623] hover:bg-[#E09400] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => !isSubmitting && setDeleteModalUser(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Delete User Account</h3>
                <p className="text-[11px] text-slate-500">Role: {deleteModalUser.userType}</p>
              </div>
            </div>

            <p className="text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete user <span className="font-bold text-slate-800">{deleteModalUser.name}</span> ({deleteModalUser.email})? This action will remove the account from MongoDB and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
