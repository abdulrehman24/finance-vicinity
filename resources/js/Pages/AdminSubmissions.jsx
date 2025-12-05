import React from 'react'
import AdminLayout from '../Layouts/AdminLayout'
import axios from 'axios'
import { FiEye } from 'react-icons/fi'

export default function AdminSubmissions(){
  const [rows, setRows] = React.useState([])
  const [draw, setDraw] = React.useState(1)
  const [start, setStart] = React.useState(0)
  const [length, setLength] = React.useState(5)
  const [recordsTotal, setRecordsTotal] = React.useState(0)
  const [recordsFiltered, setRecordsFiltered] = React.useState(0)
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [selected, setSelected] = React.useState(null)

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
            <option value={5}>5</option>
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
              <th className="text-left px-4 py-3 whitespace-nowrap">Invoice No</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Email</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Producer Email</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Document</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 whitespace-nowrap hidden md:table-cell">Finance</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={7}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={7}>No submissions found</td></tr>
            ) : rows.map((r)=> (
              <tr key={r.id} className="border-t border-vicinity-text/10 hover:bg-vicinity-text/5">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.invoice_number || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.user_email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.producer_in_charge}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{r.document_type}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs border ${String(r.status).toLowerCase()==='accepted' ? 'bg-green-500/10 border-green-500 text-green-600' : String(r.status).toLowerCase()==='pending' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-red-500/10 border-red-500 text-red-600'}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 capitalize hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs border ${String(r.accepted_by_finance).toLowerCase()==='accepted' ? 'bg-green-500/10 border-green-500 text-green-600' : String(r.accepted_by_finance).toLowerCase()==='pending' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-red-500/10 border-red-500 text-red-600'}`}>{r.accepted_by_finance || 'pending'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button onClick={()=>setSelected(r)} className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg text-xs font-bold border border-vicinity-text/20 flex items-center gap-1"><FiEye className="w-4 h-4" />View</button>
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
      <AdminSubmissionModal selected={selected} onClose={()=>setSelected(null)} />
    </AdminLayout>
  )
}

// Modal
// Render after main content to avoid overflow issues
export function AdminSubmissionModal({ selected, onClose }){
  if (!selected) return null
  const typeLabel = selected.document_type === 'tr' ? 'Talent Release Forms' : selected.document_type === 'receipt' ? (selected.receipt_type ? `Receipt — ${selected.receipt_type}` : 'Receipt') : selected.document_type === 'invoice' ? 'Invoice' : selected.document_type
  const amountRows = Array.isArray(selected.amount_rows) ? selected.amount_rows : []
  const files = Array.isArray(selected.files) ? selected.files : []
  const isRejected = String(selected.status || '').toLowerCase() === 'rejected'
  const reason = selected.finance_rejection_reason || selected.producer_rejection_reason
  const reasonBy = selected.finance_rejection_reason ? 'Finance' : (selected.producer_rejection_reason ? 'Producer' : '')
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-vicinity-card rounded-2xl shadow-2xl border border-vicinity-text/20 max-w-3xl w-full max-h-[80vh] flex flex-col" onClick={(e)=>e.stopPropagation()}>
        <div className="p-6 border-b border-vicinity-text/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-vicinity-text">Submission Details</h3>
          <button onClick={onClose} className="text-vicinity-text/60 hover:text-vicinity-text">Close</button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto custom-scroll">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-vicinity-text/60">Invoice Number</p>
              <p className="font-medium text-vicinity-text">{selected.invoice_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-vicinity-text/60">Type</p>
              <p className="font-medium text-vicinity-text">{typeLabel}</p>
            </div>
            <div>
              <p className="text-sm text-vicinity-text/60">Submitted By</p>
              <p className="font-medium text-vicinity-text">{selected.user_email}</p>
            </div>
            <div>
              <p className="text-sm text-vicinity-text/60">Producer In Charge</p>
              <p className="font-medium text-vicinity-text">{selected.producer_in_charge || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-vicinity-text/60">Project Code</p>
              <p className="font-medium text-vicinity-text">{selected.project_code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-vicinity-text/60">Project Title</p>
              <p className="font-medium text-vicinity-text">{selected.project_title || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-vicinity-text/60">Bill To</p>
              <p className="font-medium text-vicinity-text">{selected.bill_to || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-vicinity-text/60">Total Amount</p>
              <p className="font-medium text-vicinity-text">${parseFloat(selected.total_amount || 0).toLocaleString()}</p>
            </div>
          </div>
          {amountRows.length > 0 && (
            <div>
              <p className="font-medium text-vicinity-text mb-3">Amount Details</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-vicinity-text/60">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amountRows.map((row, idx)=> (
                      <tr key={idx} className="border-t border-vicinity-text/10">
                        <td className="py-2 text-vicinity-text/80">{row.description || '-'}</td>
                        <td className="py-2 text-right text-vicinity-text">${Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {isRejected && !!reason && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-red-200">Rejection Reason</p>
                <span className="text-xs px-2 py-1 rounded bg-red-800/40 border border-red-700/40 text-red-200">{reasonBy}</span>
              </div>
              <p className="mt-2 text-red-100 whitespace-pre-wrap">{reason}</p>
            </div>
          )}
          {files.length > 0 && (
            <div>
              <p className="font-medium text-vicinity-text mb-3">Attached Documents</p>
              <div className="flex flex-wrap gap-2">
                {files.map((f, idx)=> (
                  <a key={idx} href={`/admin/submissions/${selected.id}/files/${idx}/download`} className="px-3 py-2 text-xs rounded-lg bg-vicinity-text/10 border border-vicinity-text/20">
                    {(f.name || `File ${idx+1}`)}{f.assignedType ? ` — ${f.assignedType}` : ''}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Attach modal to page
export function AdminSubmissionsPage(){
  const [selected, setSelected] = React.useState(null)
  return null
}
