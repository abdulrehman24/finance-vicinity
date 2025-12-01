import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { Link, router } from '@inertiajs/react'
import axios from 'axios'
import { FiTrash2, FiArrowLeft } from 'react-icons/fi'

export default function SubmissionForm() {
  const [formData, setFormData] = React.useState({
    documentType: 'invoice',
    producerEmail: '',
    billTo: '',
    projectCode: '',
    receiptType: '',
    amountRows: [{ id: 1, amount: '', description: '' }],
  })
  const [errors, setErrors] = React.useState({ producerEmail: '', billTo: '', documentType: '' })
  const [rowErrors, setRowErrors] = React.useState({})
  const emailRef = React.useRef(null)
  const billToRef = React.useRef(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [producers, setProducers] = React.useState([])
  const [companies, setCompanies] = React.useState([])

  React.useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get('/drafts/me')
        const d = resp.data?.draft
        if (d) {
          setFormData((prev) => ({
            ...prev,
            producerEmail: d.producer_in_charge || prev.producerEmail,
            billTo: d.bill_to || '',
            documentType: d.document_type || prev.documentType,
            receiptType: d.receipt_type || prev.receiptType,
            projectCode: d.project_code || '',
            amountRows: Array.isArray(d.amount_rows) && d.amount_rows.length > 0 ? d.amount_rows : prev.amountRows,
          }))
        }
      } catch(e) {}
      try {
        const r2 = await axios.get('/producers/list')
        setProducers(Array.isArray(r2.data?.items) ? r2.data.items : [])
      } catch(e) {}
      try {
        const r3 = await axios.get('/companies/list')
        setCompanies(Array.isArray(r3.data?.items) ? r3.data.items : [])
      } catch(e) {}
    })()
  }, [])

  function handleInput(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleAmountRowChange(rowId, field, value) {
    setFormData((prev) => ({
      ...prev,
      amountRows: prev.amountRows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
    }))
  }

  function addAmountRow() {
    setFormData((prev) => ({
      ...prev,
      amountRows: [...prev.amountRows, { id: Date.now(), amount: '', description: '' }],
    }))
  }

  function removeAmountRow(rowId) {
    setFormData((prev) => ({
      ...prev,
      amountRows: prev.amountRows.length > 1 ? prev.amountRows.filter((r) => r.id !== rowId) : prev.amountRows,
    }))
  }

  function calculateTotalAmount() {
    return formData.amountRows.reduce((total, row) => total + (parseFloat(row.amount) || 0), 0)
  }

  function submitDemo(e) {
    e.preventDefault()
    const total = calculateTotalAmount()
    const combinedDescription = formData.amountRows
      .map((row) => (row.description && row.amount ? `${row.description}: $${row.amount}` : null))
      .filter(Boolean)
      .join(' | ')
    const submission = {
      id: Date.now().toString(),
      documentType: formData.documentType,
      producerEmail: formData.producerEmail,
      billTo: formData.billTo,
      amount: total.toString(),
      description: combinedDescription,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('vicinity_submissions') || '[]')
    existing.push(submission)
    localStorage.setItem('vicinity_submissions', JSON.stringify(existing))
    router.visit('/dashboard')
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/finance-dashboard" className="flex items-center space-x-2 text-vicinity-text/60 hover:text-vicinity-text mb-4">
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-vicinity-text">New Submission</h1>
          <p className="text-vicinity-text/60 mt-2">Submit your documents for approval</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-text text-vicinity-bg">1</div>
              <span className="ml-2 text-sm text-vicinity-text">Details</span>
            </div>
            <div className="w-10 h-0.5 bg-vicinity-input" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-input text-vicinity-text/50">2</div>
              <span className="ml-2 text-sm text-vicinity-text/50">Upload</span>
            </div>
            <div className="w-10 h-0.5 bg-vicinity-input" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-input text-vicinity-text/50">3</div>
              <span className="ml-2 text-sm text-vicinity-text/50">Verify</span>
            </div>
            <div className="w-10 h-0.5 bg-vicinity-input" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-input text-vicinity-text/50">4</div>
              <span className="ml-2 text-sm text-vicinity-text/50">Review</span>
            </div>
          </div>
        </div>
        <div className="bg-vicinity-card rounded-xl shadow-lg border border-vicinity-text/10 p-8">
          <form className="space-y-6" onSubmit={(e)=>e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-vicinity-text/80 mb-2">Producer in Charge</label>
              {producers.length > 0 ? (
                <select id="producerEmail" ref={emailRef} value={formData.producerEmail} onChange={(e)=>{ handleInput('producerEmail', e.target.value); if (errors.producerEmail) setErrors({ producerEmail: '' }) }} className={`w-full px-4 py-3 bg-vicinity-input border ${errors.producerEmail ? 'border-red-500 ring-2 ring-red-500/50' : 'border-vicinity-text/20'} rounded-lg text-vicinity-text focus:ring-2 focus:ring-vicinity-text/50`}>
                  <option value="">Select producer...</option>
                  {producers.map(p => (
                    <option key={p.id} value={p.email}>{p.email}</option>
                  ))}
                </select>
              ) : (
                <input id="producerEmail" ref={emailRef} type="email" value={formData.producerEmail} onChange={(e)=>{ handleInput('producerEmail', e.target.value); if (errors.producerEmail) setErrors({ producerEmail: '' }) }} placeholder="producer@vicinity.studio" className={`w-full px-4 py-3 bg-vicinity-input border ${errors.producerEmail ? 'border-red-500 ring-2 ring-red-500/50' : 'border-vicinity-text/20'} rounded-lg text-vicinity-text placeholder-vicinity-text/30 focus:ring-2 focus:ring-vicinity-text/50 focus:border-transparent`} />
              )}
              {errors.producerEmail && (<p className="text-red-300 text-sm mt-2">{errors.producerEmail}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-vicinity-text/80 mb-2">Bill To</label>
              <select ref={billToRef} value={formData.billTo} onChange={(e)=>{ handleInput('billTo', e.target.value); if (errors.billTo) setErrors(prev=>({ ...prev, billTo: '' })) }} className={`w-full px-4 py-3 bg-vicinity-input border ${errors.billTo ? 'border-red-500 ring-2 ring-red-500/50' : 'border-vicinity-text/20'} rounded-lg text-vicinity-text focus:ring-2 focus:ring-vicinity-text/50`} required>
                <option value="">Select company to bill...</option>
                {companies.length === 0 ? (
                  <option value="" disabled>No companies found</option>
                ) : companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {errors.billTo && (<p className="text-red-300 text-sm mt-2">{errors.billTo}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-vicinity-text/80 mb-2">Document Type</label>
              <select value={formData.documentType} onChange={(e)=>{ handleInput('documentType', e.target.value); if (errors.documentType) setErrors(prev=>({ ...prev, documentType: '' })) }} className={`w-full px-4 py-3 bg-vicinity-input border ${errors.documentType ? 'border-red-500 ring-2 ring-red-500/50' : 'border-vicinity-text/20'} rounded-lg text-vicinity-text focus:ring-2 focus:ring-vicinity-text/50`} required>
                <option value="invoice">Invoice</option>
                <option value="tr">Talent Release Forms (TR)</option>
                <option value="receipt">Receipt</option>
              </select>
              {formData.documentType === 'receipt' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-vicinity-text/80 mb-2">Receipt Type</label>
                  <select value={formData.receiptType} onChange={(e)=>handleInput('receiptType', e.target.value)} className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg text-vicinity-text focus:ring-2 focus:ring-vicinity-text/50" required>
                    <option value="">Select receipt type...</option>
                    <option value="transportation">Transportation</option>
                    <option value="meals">Meals</option>
                    <option value="materials">Materials</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other Claims</option>
                  </select>
                </div>
              )}
            </div>
            {formData.documentType !== 'receipt' && (
              <div>
                <label className="block text-sm font-medium text-vicinity-text/80 mb-2">Project Code (Quotation Number)</label>
                <input type="text" value={formData.projectCode} onChange={(e)=>handleInput('projectCode', e.target.value)} placeholder="e.g., QU-5049" className="w-full px-4 py-3 bg-vicinity-input border border-vicinity-text/20 rounded-lg text-vicinity-text placeholder-vicinity-text/30 focus:ring-2 focus:ring-vicinity-text/50 focus:border-transparent" />
              </div>
            )}
            <div className="bg-vicinity-input/30 rounded-lg border border-vicinity-text/10">
              <div className="p-4 border-b border-vicinity-text/10 flex items-center justify-between">
                <h4 className="font-medium text-vicinity-text">Amount Details</h4>
                <span className="text-sm text-vicinity-text/60">Total: ${calculateTotalAmount().toLocaleString()}</span>
              </div>
              <div className="divide-y divide-vicinity-text/10">
                {formData.amountRows.map((row) => (
                  <div key={row.id} className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-vicinity-text/70 mb-1">Amount ($)</label>
                      <div className="flex items-center space-x-2">
                        <input type="number" value={row.amount} onChange={(e)=>{ handleAmountRowChange(row.id,'amount',e.target.value); if (rowErrors[row.id]?.amount) setRowErrors(prev=>({ ...prev, [row.id]: { ...(prev[row.id]||{}), amount: false } })) }} placeholder="0.00" step="0.01" className={`flex-1 px-3 py-2 bg-vicinity-input border ${rowErrors[row.id]?.amount ? 'border-red-500 ring-2 ring-red-500/50' : 'border-vicinity-text/20'} rounded-lg text-vicinity-text placeholder-vicinity-text/30 focus:ring-2 focus:ring-vicinity-text/50 focus:border-transparent`} required />
                      {formData.amountRows.length > 1 && (
                        <button type="button" onClick={()=>removeAmountRow(row.id)} className="p-2 text-red-400 hover:text-red-300">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                      </div>
                      {rowErrors[row.id]?.amount && (<p className="text-red-300 text-sm mt-2">Enter a valid amount</p>)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-vicinity-text/70 mb-1">Description</label>
                      <input type="text" value={row.description} onChange={(e)=>{ handleAmountRowChange(row.id,'description',e.target.value); if (rowErrors[row.id]?.description) setRowErrors(prev=>({ ...prev, [row.id]: { ...(prev[row.id]||{}), description: false } })) }} placeholder="Brief description of the work..." className={`w-full px-3 py-2 bg-vicinity-input border ${rowErrors[row.id]?.description ? 'border-red-500 ring-2 ring-red-500/50' : 'border-vicinity-text/20'} rounded-lg text-vicinity-text placeholder-vicinity-text/30 focus:ring-2 focus:ring-vicinity-text/50 focus:border-transparent`} required />
                      {rowErrors[row.id]?.description && (<p className="text-red-300 text-sm mt-2">Description is required</p>)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-vicinity-text/10">
                <button type="button" onClick={addAmountRow} className="w-full py-2 px-4 bg-vicinity-text/10 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium">Add Another Item</button>
              </div>
            </div>
            <button type="button" disabled={submitting} onClick={async ()=>{ 
              if (!formData.producerEmail.trim()) { 
                setErrors(prev=>({ ...prev, producerEmail: 'Please enter producer email' })); 
                if (emailRef.current) emailRef.current.focus(); 
                return 
              } 
              if (!formData.billTo.trim()) {
                setErrors(prev=>({ ...prev, billTo: 'Please select Bill To' }));
                if (billToRef.current) billToRef.current.focus();
                return
              }
              if (!formData.documentType.trim()) {
                setErrors(prev=>({ ...prev, documentType: 'Please select Document Type' }));
                return
              }
              const perRowErrors = {}
              let hasRowError = false
              formData.amountRows.forEach(r => {
                const amt = parseFloat(r.amount)
                const amtInvalid = !(amt > 0)
                const descInvalid = !(r.description && r.description.trim().length > 0)
                if (amtInvalid || descInvalid) {
                  hasRowError = true
                  perRowErrors[r.id] = { amount: amtInvalid, description: descInvalid }
                }
              })
              if (hasRowError) { setRowErrors(perRowErrors); return }
              const total = calculateTotalAmount()
              const details = { producerEmail: formData.producerEmail, billTo: formData.billTo, documentType: formData.documentType, receiptType: formData.receiptType, projectCode: formData.projectCode, amountRows: formData.amountRows, total }
              localStorage.setItem('submission_details', JSON.stringify(details))
              localStorage.setItem('current_document_type', formData.documentType)
              setSubmitting(true)
              try { 
                await axios.post('/drafts/step1', { producerEmail: formData.producerEmail, billTo: formData.billTo, documentType: formData.documentType, receiptType: formData.receiptType, projectCode: formData.projectCode, total, amountRows: formData.amountRows }) 
                router.visit('/document-upload') 
              } catch(e) {
                const msg = e?.response?.data?.message
                const errProducer = e?.response?.data?.errors?.producerEmail?.[0]
                const errBillTo = e?.response?.data?.errors?.billTo?.[0]
                const errDocType = e?.response?.data?.errors?.documentType?.[0]
                const errAmount = e?.response?.data?.errors?.['amountRows.0.amount']?.[0] || e?.response?.data?.errors?.['amountRows.*.amount']?.[0]
                const errDesc = e?.response?.data?.errors?.['amountRows.0.description']?.[0] || e?.response?.data?.errors?.['amountRows.*.description']?.[0]
                setErrors(prev=>({ 
                  ...prev,
                  producerEmail: errProducer || prev.producerEmail,
                  billTo: errBillTo || prev.billTo,
                  documentType: errDocType || prev.documentType,
                }))
                if (errAmount || errDesc) {
                  const perRow = {}
                  formData.amountRows.forEach(r => {
                    const amt = parseFloat(r.amount)
                    const amtInvalid = !(amt > 0)
                    const descInvalid = !(r.description && r.description.trim().length > 0)
                    if (amtInvalid || descInvalid) { perRow[r.id] = { amount: amtInvalid, description: descInvalid } }
                  })
                  setRowErrors(perRow)
                }
                if (emailRef.current) emailRef.current.focus()
              } finally {
                setSubmitting(false)
              }
            }} className="w-full bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold">Next: Upload Documents</button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
