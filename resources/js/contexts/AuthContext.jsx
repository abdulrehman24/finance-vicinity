import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('vicinity_user')
    const savedVerification = localStorage.getItem('vicinity_verified')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsVerified(savedVerification === 'true')
    }
    setLoading(false)
  }, [])

  async function sendVerificationCode(email) {
    const code = '000000'
    localStorage.setItem('vicinity_verification_code', code)
    localStorage.setItem('vicinity_verification_email', email)
    return { success: true, message: 'Demo Mode: Use code 000000' }
  }

  async function verifyCode(email, code) {
    const savedCode = localStorage.getItem('vicinity_verification_code')
    if (code === '000000' || code === savedCode) {
      const userData = {
        email,
        id: Date.now().toString(),
        name: email.split('@')[0],
        verified: true,
      }
      setUser(userData)
      setIsVerified(true)
      localStorage.setItem('vicinity_user', JSON.stringify(userData))
      localStorage.setItem('vicinity_verified', 'true')
      localStorage.removeItem('vicinity_verification_code')
      localStorage.removeItem('vicinity_verification_email')
      return { success: true }
    }
    return { success: false, message: 'Invalid verification code. Try 000000.' }
  }

  function logout() {
    setUser(null)
    setIsVerified(false)
    localStorage.removeItem('vicinity_user')
    localStorage.removeItem('vicinity_verified')
  }

  const value = { user, isVerified, loading, sendVerificationCode, verifyCode, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
