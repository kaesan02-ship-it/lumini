import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import LandingPage from '../pages/LandingPage';
import PersonalityTest from '../pages/PersonalityTest';
import ResultReport from '../pages/ResultReport';
import DashboardPage from '../pages/DashboardPage';
import FavoritesPage from '../pages/FavoritesPage';
import ChatPage from '../pages/ChatPage';
import ProfileEditPage from '../pages/ProfileEditPage';
import EventsPage from '../pages/EventsPage';
import CreateEventPage from '../pages/CreateEventPage';
import EventDetailPage from '../pages/EventDetailPage';
import FeedPage from '../pages/FeedPage';
import CreatePostPage from '../pages/CreatePostPage';
import AuthPage from '../pages/AuthPage';
import InsightsHubPage from '../pages/InsightsHubPage';
import AIInsightsPage from '../pages/AIInsightsPage';
import SoulGrowthPage from '../pages/SoulGrowthPage';
import StatsPage from '../pages/StatsPage';
import SoulMagazinePage from '../pages/SoulMagazinePage';
import CommunityRankingPage from '../pages/CommunityRankingPage';
import CompatibilityGamePage from '../pages/CompatibilityGamePage';
import GroupsPage from '../pages/GroupsPage';
import GroupChatPage from '../pages/GroupChatPage';
import WeeklyReportPage from '../pages/WeeklyReportPage';
import DeepSoulTestPage from '../pages/DeepSoulTestPage';
import DeepSoulResultPage from '../pages/DeepSoulResultPage';
import SoulPetPage from '../pages/SoulPetPage';
import ShopPage from '../pages/ShopPage';
import DailyChallengesPage from '../pages/DailyChallengesPage';
import CommunityHubPage from '../pages/CommunityHubPage';
import ValueGamePage from '../pages/ValueGamePage';
import AppleGamePage from '../pages/AppleGamePage';
import AgentHubPage from '../pages/AgentHubPage';

// Stores
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';

// ─────────────────────────────────────────────────────────────────
// 라우트 분류
// PROTECTED: 로그인 필수 경로 — 미인증 시 auth로 리다이렉트
// PUBLIC: 누구나 접근 가능한 경로
// ─────────────────────────────────────────────────────────────────
export const PROTECTED_ROUTES = new Set([
    'dashboard', 'profile-edit', 'favorites', 'chat',
    'profile', 'admin', 'soul-pet', 'value-game',
]);

export const PUBLIC_ROUTES = new Set([
    'welcome', 'auth', 'test', 'result',
    'deep-soul-test', 'deep-soul-result',
    // 아래는 로그인 없이 열람 가능 (반공개)
    'feed', 'create-post', 'shop', 'events', 'event-detail',
    'create-event', 'community', 'groups', 'group-chat',
    'ranking', 'magazine', 'compatibility-game', 'weekly-report',
    'insights', 'ai-insights', 'stats', 'growth',
    'daily-challenges', 'apple-game', 'agent-hub',
]);

/**
 * AppRouter — 앱 전체 페이지 라우팅을 담당하는 컴포넌트
 *
 * props:
 *  step, setStep       — 현재 페이지 이름 및 변경 함수
 *  nearbyUsers         — 주변 유저 목록
 *  setNearbyUsers      — 주변 유저 목록 변경 함수
 *  selectedUser        — 프로필 모달에 표시할 유저
 *  setSelectedUser
 *  activeChatUser      — 1:1 채팅 상대
 *  setActiveChatUser
 *  selectedEvent       — 현재 선택된 이벤트
 *  setSelectedEvent
 *  selectedGroup       — 현재 선택된 그룹
 *  setSelectedGroup
 *  profileAvatar       — 프로필 아바타 URL
 *  onTestComplete(data, type) — 성격 테스트 완료 콜백
 */
const AppRouter = ({
    step,
    setStep,
    nearbyUsers,
    selectedUser,
    setSelectedUser,
    activeChatUser,
    setActiveChatUser,
    selectedEvent,
    setSelectedEvent,
    selectedGroup,
    setSelectedGroup,
    profileAvatar,
    onTestComplete,
}) => {
    const { user } = useAuthStore();
    const { userData, mbtiType, profile, updateProfile, fetchProfile } = useUserStore();

    const navigate = (target) => setStep(target);

    return (
        <AnimatePresence mode="wait">
            {/* ── 공개 페이지 ─────────────────────────────────── */}

            {step === 'welcome' && (
                <LandingPage
                    key="landing"
                    onStart={() => navigate('auth')}
                    onNavigateLogin={() => navigate('auth')}
                />
            )}

            {step === 'test' && (
                <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px 0' }}>
                    <PersonalityTest
                        onComplete={onTestComplete}
                        onBack={() => navigate(userData ? 'dashboard' : 'welcome')}
                    />
                </motion.div>
            )}

            {step === 'result' && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px 0' }}>
                    <ResultReport
                        data={userData}
                        mbtiType={mbtiType}
                        onExplore={() => navigate('dashboard')}
                        onNavigate={navigate}
                    />
                </motion.div>
            )}

            {step === 'auth' && (
                <AuthPage
                    key="auth"
                    onAuthSuccess={(session) => {
                        const isUserAdmin =
                            session?.user?.email === 'admin@lumini.me' ||
                            session?.user?.user_metadata?.isAdmin;
                            
                        if (isUserAdmin) {
                            navigate('admin');
                            return;
                        }

                        // 성향 검사를 완료했는지 store 상태를 직접 확인
                        const { userData, mbtiType } = useUserStore.getState();
                        const hasPersonalityData = !!userData && mbtiType && mbtiType !== '?';

                        navigate(hasPersonalityData ? 'dashboard' : 'test');
                    }}
                />
            )}

            {/* ── 반공개 페이지 (로그인 없이 열람 가능) ─────────── */}

            {step === 'feed' && (
                <FeedPage
                    key="feed"
                    onCreatePost={() => navigate('create-post')}
                    onSelectPost={() => {}}
                />
            )}
            {step === 'create-post' && (
                <CreatePostPage key="create-post" onBack={() => navigate('feed')} onSuccess={() => navigate('feed')} />
            )}

            {step === 'shop' && (
                <ShopPage key="shop" onBack={() => navigate('dashboard')} />
            )}

            {step === 'daily-challenges' && (
                <DailyChallengesPage
                    key="daily-challenges"
                    onBack={() => navigate('dashboard')}
                    mbtiType={mbtiType}
                    onNavigate={navigate}
                />
            )}

            {step === 'events' && (
                <EventsPage
                    key="events"
                    onBack={() => navigate('dashboard')}
                    onSelectEvent={(event) => { setSelectedEvent(event); navigate('event-detail'); }}
                    onCreateEvent={() => navigate('create-event')}
                />
            )}
            {step === 'event-detail' && selectedEvent && (
                <EventDetailPage key="event-detail" eventId={selectedEvent.id} onBack={() => navigate('events')} />
            )}
            {step === 'create-event' && (
                <CreateEventPage key="create-event" onBack={() => navigate('events')} onSuccess={() => navigate('events')} />
            )}

            {step === 'community' && (
                <CommunityHubPage key="community" onNavigate={navigate} />
            )}
            {step === 'magazine' && (
                <SoulMagazinePage key="magazine" mbtiType={mbtiType} onBack={() => navigate('community')} />
            )}
            {step === 'ranking' && (
                <CommunityRankingPage key="ranking" onBack={() => navigate('community')} mbtiType={mbtiType} />
            )}
            {step === 'compatibility-game' && (
                <CompatibilityGamePage key="compatibility-game" onBack={() => navigate('community')} myMbtiType={mbtiType} onNavigate={navigate} />
            )}
            {step === 'groups' && (
                <GroupsPage key="groups" onSelectGroup={(g) => { setSelectedGroup(g); navigate('group-chat'); }} />
            )}
            {step === 'group-chat' && selectedGroup && (
                <GroupChatPage key="group-chat" group={selectedGroup} onBack={() => navigate('groups')} />
            )}
            {step === 'weekly-report' && (
                <WeeklyReportPage key="weekly-report" onBack={() => navigate('community')} onNavigate={navigate} />
            )}

            {step === 'insights' && (
                <InsightsHubPage key="insights" onSelectCategory={navigate} onNavigate={navigate} />
            )}
            {step === 'ai-insights' && (
                <AIInsightsPage key="ai-insights" userData={userData} mbtiType={mbtiType} onNavigate={navigate} onBack={() => navigate('insights')} />
            )}
            {step === 'stats' && (
                <StatsPage key="stats" onBack={() => navigate('insights')} />
            )}
            {step === 'growth' && (
                <SoulGrowthPage key="growth" onBack={() => navigate('insights')} mbtiType={mbtiType} />
            )}

            {step === 'deep-soul-test' && (
                <DeepSoulTestPage
                    key="deep-soul-test"
                    onBack={() => navigate('dashboard')}
                    onComplete={async (answers) => {
                        localStorage.setItem('lumini_deep_soul', JSON.stringify(answers));
                        if (user) {
                            try {
                                await updateProfile(user.id, { deep_soul: answers });
                                await fetchProfile(user.id);
                            } catch (err) {
                                console.error('DeepSoul sync failed:', err);
                            }
                        }
                        navigate('dashboard');
                    }}
                />
            )}
            {step === 'deep-soul-result' && (
                <DeepSoulResultPage key="deep-soul-result" onBack={() => navigate('dashboard')} onRetake={() => navigate('deep-soul-test')} onNavigate={navigate} />
            )}

            {step === 'apple-game' && (
                <AppleGamePage key="apple-game" onBack={() => navigate('dashboard')} />
            )}

            {step === 'agent-hub' && (
                <AgentHubPage key="agent-hub" onBack={() => navigate('dashboard')} />
            )}

            {/* ── 보호 페이지 (로그인 필수) ────────────────────── */}

            {step === 'dashboard' && (
                <DashboardPage
                    key="dashboard"
                    userData={userData}
                    mbtiType={mbtiType}
                    nearbyUsers={nearbyUsers}
                    onSelectUser={setSelectedUser}
                    onNavigate={navigate}
                />
            )}

            {step === 'favorites' && (
                <FavoritesPage
                    key="favorites"
                    onBack={() => navigate('dashboard')}
                    nearbyUsers={nearbyUsers}
                    onSelectUser={setSelectedUser}
                    onStartChat={(u) => { setActiveChatUser(u); navigate('chat'); }}
                />
            )}

            {step === 'chat' && activeChatUser && (
                <ChatPage
                    key="chat"
                    chatUser={activeChatUser}
                    onBack={() => { navigate('dashboard'); setActiveChatUser(null); }}
                />
            )}

            {step === 'profile-edit' && (
                <ProfileEditPage
                    key="profile-edit"
                    userData={userData}
                    mbtiType={mbtiType}
                    profile={profile}
                    profileAvatar={profileAvatar}
                    onBack={() => { navigate('dashboard'); }}
                    onSave={async (data) => {
                        if (user) {
                            try {
                                await updateProfile(user.id, {
                                    username: data.name,
                                    bio: data.bio,
                                    avatar_url: profile?.avatar_url || profileAvatar,
                                    interests: data.interests,
                                    privacy_level: data.privacy,
                                    district: data.district,
                                    game: data.game,
                                    tier: data.tier,
                                });
                                alert('프로필이 저장되었습니다.');
                            } catch (err) {
                                console.error(err);
                                alert('프로필 저장 중 오류가 발생했습니다.');
                            }
                        }
                    }}
                />
            )}

            {step === 'soul-pet' && (
                <SoulPetPage key="soul-pet" onBack={() => navigate('dashboard')} nearbyUsers={nearbyUsers} />
            )}

            {step === 'value-game' && (
                <ValueGamePage
                    key="value-game"
                    onComplete={(answers) => {
                        localStorage.setItem('lumini_value_game_completed', 'true');
                        navigate('dashboard');
                    }}
                />
            )}
        </AnimatePresence>
    );
};

export default AppRouter;
