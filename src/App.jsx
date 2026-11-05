import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { KeyRound, Lock, CheckCircle2, X } from 'lucide-react';
import Tooltip from './components/Tooltip';
import { supabase } from './supabase/client';

// ─── 레이아웃 컴포넌트 ─────────────────────────────────────────────
import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';

// ─── 라우터 ────────────────────────────────────────────────────────
import AppRouter, { PROTECTED_ROUTES } from './router/AppRouter';

// ─── 모달 / 오버레이 ───────────────────────────────────────────────
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import TutorialOverlay from './components/TutorialOverlay';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';

// ─── 스토어 ────────────────────────────────────────────────────────
import useAuthStore from './store/authStore';
import useUserStore from './store/userStore';

// ─── 훅 ────────────────────────────────────────────────────────────
import useAppInit from './hooks/useAppInit';
import useFavorites from './hooks/useFavorites';

// ─── 유틸 ──────────────────────────────────────────────────────────
import { USE_MOCK_DATA } from './config';

// ─────────────────────────────────────────────────────────────────
// App — 최상위 컴포넌트
// 역할: 전역 상태 관리, 레이아웃 조합, 모달/오버레이 제어
// ─────────────────────────────────────────────────────────────────
function App() {
    // Auth
    const { user, session, loading: authLoading, isAdmin, setSession } = useAuthStore();
    // User data
    const { userData, mbtiType, userName, profile, setUserData, setMbtiType, setUserName, fetchProfile, updateProfile, loading: profileLoading } = useUserStore();
    // Favorites
    const { toggleFavorite, isFavorite } = useFavorites();

    // ─── URL 해시 기반 라우팅 (Supabase 인증 콜백 해시 보호 포함) ──────────────────
    const isSupabaseAuthHash = (rawHash = '') =>
        rawHash.includes('access_token=') ||
        rawHash.includes('type=recovery') ||
        rawHash.includes('error_description=');

    const getInitialStep = () => {
        const hash = window.location.hash.replace('#', '');
        if (!hash || isSupabaseAuthHash(hash)) return 'welcome';
        return hash;
    };
    const [step, setStep] = useState(getInitialStep);

    // ─── 비밀번호 재설정(복구 링크 클릭 시) 전역 모달 상태 ────────────
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(() => {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        return (
            hash.includes('type=recovery') ||
            search.includes('type=recovery') ||
            sessionStorage.getItem('lumini_password_recovery') === 'true'
        );
    });
    const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
    const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
    const [recoverySaving, setRecoverySaving] = useState(false);

    // ─── UI 상태 ──────────────────────────────────────────────────
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showMyProfile, setShowMyProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [profileAvatar, setProfileAvatar] = useState(localStorage.getItem('lumini_profile_avatar') || null);
    const [showTutorial, setShowTutorial] = useState(false);

    // ─── 관리자 오버레이 ───────────────────────────────────────────
    const [showAdmin, setShowAdmin] = useState(() => sessionStorage.getItem('lumini_admin_open') === 'true');
    const [adminAuthenticated, setAdminAuthenticated] = useState(false);

    // ─── 앱 초기화 (세션 검증 + 인증 구독) ───────────────────────
    const { fetchNearbyUsers } = useAppInit(setNearbyUsers);

    // ─── URL 해시 양방향 동기화 (Supabase 복구 토큰이 있을 때는 덮어쓰기 방지) ───
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash.includes('type=recovery')) {
                sessionStorage.setItem('lumini_password_recovery', 'true');
                setShowPasswordResetModal(true);
                return;
            }
            if (hash && !isSupabaseAuthHash(hash)) {
                setStep(hash);
            }
        };
        const handleOpenRecovery = () => setShowPasswordResetModal(true);

        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('openPasswordRecovery', handleOpenRecovery);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('openPasswordRecovery', handleOpenRecovery);
        };
    }, []);

    useEffect(() => {
        const currentHash = window.location.hash.replace('#', '');
        // Supabase가 #access_token=...&type=recovery 토큰을 처리하는 동안 해시를 덮어쓰지 않도록 보호
        if (isSupabaseAuthHash(currentHash)) return;
        if (step && step !== currentHash) {
            window.location.hash = step;
        }
        window.scrollTo(0, 0);
    }, [step]);

    // 전역 새 비밀번호 변경 제출 핸들러
    const handleGlobalPasswordUpdate = async (e) => {
        e.preventDefault();
        if (!recoveryNewPassword || recoveryNewPassword.length < 4) {
            toast.error('새 비밀번호를 입력해 주세요.');
            return;
        }
        if (recoveryNewPassword !== recoveryConfirmPassword) {
            toast.error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }
        setRecoverySaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: recoveryNewPassword });
            if (error) throw error;
            sessionStorage.removeItem('lumini_password_recovery');
            setShowPasswordResetModal(false);
            setRecoveryNewPassword('');
            setRecoveryConfirmPassword('');
            if (window.location.search.includes('type=recovery')) {
                window.history.replaceState({}, '', `${window.location.pathname}#dashboard`);
            } else {
                window.location.hash = 'dashboard';
            }
            setStep('dashboard');
            toast.success('새 비밀번호로 성공적으로 변경되었습니다! 🎉', { duration: 5000 });
        } catch (err) {
            toast.error(
                err.message?.includes('at least 6')
                    ? '보안 정책상 비밀번호는 6자리 이상으로 설정해 주세요! (예: 111111)'
                    : `비밀번호 변경 실패: ${err.message || '다시 시도해 주세요.'}`
            );
        } finally {
            setRecoverySaving(false);
        }
    };

    // ─── 인증 상태 → 페이지 가드 ─────────────────────────────────
    // 핵심 로직: 로딩 완료 후 접근 권한 및 성향 테스트 완료 여부 확인
    useEffect(() => {
        // 인증 세션 확인 중일 때는 대기
        if (authLoading) return;

        const isAuthenticated = !!(user || session);
        
        // 인증은 되었으나 프로필 정보가 아직 로드되지 않은 찰나에는 대기
        if (isAuthenticated && profile === null) {
            // 만약 프로필 조회가 로딩 중이라면 로딩이 완료될 때까지 리다이렉션을 홀딩
            if (profileLoading) return;
            // 로딩도 끝났는데 profile이 계속 null인 극단적 비동기 예외 상황에서는 리턴하지 않고 통과
        }

        const hasPersonalityData = !!userData && mbtiType && mbtiType !== '?';

        // 1. 비인증 사용자 제어 (보호 라우트 접근 차단)
        if (!isAuthenticated) {
            if (PROTECTED_ROUTES.has(step)) {
                setStep('auth');
            }
            return;
        }

        // 2. 인증된 사용자 접근 제어
        if (isAdmin) {
            // 관리자는 인증 화면이나 테스트 화면에 머물 필요가 없음
            if (step === 'welcome' || step === 'auth' || step === 'test') {
                setStep('admin');
            }
            return;
        }

        // 일반 사용자
        // 온보딩 가드 완화: 성향 데이터 유무와 상관없이 대시보드 및 아케이드를 자유롭게 탐색할 수 있도록 허용
        if (step === 'welcome' || step === 'auth') {
            setStep('dashboard');
        }
    }, [user, session, authLoading, profileLoading, isAdmin, step, userData, mbtiType, profile]);

    // ─── 관리자 패널 세션스토리지 동기화 ─────────────────────────
    useEffect(() => {
        sessionStorage.setItem('lumini_admin_open', showAdmin);
        if (showAdmin) setAdminAuthenticated(isAdmin);
    }, [showAdmin, isAdmin]);

    // ─── 튜토리얼 (첫 방문 대시보드 진입 시) ─────────────────────
    useEffect(() => {
        if (!localStorage.getItem('lumini_visited') && step === 'dashboard') {
            setShowTutorial(true);
        }
    }, [step]);

    // ─── 아바타 업데이트 이벤트 (ProfileEditPage 업로드 후) ────────
    useEffect(() => {
        const handleAvatarUpdate = (e) => {
            const avatarUrl = e.detail;
            setProfileAvatar(avatarUrl);
            localStorage.setItem('lumini_profile_avatar', avatarUrl);
            if (profile) {
                useUserStore.getState().setProfile({ ...profile, avatar: avatarUrl });
            }
        };
        window.addEventListener('updateProfileAvatar', handleAvatarUpdate);
        return () => window.removeEventListener('updateProfileAvatar', handleAvatarUpdate);
    }, [profile]);



    // ─── changeStep 전역 이벤트 ────────────────────────────────────
    useEffect(() => {
        const handleStepChange = (e) => setStep(e.detail);
        window.addEventListener('changeStep', handleStepChange);
        return () => window.removeEventListener('changeStep', handleStepChange);
    }, []);

    // ─── 성격 테스트 완료 핸들러 ──────────────────────────────────
    const handleTestComplete = useCallback(async (data, type) => {
        setStep('result');
        setUserData(data);
        setMbtiType(type);
        if (user) {
            try {
                // updateProfile 내부에서 상태 업데이트가 완료되므로, 중복 렌더링 방지를 위해 fetchProfile은 생략
                await updateProfile(user.id, { personality_data: data, mbti_type: type });
                await fetchNearbyUsers();
            } catch (err) {
                console.error('Profile update failed:', err);
            }
        }
        localStorage.setItem('lumini_user_data', JSON.stringify(data));
        localStorage.setItem('lumini_mbti_type', type);
    }, [user, updateProfile, fetchNearbyUsers]);

    // ─── 데이터 리셋 (성격 테스트 재시작) ────────────────────────
    const resetData = useCallback(() => {
        localStorage.removeItem('lumini_user_data');
        localStorage.removeItem('lumini_mbti_type');
        setUserData(null);
        setMbtiType('?');
        setStep('welcome');
        setShowSettings(false);
    }, []);

    // ─── 레이아웃 표시 여부 ───────────────────────────────────────
    // ─── 앱 로딩 상태 판정 ──────────────────────────────────────────
    // 세션 조회 중이거나, 로그인 상태인데 프로필 로드가 완료되지 않은 찰나
    const isAppLoading = authLoading || (!!(user || session) && profile === null && profileLoading);

    if (isAppLoading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f8fafc',
                gap: '16px',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{
                    width: '45px',
                    height: '45px',
                    border: '3px solid #ffeef1',
                    borderTop: '3px solid #ff6b8b',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <span style={{ fontSize: '0.92rem', color: '#ff6b8b', fontWeight: 700 }}>
                    루미니를 불러오는 중... ✨
                </span>
            </div>
        );
    }

    const isLoggedIn = !!(user || userData);
    const isAuthPage = step === 'welcome' || step === 'auth';
    const showNav = isLoggedIn && !isAuthPage;

    return (
        <div className="app-container" style={{ minHeight: '100vh' }}>
            <Toaster position="top-center" reverseOrder={false} />

            {/* ─── 상단 네비게이션 ─────────────────────────────── */}
            {showNav && (
                <TopNav
                    step={step}
                    onNavigate={setStep}
                    onOpenSettings={() => setShowSettings(true)}
                    onOpenMyProfile={() => setShowMyProfile(true)}
                    onOpenAdmin={() => setShowAdmin(true)}
                />
            )}

            {/* ─── 메인 콘텐츠 ─────────────────────────────────── */}
            <main style={{ padding: isAuthPage ? '0' : '100px 5% 120px' }}>
                <AppRouter
                    step={step}
                    setStep={setStep}
                    nearbyUsers={nearbyUsers}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    activeChatUser={activeChatUser}
                    setActiveChatUser={setActiveChatUser}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    profileAvatar={profileAvatar}
                    onTestComplete={handleTestComplete}
                />

                {/* ─── 관리자 오버레이 ──────────────────────────── */}
                <AnimatePresence>
                    {showAdmin && (
                        !adminAuthenticated ? (
                            <AdminLoginPage
                                onAuthSuccess={() => setAdminAuthenticated(true)}
                                onBack={() => setShowAdmin(false)}
                            />
                        ) : (
                            isAdmin && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    zIndex: 9000, background: 'white', overflowY: 'auto',
                                }}>
                                    <AdminDashboardPage onBack={() => setShowAdmin(false)} />
                                </div>
                            )
                        )
                    )}
                </AnimatePresence>
            </main>

            {/* ─── 하단 네비게이션 ──────────────────────────────── */}
            {showNav && <BottomNav step={step} onNavigate={setStep} />}

            {/* ─── 전역 모달들 ─────────────────────────────────── */}
            {(selectedUser || showMyProfile) && (
                <ProfileModal
                    user={selectedUser}
                    onClose={() => { setSelectedUser(null); setShowMyProfile(false); }}
                    userName={userName}
                    mbtiType={mbtiType}
                    userData={userData}
                    profile={profile}
                    onStartChat={(u) => {
                        setActiveChatUser(u);
                        setSelectedUser(null);
                        setShowMyProfile(false);
                        setStep('chat');
                    }}
                />
            )}

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                userName={userName}
                setUserName={setUserName}
                onReset={resetData}
                mbtiType={mbtiType}
                userData={userData}
                onNavigate={(target) => { setShowSettings(false); setStep(target); }}
            />

            {/* ─── 비밀번호 재설정 링크 클릭 시 어느 화면에서든 즉시 열리는 전역 모달 ─── */}
            <AnimatePresence>
                {showPasswordResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 10000,
                            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 20 }}
                            style={{
                                background: 'var(--surface, #ffffff)', borderRadius: '28px', padding: '32px 24px',
                                maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                                position: 'relative'
                            }}
                        >
                            <Tooltip text="창 닫기">
                                <button
                                    type="button"
                                    onClick={() => {
                                        sessionStorage.removeItem('lumini_password_recovery');
                                        setShowPasswordResetModal(false);
                                    }}
                                    style={{
                                        position: 'absolute', top: '20px', right: '20px',
                                        background: 'var(--background, #f1f5f9)', border: 'none', borderRadius: '50%',
                                        width: '34px', height: '34px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted, #64748b)'
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </Tooltip>

                            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                                <div style={{
                                    width: '54px', height: '54px', borderRadius: '18px',
                                    background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 12px', color: 'white', boxShadow: '0 8px 20px rgba(236,72,153,0.3)'
                                }}>
                                    <KeyRound size={26} />
                                </div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--text, #0f172a)' }}>
                                    새 비밀번호 설정 🔐
                                </h3>
                                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #64748b)', margin: 0, lineHeight: 1.5 }}>
                                    {user?.email ? `${user.email} 계정의 ` : ''}새로 사용할 비밀번호를 입력해 주세요!
                                </p>
                            </div>

                            <form onSubmit={handleGlobalPasswordUpdate} style={{ display: 'grid', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', marginBottom: '6px' }}>
                                        새 비밀번호 (6자리 이상 권장)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748b)' }} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="새 비밀번호 입력"
                                            value={recoveryNewPassword}
                                            onChange={(e) => setRecoveryNewPassword(e.target.value)}
                                            style={{
                                                width: '100%', padding: '13px 13px 13px 40px', borderRadius: '12px',
                                                background: 'var(--background, #f8fafc)', border: '1.5px solid var(--glass-border, #e2e8f0)',
                                                color: 'var(--text, #0f172a)', fontSize: '0.92rem', outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', marginBottom: '6px' }}>
                                        새 비밀번호 확인
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <CheckCircle2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748b)' }} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="새 비밀번호 한 번 더 입력"
                                            value={recoveryConfirmPassword}
                                            onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                                            style={{
                                                width: '100%', padding: '13px 13px 13px 40px', borderRadius: '12px',
                                                background: 'var(--background, #f8fafc)', border: '1.5px solid var(--glass-border, #e2e8f0)',
                                                color: 'var(--text, #0f172a)', fontSize: '0.92rem', outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                <Tooltip text="입력한 새 비밀번호로 즉시 저장합니다">
                                    <button
                                        type="submit"
                                        disabled={recoverySaving}
                                        style={{
                                            marginTop: '6px', width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                                            background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                                            color: 'white', fontWeight: 900, fontSize: '0.98rem', cursor: 'pointer',
                                            boxShadow: '0 8px 20px rgba(236,72,153,0.28)'
                                        }}
                                    >
                                        {recoverySaving ? '변경 중...' : '새 비밀번호 저장 완료 ✨'}
                                    </button>
                                </Tooltip>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── 튜토리얼 오버레이 ────────────────────────────── */}
            <AnimatePresence>
                {showTutorial && (
                    <TutorialOverlay
                        onComplete={() => {
                            localStorage.setItem('lumini_visited', 'true');
                            setShowTutorial(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
