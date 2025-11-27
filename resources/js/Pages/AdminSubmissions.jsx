import React from 'react'
import AdminLayout from '../Layouts/AdminLayout'
import axios from 'axios'

export default function AdminSubmissions(){
  const [rows, setRows] = React.useState([])
  const [draw, setDraw] = React.useState(1)
  const [start, setStart] = React.useState(0)
  const [length, setLength] = React.useState(10)
  const [recordsTotal, setRecordsTotal] = React.useState(0)
  const [recordsFiltered, setRecordsFiltered] = React.useState(0)
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function load(){
    setLoading(true)
    const params = { draw, start, length, search: { value: search } }
    let resp = { data: { data: [], recordsTotal: 0, recordsFiltered: 0 } }
    try { resp = await axios.get('/admin/submissions/data', { params }) } catch(e){}
    const d = resp.data
    setRows(d.data || [])
    setRecordsTotal(d.recordsTotal || 0)
    setRecordsFiltered(d.recordsFiltered || 0)
    setLoading(false)
  }

  React.useEffect(()=>{ load() }, [draw, start, length])

  function next(){ if (start + length < recordsFiltered) { setStart(start + length); setDraw(draw + 1) } }
  function prev(){ if (start - length >= 0) { setStart(start - length); setDraw(draw + 1) } }
  function changeLength(e){ setLength(parseInt(e.target.value,10)); setStart(0); setDraw(draw + 1) }
  function doSearch(e){ e.preventDefault(); setStart(0); setDraw(draw + 1) }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <form onSubmit={doSearch} className="flex items-center gap-2 flex-1 md:flex-none min-w-[240px]">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="flex-1 px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
            <button className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">Search</button>
          </form>
          <select value={length} onChange={changeLength} className="px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <div className="bg-vicinity-card rounded-2xl shadow-xl border border-vicinity-text/10 overflow-hidden">
        <div className="overflow-auto max-h-[60vh] w-full bg-vicinity-card">
        <table className="min-w-[1000px] w-full bg-vicinity-card">
          <thead className="sticky top-0 z-10 bg-vicinity-text/10">
            <tr>
              <th className="text-left px-4 py-3 whitespace-nowrap">ID</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Email</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Producer Email</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Document</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Total</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 whitespace-nowrap hidden sm:table-cell">Producer</th>
              <th className="text-left px-4 py-3 whitespace-nowrap hidden md:table-cell">Finance</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Created</th>
              <th className="text-left px-4 py-3 whitespace-nowrap hidden lg:table-cell">Files</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={9}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={9}>No submissions found</td></tr>
            ) : rows.map((r)=> (
              <tr key={r.id} className="border-t border-vicinity-text/10 hover:bg-vicinity-text/5">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.user_email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.producer_in_charge}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.document_type}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.total_amount}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs border ${String(r.status).toLowerCase()==='accepted' ? 'bg-green-500/10 border-green-500 text-green-600' : String(r.status).toLowerCase()==='pending' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-red-500/10 border-red-500 text-red-600'}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 capitalize hidden sm:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs border ${String(r.accepted_by_producer).toLowerCase()==='accepted' ? 'bg-green-500/10 border-green-500 text-green-600' : String(r.accepted_by_producer).toLowerCase()==='pending' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-red-500/10 border-red-500 text-red-600'}`}>{r.accepted_by_producer || 'pending'}</span>
                </td>
                <td className="px-4 py-3 capitalize hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs border ${String(r.accepted_by_finance).toLowerCase()==='accepted' ? 'bg-green-500/10 border-green-500 text-green-600' : String(r.accepted_by_finance).toLowerCase()==='pending' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-red-500/10 border-red-500 text-red-600'}`}>{r.accepted_by_finance || 'pending'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.created_at}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(r.files) ? r.files : []).map((f, idx)=> (
                      <a key={idx} href={`/admin/submissions/${r.id}/files/${idx}/download`} className="px-2 py-1 text-xs rounded-lg bg-vicinity-text/10 border border-vicinity-text/20">
                        {f.name || `File ${idx+1}`}
                      </a>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-vicinity-text/60">Showing {Math.min(recordsFiltered, start + 1)} to {Math.min(recordsFiltered, start + length)} of {recordsFiltered} entries</div>
        <div className="space-x-2">
          <button onClick={prev} className="px-3 py-2 border border-vicinity-text/20 rounded-lg">Prev</button>
          <button onClick={next} className="px-3 py-2 border border-vicinity-text/20 rounded-lg">Next</button>
        </div>
      </div>
    </AdminLayout>
  )
}
