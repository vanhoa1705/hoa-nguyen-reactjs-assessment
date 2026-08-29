import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-text-primary">Something went wrong.</p>
          <button
            className="rounded-full bg-brand-primary px-6 py-2 text-text-inverse"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
