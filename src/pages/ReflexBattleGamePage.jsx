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

const DIRECTIONS = [
    { id: 'UP', label: '⬆️ 위 (청기)', opposite: 'DOWN', color: '#3b82f6', bg: '#eff6ff' },
    { id: 'DOWN', label: '⬇️ 아래 (홍기)', opposite: 'UP', color: '#ef4444', bg: '#fef2f2' },
    { id: 'LEFT', label: '⬅️ 왼쪽 (녹기)', opposite: 'RIGHT', color: '#10b981', bg: '#ecfdf5' },
    { id: 'RIGHT', label: '➡️ 오른쪽 (황기)', opposite: 'LEFT', color: '#f59e0b', bg: '#fffbeb' },
];

const ReflexBattleGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | playing | finished
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20.0);
    const [prompt, setPrompt] = useState({ targetDir: DIRECTIONS[0], isFrog: false, answerId: 'UP' });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const maxComboRef = useRef(0);

    const nextPrompt = useCallback(() => {
        const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const isFrog = Math.random() < 0.48; // 약 절반 확률로 청개구리(반대) 모드
        const answerId = isFrog ? dir.opposite : dir.id;
        setPrompt({ targetDir: dir, isFrog, answerId });
    }, []);

    const finishGame = useCallback(async () => {
        setGameState('finished');
        const finalScore = scoreRef.current;
        const bestCombo = maxComboRef.current;

        if (finalScore > 0) {
            await submitArcadeScore({
                gameId: 'reflex-battle',
                score: finalScore,
                detail: `${bestCombo}콤보 달성`,
                user,
                userName,
                mbtiType,
                season: 'season_3',
            });
            const reward = Math.min(35, Math.max(5, Math.floor(finalScore / 90)));
            earnCrystals(reward, '청개구리 반사신경 배틀 보상');
            toast.success(`최고 ${bestCombo}콤보! +${reward}💎 획득!`);
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
        maxComboRef.current = 0;
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setTimeLeft(20.0);
        nextPrompt();
        setGameState('playing');
    };

    const handleChoice = (chosenId) => {
        if (gameState !== 'playing') return;

        if (chosenId === prompt.answerId) {
            const nextC = combo + 1;
            const nextMax = Math.max(maxComboRef.current, nextC);
            const gained = 50 + nextC * 12;
            const nextS = scoreRef.current + gained;

            scoreRef.current = nextS;
            maxComboRef.current = nextMax;
            setCombo(nextC);
            setMaxCombo(nextMax);
            setScore(nextS);
            setTimeLeft((t) => Math.min(20.0, +(t + 0.5).toFixed(1)));
            nextPrompt();
        } else {
            setCombo(0);
            setTimeLeft((t) => Math.max(0.1, +(t - 2.0).toFixed(1)));
            toast.error('반대 방향을 헷갈렸어요! (-2초)', { duration: 750 });
            nextPrompt();
        }
    };

    return (
        <ArcadeGameLayout
            gameId="reflex-battle"
            title="🧠 청개구리 반사신경"
            subtitle="일반 지시는 그대로! '청개구리🐸' 지시는 정반대 방향을 누르세요!"
            accentColor="#10b981"
            accentBg="#ecfdf5"
            onBack={onBack}
            score={score}
            extraStatLabel="콤보 / 남은 시간"
            extraStatValue={`${combo}콤보 · ${timeLeft.toFixed(1)}초`}
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🐸🧠</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                        두뇌 회전 & 순발력 극한 테스트!
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                        <strong>🟢 [그대로]</strong>가 뜨면 지시한 방향을 그대로 터치하고,<br />
                        <strong>🐸 [청개구리 반대로!]</strong>가 뜨면 <strong>정반대 방향(위↔아래, 좌↔우)</strong>을 빠르게 터치하세요!
                    </p>
                    <Tooltip text="청개구리 반사신경 배틀을 시작합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
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
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                            }}
                        >
                            <Play size={18} /> 순발력 배틀 시작
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {gameState === 'playing' && (
                <div>
                    {/* 타이머 게이지 */}
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
                                width: `${Math.min(100, (timeLeft / 20) * 100)}%`,
                                height: '100%',
                                background: timeLeft < 4 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                                transition: 'width 0.1s linear',
                            }}
                        />
                    </div>

                    {/* 중앙 지시어 전광판 */}
                    <motion.div
                        key={`${prompt.targetDir.id}-${prompt.isFrog}-${combo}`}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: prompt.isFrog
                                ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                                : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                            border: prompt.isFrog ? '2.5px solid #f59e0b' : '2.5px solid #10b981',
                            borderRadius: '24px',
                            padding: '28px 18px',
                            textAlign: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '5px 14px',
                                borderRadius: '100px',
                                fontWeight: 900,
                                fontSize: '0.88rem',
                                background: prompt.isFrog ? '#d97706' : '#059669',
                                color: 'white',
                                marginBottom: '10px',
                            }}
                        >
                            {prompt.isFrog ? '🐸 청개구리! (정반대 방향 클릭!)' : '🟢 그대로! (같은 방향 클릭!)'}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a' }}>
                            {prompt.targetDir.label}
                        </div>
                    </motion.div>

                    {/* 4방향 컨트롤러 버튼 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {DIRECTIONS.map((d) => (
                            <motion.button
                                key={d.id}
                                whileTap={{ scale: 0.93 }}
                                onClick={() => handleChoice(d.id)}
                                title={`${d.label} 선택`}
                                style={{
                                    padding: '20px 14px',
                                    borderRadius: '18px',
                                    border: `2px solid ${d.color}`,
                                    background: d.bg,
                                    color: d.color,
                                    fontSize: '1.1rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                                }}
                            >
                                {d.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                    <div style={{ fontSize: '3.6rem', marginBottom: '10px' }}>🐸🏆</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        최고 {maxCombo}콤보! ({score.toLocaleString()}점)
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '22px' }}>
                        {maxCombo >= 25
                            ? '초감각 뇌섹남녀! 청개구리도 울고 갈 순발력입니다 ⚡'
                            : maxCombo >= 15
                            ? '순발력이 아주 훌륭해요! 25콤보 돌파에 도전해 보세요!'
                            : '청개구리 반전 지시어에 익숙해지면 점수가 폭발합니다!'}
                    </p>
                    <Tooltip text="다시 도전하여 최고 콤보 기록을 경신합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
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

export default ReflexBattleGamePage;
