import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import './bootstrap'
import '../css/app.css'
import { AuthProvider } from './contexts/AuthContext'

createInertiaApp({
  resolve: (name) => import(`./Pages/${name}.jsx`),
  setup({ el, App, props }) {
    createRoot(el).render(
      <AuthProvider>
        <App {...props} />
      </AuthProvider>
    )
  },
})
