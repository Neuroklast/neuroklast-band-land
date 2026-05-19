/**
 * SectionErrorBoundary – per-section error boundary.
 *
 * When a child section throws during render the boundary catches it and renders
 * a minimal themed fallback instead of crashing the whole app.  All other
 * sections continue to function normally.
 */
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import i18n from '@/lib/i18n-config'

interface Props {
  /** Human-readable section label used in the fallback message */
  sectionName?: string
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[SectionErrorBoundary] "${this.props.sectionName ?? 'unknown'}" threw:`, error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-12 px-4 flex flex-col items-center gap-3 border border-primary/20 bg-primary/5 text-primary/60 font-mono text-xs tracking-wider">
          <span className="text-primary/40 text-[10px] uppercase">
            {this.props.sectionName ? `${this.props.sectionName} – ` : ''}{i18n.t('common.sectionUnavailable')}
          </span>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="text-[9px] text-primary/30 max-w-lg overflow-auto whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
