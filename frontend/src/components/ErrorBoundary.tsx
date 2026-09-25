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

  public render() {
    if (this.state.hasError) {
      return (
        <Container className="py-20 text-center">
          <div className="bg-rose-50 text-rose-900 p-8 rounded-2xl max-w-2xl mx-auto border border-rose-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="mb-4 text-sm text-neutral-600">A new version of the website was updated. Please reload to get the latest version.</p>
            <button
              className="mt-2 px-6 py-2.5 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-900 transition-colors shadow-md active:scale-95"
              onClick={() => {
                sessionStorage.clear();
                const url = new URL(window.location.href);
                url.searchParams.set('_refresh', Date.now().toString());
                window.location.replace(url.toString());
              }}
            >
              Reload Application
            </button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
