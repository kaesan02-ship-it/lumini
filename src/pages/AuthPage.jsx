import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, Chrome, ArrowRight, Loader, Sparkles, Eye, EyeOff, CalendarDays } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';
import { USE_MOCK_DATA } from '../config';

// 가입 특전 팝업 컴포넌트
const WelcomeBonusPopup = ({ onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}
    >
        <motion.div
            initial={{ scale: 0.5, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                borderRadius: '32px', padding: '50px 40px',
                textAlign: 'center', maxWidth: '380px', width: '100%',
                boxShadow: '0 30px 60px rgba(79,70,229,0.5)', color: 'white', position: 'relative'
            }}
        >
            {/* 반짝이는 별들 */}
            {[...Array(6)].map((_, i) => (
                <motion.div key={i}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], rotate: [0, 180, 360] }}
                    transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.4 }}
                    style={{
                        position: 'absolute',
                        top: `${10 + (i % 3) * 30}%`,
                        left: i < 3 ? `${5 + i * 10}%` : `${70 + (i - 3) * 10}%`,
                        fontSize: '1.2rem', pointerEvents: 'none'
                    }}>✨</motion.div>
            ))}

            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: '5rem', marginBottom: '20px' }}
            >💎</motion.div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>
                가입 특전 지급! 🎉
            </h2>
            <p style={{ opacity: 0.9, marginBottom: '8px', fontSize: '1.1rem' }}>
                루미니에 오신 것을 환영합니다!
            </p>
            <div style={{
                background: 'rgba(255,255,255,0.2)', borderRadius: '20px',
                padding: '20px', margin: '20px 0', backdropFilter: 'blur(10px)'
            }}>
                <div style={{ fontSize: '3rem', fontWeight: 900 }}>💎 500</div>
                <div style={{ fontWeight: 700, opacity: 0.9 }}>크리스탈이 지급되었습니다!</div>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '24px', lineHeight: 1.5 }}>
                크리스탈로 AI 인사이트, 특별 아이템,<br />슈퍼 좋아요를 사용할 수 있어요 ✨
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                    background: 'white', color: '#4F46E5',
                    border: 'none', borderRadius: '100px',
                    padding: '16px 40px', fontWeight: 900, fontSize: '1.1rem',
                    cursor: 'pointer', width: '100%'
                }}
            >
                루미니 시작하기 🚀
            </motion.button>
        </motion.div>
    </motion.div>
);

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                toast.success('환영합니다! 👋');
                onAuthSuccess();
            } else {
                const result = await signUp(email, password, { username, age: parseInt(age) || null });
                // 가입 특전 팝업 표시
                const alreadyGiven = localStorage.getItem('lumini_welcome_bonus_given');
                if (!alreadyGiven) {
                    localStorage.setItem('lumini_welcome_bonus_given', 'true');
                    setShowWelcomeBonus(true);
                } else {
                    toast.success('회원가입 완료! 루미니에 오신 것을 환영합니다 ✨');
                    onAuthSuccess();
                }
            }
        } catch (error) {
            console.error('Auth Error:', error);
            // Supabase 등 고유 에러 메시지가 영문일 수 있으므로 번역 또는 그대로 표기
            if (error.message?.includes('Password should be at least')) {
                toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
            } else if (error.message?.includes('already registered')) {
                toast.error('이미 가입된 특수/이메일 계정입니다.');
            } else if (error.message?.includes('Invalid login credentials')) {
                toast.error('이메일 또는 비밀번호가 일치하지 않습니다.');
            } else {
                toast.error(error.message || '인증 과정에서 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWelcomeClose = () => {
        setShowWelcomeBonus(false);
        onAuthSuccess();
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '20px', paddingTop: '80px', background: 'var(--background)'
        }}>
            <AnimatePresence>
                {showWelcomeBonus && <WelcomeBonusPopup onClose={handleWelcomeClose} />}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ maxWidth: '450px', width: '100%', padding: '40px', background: 'var(--surface)', position: 'relative' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✨</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                        {isLogin ? '다시 오셨군요! 👋' : '새로운 시작! ✨'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {isLogin ? 'Lumini에서 소중한 인연을 계속 이어가세요' : '나와 꼭 맞는 사람들을 만날 준비를 하세요'}
                    </p>
                </div>

                {/* 데모 계정 힌트 */}
                {USE_MOCK_DATA && isLogin && (
                    <div style={{
                        background: 'linear-gradient(135deg, #EEF2FF, #FAF5FF)',
                        border: '1px solid #6366F130', borderRadius: '14px',
                        padding: '14px 18px', marginBottom: '24px', fontSize: '0.85rem'
                    }}>
                        <div style={{ fontWeight: 800, color: '#6366F1', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} /> 데모 계정으로 체험하기
                        </div>
                        <div style={{ color: '#4338CA' }}>
                            📧 demo@lumini.me<br />
                            🔑 lumini123
                        </div>
                        <button
                            onClick={() => { setEmail('demo@lumini.me'); setPassword('lumini123'); }}
                            style={{
                                marginTop: '8px', background: '#6366F1', color: 'white',
                                border: 'none', borderRadius: '8px', padding: '6px 14px',
                                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                            }}
                        >자동 입력</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
                    {!isLogin && (
                        <>
                            <div style={{ position: 'relative' }}>
                                <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="이름 (성명)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '2px solid transparent', background: 'var(--background)', fontSize: '1rem', transition: 'all 0.3s' }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <CalendarDays size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="number" placeholder="나이 (예: 25)" required value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '14px', background: 'var(--background)', border: '1.5px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
                                />
                            </div>
                        </>
                    )}
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="email" placeholder="이메일 주소" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '14px', background: 'var(--background)', border: '1.5px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type={showPassword ? "text" : "password"} placeholder="비밀번호" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '14px 44px 14px 44px', borderRadius: '14px', background: 'var(--background)', border: '1.5px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
                        />
                        <div 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                    </div>

                    <motion.button type="submit" disabled={loading} className="primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: 800, borderRadius: '14px' }}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : (
                            <>{isLogin ? '로그인' : '회원가입'}<ArrowRight size={20} /></>
                        )}
                    </motion.button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isLogin ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
                        <button onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '8px', cursor: 'pointer' }}
                        >{isLogin ? '회원가입' : '로그인'}</button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
