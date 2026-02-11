import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, User, Settings, LogOut, ChevronRight, RefreshCcw, Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const SettingsModal = ({ isOpen, onClose, userName, setUserName, onReset }) => {
    const { theme, toggleTheme } = useThemeStore();

    if (!isOpen) return null;

    const handleNotifications = () => {
        alert('알림 설정 기능은 곧 추가됩니다!');
    };

    const handleAccountManagement = () => {
        alert('계정 관리 기능은 곧 추가됩니다!');
    };

    const handleLogout = () => {
        if (window.confirm('정말 로그아웃하시겠습니까?')) {
            alert('로그아웃 기능은 곧 추가됩니다!');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ width: '450px', padding: '40px', position: 'relative', background: 'var(--surface)' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '30px', fontSize: '1.75rem', color: 'var(--text)' }}>설정</h2>

                <div style={{ display: 'grid', gap: '25px' }}>
                    <div className="setting-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>내 프로필 이름</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                background: 'var(--background)', border: '1px solid var(--glass-border)',
                                color: 'var(--text)', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>

                    {/* Dark Mode Toggle */}
                    <div
                        onClick={toggleTheme}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ color: 'var(--text-muted)' }}>
                                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                            </div>
                            <span style={{ color: 'var(--text)' }}>
                                {theme === 'dark' ? '다크 모드' : '라이트 모드'}
                            </span>
                        </div>
                        <div style={{
                            width: '50px',
                            height: '26px',
                            borderRadius: '13px',
                            background: theme === 'dark' ? 'var(--primary)' : '#e2e8f0',
                            position: 'relative',
                            transition: 'all 0.3s'
                        }}>
                            <motion.div
                                animate={{ x: theme === 'dark' ? 24 : 0 }}
                                style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    position: 'absolute',
                                    top: '2px',
                                    left: '2px'
                                }}
                            />
                        </div>
                    </div>

                    <SettingItem
                        icon={<Bell size={18} />}
                        label="알림 설정"
                        onClick={handleNotifications}
                    />
                    <SettingItem
                        icon={<User size={18} />}
                        label="계정 관리"
                        onClick={handleAccountManagement}
                    />

                    <div
                        onClick={onReset}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ color: '#f59e0b' }}><RefreshCcw size={18} /></div>
                            <span style={{ color: 'var(--text)' }}>진단 데이터 초기화</span>
                        </div>
                        <ChevronRight size={16} color="var(--text-muted)" />
                    </div>

                    <SettingItem
                        icon={<LogOut size={18} color="#ef4444" />}
                        label="로그아웃"
                        isDangerous
                        onClick={handleLogout}
                    />
                </div>

                <button className="primary" style={{ width: '100%', marginTop: '40px' }} onClick={onClose}>
                    변경사항 저장하기
                </button>
            </motion.div>
        </div>
    );
};

const SettingItem = ({ icon, label, isDangerous, onClick }) => (
    <div
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: isDangerous ? '#ef4444' : 'var(--text-muted)' }}>{icon}</div>
            <span style={{ color: isDangerous ? '#ef4444' : 'var(--text)' }}>{label}</span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
    </div>
);

export default SettingsModal;
