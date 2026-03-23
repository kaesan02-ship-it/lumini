import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

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
    const { userData, mbtiType, userName, profile, setUserData, setMbtiType, setUserName, fetchProfile, updateProfile } = useUserStore();
    // Favorites
    const { toggleFavorite, isFavorite } = useFavorites();

    // ─── URL 해시 기반 라우팅 ──────────────────────────────────────
    const getInitialStep = () => {
        const hash = window.location.hash.replace('#', '');
        return hash || 'welcome';
    };
    const [step, setStep] = useState(getInitialStep);

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

    // ─── URL 해시 양방향 동기화 ───────────────────────────────────
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) setStep(hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const currentHash = window.location.hash.replace('#', '');
        if (step && step !== currentHash) {
            window.location.hash = step;
        }
        window.scrollTo(0, 0);
    }, [step]);

    // ─── 인증 상태 → 페이지 가드 ─────────────────────────────────
    // 핵심 로직: 로딩 완료 후 접근 권한 확인
    useEffect(() => {
        if (authLoading) return;

        const isAuthenticated = !!(user || session);

        // 비인증 사용자가 보호 경로 접근 시 → 로그인 페이지로
        if (!isAuthenticated && PROTECTED_ROUTES.has(step)) {
            setStep('auth');
            return;
        }

        // 인증된 사용자가 welcome/auth 페이지에 있으면 → 대시보드로
        if (isAuthenticated && (step === 'welcome' || step === 'auth')) {
            setStep(isAdmin ? 'admin' : 'dashboard');
        }
    }, [user, session, authLoading, isAdmin, step]);

    // ─── 관리자 패널 세션스토리지 동기화 ─────────────────────────
    useEffect(() => {
        sessionStorage.setItem('lumini_admin_open', showAdmin);
        if (showAdmin) setAdminAuthenticated(isAdmin);
    }, [showAdmin, isAdmin]);

    // ─── 테스트 결과 있으면 대시보드로 ────────────────────────────
    useEffect(() => {
        if (userData && (step === 'welcome' || step === 'test')) {
            setStep(isAdmin ? 'admin' : 'dashboard');
        }
    }, [userData, isAdmin]);

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

    // ─── 게스트 테스트 데이터 → 로그인 후 자동 동기화 ────────────
    useEffect(() => {
        if (user && profile && !authLoading) {
            const guestData = localStorage.getItem('lumini_guest_personality');
            if (guestData && (!profile.personality_data || !profile.mbti_type)) {
                try {
                    const { personality_data, mbti_type } = JSON.parse(guestData);
                    updateProfile(user.id, { personality_data, mbti_type });
                    localStorage.removeItem('lumini_guest_personality');
                } catch (e) {
                    console.error('Failed to sync guest data:', e);
                }
            }
        }
    }, [user, profile, authLoading]);

    // ─── changeStep 전역 이벤트 ────────────────────────────────────
    useEffect(() => {
        const handleStepChange = (e) => setStep(e.detail);
        window.addEventListener('changeStep', handleStepChange);
        return () => window.removeEventListener('changeStep', handleStepChange);
    }, []);

    // ─── 성격 테스트 완료 핸들러 ──────────────────────────────────
    const handleTestComplete = useCallback(async (data, type) => {
        setUserData(data);
        setMbtiType(type);
        if (user) {
            try {
                await updateProfile(user.id, { personality_data: data, mbti_type: type });
                await fetchProfile(user.id);
                await fetchNearbyUsers();
            } catch (err) {
                console.error('Profile update failed:', err);
            }
        }
        localStorage.setItem('lumini_user_data', JSON.stringify(data));
        localStorage.setItem('lumini_mbti_type', type);
        setStep('result');
    }, [user, updateProfile, fetchProfile, fetchNearbyUsers]);

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
