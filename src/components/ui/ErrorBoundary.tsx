import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { StatusPage, statusPagePrimaryButton, statusPageSecondaryButton } from './StatusPage'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Catches render/lifecycle crashes anywhere below it and shows a full-page
 * fallback instead of a blank white screen. React error boundaries only work
 * as class components — there's no hooks equivalent. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white">
          <StatusPage
            icon={AlertTriangle}
            tone="danger"
            title="Something went wrong"
            description="This part of the app hit an unexpected error. Reloading usually fixes it."
            action={
              <button onClick={() => window.location.reload()} className={statusPagePrimaryButton}>
                Reload page
              </button>
            }
            secondaryAction={
              <a href="/" className={statusPageSecondaryButton}>
                Go home
              </a>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}
