import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import RadarChart from '../components/RadarChart';
import PersonalityExplanation from '../components/PersonalityExplanation';
import { getSoulType, getAllSoulTypes } from '../data/soulTypes';
import { getDeepSoulType, buildCatScores } from '../data/deepSoulTypes';
import { DEEP_QUESTIONS } from '../data/deepQuestions';
import { ArrowRight, Share2, Download, Heart, Users, Sparkles, Star, Zap, Shield, Brain, Flame } from 'lucide-react';

// 9개 지표 계산 함수
const buildChartData = (data) => {
    if (!data) return [];
    const O = data.O || 0, C = data.C || 0, E = data.E || 0;
    const A = data.A || 0, N = data.N || 0, H = data.H || 50;
    const creativity = Math.round((O * 0.6 + E * 0.4));
    const selfDrive = Math.round((C * 0.55 + H * 0.45));
    const empathy = Math.round((A * 0.6 + (100 - N) * 0.4));
    return [
        { subject: '사교성', A: Math.round(E), fullMark: 100 },
        { subject: '창의성', A: creativity, fullMark: 100 },
        { subject: '공감력', A: empathy, fullMark: 100 },
        { subject: '계획성', A: Math.round(C), fullMark: 100 },
        { subject: '자기주도', A: selfDrive, fullMark: 100 },
        { subject: '유연성', A: Math.round(O), fullMark: 100 },
        { subject: '따뜻함', A: Math.round(A), fullMark: 100 },
        { subject: '회복탄력', A: Math.round(100 - N), fullMark: 100 },
        { subject: '신뢰도', A: Math.round(H), fullMark: 100 },
    ];
};

// 성향 뱃지 생성
const getBadges = (data, soul) => {
    if (!data) return [];
    const badges = [];
    if ((data.E || 0) >= 75) badges.push({ icon: '⚡', label: '에너지 넘치는', color: '#F59E0B' });
    if ((data.O || 0) >= 75) badges.push({ icon: '🎨', label: '창의적인', color: '#8B5CF6' });
    if ((data.A || 0) >= 75) badges.push({ icon: '💛', label: '따뜻한 마음', color: '#EC4899' });
    if ((data.C || 0) >= 70) badges.push({ icon: '🎯', label: '계획의 달인', color: '#10B981' });
    if ((data.H || 50) >= 80) badges.push({ icon: '🛡️', label: '믿음직한', color: '#3B82F6' });
    if ((data.N || 0) <= 35) badges.push({ icon: '🧘', label: '평온한', color: '#06B6D4' });
    if ((data.E || 0) <= 35) badges.push({ icon: '📚', label: '사색하는', color: '#6366F1' });
    if (soul?.trait) badges.push({ icon: '✨', label: soul.trait, color: '#9333EA' });
    return badges.slice(0, 5);
};

// 스토리 카드 생성
const getStoryCards = (data, soul) => {
    if (!data || !soul) return [];
    const E = data.E || 0, O = data.O || 0, A = data.A || 0, C = data.C || 0, N = data.N || 0;
    return [
        {
            icon: '🌟',
            title: '나의 최대 강점',
            body: soul.trait
                ? `당신의 타고난 강점은 바로 ${soul.trait}입니다. ${E >= 60 ? '사람들과 어울리며 에너지를 얻고,' : '혼자만의 깊은 사색으로'} 세상을 바라보는 독특한 시각이 있어요.`
                : '당신만의 특별한 강점이 빛나고 있어요.',
            bg: '#F5F3FF', accent: '#8B5CF6'
        },
        {
            icon: '🤝',
            title: '대인관계 스타일',
            body: A >= 70
                ? '공감 능력이 뛰어나 상대방의 감정을 잘 읽어요. 갈등보다 화합을 선호하며, 주변 사람들에게 심리적 안정감을 줍니다.'
                : E >= 70
                    ? '사교적이고 활발해서 새로운 사람을 만나는 걸 즐겨요. 대화를 이끌어가는 능력이 탁월합니다.'
                    : '깊고 진실된 관계를 선호해요. 소수의 신뢰하는 사람과의 연결을 중요시합니다.',
            bg: '#FFF1F5', accent: '#EC4899'
        },
        {
            icon: '🚀',
            title: '성장 포인트',
            body: C <= 45
                ? '자유로운 영혼이지만, 작은 루틴 하나를 만들어보세요. 캘린더에 1가지만 기록하는 것부터 시작하면 계획성이 자연스럽게 늘어납니다.'
                : N >= 60
                    ? '감수성이 풍부한 만큼 스트레스도 많이 받을 수 있어요. 마음 챙김 연습이나 소울 성장 일지를 활용해보세요.'
                    : '이미 탄탄한 기반 위에 있어요. 새로운 사람과 대화하며 영역을 넓혀보세요.',
            bg: '#F0FFF4', accent: '#10B981'
        }
    ];
};

const ResultReport = ({ data, mbtiType, onExplore, onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('성향 에너지 분석 중...');
    const [activeStory, setActiveStory] = useState(0);
    const reportRef = useRef(null);

    const soul = getSoulType(mbtiType);
    const chartData = buildChartData(data);
    const badges = getBadges(data, soul);
    const storyCards = getStoryCards(data, soul);

    useEffect(() => {
        const messages = [
            '성향 정보 분석 중...',
            '9가지 지표 계산 중...',
            '페르소나 매칭 중...',
            '당신의 성향 카드 완성! ✨'
        ];
        let index = 0;
        const interval = setInterval(() => {
            index++;
            if (index < messages.length) {
                setLoadingText(messages[index]);
            } else {
                clearInterval(interval);
                setLoading(false);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Lumini 성향 분석',
                    text: `나는 ${soul.soulName}! 나와 잘 맞는 인연을 찾아보세요 ✨`,
                    url: window.location.href
                });
            } else {
                alert('링크가 클립보드에 복사되었습니다.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveCard = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // 고해상도 캡처
                backgroundColor: '#ffffff',
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `lumini_report_${mbtiType}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to save card:', error);
            alert('카드 저장 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} style={{ marginBottom: '40px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}>
                        <Sparkles size={50} color="white" />
                    </div>
                </motion.div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px' }}>{loadingText}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>당신만의 특별한 성격 리포트를 구성하고 있습니다.</p>
                <div style={{ width: '100%', maxWidth: '400px', height: '10px', background: '#f1f5f9', borderRadius: '5px', marginTop: '50px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.8 }} style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)' }} />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}
        >
            <div ref={reportRef} style={{ background: 'var(--background)' }}>
                {/* ===== PERSONA CARD Hero ===== */}
                <div className="glass-card" style={{ borderRadius: '32px', overflow: 'hidden', background: 'white', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.15)', marginBottom: '24px' }}>
                    <div style={{ padding: '60px 30px 40px', textAlign: 'center', background: `linear-gradient(180deg, ${soul.gradient?.[0] || '#f5f3ff'} 0%, #ffffff 100%)`, borderBottom: '1px solid var(--glass-border)' }}>
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 15 }} style={{ fontSize: '5.5rem', marginBottom: '20px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}>
                            {soul.emoji}
                        </motion.div>

                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>
                            {soul.soulName}
                        </h1>
                        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--primary-faint)', color: 'var(--primary)', borderRadius: '100px', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>
                            {soul.title}
                        </div>
                        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', wordBreak: 'keep-all' }}>
                            {soul.desc}
                        </p>

                        {/* 성향 뱃지 */}
                        {badges.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '22px' }}>
                                {badges.map((b, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '100px', background: `${b.color}18`, border: `1px solid ${b.color}40`, fontSize: '0.82rem', fontWeight: 700, color: b.color }}>
                                        <span>{b.icon}</span> {b.label}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ===== 9지표 레이더 + 스탯 바 ===== */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', padding: '32px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                            <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '28px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                <RadarChart data={chartData} size={300} />
                            </div>
                            <p style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>
                                ✦ 9가지 성향 지표 맵
                            </p>
                        </div>

                        <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px' }}>
                            <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                                ✨ 타고난 강점: {soul.trait}
                            </h3>
                            {chartData.slice(0, 6).map(stat => (
                                <div key={stat.subject}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{stat.subject}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: stat.A >= 70 ? '#8B5CF6' : stat.A >= 50 ? '#10B981' : '#94A3B8' }}>
                                            {Math.round(stat.A)}
                                        </span>
                                    </div>
                                    <div style={{ height: '7px', background: 'var(--background)', borderRadius: '10px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${stat.A}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }} style={{ height: '100%', borderRadius: '10px', background: stat.A >= 70 ? 'linear-gradient(90deg, #8B5CF6, #EC4899)' : stat.A >= 50 ? 'linear-gradient(90deg, #10B981, #06B6D4)' : '#E2E8F0' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ===== 스토리 카드 3장 ===== */}
                    <div style={{ borderTop: '1px solid var(--glass-border)', padding: '30px' }}>
                        <h3 style={{ fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>📖 나의 성향 스토리</h3>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                            {storyCards.map((_, i) => (
                                <button key={i} onClick={() => setActiveStory(i)} style={{ flex: 1, padding: '12px', borderRadius: '16px', background: activeStory === i ? storyCards[i].bg : 'var(--background)', border: `1px solid ${activeStory === i ? storyCards[i].accent + '40' : 'var(--glass-border)'}`, color: activeStory === i ? storyCards[i].accent : 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{storyCards[i].icon}</span>
                                    <span style={{ fontSize: '0.8rem' }}>{storyCards[i].title}</span>
                                </button>
                            ))}
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div key={activeStory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ padding: '24px', background: storyCards[activeStory].bg, borderRadius: '20px', border: `1px solid ${storyCards[activeStory].accent}20` }}>
                                <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text)', fontWeight: 600 }}>
                                    {storyCards[activeStory].body}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '450px' }}>
                        <button onClick={handleShare} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'white', fontWeight: 700, cursor: 'pointer', color: 'var(--text)' }}>
                            <Share2 size={17} /> 공유하기
                        </button>
                        <button onClick={handleSaveCard} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'white', fontWeight: 700, cursor: 'pointer', color: 'var(--text)' }}>
                            <Download size={17} /> 카드 저장
                        </button>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onExplore} className="primary" style={{ width: '100%', maxWidth: '450px', padding: '18px', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '18px', border: 'none', cursor: 'pointer' }}>
                        인연 찾으러 가기 <ArrowRight size={20} />
                    </motion.button>
                </div>
                <DeepSoulSection onNavigate={onNavigate || onExplore} />
            </div>

            <PersonalityExplanation data={chartData} />
        </motion.div>
    );
};

export default ResultReport;

// ── DeepSoulSection ────────────────────────────────────────────
const DS_CAT_QUICK = [
    { catId: 'relationship', label: '💑 연애관계', color: '#EC4899' },
    { catId: 'lifestyle', label: '🌿 라이프스타일', color: '#10B981' },
    { catId: 'family', label: '🏠 가족관미래', color: '#F59E0B' },
    { catId: 'values', label: '🌍 가치관세계관', color: '#6366F1' },
];

const DeepSoulSection = ({ onNavigate }) => {
    const raw = localStorage.getItem('lumini_deep_soul');
    const deepData = raw ? JSON.parse(raw) : null;

    const catStats = React.useMemo(() => {
        if (!deepData) return [];
        const scores = buildCatScores(deepData, DEEP_QUESTIONS);
        return DS_CAT_QUICK.map(cat => {
            const score = scores[cat.catId] ?? 50;
            const type = getDeepSoulType(cat.catId, score);
            return { ...cat, score, type };
        });
    }, [deepData]);

    return (
        <div style={{ padding: '28px 30px', borderTop: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>💎 나의 딥 소울 유형</h3>
            {deepData ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {catStats.map(cat => (
                            <div key={cat.catId} style={{ padding: '14px 16px', borderRadius: '16px', background: `${cat.color}08`, border: `1.5px solid ${cat.color}25`, flexDirection: 'column', display: 'flex', gap: '6px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{cat.label}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 900, fontSize: '0.95rem', color: cat.color }}>
                                        {cat.type.emoji} {cat.type.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => onNavigate?.('deep-soul-result')} style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>💎 전체 결과 보기</button>
                        <button onClick={() => { if (window.confirm('딥 소울 검사를 다시 하시겠어요?')) { localStorage.removeItem('lumini_deep_soul'); onNavigate?.('deep-soul-test'); } }} style={{ padding: '12px 18px', borderRadius: '14px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>재검사</button>
                    </div>
                </>
            ) : (
                <div style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #4F46E508, #7C3AED06)', border: '1.5px dashed #7C3AED30', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💎</div>
                    <h4 style={{ fontWeight: 900, marginBottom: '8px', color: 'var(--text)' }}>딥 소울 검사를 아직 하지 않으셨어요</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '18px' }}>연애관 · 가족관 · 가치관까지 맞는 인연을 더 명확하게 알 수 있어요.</p>
                    <button onClick={() => onNavigate?.('deep-soul-test')} style={{ padding: '12px 28px', borderRadius: '14px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }}>💎 딥 소울 검사 시작하기</button>
                </div>
            )}
        </div>
    );
};
