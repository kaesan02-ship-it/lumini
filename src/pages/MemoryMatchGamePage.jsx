import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

const CARD_POOL = ['🦊', '🐰', '🐼', '🐱', '🐻', '🦄', '🐶', '🐣', '🐹', '🦁'];

const MemoryMatchGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | preview | playing | finished
    const [stage, setStage] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(40.0);
    const [cards, setCards] = useState([]);
    const [flippedIds, setFlippedIds] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const stageRef = useRef(1);

    const setupStage = useCallback((st) => {
        // Stage 1: 3쌍(6장), Stage 2: 4쌍(8장), Stage 3: 6쌍(12장), Stage 4+: 8쌍(16장)
        const pairCount = st === 1 ? 3 : st === 2 ? 4 : st === 3 ? 6 : 8;
        const icons = CARD_POOL.slice(0, pairCount);
        const deck = [...icons, ...icons]
            .sort(() => Math.random() - 0.5)
            .map((icon, idx) => ({
                id: `${st}-${idx}`,
                icon,
                matched: false,
            }));

        setCards(deck);
        setFlippedIds(deck.map((c) => c.id)); // 처음 1.8초 동안 앞면 공개
        setGameState('preview');

        setTimeout(() => {
            setFlippedIds([]);
            setGameState('playing');
            setIsLocked(false);
        }, 1800);
    }, []);

    const finishGame = useCallback(async () => {
        setGameState('finished');
        const finalScore = scoreRef.current;
        const finalSt = stageRef.current;

        if (finalScore > 0) {
            await submitArcadeScore({
                gameId: 'memory-match',
                score: finalScore,
                detail: `Stage ${finalSt} 달성`,
                user,
                userName,
                mbtiType,
                season: 'season_3',
            });
            const reward = Math.min(35, Math.max(6, Math.floor(finalScore / 90)));
            earnCrystals(reward, '소울펫 기억력 카드 보상');
            toast.success(`Stage ${finalSt} 기록 등록! +${reward}💎 획득!`);
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
        scoreRef.current = 0;
        stageRef.current = 1;
        setScore(0);
        setStage(1);
        setTimeLeft(40.0);
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
                const gained = 120 + stageRef.current * 30;
                const nextS = scoreRef.current + gained;
                scoreRef.current = nextS;
                setScore(nextS);
                setCards(updated);
                setFlippedIds([]);
                setIsLocked(false);

                // 모든 카드 매칭 완료 시 다음 스테이지로!
                if (updated.every((c) => c.matched)) {
                    const nextSt = stageRef.current + 1;
                    const stageBonus = 200;
                    scoreRef.current += stageBonus;
                    stageRef.current = nextSt;
                    setScore(scoreRef.current);
                    setStage(nextSt);
                    setTimeLeft((t) => Math.min(45.0, +(t + 8.0).toFixed(1)));
                    toast.success(`Stage ${nextSt - 1} 클리어! (+8초 보너스)`);
                    setTimeout(() => setupStage(nextSt), 400);
                }
            } else {
                setTimeout(() => {
                    setFlippedIds([]);
                    setIsLocked(false);
                }, 550);
            }
        }
    };

    const cols = cards.length <= 6 ? 3 : 4;

    return (
        <ArcadeGameLayout
            gameId="memory-match"
            title="🃏 소울펫 기억력 카드"
            subtitle="1.8초간 공개되는 소울펫의 위치를 기억해 빠르게 짝을 맞추세요!"
            accentColor="#3b82f6"
            accentBg="#eff6ff"
            onBack={onBack}
            score={score}
            extraStatLabel="스테이지 / 남은 시간"
            extraStatValue={`Stage ${stage} · ${timeLeft.toFixed(1)}초`}
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🃏🦊</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                        순간 기억력 타임어택!
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                        스테이지 시작 시 <strong>1.8초 동안 모든 카드의 소울펫</strong>을 보여줍니다.<br />
                        모든 짝을 맞추면 <strong>+8초 시간 보너스</strong>와 함께 다음 스테이지로 진출합니다!
                    </p>
                    <Tooltip text="소울펫 기억력 카드 게임을 시작합니다">
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
                            textAlign: 'center',
                            marginBottom: '12px',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            color: gameState === 'preview' ? '#d97706' : '#2563eb',
                        }}
                    >
                        {gameState === 'preview'
                            ? '👀 위치를 외우세요! (곧 카드가 뒤집힙니다)'
                            : `Stage ${stage} 진행 중 — 같은 소울펫 짝을 찾으세요!`}
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${cols}, 1fr)`,
                            gap: '10px',
                            maxWidth: '380px',
                            margin: '0 auto',
                        }}
                    >
                        {cards.map((card) => {
                            const isOpen = card.matched || flippedIds.includes(card.id);
                            return (
                                <motion.button
                                    key={card.id}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => handleCardClick(card)}
                                    title="카드를 뒤집어 짝을 확인합니다"
                                    style={{
                                        aspectRatio: '1 / 1.1',
                                        borderRadius: '16px',
                                        border: card.matched
                                            ? '2px solid #10b981'
                                            : isOpen
                                            ? '2px solid #3b82f6'
                                            : '2px solid #cbd5e1',
                                        background: card.matched
                                            ? '#ecfdf5'
                                            : isOpen
                                            ? '#eff6ff'
                                            : 'linear-gradient(135deg, #1e293b, #334155)',
                                        fontSize: '2rem',
                                        cursor: card.matched ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
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
                        Stage {stage} 달성! ({score.toLocaleString()}점)
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '22px' }}>
                        {stage >= 6
                            ? '사진 찍듯 외우는 포토그래픽 메모리! 대단합니다 🧠'
                            : stage >= 4
                            ? '기억력이 아주 뛰어나시네요! 최고 기록에 도전해 보세요!'
                            : '처음 1.8초 동안 모서리 카드부터 외우면 훨씬 쉬워요!'}
                    </p>
                    <Tooltip text="다시 도전하여 더 높은 스테이지에 오릅니다">
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
