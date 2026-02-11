import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lightbulb, Heart, AlertCircle } from 'lucide-react';

const CompatibilityBreakdown = ({ analysis }) => {
    if (!analysis) {
        return null;
    }

    const { overallScore, dimensions, strengths, complementary, advice } = analysis;

    return (
        <div style={{ marginTop: '30px' }}>
            {/* Overall Score */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '25px',
                borderRadius: '20px',
                color: 'white',
                marginBottom: '25px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>종합 성향 일치도</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '5px' }}>{overallScore}%</div>
                <div style={{ fontSize: '1rem', opacity: 0.95 }}>
                    {overallScore >= 80 ? '💚 매우 좋은 궁합이에요!' :
                        overallScore >= 70 ? '💜 좋은 궁합이에요!' :
                            overallScore >= 60 ? '💙 괜찮은 궁합이에요!' : '🤍 보완 관계예요!'}
                </div>
            </div>

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

                    {advice.commonGround.length > 0 && (
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

                    {advice.differences.length > 0 && (
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

                    {advice.activities.length > 0 && (
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
