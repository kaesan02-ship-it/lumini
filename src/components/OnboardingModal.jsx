import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Users, MessageCircle } from 'lucide-react';

const OnboardingModal = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            icon: Sparkles,
            title: '성격 진단으로 시작하세요',
            description: '24개 질문으로 당신의 MBTI와 성격을 분석합니다',
            highlight: 'test-button'
        },
        {
            icon: Users,
            title: '인연을 찾아보세요',
            description: '성격 기반 매칭으로 당신과 잘 맞는 친구를 추천합니다',
            highlight: 'recommendations'
        },
        {
            icon: MessageCircle,
            title: '그룹에서 소통하세요',
            description: '관심사가 같은 사람들과 그룹 채팅을 즐기세요',
            highlight: 'groups'
        }
    ];

    const currentStepData = steps[currentStep];
    const Icon = currentStepData.icon;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--surface)',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onSkip}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={24} />
                </button>

                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px',
                        background: 'var(--primary-faint)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px var(--primary-glow)'
                    }}>
                        <Icon size={40} color="var(--primary)" />
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '15px' }}>
                        {currentStepData.title}
                    </h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px' }}>
                        {currentStepData.description}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '30px' }}>
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    width: index === currentStep ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '10px',
                                    background: index === currentStep ? 'var(--primary)' : 'var(--glass-border)',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>

                    <button
                        className="primary"
                        onClick={handleNext}
                        style={{
                            padding: '15px 60px',
                            fontSize: '1.1rem',
                            borderRadius: '30px'
                        }}
                    >
                        {currentStep < steps.length - 1 ? '다음' : '시작하기'}
                    </button>

                    <button
                        onClick={onSkip}
                        style={{
                            marginTop: '15px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        건너뛰기
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default React.memo(OnboardingModal);
