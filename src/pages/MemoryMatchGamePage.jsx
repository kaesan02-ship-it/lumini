import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

// 최대 18쌍(36장 = 6x6 보드)까지 지원하는 18종 소울펫 아이콘 풀
const CARD_POOL = [
    '🦊', '🐰', '🐼', '🐱', '🐻', '🦄',
    '🐶', '🐣', '🐹', '🦁', '🐯', '🐨',
    '🐸', '🐙', '🦋', '🐬', '🦉', '🐧',
];

// 오답 시 차감되는 시간 패널티 (초)
const WRONG_PENALTY_SEC = 2.0;

// 스테이지별 카드 쌍(Pair) 개수 — 최대 18쌍(36장)까지 대폭 확장!
const getPairCountForStage = (st) => {
    if (st === 1) return 3;   // 6장 (3x2)
    if (st === 2) return 4;   // 8장 (4x2)
    if (st === 3) return 6;   // 12장 (4x3)
    if (st === 4) return 8;   // 16장 (4x4)
    if (st === 5) return 10;  // 20장 (5x4)
    if (st === 6) return 12;  // 24장 (6x4)
    if (st === 7) return 15;  // 30장 (6x5)
    return 18;                // Stage 8+: 36장 (6x6 초대형 판!)
};

const MemoryMatchGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | preview | playing | finished
    const [stage, setStage] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45.0);
    const [cards, setCards] = useState([]);
    const [flippedIds, setFlippedIds] = useState([]);
    const [wrongIds, setWrongIds] = useState([]);
    const [penaltyFlash, setPenaltyFlash] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const stageRef = useRef(1);
    const finishedRef = useRef(false);
    const previewTimerRef = useRef(null);
    const penaltyTimerRef = useRef(null);

    const setupStage = useCallback((st) => {
        const pairCount = getPairCountForStage(st);
        const icons = CARD_POOL.slice(0, pairCount);
        const deck = [...icons, ...icons]
            .sort(() => Math.random() - 0.5)
            .map((icon, idx) => ({
                id: `${st}-${idx}`,
                icon,
                matched: false,
            }));

        setCards(deck);
        setWrongIds([]);
        setFlippedIds(deck.map((c) => c.id)); // 스테이지 시작 시 앞면 공개
        setGameState('preview');

        // 카드가 많아질수록 암기 시간도 비례해서 부여 (1.8초 ~ 최대 4.2초)
        const previewMs = Math.min(4200, 1400 + pairCount * 160);
        clearTimeout(previewTimerRef.current);
        previewTimerRef.current = setTimeout(() => {
            setFlippedIds([]);
            setGameState('playing');
            setIsLocked(false);
        }, previewMs);
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(previewTimerRef.current);
            clearTimeout(penaltyTimerRef.current);
        };
    }, []);

    const finishGame = useCallback(async () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setGameState('finished');
        const finalScore = scoreRef.current;
        const finalSt = stageRef.current;
        const maxCards = getPairCountForStage(finalSt) * 2;

        if (finalScore > 0) {
            await submitArcadeScore({
                gameId: 'memory-match',
                score: finalScore,
                detail: `Stage ${finalSt} (${maxCards}장 판)`,
                user,
                userName,
                mbtiType,
                season: 'season_4',
            });
            const reward = Math.min(40, Math.max(6, Math.floor(finalScore / 90)));
            earnCrystals(reward, '소울펫 기억력 카드 시즌 4 보상');
            toast.success(`시즌 4 Stage ${finalSt} 기록 등록! +${reward}💎 획득!`);
            setRefreshTrigger((v) => v + 1);
        }
    }, [user, userName, mbtiType, earnCrystals]);

    useEffect(() => {
        if (gameState !== 'playing') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    clearInterval(timer);
                    finishGame();
                    return 0;
                }
                return +(prev - 0.1).toFixed(1);
            });
        }, 100);
        return () => clearInterval(timer);
    }, [gameState, finishGame]);

    const startGame = () => {
        finishedRef.current = false;
        scoreRef.current = 0;
        stageRef.current = 1;
        setScore(0);
        setStage(1);
        setTimeLeft(45.0);
        setPenaltyFlash(false);
        setupStage(1);
    };

    const handleCardClick = (card) => {
        if (gameState !== 'playing' || isLocked) return;
        if (card.matched || flippedIds.includes(card.id)) return;

        const nextFlipped = [...flippedIds, card.id];
        setFlippedIds(nextFlipped);

        if (nextFlipped.length === 2) {
            setIsLocked(true);
            const [firstId, secondId] = nextFlipped;
            const firstCard = cards.find((c) => c.id === firstId);
            const secondCard = cards.find((c) => c.id === secondId);

            if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
                const updated = cards.map((c) =>
                    c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
                );
                const gained = 100 + stageRef.current * 35;
                const nextS = scoreRef.current + gained;
                scoreRef.current = nextS;
                setScore(nextS);
                setCards(updated);
                setFlippedIds([]);
                setIsLocked(false);

                // 모든 카드 매칭 완료 시 다음 스테이지로!
                if (updated.every((c) => c.matched)) {
                    const nextSt = stageRef.current + 1;
                    const stageBonus = 200 + stageRef.current * 50;
                    const bonusSec = Math.min(22, 8 + stageRef.current * 2);
                    scoreRef.current += stageBonus;
                    stageRef.current = nextSt;
                    setScore(scoreRef.current);
                    setStage(nextSt);
                    setTimeLeft((t) => Math.min(75.0, +(t + bonusSec).toFixed(1)));
                    toast.success(
                        `Stage ${nextSt - 1} 클리어! (+${bonusSec}초 보너스 · 다음 판 ${getPairCountForStage(nextSt) * 2}장!)`
                    );
                    setTimeout(() => setupStage(nextSt), 450);
                }
            } else {
                // ❌ 짝 맞추기 실패 시 남은 시간 차감 패널티 (-2.0초)
                setWrongIds([firstId, secondId]);
                setPenaltyFlash(true);
                clearTimeout(penaltyTimerRef.current);
                penaltyTimerRef.current = setTimeout(() => setPenaltyFlash(false), 650);

                setTimeLeft((prev) => {
                    const nextTime = +(prev - WRONG_PENALTY_SEC).toFixed(1);
                    if (nextTime <= 0) {
                        setTimeout(() => finishGame(), 50);
                        return 0;
                    }
                    return nextTime;
                });

                setTimeout(() => {
                    setFlippedIds([]);
                    setWrongIds([]);
                    setIsLocked(false);
                }, 480);
            }
        }
    };

    // 카드 장수에 맞춰 열(Column) 개수 자동 최적화 (6장: 3열, 8~16장: 4열, 20장: 5열, 24~36장: 6열)
    const cols =
        cards.length <= 6 ? 3 : cards.length <= 16 ? 4 : cards.length <= 20 ? 5 : 6;
    const iconFontSize =
        cols >= 6 ? '1.3rem' : cols === 5 ? '1.55rem' : '1.95rem';

    return (
        <ArcadeGameLayout
            gameId="memory-match"
            title="🃏 소울펫 기억력 카드 (시즌 4)"
            subtitle="최대 36장(6×6) 도전! 틀릴 때마다 남은 시간이 2초씩 차감됩니다!"
            accentColor="#3b82f6"
            accentBg="#eff6ff"
            onBack={onBack}
            score={score}
            extraStatLabel="스테이지 (카드 수) / 남은 시간"
            extraStatValue={`Stage ${stage} (${cards.length || 6}장) · ${timeLeft.toFixed(1)}s`}
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🃏🦊</div>
                    <div
                        style={{
                            display: 'inline-block',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontWeight: 900,
                            fontSize: '0.76rem',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            marginBottom: '10px',
                        }}
                    >
                        🔥 시즌 4 NEW 규칙 적용!
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                        6장부터 최대 36장(6×6)까지! 극한 기억력 도전
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '14px' }}>
                        스테이지를 클리어할 때마다 카드가 <strong>6장 → 8장 → 12장 → 16장 → 20장 → 24장 → 30장 → 36장</strong>으로 대폭 늘어납니다!<br />
                        처음 공개되는 암기 시간 동안 소울펫 위치를 정확히 외워 최고 스테이지를 돌파하세요!
                    </p>
                    <div
                        style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            borderRadius: '14px',
                            padding: '10px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            marginBottom: '24px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <AlertTriangle size={16} /> 주의: 카드 짝이 틀릴 때마다 남은 시간이 <strong>-{WRONG_PENALTY_SEC.toFixed(1)}초</strong>씩 깎입니다!
                    </div>
                    <br />
                    <Tooltip text="소울펫 기억력 카드 시즌 4 게임을 시작합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '100px',
                                padding: '14px 36px',
                                fontSize: '1.05rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                            }}
                        >
                            <Play size={18} /> 기억력 도전 시작
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {(gameState === 'preview' || gameState === 'playing') && (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: penaltyFlash ? '#fef2f2' : '#f8fafc',
                            border: penaltyFlash ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '10px 14px',
                            marginBottom: '12px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 900,
                                fontSize: '0.86rem',
                                color: gameState === 'preview' ? '#d97706' : '#2563eb',
                            }}
                        >
                            {gameState === 'preview'
                                ? `👀 ${cards.length}장 위치를 외우세요! (곧 뒤집힙니다)`
                                : `Stage ${stage} (${cards.length}장 판) — 틀리면 -${WRONG_PENALTY_SEC}초!`}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AnimatePresence>
                                {penaltyFlash && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            fontWeight: 900,
                                            fontSize: '0.75rem',
                                            padding: '3px 8px',
                                            borderRadius: '100px',
                                        }}
                                    >
                                        ⚠️ 오답 -{WRONG_PENALTY_SEC.toFixed(1)}초!
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <span
                                style={{
                                    fontWeight: 900,
                                    fontSize: '0.95rem',
                                    color: penaltyFlash || timeLeft <= 10 ? '#ef4444' : '#0f172a',
                                }}
                            >
                                ⏱️ {timeLeft.toFixed(1)}초
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${cols}, 1fr)`,
                            gap: cols >= 6 ? '6px' : '9px',
                            maxWidth: '410px',
                            margin: '0 auto',
                        }}
                    >
                        {cards.map((card) => {
                            const isOpen = card.matched || flippedIds.includes(card.id);
                            const isWrong = wrongIds.includes(card.id);
                            return (
                                <motion.button
                                    key={card.id}
                                    whileTap={{ scale: 0.92 }}
                                    animate={isWrong ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
                                    transition={{ duration: 0.25 }}
                                    onClick={() => handleCardClick(card)}
                                    title="카드를 뒤집어 짝을 확인합니다 (틀리면 -2.0초)"
                                    style={{
                                        aspectRatio: '1 / 1.05',
                                        borderRadius: cols >= 6 ? '10px' : '14px',
                                        border: card.matched
                                            ? '2px solid #10b981'
                                            : isWrong
                                            ? '2px solid #ef4444'
                                            : isOpen
                                            ? '2px solid #3b82f6'
                                            : '1.5px solid #cbd5e1',
                                        background: card.matched
                                            ? '#ecfdf5'
                                            : isWrong
                                            ? '#fef2f2'
                                            : isOpen
                                            ? '#eff6ff'
                                            : 'linear-gradient(135deg, #1e293b, #334155)',
                                        fontSize: iconFontSize,
                                        padding: 0,
                                        cursor: card.matched ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                                    }}
                                >
                                    {isOpen ? card.icon : '✨'}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                    <div style={{ fontSize: '3.6rem', marginBottom: '10px' }}>🃏🏆</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        시즌 4 · Stage {stage} ({getPairCountForStage(stage) * 2}장 판) 도달! ({score.toLocaleString()}점)
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '22px' }}>
                        {stage >= 7
                            ? '오답 패널티를 뚫고 30장 이상의 초대형 보드까지 돌파한 초인적인 기억력입니다! 🧠'
                            : stage >= 4
                            ? '기억력이 아주 뛰어나시네요! 실수 없이 24장·36장 판에도 도전해 보세요!'
                            : '처음 공개 시간 동안 같은 동물 위치부터 눈도장을 찍어두면 시간 차감을 피할 수 있어요!'}
                    </p>
                    <Tooltip text="다시 도전하여 시즌 4 최고 기록을 경신합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '100px',
                                padding: '14px 32px',
                                fontSize: '1rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <RotateCcw size={18} /> 다시 도전하기
                        </motion.button>
                    </Tooltip>
                </div>
            )}
        </ArcadeGameLayout>
    );
};

export default MemoryMatchGamePage;
