import React from 'react'
import AdminLayout from '../Layouts/AdminLayout'
import axios from 'axios'
import { FiTrendingUp, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi'

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ total: 0, pending: 0, accepted: 0, rejected: 0 })
  const [recent, setRecent] = React.useState([])
  const [fromDate, setFromDate] = React.useState('')
  const [toDate, setToDate] = React.useState('')

  async function loadData(){
    let resp = { data: { data: [] } }
    const params = { start:0, length:50, draw:1 }
    if (fromDate) params.from = fromDate
    if (toDate) params.to = toDate
    try { resp = await axios.get('/admin/submissions/data', { params }) } catch(e){}
    const items = resp.data.data || []
    const total = items.length
    const pending = items.filter(i=>String(i.status).toLowerCase()==='pending').length
    const accepted = items.filter(i=>String(i.status).toLowerCase()==='accepted').length
    const rejected = items.filter(i=>String(i.status).toLowerCase()==='rejected').length
    setStats({ total, pending, accepted, rejected })
    setRecent(items.slice(0,5))
  }

  React.useEffect(()=>{ loadData() }, [fromDate, toDate])
  return (
    <AdminLayout>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-vicinity-text/20 to-vicinity-text/10 p-8 border border-vicinity-text/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-vicinity-text/70 mt-2">Overview of the submission pipeline</p>
          </div>
          <div className="hidden md:block">
            <div className="w-40 h-24 bg-vicinity-text/10 rounded-xl" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-vicinity-text/80 mb-1">From</label>
            <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="w-full px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-vicinity-text/80 mb-1">To</label>
            <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="w-full px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
          </div>
          <div className="flex items-end">
            <button onClick={loadData} className="px-4 py-2 bg-vicinity-text text-vicinity-bg rounded-lg w-full md:w-auto">Apply Filters</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10">
          <div className="flex items-center justify-between"><p className="text-sm text-vicinity-text/70">Total Invoices Submitted</p><FiUsers /></div>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10">
          <div className="flex items-center justify-between"><p className="text-sm text-vicinity-text/70">Pending</p><FiTrendingUp /></div>
          <p className="text-3xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10">
          <div className="flex items-center justify-between"><p className="text-sm text-vicinity-text/70">Accepted</p><FiCheckCircle className="text-green-500"/></div>
          <p className="text-3xl font-bold mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10">
          <div className="flex items-center justify-between"><p className="text-sm text-vicinity-text/70">Rejected</p><FiXCircle className="text-red-500"/></div>
          <p className="text-3xl font-bold mt-1">{stats.rejected}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10">
          <p className="text-sm text-vicinity-text/70">Recent Submissions</p>
          <div className="mt-4 space-y-3">
            {recent.length===0 ? (
              <div className="text-vicinity-text/60">No recent submissions</div>
            ) : recent.map(r=> (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-vicinity-text/10">
                <div>
                  <div className="font-medium">{r.user_email}</div>
                  <div className="text-sm text-vicinity-text/60">{r.document_type}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{r.total_amount}</div>
                  <div className="text-xs capitalize text-vicinity-text/60">{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10">
          <p className="text-sm text-vicinity-text/70">Pipeline</p>
          <div className="mt-6">
            <div className="h-3 bg-vicinity-text/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${stats.accepted && stats.total ? Math.round((stats.accepted/stats.total)*100) : 0}%` }} />
            </div>
            <div className="flex justify-between text-xs text-vicinity-text/60 mt-2">
              <span>Accepted</span>
              <span>{stats.accepted}/{stats.total}</span>
            </div>
            <div className="h-3 bg-vicinity-text/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-red-500" style={{ width: `${stats.rejected && stats.total ? Math.round((stats.rejected/stats.total)*100) : 0}%` }} />
            </div>
            <div className="flex justify-between text-xs text-vicinity-text/60 mt-2">
              <span>Rejected</span>
              <span>{stats.rejected}/{stats.total}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
