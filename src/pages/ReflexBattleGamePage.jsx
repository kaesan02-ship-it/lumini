import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

// 헷갈리는 색깔/청기홍기 문구를 제거하고 순수 4방향(상·하·좌·우)으로 통일
const DIRECTIONS = [
    { id: 'UP', label: '⬆️ 위쪽', shortLabel: '⬆️ 위', opposite: 'DOWN', keyCode: 'ArrowUp' },
    { id: 'DOWN', label: '⬇️ 아래쪽', shortLabel: '⬇️ 아래', opposite: 'UP', keyCode: 'ArrowDown' },
    { id: 'LEFT', label: '⬅️ 왼쪽', shortLabel: '⬅️ 왼쪽', opposite: 'RIGHT', keyCode: 'ArrowLeft' },
    { id: 'RIGHT', label: '➡️ 오른쪽', shortLabel: '➡️ 오른쪽', opposite: 'LEFT', keyCode: 'ArrowRight' },
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
    const comboRef = useRef(0);
    const maxComboRef = useRef(0);
    const promptRef = useRef({ targetDir: DIRECTIONS[0], isFrog: false, answerId: 'UP' });

    const nextPrompt = useCallback(() => {
        const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const isFrog = Math.random() < 0.5; // 50% 확률로 청개구리(반대 방향) 지시
        const answerId = isFrog ? dir.opposite : dir.id;
        const nextP = { targetDir: dir, isFrog, answerId };
        promptRef.current = nextP;
        setPrompt(nextP);
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

    const handleChoice = useCallback(
        (chosenId) => {
            if (gameState !== 'playing') return;

            if (chosenId === promptRef.current.answerId) {
                const nextC = comboRef.current + 1;
                const nextMax = Math.max(maxComboRef.current, nextC);
                const gained = 50 + nextC * 12;
                const nextS = scoreRef.current + gained;

                comboRef.current = nextC;
                maxComboRef.current = nextMax;
                scoreRef.current = nextS;
                setCombo(nextC);
                setMaxCombo(nextMax);
                setScore(nextS);
                setTimeLeft((t) => Math.min(20.0, +(t + 0.5).toFixed(1)));
                nextPrompt();
            } else {
                comboRef.current = 0;
                setCombo(0);
                setTimeLeft((t) => Math.max(0.1, +(t - 2.0).toFixed(1)));
                toast.error('앗! 방향이 틀렸어요 (-2초)', { duration: 700 });
                nextPrompt();
            }
        },
        [gameState, nextPrompt]
    );

    // PC 키보드 방향키(↑, ↓, ←, →) 및 WASD 입력 완벽 지원
    useEffect(() => {
        if (gameState !== 'playing') return;
        const onKeyDown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                handleChoice('UP');
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                handleChoice('DOWN');
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                handleChoice('LEFT');
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                handleChoice('RIGHT');
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameState, handleChoice]);

    const startGame = () => {
        scoreRef.current = 0;
        comboRef.current = 0;
        maxComboRef.current = 0;
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setTimeLeft(20.0);
        nextPrompt();
        setGameState('playing');
    };

    const renderDirButton = (dirId) => {
        const d = DIRECTIONS.find((item) => item.id === dirId);
        return (
            <motion.button
                key={d.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleChoice(d.id)}
                title={`${d.label} 선택 (키보드 방향키 사용 가능)`}
                style={{
                    padding: '18px 12px',
                    borderRadius: '18px',
                    border: '2px solid #cbd5e1',
                    background: 'white',
                    color: '#0f172a',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #cbd5e1',
                    width: '100%',
                }}
            >
                {d.shortLabel}
            </motion.button>
        );
    };

    return (
        <ArcadeGameLayout
            gameId="reflex-battle"
            title="🧠 청개구리 반사신경"
            subtitle="초록색(🟢)은 같은 방향, 노란색 청개구리(🐸)는 반대 방향! (터치 & 키보드 방향키 지원)"
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
                        그대로 vs 반대로! 순발력 방향키 배틀
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                        <strong>🟢 [그대로!]</strong>가 뜨면 화살표와 <strong>같은 방향</strong>을 누르고,<br />
                        <strong>🐸 [청개구리 반대로!]</strong>가 뜨면 화살표와 <strong>정반대 방향(위↔아래, 왼쪽↔오른쪽)</strong>을 누르세요!<br />
                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                            💡 스마트폰 터치와 PC 키보드 방향키(↑·↓·←·→) 모두 사용할 수 있어요!
                        </span>
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
                            marginBottom: '16px',
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
                        initial={{ scale: 0.92, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: prompt.isFrog
                                ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                                : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                            border: prompt.isFrog ? '2.5px solid #f59e0b' : '2.5px solid #10b981',
                            borderRadius: '24px',
                            padding: '24px 16px',
                            textAlign: 'center',
                            marginBottom: '18px',
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '5px 14px',
                                borderRadius: '100px',
                                fontWeight: 900,
                                fontSize: '0.9rem',
                                background: prompt.isFrog ? '#d97706' : '#059669',
                                color: 'white',
                                marginBottom: '10px',
                            }}
                        >
                            {prompt.isFrog ? '🐸 청개구리! (반대 방향 누르기!)' : '🟢 그대로! (같은 방향 누르기!)'}
                        </div>
                        <div style={{ fontSize: '2.1rem', fontWeight: 950, color: '#0f172a' }}>
                            {prompt.targetDir.label}
                        </div>
                    </motion.div>

                    {/* 십자(D-Pad) 배열 방향키 컨트롤러 (색깔 혼동 없이 깔끔한 방향키 형태) */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '10px',
                            maxWidth: '340px',
                            margin: '0 auto',
                            alignItems: 'center',
                        }}
                    >
                        <div />
                        {renderDirButton('UP')}
                        <div />
                        {renderDirButton('LEFT')}
                        {renderDirButton('DOWN')}
                        {renderDirButton('RIGHT')}
                    </div>
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '12px',
                            fontSize: '0.76rem',
                            color: '#64748b',
                            fontWeight: 600,
                        }}
                    >
                        ⌨️ 키보드 방향키(↑ ↓ ← →) 또는 화면 버튼 터치
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
