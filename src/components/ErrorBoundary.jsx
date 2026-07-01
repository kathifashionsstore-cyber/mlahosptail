import React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled React crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 rounded-3xl shadow-xl text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-550 dark:text-red-400 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">Something went wrong</h2>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                An unexpected error occurred while rendering the page. Our team has been notified.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-mono text-slate-500 text-left overflow-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center space-x-2 bg-brand-blue hover:bg-brand-blue-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition duration-150"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
