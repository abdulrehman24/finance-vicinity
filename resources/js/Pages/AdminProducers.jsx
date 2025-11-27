import React from 'react'
import AdminLayout from '../Layouts/AdminLayout'
import axios from 'axios'

export default function AdminProducers(){
  const [rows, setRows] = React.useState([])
  const [draw, setDraw] = React.useState(1)
  const [start, setStart] = React.useState(0)
  const [length, setLength] = React.useState(10)
  const [recordsTotal, setRecordsTotal] = React.useState(0)
  const [recordsFiltered, setRecordsFiltered] = React.useState(0)
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const [showCreate, setShowCreate] = React.useState(false)
  const [newEmail, setNewEmail] = React.useState('')
  const [newStatus, setNewStatus] = React.useState('active')

  const [editingId, setEditingId] = React.useState(null)
  const [editEmail, setEditEmail] = React.useState('')
  const [editStatus, setEditStatus] = React.useState('active')

  async function load(){
    setLoading(true)
    const params = { draw, start, length, search: { value: search } }
    let resp = { data: { data: [], recordsTotal: 0, recordsFiltered: 0 } }
    try { resp = await axios.get('/admin/producers/data', { params }) } catch(e){}
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

  async function createProducer(e){
    e.preventDefault()
    try { await axios.post('/admin/producers', { email: newEmail, status: newStatus }) } catch(e){}
    setShowCreate(false)
    setNewEmail('')
    setNewStatus('active')
    setDraw(draw + 1)
  }

  function startEdit(row){
    setEditingId(row.id)
    setEditEmail(row.email)
    setEditStatus(row.status)
  }

  function cancelEdit(){
    setEditingId(null)
    setEditEmail('')
    setEditStatus('active')
  }

  async function saveEdit(){
    if (!editingId) return
    try { await axios.put(`/admin/producers/${editingId}`, { email: editEmail, status: editStatus }) } catch(e){}
    cancelEdit()
    setDraw(draw + 1)
  }

  async function remove(id){
    try { await axios.delete(`/admin/producers/${id}`) } catch(e){}
    setDraw(draw + 1)
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Producers</h1>
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
          <button onClick={()=>setShowCreate(true)} className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">Add Producer</button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 bg-vicinity-card rounded-2xl shadow-xl border border-vicinity-text/10 p-4">
          <form onSubmit={createProducer} className="flex flex-wrap items-center gap-3">
            <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Email" className="flex-1 min-w-[240px] px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
            <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
            <button className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">Create</button>
            <button type="button" onClick={()=>setShowCreate(false)} className="px-3 py-2 border border-vicinity-text/20 rounded-lg">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-vicinity-card rounded-2xl shadow-xl border border-vicinity-text/10 overflow-hidden">
        <div className="overflow-auto max-h-[60vh] w-full bg-vicinity-card">
        <table className="min-w-[700px] w-full bg-vicinity-card">
          <thead className="sticky top-0 z-10 bg-vicinity-text/10">
            <tr>
              <th className="text-left px-4 py-3 whitespace-nowrap">ID</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Email</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Created</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={5}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={5}>No producers found</td></tr>
            ) : rows.map((r)=> (
              <tr key={r.id} className="border-t border-vicinity-text/10 hover:bg-vicinity-text/5">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {editingId === r.id ? (
                    <input value={editEmail} onChange={e=>setEditEmail(e.target.value)} className="px-2 py-1 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
                  ) : (
                    r.email
                  )}
                </td>
                <td className="px-4 py-3 capitalize">
                  {editingId === r.id ? (
                    <select value={editStatus} onChange={e=>setEditStatus(e.target.value)} className="px-2 py-1 bg-vicinity-input border border-vicinity-text/20 rounded-lg">
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs border ${String(r.status).toLowerCase()==='active' ? 'bg-green-500/10 border-green-500 text-green-600' : 'bg-red-500/10 border-red-500 text-red-600'}`}>{r.status}</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.created_at}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {editingId === r.id ? (
                    <div className="space-x-2">
                      <button onClick={saveEdit} className="px-3 py-1 bg-vicinity-text text-vicinity-bg rounded-lg">Save</button>
                      <button onClick={cancelEdit} className="px-3 py-1 border border-vicinity-text/20 rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button onClick={()=>startEdit(r)} className="px-3 py-1 border border-vicinity-text/20 rounded-lg">Edit</button>
                      <button onClick={()=>remove(r.id)} className="px-3 py-1 border border-red-500 text-red-600 rounded-lg">Delete</button>
                    </div>
                  )}
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

