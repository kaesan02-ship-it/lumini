import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, BarChart2, ChevronRight, Sparkles, Calendar, PieChart } from 'lucide-react';

const InsightsHubPage = ({ onSelectCategory }) => {
    const categories = [
        {
            id: 'ai-insights',
            title: 'AI 퍼스널 인사이트',
            desc: 'AI가 조언하는 내 성격 기반 대인관계 가이드',
            icon: <Sparkles size={24} color="#8884d8" />,
            color: 'var(--primary-faint)'
        },
        {
            id: 'growth',
            title: '개인 성장 트래킹',
            desc: '시간에 따른 내 성격 지표 변화와 성장 일지',
            icon: <TrendingUp size={24} color="#82ca9d" />,
            color: 'rgba(130, 202, 157, 0.1)'
        },
        {
            id: 'stats',
            title: '루미니 통계망',
            desc: '루미니 유저들의 성격 분포와 내 활동 수치',
            icon: <BarChart2 size={24} color="#ffc658" />,
            color: 'rgba(255, 198, 88, 0.1)'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                padding: '30px 5% 10px',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 15px',
                        borderRadius: '20px',
                        background: 'var(--primary-faint)',
                        color: 'var(--primary)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '15px'
                    }}
                >
                    <Brain size={16} /> 데이터 & AI 인사이트
                </motion.div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>성장과 발견을 위한 허브</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>데이터로 나를 알고, AI로 더 넓은 세상을 만나보세요.</p>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px', display: 'grid', gap: '20px' }}>
                {categories.map((cat, idx) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectCategory(cat.id)}
                        style={{
                            background: 'var(--surface)',
                            padding: '25px',
                            borderRadius: '24px',
                            border: '1px solid var(--glass-border)',
                            boxShadow: 'var(--shadow)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '18px',
                            background: cat.color, display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            {cat.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{cat.title}</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {cat.desc}
                            </p>
                        </div>
                        <ChevronRight size={20} color="var(--glass-border)" />
                    </motion.div>
                ))}

                {/* Info Card */}
                <div style={{
                    marginTop: '20px', padding: '20px', borderRadius: '20px',
                    background: 'var(--background)', border: '1px dashed var(--glass-border)',
                    textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)'
                }}>
                    <p style={{ margin: 0 }}>
                        모든 인사이트는 사용자의 진단 데이터와 활동 기록을 기반으로 생성됩니다.<br />
                        더 정확한 분석을 위해 3개월마다 재진단을 권장합니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsightsHubPage;
