import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { BIG5_DESCRIPTIONS, getLevel, getLevelColor } from '../data/personalityDescriptions';

const PersonalityExplanation = ({ data }) => {
    const [expandedFactors, setExpandedFactors] = useState({});

    const toggleFactor = (factorName) => {
        setExpandedFactors(prev => ({
            ...prev,
            [factorName]: !prev[factorName]
        }));
    };

    return (
        <div style={{
            marginTop: '60px',
            padding: '40px',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            borderRadius: '30px'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#1a202c',
                    marginBottom: '15px'
                }}>
                    📊 성격 요인 상세 분석
                </h2>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#4a5568',
                    maxWidth: '700px',
                    margin: '0 auto'
                }}>
                    각 요인이 의미하는 바와 실생활 예시를 확인해보세요
                </p>
            </div>

            <div style={{
                display: 'grid',
                gap: '20px'
            }}>
                {data.map((factor, index) => {
                    const factorName = factor.subject;
                    const score = factor.A;
                    const level = getLevel(score);
                    const description = BIG5_DESCRIPTIONS[factorName];
                    const levelColor = getLevelColor(score);
                    const isExpanded = expandedFactors[factorName];

                    if (!description) return null;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                            }}
                        >
                            {/* Header */}
                            <div
                                onClick={() => toggleFactor(factorName)}
                                style={{
                                    padding: '25px 30px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: isExpanded ? '#f8fafc' : 'white',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '15px',
                                        background: `${levelColor}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        color: levelColor
                                    }}>
                                        {score}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 700,
                                            color: '#1a202c',
                                            marginBottom: '5px'
                                        }}>
                                            {factorName}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            color: '#4a5568',
                                            margin: 0
                                        }}>
                                            {description[level].title}
                                        </p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {isExpanded ? <ChevronUp size={24} color="#4a5568" /> : <ChevronDown size={24} color="#4a5568" />}
                                </motion.div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '0 30px 30px 30px' }}>
                                            {/* Description */}
                                            <div style={{
                                                background: `${levelColor}10`,
                                                padding: '20px',
                                                borderRadius: '15px',
                                                marginBottom: '20px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '12px'
                                                }}>
                                                    <Info size={20} color={levelColor} />
                                                    <h4 style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 700,
                                                        color: '#1a202c',
                                                        margin: 0
                                                    }}>
                                                        특징
                                                    </h4>
                                                </div>
                                                <p style={{
                                                    fontSize: '1rem',
                                                    color: '#2d3748',
                                                    lineHeight: '1.6',
                                                    margin: 0
                                                }}>
                                                    {description[level].description}
                                                </p>
                                            </div>

                                            {/* Examples */}
                                            <div>
                                                <h4 style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: 700,
                                                    color: '#1a202c',
                                                    marginBottom: '15px'
                                                }}>
                                                    💡 실생활 예시
                                                </h4>
                                                <div style={{
                                                    display: 'grid',
                                                    gap: '10px'
                                                }}>
                                                    {description[level].examples.map((example, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '12px',
                                                                padding: '12px',
                                                                background: '#f8fafc',
                                                                borderRadius: '10px'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '6px',
                                                                height: '6px',
                                                                borderRadius: '50%',
                                                                background: levelColor,
                                                                marginTop: '8px',
                                                                flexShrink: 0
                                                            }} />
                                                            <p style={{
                                                                fontSize: '0.95rem',
                                                                color: '#2d3748',
                                                                margin: 0,
                                                                lineHeight: '1.5'
                                                            }}>
                                                                {example}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                    marginTop: '30px',
                    padding: '25px',
                    background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                    borderRadius: '15px',
                    border: '2px solid #667eea30'
                }}
            >
                <p style={{
                    fontSize: '0.95rem',
                    color: '#4a5568',
                    lineHeight: '1.6',
                    margin: 0,
                    textAlign: 'center'
                }}>
                    <strong>💡 Tip:</strong> 각 요인을 클릭하면 상세 설명을 확인할 수 있습니다.
                    이 분석은 Big5 및 HEXACO 모델을 기반으로 하며, 당신의 성격을 더 깊이 이해하는 데 도움을 줍니다.
                </p>
            </motion.div>
        </div>
    );
};

export default PersonalityExplanation;
