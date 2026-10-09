import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Layers,
  FolderTree,
  Truck,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { categoryService } from '../../services/categoryService'
import { getImageUrl } from '../../utils/imageUtils'
import { Toast } from '../../components/common/Toast'

export default function CategoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const res = await categoryService.getCategoryById(id)
      const data = res?.data || res
      setCategory(data)
    } catch (err) {
      console.error('Failed to load category:', err)
      showToast(err?.response?.data?.message || 'Failed to load category details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCategory()
    }
  }, [id])

  const handleStatusToggle = async () => {
    if (!category) return
    const currentId = category._id || category.id
    const nextStatus = category.status === 'Active' ? 'Inactive' : 'Active'
    try {
      setIsUpdatingStatus(true)
      const res = await categoryService.toggleStatus(currentId, nextStatus)
      if (res.success) {
        showToast(`Category status changed to "${nextStatus}"`)
        setCategory((prev) => ({ ...prev, status: nextStatus }))
      } else {
        showToast(res.message || 'Failed to update status')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getTypeBadge = (type) => {
    const t = (type || 'rent').toLowerCase()
    switch (t) {
      case 'rent':
        return {
          label: 'Rent Machine',
          icon: '🏗️',
          cls: 'bg-blue-50 text-blue-700 border-blue-200',
          desc: 'Excavators, Cranes, Heavy rental fleet',
        }
      case 'sell':
        return {
          label: 'Sell Machine',
          icon: '🤝',
          cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          desc: 'Direct buy & sale equipment & machinery',
        }
      case 'transport':
        return {
          label: 'Transport Vehicle',
          icon: '🚛',
          cls: 'bg-purple-50 text-purple-700 border-purple-200',
          desc: 'Heavy low-bed trailers, tippers, pullers',
        }
      case 'material':
        return {
          label: 'Material Supply',
          icon: '🧱',
          cls: 'bg-amber-50 text-amber-800 border-amber-200',
          desc: 'RMC, Cement, Sand, Steel & Aggregates',
        }
      default:
        return {
          label: 'Rent Machine',
          icon: '🏗️',
          cls: 'bg-blue-50 text-blue-700 border-blue-200',
          desc: 'Rental machinery classification',
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-[#F5A623] animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading category details...</p>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl">
          📂
        </div>
        <h2 className="text-lg font-black text-slate-900">Category Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested category record could not be found or may have been deleted.
        </p>
        <button
          onClick={() => navigate('/manage-category')}
          className="px-5 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </button>
      </div>
    )
  }

  const typeInfo = getTypeBadge(category.categoryType)
  const isActive = category.status === 'Active'

  const createdDate = category.createdAt
    ? new Date(category.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recent'

  const updatedDate = category.updatedAt
    ? new Date(category.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Toast message={toastMessage} />

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/manage-category" className="hover:text-slate-700 transition-colors">
              Manage Category
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold truncate max-w-[200px]">
              {category.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/manage-category')}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2.5">
                <span>{category.name}</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {category.status}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                slug: /{category.slug || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={isUpdatingStatus}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50 ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isUpdatingStatus ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isActive ? (
              <XCircle className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            <span>{isActive ? 'Deactivate Category' : 'Activate Category'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/manage-category?edit=${category._id || category.id}`)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-2 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Category</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Banner & Overview / Right Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Category Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Banner Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="relative h-64 bg-slate-900 flex items-center justify-center overflow-hidden p-6">
              {category.image ? (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="w-full h-full object-contain drop-shadow-xl"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="text-center text-slate-500 space-y-2">
                  <div className="text-5xl">{typeInfo.icon}</div>
                  <p className="text-xs font-semibold">No Image Uploaded for Category</p>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border shadow-xs ${typeInfo.cls}`}
                >
                  <span>{typeInfo.icon}</span>
                  <span>{typeInfo.label}</span>
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                  Category Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {category.description || 'No detailed description provided for this category.'}
                </p>
              </div>

              {/* Module Info */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xl font-bold">
                  {typeInfo.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    Business Module: {typeInfo.label}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{typeInfo.desc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Catalog Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <FolderTree className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Total Subcategories</span>
                <div className="text-2xl font-black text-slate-900">
                  {category.subcategories || 1}
                </div>
                <span className="text-[11px] text-sky-600 font-semibold">Classified models</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Listed Machinery</span>
                <div className="text-2xl font-black text-slate-900">
                  {category.machinesCount || 0}
                </div>
                <span className="text-[11px] text-amber-600 font-semibold">Active in fleet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Metadata & Quick Actions */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F5A623]" />
              <span>System Metadata</span>
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Category ID</span>
                <span className="font-mono text-slate-700 select-all font-bold">
                  {category._id || category.id}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">URL Slug</span>
                <span className="font-mono text-slate-800 font-bold">/{category.slug}</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Module Type</span>
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  {category.categoryType || 'rent'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Status</span>
                <span
                  className={`font-black ${
                    isActive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {category.status}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Created Date</span>
                <span className="font-bold text-slate-800">{createdDate}</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Last Updated</span>
                <span className="font-bold text-slate-800">{updatedDate}</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Catalog Management</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modifications made to this category are immediately reflected across the
              Flutter mobile application and search filters.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to={category?.name ? `/manage-machines?category=${encodeURIComponent(category.name)}` : '/manage-machines'}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold text-center transition-all cursor-pointer"
              >
                View Machines In Catalog
              </Link>
              <Link
                to="/manage-category"
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black text-center transition-all cursor-pointer shadow-xs"
              >
                Back to All Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
