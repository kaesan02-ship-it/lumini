import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Home, ClipboardList, Users, Heart, Brain, ShoppingBag, Target, Gem, BookOpen, ShieldCheck } from 'lucide-react';
import ShopPage from './pages/ShopPage';
import DailyChallengesPage from './pages/DailyChallengesPage';
import useCrystalStore from './store/crystalStore';

// Pages
import LandingPage from './pages/LandingPage';
import PersonalityTest from './pages/PersonalityTest';
import ResultReport from './pages/ResultReport';
import DashboardPage from './pages/DashboardPage';
import FavoritesPage from './pages/FavoritesPage';
import ChatPage from './pages/ChatPage';
import ProfileEditPage from './pages/ProfileEditPage';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import AuthPage from './pages/AuthPage';
import InsightsHubPage from './pages/InsightsHubPage';
import AIInsightsPage from './pages/AIInsightsPage';
import SoulGrowthPage from './pages/SoulGrowthPage';
import StatsPage from './pages/StatsPage';
import SoulMagazinePage from './pages/SoulMagazinePage';
import CommunityRankingPage from './pages/CommunityRankingPage';
import CompatibilityGamePage from './pages/CompatibilityGamePage';
import GroupsPage from './pages/GroupsPage';
import GroupChatPage from './pages/GroupChatPage';
import WeeklyReportPage from './pages/WeeklyReportPage';
import DeepSoulTestPage from './pages/DeepSoulTestPage';
import DeepSoulResultPage from './pages/DeepSoulResultPage';
import SoulPetPage from './pages/SoulPetPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ValueGamePage from './pages/ValueGamePage';
import AppleGamePage from './pages/AppleGamePage';

// Supabase
import { supabase } from './supabase/client';
import { upsertProfile } from './supabase/queries';

// Stores
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import useUserStore from './store/userStore';

// Components
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import TutorialOverlay from './components/TutorialOverlay';

// Supabase Queries
import { getNearbyProfiles } from './supabase/queries';

// Hooks
import useFavorites from './hooks/useFavorites';

function App() {
  const { user, session, setSession, loading: authLoading, isAdmin } = useAuthStore();
  const { userData, mbtiType, userName, profile, setUserData, setMbtiType, setUserName, fetchProfile, updateProfile } = useUserStore();
  const { crystals, dailyCheckinBonus } = useCrystalStore();

  const [step, setStep] = useState('welcome');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState(localStorage.getItem('lumini_profile_avatar') || null);

  useEffect(() => {
    const handleAvatarUpdate = (e) => {
      const avatarUrl = e.detail;
      setProfileAvatar(avatarUrl);
      localStorage.setItem('lumini_profile_avatar', avatarUrl);

      // 전역 상태(userStore)에도 즉시 반영하여 다른 페이지와 동기화
      const currentProfile = useUserStore.getState().profile || {};
      useUserStore.getState().setProfile({
        ...currentProfile,
        avatar: avatarUrl
      });
    };
    window.addEventListener('updateProfileAvatar', handleAvatarUpdate);
    return () => window.removeEventListener('updateProfileAvatar', handleAvatarUpdate);
  }, []);

  // Check first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('lumini_visited');
    if (!hasVisited) {
      setShowTutorial(true);
    }
  }, []);

  // 로그아웃 시 welcome으로 자동 이동
  useEffect(() => {
    if (!authLoading && !user && step !== 'welcome' && step !== 'auth') {
      setStep('welcome');
      setShowSettings(false);
      setShowMyProfile(false);
    }
  }, [user, authLoading]);

  const handleTutorialComplete = () => {
    localStorage.setItem('lumini_visited', 'true');
    setShowTutorial(false);
  };
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // For mock 1:1 chat if needed
  const [chatInput, setChatInput] = useState('');

  // Favorites Hook
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (err) {
        console.log('Session init skipped (mock mode):', err.message);
      }

      // Always load nearby users (works in mock mode too)
      try {
        const profiles = await getNearbyProfiles(20);
        const currentUserId = user?.id || 'mock-user-001';
        const mapped = profiles
          .filter(p => p.id !== currentUserId)
          .map(p => {
            const pd = p.personality_data || {};
            const O = pd.O || 0, C = pd.C || 0, E = pd.E || 0;
            const A = pd.A || 0, N = pd.N || 0, H = pd.H || 50;
            return {
              id: p.id,
              name: p.username || '익명',
              mbti: p.mbti_type || 'Unknown',
              bio: p.bio || '',
              similarity: 80 + Math.floor(Math.random() * 15),
              deep_soul: p.deep_soul || null,
              data: [
                { subject: '사교성', A: Math.round(E), fullMark: 100 },
                { subject: '창의성', A: Math.round(O * 0.6 + E * 0.4), fullMark: 100 },
                { subject: '공감력', A: Math.round(A * 0.6 + (100 - N) * 0.4), fullMark: 100 },
                { subject: '계획성', A: Math.round(C), fullMark: 100 },
                { subject: '자기주도', A: Math.round(C * 0.55 + H * 0.45), fullMark: 100 },
                { subject: '유연성', A: Math.round(O), fullMark: 100 },
                { subject: '따뜻함', A: Math.round(A), fullMark: 100 },
                { subject: '회복탄력', A: Math.round(100 - N), fullMark: 100 },
                { subject: '신뢰도', A: Math.round(H), fullMark: 100 },
              ]
            };
          });

        setNearbyUsers(mapped);
      } catch (err) {
        console.error('Failed to load nearby users:', err);
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, fetchProfile]);

  // Handle step based on data — 새로고침 시 검사 결과가 있으면 대시보드로 이동
  useEffect(() => {
    if (userData && (step === 'welcome' || step === 'test')) {
      setStep('dashboard');
    }
  }, [userData]);

  useEffect(() => {
    const handleStepChange = (e) => setStep(e.detail);
    window.addEventListener('changeStep', handleStepChange);
    return () => window.removeEventListener('changeStep', handleStepChange);
  }, []);

  // --- [Handlers] ---
  const handleTestComplete = (data, type) => {
    // Save raw personality object { O, C, E, A, N, H }
    setUserData(data);
    setMbtiType(type);

    // Also update Supabase if logged in
    if (user) {
      try {
        updateProfile(user.id, {
          personality_data: data,
          mbti_type: type
        });
      } catch (err) {
        console.error("Profile update failed (silently ignored in mock mode):", err);
      }
    }

    localStorage.setItem('lumini_user_data', JSON.stringify(data));
    localStorage.setItem('lumini_mbti_type', type);
    setStep('result');
  };

  const resetData = useCallback(() => {
    if (window.confirm("모든 진단 데이터가 초기화됩니다. 계속하시겠습니까?")) {
      localStorage.removeItem('lumini_user_data');
      localStorage.removeItem('lumini_mbti_type');
      setUserData(null);
      setMbtiType('?');
      setStep('welcome');
      setShowSettings(false);
    }
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: userName, text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: '지후', text: '반가워요! 어떤 분야를 가장 좋아하시나요?' }]);
    }, 1500);
  };

  // Nearby users are now fetched in the initializeApp effect above

  return (
    <div className="app-container" style={{ minHeight: '100vh', paddingBottom: step === 'welcome' ? '0' : '90px' }}>

      {/* Top Navbar */}
      <nav style={{
        height: '75px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 5%', borderBottom: '1px solid #f1f5f9', background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <h1 className="title-gradient" style={{ fontSize: '1.6rem', cursor: 'pointer', fontWeight: 800 }} onClick={() => setStep('dashboard')}>
          lumini
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAdmin(true)}
              style={{ background: '#0f172a', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldCheck size={14} /> 관리자
            </motion.button>
          )}
          {/* Crystal HUD */}
          {step !== 'welcome' && step !== 'test' && step !== 'result' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep('shop')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)', padding: '7px 14px', borderRadius: '100px', border: '1px solid #9333EA20' }}
            >
              <Gem size={14} color="#9333EA" />
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#9333EA' }}>{crystals}</span>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.1 }} onClick={() => setShowSettings(true)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#f8fafc' }}>
            <Settings size={22} color="var(--text-muted)" />
          </motion.div>
          <div
            onClick={() => setShowMyProfile(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '6px 14px',
              borderRadius: '30px', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{userName}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ padding: '0 5%' }}>
        <AnimatePresence mode="wait">
          {step === 'welcome' && <LandingPage key="landing" onStart={() => setStep('test')} onNavigateLogin={() => setStep('auth')} />}

          {step === 'test' && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px 0' }}>
              <PersonalityTest onComplete={handleTestComplete} onBack={() => setStep(userData ? 'dashboard' : 'welcome')} />
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px 0' }}>
              <ResultReport data={userData} mbtiType={mbtiType} onExplore={() => setStep('dashboard')} onNavigate={setStep} />
            </motion.div>
          )}

          {step === 'dashboard' && (
            <DashboardPage
              userData={userData}
              mbtiType={mbtiType}
              nearbyUsers={nearbyUsers}
              onSelectUser={setSelectedUser}
              onNavigate={setStep}
              userName={userName}
            />
          )}


          {step === 'apple-game' && (
            <AppleGamePage
              userName={userName}
              onBack={() => setStep('dashboard')}
            />
          )}

          {step === 'favorites' && (
            <FavoritesPage
              onBack={() => setStep('dashboard')}
              nearbyUsers={nearbyUsers}
              onSelectUser={setSelectedUser}
              onStartChat={(user) => {
                setActiveChatUser(user);
                setStep('chat');
              }}
            />
          )}

          {step === 'events' && (
            <EventsPage
              onBack={() => setStep('dashboard')}
              onSelectEvent={(event) => {
                setSelectedEvent(event);
                setStep('event-detail');
              }}
              onCreateEvent={() => setStep('create-event')}
            />
          )}
          {step === 'event-detail' && selectedEvent && (
            <EventDetailPage
              eventId={selectedEvent.id}
              onBack={() => setStep('events')}
            />
          )}
          {step === 'create-event' && (
            <CreateEventPage
              onBack={() => setStep('events')}
              onSuccess={() => setStep('events')}
            />
          )}
          {step === 'feed' && (
            <FeedPage
              onCreatePost={() => setStep('create-post')}
              onSelectPost={(post) => {
                // Future: setStep('post-detail')
              }}
            />
          )}
          {step === 'create-post' && (
            <CreatePostPage
              onBack={() => setStep('feed')}
              onSuccess={() => setStep('feed')}
            />
          )}
          {step === 'chat' && activeChatUser && (
            <ChatPage
              chatUser={activeChatUser}
              onBack={() => {
                setStep('dashboard');
                setActiveChatUser(null);
              }}
              userName={userName}
            />
          )}
          {step === 'profile-edit' && (
            <ProfileEditPage
              userData={userData}
              userName={userName}
              mbtiType={mbtiType}
              profile={profile}
              profileAvatar={profileAvatar}
              onBack={() => {
                setStep('dashboard');
                setShowMyProfile(true);
              }}
              onSave={async (data) => {
                if (user) {
                  try {
                    await updateProfile(user.id, {
                      username: data.name,
                      bio: data.bio,
                      avatar: profileAvatar, // 현재 아바타 URL 포함
                      interests: data.interests,
                      privacy_level: data.privacy,
                      district: data.district,
                      game: data.game,
                      tier: data.tier
                    });
                  } catch (err) {
                    alert('프로필 저장 중 오류가 발생했습니다.');
                  }
                } else {
                  setUserName(data.name);
                  if (data.district) {
                    localStorage.setItem('lumini_user_district', data.district);
                  }
                  useUserStore.getState().setProfile({
                    ...profile,
                    avatar: profileAvatar,
                    bio: data.bio,
                    interests: data.interests,
                    privacy_level: data.privacy,
                    district: data.district,
                    game: data.game,
                    tier: data.tier
                  });
                }
              }}
            />
          )}
          {step === 'auth' && (
            <AuthPage onAuthSuccess={() => setStep('dashboard')} />
          )}
          {step === 'insights' && (
            <InsightsHubPage onSelectCategory={(cat) => setStep(cat)} />
          )}
          {step === 'ai-insights' && (
            <AIInsightsPage userData={userData} mbtiType={mbtiType} onNavigate={setStep} />
          )}
          {step === 'growth' && (
            <SoulGrowthPage
              onBack={() => setStep('insights')}
              mbtiType={mbtiType}
            />
          )}
          {step === 'stats' && (
            <StatsPage />
          )}
          {step === 'shop' && (
            <ShopPage onBack={() => setStep('dashboard')} />
          )}
          {step === 'soul-pet' && (
            <SoulPetPage onBack={() => setStep('dashboard')} />
          )}
          {step === 'value-game' && (
            <ValueGamePage onComplete={(answers) => {
              console.log('Value Game Completed:', answers);
              // Future: Save to Supabase/localStorage
              setStep('dashboard');
            }} />
          )}
          {step === 'daily-challenges' && (
            <DailyChallengesPage
              onBack={() => setStep('dashboard')}
              mbtiType={mbtiType}
              onNavigate={setStep}
            />
          )}
          {step === 'magazine' && (
            <SoulMagazinePage mbtiType={mbtiType} onBack={() => setStep('community')} />
          )}
          {step === 'ranking' && (
            <CommunityRankingPage onBack={() => setStep('community')} mbtiType={mbtiType} />
          )}
          {step === 'compatibility-game' && (
            <CompatibilityGamePage onBack={() => setStep('community')} myMbtiType={mbtiType} onNavigate={setStep} />
          )}
          {step === 'groups' && (
            <GroupsPage onSelectGroup={(g) => { setSelectedGroup(g); setStep('group-chat'); }} />
          )}
          {step === 'group-chat' && selectedGroup && (
            <GroupChatPage group={selectedGroup} onBack={() => setStep('groups')} />
          )}
          {step === 'community' && (
            <CommunityHubPage onNavigate={setStep} />
          )}
          {step === 'weekly-report' && (
            <WeeklyReportPage onBack={() => setStep('community')} onNavigate={setStep} />
          )}
          {step === 'deep-soul-test' && (
            <DeepSoulTestPage
              onBack={() => setStep('dashboard')}
              onComplete={(answers) => {
                localStorage.setItem('lumini_deep_soul', JSON.stringify(answers));
                setStep('dashboard');
              }}
            />
          )}
          {step === 'deep-soul-result' && (
            <DeepSoulResultPage
              onBack={() => setStep('dashboard')}
              onRetake={() => setStep('deep-soul-test')}
              onNavigate={setStep}
            />
          )}
        </AnimatePresence>

        {/* Global Admin Overlay */}
        <AnimatePresence>
          {isAdmin && showAdmin && (
            !adminAuthenticated ? (
              <AdminLoginPage
                onAuthSuccess={() => setAdminAuthenticated(true)}
                onBack={() => setShowAdmin(false)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9000, background: 'white', overflowY: 'auto' }}
              >
                <AdminDashboardPage onBack={() => setShowAdmin(false)} />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      {step !== 'welcome' && step !== 'test' && step !== 'result' && (
        <nav className="bottom-nav">
          <NavItem active={step === 'dashboard'} icon={<Home size={22} />} label="홈" onClick={() => setStep('dashboard')} />
          <NavItem active={step === 'feed'} icon={<ClipboardList size={22} />} label="피드" onClick={() => setStep('feed')} />
          <NavItem active={step === 'daily-challenges'} icon={<Target size={22} />} label="챌린지" onClick={() => setStep('daily-challenges')} />
          <NavItem active={['community', 'magazine', 'ranking', 'compatibility-game', 'groups', 'group-chat', 'weekly-report'].includes(step)} icon={<Users size={22} />} label="커뮤니티" onClick={() => setStep('community')} />
          <NavItem active={step.includes('insight') || step === 'growth' || step === 'stats'} icon={<Brain size={22} />} label="인사이트" onClick={() => setStep('insights')} />
          <NavItem active={step === 'shop'} icon={<ShoppingBag size={22} />} label="상점" onClick={() => setStep('shop')} />
        </nav>
      )}

      {/* Modals */}
      {(selectedUser || showMyProfile) && (
        <ProfileModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setShowMyProfile(false);
          }}
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

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay onComplete={handleTutorialComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
    {icon}
    <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: active ? 700 : 500 }}>{label}</span>
  </div>
);

const CommunityHubPage = ({ onNavigate }) => {
  const cards = [
    { step: 'magazine', emoji: '📖', title: '소울 매거진', desc: '성향별 큐레이션 아티클 · 북마크 저장', gradient: ['#F3E8FF', '#E9D5FF'], accent: '#9333EA' },
    { step: 'compatibility-game', emoji: '💕', title: '소울 궁합 게임', desc: '6문제로 알아보는 나의 이상형 궁합 · +15💎', gradient: ['#FDF4FF', '#FAE8FF'], accent: '#D946EF' },
    { step: 'ranking', emoji: '🏆', title: '소울 랭킹', desc: '주간/월간 활동 리더보드 · +30💎 보상', gradient: ['#FFF7ED', '#FED7AA'], accent: '#F59E0B' },
    { step: 'groups', emoji: '💬', title: '소울 그룹', desc: '성향별 그룹 채팅 · 관심사 모임 참여', gradient: ['#EFF6FF', '#DBEAFE'], accent: '#3B82F6' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
      <div style={{ padding: '30px 5% 20px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white' }}>
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.6rem' }}>🌟 커뮤니티</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '0.88rem' }}>함께하면 더 즐거운 소울 공간</p>
      </div>
      <div style={{ padding: '24px 5%', display: 'grid', gap: '14px' }}>
        {cards.map(card => (
          <motion.div key={card.step} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(card.step)}
            style={{ background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`, borderRadius: '22px', padding: '22px', cursor: 'pointer', border: `1px solid ${card.accent}20`, display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden' }}>
            {card.badge && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: card.badge === 'NEW' ? '#10B981' : '#EF4444', color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '3px 8px', borderRadius: '100px' }}>{card.badge}</div>
            )}
            <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{card.emoji}</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '3px', color: '#1E293B' }}>{card.title}</div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>{card.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: card.accent, flexShrink: 0, fontSize: '1.2rem' }}>›</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default App;
