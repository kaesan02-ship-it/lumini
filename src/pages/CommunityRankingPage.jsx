import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Sparkles, Timer } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useUserStore from '../store/userStore';
import useAuthStore from '../store/authStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

const SCORE_GUIDE = [
    { action: '사천성 게임 클리어', points: '타임어택 경쟁', icon: '🐾' },
    { action: '2048 최고 진화 달성', points: '점수 합산 경쟁', icon: '🥚' },
    { action: '사과게임 10 만들기', points: '고득점 누적 경쟁', icon: '🍎' },
];

const CommunityRankingPage = ({ onBack, mbtiType }) => {
    const { earnCrystals } = useCrystalStore();
    const { userName, activeRankingTab } = useUserStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState(activeRankingTab || 'apple'); // apple, shisen, game2048
    const [showGuide, setShowGuide] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [mbtiStats, setMbtiStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myBestStat, setMyBestStat] = useState({ rank: '-', scoreVal: '0' });

    // 각 게임 탭별로 Supabase 실시간 랭킹 쿼리 호출
    const fetchRankings = useCallback(async () => {
        setLoading(true);
        try {
            if (USE_MOCK_DATA) {
                // Mock 데이터 폴백 (각 탭별 알맞은 고득점 리스트 제공)
                let mockList = [];
                if (activeTab === 'apple') {
                    mockList = [
                        { rank: 1, name: '지후', mbti: 'ENFJ', score: 280, badge: '🏆', isMe: false },
                        { rank: 2, name: '서연', mbti: 'INFP', score: 240, badge: '🥈', isMe: false },
                        { rank: 3, name: '민준', mbti: 'ENTP', score: 190, badge: '🥉', isMe: false },
                        { rank: 4, name: userName || '나', mbti: mbtiType || 'ENFP', score: 150, badge: '', isMe: true }
                    ];
                    setMyBestStat({ rank: 4, scoreVal: '150점' });
                } else if (activeTab === 'shisen') {
                    mockList = [
                        { rank: 1, name: '지후', mbti: 'ENFJ', score: 4500, badge: '🏆', isMe: false },
                        { rank: 2, name: '민준', mbti: 'ENTP', score: 3900, badge: '🥈', isMe: false },
                        { rank: 3, name: userName || '나', mbti: mbtiType || 'ENFP', score: 3200, badge: '🥉', isMe: true }
                    ];
                    setMyBestStat({ rank: 3, scoreVal: '3,200점' });
                } else if (activeTab === 'game2048') {
                    mockList = [
                        { rank: 1, name: '서연', mbti: 'INFP', score: 38400, badge: '🏆', isMe: false },
                        { rank: 2, name: userName || '나', mbti: mbtiType || 'ENFP', score: 24800, badge: '🥈', isMe: true },
                        { rank: 3, name: '지후', mbti: 'ENFJ', score: 18900, badge: '🥉', isMe: false }
                    ];
                    setMyBestStat({ rank: 2, scoreVal: '24,800점' });
                }
                setLeaderboard(mockList);
                setLoading(false);
                return;
            }

            if (activeTab === 'apple') {
                // 1. 사과게임 랭킹 로드 (profiles 테이블의 단일 최고점 컬럼 활용)
                const { data: profiles, error } = await supabase
                    .from('profiles')
                    .select('id, username, mbti_type, apple_game_best_score')
                    .gt('apple_game_best_score', 0)
                    .order('apple_game_best_score', { ascending: false })
                    .limit(20);

                if (!error && profiles) {
                    const mapped = profiles.map((p, i) => ({
                        rank: i + 1,
                        name: p.username || '익명',
                        mbti: p.mbti_type || '?',
                        score: p.apple_game_best_score || 0,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: p.id === user?.id
                    }));
                    setLeaderboard(mapped);

                    // 내 정보 추출
                    const myIdx = profiles.findIndex(p => p.id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${profiles[myIdx].apple_game_best_score}점` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    }
                }
            } else if (activeTab === 'shisen') {
                // 2. 사천성 랭킹 로드 (shisen_sho_scores 테이블 - 최종 점수제 랭킹 적용)
                const { data: scores, error } = await supabase
                    .from('shisen_sho_scores')
                    .select('score, user_id, profiles(username, mbti_type)')
                    .order('score', { ascending: false });

                if (!error && scores) {
                    // 유저별 최고 점수 중복 배제 필터링
                    const uniqueUsers = [];
                    const seenUsers = new Set();
                    scores.forEach(item => {
                        const uId = item.user_id;
                        if (!seenUsers.has(uId)) {
                            seenUsers.add(uId);
                            uniqueUsers.push({
                                user_id: uId,
                                name: item.profiles?.username || '익명',
                                mbti: item.profiles?.mbti_type || '?',
                                score: item.score,
                            });
                        }
                    });

                    const top20 = uniqueUsers.slice(0, 20).map((u, i) => ({
                        rank: i + 1,
                        name: u.name,
                        mbti: u.mbti,
                        score: u.score,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: u.user_id === user?.id
                    }));
                    setLeaderboard(top20);

                    // 내 정보 추출
                    const myIdx = uniqueUsers.findIndex(u => u.user_id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${uniqueUsers[myIdx].score.toLocaleString()}점` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    }
                }
            } else if (activeTab === 'game2048') {
                // 3. 2048 랭킹 로드 (game_2048_scores 테이블)
                const { data: scores, error } = await supabase
                    .from('game_2048_scores')
                    .select('score, max_tile, user_id, profiles(username, mbti_type)')
                    .order('score', { ascending: false });

                if (!error && scores) {
                    // 유저별 최고 점수 중복 배제 필터링
                    const uniqueUsers = [];
                    const seenUsers = new Set();
                    scores.forEach(item => {
                        const uId = item.user_id;
                        if (!seenUsers.has(uId)) {
                            seenUsers.add(uId);
                            uniqueUsers.push({
                                user_id: uId,
                                name: item.profiles?.username || '익명',
                                mbti: item.profiles?.mbti_type || '?',
                                score: item.score,
                                max_tile: item.max_tile
                            });
                        }
                    });

                    const top20 = uniqueUsers.slice(0, 20).map((u, i) => ({
                        rank: i + 1,
                        name: u.name,
                        mbti: u.mbti,
                        score: u.score,
                        max_tile: u.max_tile,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: u.user_id === user?.id
                    }));
                    setLeaderboard(top20);

                    // 내 정보 추출
                    const myIdx = uniqueUsers.findIndex(u => u.user_id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${uniqueUsers[myIdx].score}점` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching rankings:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, user]);

    useEffect(() => {
        fetchRankings();
    }, [fetchRankings]);

    // MBTI별 간단 평균점수 산출
    useEffect(() => {
        if (leaderboard.length === 0) return;
        const mbtiGroups = {};
        leaderboard.forEach(p => {
            if (!p.mbti || p.mbti === '?') return;
            if (!mbtiGroups[p.mbti]) mbtiGroups[p.mbti] = { count: 0, total: 0 };
            mbtiGroups[p.mbti].count += 1;
            mbtiGroups[p.mbti].total += p.score;
        });

        const stats = Object.entries(mbtiGroups).map(([type, val]) => ({
            mbti: type,
            avgScore: Math.round(val.total / val.count),
            emoji: type.includes('E') ? '🔥' : '🔭'
        })).sort((a, b) => b.avgScore - a.avgScore); // 모든 게임 점수 기준 내림차순 정렬
        setMbtiStats(stats);
    }, [leaderboard, activeTab]);

    const formatScore = (val) => {
        return `${val.toLocaleString()}점`;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* 상단 랭킹 배너 */}
            <div style={{ padding: '24px 5%', background: 'linear-gradient(135deg, #ff6b8b, #ff4d6e)', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: 'white'
                            }}
                        >
                            ←
                        </button>
                    )}
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>🏆 명예의 전당</h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem' }}>실시간으로 랭킹 경쟁에 참여해 보세요!</p>
                    </div>
                </div>
                
                {/* 내 기록 현황 카드 */}
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '18px', padding: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                    <div style={{ fontSize: '0.78rem', opacity: 0.85, marginBottom: '8px' }}>
                        내 {activeTab === 'apple' ? '사과게임' : activeTab === 'shisen' ? '사천성' : '2048'} 최고 기록
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900 }}>
                                {myBestStat.rank !== '-' ? `#${myBestStat.rank}` : '#-'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800 }}>{myBestStat.scoreVal}</div>
                                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
                                    {myBestStat.rank !== '-' ? '순위권 진입 완료! 🚀' : '게임을 플레이하고 기록을 등록하세요.'}
                                </div>
                            </div>
                        </div>
                        {!claimed ? (
                            <button
                                onClick={() => { earnCrystals(30, '랭킹 보너스'); setClaimed(true); }}
                                style={{ background: 'white', color: '#ff6b8b', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem' }}
                            >
                                +30💎 받기
                            </button>
                        ) : (
                            <div style={{ fontWeight: 800, opacity: 0.9 }}>✓ 수령 완료</div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px 5%' }}>
                {/* 게임 전환 탭 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'apple', label: '🍎 사과게임 랭킹' },
                        { id: 'shisen', label: '🐾 사천성 랭킹' },
                        { id: 'game2048', label: '🥚 2048 랭킹' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setActiveTab(t.id);
                                useUserStore.getState().setActiveRankingTab(t.id);
                            }}
                            style={{
                                padding: '10px 20px', borderRadius: '100px',
                                border: activeTab !== t.id ? '1px solid var(--glass-border)' : 'none',
                                background: activeTab === t.id ? '#ff6b8b' : 'var(--surface)',
                                color: activeTab === t.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem'
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        style={{
                            padding: '10px 18px', borderRadius: '100px', border: '1px solid var(--glass-border)',
                            background: 'var(--surface)', fontWeight: 700, cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 'auto'
                        }}
                    >
                        아케이드 안내
                    </button>
                </div>

                <AnimatePresence>
                    {showGuide && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', marginBottom: '20px', overflow: 'hidden' }}
                        >
                            <div style={{ fontWeight: 800, marginBottom: '12px' }}>🕹️ 루미니 아케이드 안내</div>
                            {SCORE_GUIDE.map(g => (
                                <div key={g.action} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                                    <span>{g.icon} {g.action}</span>
                                    <span style={{ color: '#ff6b8b', fontWeight: 800 }}>{g.points}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>랭킹판을 열심히 닦는 중... 🧹</div>
                    </div>
                ) : (
                    <>
                        {/* 포디움 TOP 3 연출 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px', alignItems: 'end' }}>
                            {leaderboard.length >= 3 ? (
                                [leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
                                    const heights = ['80px', '108px', '68px'];
                                    const colors = ['#CBD5E1', '#ffd700', '#CD7C2F'];
                                    return (
                                        <div key={user.rank} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: i === 1 ? '2rem' : '1.5rem', marginBottom: '6px' }}>{user.badge}</div>
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '2px' }}>
                                                {user.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                                {user.mbti}
                                            </div>
                                            <div
                                                style={{
                                                    background: colors[i], height: heights[i], borderRadius: '12px 12px 0 0',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    color: i === 1 ? '#2d3748' : 'white', fontWeight: 900, fontSize: '0.85rem'
                                                }}
                                            >
                                                {formatScore(user.score)}
                                                {user.max_tile && (
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 500 }}>
                                                        Max: {user.max_tile}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '20px', color: 'var(--text-muted)' }}>
                                    <Trophy size={40} style={{ marginBottom: '10px', opacity: 0.2, margin: '0 auto' }} />
                                    <div style={{ marginTop: '8px' }}>
                                        아직 등록된 랭킹 정보가 적습니다.<br />
                                        게임을 플레이하고 첫 기록을 등록하세요! 🌟
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4위 이하 목록 */}
                        {leaderboard.length > 3 && (
                            <div style={{ background: 'var(--surface)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)', marginBottom: '28px' }}>
                                {leaderboard.slice(3).map((user, i) => (
                                    <div
                                        key={user.rank}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px',
                                            borderBottom: i < leaderboard.slice(3).length - 1 ? '1px solid var(--glass-border)' : 'none',
                                            background: user.isMe ? '#ffeef1' : 'transparent'
                                        }}
                                    >
                                        <div style={{ width: '28px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)' }}>
                                            #{user.rank}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800 }}>
                                                {user.name} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user.mbti}</span>
                                                {user.isMe && <span style={{ fontSize: '0.72rem', color: '#ff6b8b', marginLeft: '4px' }}>(나)</span>}
                                            </div>
                                            {user.max_tile && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    최대 합치기 블록: {user.max_tile}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontWeight: 800, color: '#ff6b8b' }}>
                                            {formatScore(user.score)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 성향 MBTI별 통계 */}
                        <h3 style={{ fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={20} color="#ff6b8b" /> 성향별 평균 {activeTab === 'shisen' ? '기록' : '점수'} 순위
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {mbtiStats.length > 0 ? (
                                mbtiStats.map(m => (
                                    <div
                                        key={m.mbti}
                                        style={{
                                            background: m.mbti === (mbtiType || '') ? '#ffeef1' : 'var(--surface)',
                                            border: m.mbti === (mbtiType || '') ? '2px solid #ff6b8b' : '1px solid var(--glass-border)',
                                            borderRadius: '14px', padding: '14px', textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{m.emoji}</div>
                                        <div style={{ fontWeight: 900, color: '#ff6b8b' }}>{m.mbti}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                                            {activeTab === 'shisen' ? `평균 ${formatScore(m.avgScore)}` : `평균 ${m.avgScore.toLocaleString()}점`}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    통계 산출에 필요한 충분한 데이터가 없습니다.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommunityRankingPage;
