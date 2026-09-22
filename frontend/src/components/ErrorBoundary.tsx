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
      // Guard against infinite loop: reload once within 10 seconds
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_reload_timestamp', now.toString());
        window.location.reload();
        return;
      }
    }

    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container className="py-20 text-center">
          <div className="bg-error/10 text-error p-8 rounded-lg max-w-2xl mx-auto border border-error/20">
            <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
            <p className="mb-4">The application encountered an unexpected error.</p>
            <div className="text-left bg-surface p-4 rounded overflow-auto max-h-96 text-sm">
              <p className="font-mono font-bold text-error mb-2">{this.state.error && this.state.error.toString()}</p>
              <pre className="font-mono text-xs text-text-muted">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors"
              onClick={() => window.location.reload()}
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
