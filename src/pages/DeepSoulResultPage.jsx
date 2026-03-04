import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, RefreshCcw, Download } from 'lucide-react';
import { DEEP_QUESTIONS, DEEP_CATEGORIES } from '../data/deepQuestions';
import { getDeepSoulType, buildCatScores } from '../data/deepSoulTypes';
import PersonalityExplanation from '../components/PersonalityExplanation';

const SCALE_LABELS = ['전혀 그렇지 않음', '그렇지 않음', '보통', '그런 편', '매우 그러함'];
const SCALE_COLORS = ['#64748B', '#8B5CF6', '#6366F1', '#EC4899', '#F59E0B'];

const TENDENCY_META = {
    high: { bar: '█████', pos: '오른쪽', bgPct: 85 },
    neutral: { bar: '███░░', pos: '중립', bgPct: 50 },
    low: { bar: '██░░░', pos: '왼쪽', bgPct: 18 },
};

const DeepSoulResultPage = ({ onBack, onRetake, onNavigate }) => {
    const cardRef = useRef(null);

    // 딥 소울 응답
    const answers = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('lumini_deep_soul') || '{}'); }
        catch { return {}; }
    }, []);

    // 기본 성향 리포트 9지표
    const baseRaw = localStorage.getItem('lumini_user_data');
    const baseUserData = baseRaw ? JSON.parse(baseRaw) : null;

    const chartData = useMemo(() => {
        if (!baseUserData) return [];
        const O = baseUserData.O || 0, C = baseUserData.C || 0, E = baseUserData.E || 0;
        const A = baseUserData.A || 0, N = baseUserData.N || 0, H = baseUserData.H || 50;
        return [
            { subject: '사교성', A: Math.round(E) },
            { subject: '창의성', A: Math.round((O * 0.6 + E * 0.4)) },
            { subject: '공감력', A: Math.round((A * 0.6 + (100 - N) * 0.4)) },
            { subject: '계획성', A: Math.round(C) },
            { subject: '자기주도', A: Math.round((C * 0.55 + H * 0.45)) },
            { subject: '유연성', A: Math.round(O) },
            { subject: '따뜻함', A: Math.round(A) },
            { subject: '회복탄력', A: Math.round(100 - N) },
            { subject: '신뢰도', A: Math.round(H) },
        ];
    }, [baseUserData]);

    const hasData = Object.keys(answers).length > 0;

    const catStats = useMemo(() => {
        if (!hasData) return [];
        const scores = buildCatScores(answers, DEEP_QUESTIONS);
        return DEEP_CATEGORIES.map(cat => {
            const catQs = DEEP_QUESTIONS.filter(q => q.category === cat.id);
            const answered = catQs.filter(q => answers[q.id] !== undefined);
            const score = scores[cat.id] ?? 50;
            const type = getDeepSoulType(cat.id, score);
            return { ...cat, questions: catQs, answered: answered.length, score, type };
        });
    }, [answers, hasData]);

    const soulCode = useMemo(() => {
        if (!hasData) return '';
        const map = { relationship: { high: 'C', neutral: 'B', low: 'I' }, lifestyle: { high: 'P', neutral: 'F', low: 'S' }, family: { high: 'T', neutral: 'O', low: 'L' }, values: { high: 'E', neutral: 'M', low: 'V' } };
        return catStats.map(c => (map[c.id] || {})[c.type.tendency] || '?').join('');
    }, [catStats, hasData]);

    const handleSaveCard = () => {
        if (!hasData) return;
        const svgLines = catStats.map((cat, i) =>
            `<text x="30" y="${180 + i * 50}" font-size="15" fill="${cat.color}" font-weight="bold">${cat.emoji} ${cat.label}</text>
             <text x="30" y="${200 + i * 50}" font-size="13" fill="#555">${cat.type.label} — ${cat.type.desc}</text>`
        ).join('');

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="420" style="background:#f8f9ff;border-radius:20px">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#4F46E5"/>
                    <stop offset="100%" stop-color="#7C3AED"/>
                </linearGradient>
            </defs>
            <rect width="560" height="90" fill="url(#g)" rx="20"/>
            <text x="30" y="40" font-size="26" fill="white" font-weight="900">💎 딥 소울 프로필</text>
            <text x="30" y="72" font-size="16" fill="rgba(255,255,255,0.85)">나의 가치관 유형 코드: ${soulCode}</text>
            <text x="30" y="150" font-size="14" fill="#888">카테고리별 유형</text>
            ${svgLines}
            <text x="30" y="400" font-size="11" fill="#bbb">루미니 딥 소울 • ${new Date().toLocaleDateString('ko-KR')}</text>
        </svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumini_deep_soul_${soulCode}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!hasData) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '420px', width: '100%', background: 'var(--surface)' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>💎</div>
                    <h3 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '12px' }}>딥 소울 검사를 아직 하지 않으셨어요</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>가족관, 연애관, 가치관까지 더 잘 맞는 인연을 찾아보세요.</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('deep-soul-test')}
                        className="primary" style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 800 }}
                    >
                        💎 검사 시작하기
                    </motion.button>
                    <button onClick={onBack} style={{ width: '100%', padding: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700, marginTop: '8px', cursor: 'pointer' }}>
                        나중에 하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '60px' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '14px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>
                    <ArrowLeft size={18} /> 돌아가기
                </button>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💎 딥 소울 <span style={{ color: '#4F46E5' }}>결과 리포트</span>
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleSaveCard} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '14px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                        <Download size={16} /> 저장
                    </button>
                    <button onClick={() => { if (window.confirm('기존 결과가 삭제되고 새로 검사합니다. 진행할까요?')) { localStorage.removeItem('lumini_deep_soul'); onRetake(); } }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '14px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>
                        <RefreshCcw size={16} /> 재검사
                    </button>
                </div>
            </header>

            <div ref={cardRef}>
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '40px', background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', color: 'white', borderRadius: '32px', boxShadow: '0 20px 40px rgba(49, 46, 129, 0.2)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💎</div>
                    <div style={{ fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', marginBottom: '6px' }}>나의 가치관 유형 코드</div>
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '0.15em', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{soulCode}</h1>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', marginTop: '20px', maxWidth: '500px', margin: '20px auto 0' }}>세부적인 가치관까지 맞는 인연을 찾을 확률이 <strong>3배</strong> 이상 높아졌습니다.</p>
                </div>

                <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                    {catStats.map(cat => {
                        const tm = TENDENCY_META[cat.type.tendency];
                        return (
                            <motion.div key={cat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '22px 24px', borderRadius: '20px', background: 'var(--surface)', border: `1.5px solid ${cat.color}25`, overflow: 'hidden', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `${cat.color}08`, borderRadius: '50%', transform: 'translate(30%,-30%)' }} />
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '1.8rem', width: '48px', height: '48px', borderRadius: '14px', background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {cat.type.emoji}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: cat.color, fontWeight: 800, letterSpacing: '0.06em', marginBottom: '3px' }}>{cat.emoji} {cat.label.toUpperCase()}</div>
                                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>{cat.type.label}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: cat.color, background: `${cat.color}15`, padding: '4px 12px', borderRadius: '100px' }}>
                                            {cat.answered}/{cat.questions.length}문항
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>{cat.type.desc}</p>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                                        <span>{cat.questions[0]?.low || '낮음'}</span>
                                        <span>{cat.questions[0]?.high || '높음'}</span>
                                    </div>
                                    <div style={{ position: 'relative', height: '8px', background: `${cat.color}15`, borderRadius: '100px', overflow: 'hidden' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${tm.bgPct}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ height: '100%', background: `linear-gradient(90deg, ${cat.color}50, ${cat.color})`, borderRadius: '100px' }} />
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.72rem', color: cat.color, fontWeight: 700 }}>
                                        {tm.pos === '중립' ? '⚖️ 중립 · 유연 성향' : tm.pos === '오른쪽' ? '▶ 강한 성향' : '◀ 강한 성향'}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <CategoryDetails catStats={catStats} answers={answers} />

                <div style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #4F46E510, #7C3AED08)', border: '1.5px solid #7C3AED20', textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
                    <CheckCircle size={28} color="#6366F1" style={{ marginBottom: '10px' }} />
                    <h4 style={{ fontWeight: 900, color: '#6366F1', marginBottom: '8px' }}>딥 소울 매칭이 활성화됩니다</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        같은 딥 소울 검사를 완료한 상대방과 <strong style={{ color: '#6366F1' }}>가치관 유형 호환도</strong>를 확인할 수 있어요.
                    </p>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} className="primary" onClick={onBack} style={{ width: '100%', padding: '18px', fontWeight: 800, fontSize: '1rem', marginBottom: '40px' }}>
                    대시보드로 돌아가기
                </motion.button>
            </div>

            {/* 9지표 상세 설명 */}
            {chartData && chartData.length > 0 && (
                <PersonalityExplanation data={chartData} />
            )}
        </motion.div>
    );
};

const CategoryDetails = ({ catStats, answers }) => {
    const [open, setOpen] = React.useState(null);
    return (
        <div style={{ display: 'grid', gap: '8px' }}>
            {catStats.map(cat => (
                <div key={cat.id} style={{ borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <button onClick={() => setOpen(open === cat.id ? null : cat.id)} style={{ width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{cat.emoji} {cat.label} 상세 응답</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{open === cat.id ? '▲' : '▼'}</span>
                    </button>
                    {open === cat.id && (
                        <div style={{ padding: '12px 16px 16px', background: 'var(--background)', display: 'grid', gap: '10px' }}>
                            {cat.questions.map(q => {
                                const ans = answers[q.id];
                                if (ans === undefined) return null;
                                return (
                                    <div key={q.id} style={{ padding: '10px 14px', borderRadius: '12px', background: 'var(--surface)', border: `1px solid ${cat.color}20` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text)', flex: 1, lineHeight: 1.5 }}>
                                                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{q.low}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> ↔ </span>
                                                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{q.high}</span>
                                            </div>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: SCALE_COLORS[ans], background: `${SCALE_COLORS[ans]}18`, padding: '3px 10px', borderRadius: '100px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                {SCALE_LABELS[ans]}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginTop: '6px', fontWeight: 600 }}>{q.text}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DeepSoulResultPage;
