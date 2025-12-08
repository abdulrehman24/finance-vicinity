import React from 'react'
import AdminLayout from '../Layouts/AdminLayout'
import axios from 'axios'

export default function AdminAdmins(){
  const [rows, setRows] = React.useState([])
  const [recordsTotal, setRecordsTotal] = React.useState(0)
  const [recordsFiltered, setRecordsFiltered] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [draw, setDraw] = React.useState(1)
  const [start, setStart] = React.useState(0)
  const [length, setLength] = React.useState(10)
  const [search, setSearch] = React.useState('')

  const [showCreate, setShowCreate] = React.useState(false)
  const [newEmail, setNewEmail] = React.useState('')
  const [newName, setNewName] = React.useState('')

  async function load(){
    setLoading(true)
    const params = { draw, start, length, search: { value: search } }
    let resp = { data: { data: [], recordsTotal: 0, recordsFiltered: 0 } }
    try { resp = await axios.get('/admin/admins/data', { params }) } catch(e){}
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

  async function create(e){
    e.preventDefault()
    try { await axios.post('/admin/admins', { email: newEmail, name: newName }) } catch(e){}
    setShowCreate(false)
    setNewEmail('')
    setNewName('')
    setDraw(draw + 1)
  }

  async function remove(id){
    if (!confirm('Remove admin privileges for this user?')) return
    try { await axios.delete(`/admin/admins/${id}`) } catch(e){}
    setDraw(draw + 1)
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admins</h1>
          <button onClick={()=>setShowCreate(true)} className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">+ Add Admin</button>
        </div>

        {showCreate && (
          <div className="bg-vicinity-card rounded-xl p-6 border border-vicinity-text/10 mb-6">
            <form onSubmit={create} className="flex items-center gap-2 flex-wrap">
              <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Email" className="flex-1 min-w-[240px] px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name (optional)" className="flex-1 min-w-[180px] px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
              <button className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">Create</button>
              <button type="button" onClick={()=>setShowCreate(false)} className="px-3 py-2 border border-vicinity-text/20 rounded-lg">Cancel</button>
            </form>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <form onSubmit={doSearch} className="flex items-center gap-2 flex-1 min-w-[240px]">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="flex-1 px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
            <button className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">Search</button>
          </form>
          <select value={length} onChange={changeLength} className="px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="bg-vicinity-card rounded-2xl shadow-xl border border-vicinity-text/10 overflow-hidden">
          <div className="overflow-auto max-h-[60vh] w-full bg-vicinity-card">
            <table className="min-w-[700px] w-full bg-vicinity-card">
              <thead className="sticky top-0 z-10 bg-vicinity-text/10">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">ID</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Name</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Email</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Created</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-6" colSpan={5}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td className="px-4 py-6 text-vicinity-text/60" colSpan={5}>No admins found</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id} className="border-t border-vicinity-text/10">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{r.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{r.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{r.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{r.created_at}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={()=>remove(r.id)} className="px-3 py-1 border border-red-500 text-red-600 rounded-lg">Remove Admin</button>
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
      </div>
    </AdminLayout>
  )
}

