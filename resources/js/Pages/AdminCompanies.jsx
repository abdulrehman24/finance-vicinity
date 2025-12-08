import React from 'react'
import AdminLayout from '../Layouts/AdminLayout'
import axios from 'axios'

export default function AdminCompanies(){
  const [rows, setRows] = React.useState([])
  const [recordsTotal, setRecordsTotal] = React.useState(0)
  const [recordsFiltered, setRecordsFiltered] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [draw, setDraw] = React.useState(1)
  const [start, setStart] = React.useState(0)
  const [length, setLength] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const [showCreate, setShowCreate] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const [newStatus, setNewStatus] = React.useState('active')
  const [editingId, setEditingId] = React.useState(null)
  const [editName, setEditName] = React.useState('')
  const [editStatus, setEditStatus] = React.useState('active')
  const [dragId, setDragId] = React.useState(null)

  async function load(){
    setLoading(true)
    const params = { draw, start, length, search: { value: search } }
    let resp = { data: { data: [], recordsTotal: 0, recordsFiltered: 0 } }
    try { resp = await axios.get('/admin/companies/data', { params }) } catch(e){}
    const d = resp.data
    setRows(d.data || [])
    setRecordsTotal(d.recordsTotal || 0)
    setRecordsFiltered(d.recordsFiltered || 0)
    setLoading(false)
  }

  React.useEffect(()=>{ load() }, [draw, start, length, search])

  function onDragStart(id){ setDragId(id) }
  function onDragOver(e){ e.preventDefault() }
  function onDrop(targetId){
    if (!dragId || dragId === targetId) return
    const idxFrom = rows.findIndex(r=>r.id===dragId)
    const idxTo = rows.findIndex(r=>r.id===targetId)
    if (idxFrom<0 || idxTo<0) return
    const next = rows.slice()
    const [moved] = next.splice(idxFrom, 1)
    next.splice(idxTo, 0, moved)
    setRows(next)
  }

  async function saveOrder(){
    const ids = rows.map(r=>r.id)
    try { await axios.post('/admin/companies/reorder', { ids }) } catch(e){}
    setDraw(draw + 1)
  }

  function startEdit(row){
    setEditingId(row.id)
    setEditName(row.name)
    setEditStatus(row.status)
  }
  function cancelEdit(){ setEditingId(null) }

  async function saveEdit(){
    try { await axios.put(`/admin/companies/${editingId}`, { name: editName, status: editStatus }) } catch(e){}
    setEditingId(null)
    load()
  }

  async function remove(id){
    if (!confirm('Delete this company?')) return
    try { await axios.delete(`/admin/companies/${id}`) } catch(e){}
    load()
  }

  async function create(e){
    e.preventDefault()
    try { await axios.post('/admin/companies', { name: newName, status: newStatus }) } catch(e){}
    setShowCreate(false)
    setNewName('')
    setNewStatus('active')
    load()
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Companies (Bill To)</h1>
          <button onClick={()=>setShowCreate(true)} className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">+ New Company</button>
        </div>

        {showCreate && (
          <div className="bg-vicinity-card rounded-xl p-6 border border-vicinity-text/10 mb-6">
            <form onSubmit={create} className="flex items-center space-x-2">
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Company Name" className="flex-1 min-w-[240px] px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg" />
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
            <table className="min-w-[800px] w-full bg-vicinity-card">
              <thead className="sticky top-0 z-10 bg-vicinity-text/10">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Seq</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">ID</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Name</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Created</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-6" colSpan={5}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td className="px-4 py-6 text-vicinity-text/60" colSpan={5}>No companies found</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id} className="border-t border-vicinity-text/10" draggable onDragStart={()=>onDragStart(r.id)} onDragOver={onDragOver} onDrop={()=>onDrop(r.id)}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{r.sequence ?? '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{r.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {editingId === r.id ? (
                        <input value={editName} onChange={e=>setEditName(e.target.value)} className="px-2 py-1 bg-vicinity-input border border-vicinity-text/20 rounded" />
                      ) : (
                        r.name
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {editingId === r.id ? (
                        <select value={editStatus} onChange={e=>setEditStatus(e.target.value)} className="px-2 py-1 bg-vicinity-input border border-vicinity-text/20 rounded">
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
        <div className="flex items-center justify-end mt-3">
          <button onClick={saveOrder} className="px-4 py-2 bg-vicinity-text text-vicinity-bg rounded-lg">Save Order</button>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-vicinity-text/60">Showing {Math.min(recordsFiltered, start + 1)} to {Math.min(recordsFiltered, start + length)} of {recordsFiltered} entries</div>
          <div className="space-x-2">
            <button onClick={()=>setStart(Math.max(0, start - length))} className="px-3 py-2 border border-vicinity-text/20 rounded-lg">Prev</button>
            <button onClick={()=>setStart(start + length)} className="px-3 py-2 border border-vicinity-text/20 rounded-lg">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
