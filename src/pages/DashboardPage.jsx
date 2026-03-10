import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import RadarChart from '../components/RadarChart';
import {
    Users, Heart, Gamepad2, Filter, Sparkles, MapPin,
    ChevronRight, Gem, Target, Flame, ShieldCheck, Zap
} from 'lucide-react';
import IdentityBadge from '../components/IdentityBadge';
import { sortUsersByMatchingScore } from '../utils/matchingAlgorithm';
import { CardSkeleton, ChartSkeleton } from '../components/Skeleton';
import { getSoulType } from '../data/soulTypes';
import useCrystalStore from '../store/crystalStore';
import LumiMascot from '../components/LumiMascot';

const DashboardPage = ({ userData, mbtiType, nearbyUsers, onSelectUser, onNavigate, userName }) => {
    const [activeTab, setActiveTab] = useState('all');
    const { crystals, isPremium, isBoostActive } = useCrystalStore();
    const streak = parseInt(localStorage.getItem('lumini_streak') || '0');
    const hasDeepSoul = !!localStorage.getItem('lumini_deep_soul');
    const isBoosted = isBoostActive();
    // 내 지역 (localStorage 우선 → mock default)
    const myDistrict = localStorage.getItem('lumini_user_district') || '서울 마포구';
    const completedChallenges = (() => {
        const saved = localStorage.getItem('lumini_challenges_done');
        const today = new Date().toDateString();
        if (saved) { const p = JSON.parse(saved); return p.date === today ? p.ids.length : 0; }
        return 0;
    })();

    // 새로운 매칭 알고리즘 적용
    const sortedUsers = useMemo(() => {
        if (!userData || !nearbyUsers) return nearbyUsers || [];
        return sortUsersByMatchingScore(nearbyUsers, userData);
    }, [userData, nearbyUsers]);

    // 동네 친구 필터 — 같은 구(district)인 유저
    const neighborUsers = useMemo(() => {
        if (!myDistrict) return sortedUsers;
        return sortedUsers.filter(u => u.district && u.district === myDistrict);
    }, [sortedUsers, myDistrict]);

    // 탭 기준 유저 목록
    const displayedUsers = useMemo(() => {
        if (activeTab === 'friend') return neighborUsers;
        return sortedUsers;
    }, [activeTab, sortedUsers, neighborUsers]);

    const categories = [
        { id: 'all', name: '전체', icon: <Filter size={16} /> },
        { id: 'friend', name: `동네 친구 (${neighborUsers.length})`, icon: <MapPin size={16} /> },
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
                {/* 🦦 Lumi Mascot Welcome Message */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '30px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    border: '1.5px solid #f1f5f9'
                }}>
                    <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                        <LumiMascot size={80} personalityData={userData} />
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <div style={{
                            background: '#f8fafc',
                            padding: '15px 20px',
                            borderRadius: '18px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#334155',
                            lineHeight: 1.5,
                            position: 'relative'
                        }}>
                            {userName}님, 반가워요! 🦦<br />
                            오늘 루미니에서 <span style={{ color: '#7c3aed' }}>운명의 소울메이트</span>를 만날 확률이 무척 높아요!
                            <div style={{
                                position: 'absolute',
                                left: '-10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 0,
                                height: 0,
                                borderTop: '10px solid transparent',
                                borderBottom: '10px solid transparent',
                                borderRight: '10px solid #f8fafc'
                            }} />
                        </div>
                    </div>
                </div>
                {/* 💎 Crystal & Challenge Widget */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate && onNavigate('apple-game')}
                        style={{
                            background: 'linear-gradient(135deg, #FF6B6B, #EE5253)',
                            borderRadius: '18px', padding: '18px', cursor: 'pointer', color: 'white',
                            position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>역대급 중독성 🔥</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            🍎 사과 게임
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '0.72rem', opacity: 0.9 }}>드래그로 10 만들기! 🏆</div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate && onNavigate('daily-challenges')}
                        style={{
                            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                            borderRadius: '18px', padding: '18px', cursor: 'pointer', color: 'white',
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>오늘의 챌린지</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Target size={20} /> {completedChallenges}/3
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '0.72rem', opacity: 0.9 }}>🔥 {streak}일 연속</div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate && onNavigate('value-game')}
                        style={{
                            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                            borderRadius: '18px', padding: '18px', cursor: 'pointer', color: 'white',
                            position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>가치관 밸런스</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {hasDeepSoul ? <Sparkles size={20} /> : <Zap size={20} />}
                            {hasDeepSoul ? '검사 완료!' : '시작하기'}
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '0.72rem', opacity: 0.9 }}>
                            {hasDeepSoul ? '딥 소울 매칭 활성화 됨 💎' : '매칭 확률 UP 🚀'}
                        </div>
                        <motion.div
                            animate={{ x: [0, 100], opacity: [0, 0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '100%', background: 'white', filter: 'blur(10px)', skewX: '-20deg' }}
                        />
                    </motion.div>
                </div>

                {/* My Stats Card */}
                <div className="glass-card" style={{
                    padding: '35px',
                    marginBottom: '40px',
                    background: isBoosted ? 'linear-gradient(135deg, #FFFDF0 0%, #FFFFFF 100%)' : 'var(--surface)',
                    border: isBoosted ? '2px solid #FCD34D' : '1px solid var(--glass-border)',
                    boxShadow: isBoosted ? '0 10px 25px rgba(245, 158, 11, 0.15)' : 'var(--shadow)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {isBoosted && (
                        <div style={{
                            position: 'absolute', top: '10px', right: '10px',
                            background: '#F59E0B', color: 'white', padding: '4px 12px', borderRadius: '100px',
                            fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            <Flame size={12} /> 부스트 활성화 중
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                            내 성향 리포트
                        </h3>
                        <div style={{
                            fontSize: '1rem', color: 'var(--primary)', background: 'var(--primary-faint)',
                            padding: '6px 16px', borderRadius: '30px', fontWeight: 800,
                            boxShadow: '0 2px 4px var(--primary-glow)'
                        }}>
                            {mbtiType || '알 수 없음'}
                        </div>
                    </div>
                    {userData ? (
                        <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RadarChart
                                data={[
                                    { subject: '사교성', A: userData.E || 0, fullMark: 100 },
                                    { subject: '창의성', A: Math.round((userData.O || 0) * 0.6 + (userData.E || 0) * 0.4), fullMark: 100 },
                                    { subject: '공감력', A: Math.round((userData.A || 0) * 0.6 + (100 - (userData.N || 0)) * 0.4), fullMark: 100 },
                                    { subject: '계획성', A: userData.C || 0, fullMark: 100 },
                                    { subject: '자기주도', A: Math.round((userData.C || 0) * 0.55 + (userData.H || 50) * 0.45), fullMark: 100 },
                                    { subject: '유연성', A: userData.O || 0, fullMark: 100 },
                                    { subject: '따뜻함', A: userData.A || 0, fullMark: 100 },
                                    { subject: '회복탄력', A: Math.round(100 - (userData.N || 0)), fullMark: 100 },
                                    { subject: '신뢰도', A: userData.H || 50, fullMark: 100 },
                                ]}
                                size={300}
                            />
                        </div>
                    ) : (
                        <ChartSkeleton />
                    )}

                </div>

                {/* 💎 딥 소울 배너 */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate(hasDeepSoul ? 'deep-soul-result' : 'deep-soul-test')}
                    style={{
                        marginBottom: '30px', padding: '20px 24px', borderRadius: '20px',
                        background: hasDeepSoul
                            ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                            : 'linear-gradient(135deg, #1E1B4B, #312E81)',
                        color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        boxShadow: '0 8px 30px rgba(79,70,229,0.35)',
                        position: 'relative', overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{hasDeepSoul ? '💎' : '✨'}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '4px' }}>
                            {hasDeepSoul ? '딥 소울 매칭 활성화됨' : '더 깊은 인연 찾기'}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.5 }}>
                            {hasDeepSoul
                                ? '가족관·연애관·가치관 기반 정밀 매칭 중 💜'
                                : '가족관·연애 스타일·가치관까지 맞는 사람을 찾아드릴게요'}
                        </div>
                    </div>
                    <ChevronRight size={20} style={{ opacity: 0.7, flexShrink: 0 }} />
                </motion.div>

                {/* Recommendation Section with Filters */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>오늘의 추천 인연 ✨</h3>
                    {myDistrict && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <MapPin size={12} color="var(--primary)" /> {myDistrict}
                        </span>
                    )}
                </div>

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
                    {displayedUsers.length > 0 ? displayedUsers.slice(0, 5).map((user, index) => {
                        const userSoul = getSoulType(user.mbti);
                        return (
                            <motion.div
                                key={user.id}
                                whileHover={{ scale: 1.02 }}
                                className="glass-card"
                                style={{
                                    padding: 'clamp(16px, 3vw, 24px)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', background: 'var(--surface)',
                                    border: '1px solid var(--glass-border)',
                                    flexWrap: 'wrap', gap: '12px'
                                }}
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
                                        style={{
                                            width: '60px', height: '60px', borderRadius: '20px',
                                            background: `linear-gradient(135deg, ${userSoul.gradient[0]}, ${userSoul.gradient[1]})`,
                                            border: '1px solid var(--glass-border)', boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.8rem', flexShrink: 0, position: 'relative'
                                        }}>
                                        {userSoul.emoji}
                                        {user.id % 2 === 0 && (
                                            <div style={{
                                                position: 'absolute', bottom: -2, right: -2,
                                                width: '12px', height: '12px', borderRadius: '50%',
                                                background: '#10B981', border: '2px solid white'
                                            }} />
                                        )}
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
                                        {/* 통합 배지 시스템 */}
                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            {user.game && <IdentityBadge type="GAME" label={user.game} size="sm" />}
                                            {user.tier && <IdentityBadge type="TIER" label={user.tier} size="sm" />}
                                            {user.id % 3 === 0 && <IdentityBadge type="VERIFIED" size="sm" />}
                                            {user.similarity > 90 && <IdentityBadge type="HOT" size="sm" />}
                                        </div>
                                        {/* Bio 미리보기 */}
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
                                <button
                                    onClick={() => onSelectUser(user)}
                                    style={{
                                        background: 'white', color: 'var(--text)',
                                        border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '16px',
                                        fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    프로필 보기
                                </button>
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
            </div>

            <div className="right-panel">
                {/* 소울펫 루미 위젯 + 딥소울 요약 */}
                <div style={{ marginBottom: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* SoulPet 수달루미 위젯 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate?.('soul-pet')}
                        style={{ padding: '18px', borderRadius: '18px', background: 'linear-gradient(135deg, #F0ABFC20, #E879F920)', border: '1.5px solid #C026D340', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center' }}
                    >
                        {(() => {
                            const pet = (() => { try { return JSON.parse(localStorage.getItem('lumini_soul_pet') || '{}'); } catch { return {}; } })();
                            return (
                                <>
                                    <div style={{ fontSize: '2rem' }}>🦦</div>
                                    <div style={{ fontWeight: 900, fontSize: '0.88rem', color: '#A21CAF' }}>{pet.name || '루미'} <span style={{ fontSize: '0.72rem', background: '#C026D318', borderRadius: '100px', padding: '1px 7px' }}>Lv.{pet.level || 1}</span></div>
                                    <div style={{ fontSize: '0.72rem', color: '#86198F', fontWeight: 600 }}>소울펫 돌보기 →</div>
                                </>
                            );
                        })()}
                    </motion.div>
                    {/* 딥소울 요약 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate?.(hasDeepSoul ? 'deep-soul-result' : 'deep-soul-test')}
                        style={{ padding: '18px', borderRadius: '18px', background: hasDeepSoul ? 'linear-gradient(135deg, #4F46E510, #7C3AED08)' : 'var(--surface)', border: `1.5px solid ${hasDeepSoul ? '#7C3AED30' : 'var(--glass-border)'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center' }}
                    >
                        <div style={{ fontSize: '2rem' }}>{hasDeepSoul ? '💎' : '✨'}</div>
                        <div style={{ fontWeight: 900, fontSize: '0.88rem', color: hasDeepSoul ? '#6366F1' : 'var(--text)' }}>딥 소울</div>
                        <div style={{ fontSize: '0.72rem', color: hasDeepSoul ? '#8B5CF6' : 'var(--text-muted)', fontWeight: 600 }}>{hasDeepSoul ? '결과 보기 →' : '검사 시작 →'}</div>
                    </motion.div>
                </div>

                {/* 딥 소울 매칭 예시 카드 */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                        <h3 style={{ fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            💸 딥 소울 매칭 예시
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>딥 소울 완료 멤버</span>
                    </div>
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {[
                            { name: '김민수', mbti: 'INTJ', soulScore: 83, cats: [{ label: '💑 연애', score: 88 }, { label: '🌿 라이프', score: 79 }, { label: '🏠 가족관', score: 91 }, { label: '🌍 가치관', score: 75 }], district: '서울 마포구', emoji: '♟️', userId: 'u2' },
                            { name: '박서연', mbti: 'ENTP', soulScore: 71, cats: [{ label: '💑 연애', score: 60 }, { label: '🌿 라이프', score: 73 }, { label: '🏠 가족관', score: 58 }, { label: '🌍 가치관', score: 82 }], district: '서울 강남구', emoji: '🎨', userId: 'u4' },
                            { name: '최도현', mbti: 'INFP', soulScore: 78, cats: [{ label: '💑 연애', score: 82 }, { label: '🌿 라이프', score: 71 }, { label: '🏠 가족관', score: 88 }, { label: '🌍 가치관', score: 70 }], district: '서울 마포구', emoji: '🌙', userId: 'u5' },
                        ].map((u) => {
                            const matchUser = nearbyUsers?.find(nu => nu.id === u.userId) || { id: u.userId, name: u.name, mbti: u.mbti, similarity: u.soulScore };
                            return (
                                <motion.div
                                    key={u.name}
                                    className="glass-card"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => onSelectUser && onSelectUser(matchUser)}
                                    style={{ padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                                {u.emoji}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{u.name}</span>
                                                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-faint)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>{u.mbti}</span>
                                                    <span style={{ fontSize: '0.68rem', background: '#4F46E510', color: '#6366F1', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>💸 딥 완료</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {u.district}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366F1' }}>{u.soulScore}%</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>가치관 호환도</div>
                                        </div>
                                    </div>
                                    {hasDeepSoul && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                            {u.cats.map(c => (
                                                <div key={c.label} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)' }}>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px', wordBreak: 'keep-all' }}>{c.label}</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: c.score >= 80 ? '#6366F1' : c.score >= 65 ? '#10B981' : '#94A3B8' }}>{c.score}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'right' }}>
                                        프로필 보기 →
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default DashboardPage;
