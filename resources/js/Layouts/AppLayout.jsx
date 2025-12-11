import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { usePage } from '@inertiajs/react'

export default function AppLayout({ children }) {
  const { props } = usePage()
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const adminBg = props?.settings?.admin_background_url || props?.settings?.adminBackgroundUrl || ''
  const financeBg = props?.settings?.finance_background_url || props?.settings?.financeBackgroundUrl || ''
  const useAdminBg = path === '/admin'
  const useFinanceBg = path === '/'
  return (
    <div className="min-h-screen bg-vicinity-bg flex flex-col" style={useAdminBg && adminBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${adminBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : useFinanceBg && financeBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${financeBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : undefined}>
      <Header />
      <main className="flex-1">{children}</main>
      <style>{`
        .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.35) rgba(255,255,255,0.08); }
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); border-radius: 8px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>
      <Footer />
    </div>
  )
}
