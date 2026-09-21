import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, Chrome, ArrowRight, Loader, Sparkles, Eye, EyeOff, CalendarDays, ExternalLink, AlertCircle, HelpCircle } from 'lucide-react';
import Tooltip from '../components/Tooltip';
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
    const [showServerPausedModal, setShowServerPausedModal] = useState(false);

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
                    const userStore = useUserStore.getState();

                    // 데모 계정 자동 더미 데이터 주입 (성향 검사 건너뛰기)
                    if (email === 'demo@lumini.me' && (!userStore.userData || userStore.mbtiType === '?')) {
                        await userStore.updateProfile(user.id, {
                            personality_data: { O: 85, C: 45, E: 90, A: 75, N: 30, H: 95 },
                            mbti_type: 'ENFP',
                            deep_soul: { r1:3,r2:1,r3:2,r4:3,r5:1,r6:2,r7:3,r8:1, l1:2,l2:1,l3:3,l4:2,l5:1,l6:2,l7:3,l8:1, f1:3,f2:2,f3:1,f4:3,f5:2,f6:1,f7:3,f8:2, v1:3,v2:2,v3:1,v4:3,v5:2,v6:1,v7:3 },
                            bio: '반가워요! 루미니 데모 계정입니다 ✨',
                            username: '루미니 탐험가'
                        });
                    } else {
                        // 일반 계정 로컬 게스트 데이터 동기화
                        const guestData = localStorage.getItem('lumini_guest_personality');
                        if (guestData && (!userStore.userData || userStore.mbtiType === '?')) {
                            try {
                                const { personality_data, mbti_type } = JSON.parse(guestData);
                                await userStore.updateProfile(user.id, { personality_data, mbti_type });
                                localStorage.removeItem('lumini_guest_personality');
                                localStorage.removeItem('lumini_guest_test_date');
                            } catch (e) {
                                console.error('Failed to sync guest data:', e);
                            }
                        }
                    }
                }
                toast.success('환영합니다! 👋');
                onAuthSuccess();
            } else {
                const result = await signUp(email, password, { username, age: parseInt(age) || null });
                
                if (result?.user) {
                    await fetchProfile(result.user.id);
                    const userStore = useUserStore.getState();
                    
                    // 회원가입 직후 로컬 게스트 데이터 서버 동기화
                    const guestData = localStorage.getItem('lumini_guest_personality');
                    if (guestData && (!userStore.userData || userStore.mbtiType === '?')) {
                        try {
                            const { personality_data, mbti_type } = JSON.parse(guestData);
                            await userStore.updateProfile(result.user.id, { personality_data, mbti_type });
                            localStorage.removeItem('lumini_guest_personality');
                            localStorage.removeItem('lumini_guest_test_date');
                        } catch (e) {
                            console.error('Failed to sync signup guest data:', e);
                        }
                    }
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
            const lower = msg.toLowerCase();
            if (lower.includes('rate limit')) {
                setShowRateLimitModal(true);
            } else if (lower.includes('confirm') || lower.includes('not confirmed')) {
                toast.error('가입하신 이메일함에서 인증 링크를 클릭해 주셔야 로그인이 가능합니다! 📧\n(기관/연구원 메일은 차단되거나 스팸함에 들어갈 수 있으니, 테스트 편의를 위해 Supabase에서 "Confirm email" 설정을 꺼주시는 것을 권장합니다.)', { duration: 8000 });
            } else if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('load failed') || lower.includes('networkerror')) {
                setShowServerPausedModal(true);
                toast.error('서버(Supabase)에 연결할 수 없습니다. 데이터베이스 절전 상태를 확인해 주세요.', { duration: 5000 });
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
                {showServerPausedModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ background: 'var(--surface)', padding: '32px 28px', borderRadius: '24px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💤</div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '10px', color: 'var(--text)' }}>
                                데이터베이스가 잠들어 있어요
                            </h3>
                            <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '14px', marginBottom: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#b45309', lineHeight: 1.55 }}>
                                <strong>🔌 왜 'Failed to fetch' 오류가 발생하나요?</strong><br />
                                Supabase 무료 데이터베이스는 <strong>7일 동안 사용이 없으면 자동으로 전기 절약 모드(Pause)</strong>로 전환됩니다. 전원 차단기가 내려간 것과 같아 서버 주소를 찾을 수 없는 상태입니다.<br />
                                <span style={{ fontSize: '0.8rem', opacity: 0.9, display: 'block', marginTop: '4px' }}>
                                    ※ 회원님의 기존 계정 정보와 게임 점수 등 모든 데이터는 안전하게 보존되어 있으니 안심하세요!
                                </span>
                            </div>
                            <div style={{ background: 'var(--background)', padding: '14px 16px', borderRadius: '14px', marginBottom: '20px', textAlign: 'left', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '6px' }}>⚡ 1분 만에 깨우는 방법:</strong>
                                1. 아래 <strong>[Supabase 대시보드 열기]</strong> 클릭<br />
                                2. 프로젝트 상단 <strong>[Restore project]</strong> (또는 Unpause) 클릭<br />
                                3. 약 1~2분 후 새로고침하고 다시 로그인
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Tooltip text="새 창에서 Supabase 프로젝트 관리 콘솔을 엽니다">
                                    <a
                                        href="https://supabase.com/dashboard/project/uotscostmadmnaypdxus"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            width: '100%', padding: '14px', borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #10B981, #059669)',
                                            color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '0.95rem',
                                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)', cursor: 'pointer'
                                        }}
                                    >
                                        <ExternalLink size={18} /> Supabase 대시보드에서 깨우기
                                    </a>
                                </Tooltip>
                                <Tooltip text="창을 닫고 로그인 화면으로 돌아갑니다">
                                    <button
                                        onClick={() => setShowServerPausedModal(false)}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '14px',
                                            background: 'var(--background)', color: 'var(--text-muted)',
                                            border: '1px solid var(--glass-border)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
                                        }}
                                    >
                                        창 닫기
                                    </button>
                                </Tooltip>
                            </div>
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
                {isLogin && (
                    <div style={{
                        background: 'linear-gradient(135deg, #EEF2FF, #FAF5FF)',
                        border: '1px solid #6366F130', borderRadius: '14px',
                        padding: '14px 18px', marginBottom: '24px', fontSize: '0.85rem'
                    }}>
                        <div style={{ fontWeight: 800, color: '#6366F1', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} /> 데모 계정으로 빠른 체험하기
                        </div>
                        <p style={{ color: '#4338CA', margin: '0 0 8px 0', fontSize: '0.8rem', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                            접속자가 많아 이메일 가입 횟수 제한(Rate Limit) 등의 오류가 발생할 경우 아래 공용 테스트 계정으로 즉시 로그인해 보세요! ✨
                        </p>
                        <div style={{ color: '#4338CA', fontFamily: 'monospace', fontWeight: 700, background: 'rgba(255,255,255,0.6)', padding: '6px 10px', borderRadius: '8px' }}>
                            📧 demo@lumini.me<br />
                            🔑 lumini123
                        </div>
                        <button
                            type="button"
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
                        title={isLogin ? '계정에 접속하여 루미니 시작' : '새로운 계정 생성 후 루미니 시작'}
                        style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: 800, borderRadius: '14px', zIndex: 10, position: 'relative' }}
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
                            title={isLogin ? '회원가입 페이지로 이동' : '로그인 페이지로 이동'}
                            type="button"
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '8px', cursor: 'pointer', zIndex: 10, position: 'relative' }}
                        >{isLogin ? '회원가입' : '로그인'}</button>
                    </p>
                    
                    <Tooltip text="서버 연결 장애(Failed to fetch) 발생 시 복구 가이드를 확인합니다">
                        <button 
                            type="button"
                            onClick={() => setShowServerPausedModal(true)}
                            style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                            <AlertCircle size={14} /> 서버 접속 장애(Failed to fetch) 해결 가이드
                        </button>
                    </Tooltip>
                    
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
