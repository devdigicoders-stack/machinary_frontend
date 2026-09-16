import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { SecurityBadge } from './SecurityBadge'
import { authService } from '../../services/authService'

export function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.login(email.trim(), password.trim())
      setIsLoading(false)
      if (onLoginSuccess) {
        onLoginSuccess(response.data)
      }
    } catch (error) {
      setIsLoading(false)
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.'
      setErrorMessage(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 space-y-3 sm:space-y-3.5">
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 mb-1">
          Email Address
        </label>
        <div className="relative flex items-center">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 mb-1">
          Password
        </label>
        <div className="relative flex items-center">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 sm:py-3 px-4 bg-[#F5A623] hover:bg-[#EAA020] active:scale-[0.99] text-slate-900 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#F5A623]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 mt-1"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Login to Admin Panel</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </>
        )}
      </button>

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-2.5 sm:my-3">
        <div className="w-full border-t border-slate-100" />
        <span className="absolute bg-white px-3 text-[11px] text-slate-400 font-medium">
          Or
        </span>
      </div>

      {/* Secure Admin Access Banner */}
      <SecurityBadge />
    </form>
  )
}
