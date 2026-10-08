import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthHero } from '../../components/auth/AuthHero'
import { LoginForm } from '../../components/auth/LoginForm'
import { MachineryLogoIcon } from '../../components/common/MachineryLogo'
import { Toast } from '../../components/common/Toast'

export default function LoginPage() {
  const [toastMessage, setToastMessage] = useState('')
  const navigate = useNavigate()

  const showToast = (msg, duration = 3500) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, duration)
  }

  const handleLoginSuccess = (data) => {
    const adminEmail = data?.admin?.email || data?.email || 'Admin'
    showToast(`Welcome! Logged in as ${adminEmail}. Redirecting to Dashboard...`, 2000)
    setTimeout(() => {
      navigate('/dashboard')
    }, 900)
  }

  const handleForgotPassword = () => {
    showToast('Password reset link sent to your registered email address.')
  }

  return (
    <div className="w-full min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#F8FAFC] flex flex-col lg:flex-row relative font-sans text-slate-800 selection:bg-[#F5A623] selection:text-slate-900">
      
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* LEFT SECTION: Visual Heavy Machinery Hero */}
      <AuthHero />

      {/* RIGHT SECTION: Login Form & Navigation */}
      <div className="w-full lg:w-[46%] xl:w-[45%] flex-1 bg-[#F9FAFB] relative flex flex-col justify-between px-6 py-4 sm:px-8 sm:py-6 lg:px-8 lg:py-6 xl:px-12 xl:py-8 overflow-y-auto lg:overflow-y-hidden z-20">
        
        {/* Subtle Decorative Geometric Backdrop Accent */}
        <div 
          className="hidden lg:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FFF6E5]/60 to-transparent pointer-events-none" 
        />
        <div 
          className="hidden lg:block absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-96 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Top spacer (Back to Website button removed as requested) */}
        <div className="hidden lg:block h-2" />

        {/* --- CENTER CARD: Floating White Login Panel (Shifted Upwards) --- */}
        <div className="w-full max-w-[420px] xl:max-w-[440px] mx-auto my-auto pt-1 pb-2 relative z-10">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100 px-6 py-6 sm:px-8 sm:py-7 xl:px-8 xl:py-7.5">
            
            {/* Card Brand Header */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-1 drop-shadow-sm">
                <MachineryLogoIcon className="w-10 h-10 sm:w-11 sm:h-11" />
              </div>
              <div className="flex items-baseline">
                <span className="text-slate-900 font-extrabold text-xl sm:text-2xl tracking-tight">
                  Machine
                </span>
                <span className="text-[#F5A623] font-extrabold text-xl sm:text-2xl tracking-tight ml-1">
                  Wallah
                </span>
              </div>
              
              {/* Admin Panel Badge */}
              <div className="flex items-center gap-2 w-full justify-center mt-0.5 mb-3 sm:mb-3.5">
                <div className="h-[1px] w-7 bg-slate-200" />
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-widest">
                  Admin Panel
                </span>
                <div className="h-[1px] w-7 bg-slate-200" />
              </div>

              {/* Title & Welcome */}
              {/* <h2 className="text-xl sm:text-[23px] font-bold text-slate-900 tracking-tight leading-tight">
                Welcome Back
              </h2> */}
              <p className="text-slate-500 text-xs sm:text-[13px] mt-0.5">
                Login to your admin panel to manage your marketplace.
              </p>
            </div>

            {/* Login Form */}
            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
              onForgotPassword={handleForgotPassword}
            />

          </div>
        </div>

        {/* --- BOTTOM FOOTER: Copyright & Legal Links --- */}
        {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1 pb-1 border-t border-slate-100 lg:border-none relative z-10">
          <p>© 2025 Machine Wallah. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showToast('Terms of Service clicked.')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => showToast('Privacy Policy clicked.')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => showToast('Admin Help & Support clicked.')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Help
            </button>
          </div>
        </div> */}

      </div>

    </div>
  )
}
