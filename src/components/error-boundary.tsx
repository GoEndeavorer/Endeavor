"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] items-center justify-center px-4">
          <div className="w-full max-w-lg border border-medium-gray/30">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-medium-gray/20 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-red-500/80" />
              <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
              <span className="h-2 w-2 rounded-full bg-green-500/80" />
              <span className="ml-3 text-[10px] text-medium-gray/50">
                error-boundary
              </span>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-1 text-xs text-medium-gray/50">
                <span className="text-red-400">ERR!</span> component render failed
              </div>
              <p className="mb-1 text-lg font-semibold text-white/90">
                Something went wrong
              </p>
              <p className="mb-4 text-sm text-medium-gray">
                This section encountered an error and could not render.
              </p>

              {/* Error message */}
              {this.state.error?.message && (
                <div className="mb-4 border-l-2 border-red-400/30 pl-3">
                  <code className="text-xs text-medium-gray/60">
                    {this.state.error.message.length > 120
                      ? this.state.error.message.slice(0, 120) + "..."
                      : this.state.error.message}
                  </code>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="border border-code-green bg-code-green px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-transparent hover:text-code-green"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
