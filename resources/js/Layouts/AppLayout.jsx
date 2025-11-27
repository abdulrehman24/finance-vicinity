import Header from '../Components/Header'
import Footer from '../Components/Footer'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-vicinity-bg flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
