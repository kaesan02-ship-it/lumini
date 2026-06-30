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
    { action: '수박게임 120초 합성', points: '타임어택 합성 경쟁', icon: '🍉' },
    { action: '티카투카 주사위 대전', points: '연승 콤보 경쟁', icon: '🎲' },
];

const FRUIT_EMOJIS = {
    1: '🍒 체리', 2: '🍓 딸기', 3: '🍇 포도', 4: '🍊 귤', 5: '🍎 사과',
    6: '🍐 배', 7: '🍑 복숭아', 8: '🍍 파인애플', 9: '🍈 멜론', 10: '🍉 수박'
};

const CommunityRankingPage = ({ onBack, mbtiType }) => {
    const { earnCrystals } = useCrystalStore();
    const { userName, activeRankingTab } = useUserStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState(activeRankingTab || 'apple'); // apple, shisen, game2048, watermelon, tikatuka
    const [activeSeason, setActiveSeason] = useState('season_2'); // 'season_2' (현재), 'season_1' (명예의 전당)
    const [showGuide, setShowGuide] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [mbtiStats, setMbtiStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myBestStat, setMyBestStat] = useState({ rank: '-', scoreVal: '0' });

    // 각 게임 탭별로 Supabase 실시간 랭킹 쿼리 호출
    const fetchRankings = useCallback(async (targetSeason = activeSeason) => {
        setLoading(true);
        try {
            if (USE_MOCK_DATA) {
                // Mock 데이터 폴백 (시즌 1과 시즌 2의 점수판을 각각 다르게 렌더링)
                let mockList = [];
                if (activeTab === 'apple') {
                    if (targetSeason === 'season_1') {
                        mockList = [
                            { rank: 1, name: '🍎 명예의 사과꾼', mbti: 'ENTJ', score: 1500, badge: '🏆', isMe: false },
                            { rank: 2, name: '사과 헌터', mbti: 'INFP', score: 1200, badge: '🥈', isMe: false },
                            { rank: 3, name: '뉴턴의 후예', mbti: 'ENFJ', score: 950, badge: '🥉', isMe: false }
                        ];
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    } else {
                        mockList = [
                            { rank: 1, name: '지후', mbti: 'ENFJ', score: 280, badge: '🏆', isMe: false },
                            { rank: 2, name: '서연', mbti: 'INFP', score: 240, badge: '🥈', isMe: false },
                            { rank: 3, name: '민준', mbti: 'ENTP', score: 190, badge: '🥉', isMe: false },
                            { rank: 4, name: userName || '나', mbti: mbtiType || 'ENFP', score: 150, badge: '', isMe: true }
                        ];
                        setMyBestStat({ rank: 4, scoreVal: '150점' });
                    }
                } else if (activeTab === 'shisen') {
                    if (targetSeason === 'season_1') {
                        mockList = [
                            { rank: 1, name: '👑 사천성달인', mbti: 'ESFP', score: 4500, badge: '🏆', isMe: false },
                            { rank: 2, name: '동물수호자', mbti: 'INTJ', score: 3900, badge: '🥈', isMe: false }
                        ];
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    } else {
                        mockList = [
                            { rank: 1, name: '지후', mbti: 'ENFJ', score: 620, badge: '🏆', isMe: false },
                            { rank: 2, name: '민준', mbti: 'ENTP', score: 580, badge: '🥈', isMe: false },
                            { rank: 3, name: userName || '나', mbti: mbtiType || 'ENFP', score: 540, badge: '🥉', isMe: true }
                        ];
                        setMyBestStat({ rank: 3, scoreVal: '540점' });
                    }
                } else if (activeTab === 'game2048') {
                    if (targetSeason === 'season_1') {
                        mockList = [
                            { rank: 1, name: '👑 명예의 판다', mbti: 'INFP', score: 38400, badge: '🏆', isMe: false },
                            { rank: 2, name: '2048정복자', mbti: 'ENTJ', score: 24800, badge: '🥈', isMe: false }
                        ];
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    } else {
                        mockList = [
                            { rank: 1, name: '서연', mbti: 'INFP', score: 4820, badge: '🏆', isMe: false },
                            { rank: 2, name: userName || '나', mbti: mbtiType || 'ENFP', score: 3840, badge: '🥈', isMe: true },
                            { rank: 3, name: '지후', mbti: 'ENFJ', score: 2900, badge: '🥉', isMe: false }
                        ];
                        setMyBestStat({ rank: 2, scoreVal: '3,840점' });
                    }
                } else if (activeTab === 'watermelon') {
                    if (targetSeason === 'season_1') {
                        mockList = [
                            { rank: 1, name: '👑 수박왕', mbti: 'ESTJ', score: 4500, badge: '🏆', isMe: false },
                            { rank: 2, name: '멜론재배사', mbti: 'INFJ', score: 3820, badge: '🥈', isMe: false }
                        ];
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    } else {
                        mockList = [
                            { rank: 1, name: '지후', mbti: 'ENFJ', score: 2850, badge: '🏆', isMe: false },
                            { rank: 2, name: '서연', mbti: 'INFP', score: 2420, badge: '🥈', isMe: false },
                            { rank: 3, name: userName || '나', mbti: mbtiType || 'ENFP', score: 1150, badge: '🥉', isMe: true }
                        ];
                        setMyBestStat({ rank: 3, scoreVal: '1,150점' });
                    }
                } else if (activeTab === 'tikatuka') {
                    if (targetSeason === 'season_1') {
                        mockList = [
                            { rank: 1, name: '👑 명예의 루미', mbti: 'ENTJ', score: 15, badge: '🏆', isMe: false },
                            { rank: 2, name: '주사위 마스터', mbti: 'INTP', score: 12, badge: '🥈', isMe: false }
                        ];
                        setMyBestStat({ rank: '-', scoreVal: '0연승' });
                    } else {
                        mockList = [
                            { rank: 1, name: '지후', mbti: 'ENFJ', score: 8, badge: '🏆', isMe: false },
                            { rank: 2, name: '서연', mbti: 'INFP', score: 5, badge: '🥈', isMe: false },
                            { rank: 3, name: userName || '나', mbti: mbtiType || 'ENFP', score: 3, badge: '🥉', isMe: true }
                        ];
                        setMyBestStat({ rank: 3, scoreVal: '3연승' });
                    }
                }
                setLeaderboard(mockList);
                setLoading(false);
                return;
            }

            if (activeTab === 'apple') {
                // 1. 사과게임 랭킹 로드 (apple_game_scores 테이블에서 중복 허용으로 로드)
                const { data: scores, error } = await supabase
                    .from('apple_game_scores')
                    .select('score, user_id, profiles(username, mbti_type)')
                    .eq('season', targetSeason)
                    .order('score', { ascending: false })
                    .limit(20);

                if (!error && scores) {
                    const mapped = scores.map((s, i) => ({
                        rank: i + 1,
                        name: s.profiles?.username || '익명',
                        mbti: s.profiles?.mbti_type || '?',
                        score: s.score || 0,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: s.user_id === user?.id
                    }));
                    setLeaderboard(mapped);

                    // 내 정보 추출
                    const myIdx = scores.findIndex(s => s.user_id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${scores[myIdx].score}점` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    }
                }
            } else if (activeTab === 'shisen') {
                // 2. 사천성 랭킹 로드 (shisen_sho_scores 테이블 - 중복 허용)
                const { data: scores, error } = await supabase
                    .from('shisen_sho_scores')
                    .select('score, user_id, profiles(username, mbti_type)')
                    .eq('season', targetSeason)
                    .order('score', { ascending: false })
                    .limit(20);

                if (!error && scores) {
                    const top20 = scores.map((s, i) => ({
                        rank: i + 1,
                        name: s.profiles?.username || '익명',
                        mbti: s.profiles?.mbti_type || '?',
                        score: s.score,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: s.user_id === user?.id
                    }));
                    setLeaderboard(top20);

                    // 내 정보 추출
                    const myIdx = scores.findIndex(s => s.user_id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${scores[myIdx].score.toLocaleString()}점` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    }
                }
            } else if (activeTab === 'game2048') {
                // 3. 2048 랭킹 로드 (game_2048_scores 테이블 - 중복 허용)
                const { data: scores, error } = await supabase
                    .from('game_2048_scores')
                    .select('score, max_tile, user_id, profiles(username, mbti_type)')
                    .eq('season', targetSeason)
                    .order('score', { ascending: false })
                    .limit(20);

                if (!error && scores) {
                    const top20 = scores.map((s, i) => ({
                        rank: i + 1,
                        name: s.profiles?.username || '익명',
                        mbti: s.profiles?.mbti_type || '?',
                        score: s.score,
                        max_tile: s.max_tile,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: s.user_id === user?.id
                    }));
                    setLeaderboard(top20);

                    // 내 정보 추출
                    const myIdx = scores.findIndex(s => s.user_id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${scores[myIdx].score}점` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    }
                }
            } else if (activeTab === 'watermelon') {
                // 4. 수박게임 랭킹 로드 (watermelon_game_scores 테이블 - 중복 허용)
                const { data: scores, error } = await supabase
                    .from('watermelon_game_scores')
                    .select('score, max_fruit_level, user_id, profiles(username, mbti_type)')
                    .eq('season', targetSeason)
                    .order('score', { ascending: false })
                    .limit(20);

                if (!error && scores) {
                    const top20 = scores.map((s, i) => ({
                        rank: i + 1,
                        name: s.profiles?.username || '익명',
                        mbti: s.profiles?.mbti_type || '?',
                        score: s.score,
                        max_fruit_level: s.max_fruit_level,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: s.user_id === user?.id
                    }));
                    setLeaderboard(top20);

                    // 내 정보 추출
                    const myIdx = scores.findIndex(s => s.user_id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${scores[myIdx].score.toLocaleString()}점` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0점' });
                    }
                }
            } else if (activeTab === 'tikatuka') {
                // 5. 티카투카 랭킹 로드 (tikatuka_game_scores 테이블)
                const { data: scores, error } = await supabase
                    .from('tikatuka_game_scores')
                    .select('max_win_streak, user_id, profiles(username, mbti_type)')
                    .eq('season', targetSeason)
                    .order('max_win_streak', { ascending: false })
                    .limit(20);

                if (!error && scores) {
                    const top20 = scores.map((s, i) => ({
                        rank: i + 1,
                        name: s.profiles?.username || '익명',
                        mbti: s.profiles?.mbti_type || '?',
                        score: s.max_win_streak || 0,
                        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                        isMe: s.user_id === user?.id
                    }));
                    setLeaderboard(top20);

                    // 내 정보 추출
                    const myIdx = scores.findIndex(s => s.user_id === user?.id);
                    if (myIdx !== -1) {
                        setMyBestStat({ rank: myIdx + 1, scoreVal: `${scores[myIdx].max_win_streak}연승` });
                    } else {
                        setMyBestStat({ rank: '-', scoreVal: '0연승' });
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching rankings:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, activeSeason, user]);

    useEffect(() => {
        fetchRankings(activeSeason);
    }, [fetchRankings, activeSeason]);

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
        if (activeTab === 'tikatuka') {
            return `${val}연승`;
        }
        return `${val.toLocaleString()}점`;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* 상단 랭킹 배너 */}
            <div style={{ padding: '24px 5%', background: 'linear-gradient(135deg, #ff6b8b, #ff4d6e)', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    
                    {/* 시즌 필터링용 세그먼트 버튼 */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <button 
                            onClick={() => setActiveSeason('season_2')}
                            style={{
                                padding: '6px 16px', fontSize: '0.8rem', borderRadius: '100px', fontWeight: 900,
                                background: activeSeason === 'season_2' ? 'white' : 'transparent',
                                color: activeSeason === 'season_2' ? '#ff4d6e' : 'white',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            시즌 2
                        </button>
                        <button 
                            onClick={() => setActiveSeason('season_1')}
                            style={{
                                padding: '6px 16px', fontSize: '0.8rem', borderRadius: '100px', fontWeight: 900,
                                background: activeSeason === 'season_1' ? 'white' : 'transparent',
                                color: activeSeason === 'season_1' ? '#ff4d6e' : 'white',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            명예의 전당 (시즌 1)
                        </button>
                    </div>
                </div>
                
                {/* 내 기록 현황 카드 */}
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '18px', padding: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                    <div style={{ fontSize: '0.78rem', opacity: 0.85, marginBottom: '8px' }}>
                        내 {activeTab === 'apple' ? '사과게임' : activeTab === 'shisen' ? '사천성' : activeTab === 'game2048' ? '2048' : activeTab === 'watermelon' ? '수박게임' : activeTab === 'tikatuka' ? '티카투카' : ''} 최고 기록
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
                        { id: 'game2048', label: '🥚 2048 랭킹' },
                        { id: 'watermelon', label: '🍉 수박게임 랭킹' },
                        { id: 'tikatuka', label: '🎲 티카투카 랭킹' }
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
                                            {user.max_fruit_level && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    최대 수확 단계: {FRUIT_EMOJIS[user.max_fruit_level] || '🍉'}
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
