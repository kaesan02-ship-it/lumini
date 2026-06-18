import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidMount() {
        this.handleGlobalError = (event) => {
            const errorMsg = event.message || '';
            const errorStack = (event.error && event.error.stack) || '';
            const isChunkError = errorMsg.includes('Failed to fetch dynamically imported module') || 
                                 errorMsg.includes('ChunkLoadError') ||
                                 errorStack.includes('Failed to fetch dynamically imported module') ||
                                 errorStack.includes('ChunkLoadError');
            
            if (isChunkError) {
                this.triggerAutoReload();
            }
        };

        this.handleUnhandledRejection = (event) => {
            const reasonMsg = (event.reason && event.reason.message) || '';
            if (reasonMsg.includes('Failed to fetch dynamically imported module') || reasonMsg.includes('ChunkLoadError')) {
                this.triggerAutoReload();
            }
        };

        window.addEventListener('error', this.handleGlobalError, true);
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    componentWillUnmount() {
        if (this.handleGlobalError) {
            window.removeEventListener('error', this.handleGlobalError, true);
        }
        if (this.handleUnhandledRejection) {
            window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        }
    }

    triggerAutoReload() {
        const AUTO_RELOAD_KEY = 'lumini_last_auto_reload';
        const now = Date.now();
        const lastReload = parseInt(localStorage.getItem(AUTO_RELOAD_KEY) || '0');

        if (now - lastReload > 8000) { // 8초 간격으로 무한 루프 가드
            localStorage.setItem(AUTO_RELOAD_KEY, now.toString());
            console.warn('Chunk load error detected. Performing auto reload...');
            window.location.reload();
        }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        
        const errorMsg = error?.message || error?.toString() || '';
        if (errorMsg.includes('Failed to fetch dynamically imported module') || errorMsg.includes('ChunkLoadError')) {
            this.triggerAutoReload();
        }
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
                        {import.meta.env.DEV && this.state.error && (
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
