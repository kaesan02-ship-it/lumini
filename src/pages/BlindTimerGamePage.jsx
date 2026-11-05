import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Timer } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

const TARGETS = [3.33, 5.55, 7.77];

const BlindTimerGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | running | result | finished
    const [roundIdx, setRoundIdx] = useState(0);
    const [currentSec, setCurrentSec] = useState(0);
    const [roundHistory, setRoundHistory] = useState([]);
    const [score, setScore] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const startRef = useRef(null);
    const rafRef = useRef(null);

    const targetSec = TARGETS[roundIdx] || 7.77;

    useEffect(() => {
        if (gameState !== 'running') return;
        const tick = () => {
            if (startRef.current) {
                const elapsed = (performance.now() - startRef.current) / 1000;
                setCurrentSec(elapsed);
                if (elapsed >= 12.0) {
                    handleStop(12.0);
                    return;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [gameState, roundIdx]);

    const startAll = () => {
        setRoundIdx(0);
        setRoundHistory([]);
        setScore(0);
        startRound();
    };

    const startRound = () => {
        setCurrentSec(0);
        startRef.current = performance.now();
        setGameState('running');
    };

    const handleStop = async (forcedTime = null) => {
        if (gameState !== 'running') return;
        cancelAnimationFrame(rafRef.current);

        const stoppedAt =
            forcedTime !== null ? forcedTime : (performance.now() - startRef.current) / 1000;
        setCurrentSec(stoppedAt);

        const diff = Math.abs(stoppedAt - targetSec);
        const roundPts = diff < 0.015 ? 1000 : Math.max(100, Math.round(1000 - diff * 750));

        const nextHistory = [
            ...roundHistory,
            { round: roundIdx + 1, target: targetSec, actual: stoppedAt, diff, points: roundPts },
        ];
        const nextTotalScore = score + roundPts;
        setRoundHistory(nextHistory);
        setScore(nextTotalScore);
        setGameState('result');

        if (diff <= 0.05) {
            toast.success(`소름 돋는 칼박자! 오차 ${diff.toFixed(2)}초 🎯`);
        }
    };

    const nextStep = async () => {
        if (roundIdx + 1 < TARGETS.length) {
            setRoundIdx(roundIdx + 1);
            setCurrentSec(0);
            startRef.current = performance.now();
            setGameState('running');
        } else {
            setGameState('finished');
            const avgDiff =
                roundHistory.reduce((acc, r) => acc + r.diff, 0) / Math.max(1, roundHistory.length);

            await submitArcadeScore({
                gameId: 'blind-timer',
                score,
                detail: `평균 오차 ${avgDiff.toFixed(2)}초`,
                user,
                userName,
                mbtiType,
                season: 'season_3',
            });
            const reward = Math.min(35, Math.max(8, Math.floor(score / 100)));
            earnCrystals(reward, '인간 스톱워치 7.77초 완주 보상');
            toast.success(`3라운드 합산 ${score.toLocaleString()}점! +${reward}💎 획득!`);
            setRefreshTrigger((v) => v + 1);
        }
    };

    const isBlind = gameState === 'running' && currentSec >= 1.5;

    return (
        <ArcadeGameLayout
            gameId="blind-timer"
            title="⏱️ 인간 스톱워치 7.77초"
            subtitle="1.5초 뒤 가려지는 시계! 마음속 감각으로 정각에 멈추세요!"
            accentColor="#06b6d4"
            accentBg="#ecfeff"
            onBack={onBack}
            score={score}
            extraStatLabel="현재 라운드 / 목표 시간"
            extraStatValue={`Round ${roundIdx + 1}/3 · ${targetSec.toFixed(2)}초`}
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '12px' }}>⏱️🙈</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                        당신의 생체 시계는 얼마나 정확할까요?
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                        총 3라운드(<strong>3.33초 → 5.55초 → 7.77초</strong>)가 진행됩니다.<br />
                        시작 후 1.5초가 지나면 숫자가 <strong>블라인드(🙈)</strong> 됩니다. 정확히 목표 시간에 STOP을 누르세요!
                    </p>
                    <Tooltip text="인간 스톱워치 3라운드 도전을 시작합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startAll}
                            style={{
                                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
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
                                boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)',
                            }}
                        >
                            <Play size={18} /> 도전 시작하기
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {(gameState === 'running' || gameState === 'result') && (
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                    <div
                        style={{
                            display: 'inline-block',
                            background: '#ecfeff',
                            border: '1.5px solid #a5f3fc',
                            color: '#0e7490',
                            padding: '6px 16px',
                            borderRadius: '100px',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            marginBottom: '16px',
                        }}
                    >
                        🎯 Round {roundIdx + 1} 목표 시간: {targetSec.toFixed(2)}초
                    </div>

                    {/* 대형 디지털 시계 */}
                    <div
                        style={{
                            background: '#0f172a',
                            color: isBlind ? '#38bdf8' : '#f8fafc',
                            borderRadius: '24px',
                            padding: '34px 20px',
                            margin: '0 auto 24px auto',
                            maxWidth: '340px',
                            fontFamily: 'monospace',
                            fontSize: '3.2rem',
                            fontWeight: 900,
                            letterSpacing: '2px',
                            boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.4)',
                        }}
                    >
                        {isBlind ? '?.??s 🙈' : `${currentSec.toFixed(2)}s`}
                    </div>

                    {gameState === 'running' ? (
                        <Tooltip text="목표 시간이 되었다고 생각될 때 즉시 누르세요!">
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => handleStop()}
                                style={{
                                    width: '100%',
                                    maxWidth: '340px',
                                    padding: '20px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    fontSize: '1.35rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.35)',
                                }}
                            >
                                🛑 STOP! 지금 멈추기
                            </motion.button>
                        </Tooltip>
                    ) : (
                        <div>
                            {roundHistory[roundHistory.length - 1] && (
                                <div
                                    style={{
                                        background: '#f8fafc',
                                        borderRadius: '16px',
                                        padding: '14px',
                                        marginBottom: '18px',
                                        border: '1px solid #e2e8f0',
                                    }}
                                >
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
                                        오차: {roundHistory[roundHistory.length - 1].diff.toFixed(2)}초 (+
                                        {roundHistory[roundHistory.length - 1].points}점)
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                                        목표 {targetSec.toFixed(2)}초 / 내 기록 {currentSec.toFixed(2)}초
                                    </div>
                                </div>
                            )}
                            <Tooltip text="다음 라운드로 진행합니다">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={nextStep}
                                    style={{
                                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '100px',
                                        padding: '14px 36px',
                                        fontSize: '1rem',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {roundIdx + 1 < TARGETS.length ? '다음 라운드 진행 →' : '최종 결과 확인 🏆'}
                                </motion.button>
                            </Tooltip>
                        </div>
                    )}
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                    <div style={{ fontSize: '3.4rem', marginBottom: '8px' }}>⏱️🏆</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px' }}>
                        3라운드 총점: {score.toLocaleString()}점
                    </h2>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            marginBottom: '20px',
                            maxWidth: '340px',
                            margin: '0 auto 22px auto',
                        }}
                    >
                        {roundHistory.map((r) => (
                            <div
                                key={r.round}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                }}
                            >
                                <span>
                                    R{r.round} (목표 {r.target.toFixed(2)}s)
                                </span>
                                <span style={{ color: '#0891b2' }}>
                                    {r.actual.toFixed(2)}s (오차 {r.diff.toFixed(2)}s · +{r.points}점)
                                </span>
                            </div>
                        ))}
                    </div>
                    <Tooltip text="다시 도전하여 더 정확한 시간 감각을 증명합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startAll}
                            style={{
                                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
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

export default BlindTimerGamePage;
