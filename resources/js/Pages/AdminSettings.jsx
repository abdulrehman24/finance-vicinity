import React from 'react'
import AdminLayout from '../Layouts/AdminLayout'
import { usePage } from '@inertiajs/react'
import axios from 'axios'

export default function AdminSettings() {
  const { props } = usePage()
  const [financeEmail, setFinanceEmail] = React.useState('')
  const [logoPreview, setLogoPreview] = React.useState('')
  const [logoFile, setLogoFile] = React.useState(null)
  const [faviconPreview, setFaviconPreview] = React.useState('')
  const [faviconFile, setFaviconFile] = React.useState(null)
  const [siteTitle, setSiteTitle] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(()=>{
    const s = props?.settings || {}
    setFinanceEmail(s.finance_email || '')
    setLogoPreview(s.logo_url || s.logoUrl || '/logo.webp')
    setFaviconPreview(s.favicon_url || s.faviconUrl || '/favicon.ico')
    setSiteTitle(s.site_title || '')
  }, [props])

  function handleLogoChange(e){
    const file = e.target.files && e.target.files[0]
    setLogoFile(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  function handleFaviconChange(e){
    const file = e.target.files && e.target.files[0]
    setFaviconFile(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setFaviconPreview(url)
    }
  }

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const fd = new FormData()
    if (financeEmail) fd.append('finance_email', financeEmail)
    if (siteTitle) fd.append('site_title', siteTitle)
    if (logoFile) fd.append('logo', logoFile)
    if (faviconFile) fd.append('favicon', faviconFile)
    let resp = { data: { success: false, settings: {} } }
    try {
      resp = await axios.post('/admin/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    } catch(e) {}
    setLoading(false)
    const ok = !!resp.data?.success
    setMessage(ok ? 'Settings updated' : 'Failed to update settings')
    const s = resp.data?.settings
    if (s) {
      setFinanceEmail(s.finance_email || '')
      setLogoPreview(s.logo_url || '/logo.webp')
      setFaviconPreview(s.favicon_url || '/favicon.ico')
      setSiteTitle(s.site_title || '')
      try {
        // update global props for immediate reflection in layouts
        window.Inertia.page.props.settings = { finance_email: s.finance_email, logoUrl: s.logo_url, site_title: s.site_title, faviconUrl: s.favicon_url }
      } catch(e) {}
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-vicinity-text/70 mt-2">Update finance email and portal logo</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="bg-vicinity-card rounded-xl p-6 border border-vicinity-text/10">
            <label className="block text-sm font-medium mb-2">Site Title</label>
            <input type="text" value={siteTitle} onChange={e=>setSiteTitle(e.target.value)} className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg" placeholder="Vicinity Finance Portal" />
            <p className="text-xs text-vicinity-text/60 mt-2">This sets the browser tab title.</p>
          </div>

          <div className="bg-vicinity-card rounded-xl p-6 border border-vicinity-text/10">
            <label className="block text-sm font-medium mb-2">Finance Email</label>
            <input type="email" value={financeEmail} onChange={e=>setFinanceEmail(e.target.value)} className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg" placeholder="finance@vicinity.studio" />
            <p className="text-xs text-vicinity-text/60 mt-2">Emails for finance approvals are sent to this address.</p>
          </div>

          <div className="bg-vicinity-card rounded-xl p-6 border border-vicinity-text/10">
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-start space-x-4">
              <img src={logoPreview || '/logo.webp'} alt="Logo Preview" className="h-16 w-auto object-contain border border-vicinity-text/10 rounded" />
              <div>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="block" />
                <p className="text-xs text-vicinity-text/60 mt-2">Recommended: PNG/WebP, height ~ 24–48px.</p>
              </div>
            </div>
          </div>

          <div className="bg-vicinity-card rounded-xl p-6 border border-vicinity-text/10">
            <label className="block text-sm font-medium mb-2">Favicon</label>
            <div className="flex items-start space-x-4">
              <img src={faviconPreview || '/favicon.ico'} alt="Favicon Preview" className="h-10 w-10 object-contain border border-vicinity-text/10 rounded" />
              <div>
                <input type="file" accept="image/png,image/x-icon,image/svg+xml" onChange={handleFaviconChange} className="block" />
                <p className="text-xs text-vicinity-text/60 mt-2">PNG/ICO/SVG supported. Suggested size 32×32.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button type="submit" disabled={loading} className="bg-vicinity-text text-vicinity-bg px-6 py-3 rounded-lg font-bold">
              {loading ? 'Saving…' : 'Save Settings'}
            </button>
            {message && <span className="text-vicinity-text/80">{message}</span>}
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
