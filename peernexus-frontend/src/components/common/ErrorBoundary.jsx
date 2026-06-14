import React, { Component } from "react";

/**
 * React Error Boundary — catches runtime rendering errors and shows a
 * friendly fallback UI with retry capability instead of a blank white screen.
 *
 * Usage: Wrap your app (or a subtree) in <ErrorBoundary>.
 * The retry button resets the error state so React re-renders the children.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6 shadow-sm">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          {/* Message */}
          <div className="max-w-md">
            <h1 className="text-2xl font-black text-slate-800 mb-2">Oops! Something went wrong</h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-2">
              An unexpected error occurred while rendering this page.
              This has been logged and our team will look into it.
            </p>
            {/* Show error message in dev */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 text-xs text-rose-700 break-words">
                <summary className="cursor-pointer font-semibold mb-1">Error details (dev only)</summary>
                <pre className="whitespace-pre-wrap mt-2">{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap mt-2 text-rose-500">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                id="error-boundary-retry-btn"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:opacity-90 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                id="error-boundary-reload-btn"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
