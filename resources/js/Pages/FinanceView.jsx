import AppLayout from '../Layouts/AppLayout'

export default function FinanceView() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-vicinity-text">Finance Dashboard</h1>
            <p className="text-vicinity-text/60 mt-2">Approved invoices ready for processing</p>
          </div>
          <button className="bg-vicinity-text text-vicinity-bg px-6 py-3 rounded-lg font-bold">Export CSV</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10"><p className="text-sm text-vicinity-text/60">Total Invoices</p><p className="text-2xl font-bold text-vicinity-text mt-1">0</p></div>
          <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10"><p className="text-sm text-vicinity-text/60">Total Amount</p><p className="text-2xl font-bold text-vicinity-text mt-1">$0</p></div>
          <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10"><p className="text-sm text-vicinity-text/60">Pending Payment</p><p className="text-2xl font-bold text-vicinity-text mt-1">0</p></div>
          <div className="bg-vicinity-card rounded-xl p-6 shadow-lg border border-vicinity-text/10"><p className="text-sm text-vicinity-text/60">This Month</p><p className="text-2xl font-bold text-vicinity-text mt-1">0</p></div>
        </div>
        <div className="bg-vicinity-card rounded-xl shadow-lg border border-vicinity-text/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-vicinity-input/50 border-b border-vicinity-text/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-vicinity-text/70">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-vicinity-text/70">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-vicinity-text/70">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-vicinity-text/70">Freelancer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-vicinity-text/70">Approved</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-vicinity-text/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 text-vicinity-text/60">No data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
