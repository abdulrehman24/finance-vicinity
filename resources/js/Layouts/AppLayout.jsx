import Header from '../Components/Header'
import Footer from '../Components/Footer'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-vicinity-bg flex flex-col">
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
