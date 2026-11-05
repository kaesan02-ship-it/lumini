import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Zap } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

const SpeedNumberGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | playing | finished
    const [numbers, setNumbers] = useState([]);
    const [nextNum, setNextNum] = useState(1);
    const [elapsed, setElapsed] = useState(0);
    const [score, setScore] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => {
            if (startTimeRef.current) {
                setElapsed((Date.now() - startTimeRef.current) / 1000);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [gameState]);

    const startGame = () => {
        const shuffled = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        setNumbers(shuffled);
        setNextNum(1);
        setElapsed(0);
        setScore(0);
        startTimeRef.current = Date.now();
        setGameState('playing');
    };

    const handleCellTap = async (num) => {
        if (gameState !== 'playing') return;
        if (num !== nextNum) {
            // 오답 시 0.5초 페널티 (시작 시간을 앞당김)
            startTimeRef.current -= 500;
            toast.error(`${nextNum}번을 눌러야 해요! (+0.5초 페널티)`, { duration: 700 });
            return;
        }

        if (num === 25) {
            const finalSeconds = (Date.now() - startTimeRef.current) / 1000;
            setElapsed(finalSeconds);
            // 빠를수록 고득점 (예: 10초 클리어 시 2000점, 최소 300점 보장)
            const finalScore = Math.max(300, Math.round(3000 - finalSeconds * 100));
            setScore(finalScore);
            setGameState('finished');

            await submitArcadeScore({
                gameId: 'speed-number',
                score: finalScore,
                detail: `${finalSeconds.toFixed(2)}초 클리어`,
                user,
                userName,
                mbtiType,
                season: 'season_3',
            });
            const reward = Math.min(35, Math.max(8, Math.floor(finalScore / 80)));
            earnCrystals(reward, '1~25 스피드 터치 클리어');
            toast.success(`${finalSeconds.toFixed(2)}초 돌파! +${reward}💎 획득!`);
            setRefreshTrigger((v) => v + 1);
        } else {
            setNextNum(num + 1);
            const currentSec = (Date.now() - startTimeRef.current) / 1000;
            setScore(Math.max(100, Math.round(num * 80 - currentSec * 20)));
        }
    };

    return (
        <ArcadeGameLayout
            gameId="speed-number"
            title="⚡ 1~25 스피드 터치"
            subtitle="1부터 25까지 순서대로 가장 빠르게 터치하세요!"
            accentColor="#f59e0b"
            accentBg="#fef3c7"
            onBack={onBack}
            score={score}
            extraStatLabel={gameState === 'playing' ? '다음 숫자 / 경과 시간' : '클리어 기록'}
            extraStatValue={
                gameState === 'playing'
                    ? `[${nextNum}] · ${elapsed.toFixed(2)}초`
                    : elapsed > 0
                    ? `${elapsed.toFixed(2)}초`
                    : '도전 대기중'
            }
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '12px' }}>⚡🔢</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                        초고속 시야각 & 순발력 테스트!
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                        5×5 보드에 무작위로 섞인 <strong>1부터 25까지의 숫자</strong>를 순서대로 터치하세요!<br />
                        클리어 시간이 짧을수록 더 높은 시즌 3 랭킹 점수를 획득합니다.
                    </p>
                    <Tooltip text="1~25 스피드 터치 게임을 시작합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
                                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                            }}
                        >
                            <Play size={18} /> 타임어택 시작
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {gameState === 'playing' && (
                <div>
                    <div
                        style={{
                            textAlign: 'center',
                            marginBottom: '14px',
                            fontSize: '0.95rem',
                            fontWeight: 900,
                            color: '#b45309',
                        }}
                    >
                        지금 눌러야 할 숫자: <span style={{ fontSize: '1.35rem', color: '#d97706' }}>{nextNum}</span>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '8px',
                            maxWidth: '380px',
                            aspectRatio: '1 / 1',
                            margin: '0 auto',
                        }}
                    >
                        {numbers.map((num) => {
                            const isCleared = num < nextNum;
                            return (
                                <motion.button
                                    key={num}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => !isCleared && handleCellTap(num)}
                                    disabled={isCleared}
                                    title={`${num}번 숫자 터치`}
                                    style={{
                                        background: isCleared
                                            ? '#f1f5f9'
                                            : 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
                                        color: isCleared ? '#cbd5e1' : '#92400e',
                                        border: isCleared ? '1px solid #e2e8f0' : '2px solid #fcd34d',
                                        borderRadius: '14px',
                                        fontSize: '1.3rem',
                                        fontWeight: 900,
                                        cursor: isCleared ? 'default' : 'pointer',
                                        boxShadow: isCleared ? 'none' : '0 4px 0 #f59e0b40',
                                        transition: 'all 0.12s',
                                    }}
                                >
                                    {isCleared ? '✓' : num}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                    <div style={{ fontSize: '3.6rem', marginBottom: '10px' }}>⚡🏆</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        {elapsed.toFixed(2)}초 클리어! ({score.toLocaleString()}점)
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '22px' }}>
                        {elapsed <= 12
                            ? '빛의 속도! 프로게이머급 동체시력입니다 🔥'
                            : elapsed <= 18
                            ? '엄청난 순발력이에요! 10초대 진입에 도전해 보세요!'
                            : '손가락 워밍업 완료! 한 번 더 하면 훨씬 빨라집니다!'}
                    </p>
                    <Tooltip text="다시 플레이하여 최단 기록을 단축합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
                            <RotateCcw size={18} /> 최단 기록 재도전
                        </motion.button>
                    </Tooltip>
                </div>
            )}
        </ArcadeGameLayout>
    );
};

export default SpeedNumberGamePage;
