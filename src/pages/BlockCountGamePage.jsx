import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Delete, Check, Heart, HelpCircle, Layers } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

// 스테이지별 다채로운 블록 컬러 팔레트 (매판 랜덤 선택)
const BLOCK_PALETTES = [
    { name: '인디고', top: '#818cf8', left: '#6366f1', right: '#4338ca', stroke: '#312e81' },
    { name: '에메랄드', top: '#34d399', left: '#10b981', right: '#047857', stroke: '#064e3b' },
    { name: '코랄', top: '#fb7185', left: '#f43f5e', right: '#be123c', stroke: '#881337' },
    { name: '앰버', top: '#fbbf24', left: '#f59e0b', right: '#b45309', stroke: '#78350f' },
    { name: '스카이', top: '#38bdf8', left: '#0ea5e9', right: '#0369a1', stroke: '#0c4a6e' },
    { name: '바이올렛', top: '#c084fc', left: '#a855f7', right: '#7e22ce', stroke: '#581c87' },
];

// 단계별 격자 크기, 최대 높이, 넉넉한 제한 시간 설정
function getStageConfig(stage) {
    if (stage === 1) return { size: 3, maxH: 2, minTotal: 5, maxTotal: 11, timeSec: 40 };
    if (stage === 2) return { size: 3, maxH: 3, minTotal: 9, maxTotal: 17, timeSec: 45 };
    if (stage === 3) return { size: 4, maxH: 3, minTotal: 14, maxTotal: 26, timeSec: 50 };
    if (stage === 4) return { size: 4, maxH: 4, minTotal: 20, maxTotal: 38, timeSec: 55 };
    if (stage === 5) return { size: 5, maxH: 4, minTotal: 28, maxTotal: 52, timeSec: 60 };
    if (stage === 6) return { size: 5, maxH: 5, minTotal: 38, maxTotal: 68, timeSec: 65 };
    if (stage === 7) return { size: 6, maxH: 5, minTotal: 48, maxTotal: 88, timeSec: 70 };
    return { size: 6, maxH: 6, minTotal: 60, maxTotal: 115, timeSec: 75 };
}

/**
 * 매판 완전히 새로운 입체 블록 구조를 생성하는 단조(Monotonic) 높이 맵 생성기
 * - 뒤쪽(r, c가 작은 쪽)이 앞쪽보다 항상 높거나 같도록 생성하여
 *   "앞 블록에 가려져 절대 존재 여부를 알 수 없는 억지 문제"를 수학적으로 100% 방지합니다.
 * - 동시에 아래층·뒷편에 숨어있는 받침 블록을 정확히 추론해 더해야 하는 진정한 공간지각 퍼즐을 만듭니다.
 */
function generateBlockPuzzle(stage, prevSignature = '') {
    const cfg = getStageConfig(stage);
    const { size, maxH, minTotal, maxTotal, timeSec } = cfg;

    for (let attempt = 0; attempt < 40; attempt++) {
        const heights = Array.from({ length: size }, () => Array(size).fill(0));
        // 뒤쪽 꼭짓점(0, 0)은 최고 높이 또는 최고 높이-1로 설정
        heights[0][0] = Math.random() < 0.7 ? maxH : Math.max(2, maxH - 1);

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (r === 0 && c === 0) continue;
                const up = r > 0 ? heights[r - 1][c] : maxH;
                const left = c > 0 ? heights[r][c - 1] : maxH;
                const limit = Math.min(up, left);
                if (limit <= 0) {
                    heights[r][c] = 0;
                    continue;
                }
                // 다양한 계단·기둥 형태가 나오도록 확률 분포 다양화
                const roll = Math.random();
                if (roll < 0.36) {
                    heights[r][c] = limit;
                } else if (roll < 0.72) {
                    heights[r][c] = Math.max(0, limit - 1);
                } else {
                    heights[r][c] = Math.floor(Math.random() * (limit + 1));
                }
            }
        }

        // 총 블록 개수 계산
        let total = 0;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                total += heights[r][c];
            }
        }

        const sig = heights.map((row) => row.join(',')).join('|');
        if (total >= minTotal && total <= maxTotal && sig !== prevSignature) {
            const palette = BLOCK_PALETTES[Math.floor(Math.random() * BLOCK_PALETTES.length)];
            return { heights, size, maxH, total, timeSec, palette, signature: sig };
        }
    }

    // 폴백 기본 생성
    const fallbackHeights = Array.from({ length: size }, (_, r) =>
        Array.from({ length: size }, (_, c) => Math.max(0, maxH - Math.floor((r + c) / 2)))
    );
    const total = fallbackHeights.flat().reduce((a, b) => a + b, 0);
    return {
        heights: fallbackHeights,
        size,
        maxH,
        total,
        timeSec,
        palette: BLOCK_PALETTES[stage % BLOCK_PALETTES.length],
        signature: `fallback-${stage}-${Date.now()}`,
    };
}

/**
 * 3D 아이소메트릭(등각 투영) SVG 블록 렌더러
 */
const IsometricBlockView = ({ puzzle }) => {
    if (!puzzle) return null;
    const { heights, size, maxH, palette } = puzzle;

    // 블록 크기(타일 폭/높이)를 격자 크기에 맞춰 자동 조절
    const tileW = size <= 3 ? 42 : size === 4 ? 34 : size === 5 ? 28 : 24;
    const tileH = tileW * 0.52;
    const cubeH = tileW * 0.62;

    const svgWidth = 360;
    const svgHeight = 290;
    const originX = svgWidth / 2;
    // 전체 높이가 중앙에 예쁘게 오도록 수직 오프셋 계산
    const originY = Math.max(58, (svgHeight - (size * tileH * 2 + maxH * cubeH)) / 2 + maxH * cubeH + 14);

    // (r, c, z) 좌표를 2D 화면 좌표로 투영
    const project = (r, c, z) => ({
        x: originX + (c - r) * tileW,
        y: originY + (c + r) * tileH - z * cubeH,
    });

    // Painter's Algorithm: 뒤쪽(r+c 작음) → 앞쪽, 아래층(z 작음) → 위층 순으로 렌더링
    const cubes = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const h = heights[r][c];
            for (let z = 0; z < h; z++) {
                cubes.push({ r, c, z });
            }
        }
    }

    // 바닥 기준 격자 가이드선(어디가 바닥인지 입체감 부여)
    const baseCorners = [
        project(0, 0, 0),
        project(0, size, 0),
        project(size, size, 0),
        project(size, 0, 0),
    ];

    return (
        <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{
                width: '100%',
                maxWidth: '380px',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                userSelect: 'none',
            }}
        >
            {/* 바닥 그림자 플랫폼 */}
            <polygon
                points={baseCorners.map((p) => `${p.x},${p.y + 4}`).join(' ')}
                fill="#e2e8f0"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                opacity="0.7"
            />

            {/* 바닥 그리드 선 */}
            {Array.from({ length: size + 1 }).map((_, idx) => {
                const a1 = project(idx, 0, 0);
                const a2 = project(idx, size, 0);
                const b1 = project(0, idx, 0);
                const b2 = project(size, idx, 0);
                return (
                    <g key={`grid-${idx}`} stroke="#cbd5e1" strokeWidth="0.9" opacity="0.55">
                        <line x1={a1.x} y1={a1.y + 4} x2={a2.x} y2={a2.y + 4} />
                        <line x1={b1.x} y1={b1.y + 4} x2={b2.x} y2={b2.y + 4} />
                    </g>
                );
            })}

            {/* 3D 입체 큐브 렌더링 */}
            {cubes.map(({ r, c, z }) => {
                const pTop = project(r, c, z + 1);
                const topPoints = [
                    `${pTop.x},${pTop.y}`,
                    `${pTop.x + tileW},${pTop.y + tileH}`,
                    `${pTop.x},${pTop.y + tileH * 2}`,
                    `${pTop.x - tileW},${pTop.y + tileH}`,
                ].join(' ');

                const leftPoints = [
                    `${pTop.x - tileW},${pTop.y + tileH}`,
                    `${pTop.x},${pTop.y + tileH * 2}`,
                    `${pTop.x},${pTop.y + tileH * 2 + cubeH}`,
                    `${pTop.x - tileW},${pTop.y + tileH + cubeH}`,
                ].join(' ');

                const rightPoints = [
                    `${pTop.x + tileW},${pTop.y + tileH}`,
                    `${pTop.x},${pTop.y + tileH * 2}`,
                    `${pTop.x},${pTop.y + tileH * 2 + cubeH}`,
                    `${pTop.x + tileW},${pTop.y + tileH + cubeH}`,
                ].join(' ');

                return (
                    <g key={`cube-${r}-${c}-${z}`}>
                        <polygon
                            points={leftPoints}
                            fill={palette.left}
                            stroke={palette.stroke}
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                        />
                        <polygon
                            points={rightPoints}
                            fill={palette.right}
                            stroke={palette.stroke}
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                        />
                        <polygon
                            points={topPoints}
                            fill={palette.top}
                            stroke={palette.stroke}
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                        />
                    </g>
                );
            })}
        </svg>
    );
};

const BlockCountGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | playing | feedback | finished
    const [stage, setStage] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(40);
    const [puzzle, setPuzzle] = useState(null);
    const [inputVal, setInputVal] = useState('');
    const [lastFeedback, setLastFeedback] = useState(null); // { correct, userAnswer, answer, gained }
    const [showHint, setShowHint] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const stageRef = useRef(1);
    const prevSigRef = useRef('');
    const finishedRef = useRef(false);

    const finishGame = useCallback(async () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setGameState('finished');

        const finalScore = scoreRef.current;
        const clearedStage = Math.max(0, stageRef.current - 1);

        if (finalScore > 0) {
            await submitArcadeScore({
                gameId: 'block-count',
                score: finalScore,
                detail: `Stage ${clearedStage} 돌파`,
                user,
                userName,
                mbtiType,
                season: 'season_3',
            });
            const reward = Math.min(45, Math.max(8, Math.floor(finalScore / 120)));
            earnCrystals(reward, '데블스 블록 카운팅 보상');
            toast.success(`Stage ${clearedStage} 돌파 기록 등록! +${reward}💎 획득!`);
            setRefreshTrigger((v) => v + 1);
        }
    }, [user, userName, mbtiType, earnCrystals]);

    const loadStage = useCallback((nextSt) => {
        const nextPuzzle = generateBlockPuzzle(nextSt, prevSigRef.current);
        prevSigRef.current = nextPuzzle.signature;
        setPuzzle(nextPuzzle);
        setTimeLeft(nextPuzzle.timeSec);
        setInputVal('');
        setShowHint(false);
        setLastFeedback(null);
        setGameState('playing');
    }, []);

    const startGame = () => {
        finishedRef.current = false;
        scoreRef.current = 0;
        stageRef.current = 1;
        setScore(0);
        setStage(1);
        setLives(3);
        loadStage(1);
    };

    // 타이머 (플레이 중일 때만 감소)
    useEffect(() => {
        if (gameState !== 'playing') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.error('시간 초과! 게임이 종료되었습니다.');
                    finishGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, finishGame]);

    const handleSubmitAnswer = useCallback(() => {
        if (gameState !== 'playing' || !puzzle) return;
        const parsed = parseInt(inputVal, 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
            toast.error('블록 개수를 숫자로 입력해 주세요!');
            return;
        }

        if (parsed === puzzle.total) {
            const basePoints = 150 + stageRef.current * 60;
            const timeBonus = Math.round(timeLeft * 4);
            const gained = basePoints + timeBonus;
            scoreRef.current += gained;
            setScore(scoreRef.current);

            setLastFeedback({
                correct: true,
                userAnswer: parsed,
                answer: puzzle.total,
                gained,
            });
            setGameState('feedback');
            toast.success(`정답! (${puzzle.total}개) +${gained}점!`);

            const nextSt = stageRef.current + 1;
            stageRef.current = nextSt;
            setStage(nextSt);

            setTimeout(() => {
                if (!finishedRef.current) loadStage(nextSt);
            }, 1350);
        } else {
            const nextLives = lives - 1;
            setLives(nextLives);
            setLastFeedback({
                correct: false,
                userAnswer: parsed,
                answer: puzzle.total,
                gained: 0,
            });
            setInputVal('');

            if (nextLives <= 0) {
                toast.error(`아쉽네요! 정답은 ${puzzle.total}개였습니다.`);
                finishGame();
            } else {
                toast.error(
                    `오답! 입력하신 ${parsed}개가 아닙니다. (남은 기회 ❤️ ${nextLives}번)`
                );
            }
        }
    }, [gameState, puzzle, inputVal, timeLeft, lives, loadStage, finishGame]);

    // PC 키보드 숫자 / Backspace / Enter 입력 지원
    useEffect(() => {
        if (gameState !== 'playing') return;
        const onKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                setInputVal((prev) => (prev.length < 3 ? prev + e.key : prev));
            } else if (e.key === 'Backspace') {
                setInputVal((prev) => prev.slice(0, -1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmitAnswer();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameState, handleSubmitAnswer]);

    return (
        <ArcadeGameLayout
            gameId="block-count"
            title="🧊 데블스 블록 카운팅"
            subtitle="보이지 않는 아래층 숨은 블록까지 총 개수를 정확히 추론하세요!"
            accentColor="#4f46e5"
            accentBg="#eef2ff"
            onBack={onBack}
            score={score}
            extraStatLabel="현재 단계 / 남은 시간"
            extraStatValue={
                gameState === 'ready'
                    ? '매판 랜덤 출제'
                    : `Stage ${stage} · ${timeLeft}초`
            }
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '26px 14px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🧊🧠</div>
                    <div
                        style={{
                            display: 'inline-block',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            marginBottom: '10px',
                        }}
                    >
                        🔥 데블스 플랜 스타일 공간지각 두뇌 게임
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                        입체 블록의 총 개수를 맞혀라!
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.65, marginBottom: '18px' }}>
                        겉으로 보이는 블록뿐만 아니라 <strong>바닥과 뒤쪽에 받치고 있는 숨은 블록</strong>까지 모두 세어 입력하세요.<br />
                        1단계부터 새로 시작해도 <strong>매판 완전히 새로운 랜덤 입체 구조</strong>가 출제되며, 단계가 올라갈수록 블록이 더 커지고 복잡해집니다!
                    </p>
                    <div
                        style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            fontSize: '0.8rem',
                            color: '#475569',
                            textAlign: 'left',
                            marginBottom: '22px',
                            lineHeight: 1.55,
                        }}
                    >
                        <strong>💡 고수들의 암산 요령:</strong><br />
                        • <strong>기둥 높이 합산법:</strong> 각 칸마다 몇 층인지(3층, 2층, 1층…) 세어 모두 더하세요!<br />
                        • <strong>층별 합산법:</strong> 1층 바닥 개수 + 2층 개수 + 3층 개수로 나눠 세면 실수가 줄어듭니다.<br />
                        • 기회 <strong>❤️ 3번</strong> / 단계별 <strong>40~75초의 넉넉한 시간</strong>이 주어집니다!
                    </div>
                    <Tooltip text="매판 새로운 입체 블록 카운팅 도전을 시작합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
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
                                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                            }}
                        >
                            <Play size={18} /> 블록 카운팅 시작
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'feedback') && puzzle && (
                <div>
                    {/* 상단 상태바: 단계 / 목숨 / 남은 시간 / 힌트 */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '10px 14px',
                            marginBottom: '12px',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{
                                    background: '#4f46e5',
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: '0.78rem',
                                    padding: '4px 10px',
                                    borderRadius: '100px',
                                }}
                            >
                                Stage {stage} ({puzzle.size}×{puzzle.size})
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {[0, 1, 2].map((idx) => (
                                    <Heart
                                        key={idx}
                                        size={16}
                                        color={idx < lives ? '#ef4444' : '#cbd5e1'}
                                        fill={idx < lives ? '#ef4444' : 'none'}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tooltip text="기둥 높이 합산 요령 힌트를 보거나 닫습니다">
                                <button
                                    type="button"
                                    onClick={() => setShowHint((v) => !v)}
                                    style={{
                                        background: showHint ? '#eef2ff' : 'white',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '100px',
                                        padding: '4px 10px',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        color: '#4f46e5',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <HelpCircle size={13} /> 힌트
                                </button>
                            </Tooltip>
                            <span
                                style={{
                                    fontWeight: 900,
                                    fontSize: '0.95rem',
                                    color: timeLeft <= 10 ? '#ef4444' : '#0f172a',
                                }}
                            >
                                ⏱️ {timeLeft}초
                            </span>
                        </div>
                    </div>

                    {showHint && (
                        <div
                            style={{
                                background: '#eef2ff',
                                border: '1px solid #c7d2fe',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                marginBottom: '10px',
                                fontSize: '0.78rem',
                                color: '#3730a3',
                                fontWeight: 700,
                            }}
                        >
                            💡 이 도형의 최대 높이는 <strong>{puzzle.maxH}층</strong>이며, 공중에 떠 있는 블록은 하나도 없습니다! 가장 높은 뒤쪽 기둥부터 층수를 세어 더해 보세요.
                        </div>
                    )}

                    {/* 3D 입체 블록 캔버스 */}
                    <div
                        style={{
                            background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
                            borderRadius: '22px',
                            border: '1.5px solid #e2e8f0',
                            padding: '12px 8px',
                            marginBottom: '14px',
                            position: 'relative',
                        }}
                    >
                        <IsometricBlockView puzzle={puzzle} />

                        <AnimatePresence>
                            {gameState === 'feedback' && lastFeedback?.correct && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(16, 185, 129, 0.9)',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        textAlign: 'center',
                                        padding: '16px',
                                    }}
                                >
                                    <div style={{ fontSize: '2.8rem', marginBottom: '6px' }}>🎉</div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 900 }}>
                                        정답! 총 {lastFeedback.answer}개
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.95, marginTop: '4px' }}>
                                        +{lastFeedback.gained}점 획득! 다음 단계로 이동합니다...
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 입력 디스플레이 & 제출 */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px',
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                background: '#f8fafc',
                                border: '2px solid #4f46e5',
                                borderRadius: '16px',
                                padding: '12px 16px',
                                textAlign: 'center',
                                fontSize: '1.4rem',
                                fontWeight: 900,
                                color: inputVal ? '#0f172a' : '#94a3b8',
                            }}
                        >
                            {inputVal ? `${inputVal} 개` : '정답 숫자 입력'}
                        </div>
                        <Tooltip text="입력한 블록 개수를 정답으로 제출합니다 (Enter)">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleSubmitAnswer}
                                disabled={gameState !== 'playing'}
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '14px 22px',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 6px 14px rgba(79, 70, 229, 0.25)',
                                }}
                            >
                                <Check size={18} /> 확인
                            </motion.button>
                        </Tooltip>
                    </div>

                    {/* 모바일/PC 겸용 터치 숫자 키패드 */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '6px',
                        }}
                    >
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
                            <motion.button
                                key={num}
                                whileTap={{ scale: 0.92 }}
                                type="button"
                                onClick={() => setInputVal((prev) => (prev.length < 3 ? prev + num : prev))}
                                style={{
                                    padding: '11px 0',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    fontWeight: 900,
                                    fontSize: '1.05rem',
                                    color: '#1e293b',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                                }}
                            >
                                {num}
                            </motion.button>
                        ))}
                        <Tooltip text="마지막 숫자를 지웁니다">
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                type="button"
                                onClick={() => setInputVal((prev) => prev.slice(0, -1))}
                                style={{
                                    gridColumn: 'span 2',
                                    padding: '11px 0',
                                    borderRadius: '12px',
                                    border: '1px solid #fecaca',
                                    background: '#fef2f2',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                }}
                            >
                                <Delete size={16} /> 지우기
                            </motion.button>
                        </Tooltip>
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '22px 12px' }}>
                    <div style={{ fontSize: '3.4rem', marginBottom: '8px' }}>🧊🏆</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        Stage {Math.max(0, stage - 1)} 돌파! ({score.toLocaleString()}점)
                    </h2>

                    {/* 마지막 문제 정답 해설 (기둥별 높이 지도) */}
                    {puzzle && (
                        <div
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '18px',
                                padding: '14px',
                                margin: '14px auto 20px',
                                maxWidth: '300px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    color: '#4f46e5',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                }}
                            >
                                <Layers size={14} /> 마지막 문제 정답 해설: 총 {puzzle.total}개
                            </div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                                    gap: '4px',
                                    maxWidth: '210px',
                                    margin: '0 auto',
                                }}
                            >
                                {puzzle.heights.flat().map((h, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '6px 0',
                                            borderRadius: '8px',
                                            background: h > 0 ? '#e0e7ff' : '#f1f5f9',
                                            color: h > 0 ? '#3730a3' : '#94a3b8',
                                            fontWeight: 900,
                                            fontSize: '0.82rem',
                                        }}
                                    >
                                        {h}
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                                (위에서 내려다본 각 칸의 블록 층수 합계 = {puzzle.total}개)
                            </div>
                        </div>
                    )}

                    <Tooltip text="새로운 랜덤 블록 문제로 다시 도전합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={startGame}
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
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
                            <RotateCcw size={18} /> 새 문제로 다시 도전
                        </motion.button>
                    </Tooltip>
                </div>
            )}
        </ArcadeGameLayout>
    );
};

export default BlockCountGamePage;
