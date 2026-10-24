import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an issue:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white border border-rose-200 rounded-xl m-4 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {this.props.fallbackTitle || "An error occurred in this view"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            {this.state.error?.message || "Unable to display this visualization due to an unexpected data format."}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
