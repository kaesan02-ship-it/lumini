import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Home, ClipboardList, Map as MapIcon, User } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import PersonalityTest from './pages/PersonalityTest';
import ResultReport from './pages/ResultReport';
import DashboardPage from './pages/DashboardPage';
import HivePage from './pages/HivePage';

// Components
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';

function App() {
  // --- [State Management & Data Persistence] ---
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem('lumini_user_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [mbtiType, setMbtiType] = useState(() => {
    return localStorage.getItem('lumini_mbti_type') || 'Unknown';
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('lumini_user_name') || '사용자';
  });

  const [step, setStep] = useState(() => {
    const savedData = localStorage.getItem('lumini_user_data');
    return savedData ? 'dashboard' : 'welcome';
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isJoiningHive, setIsJoiningHive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: '시스템', text: '새로운 멤버 \'사용자\'님이 입장했습니다.', isSystem: true },
    { sender: '지후', text: '안녕하세요! 다들 책 읽는 거 좋아하시나요?' },
    { sender: '서연', text: '네, 저는 요즘 인문학 서적에 빠져있어요.' },
  ]);

  // --- [Effects] ---
  useEffect(() => {
    localStorage.setItem('lumini_user_name', userName);
  }, [userName]);

  // --- [Handlers] ---
  const handleTestComplete = (data, type) => {
    const chartData = [
      { subject: '개방성', A: data.O, fullMark: 100 },
      { subject: '성실성', A: data.C, fullMark: 100 },
      { subject: '외향성', A: data.E, fullMark: 100 },
      { subject: '우호성', A: data.A, fullMark: 100 },
      { subject: '신경증', A: data.N, fullMark: 100 },
      { subject: '정직성', A: data.H || 50, fullMark: 100 },
    ];

    setUserData(chartData);
    setMbtiType(type);
    localStorage.setItem('lumini_user_data', JSON.stringify(chartData));
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

  // --- [Mock Data] ---
  const nearbyUsers = [
    {
      id: 1, name: '지후', similarity: 92, data: [
        { subject: '개방성', A: 80 }, { subject: '성실성', A: 70 }, { subject: '외향성', A: 90 }, { subject: '우호성', A: 85 }, { subject: '신경증', A: 30 }, { subject: '정직성', A: 75 }
      ]
    },
    {
      id: 2, name: '서연', similarity: 88, data: [
        { subject: '개방성', A: 60 }, { subject: '성실성', A: 90 }, { subject: '외향성', A: 40 }, { subject: '우호성', A: 75 }, { subject: '신경증', A: 20 }, { subject: '정직성', A: 95 }
      ]
    }
  ];

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
              onJoinHive={() => {
                setIsJoiningHive(true);
                setTimeout(() => { setStep('hive'); setIsJoiningHive(false); }, 1200);
              }}
              isJoiningHive={isJoiningHive}
            />
          )}

          {step === 'hive' && (
            <HivePage
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSendMessage={handleSendMessage}
              userName={userName}
              onBack={() => setStep('dashboard')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      {step !== 'welcome' && step !== 'test' && (
        <nav className="bottom-nav">
          <NavItem active={step === 'dashboard' || step === 'hive'} icon={<Home size={22} />} label="홈" onClick={() => setStep('dashboard')} />
          <NavItem active={false} icon={<MapIcon size={22} />} label="탐색" onClick={() => setStep('dashboard')} />
          <NavItem active={step === 'test'} icon={<ClipboardList size={22} />} label="성격진단" onClick={() => setStep('test')} />
          <NavItem active={false} icon={<User size={22} />} label="프로필" onClick={() => setShowSettings(true)} />
        </nav>
      )}

      {/* Overlays */}
      <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} userData={userData} />
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
