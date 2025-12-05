import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { Link, router, usePage } from '@inertiajs/react'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiFileText, FiClock, FiCheck, FiDollarSign, FiCalendar, FiX, FiEye, FiCopy } from 'react-icons/fi'
import axios from 'axios'
import SubmissionWarningModal from '../Components/SubmissionWarningModal'

export default function Dashboard() {
  const { user } = useAuth()
  const { props } = usePage()
  const [submissions, setSubmissions] = React.useState([])
  const [selected, setSelected] = React.useState(null)
  const [copiedId, setCopiedId] = React.useState(null)
  React.useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get('/drafts/list')
        const items = resp.data?.items || []
        const mapped = items.map(i => ({
          id: i.id,
          documentType: i.document_type,
          amount: String(i.total_amount || 0),
          createdAt: i.updated_at || i.created_at,
          status: i.status || 'pending',
          producerStatus: i.accepted_by_producer || 'pending',
          financeStatus: i.accepted_by_finance || 'pending',
          invoiceNumber: i.invoice_number,
          billTo: i.bill_to,
          projectCode: i.project_code,
          receiptType: i.receipt_type,
          amountRows: Array.isArray(i.amount_rows) ? i.amount_rows : [],
          files: Array.isArray(i.files) ? i.files : [],
          producerInCharge: i.producer_in_charge,
          producerReason: i.producer_rejection_reason,
          financeReason: i.finance_rejection_reason,
        }))
        setSubmissions(mapped)
      } catch(e) {
        const ls = JSON.parse(localStorage.getItem('vicinity_submissions') || '[]')
        setSubmissions(ls)
      }
    })()
  }, [])
  const [showWarningModal, setShowWarningModal] = React.useState(false)
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved' || s.status === 'accepted').length,
    totalAmount: submissions
      .filter(s => String(s.status || '').toLowerCase().trim() === 'accepted')
      .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0)
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-vicinity-text">{`Welcome back${user?.name ? ", " + user.name + "!" : "!"}`}</h1>
            <p className="text-vicinity-text/70 mt-2">Manage your invoice submissions and track their status</p>
          </div>
          <button onClick={()=>setShowWarningModal(true)} className="bg-vicinity-text text-vicinity-bg px-6 py-3 rounded-lg font-bold shadow-lg">+ New Submission</button>
        </div>

        <div className="bg-vicinity-card border border-vicinity-text/20 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <FiMail className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-vicinity-text mb-2">Payment Notification</h3>
              <p className="text-vicinity-text/70">You will be notified of payments via email from our bank when funds are transferred to your account.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Submissions', value: stats.total, Icon: FiFileText },
            { label: 'Pending Review', value: stats.pending, Icon: FiClock },
            { label: 'Approved', value: stats.approved, Icon: FiCheck },
            { label: 'Earnings So Far', value: `$${stats.totalAmount.toLocaleString()}`, Icon: FiDollarSign },
          ].map((card) => (
            <div key={card.label} className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-vicinity-text/70">{card.label}</p>
                  <p className="text-2xl font-bold text-vicinity-text mt-1">{card.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-vicinity-text/10">
                  <card.Icon className="w-6 h-6 text-vicinity-text" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-vicinity-card rounded-xl shadow-lg border border-vicinity-text/10">
          <div className="p-6 border-b border-vicinity-text/10">
            <h2 className="text-xl font-bold text-vicinity-text">Recent Submissions</h2>
          </div>
          <div className="p-6">
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-vicinity-input rounded-lg flex items-center justify-center mx-auto mb-4 border border-vicinity-text/20">
                  <FiFileText className="w-6 h-6 text-vicinity-text" />
                </div>
                <h3 className="text-lg font-medium text-vicinity-text mb-2">No submissions yet</h3>
                <p className="text-vicinity-text/60 mb-6">Get started by creating your first invoice submission</p>
                <button onClick={()=>setShowWarningModal(true)} className="bg-vicinity-text/20 text-vicinity-text px-6 py-2 rounded-lg font-medium hover:bg-vicinity-text/30">Create Submission</button>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((s) => {
                  const isApproved = s.status === 'approved' || s.status === 'accepted'
                  const statusColor = s.status === 'pending' ? 'bg-yellow-900/30 text-yellow-200 border-yellow-700/50' : isApproved ? 'bg-green-900/30 text-green-200 border-green-700/50' : 'bg-red-900/30 text-red-200 border-red-700/50'
                  const typeLabel = s.documentType === 'tr' ? 'Talent Release Forms' : s.documentType === 'receipt' ? 'Receipt' : s.documentType === 'invoice' ? 'Invoice' : s.documentType
                  
                  const producerStatus = s.producerStatus ? s.producerStatus.toLowerCase() : 'pending'
                  const financeStatus = s.financeStatus ? s.financeStatus.toLowerCase() : 'pending'
                  
                  const getStatusColor = (status) => {
                    if (status === 'accepted' || status === 'approved') return 'bg-green-900/30 text-green-200 border-green-700/50'
                    if (status === 'rejected') return 'bg-red-900/30 text-red-200 border-red-700/50'
                    return 'bg-yellow-900/30 text-yellow-200 border-yellow-700/50'
                  }

                  return (
                    <div key={s.id} className="relative border border-vicinity-text/10 rounded-xl bg-vicinity-card/80 backdrop-blur p-5 hover:shadow-xl hover:-translate-y-0.5 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-11 h-11 rounded-xl bg-vicinity-text/10 flex items-center justify-center border border-vicinity-text/20"><FiFileText className="w-5 h-5 text-vicinity-text" /></div>
                          <div>
                            <p className="text-sm text-vicinity-text/60">{new Date(s.createdAt).toLocaleDateString()}</p>
                            <p className="text-lg font-semibold text-vicinity-text">{typeLabel}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-vicinity-text/10 border border-vicinity-text/20 text-vicinity-text">{s.invoiceNumber || '-'}</span>
                          <div className="flex flex-col gap-1.5 mt-1">
                             {/* Producer Status */}
                             <div className="flex items-center gap-2 justify-end">
                                <span className="text-[10px] uppercase tracking-wider text-vicinity-text/50 font-medium">Producer</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(producerStatus)} flex items-center space-x-1 min-w-[90px] justify-center`}>
                                  {producerStatus === 'pending' && <FiClock className="w-3 h-3" />}
                                  {(producerStatus === 'accepted' || producerStatus === 'approved') && <FiCheck className="w-3 h-3" />}
                                  {producerStatus === 'rejected' && <FiX className="w-3 h-3" />}
                                  <span className="capitalize">{producerStatus}</span>
                                </span>
                             </div>
                             {/* Finance Status */}
                             <div className="flex items-center gap-2 justify-end">
                                <span className="text-[10px] uppercase tracking-wider text-vicinity-text/50 font-medium">Finance</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(financeStatus)} flex items-center space-x-1 min-w-[90px] justify-center`}>
                                  {financeStatus === 'pending' && <FiClock className="w-3 h-3" />}
                                  {(financeStatus === 'accepted' || financeStatus === 'approved') && <FiCheck className="w-3 h-3" />}
                                  {financeStatus === 'rejected' && <FiX className="w-3 h-3" />}
                                  <span className="capitalize">{financeStatus}</span>
                                </span>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-vicinity-text/60">Total Amount</p>
                          <p className="text-2xl font-bold text-vicinity-text">${parseFloat(s.amount || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={()=>setSelected(s)} className="px-3 py-2 bg-vicinity-text text-vicinity-bg rounded-lg text-xs font-bold border border-vicinity-text/20 flex items-center gap-1"><FiEye className="w-4 h-4" />View</button>
                          <button
                            onClick={()=>{
                              const text = s.invoiceNumber
                              if (!text) return
                              ;(async () => {
                                try {
                                  await navigator.clipboard.writeText(text)
                                  setCopiedId(s.id)
                                  setTimeout(()=>setCopiedId(null), 1500)
                                } catch (err) {
                                  const ta = document.createElement('textarea')
                                  ta.value = text
                                  ta.style.position = 'fixed'
                                  ta.style.opacity = '0'
                                  document.body.appendChild(ta)
                                  ta.select()
                                  try { document.execCommand('copy'); setCopiedId(s.id); setTimeout(()=>setCopiedId(null), 1500) } catch(e2) {}
                                  document.body.removeChild(ta)
                                }
                              })()
                            }}
                            className={`px-3 py-2 bg-vicinity-input border border-vicinity-text/20 rounded-lg text-xs flex items-center gap-1 ${copiedId===s.id ? 'text-green-300' : 'text-vicinity-text'}`}
                          >
                            <FiCopy className="w-4 h-4" />{copiedId===s.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4" onClick={()=>setSelected(null)}>
            <div className="bg-vicinity-card rounded-2xl shadow-2xl border border-vicinity-text/20 max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e)=>e.stopPropagation()}>
              <div className="p-6 border-b border-vicinity-text/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-vicinity-text">Submission Details</h3>
                <button onClick={()=>setSelected(null)} className="text-vicinity-text/60 hover:text-vicinity-text">Close</button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto custom-scroll">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-vicinity-text/60">Invoice Number</p>
                    <p className="font-medium text-vicinity-text">{selected.invoiceNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-vicinity-text/60">Type</p>
                    <p className="font-medium text-vicinity-text">{selected.documentType === 'tr' ? 'Talent Release Forms' : selected.documentType === 'receipt' ? `Receipt${selected.receiptType ? ' — ' + selected.receiptType : ''}` : selected.documentType === 'invoice' ? 'Invoice' : selected.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-vicinity-text/60">Producer In Charge</p>
                    <p className="font-medium text-vicinity-text">{selected.producerInCharge || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-vicinity-text/60">Project Code</p>
                    <p className="font-medium text-vicinity-text">{selected.projectCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-vicinity-text/60">Bill To</p>
                    <p className="font-medium text-vicinity-text">{selected.billTo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-vicinity-text/60">Total Amount</p>
                    <p className="font-medium text-vicinity-text">${parseFloat(selected.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
                {Array.isArray(selected.amountRows) && selected.amountRows.length > 0 && (
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
                          {selected.amountRows.map((row, idx)=> (
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
                {String(selected.status || '').toLowerCase()==='rejected' && (selected.financeReason || selected.producerReason) && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-red-200">Rejection Reason</p>
                      <span className="text-xs px-2 py-1 rounded bg-red-800/40 border border-red-700/40 text-red-200">{selected.financeReason ? 'Finance' : 'Producer'}</span>
                    </div>
                    <p className="mt-2 text-red-100 whitespace-pre-wrap">{selected.financeReason || selected.producerReason}</p>
                  </div>
                )}
                {Array.isArray(selected.files) && selected.files.length > 0 && (
                  <div>
                    <p className="font-medium text-vicinity-text mb-3">Attached Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.files.map((f, idx)=> (
                        <a key={idx} href={f.url || '#'} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs rounded-lg bg-vicinity-text/10 border border-vicinity-text/20">
                          {(f.name || `File ${idx+1}`)}{f.assignedType ? ` — ${f.assignedType}` : ''}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <SubmissionWarningModal isOpen={showWarningModal} onClose={()=>setShowWarningModal(false)} onContinue={()=>router.visit('/submit')} />
      </div>
    </AppLayout>
  )
}
