import { usePage } from '@inertiajs/react'

export default function Footer() {
  const { props } = usePage()
  const year = new Date().getFullYear()
  return (
    <footer className="bg-vicinity-card border-t border-vicinity-text/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-vicinity-text/60 text-sm">
            <img src={props?.settings?.logoUrl || '/logo.webp'} alt="Logo" className="h-6 w-auto object-contain" />
            <span>Designed & Developed by Vicinity IT Team © {year}</span>
          </div>
          <div className="flex items-center space-x-2 text-vicinity-text/60 text-sm">
            <a href="https://vicinity.sg" target="_blank" rel="noopener noreferrer" className="text-vicinity-text hover:text-white transition-colors duration-200 font-medium">vicinity.sg</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
