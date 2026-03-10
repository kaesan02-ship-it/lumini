import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lightbulb, Heart, AlertCircle } from 'lucide-react';

const CompatibilityBreakdown = ({ analysis }) => {
    if (!analysis) {
        return null;
    }

    const {
        overallScore = 0,
        dimensions = [],
        strengths = [],
        complementary = [],
        advice = null,
        matchingInsight = null
    } = analysis || {};

    return (
        <div style={{ marginTop: '30px' }}>
            {/* Overall Score */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                padding: '30px',
                borderRadius: '24px',
                color: 'white',
                marginBottom: '30px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.25)'
            }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>종합 성향 일치도</div>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '8px' }}>{overallScore}%</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '100px', display: 'inline-block' }}>
                    {overallScore >= 85 ? '🌈 완벽한 소울메이트!' :
                        overallScore >= 75 ? '✨ 깊은 교감이 가능한 사이' :
                            overallScore >= 65 ? '🌟 조화로운 인연' : '🤝 서로를 채워주는 관계'}
                </div>
            </div>

            {/* Matching Insight Section (NEW) */}
            {matchingInsight && (
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '25px',
                    marginBottom: '30px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a202c', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lightbulb size={20} color="#f59e0b" /> 우리가 매칭된 이유
                    </h4>
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: 1.8,
                        color: '#475569',
                        margin: 0,
                        wordBreak: 'keep-all'
                    }}>
                        {(matchingInsight.description || '').split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i} style={{ color: '#6366f1' }}>{part}</strong> : part
                        )}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                        {(matchingInsight.keyTraits || []).map(trait => (
                            <span key={trait} style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', background: '#eef2ff', padding: '4px 12px', borderRadius: '100px' }}>
                                #{trait}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Dimension Breakdown */}
            <div style={{ marginBottom: '30px' }}>
                <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#1a202c'
                }}>
                    <TrendingUp size={20} color="#8b5cf6" />
                    차원별 일치도 분석
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dimensions.map((dim, index) => (
                        <motion.div
                            key={dim.dimension}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: 'white',
                                border: `2px solid ${dim.color}15`,
                                borderRadius: '15px',
                                padding: '15px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Progress Bar Background */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: `${dim.similarity}%`,
                                background: `${dim.color}10`,
                                transition: 'width 0.5s ease',
                                zIndex: 0
                            }} />

                            {/* Content */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{dim.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a202c' }}>
                                                {dim.dimension}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {dim.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        color: dim.color
                                    }}>
                                        {dim.similarity}%
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: '#4a5568',
                                    lineHeight: '1.5',
                                    marginTop: '8px'
                                }}>
                                    {dim.insight}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Strengths Section */}
            {strengths.length > 0 && (
                <div style={{
                    background: '#10b98110',
                    border: '2px solid #10b98130',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#059669'
                    }}>
                        <Heart size={18} />
                        강한 일치 영역
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {strengths.map(s => (
                            <div key={s.dimension} style={{
                                background: 'white',
                                padding: '8px 14px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#059669',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span>{s.icon}</span>
                                {s.dimension} ({s.similarity}%)
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Complementary Section */}
            {complementary.length > 0 && (
                <div style={{
                    background: '#f59e0b10',
                    border: '2px solid #f59e0b30',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#d97706'
                    }}>
                        <AlertCircle size={18} />
                        보완 관계 영역
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {complementary.map(c => (
                            <div key={c.dimension} style={{
                                background: 'white',
                                padding: '8px 14px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span>{c.icon}</span>
                                {c.dimension} ({c.similarity}%)
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Relationship Advice */}
            {advice && (
                <div style={{
                    background: '#8b5cf610',
                    border: '2px solid #8b5cf630',
                    borderRadius: '15px',
                    padding: '20px'
                }}>
                    <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#7c3aed'
                    }}>
                        <Lightbulb size={18} />
                        관계 조언
                    </h4>

                    {advice.commonGround?.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '8px' }}>
                                💚 공통점
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
                                {advice.commonGround.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {advice.differences?.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '8px' }}>
                                ⚖️ 차이점 존중하기
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
                                {advice.differences.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {advice.activities?.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '8px' }}>
                                🎯 추천 활동
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {advice.activities.map((activity, i) => (
                                    <div key={i} style={{
                                        background: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '15px',
                                        fontSize: '0.8rem',
                                        color: '#7c3aed',
                                        fontWeight: 600
                                    }}>
                                        {activity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompatibilityBreakdown;
