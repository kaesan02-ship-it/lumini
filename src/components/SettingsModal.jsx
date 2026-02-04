import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, User, Settings, LogOut, ChevronRight, RefreshCcw } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, userName, setUserName, onReset }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ width: '450px', padding: '40px', position: 'relative', background: 'white' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', color: 'var(--text)' }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '30px', fontSize: '1.75rem' }}>설정</h2>

                <div style={{ display: 'grid', gap: '25px' }}>
                    <div className="setting-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>내 프로필 이름</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                color: 'var(--text)', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ height: '1px', background: '#f1f5f9' }}></div>

                    <SettingItem icon={<Bell size={18} />} label="알림 설정" />
                    <SettingItem icon={<User size={18} />} label="계정 관리" />

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

                    <SettingItem icon={<LogOut size={18} color="#ef4444" />} label="로그아웃" isDangerous />
                </div>

                <button className="primary" style={{ width: '100%', marginTop: '40px' }} onClick={onClose}>
                    변경사항 저장하기
                </button>
            </motion.div>
        </div>
    );
};

const SettingItem = ({ icon, label, isDangerous }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: isDangerous ? '#ef4444' : 'var(--text-muted)' }}>{icon}</div>
            <span style={{ color: isDangerous ? '#ef4444' : 'var(--text)' }}>{label}</span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
    </div>
);

export default SettingsModal;
