import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, MessageSquare, RefreshCw, ChevronRight, Brain, Zap } from 'lucide-react';
import { getAIAdvice, getConversationTopics } from '../lib/openaiClient';
import useAuthStore from '../store/authStore';

const AIInsightsPage = ({ userData, mbtiType }) => {
    const { user } = useAuthStore();
    const [advice, setAdvice] = useState('');
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchInsights = async () => {
        if (!mbtiType || !userData) return;

        try {
            setLoading(true);
            const [adviceData, topicsData] = await Promise.all([
                getAIAdvice(mbtiType, userData),
                getConversationTopics(mbtiType, user?.user_metadata?.tags || [])
            ]);
            setAdvice(adviceData);
            setTopics(topicsData);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch AI insights:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 처음 한 번은 자동으로 가져오기 (advice가 비어있을 때만)
        if (!advice && mbtiType && userData) {
            fetchInsights();
        }
    }, [mbtiType, userData]);

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
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                </motion.button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}
                        >
                            <div className="loader-container" style={{ position: 'relative', width: '80px', height: '80px' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        position: 'absolute', inset: 0, borderRadius: '50%',
                                        border: '4px solid var(--primary-faint)', borderTopColor: 'var(--primary)'
                                    }}
                                />
                                <Sparkles size={30} color="var(--primary)" style={{ position: 'absolute', top: '25px', left: '25px' }} />
                            </div>
                            <p style={{ marginTop: '20px', fontWeight: 600, color: 'var(--text-muted)' }}>AI가 성격을 분석하고 있습니다...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'grid', gap: '30px' }}
                        >
                            {/* MBTI Context Card */}
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

                            {/* Advice Card */}
                            <section className="glass-card" style={{ padding: '35px', background: 'var(--surface)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: 'var(--primary)' }}>
                                    <Lightbulb size={24} /> 오늘의 퍼스널 조언
                                </h3>
                                <div style={{
                                    fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text)',
                                    fontStyle: 'italic', position: 'relative', paddingLeft: '20px'
                                }}>
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0,
                                        width: '4px', background: 'var(--primary)', borderRadius: '2px'
                                    }} />
                                    "{advice || "분석 버튼을 눌러 당신만을 위한 조언을 확인해보세요."}"
                                </div>
                            </section>

                            {/* Conversation Topics */}
                            <section>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)', marginBottom: '20px' }}>
                                    <MessageSquare size={22} color="var(--primary)" /> 추천 대화 주제
                                </h3>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {topics.length > 0 ? topics.map((topic, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            style={{
                                                background: 'var(--surface)', padding: '20px',
                                                borderRadius: '18px', border: '1px solid var(--glass-border)',
                                                display: 'flex', alignItems: 'center', gap: '15px'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                background: 'var(--primary-faint)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                                            }}>
                                                <Zap size={20} />
                                            </div>
                                            <div style={{ flex: 1, color: 'var(--text)', fontWeight: 600 }}>
                                                {topic}
                                            </div>
                                            <ChevronRight size={18} color="var(--text-muted)" />
                                        </motion.div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            데이터를 불러오는 중입니다...
                                        </div>
                                    )}
                                </div>
                            </section>

                            {lastUpdated && (
                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    최종 업데이트: {lastUpdated.toLocaleString()}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIInsightsPage;
