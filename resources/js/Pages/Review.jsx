import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { Link, router } from '@inertiajs/react'
import axios from 'axios'
import { FiUser, FiCreditCard, FiFileText, FiCode, FiDollarSign, FiSend } from 'react-icons/fi'

export default function Review() {
  const details = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('submission_details') || '{}') : {}
  const files = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('vicinity_uploaded_files') || '[]') : []
  const ocrStatus = typeof window !== 'undefined' ? localStorage.getItem('vicinity_ocr_status') : null

  const total = details?.total || 0

  function submitForApproval() {
    if (ocrStatus !== 'processed') return
    const submission = {
      id: Date.now().toString(),
      documentType: details.documentType,
      producerEmail: details.producerEmail,
      billTo: details.billTo,
      amount: total.toString(),
      description: (details.amountRows || []).map(r => (r.description && r.amount) ? `${r.description}: $${r.amount}` : null).filter(Boolean).join(' | '),
      status: 'pending',
      createdAt: new Date().toISOString(),
      files,
      ocrVerified: ocrStatus === 'processed'
    }
    const existing = JSON.parse(localStorage.getItem('vicinity_submissions') || '[]')
    existing.push(submission)
    localStorage.setItem('vicinity_submissions', JSON.stringify(existing))
    try { axios.post('/drafts/submit', { total }) } catch(e){}
    router.visit('/finance-dashboard')
  }

  function typeLabel(t) {
    if (t === 'tr') return 'Talent Release Forms'
    if (t === 'receipt') return 'Receipt'
    if (t === 'invoice') return 'Invoice'
    return t
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/finance-dashboard" className="text-vicinity-text/60 hover:text-vicinity-text">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-vicinity-text mt-2">New Submission</h1>
          <p className="text-vicinity-text/60">Submit your documents for approval</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-text text-vicinity-bg">1</div><span className="ml-2 text-sm text-vicinity-text">Details</span></div>
            <div className="w-10 h-0.5 bg-vicinity-input" />
            <div className="flex items-center"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-text text-vicinity-bg">2</div><span className="ml-2 text-sm text-vicinity-text">Upload</span></div>
            <div className="w-10 h-0.5 bg-vicinity-input" />
            <div className="flex items-center"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-text text-vicinity-bg">3</div><span className="ml-2 text-sm text-vicinity-text">Verify</span></div>
            <div className="w-10 h-0.5 bg-vicinity-input" />
            <div className="flex items-center"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-vicinity-text text-vicinity-bg">4</div><span className="ml-2 text-sm text-vicinity-text">Review</span></div>
          </div>
        </div>

        <div className="bg-vicinity-card rounded-2xl shadow-xl p-8 border border-vicinity-text/10">
          <h3 className="text-xl font-bold text-vicinity-text mb-6">Review Your Submission</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-vicinity-text/10">
              <span className="flex items-center space-x-2 text-sm text-vicinity-text/60"><FiUser className="w-4 h-4" /><span>Producer in Charge:</span></span>
              <span className="font-medium text-vicinity-text">{details.producerEmail || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-vicinity-text/10">
              <span className="flex items-center space-x-2 text-sm text-vicinity-text/60"><FiCreditCard className="w-4 h-4" /><span>Bill To:</span></span>
              <span className="font-medium text-vicinity-text">{details.billTo || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-vicinity-text/10">
              <span className="flex items-center space-x-2 text-sm text-vicinity-text/60"><FiFileText className="w-4 h-4" /><span>Document Type:</span></span>
              <span className="font-medium text-vicinity-text">{typeLabel(details.documentType || '')}</span>
            </div>
            {details.documentType !== 'receipt' && (
              <div className="flex items-center justify-between py-2 border-b border-vicinity-text/10">
                <span className="flex items-center space-x-2 text-sm text-vicinity-text/60"><FiCode className="w-4 h-4" /><span>Project Code:</span></span>
                <span className="font-medium text-vicinity-text">{details.projectCode || '-'}</span>
              </div>
            )}
            <div className="py-2 border-b border-vicinity-text/10">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-sm text-vicinity-text/60"><FiDollarSign className="w-4 h-4" /><span>Amount Details:</span></span>
              </div>
              <div className="mt-2 space-y-1">
                {(details.amountRows || []).filter(r=>r.amount && r.description).map((r,i)=> (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-vicinity-text/80">{r.description}:</span>
                    <span className="font-medium text-vicinity-text">${Number(r.amount).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-medium pt-2 border-t border-vicinity-text/10">
                  <span className="text-vicinity-text">Total:</span>
                  <span className="text-vicinity-text">${Number(total).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-vicinity-text/10">
              <span className="text-sm text-vicinity-text/60">Files:</span>
              <span className="font-medium text-vicinity-text">{files.length} file(s)</span>
            </div>
            {ocrStatus === 'processed' && (
              <div className="mt-4 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-300">OCR Verified:</span>
                  <span className="font-medium text-green-400">✓ Processed</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={()=>router.visit('/ocr')} className="px-4 py-3 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium hover:bg-vicinity-hover/20">Back</button>
          <button disabled={ocrStatus !== 'processed'} onClick={submitForApproval} className={`bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center space-x-2 ${ocrStatus !== 'processed' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'}`}><FiSend className="w-4 h-4" /><span>Submit for Approval</span></button>
        </div>
      </div>
    </AppLayout>
  )
}
