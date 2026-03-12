import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, Chrome, ArrowRight, Loader, Sparkles, Eye, EyeOff, CalendarDays } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
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

const AuthPage = ({ onAuthSuccess, onAdminClick }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
    const [showRateLimitModal, setShowRateLimitModal] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuthStore();
    const { fetchProfile } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                // 'admin' 계정은 이메일 형식이 아니어도 허용
                if (email !== 'admin' && !email.includes('@')) {
                    toast.error('올바른 이메일 주소를 입력해주세요.');
                    setLoading(false);
                    return;
                }
                const { user } = await signIn(email, password);
                if (user) {
                    await fetchProfile(user.id);
                }
                toast.success('환영합니다! 👋');
                onAuthSuccess();
            } else {
                const result = await signUp(email, password, { username, age: parseInt(age) || null });
                
                if (result?.user) {
                    await fetchProfile(result.user.id);
                }

                // Supabase 설정에 따라 가입 후 즉시 세션이 없을 수 있음 (이메일 인증 대기 등)
                if (!result?.session) {
                    toast.success('회원가입 신청 완료! 📧\n입력하신 이메일함에서 인증 링크를 클릭해주세요.', { duration: 6000 });
                    setIsLogin(true); // 로그인 화면으로 전환하여 인증 후 로그인 유도
                    return;
                }
                
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
            let msg = error.message || '인증에 실패했습니다.';
            if (msg.toLowerCase().includes('rate limit')) {
                setShowRateLimitModal(true);
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWelcomeClose = () => {
        // 실제 크리스탈 지급 (500 CP)
        earnCrystals(500, '신규 가입 환영 특전');
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
                {showRateLimitModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '15px' }}>가입 요청 횟수 초과</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '25px', fontSize: '0.95rem', wordBreak: 'keep-all' }}>
                                보안 정책 상 짧은 시간에 너무 많은 이메일 가입/로그인 요청이 발생하여 일시적으로 차단되었습니다.<br/><br/>
                                <strong style={{color:'var(--primary)'}}>팀원 테스트를 위해 제한을 푸시려면:</strong><br/>
                                1. Supabase 대시보드 로그인<br/>
                                2. Authentication {'>'} Process 설정<br/>
                                3. <strong>Rate Limits</strong> 항목의 값을 늘려주세요.<br/><br/>
                                당장 체험이 필요하다면 아래 데모 계정을 이용해 주세요!
                            </p>
                            <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '12px', marginBottom: '25px', fontSize: '0.9rem', fontWeight: 600, color: '#6366F1' }}>
                                ID: demo@lumini.me<br />
                                PW: lumini123
                            </div>
                            <button
                                onClick={() => setShowRateLimitModal(false)}
                                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                            >
                                확인
                            </button>
                        </motion.div>
                    </motion.div>
                )}
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
                        <input type="text" placeholder="이메일 주소" required value={email}
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

                <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isLogin ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
                        <button onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '8px', cursor: 'pointer' }}
                        >{isLogin ? '회원가입' : '로그인'}</button>
                    </p>
                    
                    <button 
                        onClick={onAdminClick}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', opacity: 0.6, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        관리자 전용 로그인
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
