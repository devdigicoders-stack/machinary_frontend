import {
  X,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Gauge,
  Weight,
  Fuel,
  Calendar,
  User,
  Edit3,
} from 'lucide-react'
import { getImageUrl } from '../../utils/imageUtils'

export function MachineDetailDrawer({
  isOpen = false,
  machine,
  onClose,
  onStatusToggle,
  onEditClick,
}) {
  if (!isOpen || !machine) return null

  const id = machine._id || machine.id
  const isActive = machine.status === 'Active'

  const addedOnFormatted = machine.createdAt
    ? new Date(machine.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : machine.addedOn || 'Recent'

  return (
    <>
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 2. Slide-Over Sheet */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Machine Image */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center">
              <img
                src={
                  getImageUrl(machine.image) ||
                  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=80'
                }
                alt={machine.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '🚜'
                }}
              />
            </div>

            {/* Title & Badges */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  {machine.name}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : machine.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {machine.status || 'Active'}
                </span>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md border bg-sky-50 text-sky-700 border-sky-200">
                  {machine.listingType || 'Rent'}
                </span>
              </div>

              <div className="text-xs text-slate-500 font-medium mt-1 truncate">
                {machine.subtitle || `${machine.brand || ''} ${machine.model || ''}`}
              </div>

              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Added {addedOnFormatted}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* Registration & Category Card */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Identification & Classification
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10.5px] text-slate-400 font-semibold">
                  Registration No.
                </div>
                <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                  {machine.regNo}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10.5px] text-slate-400 font-semibold">
                  Category
                </div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {machine.category}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10.5px] text-slate-400 font-semibold">
                  Equipment Type
                </div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {machine.machineType || 'Construction'}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10.5px] text-slate-400 font-semibold">
                  Model Year
                </div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {machine.year || '2023'}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Technical Specifications
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Engine Power</div>
                  <div className="font-bold text-slate-800">
                    {machine.specifications?.enginePower || 'Standard HP'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Weight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Operating Weight</div>
                  <div className="font-bold text-slate-800">
                    {machine.specifications?.operatingWeight || 'Standard Tonnage'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Fuel className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Fuel Type</div>
                  <div className="font-bold text-slate-800">
                    {machine.specifications?.fuelType || 'Diesel'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Meter Hours</div>
                  <div className="font-bold text-slate-800">
                    {machine.specifications?.meterHours || 'Not recorded'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner & Location Details */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Owner & Assigned Location
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-semibold">Registered Owner</div>
                  <div className="font-bold text-slate-800 truncate">{machine.owner}</div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-semibold">Machine Base</div>
                  <div className="font-bold text-slate-800 truncate">{machine.location}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStatusToggle(id, isActive ? 'Inactive' : 'Active')}
              className={`px-3 py-2 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isActive ? (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Deactivate Machine</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Activate Machine</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                onEditClick(machine)
              }}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  )
}
