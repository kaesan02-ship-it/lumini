import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, Chrome, ArrowRight, Loader } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const { signIn, signUp, signInWithGoogle } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                toast.success('환영합니다!');
            } else {
                await signUp(email, password, { username });
                toast.success('회원가입이 완료되었습니다. 이메일을 확인해주세요!');
            }
            onAuthSuccess();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--background)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{
                    maxWidth: '450px',
                    width: '100%',
                    padding: '40px',
                    background: 'var(--surface)',
                    position: 'relative'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '10px' }}>
                        {isLogin ? '다시 오셨군요! 👋' : '새로운 시작! ✨'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isLogin ? 'Lumini에서 소중한 인연을 계속 이어가세요' : '나와 꼭 맞는 사람들을 만날 준비를 하세요'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    {!isLogin && (
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="사용자 이름"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '15px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                            />
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="email"
                            placeholder="이메일 주소"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '15px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '15px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="primary"
                        style={{
                            padding: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            fontSize: '1.1rem',
                            fontWeight: 700
                        }}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : (
                            <>
                                {isLogin ? '로그인' : '회원가입'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ margin: '30px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>또는</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    <button
                        onClick={signInWithGoogle}
                        style={{
                            width: '100%', padding: '15px', borderRadius: '15px',
                            border: '1px solid var(--glass-border)', background: 'var(--surface)',
                            color: 'var(--text)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '12px', cursor: 'pointer',
                            fontWeight: 600, transition: 'all 0.2s'
                        }}
                    >
                        <Chrome size={20} color="#4285F4" />
                        Google로 계속하기
                    </button>
                    <button
                        style={{
                            width: '100%', padding: '15px', borderRadius: '15px',
                            border: '1px solid var(--glass-border)', background: 'var(--surface)',
                            color: 'var(--text)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '12px', cursor: 'pointer',
                            fontWeight: 600, transition: 'all 0.2s'
                        }}
                    >
                        <Github size={20} />
                        GitHub으로 계속하기
                    </button>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isLogin ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '8px', cursor: 'pointer' }}
                        >
                            {isLogin ? '회원가입' : '로그인'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
