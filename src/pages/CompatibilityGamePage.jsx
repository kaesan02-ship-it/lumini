import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Check, X, Heart, Zap, Star, ArrowLeft } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';

const QUESTIONS = [
    { id: 1, q: '주말에 나는?', options: ['집에서 힐링 🏠', '밖에서 친구 만남 🎉'], mbtiKey: 'IE' },
    { id: 2, q: '의견 충돌 시 나는?', options: ['논리로 설득 📊', '감정으로 공감 💜'], mbtiKey: 'TF' },
    { id: 3, q: '새로운 계획이 생기면?', options: ['즉시 행동 ⚡', '철저히 준비 📋'], mbtiKey: 'PJ' },
    { id: 4, q: '관심사가 하나 vs 넓게?', options: ['하나를 깊게 🔭', '다양하게 넓게 🌈'], mbtiKey: 'SN' },
    { id: 5, q: '친구 고민을 들을 때?', options: ['해결책 제시 💡', '일단 들어줌 🫂'], mbtiKey: 'TF' },
    { id: 6, q: '여행 스타일은?', options: ['철저한 계획여행 🗺', '즉흥 자유여행 🎒'], mbtiKey: 'PJ' },
];

// 타입별 궁합 점수 (실제 MBTI 궁합 참고)
const COMPATIBILITY = {
    INFP: { ENFJ: 98, INTJ: 92, INFJ: 88, ENTP: 85, INTP: 80 },
    ENFJ: { INFP: 98, INFJ: 94, ISFP: 90, ENFP: 88, ENTP: 82 },
    INTJ: { ENFP: 95, INFP: 92, ENTP: 88, ENTJ: 85, INTP: 82 },
    ENTP: { INFJ: 96, INTJ: 88, ENFJ: 82, INFP: 85, ISFJ: 78 },
    ISFJ: { ESFP: 94, ESTP: 90, ISFP: 85, ISTJ: 82, INFJ: 80 },
    ESFP: { ISFJ: 94, ISTJ: 88, INFJ: 82, ESTP: 85, ENFJ: 80 },
};

const getCompatibility = (typeA, typeB) => {
    if (!typeA || !typeB) return Math.floor(Math.random() * 30) + 65;
    return COMPATIBILITY[typeA]?.[typeB] || COMPATIBILITY[typeB]?.[typeA] || Math.floor(Math.random() * 25) + 70;
};

const CompatibilityGamePage = ({ onBack, myMbtiType, onNavigate }) => {
    const { earnCrystals } = useCrystalStore();
    const [phase, setPhase] = useState('intro'); // intro | quiz | result
    const [answers, setAnswers] = useState([]);
    const [current, setCurrent] = useState(0);
    const [partnerType, setPartnerType] = useState('');
    const [rewardClaimed, setRewardClaimed] = useState(false);

    const handleAnswer = (optionIndex) => {
        const newAnswers = [...answers, optionIndex];
        setAnswers(newAnswers);
        if (current + 1 < QUESTIONS.length) {
            setCurrent(current + 1);
        } else {
            // 퀴즈 완료 → 결과 계산
            const randomTypes = ['INFP', 'ENFJ', 'INTJ', 'ESFP', 'ENTP', 'ISFJ', 'INFJ', 'ENTJ'];
            setPartnerType(randomTypes[Math.floor(Math.random() * randomTypes.length)]);
            setPhase('result');
        }
    };

    const score = useMemo(() => getCompatibility(myMbtiType, partnerType), [myMbtiType, partnerType]);
    const isHighMatch = score >= 85;

    const handleClaimReward = () => {
        earnCrystals(15, '궁합 게임 참여');
        setRewardClaimed(true);
    };

    const handleRestart = () => {
        setPhase('intro');
        setAnswers([]);
        setCurrent(0);
        setPartnerType('');
        setRewardClaimed(false);
    };

    const progress = QUESTIONS.length > 0 ? (answers.length / QUESTIONS.length) * 100 : 0;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{
                padding: '20px 5%',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                color: 'white',
                display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                {onBack && <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>←</button>}
                <div>
                    <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>💕 소울 궁합 게임</h1>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '0.82rem' }}>6문제로 나의 이상형 궁합 점수를 알아봐요</p>
                </div>
            </div>

            <div style={{ maxWidth: '560px', margin: '0 auto', padding: '30px 5%' }}>
                <AnimatePresence mode="wait">
                    {phase === 'intro' && (
                        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>💕</div>
                                <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '12px' }}>나의 소울 궁합 점수는?</h2>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '30px' }}>
                                    6가지 질문에 솔직하게 답하면<br />
                                    <strong style={{ color: 'var(--primary)' }}>성향별 궁합 점수</strong>와 함께<br />
                                    나와 잘 맞는 타입을 알려드려요! 🎉
                                </p>
                                <div style={{ background: 'var(--primary-faint)', borderRadius: '16px', padding: '16px', marginBottom: '28px', fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 700 }}>
                                    🎁 완료 시 15💎 보상 지급
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setPhase('quiz')}
                                    style={{ padding: '16px 50px', borderRadius: '16px', background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', border: 'none', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}
                                >
                                    게임 시작 →
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'quiz' && (
                        <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            {/* Progress */}
                            <div style={{ marginBottom: '28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span>질문 {current + 1} / {QUESTIONS.length}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
                                    <motion.div
                                        animate={{ width: `${progress}%` }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, #EC4899, #8B5CF6)', borderRadius: '100px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow)', border: '1px solid var(--glass-border)', textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🤔</div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.4 }}>{QUESTIONS[current].q}</h3>
                            </div>

                            <div style={{ display: 'grid', gap: '14px' }}>
                                {QUESTIONS[current].options.map((opt, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(i)}
                                        style={{
                                            padding: '22px 28px', borderRadius: '18px', border: '2px solid var(--glass-border)',
                                            background: 'var(--surface)', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer',
                                            textAlign: 'left', boxShadow: 'var(--shadow)',
                                        }}
                                    >
                                        {opt}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {phase === 'result' && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                    style={{ fontSize: '5rem', marginBottom: '10px' }}
                                >
                                    {isHighMatch ? '💫' : '✨'}
                                </motion.div>
                                <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '8px' }}>궁합 결과!</h2>
                                <p style={{ color: 'var(--text-muted)' }}>{myMbtiType || '나의 타입'} × {partnerType}</p>
                            </div>

                            <div style={{ background: isHighMatch ? 'linear-gradient(135deg, #FDF4FF, #FAE8FF)' : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: '28px', padding: '36px', textAlign: 'center', marginBottom: '22px', border: `2px solid ${isHighMatch ? '#D946EF' : '#3B82F6'}30` }}>
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                    style={{ fontSize: '5rem', fontWeight: 900, color: isHighMatch ? '#D946EF' : '#3B82F6', marginBottom: '8px' }}
                                >
                                    {score}%
                                </motion.div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                                    {score >= 90 ? '완벽한 소울메이트! 💕' : score >= 80 ? '찰떡 궁합이에요! 💜' : score >= 70 ? '잘 맞는 한 쌍이에요 😊' : '보완적인 관계예요 🤝'}
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    {isHighMatch
                                        ? `${partnerType} 타입과 당신은 서로의 강점을 자연스럽게 끌어내는 관계예요. 첫 대화부터 편안함을 느낄 가능성이 높아요!`
                                        : `${partnerType} 타입과 당신은 서로 다른 시각으로 서로를 성장시켜줄 수 있어요. 의외의 강한 연결고리가 생길 수 있답니다!`
                                    }
                                </p>
                            </div>

                            {/* Crystal Reward */}
                            {!rewardClaimed ? (
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={handleClaimReward}
                                    style={{ width: '100%', padding: '18px', borderRadius: '18px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white', border: 'none', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer', marginBottom: '14px' }}>
                                    🎁 +15💎 보상 받기
                                </motion.button>
                            ) : (
                                <div style={{ width: '100%', padding: '18px', borderRadius: '18px', background: '#F0FDF4', border: '2px solid #86EFAC', textAlign: 'center', fontWeight: 800, color: '#16A34A', marginBottom: '14px' }}>
                                    ✅ 크리스탈 지급 완료!
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button onClick={handleRestart} style={{ padding: '14px', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'var(--surface)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Shuffle size={18} /> 다시 하기
                                </button>
                                <button onClick={() => onNavigate && onNavigate('feed')} style={{ padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Heart size={18} /> 인연 찾기
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CompatibilityGamePage;
