import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { DEEP_QUESTIONS, DEEP_CATEGORIES, TOTAL_DEEP_QUESTIONS } from '../data/deepQuestions';
import { supabase } from '../supabase/client';

const SCALE_LABELS = ['전혀 그렇지 않음', '그렇지 않음', '보통', '그런 편', '매우 그러함'];

const DeepSoulTestPage = ({ onComplete, onBack }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showIntro, setShowIntro] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);

    const currentQ = DEEP_QUESTIONS[currentIdx];
    const currentCat = DEEP_CATEGORIES.find(c => c.id === currentQ?.category);
    const progress = Object.keys(answers).length / TOTAL_DEEP_QUESTIONS;

    const handleAnswer = useCallback((val) => {
        setSelectedValue(val);
        setTimeout(() => {
            const newAnswers = { ...answers, [currentQ.id]: val };
            setAnswers(newAnswers);
            setSelectedValue(null);
            if (currentIdx < TOTAL_DEEP_QUESTIONS - 1) {
                setCurrentIdx(prev => prev + 1);
            } else {
                setShowResult(true);
            }
        }, 300);
    }, [currentIdx, answers, currentQ]);

    const handleBack = () => {
        if (currentIdx > 0) {
            setCurrentIdx(prev => prev - 1);
        } else {
            onBack?.();
        }
    };

    const handleComplete = async () => {
        // localStorage에 저장
        localStorage.setItem('lumini_deep_soul', JSON.stringify(answers));
        
        // Supabase에 동기화 시도
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ deep_soul: answers })
                    .eq('id', user.id);
                
                if (error) throw error;
                console.log('Deep Soul synced to Supabase');
            }
        } catch (err) {
            console.error('Deep Soul sync error:', err);
        }

        onComplete?.(answers);
    };

    // 인트로 화면
    if (showIntro) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ maxWidth: '520px', width: '100%' }}
                >
                    <div className="glass-card" style={{ padding: '48px 40px', textAlign: 'center', background: 'var(--surface)' }}>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            style={{ fontSize: '4rem', marginBottom: '24px', display: 'inline-block' }}
                        >
                            💎
                        </motion.div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: '12px' }}>
                            딥 소울 검사
                        </h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '30px', fontSize: '1.05rem' }}>
                            평소에는 물어보기 힘든 것들을 솔직하게 답해보세요.<br />
                            <strong style={{ color: 'var(--primary)' }}>가족관, 연애 스타일, 라이프스타일, 가치관</strong>까지—<br />
                            진정 맞는 인연을 찾아드립니다.
                        </p>

                        {/* 카테고리 미리보기 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                            {DEEP_CATEGORIES.map(cat => (
                                <div key={cat.id} style={{
                                    padding: '16px', borderRadius: '16px',
                                    background: `${cat.color}12`,
                                    border: `1.5px solid ${cat.color}30`,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{cat.emoji}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: cat.color }}>{cat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '28px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <Sparkles size={16} color="var(--primary)" />
                            약 5~7분 소요 · 총 {TOTAL_DEEP_QUESTIONS}문항 · 언제든 중단 가능
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="primary"
                            onClick={() => setShowIntro(false)}
                            style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            💎 딥 소울 검사 시작하기
                            <ArrowRight size={20} />
                        </motion.button>

                        <button
                            onClick={onBack}
                            style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            나중에 할게요
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 결과 화면
    if (showResult) {
        const completedCats = DEEP_CATEGORIES.map(cat => {
            const catQs = DEEP_QUESTIONS.filter(q => q.category === cat.id);
            const answered = catQs.filter(q => answers[q.id] !== undefined).length;
            const avgScore = catQs.length > 0
                ? Math.round(catQs.reduce((s, q) => s + (answers[q.id] || 2), 0) / catQs.length * 25)
                : 50;
            return { ...cat, answered, total: catQs.length, avgScore };
        });

        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '520px', width: '100%' }}
                >
                    <div className="glass-card" style={{ padding: '48px 40px', textAlign: 'center', background: 'var(--surface)' }}>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                            style={{ fontSize: '4rem', marginBottom: '20px' }}
                        >
                            🎉
                        </motion.div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>
                            딥 소울 검사 완료!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                            이제 <strong style={{ color: 'var(--primary)' }}>딥 소울 매칭</strong>이 활성화됩니다.<br />
                            가치관이 맞는 인연을 더 정확하게 찾아드릴게요.
                        </p>

                        {/* 카테고리별 결과 요약 */}
                        <div style={{ display: 'grid', gap: '12px', marginBottom: '32px', textAlign: 'left' }}>
                            {completedCats.map(cat => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        background: `${cat.color}10`,
                                        border: `1.5px solid ${cat.color}30`,
                                        display: 'flex', alignItems: 'center', gap: '14px'
                                    }}
                                >
                                    <span style={{ fontSize: '1.8rem' }}>{cat.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '6px' }}>{cat.label}</div>
                                        <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '100px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cat.avgScore}%` }}
                                                transition={{ duration: 0.8, delay: 0.2 }}
                                                style={{ height: '100%', background: cat.color, borderRadius: '100px' }}
                                            />
                                        </div>
                                    </div>
                                    <CheckCircle size={20} color={cat.color} />
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="primary"
                            onClick={handleComplete}
                            style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: 800 }}
                        >
                            💎 딥 소울 매칭 시작하기
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 질문 화면
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <button
                        onClick={handleBack}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={16} />
                        {currentIdx > 0 ? '이전' : '나가기'}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>{currentCat?.emoji}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: currentCat?.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {currentCat?.label}
                        </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {currentIdx + 1} / {TOTAL_DEEP_QUESTIONS}
                    </span>
                </div>

                {/* 프로그레스 바 */}
                <div style={{ height: '5px', background: 'var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div
                        animate={{ width: `${progress * 100}%` }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${currentCat?.color || '#8B5CF6'}, #EC4899)`, borderRadius: '10px' }}
                        transition={{ duration: 0.2 }}
                    />
                </div>
            </div>

            {/* 질문 카드 */}
            <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="glass-card" style={{ padding: '40px', background: 'var(--surface)', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
                            {/* 카테고리 칩 */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '6px 14px', borderRadius: '20px', marginBottom: '24px', alignSelf: 'flex-start',
                                background: `${currentCat?.color}15`, border: `1.5px solid ${currentCat?.color}30`
                            }}>
                                <span>{currentCat?.emoji}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: currentCat?.color }}>{currentCat?.description}</span>
                            </div>

                            {/* 질문 텍스트 */}
                            <h2 style={{
                                fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)', lineHeight: 1.65,
                                fontWeight: 800, color: 'var(--text)', wordBreak: 'keep-all',
                                flex: 1, display: 'flex', alignItems: 'center'
                            }}>
                                {currentQ.text}
                            </h2>

                            {/* 척도 선택기 */}
                            <div style={{ marginTop: '32px' }}>
                                {/* 양쪽 라벨 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, maxWidth: '40%', textAlign: 'left' }}>{currentQ.low}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, maxWidth: '40%', textAlign: 'right' }}>{currentQ.high}</span>
                                </div>

                                {/* 5점 척도 버튼 — grid 균등 배치 */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gap: '8px',
                                    width: '100%',
                                }}>
                                    {[0, 1, 2, 3, 4].map(val => {
                                        const isSelected = selectedValue === val || answers[currentQ.id] === val;
                                        const COLORS = ['#64748B', '#8B5CF6', '#6366F1', '#EC4899', '#F59E0B'];
                                        const SIZE = 48; // 모든 버튼 동일 크기
                                        return (
                                            <div key={val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.12, y: -2 }}
                                                    whileTap={{ scale: 0.88 }}
                                                    onClick={() => handleAnswer(val)}
                                                    title={SCALE_LABELS[val]}
                                                    style={{
                                                        width: `${SIZE}px`,
                                                        height: `${SIZE}px`,
                                                        borderRadius: '50%',
                                                        border: `2.5px solid ${isSelected ? COLORS[val] : 'var(--glass-border)'}`,
                                                        background: isSelected
                                                            ? COLORS[val]
                                                            : `${COLORS[val]}12`,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        boxShadow: isSelected ? `0 4px 16px ${COLORS[val]}50` : 'none',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white' }} />
                                                    )}
                                                </motion.button>
                                                {/* 척도 라벨 */}
                                                <span style={{
                                                    fontSize: '0.6rem', color: isSelected ? COLORS[val] : 'var(--text-muted)',
                                                    textAlign: 'center', fontWeight: isSelected ? 800 : 500,
                                                    lineHeight: 1.3, wordBreak: 'keep-all'
                                                }}>
                                                    {SCALE_LABELS[val]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 하단 힌트 */}
            <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.6 }}>
                솔직할수록 더 잘 맞는 인연을 만납니다 💎
            </div>
        </div>
    );
};

export default DeepSoulTestPage;
