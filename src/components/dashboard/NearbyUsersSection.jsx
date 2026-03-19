import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import Tooltip from '../Tooltip';
import IdentityBadge from '../IdentityBadge';
import { CardSkeleton } from '../Skeleton';
import { getSoulType } from '../../data/soulTypes';

const NearbyUsersSection = ({ 
    displayedUsers, 
    activeTab, 
    setActiveTab, 
    categories, 
    neighborUsers, 
    myDistrict, 
    onSelectUser, 
    onNavigate 
}) => {
    return (
        <>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>오늘의 추천 인연 ✨</h3>
                {myDistrict && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <MapPin size={12} color="var(--primary)" /> {myDistrict}
                    </span>
                )}
            </div>

            {/* 데이터 부재 시 안내 */}
            {displayedUsers.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--surface)', borderRadius: '24px', border: '1.5px dashed var(--glass-border)', marginBottom: '30px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
                    <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>새로운 인연을 찾는 중이에요</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        아직 조건에 맞는 추천 리스트가 생성되지 않았습니다.<br/>
                        프로필을 더 자세히 작성하거나 잠시 후 다시 확인해주세요!
                    </div>
                    <Tooltip text="활동 로그 및 추천 리스트를 최신 상태로 갱신합니다.">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.reload()}
                            style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '100px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            로그 새로고침
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {/* 동네 탭 선택 시 안내 배너 */}
            {activeTab === 'friend' && (
                <div style={{
                    marginBottom: '16px', padding: '12px 16px', borderRadius: '14px',
                    background: neighborUsers.length > 0 ? 'linear-gradient(135deg, #EDE9FE, #F5F3FF)' : '#FEF9C3',
                    border: `1.5px solid ${neighborUsers.length > 0 ? '#8B5CF620' : '#FCD34D50'}`,
                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600
                }}>
                    <span style={{ fontSize: '1.1rem' }}>{neighborUsers.length > 0 ? '📍' : '⚠️'}</span>
                    {neighborUsers.length > 0
                        ? <span style={{ color: '#6D28D9' }}><strong>{myDistrict}</strong> 근처 {neighborUsers.length}명이 있어요!</span>
                        : <span style={{ color: '#92400E' }}>
                            <strong>{myDistrict}</strong>에 아직 이웃이 없어요.{' '}
                            <button onClick={() => onNavigate?.('profile-edit')} style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>동네 변경하기</button>
                        </span>
                    }
                </div>
            )}

            {/* Category Tabs */}
            <div className="tabs-container">
                {categories.map((cat) => (
                    <Tooltip key={cat.id} text={`${cat.name} 탭으로 필터링합니다.`}>
                        <button
                            onClick={() => setActiveTab(cat.id)}
                            className={`tab-button ${activeTab === cat.id ? 'active' : ''}`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    </Tooltip>
                ))}
            </div>

            {/* User Cards */}
            <div style={{ display: 'grid', gap: '20px' }}>
                {displayedUsers.length > 0 ? displayedUsers.map((user) => {
                    const userSoul = getSoulType(user.mbti);
                    return (
                        <motion.div
                            key={user.id}
                            whileHover={{ scale: 1.02 }}
                            className="user-card-dashboard"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: '200px' }}>
                                <motion.div
                                    animate={{
                                        boxShadow: user.id % 2 === 0 ? [
                                            '0 0 0 0px rgba(99, 102, 241, 0)',
                                            '0 0 0 10px rgba(99, 102, 241, 0.1)',
                                            '0 0 0 0px rgba(99, 102, 241, 0)'
                                        ] : 'none'
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="user-avatar-container"
                                    style={{ background: `linear-gradient(135deg, ${userSoul.gradient[0]}, ${userSoul.gradient[1]})` }}
                                >
                                    {userSoul.emoji}
                                    {user.id % 2 === 0 && <div className="status-indicator" />}
                                </motion.div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text)' }}>{user.name}</div>
                                        <span style={{ fontSize: '0.7rem', background: 'var(--primary-faint)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '100px', fontWeight: 800 }}>{userSoul.soulName}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                        <Sparkles size={14} color="var(--primary)" />
                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>매칭률 {user.similarity}%</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        {user.game && <IdentityBadge type="GAME" label={user.game} size="sm" />}
                                        {user.tier && <IdentityBadge type="TIER" label={user.tier} size="sm" />}
                                        {user.id % 3 === 0 && <IdentityBadge type="VERIFIED" size="sm" />}
                                        {user.similarity > 90 && <IdentityBadge type="HOT" size="sm" />}
                                    </div>
                                    {user.bio ? (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                                            {user.deep_soul ? '💎' : user.emoji || '🌟'} {user.bio}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', opacity: 0.6 }}>
                                            자기소개가 없어요 ✏️
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Tooltip text={`${user.name}님의 상세 프로필을 확인합니다.`} position="left">
                                <button className="profile-button" onClick={() => onSelectUser(user)}>
                                    프로필 보기
                                </button>
                            </Tooltip>
                        </motion.div>
                    );
                }) : (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                )}
            </div>
        </>
    );
};

export default NearbyUsersSection;
