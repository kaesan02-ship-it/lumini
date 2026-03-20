import React, { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';

// 루미니 소울 진단 — 학술 용어를 숨기고 감성적 카테고리로 표현
const questions = [
    // 1. 외향성 (EI) → "사교성"
    { id: 1, text: '처음 만나는 사람들과의 대화에서도 자연스럽게 이야기를 이끌어가나요?', factor: 'EI', weight: 1, category: '사교성' },
    { id: 2, text: '혼자만의 시간보다 사람들과 함께할 때 더 큰 활력을 얻나요?', factor: 'EI', weight: 1, category: '사교성' },
    { id: 3, text: '여러 사람 앞에서 내 이야기를 전달하는 것이 편안하게 느껴지나요?', factor: 'EI', weight: 1, category: '사교성' },
    { id: 4, text: '쉬는 날에는 조용히 쉬기보다 밖에 나가 활동적으로 보내고 싶나요?', factor: 'EI', weight: 1, category: '사교성' },

    // 2. 개방성/직관 (SN) → "사고의 유연성"
    { id: 5, text: '현실적인 방법보다 새로운 아이디어를 떠올리는 것이 더 재미있나요?', factor: 'SN', weight: 1, category: '사고의 유연성' },
    { id: 6, text: '이야기 속에 숨겨진 의미나 상징을 찾아내는 것을 좋아하나요?', factor: 'SN', weight: 1, category: '사고의 유연성' },
    { id: 7, text: '익숙한 방식보다 새로운 시도를 해보는 것이 더 설레나요?', factor: 'SN', weight: 1, category: '사고의 유연성' },
    { id: 8, text: '가끔 상상의 세계에 빠져들어 시간 가는 줄 모를 때가 있나요?', factor: 'SN', weight: 1, category: '사고의 유연성' },

    // 3. 우호성/공감 (TF) → "따뜻한 공감"
    { id: 9, text: '주변 사람들의 감정 변화를 빠르게 알아채고 공감해주려고 하나요?', factor: 'TF', weight: 1, category: '따뜻한 공감' },
    { id: 10, text: '결정을 내릴 때 논리보다 사람들의 마음이 더 중요하게 느껴지나요?', factor: 'TF', weight: 1, category: '따뜻한 공감' },
    { id: 11, text: '누군가 힘들어하면 나도 모르게 마음이 쓰여서 도움을 주고 싶어지나요?', factor: 'TF', weight: 1, category: '따뜻한 공감' },
    { id: 12, text: '갈등이 생기면 내가 맞더라도 관계를 위해 양보하는 편인가요?', factor: 'TF', weight: 1, category: '따뜻한 공감' },

    // 4. 성실성/판단 (JP) → "계획적인 삶"
    { id: 13, text: '약속 시간이나 마감일은 어떤 상황에서도 꼭 지키려고 노력하나요?', factor: 'JP', weight: 1, category: '계획적인 삶' },
    { id: 14, text: '여행이나 계획을 세울 때 미리 꼼꼼하게 준비해야 마음이 편한가요?', factor: 'JP', weight: 1, category: '계획적인 삶' },
    { id: 15, text: '물건이 정해진 자리에 있고 주변이 정돈되어 있는 것을 선호하나요?', factor: 'JP', weight: 1, category: '계획적인 삶' },
    { id: 16, text: '해야 할 일은 미루지 않고 바로 처리하는 편인가요?', factor: 'JP', weight: 1, category: '계획적인 삶' },

    // 5. 정직-겸손성 (H) → "정직과 신뢰"
    { id: 17, text: '아무도 모르는 작은 이득이라도 부당하다면 포기하는 것이 맞다고 느끼나요?', factor: 'H', weight: 1, category: '정직과 신뢰' },
    { id: 18, text: '성공의 가치는 지위나 돈보다 내가 지켜낸 신의에 있다고 생각하나요?', factor: 'H', weight: 1, category: '정직과 신뢰' },
    { id: 19, text: '나 자신이 남들보다 특별히 더 대접받아야 한다고 생각하지 않나요?', factor: 'H', weight: 1, category: '정직과 신뢰' },
    { id: 20, text: '잘못했을 때 체면보다 정직하게 인정하고 사과하는 편인가요?', factor: 'H', weight: 1, category: '정직과 신뢰' },

    // 6. 감성적 안정 (N) → "정서적 회복탄력성"
    { id: 21, text: '작은 일에도 걱정이 많거나 불안함을 쉽게 느끼는 편인가요?', factor: 'N', weight: 1, category: '정서적 회복탄력성' },
    { id: 22, text: '다른 사람의 말 한마디에 기분이 쉽게 좌우되는 편인가요?', factor: 'N', weight: 1, category: '정서적 회복탄력성' },
    { id: 23, text: '중요한 일을 앞두고 실패할까 봐 잠을 설치거나 고민에 빠지나요?', factor: 'N', weight: 1, category: '정서적 회복탄력성' },
    { id: 24, text: '부정적인 상황 후 평정심을 되찾는 데 시간이 꽤 필요한가요?', factor: 'N', weight: 1, category: '정서적 회복탄력성' },
];

const answerOptions = [
    { label: '완전 그래요', val: 2, emoji: '🔥' },
    { label: '어느 정도요', val: 1, emoji: '✨' },
    { label: '보통이에요', val: 0, emoji: '🌙' },
    { label: '별로요', val: -1, emoji: '🌿' },
    { label: '전혀 아니에요', val: -2, emoji: '🧊' },
];

const PersonalityTest = ({ onComplete, onBack }) => {
    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem('lumini_test_progress');
        if (saved) {
            try {
                const { currentStep } = JSON.parse(saved);
                return currentStep || 0;
            } catch (e) { return 0; }
        }
        return 0;
    });
    const [scores, setScores] = useState(() => {
        const saved = localStorage.getItem('lumini_test_progress');
        if (saved) {
            try {
                const { scores } = JSON.parse(saved);
                return scores || { EI: 0, SN: 0, TF: 0, JP: 0, H: 0, N: 0 };
            } catch (e) { return { EI: 0, SN: 0, TF: 0, JP: 0, H: 0, N: 0 }; }
        }
        return { EI: 0, SN: 0, TF: 0, JP: 0, H: 0, N: 0 };
    });

    // 진행 상황 자동 저장
    React.useEffect(() => {
        if (currentStep > 0) {
            localStorage.setItem('lumini_test_progress', JSON.stringify({ currentStep, scores }));
        }
    }, [currentStep, scores]);

    // 완료 시 저장 데이터 삭제
    const clearProgress = () => {
        localStorage.removeItem('lumini_test_progress');
    };

    const handleAnswer = useCallback((val) => {
        const q = questions[currentStep];
        const newScores = { ...scores, [q.factor]: scores[q.factor] + (val * q.weight) };
        setScores(newScores);

        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            const mbti =
                (newScores.EI >= 0 ? 'E' : 'I') +
                (newScores.SN >= 0 ? 'N' : 'S') +
                (newScores.TF >= 0 ? 'F' : 'T') +
                (newScores.JP >= 0 ? 'J' : 'P');

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
    }, [currentStep, scores, onComplete]);

    const handleGoBack = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else if (onBack) {
            onBack();
        }
    }, [currentStep, onBack]);

    const progress = ((currentStep + 1) / questions.length) * 100;
    const currentQuestion = questions[currentStep];

    return (
        <div style={{ padding: '20px 5%', maxWidth: '700px', margin: '0 auto' }}>
            <div className="glass-card" style={{
                padding: 'clamp(1.5rem, 4vw, 3rem)',
                textAlign: 'center',
                minHeight: '520px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Progress Header */}
                <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <button
                            onClick={handleGoBack}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                background: 'transparent', border: 'none',
                                color: 'var(--text-muted)', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: 600, padding: '4px 8px',
                                borderRadius: '8px'
                            }}
                        >
                            <ArrowLeft size={16} />
                            {currentStep > 0 ? '이전' : '나가기'}
                        </button>

                        <span style={{
                            fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)',
                            letterSpacing: '0.08rem'
                        }}>
                            {currentQuestion.category}
                        </span>

                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {currentStep + 1} / {questions.length}
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--glass-border)', borderRadius: '10px' }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                            borderRadius: '10px',
                            transition: 'width 0.15s ease-out'
                        }} />
                    </div>
                </div>

                {/* Question */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.2rem, 3.5vw, 1.7rem)',
                        lineHeight: 1.6,
                        fontWeight: 800,
                        wordBreak: 'keep-all',
                        color: 'var(--text)',
                        margin: '0 auto 30px',
                        maxWidth: '95%'
                    }}>
                        {currentQuestion.text}
                    </h2>

                    {/* Answers */}
                    <div style={{ display: 'grid', gap: '8px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                        {answerOptions.map((opt) => (
                            <button
                                key={opt.label}
                                className="answer-button"
                                style={{
                                    background: 'var(--surface)',
                                    padding: 'clamp(12px, 2vw, 16px) 18px',
                                    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                                    fontWeight: 600,
                                    border: '2px solid var(--glass-border)',
                                    borderRadius: '14px',
                                    color: 'var(--text)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s, border-color 0.1s, background 0.1s',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.background = 'var(--primary-faint)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                    e.currentTarget.style.background = 'var(--surface)';
                                }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onClick={() => handleAnswer(opt.val)}
                            >
                                <span style={{ fontSize: '1rem' }}>{opt.emoji}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '20px', opacity: 0.4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    솔직할수록 더 정확한 인연을 찾아드립니다 ✨
                </div>
            </div>
        </div>
    );
};

export default PersonalityTest;
