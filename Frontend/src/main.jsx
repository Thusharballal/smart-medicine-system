import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Dismiss the splash screen once React has painted
// Uses requestAnimationFrame to ensure the first frame is rendered
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    if (typeof window.__splashDismiss === 'function') {
      window.__splashDismiss()
    }
  })
})
