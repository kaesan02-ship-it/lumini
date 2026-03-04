import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Target, BookOpen, MessageCircle,
    Smile, Frown, Meh, Zap, Sun, Cloud, ArrowLeft,
    CheckCircle, Circle, Star, Send, ChevronRight, Flame, TrendingUp
} from 'lucide-react';
import useCrystalStore from '../store/crystalStore';

// ─── 감정 체크인 데이터 ─────────────────────────────────────────
const EMOTIONS = [
    { emoji: '😄', label: '신남', color: '#F59E0B', val: 5 },
    { emoji: '😊', label: '좋음', color: '#10B981', val: 4 },
    { emoji: '😐', label: '평범', color: '#94A3B8', val: 3 },
    { emoji: '😔', label: '우울', color: '#6366F1', val: 2 },
    { emoji: '😤', label: '짜증', color: '#EF4444', val: 1 },
    { emoji: '😰', label: '불안', color: '#8B5CF6', val: 2 },
];

const EMOTION_TRIGGERS = [
    '사람과의 대화', '혼자만의 시간', '일/과제', '돈/금전', '날씨/환경',
    '건강', '미래 걱정', '특별한 이유 없음'
];

// ─── 소셜 미션 데이터 ────────────────────────────────────────────
const SOCIAL_MISSIONS = [
    { id: 'm1', level: 1, emoji: '👋', title: '루미니 피드에 댓글 달기', desc: '타인의 게시물에 진심 어린 댓글을 하나 남겨보세요.', xp: 20, type: 'online', tip: '칭찬이나 공감 한 마디가 관계의 시작이 됩니다.' },
    { id: 'm2', level: 1, emoji: '💬', title: '매칭 상대에게 먼저 메시지 보내기', desc: '관심 목록의 누군가에게 먼저 대화를 시작해보세요.', xp: 30, type: 'online', tip: '"안녕하세요! 프로필이 인상적이었어요"처럼 간단하게 시작해도 OK' },
    { id: 'm3', level: 2, emoji: '🎤', title: '오늘 대화에서 질문 3번 하기', desc: '상대방에 대해 진짜 궁금한 것을 3번 물어보세요.', xp: 25, type: 'offline', tip: '질문은 대화의 주도권을 상대에게 줍니다. 상대는 들어주는 당신에게 호감을 느낍니다.' },
    { id: 'm4', level: 2, emoji: '🤝', title: '누군가를 도와주는 행동 하기', desc: '작은 도움 하나가 관계를 깊게 만듭니다.', xp: 20, type: 'offline', tip: '"괜찮아요? 제가 도와드릴게요"라는 한 마디가 큰 차이를 만들어요.' },
    { id: 'm5', level: 3, emoji: '📱', title: '오래 연락 못한 사람에게 안부 전하기', desc: '3개월 이상 연락이 끊긴 사람에게 먼저 메시지를 보내보세요.', xp: 40, type: 'social', tip: '"갑자기 생각났는데 잘 지내?"만으로 충분해요!' },
    { id: 'm6', level: 3, emoji: '😊', title: '거절하기 연습하기', desc: '마음에 없는 부탁을 정중하게 거절해보세요.', xp: 35, type: 'skill', tip: '"이번에는 어렵지만, 다음에는 꼭!"처럼 대안을 제시하면 관계가 덜 어색해요.' },
    { id: 'm7', level: 1, emoji: '🌟', title: '소울 그룹에서 한 마디 하기', desc: '루미니 그룹 채팅에서 먼저 대화를 시작해보세요.', xp: 15, type: 'online', tip: '온라인 대화도 훈련이에요. 적극성이 높아집니다.' },
];

// ─── 관계 일지 체크리스트 ──────────────────────────────────────
const JOURNAL_CHECKLIST = [
    { id: 'c1', q: '상대방이 말할 때 중간에 끊지 않았나요?', good: '잘 들어줬어요' },
    { id: 'c2', q: '나의 감정을 솔직하게 표현했나요?', good: '솔직하게 표현했어요' },
    { id: 'c3', q: '상대방의 이름을 대화 중 한 번 불렀나요?', good: '이름을 불렀어요' },
    { id: 'c4', q: '대화 후 기분이 좋았나요?', good: '좋은 대화였어요' },
    { id: 'c5', q: '내가 더 많이 이야기했나요, 들었나요?', good: '균형 있게 나눴어요' },
];

// ─── AI 상담사 프리셋 ────────────────────────────────────────
const COUNSEL_TOPICS = [
    { emoji: '💔', label: '관계 갈등', prompt: '최근 갈등이 있었던 관계에 대해 이야기해볼까요?' },
    { emoji: '😰', label: '사회불안', prompt: '사람 만나는 게 불안한가요? 어떤 상황이 가장 어려우셨나요?' },
    { emoji: '💬', label: '대화 고민', prompt: '대화할 때 어떤 부분이 제일 어려우신가요?' },
    { emoji: '👥', label: '외로움', prompt: '요즘 외로움을 느끼시나요? 어떤 순간에 그런지 말해주세요.' },
    { emoji: '💪', label: '자신감 향상', prompt: '자신감을 높이고 싶은 상황이 있으신가요?' },
    { emoji: '🎯', label: '첫 만남 공포증', prompt: '낯선 사람을 처음 만날 때 어떤 느낌이 드세요?' },
];

const AI_RESPONSES = {
    '관계 갈등': [
        '갈등이 생겼을 때 제가 오히려 그 관계가 더 깊어질 수 있는 기회라고 생각해요. 상대방의 어떤 행동이 가장 힘드셨나요?',
        '그 상황에서 당신이 원했던 것은 무엇이었나요? 인정? 사과? 아니면 단순히 들어주길 원하셨나요?',
        '갈등 상황에서 "나는 이렇게 느꼈어"라는 표현이 "너는 왜 그래"보다 훨씬 효과적이에요. 다음에 시도해보실 수 있을까요?',
    ],
    '사회불안': [
        '사람을 만나는 게 불안한 건 아주 자연스러운 감정이에요. 특히 어떤 상황이 가장 어려우신가요 — 처음 만나는 사람? 아니면 이미 아는 사람?',
        '불안을 느낄 때 우리 뇌는 "위험하다!"고 신호를 보내요. 하지만 사회적 상황의 90%는 사실 안전해요. 그 간격을 좁히는 연습이 소셜 미션이에요.',
        '완벽하게 대화하려고 하지 않아도 괜찮아요. 상대방도 완벽한 대화를 원하지 않아요. 그냥 "함께 있는 시간"만으로도 충분해요.',
    ],
    '대화 고민': [
        '대화에서 가장 중요한 건 말하기가 아니라 듣기예요. 오늘 대화에서 얼마나 들어줬는지 생각해보세요.',
        '대화가 막힐 때는 간단한 질문이 최고예요. "그래서 어떻게 됐어?", "그때 기분이 어땠어?" 같은 후속 질문이 대화를 자연스럽게 이어줘요.',
        '침묵이 불편하지 않아도 괜찮아요. 함께 있을 때 꼭 말이 필요하지 않아요. 편안한 침묵을 나눌 수 있는 사람이 진짜 친한 사람이에요.',
    ],
    '외로움': [
        '외로움을 느끼는 건 사회적 연결을 원한다는 신호예요. 배고픔처럼 당신의 몸이 보내는 건강한 신호랍니다.',
        '혼자 있는 시간과 외로운 시간은 달라요. 지금 느끼는 외로움은 어떤 종류인가요? — 사람이 없어서인가요, 아니면 이해받지 못하는 느낌인가요?',
        '작은 연결부터 시작해보세요. 루미니 피드에 댓글 하나, 매칭 상대에게 인사 한 마디. 외로움은 관계의 규모가 아니라 질로 해소돼요.',
    ],
    '자신감 향상': [
        '자신감은 성공 경험이 쌓여야 생겨요. 아주 작은 것부터 시작하세요 — 오늘 소셜 미션 하나를 완료하는 것만으로도 뇌는 "나는 할 수 있다"를 학습해요.',
        '사람들은 자신감 있는 사람에게 끌리지만, 자신감이란 "나는 완벽해"가 아니라 "나는 나를 받아들여"예요. 당신의 어색함도 당신의 일부예요.',
        '다른 사람 앞에서 자신감이 없다면, 일단 온라인에서 연습해보세요. 글로 먼저 자신을 표현하다 보면 오프라인에서도 점점 편해져요.',
    ],
    '첫 만남 공포증': [
        '첫 만남이 두렵다면 준비를 많이 하려는 성향일 가능성이 높아요. 하지만 대화는 준비가 아니라 반응이에요. 상대방을 관찰하고 그 사람에게 집중해보세요.',
        '첫 만남에서 인상을 남기려 하지 않아도 돼요. 그냥 "이 사람이 뭘 좋아하는지" 궁금해하는 것만으로 충분해요.',
        '첫 만남 후에는 반드시 복기해보세요. 오늘 관계 일지 탭에서 그 대화를 기록해보시면 다음에 더 나아질 수 있어요.',
    ],
    'default': [
        '루미니 소울 상담사예요. 지금 어떤 부분이 가장 힘드세요?',
        '더 구체적으로 말씀해주시면 더 잘 도와드릴 수 있어요.',
        '그 감정을 느끼는 게 당연해요. 함께 방법을 찾아봐요.',
    ],
};

// ─── 감정 체크인 탭 ──────────────────────────────────────────────
const EmotionCheckin = ({ onComplete }) => {
    const [step, setStep] = useState(0); // 0: 감정 선택, 1: 트리거 선택, 2: 메모, 3: 완료
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [selectedTrigger, setSelectedTrigger] = useState('');
    const [memo, setMemo] = useState('');

    const today = new Date().toDateString();
    const history = JSON.parse(localStorage.getItem('lumini_emotion_log') || '[]');
    const todayLog = history.find(h => h.date === today);

    const handleSave = () => {
        const log = {
            date: today,
            emotion: selectedEmotion,
            trigger: selectedTrigger,
            memo,
            time: new Date().toISOString(),
        };
        const updated = [log, ...history.filter(h => h.date !== today)].slice(0, 30);
        localStorage.setItem('lumini_emotion_log', JSON.stringify(updated));
        setStep(3);
        if (onComplete) onComplete(8);
    };

    const weekly = history.slice(0, 7);
    const avgVal = weekly.length ? (weekly.reduce((s, h) => s + (h.emotion?.val || 3), 0) / weekly.length).toFixed(1) : null;

    if (todayLog && step === 0) {
        return (
            <div style={{ padding: '20px 5%', paddingBottom: '40px' }}>
                <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderRadius: '22px', padding: '28px', textAlign: 'center', marginBottom: '24px', border: '1px solid #86EFAC' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>{todayLog.emotion.emoji}</div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#16A34A' }}>오늘 체크인 완료!</div>
                    <div style={{ fontSize: '0.9rem', color: '#15803D', marginTop: '6px' }}>
                        {todayLog.emotion.label} · {todayLog.trigger}
                    </div>
                    {todayLog.memo && <div style={{ marginTop: '12px', fontSize: '0.88rem', color: '#166534', background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '10px' }}>{todayLog.memo}</div>}
                </div>
                {avgVal && (
                    <div style={{ background: 'var(--surface)', borderRadius: '18px', padding: '20px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18} color="var(--primary)" /> 최근 7일 감정 흐름</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {weekly.map((h, i) => (
                                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem' }}>{h.emotion?.emoji || '😐'}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(h.date).toLocaleDateString('ko', { weekday: 'narrow' })}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                            평균 감정 지수 <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.05rem' }}>{avgVal}</span> / 5.0
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 5%', paddingBottom: '40px' }}>
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h3 style={{ fontWeight: 900, marginBottom: '6px' }}>지금 기분이 어때요? 😊</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '22px' }}>오늘의 감정을 기록해봐요. 매일 쌓이면 내 감정 패턴을 알 수 있어요.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                            {EMOTIONS.map(e => (
                                <motion.div key={e.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    onClick={() => { setSelectedEmotion(e); setStep(1); }}
                                    style={{ textAlign: 'center', padding: '20px 10px', borderRadius: '18px', cursor: 'pointer', background: selectedEmotion?.label === e.label ? `${e.color}20` : 'var(--surface)', border: `2px solid ${selectedEmotion?.label === e.label ? e.color : 'var(--glass-border)'}`, transition: 'all 0.2s' }}>
                                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{e.emoji}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: e.color }}>{e.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
                {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                            <button onClick={() => setStep(0)} style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                            <h3 style={{ fontWeight: 900, margin: 0 }}>어떤 이유 때문에 {selectedEmotion?.label}한가요?</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                            {EMOTION_TRIGGERS.map(t => (
                                <motion.button key={t} whileTap={{ scale: 0.97 }}
                                    onClick={() => { setSelectedTrigger(t); setStep(2); }}
                                    style={{ padding: '14px', borderRadius: '14px', border: `2px solid ${selectedTrigger === t ? 'var(--primary)' : 'var(--glass-border)'}`, background: selectedTrigger === t ? 'var(--primary-faint)' : 'var(--surface)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left' }}>
                                    {t}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                            <button onClick={() => setStep(1)} style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                            <h3 style={{ fontWeight: 900, margin: 0 }}>조금 더 적어볼까요? (선택)</h3>
                        </div>
                        <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="오늘 있었던 일이나 느낌을 자유롭게 적어보세요..." rows={5}
                            style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)', fontSize: '0.95rem', lineHeight: 1.7, resize: 'none', boxSizing: 'border-box' }} />
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            style={{ marginTop: '16px', width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '1.05rem' }}>
                            오늘 감정 기록하기 ✓
                        </motion.button>
                    </motion.div>
                )}
                {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{selectedEmotion?.emoji}</div>
                        <h3 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '8px' }}>체크인 완료! +8💎</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            오늘 감정을 기록했어요.<br />
                            매일 기록하면 내 감정 패턴이 보여요.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── 소셜 미션 탭 ─────────────────────────────────────────────────
const SocialMissions = ({ onComplete }) => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('lumini_social_missions') || '{}');
    const todayDone = saved[today] || [];
    const [doneMissions, setDoneMissions] = useState(todayDone);

    const handleComplete = (mission) => {
        if (doneMissions.includes(mission.id)) return;
        const updated = [...doneMissions, mission.id];
        setDoneMissions(updated);
        const newSaved = { ...saved, [today]: updated };
        localStorage.setItem('lumini_social_missions', JSON.stringify(newSaved));
        if (onComplete) onComplete(mission.xp);
    };

    const levelColors = { 1: '#10B981', 2: '#F59E0B', 3: '#EF4444' };
    const levelLabels = { 1: '입문', 2: '도전', 3: '고급' };

    return (
        <div style={{ padding: '20px 5%', paddingBottom: '40px' }}>
            <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: '16px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#1D4ED8', fontWeight: 700 }}>오늘 완료한 미션</div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1D4ED8' }}>{doneMissions.length} / {SOCIAL_MISSIONS.length}</div>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
                {SOCIAL_MISSIONS.map(mission => {
                    const isDone = doneMissions.includes(mission.id);
                    const color = levelColors[mission.level];
                    return (
                        <motion.div key={mission.id} whileHover={{ y: isDone ? 0 : -2 }}
                            style={{ background: isDone ? '#F8FAFC' : 'var(--surface)', borderRadius: '18px', padding: '18px', border: `1px solid ${isDone ? '#E2E8F0' : 'var(--glass-border)'}`, opacity: isDone ? 0.75 : 1 }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{mission.emoji}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>{mission.title}</span>
                                        <span style={{ background: color, color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>{levelLabels[mission.level]}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>{mission.desc}</p>
                                    <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#64748B', marginBottom: '12px', borderLeft: `3px solid ${color}` }}>
                                        💡 {mission.tip}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#F59E0B', fontWeight: 800, fontSize: '0.88rem' }}>+{mission.xp}💎</span>
                                        {isDone ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 800, fontSize: '0.88rem' }}>
                                                <CheckCircle size={16} /> 완료!
                                            </div>
                                        ) : (
                                            <motion.button whileTap={{ scale: 0.96 }}
                                                onClick={() => handleComplete(mission)}
                                                style={{ padding: '8px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem' }}>
                                                완료했어요 ✓
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── 관계 일지 탭 ────────────────────────────────────────────────
const RelationshipJournal = ({ onComplete }) => {
    const [situation, setSituation] = useState('');
    const [checks, setChecks] = useState({});
    const [reflection, setReflection] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const toggleCheck = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));
    const checkCount = Object.values(checks).filter(Boolean).length;

    const logs = JSON.parse(localStorage.getItem('lumini_journal_logs') || '[]');

    const handleSubmit = () => {
        const log = { date: new Date().toISOString(), situation, checks, reflection };
        const updated = [log, ...logs].slice(0, 20);
        localStorage.setItem('lumini_journal_logs', JSON.stringify(updated));
        setSubmitted(true);
        if (onComplete) onComplete(20);
    };

    const getAIFeedback = () => {
        const score = checkCount / JOURNAL_CHECKLIST.length;
        if (score >= 0.8) return { msg: '정말 훌륭한 대화를 나눴네요! 이 패턴을 계속 유지해보세요.', color: '#10B981', emoji: '🌟' };
        if (score >= 0.5) return { msg: '꽤 좋은 대화였어요! 상대방 말을 더 끊지 않으면 더 좋아질 것 같아요.', color: '#F59E0B', emoji: '💪' };
        return { msg: '오늘 대화가 좀 어려웠군요. 괜찮아요, 인식하는 것만으로도 성장이에요.', color: '#6366F1', emoji: '🫂' };
    };

    if (submitted) {
        const fb = getAIFeedback();
        return (
            <div style={{ padding: '20px 5%' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ background: `linear-gradient(135deg, ${fb.color}15, ${fb.color}08)`, borderRadius: '22px', padding: '30px', textAlign: 'center', border: `1px solid ${fb.color}30`, marginBottom: '24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{fb.emoji}</div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '8px', color: fb.color }}>AI 관계 코치 피드백</div>
                    <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>{fb.msg}</p>
                    <div style={{ marginTop: '16px', fontWeight: 800, color: '#F59E0B' }}>+20💎 기록 보상!</div>
                </motion.div>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {logs.slice(0, 3).map((log, i) => (
                        <div key={i} style={{ background: 'var(--surface)', borderRadius: '14px', padding: '14px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{new Date(log.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.situation || '(상황 없음)'}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 5%', paddingBottom: '40px' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '6px' }}>관계 일지 기록하기 📝</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '22px' }}>오늘 나눈 대화를 되돌아보고 소통 습관을 점검해요.</p>

            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, marginBottom: '8px' }}>어떤 대화였나요?</div>
                <input value={situation} onChange={e => setSituation(e.target.value)}
                    placeholder="예: 친구와 카페에서 고민 상담, 루미니 매칭 상대와 첫 대화..."
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '22px' }}>
                <div style={{ fontWeight: 800, marginBottom: '12px' }}>대화 점검 체크리스트</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {JOURNAL_CHECKLIST.map(item => (
                        <div key={item.id} onClick={() => toggleCheck(item.id)}
                            style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', borderRadius: '14px', background: checks[item.id] ? '#F0FDF4' : 'var(--surface)', border: `1px solid ${checks[item.id] ? '#86EFAC' : 'var(--glass-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                            {checks[item.id] ? <CheckCircle size={22} color="#10B981" /> : <Circle size={22} color="var(--text-muted)" />}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.q}</div>
                                {checks[item.id] && <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '3px' }}>✓ {item.good}</div>}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{checkCount}/{JOURNAL_CHECKLIST.length}개 충족</div>
            </div>

            <div style={{ marginBottom: '22px' }}>
                <div style={{ fontWeight: 800, marginBottom: '8px' }}>오늘 대화에서 배운 점 (선택)</div>
                <textarea value={reflection} onChange={e => setReflection(e.target.value)}
                    rows={3} placeholder="다음에 더 잘하고 싶은 점이나 느낀 점을 적어보세요..."
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.9rem', lineHeight: 1.6, resize: 'none', boxSizing: 'border-box' }} />
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!situation}
                style={{ width: '100%', padding: '16px', borderRadius: '14px', background: situation ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : '#E2E8F0', color: situation ? 'white' : '#94A3B8', border: 'none', fontWeight: 900, cursor: situation ? 'pointer' : 'not-allowed', fontSize: '1rem' }}>
                AI 피드백 받기 ✓ (+20💎)
            </motion.button>
        </div>
    );
};

// ─── AI 소울 상담사 탭 ────────────────────────────────────────────
const SoulCounselor = () => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [responseIdx, setResponseIdx] = useState(0);

    const handleTopicSelect = (topic) => {
        setSelectedTopic(topic);
        setMessages([
            { from: 'ai', text: `안녕해요! 루미니 소울 상담사예요 😊\n${topic.prompt}` }
        ]);
        setResponseIdx(0);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { from: 'user', text: input };
        const responses = AI_RESPONSES[selectedTopic?.label] || AI_RESPONSES['default'];
        const aiResponse = responses[responseIdx % responses.length];
        setMessages(prev => [...prev, userMsg, { from: 'ai', text: aiResponse }]);
        setResponseIdx(prev => prev + 1);
        setInput('');
    };

    if (!selectedTopic) {
        return (
            <div style={{ padding: '20px 5%', paddingBottom: '40px' }}>
                <h3 style={{ fontWeight: 900, marginBottom: '6px' }}>소울 상담사 🫂</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '22px' }}>어떤 주제로 이야기해볼까요? 친구처럼 편하게 털어놓으세요.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {COUNSEL_TOPICS.map(topic => (
                        <motion.div key={topic.label} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handleTopicSelect(topic)}
                            style={{ background: 'var(--surface)', borderRadius: '18px', padding: '20px', cursor: 'pointer', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{topic.emoji}</div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{topic.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '75vh', padding: '0' }}>
            <div style={{ padding: '14px 5%', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface)' }}>
                <button onClick={() => setSelectedTopic(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700 }}>
                    ← 주제 바꾸기
                </button>
                <div style={{ fontWeight: 800 }}>{selectedTopic.emoji} {selectedTopic.label}</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 5%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '80%', alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.from === 'ai' && (
                            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🫂</div>
                        )}
                        <div style={{
                            padding: '14px 18px', borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: msg.from === 'user' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
                            color: msg.from === 'user' ? 'white' : 'var(--text)',
                            fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-line',
                            border: msg.from === 'ai' ? '1px solid var(--glass-border)' : 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ padding: '14px 5%', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px', background: 'var(--surface)' }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="편하게 이야기해주세요..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '100px', border: '1px solid var(--glass-border)', fontSize: '0.92rem' }} />
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSend} disabled={!input.trim()}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : '#E2E8F0', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Send size={18} color="white" />
                </motion.button>
            </div>
        </div>
    );
};

// ─── 메인 SoulGrowthPage ────────────────────────────────────────
const SoulGrowthPage = ({ onBack }) => {
    const { earnCrystals } = useCrystalStore();
    const [activeTab, setActiveTab] = useState('emotion');

    const handleComplete = (xp) => {
        earnCrystals(xp, '성장 활동 보상');
    };

    const tabs = [
        { id: 'emotion', label: '감정 체크인', emoji: '😊' },
        { id: 'missions', label: '소셜 미션', emoji: '🎯' },
        { id: 'journal', label: '관계 일지', emoji: '📝' },
        { id: 'counsel', label: 'AI 상담사', emoji: '🫂' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ padding: '22px 5% 18px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {onBack && <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>←</button>}
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>🌱 소울 성장 일지</h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.82rem' }}>매일의 감정·대화·관계를 기록하며 성장해요</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--glass-border)', overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{ flex: '1 0 auto', padding: '14px 8px', border: 'none', borderBottom: `3px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`, background: 'transparent', cursor: 'pointer', fontWeight: activeTab === tab.id ? 800 : 600, color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', transition: 'all 0.2s' }}>
                        <span style={{ fontSize: '1.2rem' }}>{tab.emoji}</span>
                        <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {activeTab === 'emotion' && <EmotionCheckin onComplete={handleComplete} />}
                    {activeTab === 'missions' && <SocialMissions onComplete={handleComplete} />}
                    {activeTab === 'journal' && <RelationshipJournal onComplete={handleComplete} />}
                    {activeTab === 'counsel' && <SoulCounselor />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SoulGrowthPage;
