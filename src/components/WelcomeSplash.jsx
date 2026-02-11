import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Shield, Users } from 'lucide-react';

const WelcomeSplash = ({ onNext }) => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #a78bfa 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Animation */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    textAlign: 'center',
                    color: 'white',
                    maxWidth: '600px',
                    zIndex: 1
                }}
            >
                {/* Logo */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        marginBottom: '40px'
                    }}
                >
                    <Sparkles size={80} strokeWidth={1.5} />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        marginBottom: '20px',
                        letterSpacing: '-1px'
                    }}
                >
                    Lumini
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 300,
                        marginBottom: '50px',
                        opacity: 0.95
                    }}
                >
                    성격으로 만나는 진짜 인연
                </motion.p>

                {/* Value Propositions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginBottom: '60px'
                    }}
                >
                    <ValueCard
                        icon={<Heart size={24} />}
                        title="과학적 매칭"
                        description="MBTI, Big5, HEXACO 기반 정밀 분석"
                    />
                    <ValueCard
                        icon={<Shield size={24} />}
                        title="안전한 만남"
                        description="검증된 프로필과 안전한 커뮤니티"
                    />
                    <ValueCard
                        icon={<Users size={24} />}
                        title="진정한 연결"
                        description="성향이 맞는 친구, 연인, 파트너 찾기"
                    />
                </motion.div>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNext}
                    style={{
                        background: 'white',
                        color: '#667eea',
                        padding: '18px 50px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: '50px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                >
                    시작하기
                    <ArrowRight size={20} />
                </motion.button>
            </motion.div>
        </div>
    );
};

const ValueCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ scale: 1.02, x: 10 }}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: '20px 30px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'left'
        }}
    >
        <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px',
            borderRadius: '12px'
        }}>
            {icon}
        </div>
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '5px' }}>
                {title}
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: 0 }}>
                {description}
            </p>
        </div>
    </motion.div>
);

export default WelcomeSplash;
