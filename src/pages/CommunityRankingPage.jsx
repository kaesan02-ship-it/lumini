import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Sparkles } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';
import { useEffect } from 'react';

const LEADERBOARD_DATA = {
    weekly: [
        { rank: 1, name: '지후', mbti: 'ENFJ', score: 2840, badge: '🏆', streak: 21 },
        { rank: 2, name: '서연', mbti: 'INFP', score: 2610, badge: '🥈', streak: 14 },
        { rank: 3, name: '민준', mbti: 'ENTP', score: 2480, badge: '🥉', streak: 9 },
        { rank: 4, name: '하은', mbti: 'ISFJ', score: 2210, badge: '', streak: 7 },
        { rank: 5, name: '수빈', mbti: 'INTJ', score: 1980, badge: '', streak: 5 },
        { rank: 6, name: '준혁', mbti: 'ESFP', score: 1750, badge: '', streak: 3 },
        { rank: 7, name: '지영', mbti: 'INFJ', score: 1640, badge: '', streak: 3 },
    ],
    monthly: [
        { rank: 1, name: '서연', mbti: 'INFP', score: 12400, badge: '🏆', streak: 28 },
        { rank: 2, name: '지후', mbti: 'ENFJ', score: 11200, badge: '🥈', streak: 21 },
        { rank: 3, name: '준혁', mbti: 'ESFP', score: 10800, badge: '🥉', streak: 18 },
        { rank: 4, name: '민준', mbti: 'ENTP', score: 9600, badge: '', streak: 15 },
        { rank: 5, name: '하은', mbti: 'ISFJ', score: 8900, badge: '', streak: 12 },
    ],
};

const SCORE_GUIDE = [
    { action: '출석 체크', points: 10, icon: '📅' },
    { action: '챌린지 완료', points: 30, icon: '🎯' },
    { action: '피드 글 작성', points: 20, icon: '✏️' },
    { action: '댓글 남기기', points: 5, icon: '💬' },
    { action: '매칭 대화 10분+', points: 25, icon: '💌' },
    { action: '매거진 아티클 읽기', points: 8, icon: '📖' },
];

const MBTI_LEADERBOARD = [
    { mbti: 'ENFJ', avgScore: 2100, emoji: '🌟' },
    { mbti: 'INFP', avgScore: 1950, emoji: '💜' },
    { mbti: 'ENTP', avgScore: 1880, emoji: '⚡' },
    { mbti: 'ESFP', avgScore: 1820, emoji: '🔥' },
    { mbti: 'INTJ', avgScore: 1750, emoji: '🔭' },
    { mbti: 'ISFJ', avgScore: 1680, emoji: '🛡️' },
];

const CommunityRankingPage = ({ onBack, mbtiType }) => {
    const { earnCrystals } = useCrystalStore();
    const [activeTab, setActiveTab] = useState('weekly');
    const [showGuide, setShowGuide] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [mbtiStats, setMbtiStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            try {
                if (!USE_MOCK_DATA) {
                    const { data: profiles, error } = await supabase
                        .from('profiles')
                        .select('username, mbti_type, apple_game_best_score')
                        .order('apple_game_best_score', { ascending: false })
                        .limit(20);

                    if (!error && profiles) {
                        const mapped = profiles.map((p, i) => ({
                            rank: i + 1,
                            name: p.username || '익명',
                            mbti: p.mbti_type || '?',
                            score: p.apple_game_best_score || 0,
                            badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                            streak: 1 // Default
                        }));
                        setLeaderboard(mapped);

                        // MBTI별 간단 통계 계산
                        const mbtiGroups = {};
                        profiles.forEach(p => {
                            if (!p.mbti_type) return;
                            if (!mbtiGroups[p.mbti_type]) mbtiGroups[p.mbti_type] = { count: 0, total: 0 };
                            mbtiGroups[p.mbti_type].count += 1;
                            mbtiGroups[p.mbti_type].total += (p.apple_game_best_score || 0);
                        });
                        const stats = Object.entries(mbtiGroups).map(([type, val]) => ({
                            mbti: type,
                            avgScore: Math.round(val.total / val.count),
                            emoji: '✨'
                        })).sort((a, b) => b.avgScore - a.avgScore);
                        setMbtiStats(stats);
                    }
                } else {
                    // Fallback to mock for local testing
                    setLeaderboard(LEADERBOARD_DATA.weekly);
                    setMbtiStats(MBTI_LEADERBOARD);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [activeTab]);

    const myRank = { rank: '-', score: 0, streak: 1 };
    const data = leaderboard;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            <div style={{ padding: '24px 5%', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    {onBack && <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>←</button>}
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>🏆 소울 랭킹</h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem' }}>활동할수록 크리스탈 보상이 커져요!</p>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '18px', padding: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                    <div style={{ fontSize: '0.78rem', opacity: 0.85, marginBottom: '8px' }}>나의 이번 주 순위</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900 }}>#{myRank.rank}</div>
                            <div>
                                <div style={{ fontWeight: 800 }}>{myRank.score.toLocaleString()}점</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>🔥 {myRank.streak}일 연속</div>
                            </div>
                        </div>
                        {!claimed ? (
                            <button onClick={() => { earnCrystals(30, '랭킹 보너스'); setClaimed(true); }}
                                style={{ background: 'white', color: '#F59E0B', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem' }}>
                                +30💎 받기
                            </button>
                        ) : (
                            <div style={{ fontWeight: 800, opacity: 0.9 }}>✓ 수령 완료</div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px 5%' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {[{ id: 'weekly', label: '주간' }, { id: 'monthly', label: '월간' }].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                            padding: '10px 24px', borderRadius: '100px', border: activeTab !== t.id ? '1px solid var(--glass-border)' : 'none',
                            background: activeTab === t.id ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === t.id ? 'white' : 'var(--text-muted)', fontWeight: 800, cursor: 'pointer',
                        }}>{t.label}</button>
                    ))}
                    <button onClick={() => setShowGuide(!showGuide)} style={{ padding: '10px 18px', borderRadius: '100px', border: '1px solid var(--glass-border)', background: 'var(--surface)', fontWeight: 700, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 'auto' }}>
                        점수 기준 보기
                    </button>
                </div>

                <AnimatePresence>
                    {showGuide && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', marginBottom: '20px', overflow: 'hidden' }}>
                            <div style={{ fontWeight: 800, marginBottom: '12px' }}>📊 활동 점수 기준</div>
                            {SCORE_GUIDE.map(g => (
                                <div key={g.action} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                                    <span>{g.icon} {g.action}</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>+{g.points}점</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Podium top 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px', alignItems: 'end' }}>
                    {data.length >= 3 ? (
                        [data[1], data[0], data[2]].map((user, i) => {
                            const heights = ['80px', '108px', '68px'];
                            const colors = ['#CBD5E1', '#F59E0B', '#CD7C2F'];
                            return (
                                <div key={user.rank} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: i === 1 ? '2rem' : '1.5rem', marginBottom: '6px' }}>{user.badge}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '2px' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{user.mbti}</div>
                                    <div style={{ background: colors[i], height: heights[i], borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.9rem' }}>
                                        {user.score.toLocaleString()}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '20px', color: 'var(--text-muted)' }}>
                            <Trophy size={40} style={{ marginBottom: '10px', opacity: 0.2 }} />
                            <div>아직 랭킹 집계에 필요한 충분한<br />데이터가 모이지 않았습니다. 🌟</div>
                        </div>
                    )}
                </div>

                {/* 4위 이하 목록 */}
                {data.length > 3 && (
                    <div style={{ background: 'var(--surface)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)', marginBottom: '28px' }}>
                        {data.slice(3).map((user, i) => (
                            <div key={user.rank} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < data.slice(3).length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                <div style={{ width: '28px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)' }}>#{user.rank}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800 }}>{user.name} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user.mbti}</span></div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔥 {user.streak}일 연속</div>
                                </div>
                                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{user.score.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MBTI 타입별 */}
                <h3 style={{ fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} color="var(--primary)" /> 성향별 평균 활동 순위
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {mbtiStats.length > 0 ? (
                        mbtiStats.map(m => (
                            <div key={m.mbti} style={{
                                background: m.mbti === (mbtiType || '') ? 'linear-gradient(135deg, var(--primary-faint), #F3E8FF)' : 'var(--surface)',
                                border: m.mbti === (mbtiType || '') ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                borderRadius: '14px', padding: '14px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{m.emoji}</div>
                                <div style={{ fontWeight: 900, color: 'var(--primary)' }}>{m.mbti}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>평균 {m.avgScore.toLocaleString()}점</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            충분한 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityRankingPage;
