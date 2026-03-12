import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Target, CheckCircle, Lock, Gift, ChevronRight, Star, Zap, MessageCircle, Users, Edit3 } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';
import Tooltip from '../components/Tooltip';

// 챌린지 데이터 — 매일 업데이트되는 소울 챌린지
const getDailyChallenges = () => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0=일, 1=월, ...

    const challengeSets = [
        // 일요일
        [
            { id: 'checkin', title: '오늘의 출석 체크', desc: '앱에 접속하면 완료', reward: 30, icon: '📅', type: 'auto', completed: false },
            { id: 'share-mood', title: '오늘의 감정 카드 공유', desc: '지금 기분을 피드에 공유해보기', reward: 10, icon: '💭', type: 'action', navigateTo: 'create-post', completed: false },
            { id: 'read-insight', title: '오늘의 인사이트 읽기', desc: 'AI 인사이트 페이지 방문', reward: 5, icon: '🔮', type: 'action', navigateTo: 'insights', completed: false },
        ],
        // 월요일
        [
            { id: 'checkin', title: '오늘의 출석 체크', desc: '앱에 접속하면 완료', reward: 30, icon: '📅', type: 'auto', completed: false },
            { id: 'match-chat', title: '새 친구에게 첫 인사', desc: '오늘 추천된 친구에게 메시지 보내기 (실제 메시지 전송)', reward: 15, icon: '👋', type: 'action', navigateTo: 'dashboard', completed: false },
            { id: 'daily-q', title: '오늘의 소울 질문 답하기', desc: '성향 질문 1개에 솔직하게 답해보기', reward: 10, icon: '❓', type: 'quiz', completed: false },
        ],
        // 화요일
        [
            { id: 'checkin', title: '오늘의 출석 체크', desc: '앱에 접속하면 완료', reward: 30, icon: '📅', type: 'auto', completed: false },
            { id: 'post-write', title: '피드에 글 한 편 남기기', desc: '나의 생각이나 일상을 나눠보기 (작성 후 완료)', reward: 12, icon: '✏️', type: 'action', navigateTo: 'create-post', completed: false },
            { id: 'find-common', title: '공통점 찾기 미션', desc: '매칭 친구와 공통점 2개 발견하기', reward: 20, icon: '🎯', type: 'action', navigateTo: 'dashboard', completed: false },
        ],
        // 수요일
        [
            { id: 'checkin', title: '오늘의 출석 체크', desc: '앱에 접속하면 완료', reward: 30, icon: '📅', type: 'auto', completed: false },
            { id: 'compliment', title: '진심 어린 응원 보내기', desc: '피드의 게시물에 따뜻한 댓글 남기기 (댓글 작성 후 완료)', reward: 8, icon: '💜', type: 'action', navigateTo: 'feed', completed: false },
            { id: 'explore', title: '새로운 성향 탐색하기', desc: '나와 다른 MBTI 타입 유저 프로필 보기 (대시보드 이동 후 완료)', reward: 10, icon: '🔭', type: 'action', navigateTo: 'dashboard', completed: false },
        ],
        // 목요일
        [
            { id: 'checkin', title: '오늘의 출석 체크', desc: '앱에 접속하면 완료', reward: 30, icon: '📅', type: 'auto', completed: false },
            { id: 'mood-share', title: '이번 주 성장 포인트 공유', desc: '스스로 느낌 성장 한 가지를 피드에 남기기 (글 작성 후 완료)', reward: 15, icon: '🌱', type: 'action', navigateTo: 'create-post', completed: false },
            { id: 'react-3', title: '감정 스티커 3개 보내기', desc: '오늘 피드에서 공감 스티커 3개 사용하기', reward: 5, icon: '🎡', type: 'action', navigateTo: 'feed', completed: false },
        ],
        // 금요일
        [
            { id: 'checkin', title: '오늘의 출석 체크', desc: '앱에 접속하면 완료', reward: 30, icon: '📅', type: 'auto', completed: false },
            { id: 'chat-long', title: '10분 대화 찼린지', desc: '매칭된 친구와 10분 이상 대화하기 (채팅 이동 후 완료)', reward: 20, icon: '💬', type: 'action', navigateTo: 'dashboard', completed: false },
            { id: 'weekly-reflection', title: '이번 주 돌아보기', desc: '성장 트래킹 페이지 작성하기 (작성 후 완료)', reward: 15, icon: '📒', type: 'action', navigateTo: 'growth', completed: false },
        ],
        // 토요일
        [
            { id: 'checkin', title: '오늘의 출석 체크', desc: '앱에 접속하면 완료', reward: 30, icon: '📅', type: 'auto', completed: false },
            { id: 'event-join', title: '오프라인 모임 탐색하기', desc: '모임 탭에서 이벤트 1개 구경하기', reward: 8, icon: '🎠', type: 'action', navigateTo: 'events', completed: false },
            { id: 'profile-update', title: '프로필 완성하기', desc: '소개 문구나 태그 업데이트하기 (저장 후 완료)', reward: 12, icon: '✨', type: 'action', navigateTo: 'profile-edit', completed: false },
        ],
    ];

    return challengeSets[dayIndex];
};

// 오늘의 소울 질문
const DAILY_QUESTIONS = [
    "당신이 가장 행복한 순간은 언제인가요?",
    "처음 만나는 사람에게 먼저 말을 거는 편인가요?",
    "혼자 있는 시간이 에너지를 충전해 주나요?",
    "갑작스러운 변화에 어떻게 반응하는 편인가요?",
    "가장 최근에 감동받은 순간을 나눠주세요.",
    "지금 이 순간, 마음이 어떤가요?",
    "당신의 하루를 한 단어로 표현한다면?",
];

const DailyChallengesPage = ({ onBack, mbtiType, onNavigate }) => {
    const { crystals, earnCrystals, dailyCheckinBonus, dailyCheckin } = useCrystalStore();
    const { user } = useAuthStore();
    const userId = user?.id || 'guest';
    const streakKey = `lumini_streak_${userId}`;
    const challengesDoneKey = `lumini_challenges_done_${userId}`;
    const soulHistoryKey = `lumini_soul_history_${userId}`;

    const [streak, setStreak] = useState(() => {
        return parseInt(localStorage.getItem(streakKey) || '0');
    });
    const [todayAnswered, setTodayAnswered] = useState(false);
    const [answerInput, setAnswerInput] = useState('');
    const [showAnswerBox, setShowAnswerBox] = useState(false);
    const [completedToday, setCompletedToday] = useState(() => {
        const saved = localStorage.getItem(challengesDoneKey);
        const todayText = new Date().toDateString();
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.date === todayText ? parsed.ids : [];
        }
        return [];
    });
    const [toastMsg, setToastMsg] = useState('');

    const today = new Date().toDateString();
    const alreadyCheckedIn = dailyCheckin === today;

    const challenges = getDailyChallenges();
    const todayQuestion = DAILY_QUESTIONS[new Date().getDay()];
    const totalReward = challenges.reduce((sum, c) => sum + c.reward, 0);
    const earnedToday = challenges
        .filter(c => completedToday.includes(c.id))
        .reduce((sum, c) => sum + c.reward, 0);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2000);
    };

    // 자동 출석 체크 완료 처리
    useEffect(() => {
        if (!completedToday.includes('checkin')) {
            handleComplete('checkin', 10);
        }
    }, [userId]);

    const handleComplete = (challengeId, reward) => {
        if (completedToday.includes(challengeId)) return;

        const newCompleted = [...completedToday, challengeId];
        setCompletedToday(newCompleted);
        localStorage.setItem(challengesDoneKey, JSON.stringify({ date: today, ids: newCompleted }));

        earnCrystals(reward);
        showToast(`+${reward}💎 획득!`);

        // 출석 체크 시 연속 스트릭 업데이트
        if (challengeId === 'checkin') {
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem(streakKey, newStreak.toString());
        }
    };

    const handleAnswerSubmit = () => {
        if (!answerInput.trim()) return;
        const historyItem = {
            date: new Date().toLocaleDateString('ko-KR'),
            question: todayQuestion,
            answer: answerInput.trim(),
        };
        const prev = (() => { try { return JSON.parse(localStorage.getItem(soulHistoryKey) || '[]'); } catch { return []; } })();
        // 오늘 날짜 중복 방지
        const filtered = prev.filter(h => h.date !== historyItem.date);
        localStorage.setItem(soulHistoryKey, JSON.stringify([historyItem, ...filtered].slice(0, 30)));
        setTodayAnswered(true);
        setShowAnswerBox(false);
        handleComplete('daily-q', 10);
        setAnswerInput('');
    };

    const progress = (completedToday.length / challenges.length) * 100;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{
                padding: '20px 5%',
                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                color: 'white',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    {onBack && (
                        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                            ←
                        </button>
                    )}
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>🎯 데일리 소울 챌린지</h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.88rem' }}>매일 완료하고 크리스탈을 모아보세요!</p>
                    </div>
                </div>

                {/* Streak & Progress */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '24px', padding: '20px', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '12px', fontWeight: 700 }}>7일 출석 현황</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: streak >= day ? '#fff' : 'rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', color: streak >= day ? '#F59E0B' : '#fff',
                                        fontWeight: 900
                                    }}>
                                        {streak >= day ? '✓' : day}
                                    </div>
                                    <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>{day}일</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '18px', padding: '12px 16px', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>현재 스트릭</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{streak}일🔥</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '18px', padding: '12px 16px', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>오늘 크리스탈</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>+{earnedToday}💎</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '25px 5%' }}>
                {/* Progress Bar */}
                <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 800 }}>오늘의 챌린지</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{completedToday.length}/{challenges.length} 완료</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #EC4899)', borderRadius: '100px' }}
                        />
                    </div>
                    {progress === 100 && (
                        <div style={{ marginTop: '12px', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>
                            🎉 오늘 챌린지 모두 완료! 최고예요!
                        </div>
                    )}
                </div>

                {/* Challenge List */}
                <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>📋 오늘의 미션</h3>
                <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
                    {challenges.map(c => {
                        const done = completedToday.includes(c.id);
                        return (
                            <motion.div
                                key={c.id}
                                whileHover={!done ? { scale: 1.01 } : {}}
                                style={{
                                    background: done ? '#f0fdf4' : 'var(--surface)',
                                    border: done ? '1px solid #10b98130' : '1px solid var(--glass-border)',
                                    borderRadius: '18px',
                                    padding: '18px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '15px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                    <div style={{ fontSize: '1.8rem', filter: done ? 'grayscale(0)' : 'none' }}>{c.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: done ? '#10b981' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>
                                            {c.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{c.desc}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>+{c.reward}💸</span>
                                    {done ? (
                                        <CheckCircle size={24} color="#10b981" />
                                    ) : c.type === 'quiz' ? (
                                        <Tooltip text="오늘의 소울 질문에 답변하고 크리스탈을 받으세요.">
                                            <button
                                                onClick={() => setShowAnswerBox(true)}
                                                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                답하기
                                            </button>
                                        </Tooltip>
                                    ) : c.type === 'auto' ? (
                                        <CheckCircle size={24} color="#10b981" />
                                    ) : c.navigateTo && onNavigate ? (
                                        <Tooltip text="챌린지 수행을 위해 해당 페이지로 이동합니다.">
                                            <button
                                                onClick={() => { handleComplete(c.id, c.reward); onNavigate(c.navigateTo); }}
                                                style={{ background: 'linear-gradient(135deg, var(--primary), #EC4899)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                이동하기 →
                                            </button>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip text="미션을 완료하고 보상을 받습니다.">
                                            <button
                                                onClick={() => handleComplete(c.id, c.reward)}
                                                style={{ background: 'var(--primary-faint)', color: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                완료
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Daily Question */}
                <div style={{ background: 'linear-gradient(135deg, #F3E8FF, #FECDD3)', borderRadius: '22px', padding: '25px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Star size={20} color="#9333EA" />
                        <h3 style={{ margin: 0, fontWeight: 800, color: '#9333EA' }}>오늘의 소울 질문</h3>
                    </div>
                    <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4B5563', marginBottom: '15px', lineHeight: 1.5 }}>
                        "{todayQuestion}"
                    </p>
                    {!todayAnswered ? (
                        <AnimatePresence>
                            {!showAnswerBox ? (
                                <button onClick={() => setShowAnswerBox(true)} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#9333EA', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Edit3 size={16} /> 나의 대답 남기기
                                </button>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <textarea
                                        value={answerInput}
                                        onChange={e => setAnswerInput(e.target.value)}
                                        placeholder="솔직하게 나눠주세요 💜"
                                        style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid #9333EA30', resize: 'none', height: '100px', fontSize: '0.95rem', background: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    />
                                    <button onClick={handleAnswerSubmit} style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '12px', background: '#9333EA', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                                        답변 공유하기 (+10💎)
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 800 }}>
                            <CheckCircle size={20} /> 오늘의 질문에 답했어요!
                        </div>
                    )}
                </div>

                {/* 소울 질문 히스토리 */}
                {(() => {
                    const history = (() => { try { return JSON.parse(localStorage.getItem('lumini_soul_history') || '[]'); } catch { return []; } })();
                    if (history.length === 0) return null;
                    return (
                        <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '22px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                📚 나의 소울 기록 <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{history.length}개</span>
                            </h3>
                            <div style={{ display: 'grid', gap: '12px', maxHeight: '320px', overflowY: 'auto' }}>
                                {history.map((item, idx) => (
                                    <div key={idx} style={{ padding: '14px 16px', borderRadius: '14px', background: idx === 0 ? 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' : 'var(--background)', border: `1px solid ${idx === 0 ? '#8B5CF620' : 'var(--glass-border)'}` }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{item.date} {idx === 0 ? '🔵 오늘' : ''}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6D28D9', fontWeight: 700, marginBottom: '6px', fontStyle: 'italic' }}>Q. {item.question}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>{item.answer}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* Streak Rewards Preview */}
                <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '22px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={20} color="#F59E0B" /> 연속 달성 보상
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {[
                            { day: 3, reward: '50💎' },
                            { day: 7, reward: '배지' },
                            { day: 14, reward: '200💎' },
                            { day: 30, reward: '👑스킨' },
                        ].map(r => (
                            <div key={r.day} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: streak >= r.day ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 8px',
                                    fontSize: '0.75rem', fontWeight: 800,
                                    color: streak >= r.day ? 'white' : '#94a3b8',
                                }}>
                                    {streak >= r.day ? '✓' : `${r.day}일`}
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: streak >= r.day ? '#F59E0B' : 'var(--text-muted)' }}>{r.reward}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%',
                            background: '#9333EA', color: 'white',
                            padding: '12px 24px', borderRadius: '100px',
                            fontWeight: 800, zIndex: 9999,
                            boxShadow: '0 8px 30px rgba(147,51,234,0.4)',
                        }}
                    >
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyChallengesPage;
