import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // TODO: Sentry 등 에러 트래킹 서비스에 보고
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--background)',
                    color: 'var(--text)'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        padding: '40px',
                        background: 'var(--surface)',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow)'
                    }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--primary)' }}>
                            😔 앗! 문제가 발생했습니다
                        </h1>
                        <p style={{ marginBottom: '30px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            예상치 못한 오류가 발생했습니다.<br />
                            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '14px 32px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            페이지 새로고침
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{ marginTop: '30px', textAlign: 'left' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    개발자 정보
                                </summary>
                                <pre style={{
                                    marginTop: '10px',
                                    padding: '15px',
                                    background: '#f5f5f5',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    overflow: 'auto'
                                }}>
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
