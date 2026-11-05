import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader, Sparkles, Eye, EyeOff, CalendarDays, ExternalLink, AlertCircle, KeyRound, Search, CheckCircle2, X } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { supabase } from '../supabase/client';
import { toast } from 'react-hot-toast';

// 팀원들이 이름을 입력했을 때 시크릿 키 없이도 가입 이메일을 빠르게 찾을 수 있는 안전한 디렉토리 매핑
const KNOWN_TEAM_DIRECTORY = [
    { username: '원책임', email: 'kaesan02@hr.re.kr', altEmail: 'kaesan02@naver.com' },
    { username: '용재책임', email: 'wumamonn@hr.re.kr' },
    { username: '김민지', email: 'mj7368@hr.re.kr', altEmail: 'mj7368@naver.com' },
    { username: '윤선희', email: 'shyun@hr.re.kr' },
    { username: '이미옥', email: 'molee@hr.re.kr' },
    { username: '김현우', email: 'alpius@hr.re.kr' },
    { username: '나상환', email: 'na5471@naver.com' },
    { username: '백지수', email: 'zdgs0005@naver.com' },
    { username: '루미니 탐험가 (데모)', email: 'demo@lumini.me' },
];

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

    // 아이디 찾기 / 비밀번호 재설정 모달 상태
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [recoveryTab, setRecoveryTab] = useState('findId'); // 'findId' | 'resetPw'
    const [searchName, setSearchName] = useState('');
    const [foundAccounts, setFoundAccounts] = useState([]);
    const [searchingId, setSearchingId] = useState(false);
    const [hasSearchedId, setHasSearchedId] = useState(false);

    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [resettingPw, setResettingPw] = useState(false);
    const [isRecoverySession, setIsRecoverySession] = useState(false);

    const { signIn, signUp } = useAuthStore();
    const { fetchProfile } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    // 이메일의 비밀번호 재설정 링크를 클릭해 돌아왔을 때 감지하여 즉시 새 비밀번호 변경 창 오픈
    useEffect(() => {
        const hash = window.location.hash || '';
        if (hash.includes('type=recovery')) {
            setIsRecoverySession(true);
            setRecoveryTab('resetPw');
            setShowRecoveryModal(true);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoverySession(true);
                setRecoveryTab('resetPw');
                setShowRecoveryModal(true);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // 이름으로 아이디(이메일) 찾기 (시크릿 키 노출 없이 안전하게 조회)
    const handleFindIdByName = async (e) => {
        if (e) e.preventDefault();
        const keyword = searchName.trim().toLowerCase();
        setSearchingId(true);
        setHasSearchedId(true);
        try {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, username, mbti_type')
                .order('updated_at', { ascending: false });

            const results = [];
            const addedEmails = new Set();

            // 1. profiles 테이블의 회원과 디렉토리 매칭
            if (profilesData) {
                profilesData.forEach((p) => {
                    const name = p.username || '회원';
                    const dirMatch = KNOWN_TEAM_DIRECTORY.find((d) => d.username === name);
                    if (dirMatch) {
                        if (!addedEmails.has(dirMatch.email)) {
                            results.push({
                                id: `${p.id}-1`,
                                username: name,
                                email: dirMatch.email,
                                mbti: p.mbti_type || '?',
                            });
                            addedEmails.add(dirMatch.email);
                        }
                        if (dirMatch.altEmail && !addedEmails.has(dirMatch.altEmail)) {
                            results.push({
                                id: `${p.id}-2`,
                                username: `${name} (네이버)`,
                                email: dirMatch.altEmail,
                                mbti: p.mbti_type || '?',
                            });
                            addedEmails.add(dirMatch.altEmail);
                        }
                    }
                });
            }

            // 2. 누락된 기본 디렉토리 항목 추가
            KNOWN_TEAM_DIRECTORY.forEach((d, idx) => {
                if (!addedEmails.has(d.email)) {
                    results.push({
                        id: `dir-${idx}`,
                        username: d.username,
                        email: d.email,
                        mbti: '?',
                    });
                    addedEmails.add(d.email);
                }
                if (d.altEmail && !addedEmails.has(d.altEmail)) {
                    results.push({
                        id: `dir-alt-${idx}`,
                        username: `${d.username} (보조 이메일)`,
                        email: d.altEmail,
                        mbti: '?',
                    });
                    addedEmails.add(d.altEmail);
                }
            });

            const filtered = keyword
                ? results.filter(
                      (item) =>
                          item.username.toLowerCase().includes(keyword) ||
                          item.email.toLowerCase().includes(keyword)
                  )
                : results;

            setFoundAccounts(filtered);
            if (filtered.length === 0) {
                toast.error('일치하는 계정을 찾지 못했습니다. 검색어를 비우고 [찾기]를 누르면 전체 목록을 볼 수 있어요!');
            } else {
                toast.success(`${filtered.length}개의 계정을 찾았습니다!`);
            }
        } catch (err) {
            console.error('Find ID Error:', err);
            toast.error('계정 조회 중 오류가 발생했습니다.');
        } finally {
            setSearchingId(false);
        }
    };

    // 공식 Supabase 비밀번호 재설정 메일 발송 또는 복구 세션에서 새 비밀번호 변경
    const handlePasswordResetSubmit = async (e) => {
        e.preventDefault();

        // 복구 링크로 접속한 상태라면 바로 새 비밀번호로 업데이트
        if (isRecoverySession) {
            if (!newPassword || newPassword.length < 6) {
                toast.error('새 비밀번호는 6자리 이상으로 입력해 주세요.');
                return;
            }
            if (newPassword !== newPasswordConfirm) {
                toast.error('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                return;
            }
            setResettingPw(true);
            try {
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) throw error;
                toast.success('새 비밀번호로 안전하게 변경되었습니다! 🎉');
                setShowRecoveryModal(false);
                setIsRecoverySession(false);
                setPassword(newPassword);
            } catch (err) {
                toast.error(`비밀번호 변경 실패: ${err.message || '다시 시도해 주세요.'}`);
            } finally {
                setResettingPw(false);
            }
            return;
        }

        // 일반 상태에서는 공식 비밀번호 재설정 이메일 발송
        const targetEmail = resetEmail.trim();
        if (!targetEmail || !targetEmail.includes('@')) {
            toast.error('가입하신 이메일 주소를 정확히 입력해 주세요.');
            return;
        }

        setResettingPw(true);
        try {
            const redirectUrl = `${window.location.origin}${window.location.pathname}`;
            const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
                redirectTo: redirectUrl,
            });
            if (error) throw error;

            toast.success(
                `📧 ${targetEmail} 주소로 비밀번호 재설정 링크를 보냈습니다!\n메일함(또는 스팸함)에서 링크를 누르면 새 비밀번호를 설정할 수 있어요.`,
                { duration: 7000 }
            );
            setEmail(targetEmail);
        } catch (err) {
            console.error('Password Reset Email Error:', err);
            toast.error(`재설정 메일 발송 실패: ${err.message || '잠시 후 다시 시도해 주세요.'}`);
        } finally {
            setResettingPw(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                if (email !== 'admin' && !email.includes('@')) {
                    toast.error('올바른 이메일 주소를 입력해주세요.');
                    setLoading(false);
                    return;
                }
                const { user } = await signIn(email, password);
                if (user) {
                    await fetchProfile(user.id);
                    const userStore = useUserStore.getState();

                    if (email === 'demo@lumini.me' && (!userStore.userData || userStore.mbtiType === '?')) {
                        await userStore.updateProfile(user.id, {
                            personality_data: { O: 85, C: 45, E: 90, A: 75, N: 30, H: 95 },
                            mbti_type: 'ENFP',
                            deep_soul: { r1:3,r2:1,r3:2,r4:3,r5:1,r6:2,r7:3,r8:1, l1:2,l2:1,l3:3,l4:2,l5:1,l6:2,l7:3,l8:1, f1:3,f2:2,f3:1,f4:3,f5:2,f6:1,f7:3,f8:2, v1:3,v2:2,v3:1,v4:3,v5:2,v6:1,v7:3 },
                            bio: '반가워요! 루미니 데모 계정입니다 ✨',
                            username: '루미니 탐험가'
                        });
                    } else {
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

                if (!result?.session) {
                    toast.success('회원가입 신청 완료! 📧\n입력하신 이메일함에서 인증 링크를 클릭해주세요.', { duration: 6000 });
                    setIsLogin(true);
                    return;
                }
                
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
                toast.error('가입하신 이메일함에서 인증 링크를 클릭해 주셔야 로그인이 가능합니다! 📧', { duration: 8000 });
            } else if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('load failed') || lower.includes('networkerror')) {
                setShowServerPausedModal(true);
                toast.error('서버(Supabase)에 연결할 수 없습니다. 데이터베이스 절전 상태를 확인해 주세요.', { duration: 5000 });
            } else if (lower.includes('invalid login credentials')) {
                toast.error('이메일 또는 비밀번호가 일치하지 않습니다.\n기억나지 않으시면 아래 [🔑 아이디 찾기 / 비밀번호 재설정] 버튼을 눌러주세요!', { duration: 5000 });
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWelcomeClose = () => {
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

                {/* 아이디 찾기 & 비밀번호 재설정 모달 */}
                {showRecoveryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 20 }}
                            style={{
                                background: 'var(--surface)', borderRadius: '28px', padding: '28px 24px',
                                maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                                position: 'relative', maxHeight: '90vh', overflowY: 'auto'
                            }}
                        >
                            <Tooltip text="창 닫기">
                                <button
                                    type="button"
                                    onClick={() => setShowRecoveryModal(false)}
                                    style={{
                                        position: 'absolute', top: '20px', right: '20px',
                                        background: 'var(--background)', border: 'none', borderRadius: '50%',
                                        width: '34px', height: '34px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </Tooltip>

                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 12px', color: 'white', boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
                                }}>
                                    <KeyRound size={26} />
                                </div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 6px 0' }}>
                                    계정 찾기 & 비밀번호 재설정
                                </h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                                    이름으로 가입 이메일을 찾거나 비밀번호를 재설정할 수 있어요
                                </p>
                            </div>

                            {/* 탭 전환 버튼 */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                                background: 'var(--background)', padding: '5px', borderRadius: '14px', marginBottom: '20px'
                            }}>
                                <Tooltip text="가입 시 등록한 이름으로 이메일 아이디를 찾습니다">
                                    <button
                                        type="button"
                                        onClick={() => setRecoveryTab('findId')}
                                        style={{
                                            padding: '10px', borderRadius: '10px', border: 'none',
                                            background: recoveryTab === 'findId' ? 'var(--surface)' : 'transparent',
                                            color: recoveryTab === 'findId' ? '#6366F1' : 'var(--text-muted)',
                                            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                            boxShadow: recoveryTab === 'findId' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                                        }}
                                    >
                                        🔍 아이디(이메일) 찾기
                                    </button>
                                </Tooltip>
                                <Tooltip text="이메일로 비밀번호를 재설정합니다">
                                    <button
                                        type="button"
                                        onClick={() => setRecoveryTab('resetPw')}
                                        style={{
                                            padding: '10px', borderRadius: '10px', border: 'none',
                                            background: recoveryTab === 'resetPw' ? 'var(--surface)' : 'transparent',
                                            color: recoveryTab === 'resetPw' ? '#EC4899' : 'var(--text-muted)',
                                            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                            boxShadow: recoveryTab === 'resetPw' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                                        }}
                                    >
                                        🔐 비밀번호 재설정
                                    </button>
                                </Tooltip>
                            </div>

                            {recoveryTab === 'findId' ? (
                                <div>
                                    <form onSubmit={handleFindIdByName} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="text"
                                                placeholder="이름 입력 (예: 원책임, 김민지 / 비우면 전체 조회)"
                                                value={searchName}
                                                onChange={(e) => setSearchName(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '12px 12px 12px 38px', borderRadius: '12px',
                                                    background: 'var(--background)', border: '1.5px solid var(--glass-border)',
                                                    color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <Tooltip text="입력한 이름으로 가입된 이메일 계정을 검색합니다">
                                            <button
                                                type="submit"
                                                disabled={searchingId}
                                                style={{
                                                    padding: '0 16px', borderRadius: '12px', border: 'none',
                                                    background: '#6366F1', color: 'white', fontWeight: 800,
                                                    fontSize: '0.85rem', cursor: 'pointer', display: 'flex',
                                                    alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {searchingId ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                                                찾기
                                            </button>
                                        </Tooltip>
                                    </form>

                                    {hasSearchedId && (
                                        <div style={{
                                            maxHeight: '240px', overflowY: 'auto', display: 'flex',
                                            flexDirection: 'column', gap: '8px', marginBottom: '12px'
                                        }}>
                                            {foundAccounts.length > 0 ? (
                                                foundAccounts.map((acc) => (
                                                    <div
                                                        key={acc.id}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            padding: '12px 14px', borderRadius: '14px', background: 'var(--background)',
                                                            border: '1px solid var(--glass-border)', gap: '10px'
                                                        }}
                                                    >
                                                        <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                                                                {acc.username}{' '}
                                                                {acc.mbti && acc.mbti !== '?' && (
                                                                    <span style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 700 }}>
                                                                        ({acc.mbti})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                                {acc.email}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                            <Tooltip text="이 이메일로 로그인 창에 자동 입력합니다">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEmail(acc.email);
                                                                        setShowRecoveryModal(false);
                                                                        toast.success(`${acc.email} 계정이 로그인 창에 입력되었습니다!`);
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 10px', borderRadius: '8px',
                                                                        border: '1px solid #6366F1', background: 'white',
                                                                        color: '#6366F1', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    선택
                                                                </button>
                                                            </Tooltip>
                                                            <Tooltip text="이 계정의 비밀번호를 재설정합니다">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setResetEmail(acc.email);
                                                                        setRecoveryTab('resetPw');
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 10px', borderRadius: '8px',
                                                                        border: 'none', background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                                                                        color: 'white', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    비번찾기
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    검색된 계정이 없습니다. 검색어를 비우고 [찾기]를 누르면 전체 회원 목록을 볼 수 있어요!
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={{
                                        background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px',
                                        padding: '12px', fontSize: '0.78rem', color: '#4338CA', lineHeight: 1.5
                                    }}>
                                        💡 <strong>팁:</strong> 이름이 기억나지 않으시면 입력칸을 비운 채로 <strong>[찾기]</strong> 버튼을 눌러보세요. 등록된 이메일 목록에서 내 계정을 바로 선택할 수 있습니다!
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordResetSubmit} style={{ display: 'grid', gap: '14px' }}>
                                    {isRecoverySession ? (
                                        <>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                                    새로 사용할 비밀번호 (6자리 이상)
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input
                                                        type="password"
                                                        required
                                                        minLength={6}
                                                        placeholder="새 비밀번호 입력 (6자 이상)"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        style={{
                                                            width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                                                            background: 'var(--background)', border: '1.5px solid var(--glass-border)',
                                                            color: 'var(--text)', fontSize: '0.9rem', outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                                    새 비밀번호 확인
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <CheckCircle2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input
                                                        type="password"
                                                        required
                                                        minLength={6}
                                                        placeholder="새 비밀번호 한 번 더 입력"
                                                        value={newPasswordConfirm}
                                                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                                        style={{
                                                            width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                                                            background: 'var(--background)', border: '1.5px solid var(--glass-border)',
                                                            color: 'var(--text)', fontSize: '0.9rem', outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <Tooltip text="새 비밀번호로 안전하게 변경합니다">
                                                <button
                                                    type="submit"
                                                    disabled={resettingPw}
                                                    style={{
                                                        width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                                                        background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                                                        color: 'white', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                    }}
                                                >
                                                    {resettingPw ? <Loader size={18} className="animate-spin" /> : <KeyRound size={18} />}
                                                    새 비밀번호 저장하기
                                                </button>
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                                    가입한 이메일 (아이디)
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="예: kaesan02@naver.com"
                                                        value={resetEmail}
                                                        onChange={(e) => setResetEmail(e.target.value)}
                                                        style={{
                                                            width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                                                            background: 'var(--background)', border: '1.5px solid var(--glass-border)',
                                                            color: 'var(--text)', fontSize: '0.9rem', outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{
                                                background: 'rgba(236, 72, 153, 0.08)', borderRadius: '12px',
                                                padding: '10px 12px', fontSize: '0.76rem', color: '#be185d', lineHeight: 1.45
                                            }}>
                                                📧 입력하신 이메일로 <strong>안전한 비밀번호 재설정 링크</strong>를 보내드립니다. 메일함에서 링크를 클릭하면 바로 새 비밀번호를 입력하실 수 있어요!
                                            </div>

                                            <Tooltip text="입력한 이메일로 비밀번호 재설정 링크를 발송합니다">
                                                <button
                                                    type="submit"
                                                    disabled={resettingPw}
                                                    style={{
                                                        width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                                                        background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                                                        color: 'white', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        boxShadow: '0 8px 20px rgba(236,72,153,0.25)'
                                                    }}
                                                >
                                                    {resettingPw ? <Loader size={18} className="animate-spin" /> : <Mail size={18} />}
                                                    비밀번호 재설정 메일 보내기
                                                </button>
                                            </Tooltip>
                                        </>
                                    )}
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}

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

                {/* 아이디 찾기 & 비밀번호 재설정 버튼 */}
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <Tooltip text="가입한 이메일 아이디를 찾거나 비밀번호 재설정 링크를 받습니다">
                        <button
                            type="button"
                            onClick={() => {
                                setResetEmail(email || '');
                                setShowRecoveryModal(true);
                            }}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)',
                                color: '#4F46E5', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <KeyRound size={16} /> 아이디(이메일) 찾기 · 비밀번호 재설정
                        </button>
                    </Tooltip>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
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
