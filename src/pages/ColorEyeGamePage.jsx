import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Eye, Timer } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

const PET_ICONS = ['🐣', '🦊', '🐰', '🐼', '🐱', '🐻', '🦄', '🐶'];

const ColorEyeGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | playing | finished
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15.0);
    const [board, setBoard] = useState({ size: 2, baseColor: '', diffColor: '', answerIdx: 0, icon: '🐣' });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const levelRef = useRef(1);

    const generatePuzzle = useCallback((lv) => {
        const size = lv <= 2 ? 2 : lv <= 5 ? 3 : lv <= 9 ? 4 : lv <= 14 ? 5 : lv <= 20 ? 6 : 7;
        const hue = Math.floor(Math.random() * 360);
        const sat = 65 + Math.floor(Math.random() * 20);
        const light = 48 + Math.floor(Math.random() * 14);
        // 레벨이 올라갈수록 명도 차이가 줄어듦 (최소 3.5%)
        const delta = Math.max(3.5, 22 - lv * 0.75);
        const diffLight = light + (Math.random() > 0.5 ? delta : -delta);

        const baseColor = `hsl(${hue}, ${sat}%, ${light}%)`;
        const diffColor = `hsl(${hue}, ${sat}%, ${diffLight}%)`;
        const answerIdx = Math.floor(Math.random() * (size * size));
        const icon = PET_ICONS[(lv - 1) % PET_ICONS.length];

        setBoard({ size, baseColor, diffColor, answerIdx, icon });
    }, []);

    const finishGame = useCallback(async () => {
        setGameState('finished');
        const finalScore = scoreRef.current;
        const finalLv = levelRef.current;

        if (finalScore > 0) {
            await submitArcadeScore({
                gameId: 'color-eye',
                score: finalScore,
                detail: `Lv.${finalLv} 달성`,
                user,
                userName,
                mbtiType,
                season: 'season_3',
            });
            const reward = Math.min(30, Math.max(5, Math.floor(finalScore / 25)));
            earnCrystals(reward, '컬러 아이 테스트 보상');
            toast.success(`Lv.${finalLv} 달성! +${reward}💎 크리스탈 획득!`);
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
        levelRef.current = 1;
        setScore(0);
        setLevel(1);
        setTimeLeft(15.0);
        generatePuzzle(1);
        setGameState('playing');
    };

    const handleTileClick = (idx) => {
        if (gameState !== 'playing') return;
        if (idx === board.answerIdx) {
            const gained = 20 + levelRef.current * 5;
            const nextScore = scoreRef.current + gained;
            const nextLv = levelRef.current + 1;
            scoreRef.current = nextScore;
            levelRef.current = nextLv;
            setScore(nextScore);
            setLevel(nextLv);
            setTimeLeft((t) => Math.min(15.0, +(t + 1.1).toFixed(1)));
            generatePuzzle(nextLv);
        } else {
            setTimeLeft((t) => Math.max(0.1, +(t - 2.0).toFixed(1)));
            toast.error('앗! 다른 타일이에요 (-2초)', { duration: 900 });
        }
    };

    return (
        <ArcadeGameLayout
            gameId="color-eye"
            title="🎨 컬러 아이 테스트"
            subtitle="미세하게 색이 다른 소울펫 타일 1개를 찾아 터치하세요!"
            accentColor="#ec4899"
            accentBg="#fdf2f8"
            onBack={onBack}
            score={score}
            extraStatLabel="현재 단계 / 남은 시간"
            extraStatValue={`Lv.${level} · ${timeLeft.toFixed(1)}초`}
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎨👀</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                        당신의 절대색감 레벨은?
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                        격자판 속 <strong>미세하게 다른 색깔의 소울펫 타일 딱 1개</strong>를 터치하세요!<br />
                        정답을 맞히면 시간이 <strong>+1.1초</strong> 추가되고 격자가 점점 더 촘촘해집니다.
                    </p>
                    <Tooltip text="컬러 아이 테스트를 시작합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #ec4899, #db2777)',
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
                                boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)',
                            }}
                        >
                            <Play size={18} /> 게임 시작하기
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {gameState === 'playing' && (
                <div>
                    {/* 타이머 게이지 바 */}
                    <div
                        style={{
                            height: '10px',
                            background: '#f1f5f9',
                            borderRadius: '100px',
                            overflow: 'hidden',
                            marginBottom: '18px',
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.min(100, (timeLeft / 15) * 100)}%`,
                                height: '100%',
                                background: timeLeft < 4 ? '#ef4444' : 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                                transition: 'width 0.1s linear',
                            }}
                        />
                    </div>

                    {/* 타일 그리드 */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${board.size}, 1fr)`,
                            gap: board.size >= 6 ? '6px' : '10px',
                            maxWidth: '380px',
                             aspectRatio: '1 / 1',
                            margin: '0 auto',
                        }}
                    >
                        {Array.from({ length: board.size * board.size }).map((_, idx) => (
                            <motion.button
                                key={`${level}-${idx}`}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => handleTileClick(idx)}
                                title="색이 다른 타일이라고 생각되면 클릭하세요"
                                style={{
                                    background: idx === board.answerIdx ? board.diffColor : board.baseColor,
                                    border: 'none',
                                    borderRadius: board.size >= 6 ? '10px' : '16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: board.size >= 6 ? '1.1rem' : board.size >= 4 ? '1.4rem' : '2rem',
                                    boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.12)',
                                    userSelect: 'none',
                                }}
                            >
                                {board.icon}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                    <div style={{ fontSize: '3.6rem', marginBottom: '10px' }}>🏆</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        최종 Lv.{level} 달성! ({score.toLocaleString()}점)
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '22px' }}>
                        {level >= 20
                            ? '가히 독수리의 눈! 상위 1% 절대색감입니다 ✨'
                            : level >= 12
                            ? '뛰어난 색감 분별력을 가지고 계시네요! 🎨'
                            : '조금만 더 집중하면 훨씬 높은 단계에 도달할 수 있어요!'}
                    </p>
                    <Tooltip text="다시 도전하여 시즌 3 최고 기록을 경신합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #ec4899, #db2777)',
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

export default ColorEyeGamePage;
