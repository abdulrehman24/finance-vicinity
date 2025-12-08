import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { Link, router } from '@inertiajs/react'
import axios from 'axios'
import { FiEye } from 'react-icons/fi'

export default function OCRScanner() {
  const [scanning, setScanning] = React.useState(true)
  const [result, setResult] = React.useState({ amountFound: false, billToMatched: false, details: [] })

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const resp = await axios.post('/drafts/ocr')
        if (!cancelled) {
          const d = resp.data || {}
          setResult({ amountFound: !!d.amountFound, billToMatched: !!d.billToMatched, details: Array.isArray(d.details) ? d.details : [] })
          setScanning(false)
        }
      } catch(e) {
        if (!cancelled) setScanning(false)
      }
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
            <h3 className="text-lg font-medium text-vicinity-text">Invoice Verification</h3>
            <p className="text-vicinity-text/60">{scanning ? 'Verifying invoice total…' : 'Processing complete'}</p>
          </div>
          <div className="w-full bg-vicinity-input rounded-full h-2">
            <div className="bg-vicinity-text h-2 rounded-full" style={{ width: `${scanning ? 50 : 100}%` }} />
          </div>
          {scanning && (
            <div className="flex items-center justify-center space-x-3 py-8">
              <div className="w-5 h-5 border-2 border-vicinity-text border-t-transparent rounded-full animate-spin" />
              <span className="text-vicinity-text/80">Processing documents...</span>
            </div>
          )}
          {!scanning && (
            <div className="mt-6">
              <div className={`p-3 rounded-lg border ${result.amountFound ? 'border-green-500/40 bg-green-900/20' : 'border-red-500/40 bg-red-900/20'}`}>
                <div className="text-sm">
                  <span className="font-medium text-vicinity-text">Match Status:</span>
                  <span className="ml-1 text-vicinity-text">{result.amountFound ? 'Expected amount found as FINAL TOTAL' : 'Expected amount not found as FINAL TOTAL'}</span>
                </div>
              </div>
              <div className={`mt-3 p-3 rounded-lg border ${result.billToMatched ? 'border-green-500/40 bg-green-900/20' : 'border-yellow-500/40 bg-yellow-900/20'}`}>
                <div className="text-sm">
                  <span className="font-medium text-vicinity-text">Bill To Match:</span>
                  <span className="ml-1 text-vicinity-text">{result.billToMatched ? 'Expected Bill To matched' : 'Expected Bill To not matched'}</span>
                </div>
              </div>
              {Array.isArray(result.details) && result.details.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-vicinity-text mb-2">Per-file Results</p>
                  <div className="space-y-2">
                    {result.details.map((d, idx)=>{
                      const hasMatches = Array.isArray(d.matchedAmounts) && d.matchedAmounts.length > 0
                      const hasMissing = Array.isArray(d.missingAmounts) && d.missingAmounts.length > 0
                      return (
                        <div key={idx} className={`p-3 rounded-lg border ${hasMatches ? 'border-green-500/40 bg-green-900/20' : 'border-red-500/40 bg-red-900/20'}`}>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-vicinity-text truncate">
                              <span>{d.name || `File ${idx+1}`}</span>
                              {d.assignedType ? <span className="ml-2 text-vicinity-text/60">{d.assignedType}</span> : null}
                            </div>
                            {d.url ? (
                              <a href={d.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded bg-vicinity-text/10 border border-vicinity-text/20">Open</a>
                            ) : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {hasMatches && Array.isArray(d.matchedAmounts) && d.matchedAmounts.map((a,i)=> (
                              <span key={`m-${i}`} className="text-xs px-2 py-1 rounded bg-green-800/30 border border-green-700/40 text-green-200">Matched: {a}</span>
                            ))}
                            {!hasMatches && hasMissing && Array.isArray(d.missingAmounts) && d.missingAmounts.map((a,i)=> (
                              <span key={`x-${i}`} className="text-xs px-2 py-1 rounded bg-red-800/30 border border-red-700/40 text-red-200">Missing: {a}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!scanning && (
          <div className="mt-6 flex items-center justify-between">
            <button onClick={()=>{ router.visit('/document-upload') }} className="px-4 py-3 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium hover:bg-vicinity-hover/20">Back to Upload</button>
            <div className="flex items-center space-x-3">
              <button disabled={!(result.amountFound && result.billToMatched)} onClick={async ()=>{ if (!(result.amountFound && result.billToMatched)) return; localStorage.setItem('vicinity_ocr_status', 'processed'); router.visit('/review') }} className={`bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold hover:bg-white ${!(result.amountFound && result.billToMatched) ? 'opacity-50 cursor-not-allowed' : ''}`}>Continue to Review</button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
