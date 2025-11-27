import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { Link, router } from '@inertiajs/react'
import axios from 'axios'
import { FiEye } from 'react-icons/fi'

export default function OCRScanner() {
  const files = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('vicinity_uploaded_files') || '[]') : []
  const [scanning, setScanning] = React.useState(true)
  const [currentFile, setCurrentFile] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [result, setResult] = React.useState({ verified: false, expected: 0, expectedAmounts: [], matchedAmounts: [], results: [] })

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      if (files.length === 0) {
        setScanning(false)
        return
      }
      let i = 0
      setCurrentFile(0)
      setProgress(0)
      const perFileMs = 800
      function scanNext() {
        setCurrentFile(i)
        let start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const p = Math.min(1, elapsed / perFileMs)
          const overall = ((i / files.length) + (p / files.length)) * 100
          setProgress(overall)
          if (p < 1) {
            timer = setTimeout(tick, 100)
          } else {
            i += 1
            if (i < files.length) {
              start = Date.now()
              scanNext()
            } else {
              setProgress(100)
            }
          }
        }
        timer = setTimeout(tick, 100)
      }
      let timer = setTimeout(scanNext, 200)
      try {
        const resp = await axios.post('/drafts/ocr')
        if (!cancelled) {
          setResult({
            verified: !!resp.data?.verified,
            expected: resp.data?.expected || 0,
            expectedAmounts: Array.isArray(resp.data?.expectedAmounts) ? resp.data.expectedAmounts : [],
            matchedAmounts: Array.isArray(resp.data?.matchedAmounts) ? resp.data.matchedAmounts : [],
            results: Array.isArray(resp.data?.results) ? resp.data.results : []
          })
          setScanning(false)
        }
      } catch(e) {
        if (!cancelled) setScanning(false)
      }
      return () => clearTimeout(timer)
    }
    run()
    return () => { cancelled = true }
  }, [])

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
            {[
              { num: 1, label: 'Details', status: 'done' },
              { num: 2, label: 'Upload', status: 'done' },
              { num: 3, label: 'Verify', status: 'active' },
              { num: 4, label: 'Review', status: 'pending' },
            ].map((s, idx, arr) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.status === 'done' || s.status === 'active' ? 'bg-vicinity-text text-vicinity-bg' : 'bg-vicinity-input text-vicinity-text/50'}`}>{s.num}</div>
                  <span className={`ml-2 text-sm ${s.status === 'done' || s.status === 'active' ? 'text-vicinity-text' : 'text-vicinity-text/50'}`}>{s.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`h-0.5 flex-1 ${idx < 2 ? 'bg-vicinity-text' : 'bg-vicinity-input'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-vicinity-card rounded-2xl shadow-xl p-8 border border-vicinity-text/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-vicinity-text/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-vicinity-text/20">
              <FiEye className="w-8 h-8 text-vicinity-text" />
            </div>
            <h3 className="text-lg font-medium text-vicinity-text">OCR Document Verification</h3>
            <p className="text-vicinity-text/60">{scanning && files.length > 0 ? `Scanning document ${Math.min(currentFile+1, files.length)} of ${files.length}...` : files.length === 0 ? 'No files to scan' : 'Processing complete'}</p>
          </div>
          <div className="w-full bg-vicinity-input rounded-full h-2">
            <div className="bg-vicinity-text h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {scanning && (
            <div className="flex items-center justify-center space-x-3 py-8">
              <div className="w-5 h-5 border-2 border-vicinity-text border-t-transparent rounded-full animate-spin" />
              <span className="text-vicinity-text/80">Processing documents...</span>
            </div>
          )}
          {!scanning && (
            <div className="mt-6">
              {!result.verified && (
                <div className={`p-3 rounded-lg border ${result.verified ? 'border-green-500/40 bg-green-900/20' : 'border-red-500/40 bg-red-900/20'}`}>
                  <div className="text-sm">
                    <span className="font-medium">Entered Total:</span> <span className="ml-1">${Number(result.expected || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {Array.isArray(result.expectedAmounts) && result.expectedAmounts.length > 0 && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Line Item Amounts:</span>
                      <div className="mt-2">
                        {result.expectedAmounts.map((amt, i) => {
                          const matched = (result.matchedAmounts || []).some(m => Math.abs(Number(m) - Number(amt)) < 0.01)
                          return (
                            <span key={i} className={`inline-block mr-2 mb-1 px-2 py-1 rounded border text-xs ${matched ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                              ${Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div className="text-sm mt-2">
                    <span className="font-medium">Match Status:</span>
                    <span className="ml-1">{result.verified ? 'All entered amounts matched in PDFs' : 'Some amounts did not match'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!scanning && files.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <button onClick={()=>{ router.visit('/document-upload') }} className="px-4 py-3 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium hover:bg-vicinity-hover/20">Back to Upload</button>
            <button disabled={!result.verified} onClick={async ()=>{ if (!result.verified) return; localStorage.setItem('vicinity_ocr_status', 'processed'); router.visit('/review') }} className={`bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold hover:bg-white ${!result.verified ? 'opacity-50 cursor-not-allowed' : ''}`}>Continue to Review</button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
