import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 검증된 성격 모델(MBTI, OCEAN, HEXACO) 기반 24문항 정밀 데이터셋
// 사용자에게는 질문 텍스트만 노출되며, 개발용 지표(E/I, S/N 등)는 내부 데이터로만 관리합니다.
const questions = [
    // 1. 외향성 (Extraversion - E/I)
    { id: 1, text: '처음 만나는 사람들과의 대화에서도 어색함 없이 대화를 잘 이끄시나요?', factor: 'EI', weight: 1 },
    { id: 2, text: '혼자서 시간을 보내는 것보다 사람들과 함께 어울릴 때 더 큰 활력을 얻으시나요?', factor: 'EI', weight: 1 },
    { id: 3, text: '여러 사람의 시선이 집중되는 자리에서도 긴장하지 않고 내 의견을 전달하는 것이 편한가요?', factor: 'EI', weight: 1 },
    { id: 4, text: '주말이나 여가 시간에는 조용히 쉬는 것보다 외부 활동이나 모임에 참여하는 것을 선호하시나요?', factor: 'EI', weight: 1 },

    // 2. 개방성/직관 (Openness/Intuition - S/N)
    { id: 5, text: '현실적인 해결책보다는 새롭고 창의적인 아이디어를 제안하는 것에 더 흥미를 느끼시나요?', factor: 'SN', weight: 1 },
    { id: 6, text: '영화나 책을 볼 때 줄거리 자체보다는 그 너머에 숨겨진 의미나 상징을 파악하려 노력하시나요?', factor: 'SN', weight: 1 },
    { id: 7, text: '익숙하고 정해진 방식대로 일하는 것보다 새로운 수단을 시도해 보는 것이 더 즐거우신가요?', factor: 'SN', weight: 1 },
    { id: 8, text: '가끔은 일어나지 않은 일에 대해 끊임없이 상상하며 시간 가는 줄 모르고 빠져드나요?', factor: 'SN', weight: 1 },

    // 3. 우호성/공감 (Agreeableness/Feeling - T/F)
    { id: 9, text: '주변 사람들의 기분이나 감정 변화를 빠르게 눈치채고 공감해 주려 노력하시나요?', factor: 'TF', weight: 1 },
    { id: 10, text: '어떤 결정을 내릴 때 논리적인 타당성보다는 사람들의 마음이 상하지 않는 쪽을 선택하는 편인가요?', factor: 'TF', weight: 1 },
    { id: 11, text: '다른 사람의 어려움을 들으면 마치 내 일처럼 마음이 쓰여서 즉석에서 도움을 주려 하시나요?', factor: 'TF', weight: 1 },
    { id: 12, text: '갈등 상황이 생기면 내 의견이 맞더라도 관계 회복을 위해 먼저 양보하는 경우가 많으신가요?', factor: 'TF', weight: 1 },

    // 4. 성실성/판단 (Conscientiousness/Judging - J/P)
    { id: 13, text: '약속 시간이나 마감 기한은 어떠한 상황에서도 꼭 지키려 노력하는 정석적인 스타일인가요?', factor: 'JP', weight: 1 },
    { id: 14, text: '여행을 갈 때 방문할 장소와 시간을 미리 꼼꼼하게 계획해두어야 마음이 편안하신가요?', factor: 'JP', weight: 1 },
    { id: 15, text: '물건은 항상 정해진 제자리에 위치해 있어야 하며, 주변 환경이 정돈되어 있는 것을 선호하시나요?', factor: 'JP', weight: 1 },
    { id: 16, text: '해야 할 일은 미루지 않고 즉시 처리하며, 계획대로 일정이 진행될 때 가장 높은 효율을 느끼시나요?', factor: 'JP', weight: 1 },

    // 5. 정직-겸손성 (Honesty-Humility - HEXACO H)
    { id: 17, text: '남들이 모를 수 있는 작은 이득이라도 부당한 방식이라면 포기하는 것이 당연하다고 생각하시나요?', factor: 'H', weight: 1 },
    { id: 18, text: '성공의 가치는 높은 지위나 돈보다는 내가 지켜낸 신의와 양심에 있다고 믿으시나요?', factor: 'H', weight: 1 },
    { id: 19, text: '내가 남들보다 특별히 더 우월하거나 대접받아야 할 존재라고 생각하지 않으시나요?', factor: 'H', weight: 1 },
    { id: 20, text: '실수를 했을 때 체면을 차리기보다 정직하게 인정하고 사과하는 편인가요?', factor: 'H', weight: 1 },

    // 6. 신경증/감성 (Neuroticism/Emotionality - OCEAN N)
    { id: 21, text: '작은 일에도 걱정이 많거나 스트레스 상황에 직면하면 금방 불안함을 느끼시나요?', factor: 'N', weight: 1 },
    { id: 22, text: '주변 환경이나 타인의 말 한마디에 내 기분이 쉽게 좌우되거나 감정 기복이 있는 편인가요?', factor: 'N', weight: 1 },
    { id: 23, text: '중요한 일을 앞두고 실패하거나 잘못될까 봐 잠을 설치거나 고민에 빠질 때가 많으신가요?', factor: 'N', weight: 1 },
    { id: 24, text: '부정적인 상황이 닥치면 다시 평정심을 찾는 데 어느 정도 시간이 필요한 편인가요?', factor: 'N', weight: 1 },
];

const PersonalityTest = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [scores, setScores] = useState({
        EI: 0, SN: 0, TF: 0, JP: 0, H: 0, N: 0
    });

    const handleAnswer = (val) => {
        const q = questions[currentStep];
        const newScores = { ...scores, [q.factor]: scores[q.factor] + (val * q.weight) };
        setScores(newScores);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
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

            onComplete(oceanData, mbti);
        }
    };

    return (
        <div className="glass-card" style={{
            padding: '4rem 3.5rem',
            maxWidth: '750px',
            margin: '20px auto 100px',
            textAlign: 'center',
            minHeight: '550px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {/* Progress Indicator */}
                    <div style={{ marginBottom: '45px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05rem' }}>PERSONALITY TEST</h3>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--text)' }}>{currentStep + 1}</span> / {questions.length}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                                style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))' }}
                            />
                        </div>
                    </div>

                    {/* Question Text */}
                    <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '1.85rem',
                            lineHeight: 1.45,
                            fontWeight: 700,
                            wordBreak: 'keep-all',
                            color: 'var(--text)',
                            maxWidth: '90%'
                        }}>
                            {questions[currentStep].text}
                        </h2>
                    </div>

                    {/* Answer Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                        {[
                            { label: '매우 그렇다', val: 2 },
                            { label: '그렇다', val: 1 },
                            { label: '보통이다', val: 0 },
                            { label: '그렇지 않다', val: -1 },
                            { label: '전혀 그렇지 않다', val: -2 },
                        ].map((opt) => (
                            <motion.button
                                key={opt.label}
                                whileHover={{ scale: 1.01, backgroundColor: '#fcfaff' }}
                                whileTap={{ scale: 0.99 }}
                                className="glass-card"
                                style={{
                                    background: 'white',
                                    padding: '22px',
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    border: '1px solid #edf2f7',
                                    color: 'var(--text)',
                                    cursor: 'pointer'
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
    );
};

export default PersonalityTest;
