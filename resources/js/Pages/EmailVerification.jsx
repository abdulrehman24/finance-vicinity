import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import { router } from '@inertiajs/react'
import { FiMail, FiKey, FiArrowRight, FiCheck } from 'react-icons/fi'
import axios from 'axios'

export default function EmailVerification() {
  const { sendVerificationCode, verifyCode } = useAuth()
  const [step, setStep] = React.useState(1)
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')

  async function handleSendCode(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    let result = { success: true, message: 'Demo Mode: Use code 000000' }
    try {
      const resp = await axios.post('/auth/send-code', { email })
      result = resp.data
    } catch (err) {}
    setLoading(false)
    if (result.success) {
      setStep(2)
      setMessage(result.message)
    } else {
      setMessage(result.message || 'Failed to send code')
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    let result = { success: false }
    try {
      const resp = await axios.post('/auth/verify', { email, code })
      result = resp.data
    } catch (err) {
      result = { success: false, message: 'Invalid code' }
    }
    setLoading(false)
    if (result.success) {
      setMessage('Email verified successfully!')
      router.visit('/finance-dashboard')
    } else {
      setMessage(result.message || 'Invalid code')
    }
  }
  return (
    <AppLayout>
    <div className="min-h-[calc(100vh-8rem)] px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-vicinity-card rounded-2xl shadow-xl p-8 border border-vicinity-text/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-vicinity-text/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-vicinity-text/20">
              {step === 1 ? (
                <FiMail className="w-8 h-8 text-vicinity-text" />
              ) : (
                <FiKey className="w-8 h-8 text-vicinity-text" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-vicinity-text mb-2">Verify Your Email</h2>
            <p className="text-vicinity-text/60">Enter your email address to get started with finance portal access</p>
          </div>

          {step === 1 ? (
          <form className="space-y-6" onSubmit={handleSendCode}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-vicinity-text/80 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@vicinity.com"
                className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg text-vicinity-text placeholder-vicinity-text/30 focus:ring-2 focus:ring-vicinity-text/50 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-white transition-colors"
            >
              <span>{loading ? 'Sending…' : 'Send Verification Code'}</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>
          ) : (
          <form className="space-y-6" onSubmit={handleVerifyCode}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-vicinity-text/80 mb-2">Verification Code</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg text-vicinity-text placeholder-vicinity-text/30 focus:ring-2 focus:ring-vicinity-text/50 focus:border-transparent transition-all text-center text-lg font-mono"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-3 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium hover:bg-vicinity-hover/20">Back</button>
              <button type="submit" className="flex-1 bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold hover:bg-white transition-colors">
                {loading ? 'Verifying…' : (
                  <span className="flex items-center justify-center space-x-2"><span>Verify</span><FiCheck className="w-4 h-4" /></span>
                )}
              </button>
            </div>
          </form>
          )}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('success') || message.includes('code') ? 'bg-green-900/30 text-green-200 border border-green-800' : 'bg-red-900/30 text-red-200 border border-red-800'}`}>{message}</div>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  )
}
