import React from 'react';
import { motion } from 'framer-motion';
import RadarChart from '../components/RadarChart';
import MapContainer from '../components/MapContainer';

const DashboardPage = ({ userData, mbtiType, nearbyUsers, onSelectUser, onJoinHive, isJoiningHive }) => {
    return (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: '30px', padding: '10px 0' }}
        >
            <div className="left-panel">
                <div className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        내 분석 프로필
                        <span style={{ fontSize: '0.9rem', color: 'var(--primary)', background: '#f5f3ff', padding: '4px 10px', borderRadius: '20px' }}>
                            {mbtiType}
                        </span>
                    </h3>
                    <RadarChart data={userData} />
                </div>

                <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>나와 잘 맞는 추천 친구 ✨</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                    {nearbyUsers.map(user => (
                        <div key={user.id} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: '3px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}></div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>일치도 {user.similarity}%</div>
                                </div>
                            </div>
                            <button
                                onClick={() => onSelectUser(user)}
                                className="glass-card"
                                style={{ background: '#f8fafc', color: 'var(--primary)', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                            >
                                프로필 보기
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="right-panel">
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '15px', fontWeight: 700 }}>내 주변 탐색 📍</h3>
                    <MapContainer />
                </div>

                <div className="glass-card" style={{ padding: '30px', background: 'linear-gradient(135deg, white 0%, #fcfaff 100%)' }}>
                    <h3 style={{ marginBottom: '10px' }}>🐝 실시간 하이브 매칭</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        현재 사용자님의 성향과 유사한 5명이 <strong>'독서 및 인문학 대화'</strong> 하이브에서 활발히 대화 중입니다.
                        지금 바로 참여하여 새로운 인연을 만나보세요!
                    </p>
                    <button
                        disabled={isJoiningHive}
                        className="primary"
                        style={{ width: '100%', marginTop: '25px', padding: '18px', fontSize: '1.1rem' }}
                        onClick={onJoinHive}
                    >
                        {isJoiningHive ? '시뮬레이션 가동 중...' : '하이브 입장하기'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardPage;
