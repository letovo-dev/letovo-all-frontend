'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorDetails: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Обновить состояние, чтобы следующий рендер показал запасной интерфейс.
    return { hasError: true, error, errorInfo: null, showErrorDetails: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Можно также залогировать ошибку в сервисе отчетов об ошибках
    this.setState({ errorInfo });
  }

  toggleErrorDetails = () => {
    this.setState(prevState => ({
      showErrorDetails: !prevState.showErrorDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            top: 200,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1>Something went wrong. We are working on it.</h1>
          <img src="/Under_Construction_clip_art_medium.png" />
          <div onClick={this.toggleErrorDetails}>
            <h2>Error Details:</h2>
            <p>{this.state.error && this.state.error.toString()}</p>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
