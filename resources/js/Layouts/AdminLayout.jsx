import React from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import axios from 'axios'
import { FiHome, FiList, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function AdminLayout({ children }) {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const { props } = usePage()
  const [collapsed, setCollapsed] = React.useState(true)
  React.useEffect(()=>{
    try { if (window.innerWidth >= 768) setCollapsed(false) } catch(e){}
  }, [])
  const linkCls = (p) => `block px-3 py-2 rounded-lg border ${path.startsWith(p) ? 'bg-vicinity-text text-vicinity-bg border-vicinity-text' : 'bg-vicinity-text/10 border-vicinity-text/20'}`
  return (
    <div className="min-h-screen bg-vicinity-bg text-vicinity-text flex">
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-vicinity-card border-r border-vicinity-text/10 ${collapsed ? 'p-3' : 'p-6'} transition-all duration-200`}> 
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <img src={props?.settings?.logoUrl || '/logo.webp'} alt="Logo" className={`${collapsed ? 'h-10 w-10' : 'h-10 w-auto'} object-contain`} />
          </div>
        </div>
        <nav className="space-y-2">
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
          <Link href="/admin/settings" className={linkCls('/admin/settings')}>
            <span className="inline-flex items-center space-x-2">
              <FiList />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Settings</span>
            </span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="p-4 border-b border-vicinity-text/10 flex items-center justify-between">
          <button onClick={()=>setCollapsed(!collapsed)} className="px-3 py-2 text-sm bg-vicinity-text/10 border border-vicinity-text/20 rounded-lg inline-flex items-center space-x-2">
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            <span className="hidden md:inline">Sidebar</span>
          </button>
          <button onClick={async()=>{ try { await axios.post('/auth/admin/logout') } catch(e){} router.visit('/admin') }} className="px-3 py-2 text-sm bg-vicinity-text/10 border border-vicinity-text/20 rounded-lg inline-flex items-center space-x-2"><FiLogOut /><span>Logout</span></button>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
