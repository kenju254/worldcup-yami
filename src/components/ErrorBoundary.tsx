'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--danger-color, #ef4444)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--danger-color, #ef4444)' }}>Widget Temporarily Unavailable</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            We encountered an issue loading this information. Please refresh the page or check back later.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
