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
                        borderRadius: '32px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                        border: '1px solid var(--glass-border)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧩</div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '16px', fontWeight: 800, color: 'var(--text)' }}>
                            잠시 휴식이 필요해요
                        </h1>
                        <p style={{ marginBottom: '32px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1rem' }}>
                            일시적인 오류가 발생했습니다.<br />
                            루미니가 금방 다시 일어날 수 있도록 도와주세요.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                style={{
                                    padding: '12px 24px',
                                    fontWeight: 700,
                                    background: 'var(--surface)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                다시 시도
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '12px 24px',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 16px var(--primary-glow)'
                                }}
                            >
                                새로고침
                            </button>
                        </div>
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
