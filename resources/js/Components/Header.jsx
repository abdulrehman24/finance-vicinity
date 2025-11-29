import { useAuth } from '../contexts/AuthContext'
import { usePage, router } from '@inertiajs/react'
import { FiUser, FiLogOut } from 'react-icons/fi'
import axios from 'axios'

export default function Header() {
  const { user, logout } = useAuth()
  const { props } = usePage()
  const sessionEmail = props?.auth?.email
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  return (
    <header className="bg-vicinity-card shadow-lg border-b border-vicinity-text/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src={props?.settings?.logoUrl || '/logo.webp'} alt="Logo" className="h-8 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-vicinity-text">Vicinity</h1>
              <p className="text-sm text-vicinity-text/60">Finance Portal</p>
            </div>
          </div>
          {!isAdminRoute && (user || sessionEmail) && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-vicinity-text/80 text-sm">
                <FiUser className="w-4 h-4" />
                <span>{user?.name || sessionEmail}</span>
              </div>
              <button onClick={async ()=>{ try { await axios.post('/auth/logout') } catch(e){} logout(); router.visit('/') }} className="p-2 text-vicinity-text/60 hover:text-vicinity-text">
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
