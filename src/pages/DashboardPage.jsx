import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import RadarChart from '../components/RadarChart';
import MapContainer from '../components/MapContainer';
import { Users, Heart, Gamepad2, Filter, Sparkles, MapPin, ChevronRight } from 'lucide-react';
import { sortUsersByMatchingScore } from '../utils/matchingAlgorithm';

const DashboardPage = ({ userData, mbtiType, nearbyUsers, onSelectUser, onJoinHive, isJoiningHive }) => {
    const [activeTab, setActiveTab] = useState('all');

    // 새로운 매칭 알고리즘 적용
    const sortedUsers = useMemo(() => {
        if (!userData || !nearbyUsers) return nearbyUsers || [];
        return sortUsersByMatchingScore(nearbyUsers, userData);
    }, [userData, nearbyUsers]);

    const categories = [
        { id: 'all', name: '전체', icon: <Filter size={16} /> },
        { id: 'friend', name: '동네 친구', icon: <Users size={16} /> },
        { id: 'date', name: '운명의 연인', icon: <Heart size={16} /> },
        { id: 'game', name: '게임 듀오', icon: <Gamepad2 size={16} /> },
    ];

    return (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) 1.5fr', gap: '40px', padding: '10px 0' }}
        >
            <div className="left-panel">
                {/* My Stats Card */}
                <div className="glass-card" style={{ padding: '35px', marginBottom: '40px', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                            내 성향 리포트
                        </h3>
                        <div style={{
                            fontSize: '1rem', color: 'var(--primary)', background: 'var(--primary-faint)',
                            padding: '6px 16px', borderRadius: '30px', fontWeight: 800,
                            boxShadow: '0 2px 4px var(--primary-glow)'
                        }}>
                            {mbtiType}
                        </div>
                    </div>
                    <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RadarChart data={userData} size={300} />
                    </div>
                </div>

                {/* Recommendation Section with Filters */}
                <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>오늘의 추천 인연 ✨</h3>
                </div>

                {/* Category Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '25px',
                                border: 'none', cursor: 'pointer',
                                background: activeTab === cat.id ? 'var(--primary)' : 'var(--surface)',
                                color: activeTab === cat.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 700, fontSize: '0.9rem',
                                boxShadow: activeTab === cat.id ? '0 10px 20px rgba(139, 92, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.03)',
                                whiteSpace: 'nowrap', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
                {/* User Cards */}
                <div style={{ display: 'grid', gap: '20px' }}>
                    {sortedUsers.slice(0, 3).map((user, index) => (
                        <motion.div
                            key={user.id}
                            whileHover={{ scale: 1.02 }}
                            className="glass-card"
                            style={{
                                padding: '24px', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', background: 'var(--surface)',
                                border: '1px solid var(--glass-border)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '22px',
                                    background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                                    border: '4px solid white', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800
                                }}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>{user.name}</div>
                                        <span style={{ fontSize: '0.75rem', background: '#f8fafc', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '6px' }}>{user.mbti}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Sparkles size={14} color="#8b5cf6" />
                                        <div style={{ fontSize: '0.95rem', color: '#8b5cf6', fontWeight: 700 }}>매칭률 {user.similarity}%</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onSelectUser(user)}
                                style={{
                                    background: '#f5f3ff', color: 'var(--primary)',
                                    border: 'none', padding: '12px 24px', borderRadius: '14px',
                                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                분석 프로필 <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="right-panel">
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={24} color="var(--primary)" /> 실시간 인연 지도
                        </h3>
                    </div>
                    <div style={{
                        borderRadius: '30px', overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        border: '8px solid var(--surface)'
                    }}>
                        <MapContainer />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardPage;
