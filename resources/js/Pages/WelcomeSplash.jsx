import AppLayout from '../Layouts/AppLayout'

export default function WelcomeSplash() {
  return (
    <AppLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold text-vicinity-text mb-6">and it's a wrap!</h1>
          <p className="text-xl text-vicinity-text/80 mb-8">Share our vision. Share your inspirations. Share your invoice, properly.</p>
          <button className="bg-vicinity-text text-vicinity-bg px-8 py-4 rounded-xl font-bold text-lg">Enter Portal</button>
          <p className="text-vicinity-text/40 text-sm mt-4">Auto-redirecting...</p>
        </div>
      </div>
    </AppLayout>
  )
}
