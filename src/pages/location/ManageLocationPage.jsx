import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  ChevronDown,
  ChevronRight,
  X,
  Globe,
  Building2,
  Building,
  MapPin,
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  Edit3,
} from 'lucide-react'
import { LocationStatsCards } from '../../components/location/LocationStatsCards'
import { CountriesTableSection } from '../../components/location/CountriesTableSection'
import { StatesTableBox } from '../../components/location/StatesTableBox'
import { CitiesTableBox } from '../../components/location/CitiesTableBox'
import { Toast } from '../../components/common/Toast'
import { locationService } from '../../services/locationService'

export default function ManageLocationPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [activeTab, setActiveTab] = useState('countries')

  // Dropdown for + Add Location
  const [showAddMenu, setShowAddMenu] = useState(false)

  // Modals state
  const [showAddCountryModal, setShowAddCountryModal] = useState(false)
  const [showAddStateModal, setShowAddStateModal] = useState(false)
  const [showAddCityModal, setShowAddCityModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingCity, setEditingCity] = useState(null)

  // KPI Stats
  const [stats, setStats] = useState({
    totalCountries: 1,
    totalStates: 28,
    totalCities: 112,
    totalPincodes: 8136,
    activeCities: 112,
    inactiveCities: 0,
  })

  // Selected State for displaying Cities
  const [selectedState, setSelectedState] = useState({
    id: 'Uttar Pradesh',
    name: 'Uttar Pradesh',
    code: 'UP',
  })

  // Database Collections
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

  // Form State for Add State
  const [newStateName, setNewStateName] = useState('')
  const [newStateCode, setNewStateCode] = useState('')

  // Form State for Add City
  const [newCityName, setNewCityName] = useState('')
  const [newCityState, setNewCityState] = useState('Uttar Pradesh')
  const [newCityPincodes, setNewCityPincodes] = useState('25')
  const [newCityTier, setNewCityTier] = useState('Tier 2')

  // Form State for Add Country
  const [newCountryName, setNewCountryName] = useState('')
  const [newCountryCode, setNewCountryCode] = useState('')
  const [newCountryFlag, setNewCountryFlag] = useState('🌍')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // 1. Fetch Stats, Countries, States from Atlas
  const fetchLocationData = useCallback(async () => {
    try {
      setLoading(true)
      const [statsRes, countriesRes, statesRes] = await Promise.allSettled([
        locationService.getStats(),
        locationService.getCountries(),
        locationService.getStates({ country: 'India' }),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data)
      }

      if (countriesRes.status === 'fulfilled' && Array.isArray(countriesRes.value?.data)) {
        setCountries(countriesRes.value.data)
      }

      if (statesRes.status === 'fulfilled' && Array.isArray(statesRes.value?.data)) {
        const stateList = statesRes.value.data
        setStates(stateList)
        if (stateList.length > 0 && !selectedState?.name) {
          setSelectedState({
            id: stateList[0].name,
            name: stateList[0].name,
            code: stateList[0].code,
          })
        }
      }
    } catch (err) {
      console.error('Failed to load location data:', err)
      showToast('Error loading location data from server')
    } finally {
      setLoading(false)
    }
  }, [selectedState?.name])

  // 2. Fetch Cities when selectedState changes
  const fetchCitiesForState = useCallback(async (stateName) => {
    if (!stateName) return
    try {
      setLoadingCities(true)
      const res = await locationService.getCities({ state: stateName, limit: 150 })
      const cityList = res?.data?.cities || []
      setCities(cityList)
    } catch (err) {
      console.error(`Failed to load cities for ${stateName}:`, err)
      showToast(`Error loading cities for ${stateName}`)
    } finally {
      setLoadingCities(false)
    }
  }, [])

  useEffect(() => {
    fetchLocationData()
  }, [fetchLocationData])

  useEffect(() => {
    if (selectedState?.name) {
      fetchCitiesForState(selectedState.name)
      setNewCityState(selectedState.name)
    }
  }, [selectedState?.name, fetchCitiesForState])

  // Select a State from States table
  const handleSelectState = (st) => {
    setSelectedState({
      id: st.id || st.name,
      name: st.name,
      code: st.code,
    })
    showToast(`Loaded cities in ${st.name}`)
  }

  // Toggle Country Status
  const handleCountryStatusChange = (id, newStatus) => {
    setCountries((prev) =>
      prev.map((c) => (c.id === id || c._id === id ? { ...c, status: newStatus } : c))
    )
    showToast(`Country status updated to ${newStatus}`)
  }

  // Toggle State Status
  const handleStateStatusChange = async (stateName, newStatus) => {
    try {
      await locationService.toggleStateStatus(stateName, newStatus)
      showToast(`All cities in "${stateName}" marked as ${newStatus}`)
      fetchLocationData()
      if (selectedState?.name === stateName) {
        fetchCitiesForState(stateName)
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update state status')
    }
  }

  // Toggle City Status
  const handleCityStatusChange = async (cityId, newStatus) => {
    try {
      await locationService.toggleLocationStatus(cityId)
      showToast(`City status updated to ${newStatus}`)
      if (selectedState?.name) {
        fetchCitiesForState(selectedState.name)
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update city status')
    }
  }

  // Add Country Submit
  const handleAddCountrySubmit = async (e) => {
    e.preventDefault()
    if (!newCountryName.trim()) {
      showToast('Please enter country name!')
      return
    }
    try {
      await locationService.createCountry({
        name: newCountryName.trim(),
        code: newCountryCode.trim() || newCountryName.slice(0, 2).toUpperCase(),
        flag: newCountryFlag || '🌍',
      })
      showToast(`Country "${newCountryName}" added successfully!`)
      setNewCountryName('')
      setNewCountryCode('')
      setShowAddCountryModal(false)
      fetchLocationData()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add country')
    }
  }

  // Add State Submit
  const handleAddStateSubmit = async (e) => {
    e.preventDefault()
    if (!newStateName.trim()) {
      showToast('Please enter state name!')
      return
    }
    try {
      await locationService.createState({
        name: newStateName.trim(),
        code: newStateCode.trim() || newStateName.slice(0, 2).toUpperCase(),
        country: 'India',
      })
      showToast(`State "${newStateName}" added successfully!`)
      setNewStateName('')
      setNewStateCode('')
      setShowAddStateModal(false)
      fetchLocationData()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add state')
    }
  }

  // Add City Submit
  const handleAddCitySubmit = async (e) => {
    e.preventDefault()
    if (!newCityName.trim()) {
      showToast('Please enter city name!')
      return
    }
    try {
      await locationService.createCity({
        name: newCityName.trim(),
        state: newCityState || selectedState.name,
        pincodesCount: parseInt(newCityPincodes) || 1,
        tier: newCityTier || 'Tier 2',
        country: 'India',
      })
      showToast(`City "${newCityName}" added to ${newCityState || selectedState.name}!`)
      setNewCityName('')
      setNewCityPincodes('25')
      setShowAddCityModal(false)
      fetchLocationData()
      if (selectedState?.name) {
        fetchCitiesForState(selectedState.name)
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add city')
    }
  }

  // Edit City Submit
  const handleEditCitySubmit = async (e) => {
    e.preventDefault()
    if (!editingCity) return
    try {
      await locationService.updateLocation(editingCity._id || editingCity.id, {
        city: editingCity.name || editingCity.city,
        pincodesCount: Number(editingCity.pincodesCount),
        tier: editingCity.tier,
        status: editingCity.status,
      })
      showToast(`City "${editingCity.name || editingCity.city}" updated successfully!`)
      setEditingCity(null)
      if (selectedState?.name) {
        fetchCitiesForState(selectedState.name)
      }
      fetchLocationData()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update city')
    }
  }

  // Actions for States
  const handleStateActionClick = async (stateItem, action) => {
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete state "${stateItem.name}" and all its cities?`)) {
        return
      }
      try {
        await locationService.deleteState(stateItem.name)
        showToast(`State "${stateItem.name}" deleted successfully`)
        fetchLocationData()
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to delete state')
      }
    } else {
      setSelectedState({
        id: stateItem.id || stateItem.name,
        name: stateItem.name,
        code: stateItem.code,
      })
      showToast(`Selected state: ${stateItem.name}`)
    }
  }

  // Actions for Cities
  const handleCityActionClick = async (cityItem, action) => {
    if (action === 'edit') {
      setEditingCity({ ...cityItem })
    } else if (action === 'delete') {
      const cityName = cityItem.name || cityItem.city
      if (!window.confirm(`Are you sure you want to delete city "${cityName}"?`)) {
        return
      }
      try {
        await locationService.deleteLocation(cityItem._id || cityItem.id)
        showToast(`City "${cityName}" deleted successfully`)
        if (selectedState?.name) {
          fetchCitiesForState(selectedState.name)
        }
        fetchLocationData()
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to delete city')
      }
    } else {
      showToast(`City: ${cityItem.name || cityItem.city} (${cityItem.tier || 'Tier 2'})`)
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Breadcrumbs & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Manage Location</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Location
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Add, edit and manage countries, states, cities and machinery hubs across India.
          </p>
        </div>

        {/* Top-Right CTAs: Refresh & + Add Location Dropdown */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchLocationData()
              if (selectedState?.name) fetchCitiesForState(selectedState.name)
            }}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Refresh Locations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Location</span>
              <ChevronDown className="w-4 h-4 ml-0.5" />
            </button>

            {/* Add Dropdown Menu */}
            {showAddMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-30 animate-in fade-in duration-150 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCountryModal(true)
                    setShowAddMenu(false)
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Add Country</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStateModal(true)
                    setShowAddMenu(false)
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Add State</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCityModal(true)
                    setShowAddMenu(false)
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Building className="w-4 h-4 text-rose-500" />
                  <span>Add City</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. 4 Metric KPI Cards with Live Database Stats */}
      <LocationStatsCards stats={stats} />

      {/* 2. Countries Table Section with Tabs & Filters */}
      <CountriesTableSection
        countries={countries}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          showToast(`Switched view to ${tab}`)
        }}
        onImportClick={() => setShowImportModal(true)}
        onActionClick={(country, action) =>
          showToast(`${action.toUpperCase()} country: ${country.name}`)
        }
        onStatusChange={handleCountryStatusChange}
      />

      {/* 3. Dual Sub-Tables: States in India & Cities in Selected State (Live Cascading) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: States in India */}
        <StatesTableBox
          states={states}
          selectedStateId={selectedState?.name || selectedState?.id}
          onSelectState={handleSelectState}
          onAddState={() => setShowAddStateModal(true)}
          onActionClick={handleStateActionClick}
          onStatusChange={handleStateStatusChange}
          loading={loading}
        />

        {/* Right: Cities in Selected State (e.g. Uttar Pradesh, Maharashtra, etc.) */}
        <CitiesTableBox
          selectedStateName={selectedState?.name || 'Uttar Pradesh'}
          cities={cities}
          onAddCity={() => setShowAddCityModal(true)}
          onActionClick={handleCityActionClick}
          onStatusChange={handleCityStatusChange}
          loading={loadingCities}
        />
      </div>

      {/* --- ADD COUNTRY MODAL --- */}
      {showAddCountryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <span>Add Country</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCountryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCountrySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  placeholder="e.g. Nepal, UAE, Bhutan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country Code (ISO)
                  </label>
                  <input
                    type="text"
                    value={newCountryCode}
                    onChange={(e) => setNewCountryCode(e.target.value)}
                    placeholder="e.g. NP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emoji Flag
                  </label>
                  <input
                    type="text"
                    value={newCountryFlag}
                    onChange={(e) => setNewCountryFlag(e.target.value)}
                    placeholder="e.g. 🇳🇵"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCountryModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Add Country
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD STATE MODAL --- */}
      {showAddStateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <span>Add State in India</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                  placeholder="e.g. Telangana, Ladakh"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State Code (2-letter)
                </label>
                <input
                  type="text"
                  value={newStateCode}
                  onChange={(e) => setNewStateCode(e.target.value)}
                  placeholder="e.g. TS"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Add State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CITY MODAL --- */}
      {showAddCityModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-rose-500" />
                <span>Add Machinery Hub / City</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCityModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCitySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select State *
                </label>
                <select
                  value={newCityState}
                  onChange={(e) => setNewCityState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#F5A623]"
                >
                  {states.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="e.g. Mathura, Nashik"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pincodes Count
                  </label>
                  <input
                    type="number"
                    value={newCityPincodes}
                    onChange={(e) => setNewCityPincodes(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City Tier
                  </label>
                  <select
                    value={newCityTier}
                    onChange={(e) => setNewCityTier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#F5A623]"
                  >
                    <option value="Tier 1">Tier 1 (Metro)</option>
                    <option value="Tier 2">Tier 2 (Industrial)</option>
                    <option value="Tier 3">Tier 3 (Regional)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Add City
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CITY MODAL --- */}
      {editingCity && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Edit City ({editingCity.name || editingCity.city})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingCity(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCitySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCity.name || editingCity.city || ''}
                  onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pincodes Count
                  </label>
                  <input
                    type="number"
                    value={editingCity.pincodesCount || 1}
                    onChange={(e) => setEditingCity({ ...editingCity, pincodesCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City Tier
                  </label>
                  <select
                    value={editingCity.tier || 'Tier 2'}
                    onChange={(e) => setEditingCity({ ...editingCity, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#F5A623]"
                  >
                    <option value="Tier 1">Tier 1 (Metro)</option>
                    <option value="Tier 2">Tier 2 (Industrial)</option>
                    <option value="Tier 3">Tier 3 (Regional)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={editingCity.status || 'Active'}
                  onChange={(e) => setEditingCity({ ...editingCity, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCity(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- IMPORT CSV/EXCEL MODAL --- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#F5A623]" />
                <span>Import Location Data</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center space-y-3 hover:border-[#F5A623] transition-colors cursor-pointer bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-[#F5A623] flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Import or Re-sync Location Dataset
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Synchronizes all 28 states, 112+ cities and pincode coverage from MongoDB Atlas
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowImportModal(false)
                  showToast('Syncing location dataset with server...')
                  await fetchLocationData()
                  if (selectedState?.name) await fetchCitiesForState(selectedState.name)
                  showToast('Locations synchronized successfully!')
                }}
                className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                Sync Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
