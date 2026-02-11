import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, TrendingUp, MessageCircle } from 'lucide-react';

const HowItWorks = ({ onNext, onBack }) => {
    const steps = [
        {
            icon: <Sparkles size={40} />,
            title: "1. 성격 진단",
            description: "MBTI, Big5, HEXACO 기반의 과학적인 성격 분석을 받아보세요. 약 5분이 소요됩니다.",
            color: "#667eea"
        },
        {
            icon: <TrendingUp size={40} />,
            title: "2. 맞춤 매칭",
            description: "AI가 당신과 성향이 맞는 사람들을 찾아드립니다. 매칭률과 상세 분석을 확인하세요.",
            color: "#764ba2"
        },
        {
            icon: <MessageCircle size={40} />,
            title: "3. 진정한 연결",
            description: "대화를 시작하고, 커뮤니티에 참여하며, 진짜 인연을 만나보세요.",
            color: "#f093fb"
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            color: '#1a202c',
                            marginBottom: '15px'
                        }}
                    >
                        어떻게 작동하나요?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        style={{
                            fontSize: '1.1rem',
                            color: '#4a5568',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}
                    >
                        3단계로 당신에게 맞는 완벽한 인연을 찾아드립니다
                    </motion.p>
                </div>

                {/* Steps */}
                <div style={{
                    display: 'grid',
                    gap: '30px',
                    marginBottom: '50px'
                }}>
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
                            whileHover={{ scale: 1.02, x: 10 }}
                            style={{
                                background: 'white',
                                padding: '35px',
                                borderRadius: '25px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '30px',
                                border: '2px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                                color: 'white',
                                padding: '20px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '80px',
                                minHeight: '80px'
                            }}>
                                {step.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: '#1a202c',
                                    marginBottom: '10px'
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{
                                    fontSize: '1rem',
                                    color: '#4a5568',
                                    lineHeight: '1.6',
                                    margin: 0
                                }}>
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        padding: '30px',
                        borderRadius: '20px',
                        marginBottom: '40px'
                    }}
                >
                    <h3 style={{
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        ✨ Lumini만의 특별함
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        {[
                            "과학적 성격 분석",
                            "Bias-free 매칭",
                            "안전한 커뮤니티",
                            "무료 사용"
                        ].map((benefit, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: 'white'
                            }}>
                                <CheckCircle2 size={20} />
                                <span style={{ fontSize: '0.95rem' }}>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
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
                        다음
                        <ArrowRight size={20} />
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HowItWorks;
