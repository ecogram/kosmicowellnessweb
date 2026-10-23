import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Container } from './ui/Container';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Auto-recover from new deployment chunk mismatch
    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.name === 'ChunkLoadError';

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_reload_timestamp');
      const now = Date.now();
      // Guard against infinite loop: reload once within 10 seconds with cache-buster
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_reload_timestamp', now.toString());
        const url = new URL(window.location.href);
        url.searchParams.set('_cb', now.toString());
        window.location.replace(url.toString());
        return;
      }
    }

    this.setState({ errorInfo });
  }

  private handleReload = async (clearAuth = false) => {
    try {
      sessionStorage.clear();
      if (clearAuth) {
        localStorage.removeItem('kosmico_auth_v1');
        localStorage.removeItem('kosmico_cart_v1');
        localStorage.removeItem('kosmico_user_orders');
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (_) {}

    const cleanPath = clearAuth ? '/login' : window.location.pathname;
    const url = new URL(cleanPath, window.location.origin);
    url.searchParams.set('_v', Date.now().toString());
    window.location.replace(url.toString());
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container className="py-20 text-center">
          <div className="bg-rose-50 text-rose-900 p-8 rounded-3xl max-w-xl mx-auto border border-rose-200 shadow-lg">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-inner">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="mb-6 text-sm text-neutral-600 leading-relaxed">
              A new version of the website was updated or your browser cached an older session. Please reload to load the latest version.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-900 transition-colors shadow-md active:scale-95 cursor-pointer"
                onClick={() => this.handleReload(false)}
              >
                Reload Application
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-rose-300 text-rose-700 font-semibold rounded-xl hover:bg-rose-50 transition-colors shadow-xs active:scale-95 cursor-pointer text-xs"
                onClick={() => this.handleReload(true)}
              >
                Clear Cache &amp; Re-login
              </button>
              <a
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors text-xs"
              >
                Go to Home
              </a>
            </div>

            {this.state.error && (
              <details className="mt-6 text-left text-[11px] text-neutral-500 bg-white/70 p-3 rounded-xl border border-rose-100">
                <summary className="cursor-pointer font-semibold text-rose-700">Technical Details</summary>
                <p className="mt-2 font-mono break-all text-neutral-700">{this.state.error.toString()}</p>
              </details>
            )}
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
