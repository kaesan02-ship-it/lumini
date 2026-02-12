import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings, Home, ClipboardList, Map as MapIcon, User, Users, Heart, Brain } from 'lucide-react';

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
import GrowthTrackingPage from './pages/GrowthTrackingPage';
import StatsPage from './pages/StatsPage';

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

// Supabase Queries
import { getNearbyProfiles } from './supabase/queries';

// Hooks
import useFavorites from './hooks/useFavorites';

function App() {
  const { user, session, setSession, loading: authLoading } = useAuthStore();
  const { userData, mbtiType, userName, setUserData, setMbtiType, setUserName, fetchProfile, updateProfile } = useUserStore();

  const [step, setStep] = useState('welcome');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // For mock 1:1 chat if needed
  const [chatInput, setChatInput] = useState('');

  // Favorites Hook
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const initializeApp = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);

        // Fetch nearby users from DB
        try {
          const profiles = await getNearbyProfiles(20);
          // Transform to match front-end expectations (similarity score etc)
          const mapped = profiles
            .filter(p => p.id !== currentSession.user.id)
            .map(p => ({
              id: p.id,
              name: p.username || '익명',
              mbti: p.mbti_type || 'Unknown',
              similarity: 80 + Math.floor(Math.random() * 15), // Mock similarity for now
              data: p.personality_data || []
            }));
          setNearbyUsers(mapped);
        } catch (err) {
          console.error('Failed to load nearby users:', err);
        }
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

  // Handle step based on data
  useEffect(() => {
    if (userData && step === 'welcome') {
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
      updateProfile(user.id, {
        personality_data: data,
        mbti_type: type
      });
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
      setMbtiType('Unknown');
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
        <h1 className="title-gradient" style={{ fontSize: '1.6rem', cursor: 'pointer', fontWeight: 800 }} onClick={() => setStep('dashboard')}>lumini</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <motion.div whileHover={{ scale: 1.1 }} onClick={() => setShowSettings(true)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#f8fafc' }}>
            <Settings size={22} color="var(--text-muted)" />
          </motion.div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '6px 14px', borderRadius: '30px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{userName}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ padding: '0 5%' }}>
        <AnimatePresence mode="wait">
          {step === 'welcome' && <LandingPage key="landing" onStart={() => setStep('test')} />}

          {step === 'test' && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px 0' }}>
              <PersonalityTest onComplete={handleTestComplete} />
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px 0' }}>
              <ResultReport data={userData} mbtiType={mbtiType} onExplore={() => setStep('dashboard')} />
            </motion.div>
          )}

          {step === 'dashboard' && (
            <DashboardPage
              userData={userData}
              mbtiType={mbtiType}
              nearbyUsers={nearbyUsers}
              onSelectUser={setSelectedUser}
            />
          )}


          {step === 'favorites' && (
            <FavoritesPage
              onBack={() => setStep('dashboard')}
              nearbyUsers={nearbyUsers}
              onSelectUser={setSelectedUser}
              onStartChat={(user) => {
                setActiveChatUser(user);
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
              onBack={() => setStep('dashboard')}
              onSave={async (data) => {
                if (user) {
                  try {
                    await updateProfile(user.id, {
                      username: data.name,
                      bio: data.bio,
                      interests: data.interests,
                      privacy_level: data.privacy
                    });
                    setStep('dashboard');
                  } catch (err) {
                    alert('프로필 저장 중 오류가 발생했습니다.');
                  }
                } else {
                  setUserName(data.name);
                  setStep('dashboard');
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
            <AIInsightsPage userData={userData} mbtiType={mbtiType} />
          )}
          {step === 'growth' && (
            <GrowthTrackingPage
              onBack={() => setStep('insights')}
              onRetest={() => setStep('test')}
            />
          )}
          {step === 'stats' && (
            <StatsPage />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      {step !== 'welcome' && step !== 'test' && step !== 'result' && (
        <nav className="bottom-nav">
          <NavItem active={step === 'dashboard'} icon={<Home size={22} />} label="홈" onClick={() => setStep('dashboard')} />
          <NavItem active={step === 'feed'} icon={<ClipboardList size={22} />} label="피드" onClick={() => setStep('feed')} />
          <NavItem active={step.includes('insight') || step === 'growth' || step === 'stats'} icon={<Brain size={22} />} label="인사이트" onClick={() => setStep('insights')} />
          <NavItem active={step === 'events'} icon={<MapIcon size={22} />} label="모임" onClick={() => setStep('events')} />
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
          onStartChat={(user) => {
            setActiveChatUser(user);
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
      />
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
    {icon}
    <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: active ? 700 : 500 }}>{label}</span>
  </div>
);

export default App;
