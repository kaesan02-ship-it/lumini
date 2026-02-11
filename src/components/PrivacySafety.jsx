import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, Eye, Heart, CheckCircle2 } from 'lucide-react';

const PrivacySafety = ({ onNext, onBack }) => {
    const promises = [
        {
            icon: <Lock size={32} />,
            title: "데이터 보호",
            description: "당신의 개인정보는 암호화되어 안전하게 보호됩니다. 제3자와 공유하지 않습니다.",
            color: "#10b981"
        },
        {
            icon: <Shield size={32} />,
            title: "Bias-free 매칭",
            description: "성별, 나이, 외모가 아닌 순수한 성격 기반 매칭을 제공합니다.",
            color: "#3b82f6"
        },
        {
            icon: <Eye size={32} />,
            title: "투명한 알고리즘",
            description: "매칭 과정이 투명하게 공개됩니다. 왜 매칭되었는지 상세히 알 수 있습니다.",
            color: "#8b5cf6"
        },
        {
            icon: <Heart size={32} />,
            title: "안전한 커뮤니티",
            description: "존중과 배려를 기반으로 한 커뮤니티 규칙을 운영합니다.",
            color: "#ec4899"
        }
    ];

    const rules = [
        "상대방을 존중하고 배려합니다",
        "개인정보를 함부로 요구하지 않습니다",
        "부적절한 언행을 하지 않습니다",
        "진정성 있는 대화를 나눕니다"
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    maxWidth: '900px',
                    width: '100%'
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            padding: '20px',
                            borderRadius: '20px',
                            marginBottom: '25px'
                        }}
                    >
                        <Shield size={50} color="white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            color: '#1a202c',
                            marginBottom: '15px'
                        }}
                    >
                        안전과 개인정보 보호
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        style={{
                            fontSize: '1.1rem',
                            color: '#4a5568',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}
                    >
                        Lumini는 당신의 안전과 프라이버시를 최우선으로 생각합니다
                    </motion.p>
                </div>

                {/* Promises */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '25px',
                    marginBottom: '50px'
                }}>
                    {promises.map((promise, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                            style={{
                                background: 'white',
                                padding: '30px',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                border: '2px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                background: `${promise.color}15`,
                                color: promise.color,
                                width: '70px',
                                height: '70px',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                {promise.icon}
                            </div>
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: '#1a202c',
                                marginBottom: '12px'
                            }}>
                                {promise.title}
                            </h3>
                            <p style={{
                                fontSize: '0.95rem',
                                color: '#4a5568',
                                lineHeight: '1.6',
                                margin: 0
                            }}>
                                {promise.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Community Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    style={{
                        background: 'white',
                        padding: '35px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        marginBottom: '40px'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#1a202c',
                        marginBottom: '25px',
                        textAlign: 'center'
                    }}>
                        💜 커뮤니티 규칙
                    </h3>
                    <div style={{
                        display: 'grid',
                        gap: '15px'
                    }}>
                        {rules.map((rule, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    padding: '15px',
                                    background: '#f7fafc',
                                    borderRadius: '12px'
                                }}
                            >
                                <CheckCircle2 size={22} color="#10b981" />
                                <span style={{
                                    fontSize: '1rem',
                                    color: '#2d3748',
                                    fontWeight: 500
                                }}>
                                    {rule}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Agreement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                    style={{
                        background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                        padding: '25px',
                        borderRadius: '15px',
                        marginBottom: '35px',
                        textAlign: 'center'
                    }}
                >
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#4a5568',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        계속 진행하시면 위 내용에 동의하시는 것으로 간주됩니다.<br />
                        <strong>Lumini</strong>와 함께 안전하고 즐거운 만남을 시작하세요! 🌟
                    </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    style={{
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center'
                    }}
                >
                    <button
                        onClick={onBack}
                        style={{
                            background: 'white',
                            color: '#4a5568',
                            padding: '15px 35px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: '50px',
                            border: '2px solid #e2e8f0',
                            cursor: 'pointer'
                        }}
                    >
                        이전
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNext}
                        style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            padding: '15px 45px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderRadius: '50px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        동의하고 시작하기
                        <ArrowRight size={20} />
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PrivacySafety;
