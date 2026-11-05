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

const LAYER_COLORS = [
    '#f43f5e', '#fb7185', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#ec4899'
];

const StackTowerGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | playing | finished
    const [blocks, setBlocks] = useState([{ left: 20, width: 60, color: LAYER_COLORS[0] }]);
    const [activeBlock, setActiveBlock] = useState({ left: 0, width: 60, dir: 1 });
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const activeRef = useRef({ left: 0, width: 60, dir: 1 });
    const blocksRef = useRef([{ left: 20, width: 60, color: LAYER_COLORS[0] }]);
    const scoreRef = useRef(0);
    const comboRef = useRef(0);
    const rafRef = useRef(null);

    const floorCount = blocks.length - 1;

    useEffect(() => {
        if (gameState !== 'playing') return;
        let lastTime = performance.now();

        const animate = (now) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            const speed = Math.min(115, 48 + blocksRef.current.length * 2.2);
            let { left, width, dir } = activeRef.current;
            left += dir * speed * dt;

            if (left + width >= 100) {
                left = 100 - width;
                dir = -1;
            } else if (left <= 0) {
                left = 0;
                dir = 1;
            }

            activeRef.current = { left, width, dir };
            setActiveBlock({ left, width, dir });
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [gameState]);

    const startGame = () => {
        const base = [{ left: 20, width: 60, color: LAYER_COLORS[0] }];
        blocksRef.current = base;
        activeRef.current = { left: 0, width: 60, dir: 1 };
        scoreRef.current = 0;
        comboRef.current = 0;
        setBlocks(base);
        setActiveBlock({ left: 0, width: 60, dir: 1 });
        setScore(0);
        setCombo(0);
        setGameState('playing');
    };

    const handleDrop = useCallback(async () => {
        if (gameState !== 'playing') return;

        const prev = blocksRef.current[blocksRef.current.length - 1];
        const curr = activeRef.current;

        const diff = Math.abs(curr.left - prev.left);
        const overlapLeft = Math.max(prev.left, curr.left);
        const overlapRight = Math.min(prev.left + prev.width, curr.left + curr.width);
        const overlapWidth = overlapRight - overlapLeft;

        if (overlapWidth <= 1.5) {
            // 실패 -> 게임 종료
            cancelAnimationFrame(rafRef.current);
            setGameState('finished');
            const finalScore = scoreRef.current;
            const finalFloor = blocksRef.current.length - 1;

            if (finalScore > 0) {
                await submitArcadeScore({
                    gameId: 'stack-tower',
                    score: finalScore,
                    detail: `${finalFloor}층 돌파`,
                    user,
                    userName,
                    mbtiType,
                    season: 'season_3',
                });
                const reward = Math.min(35, Math.max(5, Math.floor(finalScore / 100)));
                earnCrystals(reward, '소울펫 팬케이크 탑 보상');
                toast.success(`${finalFloor}층 달성! +${reward}💎 획득!`);
                setRefreshTrigger((v) => v + 1);
            }
            return;
        }

        // 퍼펙트 판정 (오차 3.2% 이내)
        let newWidth = overlapWidth;
        let newLeft = overlapLeft;
        let nextCombo = comboRef.current;
        let gained = 100;

        if (diff <= 3.2) {
            nextCombo += 1;
            gained += nextCombo * 50;
            // 3콤보 이상이면 블록 폭 살짝 회복 보너스
            newWidth = Math.min(60, prev.width + (nextCombo >= 3 ? 2 : 0));
            newLeft = prev.left;
            toast.success(`✨ PERFECT! ${nextCombo}콤보 (+${gained}점)`, { duration: 750 });
        } else {
            nextCombo = 0;
        }

        const nextColor = LAYER_COLORS[blocksRef.current.length % LAYER_COLORS.length];
        const nextBlocks = [...blocksRef.current, { left: newLeft, width: newWidth, color: nextColor }];
        const nextScore = scoreRef.current + gained;

        blocksRef.current = nextBlocks;
        scoreRef.current = nextScore;
        comboRef.current = nextCombo;
        activeRef.current = {
            left: nextBlocks.length % 2 === 0 ? 0 : 100 - newWidth,
            width: newWidth,
            dir: nextBlocks.length % 2 === 0 ? 1 : -1,
        };

        setBlocks(nextBlocks);
        setScore(nextScore);
        setCombo(nextCombo);
    }, [gameState, user, userName, mbtiType, earnCrystals]);

    // 최근 9개 층만 화면에 보이도록 슬라이싱
    const visibleBlocks = blocks.slice(-9);

    return (
        <ArcadeGameLayout
            gameId="stack-tower"
            title="🥞 소울펫 팬케이크 탑"
            subtitle="타이밍을 맞춰 터치해 하늘 높이 팬케이크 탑을 쌓아 올리세요!"
            accentColor="#8b5cf6"
            accentBg="#f5f3ff"
            onBack={onBack}
            score={score}
            extraStatLabel="현재 층수 / 퍼펙트 콤보"
            extraStatValue={`${floorCount}층 · ${combo}콤보`}
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🥞🐾</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                        몇 층까지 쌓을 수 있을까요?
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                        좌우로 움직이는 팬케이크 블록을 <strong>정확한 타이밍에 터치</strong>해 내려놓으세요!<br />
                        삐져나온 부분은 잘려 나가며, 정중앙에 맞추면 <strong>PERFECT 콤보 보너스</strong>를 받습니다.
                    </p>
                    <Tooltip text="팬케이크 탑 쌓기 게임을 시작합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
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
                                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                            }}
                        >
                            <Play size={18} /> 탑 쌓기 시작
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {gameState === 'playing' && (
                <div>
                    {/* 타워 스테이지 */}
                    <div
                        onClick={handleDrop}
                        title="클릭하여 팬케이크 블록을 내려놓습니다"
                        style={{
                            position: 'relative',
                            height: '320px',
                            background: 'linear-gradient(180deg, #ede9fe 0%, #fdf4ff 100%)',
                            borderRadius: '22px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '2px solid #ddd6fe',
                            marginBottom: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            paddingBottom: '14px',
                        }}
                    >
                        {/* 현재 움직이는 상단 블록 */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '24px',
                                left: `${activeBlock.left}%`,
                                width: `${activeBlock.width}%`,
                                height: '24px',
                                background: LAYER_COLORS[blocks.length % LAYER_COLORS.length],
                                borderRadius: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                            }}
                        />

                        {/* 쌓인 블록들 */}
                        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '3px' }}>
                            {visibleBlocks.map((b, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginLeft: `${b.left}%`,
                                        width: `${b.width}%`,
                                        height: '22px',
                                        background: b.color,
                                        borderRadius: '7px',
                                        boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.15)',
                                        transition: 'width 0.1s',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <Tooltip text="타이밍에 맞춰 블록을 아래로 내려놓습니다">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDrop}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '18px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                color: 'white',
                                fontSize: '1.15rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                            }}
                        >
                            🥞 여기에 쌓기! (터치)
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                    <div style={{ fontSize: '3.6rem', marginBottom: '10px' }}>🥞🏆</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        최종 {floorCount}층 달성! ({score.toLocaleString()}점)
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '22px' }}>
                        {floorCount >= 25
                            ? '구름 위까지 닿은 전설의 파티시에! ✨'
                            : floorCount >= 15
                            ? '리듬감이 대단해요! 조금만 더 쌓으면 1위권입니다!'
                            : '정중앙 타이밍을 노려 퍼펙트 콤보를 이어가 보세요!'}
                    </p>
                    <Tooltip text="다시 도전하여 더 높은 층수를 쌓습니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
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
                            <RotateCcw size={18} /> 다시 쌓기 도전
                        </motion.button>
                    </Tooltip>
                </div>
            )}
        </ArcadeGameLayout>
    );
};

export default StackTowerGamePage;
