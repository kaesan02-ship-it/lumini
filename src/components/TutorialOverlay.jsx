import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Brain, Target, ShieldCheck } from 'lucide-react';

const TutorialOverlay = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "반가워요! 저는 루미예요 🦦",
            desc: "성향과 가치관을 기반으로 진짜 나를 알아가고\n결이 맞는 인연을 찾도록 도와드릴게요.",
            icon: <Sparkles size={48} color="#6366f1" />,
            accent: "#6366f1"
        },
        {
            title: "내 안의 소울을 확인하세요",
            desc: "정밀 성향 테스트를 통해 나의 9가지 유전자 지표와\n심층적인 '딥소울' 분석 리포트를 받아보세요.",
            icon: <Brain size={48} color="#8B5CF6" />,
            accent: "#8B5CF6"
        },
        {
            title: "결이 맞는 인연과의 만남",
            desc: "나와 가치관이 비슷한 친구들을 추천해 드려요.\n매칭된 이유를 '문장형 인사이트'로 확인해 보세요!",
            icon: <Heart size={48} color="#EC4899" />,
            accent: "#EC4899"
        },
        {
            title: "매일 즐거운 챌린지",
            desc: "7일 연속 출석 미션과 다양한 데일리 퀘스트로\n크리스탈을 모으고 소울펫을 꾸며보세요.",
            icon: <Target size={48} color="#F59E0B" />,
            accent: "#F59E0B"
        }
    ];

    const current = steps[step];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                zIndex: 10000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '30px', textAlign: 'center', color: 'white'
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{ maxWidth: '400px' }}
                >
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '30px',
                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 30px', boxShadow: `0 20px 40px ${current.accent}40`
                    }}>
                        {current.icon}
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '20px', wordBreak: 'keep-all' }}>
                        {current.title}
                    </h2>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.7, opacity: 0.8, marginBottom: '40px', whiteSpace: 'pre-line' }}>
                        {current.desc}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Stepper Dots */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
                {steps.map((_, i) => (
                    <div key={i} style={{
                        width: i === step ? '24px' : '8px', height: '8px', borderRadius: '4px',
                        background: i === step ? 'white' : 'rgba(255,255,255,0.3)',
                        transition: '0.3s'
                    }} />
                ))}
            </div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    if (step < steps.length - 1) {
                        setStep(s => s + 1);
                    } else {
                        onComplete();
                    }
                }}
                style={{
                    padding: '16px 40px', borderRadius: '100px', border: 'none',
                    background: 'white', color: '#0f172a', fontSize: '1.1rem', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                }}
            >
                {step === steps.length - 1 ? "시작하기" : "다음으로"} <ArrowRight size={20} />
            </motion.button>
        </motion.div>
    );
};

export default TutorialOverlay;
