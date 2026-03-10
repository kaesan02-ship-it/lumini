import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

const QUESTIONS = [
    { id: 1, q: "연인과 연락, 얼마나 자주 해야 할까?", a: "틈날 때마다 카톡/전화", b: "필요할 때만, 각자의 시간 존중", category: "Communication" },
    { id: 2, q: "데이트 장소를 정할 때 나는?", a: "유명한 맛집, 핫플 정복", b: "조용하고 우리끼리 즐거운 곳", category: "Preference" },
    { id: 3, q: "갈등이 생겼을 때 나의 태도는?", a: "그 자리에서 바로 대화로 풀기", b: "감정을 추스릴 시간이 필요해", category: "Conflict" },
    { id: 4, q: "기념일을 챙기는 나의 스타일은?", a: "깜짝 이벤트와 화려한 선물", b: "맛있는 밥 한 끼면 충분해", category: "Value" },
    { id: 5, q: "돈 관리, 어떻게 하는 게 좋을까?", a: "공동 통장으로 투명하게", b: "각자 관리하고 분담하기", category: "Finance" },
];

const ValueGamePage = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);

    const handleSelect = (choice) => {
        const q = QUESTIONS[currentStep];
        const newAnswers = { ...answers, [q.id]: choice };
        setAnswers(newAnswers);

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsFinished(true);
        }
    };

    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

    if (isFinished) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', padding: '30px', textAlign: 'center',
                background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #fdf2f8 100%)',
                position: 'relative', overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                    style={{
                        position: 'relative', zIndex: 10, padding: '48px', maxWidth: '500px', width: '100%',
                        background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid white',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.08)', borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        style={{
                            width: '96px', height: '96px', background: 'linear-gradient(135deg, #ec4899, #6366f1)',
                            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 10px 25px rgba(236, 72, 153, 0.3)', marginBottom: '32px', transform: 'rotate(-6deg)'
                        }}
                    >
                        <Heart color="white" fill="white" size={48} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '10px', color: '#1e293b' }}>가치관 분석 완료!</h2>
                        <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '32px' }}>당신만의 소울 프로필이 업데이트 되었어요.</p>

                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', borderRadius: '20px', padding: '24px', marginBottom: '32px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Sparkles color="#6366f1" size={24} />
                                <span style={{ fontWeight: 800, color: '#334155', fontSize: '1.1rem' }}>소울 매칭 정확도</span>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
                                style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ec4899', marginTop: '10px' }}
                            >
                                +15% 상승 🚀
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { if (onComplete) onComplete(answers); }}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: 800, color: 'white',
                            background: '#0f172a', borderRadius: '16px', cursor: 'pointer', border: 'none',
                            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)'
                        }}
                    >
                        완벽한 인연 찾아보기
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    const q = QUESTIONS[currentStep];

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#fafafa' }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 60%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)', zIndex: 0 }} />

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '85vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px', width: '100%' }}>
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '6px', color: '#ec4899', fontWeight: 900, fontSize: '0.75rem',
                            textTransform: 'uppercase', letterSpacing: '0.2em', background: '#fdf2f8', padding: '6px 16px',
                            borderRadius: '100px', border: '1px solid #fce7f3', marginBottom: '16px'
                        }}>
                            <Heart size={14} fill="currentColor" /> LOVE BALANCE
                        </span>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>깊은 속마음을 알려주세요 🦦</h1>
                    </motion.div>
                </div>

                <div style={{ width: '100%', maxWidth: '600px', marginBottom: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 8px' }}>
                        <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>Q {currentStep + 1}</span>
                        <span style={{ color: '#cbd5e1', fontWeight: 800, fontSize: '0.9rem' }}>{QUESTIONS.length} Questions</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                        <motion.div
                            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #f472b6, #fb7185, #818cf8)', borderRadius: '100px' }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}
                        style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', lineHeight: '1.4', padding: '0 16px' }}>
                                "{q.q}"
                            </h3>
                        </div>

                        {/* Cards Container (Desktop: Row, Mobile: Col) */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', gap: '24px', justifyContent: 'center' }}>
                            {/* Card A */}
                            <motion.button
                                whileHover={{ scale: 1.02, y: -5, borderColor: '#c7d2fe', boxShadow: '0 20px 40px rgba(99,102,241,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect('A')}
                                style={{
                                    flex: '1 1 300px', position: 'relative', background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(12px)', borderRadius: '32px', padding: '30px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    textAlign: 'center', border: '2px solid transparent', cursor: 'pointer',
                                    transition: 'all 0.3s ease', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', minHeight: '240px'
                                }}
                            >
                                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#eef2ff', color: '#6366f1', fontWeight: 900, fontSize: '0.75rem', padding: '6px 14px', borderRadius: '100px' }}>{q.category}</div>
                                <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>☀️</div>
                                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#334155', lineHeight: '1.4' }}>{q.a}</p>
                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 800, fontSize: '0.9rem', background: '#eef2ff', padding: '8px 16px', borderRadius: '100px' }}>
                                    선택 <ArrowRight size={16} />
                                </div>
                            </motion.button>

                            {/* Divider (VS) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
                                <span style={{ color: '#cbd5e1', fontWeight: 900, fontSize: '1.8rem', fontStyle: 'italic' }}>VS</span>
                            </div>

                            {/* Card B */}
                            <motion.button
                                whileHover={{ scale: 1.02, y: -5, borderColor: '#fecdd3', boxShadow: '0 20px 40px rgba(244,63,94,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect('B')}
                                style={{
                                    flex: '1 1 300px', position: 'relative', background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(12px)', borderRadius: '32px', padding: '30px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    textAlign: 'center', border: '2px solid transparent', cursor: 'pointer',
                                    transition: 'all 0.3s ease', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', minHeight: '240px'
                                }}
                            >
                                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#fff1f2', color: '#f43f5e', fontWeight: 900, fontSize: '0.75rem', padding: '6px 14px', borderRadius: '100px' }}>{q.category}</div>
                                <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🌙</div>
                                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#334155', lineHeight: '1.4' }}>{q.b}</p>
                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: 800, fontSize: '0.9rem', background: '#fff1f2', padding: '8px 16px', borderRadius: '100px' }}>
                                    선택 <ArrowRight size={16} />
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: '60px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '100px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(226,232,240,0.5)', color: '#64748b', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <Sparkles size={18} color="#818cf8" />
                        솔직한 마음을 고를수록 더 잘 맞는 인연을 만날 수 있어요
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ValueGamePage;
