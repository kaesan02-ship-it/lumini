import React from 'react';
import { motion } from 'framer-motion';
import { Settings, ShieldCheck, Gem } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';
import useCrystalStore from '../../store/crystalStore';
import Tooltip from '../Tooltip';

/**
 * TopNav — 앱 상단 네비게이션 바
 * props:
 *  - step: 현재 페이지 이름 (string)
 *  - onNavigate(target): 페이지 이동 콜백
 *  - onOpenSettings(): 설정 모달 열기
 *  - onOpenMyProfile(): 내 프로필 모달 열기
 *  - onOpenAdmin(): 관리자 모달 열기
 */
const TopNav = ({ step, onNavigate, onOpenSettings, onOpenMyProfile, onOpenAdmin }) => {
    const { user, isAdmin } = useAuthStore();
    const { userName } = useUserStore();
    const { crystals } = useCrystalStore();

    const showCrystal = step !== 'welcome' && step !== 'test' && step !== 'result';

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
                boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
            }}
        >
            {/* 로고 */}
            <Tooltip text="대시보드로 돌아갑니다.">
                <h1
                    className="title-gradient"
                    style={{ fontSize: '1.6rem', cursor: 'pointer', fontWeight: 800, margin: 0 }}
                    onClick={() => onNavigate('dashboard')}
                >
                    lumini
                </h1>
            </Tooltip>

            {/* 우측 액션들 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* 관리자 버튼 */}
                {isAdmin && (
                    <Tooltip text="관리자 대시보드를 엽니다.">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={onOpenAdmin}
                            style={{
                                background: '#0f172a',
                                color: 'white',
                                border: 'none',
                                padding: '7px 14px',
                                borderRadius: '100px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <ShieldCheck size={14} /> 관리자
                        </motion.button>
                    </Tooltip>
                )}

                {/* 크리스탈 HUD */}
                {showCrystal && (
                    <Tooltip text="상점으로 이동하여 크리스탈을 사용하세요.">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            onClick={() => onNavigate('shop')}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
                                padding: '7px 14px',
                                borderRadius: '100px',
                                border: '1px solid #9333EA20',
                            }}
                        >
                            <Gem size={14} color="#9333EA" />
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#9333EA' }}>{crystals}</span>
                        </motion.div>
                    </Tooltip>
                )}

                {/* 설정 아이콘 */}
                <Tooltip text="설정을 변경하거나 로그아웃합니다.">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        onClick={onOpenSettings}
                        style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#f8fafc' }}
                    >
                        <Settings size={22} color="var(--text-muted)" />
                    </motion.div>
                </Tooltip>

                {/* 내 프로필 */}
                <Tooltip text="내 프로필 정보를 확인합니다.">
                    <div
                        onClick={onOpenMyProfile}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#f8fafc',
                            padding: '6px 14px',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    >
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                            }}
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{userName || (user?.email?.split('@')[0]) || '사용자'}</span>
                    </div>
                </Tooltip>
            </div>
        </nav>
    );
};

export default TopNav;
