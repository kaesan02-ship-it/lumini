import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Star, Flame, Target, MessageCircle,
    Heart, Zap, Award, ChevronRight, CheckCircle, ArrowLeft, Gem
} from 'lucide-react';
import useCrystalStore from '../store/crystalStore';

// ─── 레벨 시스템 ────────────────────────────────────────────
const LEVELS = [
    { level: 1, name: '씨앗 소울', emoji: '🌱', minXp: 0, color: '#10B981' },
    { level: 2, name: '새싹 소울', emoji: '🌿', minXp: 100, color: '#22C55E' },
    { level: 3, name: '꽃봉오리 소울', emoji: '🌸', minXp: 250, color: '#EC4899' },
    { level: 4, name: '빛나는 소울', emoji: '✨', minXp: 500, color: '#F59E0B' },
    { level: 5, name: '달빛 소울', emoji: '🌙', minXp: 900, color: '#8B5CF6' },
    { level: 6, name: '별빛 소울', emoji: '⭐', minXp: 1400, color: '#6366F1' },
    { level: 7, name: '오로라 소울', emoji: '🌌', minXp: 2000, color: '#06B6D4' },
    { level: 8, name: '우주 소울', emoji: '🚀', minXp: 3000, color: '#9333EA' },
];

const getCurrentLevel = (totalXp) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalXp >= LEVELS[i].minXp) return LEVELS[i];
    }
    return LEVELS[0];
};

const getNextLevel = (totalXp) => {
    for (let i = 0; i < LEVELS.length; i++) {
        if (totalXp < LEVELS[i].minXp) return LEVELS[i];
    }
    return null;
};

// ─── 주간 활동 집계 ──────────────────────────────────────────
const getWeeklyStats = () => {
    const missionData = JSON.parse(localStorage.getItem('lumini_social_missions') || '{}');
    const emotionLog = JSON.parse(localStorage.getItem('lumini_emotion_log') || '[]');
    const journalLogs = JSON.parse(localStorage.getItem('lumini_journal_logs') || '[]');
    const challengesDone = JSON.parse(localStorage.getItem('lumini_challenges_done') || 'null');
    const streak = parseInt(localStorage.getItem('lumini_streak') || '0');

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEmotions = emotionLog.filter(e => new Date(e.date) >= oneWeekAgo);
    const weeklyJournals = journalLogs.filter(j => new Date(j.date) >= oneWeekAgo);

    const totalMissionsDone = Object.values(missionData).reduce((acc, arr) => acc + arr.length, 0);

    return {
        streak,
        emotionCheckins: weeklyEmotions.length,
        journalEntries: weeklyJournals.length,
        missionsDone: totalMissionsDone,
        challengesDone: challengesDone?.ids?.length || 0,
        avgEmotionScore: weeklyEmotions.length
            ? (weeklyEmotions.reduce((s, e) => s + (e.emotion?.val || 3), 0) / weeklyEmotions.length).toFixed(1)
            : null,
    };
};

// ─── XP 계산 ────────────────────────────────────────────────
const calcTotalXp = (stats) => {
    return (
        stats.streak * 20 +
        stats.emotionCheckins * 15 +
        stats.journalEntries * 25 +
        stats.missionsDone * 18 +
        stats.challengesDone * 22
    );
};

// ─── 주간 뱃지 ──────────────────────────────────────────────
const getWeeklyBadges = (stats) => {
    const badges = [];
    if (stats.streak >= 3) badges.push({ emoji: '🔥', label: `${stats.streak}일 연속 출석`, color: '#EF4444' });
    if (stats.emotionCheckins >= 3) badges.push({ emoji: '😊', label: '감정 체크인 달성', color: '#F59E0B' });
    if (stats.journalEntries >= 2) badges.push({ emoji: '📝', label: '관계 일지 작성가', color: '#8B5CF6' });
    if (stats.missionsDone >= 3) badges.push({ emoji: '🎯', label: '소셜 미션 챔피언', color: '#10B981' });
    if (stats.challengesDone >= 2) badges.push({ emoji: '⚡', label: '챌린지 클리어', color: '#3B82F6' });
    return badges;
};

// ─── 성장 조언 ──────────────────────────────────────────────
const getGrowthAdvice = (stats) => {
    if (stats.streak >= 5) return { msg: '대단해요! 5일 이상 꾸준히 활동하셨어요. 이 페이스면 곧 별빛 소울로 올라갈 수 있어요! 🌟', tone: 'great' };
    if (stats.emotionCheckins === 0) return { msg: '이번 주는 감정 체크인이 없었어요. 하루 1분의 감정 기록이 내면 성장의 시작이에요. 내일 한 번 해보실까요? 😊', tone: 'nudge' };
    if (stats.missionsDone === 0) return { msg: '소셜 미션 0개! 이번 주는 소울 그룹에 댓글 하나만 달아보세요. 작은 한 걸음이 관계를 바꿔요. 💬', tone: 'nudge' };
    return { msg: '꾸준히 활동하고 계시는군요! 이번 한 주도 수고하셨어요. 조금씩 채워가는 여정이 빛이 됩니다. ✨', tone: 'good' };
};

// ─── 메인 컴포넌트 ──────────────────────────────────────────
const WeeklyReportPage = ({ onBack, onNavigate }) => {
    const { totalEarned } = useCrystalStore();
    const stats = useMemo(() => getWeeklyStats(), []);
    const totalXp = useMemo(() => calcTotalXp(stats) + totalEarned, [stats, totalEarned]);
    const currentLevel = getCurrentLevel(totalXp);
    const nextLevel = getNextLevel(totalXp);
    const badges = getWeeklyBadges(stats);
    const advice = getGrowthAdvice(stats);
    const xpProgress = nextLevel
        ? ((totalXp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100
        : 100;

    const activityItems = [
        { icon: '🔥', label: '연속 출석', value: `${stats.streak}일`, xp: stats.streak * 20, color: '#EF4444' },
        { icon: '😊', label: '감정 체크인', value: `${stats.emotionCheckins}회`, xp: stats.emotionCheckins * 15, color: '#F59E0B' },
        { icon: '📝', label: '관계 일지', value: `${stats.journalEntries}회`, xp: stats.journalEntries * 25, color: '#8B5CF6' },
        { icon: '🎯', label: '소셜 미션', value: `${stats.missionsDone}개`, xp: stats.missionsDone * 18, color: '#10B981' },
        { icon: '⚡', label: '챌린지 완료', value: `${stats.challengesDone}개`, xp: stats.challengesDone * 22, color: '#3B82F6' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{
                padding: '22px 5% 20px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    {onBack && (
                        <button onClick={onBack} style={{
                            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0
                        }}>
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>📊 주간 성장 리포트</h1>
                        <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '0.82rem' }}>나의 한 주 활동을 돌아봐요</p>
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px 5%', display: 'grid', gap: '16px' }}>

                {/* 레벨 카드 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: `linear-gradient(135deg, ${currentLevel.color}18, ${currentLevel.color}08)`,
                        borderRadius: '24px', padding: '28px',
                        border: `1px solid ${currentLevel.color}30`
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                        <div style={{ fontSize: '3.5rem' }}>{currentLevel.emoji}</div>
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: currentLevel.color, marginBottom: '2px' }}>
                                Lv.{currentLevel.level}
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text)' }}>
                                {currentLevel.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                총 누적 XP <strong style={{ color: currentLevel.color }}>{totalXp.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>

                    {nextLevel && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px', fontSize: '0.8rem', fontWeight: 700 }}>
                                <span style={{ color: 'var(--text-muted)' }}>다음: {nextLevel.emoji} {nextLevel.name}</span>
                                <span style={{ color: currentLevel.color }}>{Math.round(xpProgress)}%</span>
                            </div>
                            <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    transition={{ duration: 1.4, ease: 'easeOut' }}
                                    style={{
                                        height: '100%', borderRadius: '100px',
                                        background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                                {nextLevel.minXp - totalXp > 0 ? `${nextLevel.minXp - totalXp} XP 남음` : '레벨업 완료!'}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* 이번 주 감정 평균 */}
                {stats.avgEmotionScore && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        style={{
                            background: 'var(--surface)', borderRadius: '20px', padding: '20px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 800, marginBottom: '4px' }}>이번 주 평균 감정</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>7일 체크인 감정 평균값</div>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F59E0B' }}>
                            {stats.avgEmotionScore} <span style={{ fontSize: '1rem' }}>/ 5</span>
                        </div>
                    </motion.div>
                )}

                {/* 활동 XP 내역 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ background: 'var(--surface)', borderRadius: '22px', padding: '22px', border: '1px solid var(--glass-border)' }}
                >
                    <div style={{ fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} color="#F59E0B" /> 이번 주 XP 획득 내역
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {activityItems.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.value}</span>
                                            <span style={{ fontWeight: 800, fontSize: '0.82rem', color: item.color }}>+{item.xp} XP</span>
                                        </div>
                                    </div>
                                    <div style={{ height: '5px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: item.xp > 0 ? `${Math.min((item.xp / 100) * 100, 100)}%` : '2%' }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            style={{ height: '100%', background: item.color, borderRadius: '100px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 이번 주 뱃지 */}
                {badges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        style={{ background: 'var(--surface)', borderRadius: '22px', padding: '22px', border: '1px solid var(--glass-border)' }}
                    >
                        <div style={{ fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={18} color="#9333EA" /> 이번 주 획득 뱃지
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {badges.map((b, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 + i * 0.08, type: 'spring' }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '8px 14px', borderRadius: '100px',
                                        background: `${b.color}15`, border: `1px solid ${b.color}40`,
                                        fontSize: '0.82rem', fontWeight: 700, color: b.color
                                    }}
                                >
                                    {b.emoji} {b.label}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* AI 성장 조언 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: advice.tone === 'great'
                            ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)'
                            : advice.tone === 'nudge'
                                ? 'linear-gradient(135deg, #FFF7ED, #FED7AA)'
                                : 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
                        borderRadius: '22px', padding: '24px',
                        border: advice.tone === 'great' ? '1px solid #86EFAC' : advice.tone === 'nudge' ? '1px solid #FCA5A5' : '1px solid #C4B5FD'
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                        {advice.tone === 'great' ? '🌟' : advice.tone === 'nudge' ? '💡' : '✨'}
                    </div>
                    <div style={{ fontWeight: 800, marginBottom: '8px', fontSize: '0.95rem' }}>AI 성장 코치 한마디</div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#374151', margin: 0 }}>{advice.msg}</p>
                </motion.div>

                {/* 다음 주 추천 활동 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{ background: 'var(--surface)', borderRadius: '22px', padding: '22px', border: '1px solid var(--glass-border)' }}
                >
                    <div style={{ fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={18} color="#6366F1" /> 다음 주 추천 활동
                    </div>
                    {[
                        { emoji: '😊', title: '감정 체크인 5일 달성', desc: '+75 XP 예상', action: 'growth', color: '#F59E0B' },
                        { emoji: '🎯', title: '소셜 미션 3개 완료', desc: '+54 XP 예상', action: 'growth', color: '#10B981' },
                        { emoji: '🏆', title: '소울 랭킹 도전하기', desc: '+30 XP 예상', action: 'ranking', color: '#EF4444' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            onClick={() => onNavigate && onNavigate(item.action)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px', borderRadius: '14px',
                                background: 'var(--background)', marginBottom: '8px',
                                cursor: 'pointer', border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem' }}>{item.emoji}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.title}</div>
                                <div style={{ fontSize: '0.78rem', color: item.color, fontWeight: 700 }}>{item.desc}</div>
                            </div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default WeeklyReportPage;
