import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'

import App from './App.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

import './styles/global.css'

registerSW({
  immediate: true
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>

      <ToastProvider>

        <AuthProvider>

          <AppDataProvider>

            <App />

          </AppDataProvider>

        </AuthProvider>

      </ToastProvider>

    </BrowserRouter>
  </React.StrictMode>
)