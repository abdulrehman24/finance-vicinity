import AppLayout from '../Layouts/AppLayout'

export default function ProducerApproval() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vicinity-text mb-2">Producer Approval</h1>
          <p className="text-vicinity-text/60">Review and approve freelancer submission</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-vicinity-card rounded-xl shadow-lg border border-vicinity-text/10 p-6">
              <h2 className="text-xl font-bold text-vicinity-text mb-6">Submission Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-vicinity-text/60 mb-1">Document Type</label>
                  <span className="text-vicinity-text capitalize">invoice</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-vicinity-text/60 mb-1">Amount</label>
                  <span className="font-medium text-lg text-vicinity-text">$0</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-vicinity-card rounded-xl shadow-lg border border-vicinity-text/10 p-6">
              <h2 className="text-xl font-bold text-vicinity-text mb-6">Make Decision</h2>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium">Approve & Send to Finance</button>
                <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium">Reject Submission</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
