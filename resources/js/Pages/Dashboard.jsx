import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { Link, router, usePage } from '@inertiajs/react'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiFileText, FiClock, FiCheck, FiDollarSign, FiCalendar, FiX } from 'react-icons/fi'
import axios from 'axios'
import SubmissionWarningModal from '../Components/SubmissionWarningModal'

export default function Dashboard() {
  const { user } = useAuth()
  const { props } = usePage()
  const [submissions, setSubmissions] = React.useState([])
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
          status: i.status || 'pending'
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
                  return (
                    <div key={s.id} className="border border-vicinity-text/10 rounded-lg p-4 bg-vicinity-bg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-vicinity-text/10 rounded-lg flex items-center justify-center border border-vicinity-text/20"><FiFileText className="w-5 h-5 text-vicinity-text" /></div>
                          <div>
                            <p className="font-medium text-vicinity-text">{typeLabel}</p>
                            <div className="flex items-center space-x-4 text-sm text-vicinity-text/60 mt-1">
                              <span className="flex items-center space-x-1"><FiCalendar className="w-4 h-4" /><span>{new Date(s.createdAt).toLocaleDateString()}</span></span>
                              <span className="flex items-center space-x-1"><FiDollarSign className="w-4 h-4" /><span>${parseFloat(s.amount || 0).toLocaleString()}</span></span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor} flex items-center space-x-1`}>
                          {s.status === 'pending' && <FiClock className="w-3 h-3" />}
                          {isApproved && <FiCheck className="w-3 h-3" />}
                          {!isApproved && s.status !== 'pending' && <FiX className="w-3 h-3" />}
                          <span className="capitalize">{s.status}</span>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <SubmissionWarningModal isOpen={showWarningModal} onClose={()=>setShowWarningModal(false)} onContinue={()=>router.visit('/submit')} />
      </div>
    </AppLayout>
  )
}
