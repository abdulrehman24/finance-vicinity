import React from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import axios from 'axios'
import { FiHome, FiList, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function AdminLayout({ children }) {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const { props } = usePage()
  const [collapsed, setCollapsed] = React.useState(true)
  const [showReset, setShowReset] = React.useState(false)
  const [resetCode, setResetCode] = React.useState('')
  const [resetMsg, setResetMsg] = React.useState('')
  const [resetLoading, setResetLoading] = React.useState(false)
  React.useEffect(()=>{
    try { if (window.innerWidth >= 768) setCollapsed(false) } catch(e){}
  }, [])
  const linkCls = (p) => `block px-3 py-2 rounded-lg border ${path.startsWith(p) ? 'bg-vicinity-text text-vicinity-bg border-vicinity-text' : 'bg-vicinity-text/10 border-vicinity-text/20'}`
  const adminEmail = props?.admin?.email || ''
  const adminVerified = !!props?.admin?.verified
  const allowed = adminVerified && (adminEmail === 'admin@vicinity.com' || adminEmail === 'finance@vicinity.com')
  async function sendResetOtp(){
    if (!allowed) return
    setResetLoading(true)
    setResetMsg('')
    let resp = { success: false, message: 'Failed' }
    try { resp = (await axios.post('/admin/system-reset/send-otp')).data } catch(e){}
    setResetLoading(false)
    setResetMsg(resp.success ? 'OTP sent to your email' : (resp.message || 'Failed to send OTP'))
  }
  async function confirmReset(e){
    e?.preventDefault?.()
    if (!allowed || !resetCode) { setResetMsg('Enter OTP'); return }
    setResetLoading(true)
    setResetMsg('')
    let resp = { success: false, message: 'Failed' }
    try { resp = (await axios.post('/admin/system-reset/confirm', { code: resetCode })).data } catch(e){}
    setResetLoading(false)
    if (resp.success) {
      setResetMsg('System reset complete')
      try { window.location.href = '/' } catch(e){}
    } else {
      setResetMsg(resp.message || 'Reset failed')
    }
  }
  return (
    <div className="h-screen overflow-hidden bg-vicinity-bg text-vicinity-text flex">
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-vicinity-card border-r border-vicinity-text/10 ${collapsed ? 'p-3' : 'p-6'} transition-all duration-200 flex flex-col h-full overflow-hidden`}> 
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <img src={props?.settings?.logoUrl || '/logo.webp'} alt="Logo" className={`${collapsed ? 'h-10 w-10' : 'h-10 w-auto'} object-contain`} />
          </div>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin/dashboard" className={linkCls('/admin/dashboard')}>
            <span className="inline-flex items-center space-x-2">
              <FiHome />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Dashboard</span>
            </span>
          </Link>
          <Link href="/admin/submissions" className={linkCls('/admin/submissions')}>
            <span className="inline-flex items-center space-x-2">
              <FiList />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Submissions</span>
            </span>
          </Link>
          <Link href="/admin/producers" className={linkCls('/admin/producers')}>
            <span className="inline-flex items-center space-x-2">
              <FiList />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Producers</span>
            </span>
          </Link>
          <Link href="/admin/companies" className={linkCls('/admin/companies')}>
            <span className="inline-flex items-center space-x-2">
              <FiList />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Companies (Bill To)</span>
            </span>
          </Link>
          <Link href="/admin/admins" className={linkCls('/admin/admins')}>
            <span className="inline-flex items-center space-x-2">
              <FiList />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Admins</span>
            </span>
          </Link>
          <Link href="/admin/settings" className={linkCls('/admin/settings')}>
            <span className="inline-flex items-center space-x-2">
              <FiList />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Settings</span>
            </span>
          </Link>
        </nav>
        <div className="mt-4">
          <button disabled={!allowed} onClick={()=>setShowReset(true)} className={`w-full px-3 py-2 rounded-lg border ${allowed ? 'border-red-500 text-red-600 bg-red-900/10' : 'border-vicinity-text/20 text-vicinity-text/40 bg-vicinity-text/10'}`}>Reset</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 border-b border-vicinity-text/10 flex items-center justify-between">
          <button onClick={()=>setCollapsed(!collapsed)} className="px-3 py-2 text-sm bg-vicinity-text/10 border border-vicinity-text/20 rounded-lg inline-flex items-center space-x-2">
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            <span className="hidden md:inline">Sidebar</span>
          </button>
          <button onClick={async()=>{ try { await axios.post('/auth/admin/logout') } catch(e){} router.visit('/admin') }} className="px-3 py-2 text-sm bg-vicinity-text/10 border border-vicinity-text/20 rounded-lg inline-flex items-center space-x-2"><FiLogOut /><span>Logout</span></button>
        </div>
        <div className="p-8">{children}</div>
        {showReset && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>{ if(!resetLoading){ setShowReset(false); setResetMsg(''); setResetCode('') }}}>
            <div className="bg-vicinity-card rounded-2xl shadow-2xl border border-vicinity-text/20 max-w-md w-full" onClick={e=>e.stopPropagation()}>
              <div className="p-6 border-b border-vicinity-text/10">
                <h3 className="text-xl font-bold">System Reset</h3>
                <p className="text-vicinity-text/60 mt-1">Please enter the OTP to reset the system.</p>
              </div>
              <div className="p-6 space-y-3">
                <input value={resetCode} onChange={e=>setResetCode(e.target.value)} placeholder="Enter OTP" className="w-full px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
                <div className="flex items-center justify-between">
                  <button disabled={!allowed || resetLoading} onClick={sendResetOtp} className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">{resetLoading ? 'Sending…' : 'Send OTP'}</button>
                  <button disabled={!allowed || resetLoading} onClick={confirmReset} className="px-3 py-2 border border-red-500 text-red-600 rounded-lg">{resetLoading ? 'Resetting…' : 'Confirm Reset'}</button>
                </div>
                {resetMsg && <div className="text-sm text-vicinity-text/80">{resetMsg}</div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
