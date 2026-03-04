import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, MessageSquare, RefreshCw, ChevronRight, Brain, Zap, Star, AlertTriangle, Gem, Lock } from 'lucide-react';
import { getAIAdvice, getConversationTopics } from '../lib/openaiClient';
import useAuthStore from '../store/authStore';
import useCrystalStore from '../store/crystalStore';

const AIInsightsPage = ({ userData, mbtiType, onNavigate }) => {
    const { user } = useAuthStore();
    const { crystals, spendCrystals, isPremium } = useCrystalStore();
    const [advice, setAdvice] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [premiumUnlocked, setPremiumUnlocked] = useState(false);

    const fetchInsights = async () => {
        if (!mbtiType || !userData) return;

        try {
            setLoading(true);
            const [adviceData, topicsData] = await Promise.all([
                getAIAdvice(mbtiType, userData),
                getConversationTopics(mbtiType, user?.user_metadata?.tags || ['음악', '여행'])
            ]);
            setAdvice(adviceData);
            setTopics(topicsData);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch AI insights:', err);
            // 에러 시에도 폴백 데이터 제공
            setAdvice({
                analysis: "인사이트를 불러오는 중 문제가 발생했습니다. 새 조언 받기 버튼을 눌러보세요.",
                strengths: ["공감 능력", "적응력", "창의적 사고"],
                cautions: ["과도한 걱정", "완벽주의 경향"]
            });
            setTopics(["오늘 기분이 어떠세요?", "최근 재미있었던 일은?", "좋아하는 음악 장르는?"]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!advice && mbtiType && userData) {
            fetchInsights();
        }
    }, [mbtiType, userData]);

    // advice가 문자열이면 객체로 변환
    const adviceObj = typeof advice === 'string'
        ? { analysis: advice, strengths: [], cautions: [] }
        : advice;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                padding: '20px 5%',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Brain color="var(--primary)" /> AI 퍼스널 인사이트
                </h1>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    style={{
                        background: 'var(--primary-faint)',
                        border: 'none',
                        color: 'var(--primary)',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 700,
                        cursor: loading ? 'default' : 'pointer'
                    }}
                >
                    <RefreshCw size={18} className={loading ? "spin" : ""} /> 새 조언 받기
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 5%' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                border: '4px solid var(--primary-faint)', borderTopColor: 'var(--primary)',
                                marginBottom: '20px'
                            }}
                        />
                        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>AI가 성격을 분석하고 있습니다...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '25px' }}>
                        {/* MBTI Badge */}
                        <div className="glass-card" style={{
                            padding: '25px', display: 'flex', alignItems: 'center', gap: '20px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            color: 'white'
                        }}>
                            <div style={{ fontSize: '3rem', fontWeight: 900 }}>{mbtiType}</div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>당신만을 위한 성격 리포트</h2>
                                <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                                    AI가 분석한 {mbtiType} 성향의 심층 조언입니다.
                                </p>
                            </div>
                        </div>

                        {/* Analysis Card */}
                        {adviceObj && (
                            <section className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: 'var(--primary)', marginBottom: '20px' }}>
                                    <Lightbulb size={22} /> 성격 분석 리포트
                                </h3>
                                <div style={{
                                    fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text)',
                                    padding: '20px', background: 'var(--primary-faint)',
                                    borderRadius: '16px', borderLeft: '4px solid var(--primary)',
                                    marginBottom: '25px'
                                }}>
                                    {adviceObj.analysis || "분석 버튼을 눌러 조언을 받아보세요."}
                                </div>

                                {/* Strengths */}
                                {adviceObj.strengths?.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--primary)' }}>
                                            <Star size={18} /> 당신의 강점
                                        </h4>
                                        <div style={{ display: 'grid', gap: '10px' }}>
                                            {adviceObj.strengths.map((s, i) => (
                                                <div key={i} style={{
                                                    padding: '14px 18px', borderRadius: '12px',
                                                    background: 'var(--background)', border: '1px solid var(--glass-border)',
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    color: 'var(--text)', fontWeight: 600
                                                }}>
                                                    <span style={{ color: '#10b981', fontSize: '1.1rem' }}>✦</span>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cautions */}
                                {adviceObj.cautions?.length > 0 && (
                                    <div>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f59e0b' }}>
                                            <AlertTriangle size={18} /> 유의 사항
                                        </h4>
                                        <div style={{ display: 'grid', gap: '10px' }}>
                                            {adviceObj.cautions.map((c, i) => (
                                                <div key={i} style={{
                                                    padding: '14px 18px', borderRadius: '12px',
                                                    background: 'var(--background)', border: '1px solid var(--glass-border)',
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    color: 'var(--text)', fontWeight: 600
                                                }}>
                                                    <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>⚡</span>
                                                    {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* 💎 프리미엄 잠금 콘텐츠: 관계 전략 */}
                        <section className="glass-card" style={{ padding: '30px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: '#F59E0B', marginBottom: '20px' }}>
                                <Sparkles size={22} /> 나만의 관계 전략 (심층)
                            </h3>
                            {premiumUnlocked || isPremium ? (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {[
                                        { title: '첫 만남 공략법', emoji: '👋', desc: `${mbtiType} 타입인 당신은 가벼운 유머보다 진심 어린 관심이 상대방의 마음을 여는 열쇠입니다. 공통 관심사를 빨리 발굴하세요.` },
                                        { title: '갈등 해결 방식', emoji: '🕊', desc: '당신의 갈등 처리 스타일을 알면 관계가 더 편해집니다. 직접 대화보다 먼저 감정 상태를 나누는 것이 효과적입니다.' },
                                        { title: '이상형 궁합 분석', emoji: '💞', desc: `${mbtiType} 타입에게 가장 자연스러운 관계는 서로의 차이를 인정하고 성장 방향이 비슷한 파트너입니다.` },
                                    ].map(item => (
                                        <div key={item.title} style={{ padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                                            <div>
                                                <div style={{ fontWeight: 800, marginBottom: '5px', color: '#92400E' }}>{item.title}</div>
                                                <div style={{ fontSize: '0.9rem', color: '#78350F', lineHeight: 1.6 }}>{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔮</div>
                                    <h4 style={{ margin: '0 0 10px', fontWeight: 800 }}>나만의 관계 전략이 잠겨있어요</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>첫 만남 공략법, 갈등 해결 방식, 이상형 궁합 분석을 20💎으로 열어보세요!</p>
                                    <button
                                        onClick={() => {
                                            const success = spendCrystals(20);
                                            if (success) { setPremiumUnlocked(true); }
                                            else if (onNavigate) { onNavigate('shop'); }
                                        }}
                                        style={{
                                            padding: '14px 30px', borderRadius: '14px',
                                            background: crystals >= 20 ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : '#e2e8f0',
                                            color: crystals >= 20 ? 'white' : '#94a3b8',
                                            border: 'none', fontWeight: 800, cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem',
                                        }}
                                    >
                                        <Gem size={18} /> {crystals >= 20 ? '20💎으로 잠금 해제' : `크리스탈 부족 (${crystals}💎 보유)`}
                                    </button>
                                    {crystals < 20 && (
                                        <p style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>데일리 챌린지를 완료하면 무료로 모을 수 있어요! 🎯</p>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Conversation Topics */}
                        <section>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)', marginBottom: '20px' }}>
                                <MessageSquare size={22} color="var(--primary)" /> 추천 대화 주제
                            </h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {topics.length > 0 ? topics.map((topic, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        style={{
                                            background: 'var(--surface)', padding: '18px',
                                            borderRadius: '16px', border: '1px solid var(--glass-border)',
                                            display: 'flex', alignItems: 'center', gap: '15px'
                                        }}
                                    >
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '12px',
                                            background: 'var(--primary-faint)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                                            flexShrink: 0
                                        }}>
                                            <Zap size={18} />
                                        </div>
                                        <div style={{ flex: 1, color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem' }}>
                                            {topic}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        새 조언 받기 버튼을 눌러보세요!
                                    </div>
                                )}
                            </div>
                        </section>

                        {lastUpdated && (
                            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                최종 업데이트: {lastUpdated.toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsightsPage;
