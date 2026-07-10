import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}>
          <div className="monogram-seal" style={{ width: '64px', height: '64px', fontSize: '1.6rem', marginBottom: '2rem' }} aria-hidden="true">
            !
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif-display)',
            fontSize: '1.75rem',
            marginBottom: '1rem',
            color: 'var(--color-gold-dark)',
          }}>
            Something went wrong
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-secondary)',
            maxWidth: '500px',
            marginBottom: '2rem',
            lineHeight: '1.7',
          }}>
            The application encountered an unexpected error. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
