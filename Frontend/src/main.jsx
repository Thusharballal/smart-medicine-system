import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// =====================================================
// Global Providers
// =====================================================
import queryClient      from './config/queryClient'
import { ThemeProvider }from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'

// =====================================================
// Application Router
// =====================================================
import App              from './App.jsx'
import AppErrorBoundary from './components/common/AppErrorBoundary'
import './index.css'

// ── Future context placeholders ────────────────────────────────────────────
// TODO: import { NotificationProvider } from './contexts/NotificationContext'
// TODO: import { MedicineContextProvider } from './contexts/MedicineContext'
// ──────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <UserProvider>
                {/* TODO: <NotificationProvider> wraps here when backend is ready */}
                {/* TODO: <MedicineContextProvider> wraps here when ML API is ready */}
                <App />
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
                {/* TODO: <NotificationProvider> closes here */}
              </UserProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  </AppErrorBoundary>,
)
