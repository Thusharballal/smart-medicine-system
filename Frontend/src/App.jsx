import AppRouter     from './routes/AppRouter'
import OfflinePage   from './pages/errors/OfflinePage'
import { Spinner }   from './components/feedback'
import { useAuth }   from './contexts/AuthContext'
import useOnlineStatus from './hooks/useOnlineStatus'
import useSessionGuard from './hooks/useSessionGuard'
// =====================================================
// Global Providers
// =====================================================
function App() {
  const { isLoading } = useAuth()
  const { isOnline }  = useOnlineStatus()
  // ── Session guard (disabled until backend JWT is ready) ────────────────
  // TODO: Set enabled=true and wire onTimeout to logout after Module 14+
  useSessionGuard({ enabled: false })
  // =====================================================
  // Application Router
  // =====================================================
  // Offline state — show offline page instead of crashing
  if (!isOnline) {
    return <OfflinePage />
  }
  // Auth rehydration loading state (localStorage restore on page refresh)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="primary" label="Loading Smart Medicine System…" />
        </div>
      </div>
    )
  }
  return <AppRouter />
}
export default App
