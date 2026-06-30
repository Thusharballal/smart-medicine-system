import React from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { MedicineProvider } from './contexts/MedicineContext'
import { ToastProvider } from './components/common/Toast'
import AppRoutes from './routes/AppRoutes'

/**
 * App – root component.
 *
 * Provider order (outermost → innermost):
 *   ThemeProvider        – must be outermost so dark class applies to <html>
 *   AuthProvider         – provides user/token state
 *   NotificationProvider – provides notification state
 *   ToastProvider        – provides imperative toast API
 *   AppRoutes            – all routes with lazy loading
 *
 * Note: BrowserRouter is provided in main.jsx so it wraps the entire tree.
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MedicineProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </MedicineProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
