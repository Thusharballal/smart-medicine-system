import React from 'react'
import ErrorState from './ErrorState'

/**
 * ErrorBoundary – catches render errors in subtrees and displays a
 * graceful fallback (Req 15 – Performance & Accessibility).
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * Props:
 *   fallback  – custom fallback React node (optional)
 *   onError   – (error, info) => void  (optional logger)
 *   children
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
    this.props.onError?.(error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <ErrorState
          variant="generic"
          onRetry={this.handleReset}
          description={
            import.meta.env.DEV
              ? this.state.error?.message
              : undefined
          }
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
