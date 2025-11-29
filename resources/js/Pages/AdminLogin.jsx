import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { router } from '@inertiajs/react'
import axios from 'axios'

export default function AdminLogin() {
  const [step, setStep] = React.useState(1)
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')

  async function send(e){
    e.preventDefault()
    setLoading(true)
    setMessage('')
    let resp = { success: false }
    try { resp = (await axios.post('/auth/admin/send-code', { email })).data } catch(e){ resp = { success:false, message: e?.response?.data?.message || 'Failed to send code' } }
    setLoading(false)
    if (resp.success) { setStep(2); setMessage(resp.message) } else { setMessage(resp.message || 'Failed to send code') }
  }

  async function verify(e){
    e.preventDefault()
    setLoading(true)
    setMessage('')
    let resp = { success: false }
    try { resp = (await axios.post('/auth/admin/verify', { email, code })).data } catch(e){ resp = { success:false, message:'Invalid code' } }
    setLoading(false)
    if (resp.success) { router.visit('/admin/dashboard') } else { setMessage(resp.message || 'Invalid code') }
  }

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-8rem)] px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-vicinity-card rounded-2xl shadow-xl p-8 border border-vicinity-text/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-vicinity-text mb-2">Admin Login</h2>
              <p className="text-vicinity-text/60">Enter your email to receive a one-time code</p>
            </div>
            {step === 1 ? (
              <form className="space-y-6" onSubmit={send}>
                <div>
                  <label className="block text-sm font-medium text-vicinity-text/80 mb-2">Email Address</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@vicinity.com" className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg text-vicinity-text" required />
                </div>
                <button type="submit" className="w-full bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold">{loading ? 'Sending…' : 'Send Verification Code'}</button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={verify}>
                <div>
                  <label className="block text-sm font-medium text-vicinity-text/80 mb-2">Verification Code</label>
                  <input type="text" value={code} onChange={e=>setCode(e.target.value)} placeholder="000000" maxLength={6} className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg text-vicinity-text text-center text-lg font-mono" required />
                </div>
                <div className="flex space-x-3">
                  <button type="button" onClick={()=>setStep(1)} className="flex-1 px-4 py-3 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium">Back</button>
                  <button type="submit" className="flex-1 bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold">{loading ? 'Verifying…' : 'Verify'}</button>
                </div>
              </form>
            )}
            {message && (<div className="mt-4 p-3 rounded-lg text-sm bg-vicinity-text/10">{message}</div>)}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
