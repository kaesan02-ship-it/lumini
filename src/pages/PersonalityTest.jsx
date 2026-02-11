import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 검증된 성격 모델(MBTI, OCEAN, HEXACO) 기반 24문항 정밀 데이터셋
const questions = [
    // 1. 외향성 (Extraversion - E/I)
    { id: 1, text: '처음 만나는 사람들과의 대화에서도 어색함 없이 대화를 잘 이끄시나요?', factor: 'EI', weight: 1, category: '사회적 에너지' },
    { id: 2, text: '혼자서 시간을 보내는 것보다 사람들과 함께 어울릴 때 더 큰 활력을 얻으시나요?', factor: 'EI', weight: 1, category: '사회적 에너지' },
    { id: 3, text: '여러 사람의 시선이 집중되는 자리에서도 긴장하지 않고 내 의견을 전달하는 것이 편한가요?', factor: 'EI', weight: 1, category: '사회적 에너지' },
    { id: 4, text: '주말이나 여가 시간에는 조용히 쉬는 것보다 외부 활동이나 모임에 참여하는 것을 선호하시나요?', factor: 'EI', weight: 1, category: '사회적 에너지' },

    // 2. 개방성/직관 (Openness/Intuition - S/N)
    { id: 5, text: '현실적인 해결책보다는 새롭고 창의적인 아이디어를 제안하는 것에 더 흥미를 느끼시나요?', factor: 'SN', weight: 1, category: '사고의 유연성' },
    { id: 6, text: '영화나 책을 볼 때 줄거리 자체보다는 그 너머에 숨겨진 의미나 상징을 파악하려 노력하시나요?', factor: 'SN', weight: 1, category: '사고의 유연성' },
    { id: 7, text: '익숙하고 정해진 방식대로 일하는 것보다 새로운 수단을 시도해 보는 것이 더 즐거우신가요?', factor: 'SN', weight: 1, category: '사고의 유연성' },
    { id: 8, text: '가끔은 일어나지 않은 일에 대해 끊임없이 상상하며 시간 가는 줄 모르고 빠져드나요?', factor: 'SN', weight: 1, category: '사고의 유연성' },

    // 3. 우호성/공감 (Agreeableness/Feeling - T/F)
    { id: 9, text: '주변 사람들의 기분이나 감정 변화를 빠르게 눈치채고 공감해 주려 노력하시나요?', factor: 'TF', weight: 1, category: '대인 관계 양식' },
    { id: 10, text: '어떤 결정을 내릴 때 논리적인 타당성보다는 사람들의 마음이 상하지 않는 쪽을 선택하는 편인가요?', factor: 'TF', weight: 1, category: '대인 관계 양식' },
    { id: 11, text: '다른 사람의 어려움을 들으면 마치 내 일처럼 마음이 쓰여서 즉석에서 도움을 주려 하시나요?', factor: 'TF', weight: 1, category: '대인 관계 양식' },
    { id: 12, text: '갈등 상황이 생기면 내 의견이 맞더라도 관계 회복을 위해 먼저 양보하는 경우가 많으신가요?', factor: 'TF', weight: 1, category: '대인 관계 양식' },

    // 4. 성실성/판단 (Conscientiousness/Judging - J/P)
    { id: 13, text: '약속 시간이나 마감 기한은 어떠한 상황에서도 꼭 지키려 노력하는 정석적인 스타일인가요?', factor: 'JP', weight: 1, category: '목표 지향성' },
    { id: 14, text: '여행을 갈 때 방문할 장소와 시간을 미리 꼼꼼하게 계획해두어야 마음이 편안하신가요?', factor: 'JP', weight: 1, category: '목표 지향성' },
    { id: 15, text: '물건은 항상 정해진 제자리에 위치해 있어야 하며, 주변 환경이 정돈되어 있는 것을 선호하시나요?', factor: 'JP', weight: 1, category: '목표 지향성' },
    { id: 16, text: '해야 할 일은 미루지 않고 즉시 처리하며, 계획대로 일정이 진행될 때 가장 높은 효율을 느끼시나요?', factor: 'JP', weight: 1, category: '목표 지향성' },

    // 5. 정직-겸손성 (Honesty-Humility - HEXACO H)
    { id: 17, text: '남들이 모를 수 있는 작은 이득이라도 부당한 방식이라면 포기하는 것이 당연하다고 생각하시나요?', factor: 'H', weight: 1, category: '도덕적 가치' },
    { id: 18, text: '성공의 가치는 높은 지위나 돈보다는 내가 지켜낸 신의와 양심에 있다고 믿으시나요?', factor: 'H', weight: 1, category: '도덕적 가치' },
    { id: 19, text: '내가 남들보다 특별히 더 우월하거나 대접받아야 할 존재라고 생각하지 않으시나요?', factor: 'H', weight: 1, category: '도덕적 가치' },
    { id: 20, text: '실수를 했을 때 체면을 차리기보다 정직하게 인정하고 사과하는 편인가요?', factor: 'H', weight: 1, category: '도덕적 가치' },

    // 6. 신경증/감성 (Neuroticism/Emotionality - OCEAN N)
    { id: 21, text: '작은 일에도 걱정이 많거나 스트레스 상황에 직면하면 금방 불안함을 느끼시나요?', factor: 'N', weight: 1, category: '정서적 안정성' },
    { id: 22, text: '주변 환경이나 타인의 말 한마디에 내 기분이 쉽게 좌우되거나 감정 기복이 있는 편인가요?', factor: 'N', weight: 1, category: '정서적 안정성' },
    { id: 23, text: '중요한 일을 앞두고 실패하거나 잘못될까 봐 잠을 설치거나 고민에 빠질 때가 많으신가요?', factor: 'N', weight: 1, category: '정서적 안정성' },
    { id: 24, text: '부정적인 상황이 닥치면 다시 평정심을 찾는 데 어느 정도 시간이 필요한 편인가요?', factor: 'N', weight: 1, category: '정서적 안정성' },
];

const PersonalityTest = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [scores, setScores] = useState({
        EI: 0, SN: 0, TF: 0, JP: 0, H: 0, N: 0
    });
    const [isAnimating, setIsAnimating] = useState(false);

    const handleAnswer = useCallback((val) => {
        if (isAnimating) return;

        setIsAnimating(true);
        const q = questions[currentStep];
        const newScores = { ...scores, [q.factor]: scores[q.factor] + (val * q.weight) };
        setScores(newScores);

        setTimeout(() => {
            if (currentStep < questions.length - 1) {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            } else {
                // MBTI 산출 알고리즘
                const mbti =
                    (newScores.EI >= 0 ? 'E' : 'I') +
                    (newScores.SN >= 0 ? 'N' : 'S') +
                    (newScores.TF >= 0 ? 'F' : 'T') +
                    (newScores.JP >= 0 ? 'J' : 'P');

                // OCEAN(Big Five) 정규화 데이터 (0-100)
                const oceanData = {
                    O: Math.min(100, Math.max(0, 50 + (newScores.SN * 12.5))),
                    C: Math.min(100, Math.max(0, 50 + (newScores.JP * 12.5))),
                    E: Math.min(100, Math.max(0, 50 + (newScores.EI * 12.5))),
                    A: Math.min(100, Math.max(0, 50 + (newScores.TF * 12.5))),
                    N: Math.min(100, Math.max(0, 50 + (newScores.N * 12.5))),
                    H: Math.min(100, Math.max(0, 50 + (newScores.H * 12.5))),
                };

                setIsAnimating(false);
                onComplete(oceanData, mbti);
            }
        }, 150); // 300ms → 150ms로 단축
    }, [currentStep, scores, isAnimating, onComplete]);

    const progress = ((currentStep + 1) / questions.length) * 100;
    const currentQuestion = questions[currentStep];

    return (
        <div className="test-page-container" style={{ padding: '20px 0' }}>
            <div className="glass-card" style={{
                padding: '3rem 2.5rem',
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center',
                minHeight: '650px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Progress Header */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)',
                                letterSpacing: '0.1rem', textTransform: 'uppercase'
                            }}>
                                Section {Math.floor(currentStep / 4) + 1}: {currentQuestion.category}
                            </span>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {currentStep + 1} / {questions.length}
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '10px' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                                borderRadius: '10px',
                                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
                            }}
                        />
                    </div>
                </div>

                {/* Question Area with AnimatePresence */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <h2 style={{
                                fontSize: '2.1rem',
                                lineHeight: 1.4,
                                fontWeight: 800,
                                wordBreak: 'keep-all',
                                color: 'var(--text)',
                                marginBottom: '50px',
                                maxWidth: '90%',
                                margin: '0 auto 50px'
                            }}>
                                {currentQuestion.text}
                            </h2>

                            {/* Answer Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
                                {[
                                    { label: '아주 그렇다', val: 2, color: 'var(--primary-faint)', border: 'var(--primary)' },
                                    { label: '어느 정도 그렇다', val: 1, color: 'var(--primary-faint)', border: 'rgba(139, 92, 246, 0.2)' },
                                    { label: '보통이다', val: 0, color: 'var(--background)', border: 'var(--glass-border)' },
                                    { label: '별로 그렇지 않다', val: -1, color: 'var(--secondary-faint)', border: 'rgba(236, 72, 153, 0.2)' },
                                    { label: '전혀 그렇지 않다', val: -2, color: 'var(--secondary-faint)', border: 'var(--secondary)' },
                                ].map((opt) => (
                                    <motion.button
                                        key={opt.label}
                                        whileHover={{ scale: 1.02, backgroundColor: 'white', borderColor: 'var(--primary)' }}
                                        whileTap={{ scale: 0.98 }}
                                        className="answer-button"
                                        style={{
                                            background: opt.color,
                                            padding: '20px',
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            border: `2px solid ${opt.border}`,
                                            borderRadius: '16px',
                                            color: 'var(--text)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onClick={() => handleAnswer(opt.val)}
                                    >
                                        {opt.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Subtle Text */}
                <div style={{ marginTop: '30px', opacity: 0.5, fontSize: '0.8rem' }}>
                    모든 답변은 솔직할수록 더 정확한 인연을 만날 확률이 높습니다.
                </div>
            </div>
        </div>
    );
};

export default PersonalityTest;
