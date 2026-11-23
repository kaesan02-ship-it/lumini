import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Eye, Search, FastForward, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

const BASE = import.meta.env.BASE_URL || '/';

/**
 * 5가지 AI 일러스트 테마 × 각 테마별 28종 고유 소품 풀
 * 난이도가 올라갈수록 화면에 등장하는 소품 수가 10개 → 14개 → 18개 → 22개 → 28개로 대폭 증가합니다!
 */
const SCENE_THEMES = [
    {
        id: 'camping',
        title: '🏕️ 별빛 숲속 캠핑장',
        image: `${BASE}images/spot-diff/camping.jpg`,
        pool: [
            { icon: '⛺', label: '텐트', swap: '🛖' },
            { icon: '🔥', label: '모닥불', swap: '💧' },
            { icon: '🌙', label: '초승달', swap: '☀️' },
            { icon: '⭐', label: '별', swap: '💖' },
            { icon: '🦉', label: '부엉이', swap: '🦅' },
            { icon: '🦊', label: '여우', swap: '🐺' },
            { icon: '🐰', label: '토끼', swap: '🐿️' },
            { icon: '🎒', label: '배낭', swap: '🧳' },
            { icon: '🏮', label: '랜턴', swap: '🕯️' },
            { icon: '☕', label: '코코아', swap: '🥤' },
            { icon: '🍄', label: '버섯', swap: '🌷' },
            { icon: '🌲', label: '소나무', swap: '🌴' },
            { icon: '🚩', label: '깃발', swap: '🎏' },
            { icon: '🎸', label: '기타', swap: '🎻' },
            { icon: '🧭', label: '나침반', swap: '⏱️' },
            { icon: '🦋', label: '나비', swap: '🐝' },
            { icon: '🐻', label: '아기곰', swap: '🐼' },
            { icon: '🍖', label: '바비큐', swap: '🌽' },
            { icon: '🪵', label: '장작', swap: '🪨' },
            { icon: '🔭', label: '망원경', swap: '📷' },
            { icon: '🦔', label: '고슴도치', swap: '🐢' },
            { icon: '🍂', label: '단풍잎', swap: '🍀' },
            { icon: '🪁', label: '연', swap: '🎈' },
            { icon: '🥾', label: '등산화', swap: '👟' },
            { icon: '🧺', label: '피크닉바구니', swap: '🎁' },
            { icon: '🦌', label: '사슴', swap: '🦄' },
            { icon: '🛸', label: 'UFO', swap: '✈️' },
            { icon: '🍎', label: '사과', swap: '🍊' },
        ],
    },
    {
        id: 'cafe',
        title: '☕ 루프탑 디저트 카페',
        image: `${BASE}images/spot-diff/cafe.jpg`,
        pool: [
            { icon: '🍰', label: '딸기케이크', swap: '🍩' },
            { icon: '☕', label: '라떼', swap: '🧋' },
            { icon: '🥐', label: '크루아상', swap: '🥨' },
            { icon: '🧁', label: '컵케이크', swap: '🍮' },
            { icon: '🫖', label: '찻주전자', swap: '🥛' },
            { icon: '🐱', label: '고양이', swap: '🐶' },
            { icon: '🪴', label: '화분', swap: '🌻' },
            { icon: '🕒', label: '벽시계', swap: '🕘' },
            { icon: '🔔', label: '호출벨', swap: '🛎️' },
            { icon: '🍪', label: '쿠키', swap: '🧇' },
            { icon: '🍓', label: '딸기', swap: '🍒' },
            { icon: '🍨', label: '아이스크림', swap: '🍧' },
            { icon: '🎁', label: '선물상자', swap: '🛍️' },
            { icon: '🖼️', label: '액자', swap: '🪞' },
            { icon: '💡', label: '전구', swap: '🕯️' },
            { icon: '📖', label: '메뉴책', swap: '📰' },
            { icon: '🥐', label: '빵', swap: '🥪' },
            { icon: '🍋', label: '레몬', swap: '🍑' },
            { icon: '💐', label: '꽃다발', swap: '🌹' },
            { icon: '🧸', label: '곰인형', swap: '🐰' },
            { icon: '🥞', label: '팬케이크', swap: '🥧' },
            { icon: '🍹', label: '에이드', swap: '🍷' },
            { icon: '🍰', label: '치즈케이크', swap: '🍫' },
            { icon: '🐦', label: '참새', swap: '🕊️' },
            { icon: '👒', label: '밀짚모자', swap: '🎀' },
            { icon: '🎹', label: '미니피아노', swap: '📻' },
            { icon: '🎈', label: '풍선', swap: '🪁' },
            { icon: '🍩', label: '도넛', swap: '🥯' },
        ],
    },
    {
        id: 'space',
        title: '🚀 우주 정거장 전망대',
        image: `${BASE}images/spot-diff/space.jpg`,
        pool: [
            { icon: '🚀', label: '로켓', swap: '🛸' },
            { icon: '🧑‍🚀', label: '우주인', swap: '🤖' },
            { icon: '🪐', label: '토성', swap: '🌍' },
            { icon: '👽', label: '외계인', swap: '👾' },
            { icon: '🛰️', label: '인공위성', swap: '📡' },
            { icon: '☄️', label: '혜성', swap: '🌠' },
            { icon: '🌕', label: '보름달', swap: '🌑' },
            { icon: '💎', label: '우주보석', swap: '🔮' },
            { icon: '🔋', label: '에너지셀', swap: '⚡' },
            { icon: '🕹️', label: '조종간', swap: '🎮' },
            { icon: '🔭', label: '망원경', swap: '🔬' },
            { icon: '🧭', label: '항법장치', swap: '⏱️' },
            { icon: '⭐', label: '항성', swap: '✨' },
            { icon: '🧪', label: '샘플병', swap: '🧬' },
            { icon: '🖥️', label: '모니터', swap: '📱' },
            { icon: '🔧', label: '스패너', swap: '🔨' },
            { icon: '🧲', label: '자석', swap: '⚙️' },
            { icon: '🚩', label: '탐사깃발', swap: '🏁' },
            { icon: '🌞', label: '태양', swap: '🌙' },
            { icon: '🪐', label: '행성', swap: '☄️' },
            { icon: '🛸', label: '비행접시', swap: '🚀' },
            { icon: '🤖', label: '드론로봇', swap: '🦾' },
            { icon: '🔦', label: '손전등', swap: '💡' },
            { icon: '🧰', label: '공구함', swap: '💼' },
            { icon: '🪩', label: '미러볼', swap: '🌐' },
            { icon: '🛰️', label: '탐사선', swap: '🛩️' },
            { icon: '☄️', label: '운석', swap: '🪨' },
            { icon: '🧬', label: 'DNA캡슐', swap: '💊' },
        ],
    },
    {
        id: 'ocean',
        title: '🐠 깊은 바다 아쿠아리움',
        image: `${BASE}images/spot-diff/ocean.jpg`,
        pool: [
            { icon: '🐳', label: '고래', swap: '🐬' },
            { icon: '🐙', label: '문어', swap: '🦑' },
            { icon: '🐠', label: '열대어', swap: '🐡' },
            { icon: '🐢', label: '바다거북', swap: '🐊' },
            { icon: '🦈', label: '상어', swap: '🦭' },
            { icon: '🦀', label: '꽃게', swap: '🦞' },
            { icon: '🪼', label: '해파리', swap: '🫧' },
            { icon: '🐚', label: '진주조개', swap: '🦪' },
            { icon: '🪸', label: '산호초', swap: '🌿' },
            { icon: '⚓', label: '바다닻', swap: '🪝' },
            { icon: '⭐', label: '불가사리', swap: '🌸' },
            { icon: '🐟', label: '파란물고기', swap: '🐠' },
            { icon: '🦐', label: '새우', swap: '🦀' },
            { icon: '👑', label: '왕관보물', swap: '💍' },
            { icon: '💎', label: '바다보석', swap: '🪙' },
            { icon: '⛵', label: '난파선', swap: '🚤' },
            { icon: '🧭', label: '나침반', swap: '🗺️' },
            { icon: '🐧', label: '펭귄', swap: '🦆' },
            { icon: '🐡', label: '복어', swap: '🐟' },
            { icon: '🦑', label: '오징어', swap: '🐙' },
            { icon: '🪙', label: '금화', swap: '💰' },
            { icon: '🏺', label: '고대항아리', swap: '⚱️' },
            { icon: '🦭', label: '물개', swap: '🦦' },
            { icon: '🫧', label: '물방울', swap: '💧' },
            { icon: '🧜', label: '인어', swap: '🧚' },
            { icon: '🗝️', label: '보물열쇠', swap: '🔒' },
            { icon: '🐚', label: '소라껍데기', swap: '🐌' },
            { icon: '🐬', label: '돌고래', swap: '🐋' },
        ],
    },
    {
        id: 'magic',
        title: '📚 마법사의 비밀 서재',
        image: `${BASE}images/spot-diff/magic.jpg`,
        pool: [
            { icon: '🔮', label: '수정구슬', swap: '🌐' },
            { icon: '🎩', label: '마법모자', swap: '👑' },
            { icon: '🧪', label: '초록물약', swap: '🍷' },
            { icon: '🕯️', label: '양초', swap: '🔦' },
            { icon: '📖', label: '마법책', swap: '📜' },
            { icon: '🪄', label: '요술봉', swap: '🗡️' },
            { icon: '⏳', label: '모래시계', swap: '🕰️' },
            { icon: '🦉', label: '부엉이', swap: '🐈‍⬛' },
            { icon: '🗝️', label: '황금열쇠', swap: '🔒' },
            { icon: '🧹', label: '빗자루', swap: '🪓' },
            { icon: '🪶', label: '깃펜', swap: '✏️' },
            { icon: '🔭', label: '망원경', swap: '🔍' },
            { icon: '💍', label: '마법반지', swap: '💎' },
            { icon: '🧿', label: '수호부적', swap: '🪬' },
            { icon: '⚱️', label: '마법단지', swap: '🏺' },
            { icon: '🍄', label: '마법버섯', swap: '🌿' },
            { icon: '🦋', label: '빛나비', swap: '🪲' },
            { icon: '🌙', label: '달장식', swap: '☀️' },
            { icon: '⭐', label: '별장식', swap: '❄️' },
            { icon: '🎭', label: '가면', swap: '🃏' },
            { icon: '📜', label: '주문서', swap: '✉️' },
            { icon: '⚖️', label: '천칭저울', swap: '🧭' },
            { icon: '🐉', label: '미니드래곤', swap: '🦄' },
            { icon: '🦇', label: '박쥐', swap: '🕊️' },
            { icon: '🗝️', label: '은열쇠', swap: '🪙' },
            { icon: '🔔', label: '마법종', swap: '🎺' },
            { icon: '🕰️', label: '탁상시계', swap: '⏰' },
            { icon: '🎁', label: '비밀상자', swap: '💼' },
        ],
    },
];

// 단계별 난이도: 올라갈수록 살펴봐야 할 소품 수와 달라진 곳 개수가 대폭 증가!
function getStageConfig(stage) {
    if (stage === 1) return { itemCount: 10, diffCount: 4, memorizeSec: 25, findSec: 60, penaltySec: 10 };
    if (stage === 2) return { itemCount: 14, diffCount: 5, memorizeSec: 30, findSec: 65, penaltySec: 10 };
    if (stage === 3) return { itemCount: 18, diffCount: 5, memorizeSec: 35, findSec: 70, penaltySec: 10 };
    if (stage === 4) return { itemCount: 22, diffCount: 6, memorizeSec: 40, findSec: 75, penaltySec: 12 };
    return { itemCount: 26, diffCount: 7, memorizeSec: 45, findSec: 80, penaltySec: 12 };
}

/**
 * 겹치지 않는 지터드 그리드(Jittered Grid) 좌표를 생성해 소품들을 일러스트 전역에 자연스럽게 배치
 */
function generateNonOverlappingPositions(count) {
    const cols = count <= 10 ? 5 : count <= 16 ? 5 : count <= 22 ? 6 : 7;
    const rows = Math.ceil(count / cols);
    const padX = 36;
    const padY = 34;
    const cellW = (400 - padX * 2) / cols;
    const cellH = (300 - padY * 2) / rows;

    const slots = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const jitterX = (Math.random() - 0.5) * Math.min(18, cellW * 0.35);
            const jitterY = (Math.random() - 0.5) * Math.min(16, cellH * 0.35);
            slots.push({
                x: Math.round(padX + cellW * (c + 0.5) + jitterX),
                y: Math.round(padY + cellH * (r + 0.5) + jitterY),
            });
        }
    }

    return slots.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * 매판 완전히 새로운 일러스트 테마 + 고밀도 소품 배치 + 랜덤 변형 생성
 */
function generateSpotRound(stage, prevThemeId = '') {
    const cfg = getStageConfig(stage);
    const candidates = SCENE_THEMES.filter((t) => t.id !== prevThemeId);
    const theme = candidates[Math.floor(Math.random() * candidates.length)] || SCENE_THEMES[0];

    const pickedPool = [...theme.pool].sort(() => Math.random() - 0.5).slice(0, cfg.itemCount);
    const positions = generateNonOverlappingPositions(cfg.itemCount);
    const fontSize = cfg.itemCount >= 22 ? 25 : cfg.itemCount >= 16 ? 28 : 32;

    const items = pickedPool.map((entry, idx) => ({
        id: `obj-${idx}-${entry.label}`,
        label: entry.label,
        icon: entry.icon,
        swapIcon: entry.swap,
        x: positions[idx].x,
        y: positions[idx].y,
        size: fontSize,
    }));

    // 변형 대상 인덱스 랜덤 추출 & 5가지 변화 유형 골고루 배정
    const diffTypes = ['vanish', 'swap', 'color', 'move', 'flip'];
    const shuffledIndices = items.map((_, i) => i).sort(() => Math.random() - 0.5);
    const diffMap = {};

    shuffledIndices.slice(0, cfg.diffCount).forEach((itemIdx, order) => {
        const item = items[itemIdx];
        const diffType = diffTypes[(order + Math.floor(Math.random() * diffTypes.length)) % diffTypes.length];

        if (diffType === 'vanish') {
            diffMap[item.id] = { type: 'vanish', desc: `👻 ${item.label} 사라짐` };
        } else if (diffType === 'swap') {
            diffMap[item.id] = { type: 'swap', newIcon: item.swapIcon, desc: `🔄 ${item.label} 모양 변경` };
        } else if (diffType === 'color') {
            const hue = [120, 180, 240, 290][Math.floor(Math.random() * 4)];
            diffMap[item.id] = { type: 'color', hue, desc: `🎨 ${item.label} 색상 변경` };
        } else if (diffType === 'move') {
            const dx = (item.x > 200 ? -1 : 1) * (16 + Math.floor(Math.random() * 8));
            const dy = (item.y > 150 ? -1 : 1) * (12 + Math.floor(Math.random() * 6));
            diffMap[item.id] = { type: 'move', dx, dy, desc: `📐 ${item.label} 위치 이동` };
        } else {
            diffMap[item.id] = { type: 'flip', desc: `🔁 ${item.label} 크기·방향 반전` };
        }
    });

    return {
        theme,
        items,
        diffMap,
        diffIds: Object.keys(diffMap),
        ...cfg,
    };
}

const SpotMemoryGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | memorize | find | stageClear | finished
    const [stage, setStage] = useState(1);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(null);
    const [timeLeft, setTimeLeft] = useState(25);
    const [foundIds, setFoundIds] = useState([]);
    const [wrongTap, setWrongTap] = useState(null); // { x, y, penalty }
    const [penaltyFlash, setPenaltyFlash] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const stageRef = useRef(1);
    const prevThemeRef = useRef('');
    const finishedRef = useRef(false);

    const finishGame = useCallback(async () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setGameState('finished');

        const finalScore = scoreRef.current;
        const clearedStage = Math.max(0, stageRef.current - 1);

        if (finalScore > 0) {
            await submitArcadeScore({
                gameId: 'spot-memory',
                score: finalScore,
                detail: `Stage ${clearedStage} 클리어`,
                user,
                userName,
                mbtiType,
                season: 'season_3',
            });
            const reward = Math.min(45, Math.max(8, Math.floor(finalScore / 130)));
            earnCrystals(reward, '틀린그림찾기 보상');
            toast.success(`Stage ${clearedStage} 기록 등록! +${reward}💎 획득!`);
            setRefreshTrigger((v) => v + 1);
        }
    }, [user, userName, mbtiType, earnCrystals]);

    const startRound = useCallback((st) => {
        const nextRound = generateSpotRound(st, prevThemeRef.current);
        prevThemeRef.current = nextRound.theme.id;
        setRound(nextRound);
        setFoundIds([]);
        setWrongTap(null);
        setPenaltyFlash(false);
        setTimeLeft(nextRound.memorizeSec);
        setGameState('memorize');
    }, []);

    const startGame = () => {
        finishedRef.current = false;
        scoreRef.current = 0;
        stageRef.current = 1;
        setScore(0);
        setStage(1);
        startRound(1);
    };

    const goToFindPhase = useCallback(() => {
        if (!round) return;
        setTimeLeft(round.findSec);
        setGameState('find');
        toast(`🔍 그림이 바뀌었습니다! 달라진 ${round.diffCount}군데를 찾으세요! (오답 -${round.penaltySec}초)`, { icon: '👀' });
    }, [round]);

    // 타이머
    useEffect(() => {
        if (gameState !== 'memorize' && gameState !== 'find') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (gameState === 'memorize') {
                        goToFindPhase();
                        return 0;
                    } else {
                        toast.error('시간 종료! 달라진 곳을 모두 찾지 못했습니다.');
                        finishGame();
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, goToFindPhase, finishGame]);

    // 그림 클릭/터치 판정
    const handleCanvasClick = (e) => {
        if (gameState !== 'find' || !round) return;
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 400;
        const clickY = ((e.clientY - rect.top) / rect.height) * 300;

        let matchedItem = null;
        for (const diffId of round.diffIds) {
            if (foundIds.includes(diffId)) continue;
            const item = round.items.find((it) => it.id === diffId);
            const diff = round.diffMap[diffId];
            if (!item || !diff) continue;

            const tx = diff.type === 'move' ? item.x + (diff.dx || 0) : item.x;
            const ty = diff.type === 'move' ? item.y + (diff.dy || 0) : item.y;
            const hitRadius = round.itemCount >= 22 ? 26 : 31;

            if (Math.hypot(clickX - tx, clickY - ty) <= hitRadius || Math.hypot(clickX - item.x, clickY - item.y) <= hitRadius) {
                matchedItem = { item, diff };
                break;
            }
        }

        if (matchedItem) {
            const nextFound = [...foundIds, matchedItem.item.id];
            setFoundIds(nextFound);
            const gained = 130 + stageRef.current * 35;
            scoreRef.current += gained;
            setScore(scoreRef.current);
            toast.success(`${matchedItem.diff.desc}! (+${gained}점)`);

            if (nextFound.length >= round.diffCount) {
                const timeBonus = timeLeft * 6;
                scoreRef.current += timeBonus;
                setScore(scoreRef.current);
                setGameState('stageClear');
                toast.success(`🎉 Stage ${stageRef.current} ${round.diffCount}군데 모두 발견! (+${timeBonus}점)`);
            }
        } else {
            // 💥 과감한 오답 패널티 (-10초 ~ -12초!)
            const penalty = round.penaltySec;
            setWrongTap({ x: clickX, y: clickY, penalty });
            setPenaltyFlash(true);
            setTimeout(() => {
                setWrongTap(null);
                setPenaltyFlash(false);
            }, 700);

            setTimeLeft((prev) => {
                const nextT = prev - penalty;
                if (nextT <= 0) {
                    setTimeout(() => finishGame(), 60);
                    return 0;
                }
                return nextT;
            });
            toast.error(`💥 오답 터치! 시간이 -${penalty}초 대폭 차감되었습니다!`);
        }
    };

    const handleNextStage = () => {
        const nextSt = stageRef.current + 1;
        stageRef.current = nextSt;
        setStage(nextSt);
        startRound(nextSt);
    };

    // AI 일러스트 배경 + 고밀도 소품 레이어 렌더링
    const renderSceneCanvas = (isModified) => {
        if (!round) return null;
        const { theme, items, diffMap } = round;

        return (
            <motion.div
                animate={penaltyFlash ? { x: [-6, 6, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'relative' }}
            >
                <svg
                    viewBox="0 0 400 300"
                    onClick={isModified ? handleCanvasClick : undefined}
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        borderRadius: '18px',
                        border: penaltyFlash
                            ? '3px solid #ef4444'
                            : isModified
                            ? '2.5px solid #ec4899'
                            : '2.5px solid #6366f1',
                        cursor: isModified && gameState === 'find' ? 'crosshair' : 'default',
                        userSelect: 'none',
                        boxShadow: penaltyFlash
                            ? '0 0 22px rgba(239, 68, 68, 0.5)'
                            : '0 10px 24px rgba(15, 23, 42, 0.14)',
                        background: '#0f172a',
                    }}
                >
                    <defs>
                        <filter id="obj-shadow" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.45" />
                        </filter>
                    </defs>

                    {/* 실제 AI 생성 고퀄리티 일러스트 원화 배경 */}
                    <image
                        href={theme.image}
                        x="0"
                        y="0"
                        width="400"
                        height="300"
                        preserveAspectRatio="xMidYMid slice"
                    />

                    {/* 소품들이 배경에 잘 어우러지면서도 또렷하게 보이도록 미세 비네팅 */}
                    <rect x="0" y="0" width="400" height="300" fill="rgba(15, 23, 42, 0.08)" pointerEvents="none" />

                    {/* 고밀도 일러스트 소품 레이어 (Stage 1: 10개 → Stage 5+: 26개) */}
                    {items.map((item) => {
                        const diff = isModified ? diffMap[item.id] : null;
                        const isFound = foundIds.includes(item.id);

                        // 사라짐(vanish) 변형
                        if (diff?.type === 'vanish') {
                            return isFound ? (
                                <g key={item.id}>
                                    <circle
                                        cx={item.x}
                                        cy={item.y}
                                        r="22"
                                        fill="rgba(16, 185, 129, 0.28)"
                                        stroke="#10b981"
                                        strokeWidth="3.2"
                                        strokeDasharray="4 3"
                                    />
                                    <text
                                        x={item.x}
                                        y={item.y + 4}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="900"
                                        fill="#ffffff"
                                        filter="url(#obj-shadow)"
                                    >
                                        사라짐!
                                    </text>
                                </g>
                            ) : null;
                        }

                        const cx = diff?.type === 'move' ? item.x + (diff.dx || 0) : item.x;
                        const cy = diff?.type === 'move' ? item.y + (diff.dy || 0) : item.y;
                        const iconChar = diff?.type === 'swap' ? diff.newIcon : item.icon;
                        const transformStr =
                            diff?.type === 'flip'
                                ? `translate(${cx}, ${cy}) scale(-1.22, 1.22) rotate(14) translate(${-cx}, ${-cy})`
                                : undefined;
                        const colorStyle =
                            diff?.type === 'color'
                                ? { filter: `hue-rotate(${diff.hue}deg) saturate(1.9) brightness(1.08)` }
                                : undefined;

                        return (
                            <g key={item.id} transform={transformStr}>
                                {/* 반투명 소프트 후광으로 배경 일러스트와 자연스럽게 조화 */}
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={item.size * 0.56}
                                    fill="rgba(255, 255, 255, 0.22)"
                                />
                                <text
                                    x={cx}
                                    y={cy + 1}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={item.size}
                                    filter="url(#obj-shadow)"
                                    style={colorStyle}
                                >
                                    {iconChar}
                                </text>

                                {isModified && isFound && (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={item.size * 0.78}
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="3.8"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* 오답 터치 시 강렬한 빨간 X & -10초 텍스트 */}
                    {wrongTap && (
                        <g>
                            <circle
                                cx={wrongTap.x}
                                cy={wrongTap.y}
                                r="22"
                                fill="rgba(239, 68, 68, 0.45)"
                                stroke="#ef4444"
                                strokeWidth="3.5"
                            />
                            <text
                                x={wrongTap.x}
                                y={wrongTap.y + 1}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="14"
                                fontWeight="900"
                                fill="#ffffff"
                            >
                                -{wrongTap.penalty}초!
                            </text>
                        </g>
                    )}
                </svg>
            </motion.div>
        );
    };

    return (
        <ArcadeGameLayout
            gameId="spot-memory"
            title="🖼️ 틀린그림찾기"
            subtitle="AI 일러스트 속 소품들을 기억하고 달라진 곳을 찾으세요! (오답 시 -10초 대폭 차감!)"
            accentColor="#ec4899"
            accentBg="#fdf2f8"
            onBack={onBack}
            score={score}
            extraStatLabel={gameState === 'memorize' ? '암기 남은 시간' : '발견 / 남은 시간'}
            extraStatValue={
                gameState === 'ready'
                    ? 'AI 일러스트 기억 대결'
                    : gameState === 'memorize'
                    ? `👀 암기 ${timeLeft}초`
                    : `${foundIds.length}/${round?.diffCount || 5} · ${timeLeft}초`
            }
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '24px 14px' }}>
                    <div style={{ fontSize: '3.8rem', marginBottom: '10px' }}>🖼️🔍</div>
                    <div
                        style={{
                            display: 'inline-block',
                            background: '#fce7f3',
                            color: '#be185d',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            marginBottom: '10px',
                        }}
                    >
                        🎨 AI 일러스트 원화 · 고밀도 기억력 대결
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                        그림을 통째로 외우고 달라진 곳을 찾아라!
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.65, marginBottom: '14px' }}>
                        고퀄리티 동화풍 일러스트를 제한 시간 동안 암기한 뒤, <strong>색상 변화 · 소품 사라짐 · 모양 변경 · 위치 이동 · 크기/방향 반전</strong>이 일어난 곳을 직접 터치해 찾아내세요!<br />
                        단계가 올라갈수록 살펴봐야 할 소품이 <strong>10개 → 14개 → 18개 → 22개 → 26개(7군데 변화!)</strong>로 점점 더 빽빽하고 어려워집니다!
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
                            marginBottom: '22px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <AlertTriangle size={16} /> 주의: 찍기 금지! 잘못 터치할 때마다 남은 시간이 <strong>-10초 ~ -12초</strong>씩 확 깎입니다!
                    </div>
                    <br />
                    <Tooltip text="AI 일러스트 틀린그림찾기 게임을 시작합니다">
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
                            <Play size={18} /> 틀린그림찾기 시작
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {(gameState === 'memorize' || gameState === 'find') && round && (
                <div>
                    {/* 상단 진행 상태 바 */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: penaltyFlash
                                ? '#fef2f2'
                                : gameState === 'memorize'
                                ? '#eef2ff'
                                : '#fdf2f8',
                            border: `1.5px solid ${
                                penaltyFlash
                                    ? '#ef4444'
                                    : gameState === 'memorize'
                                    ? '#c7d2fe'
                                    : '#fbcfe8'
                            }`,
                            borderRadius: '14px',
                            padding: '10px 14px',
                            marginBottom: '10px',
                            flexWrap: 'wrap',
                            gap: '8px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: 900,
                                fontSize: '0.84rem',
                                color: gameState === 'memorize' ? '#4338ca' : '#be185d',
                            }}
                        >
                            {gameState === 'memorize' ? <Eye size={16} /> : <Search size={16} />}
                            <span>
                                Stage {stage} ({round.itemCount}개 소품) · {round.theme.title}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AnimatePresence>
                                {penaltyFlash && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            fontWeight: 900,
                                            fontSize: '0.75rem',
                                            padding: '3px 9px',
                                            borderRadius: '100px',
                                        }}
                                    >
                                        💥 오답 -{round.penaltySec}초!
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {gameState === 'memorize' ? (
                                <Tooltip text="충분히 외웠다면 바로 틀린 곳 찾기로 넘어갑니다">
                                    <button
                                        type="button"
                                        onClick={goToFindPhase}
                                        style={{
                                            background: '#4f46e5',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '100px',
                                            padding: '5px 12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <FastForward size={13} /> 바로 찾기
                                    </button>
                                </Tooltip>
                            ) : (
                                <span
                                    style={{
                                        background: '#ec4899',
                                        color: 'white',
                                        fontWeight: 900,
                                        fontSize: '0.76rem',
                                        padding: '4px 10px',
                                        borderRadius: '100px',
                                    }}
                                >
                                    발견 {foundIds.length} / {round.diffCount}
                                </span>
                            )}
                            <span
                                style={{
                                    fontWeight: 900,
                                    fontSize: '0.94rem',
                                    color: penaltyFlash || timeLeft <= 12 ? '#ef4444' : '#0f172a',
                                }}
                            >
                                ⏱️ {timeLeft}초
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: gameState === 'memorize' ? '#4f46e5' : '#db2777',
                            marginBottom: '8px',
                        }}
                    >
                        {gameState === 'memorize'
                            ? `👀 ${round.itemCount}개 소품의 위치·색상·모양을 꼼꼼히 기억하세요!`
                            : `👆 달라진 ${round.diffCount}군데를 정확히 터치하세요! (잘못 누르면 -${round.penaltySec}초!)`}
                    </div>

                    {renderSceneCanvas(gameState === 'find')}

                    {gameState === 'find' && foundIds.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                            {foundIds.map((fid) => (
                                <span
                                    key={fid}
                                    style={{
                                        background: '#ecfdf5',
                                        border: '1px solid #a7f3d0',
                                        color: '#047857',
                                        padding: '4px 10px',
                                        borderRadius: '100px',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <CheckCircle2 size={13} /> {round.diffMap[fid]?.desc}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {gameState === 'stageClear' && round && (
                <div style={{ textAlign: 'center', padding: '24px 14px' }}>
                    <div style={{ fontSize: '3.4rem', marginBottom: '8px' }}>🎉🔍</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        Stage {stage} 완벽 클리어!
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
                        {round.itemCount}개 소품 속에서 달라진 {round.diffCount}군데를 모두 찾아냈습니다!
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
                        {round.diffIds.map((fid) => (
                            <span
                                key={fid}
                                style={{
                                    background: '#fdf2f8',
                                    border: '1px solid #fbcfe8',
                                    color: '#be185d',
                                    padding: '5px 11px',
                                    borderRadius: '100px',
                                    fontSize: '0.76rem',
                                    fontWeight: 800,
                                }}
                            >
                                {round.diffMap[fid]?.desc}
                            </span>
                        ))}
                    </div>
                    <Tooltip text="더 많은 소품과 새로운 AI 일러스트로 다음 단계에 도전합니다">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleNextStage}
                            style={{
                                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '100px',
                                padding: '14px 34px',
                                fontSize: '1rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)',
                            }}
                        >
                            Stage {stage + 1} 도전하기 ({getStageConfig(stage + 1).itemCount}개 소품!) 🚀
                        </motion.button>
                    </Tooltip>
                </div>
            )}

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '24px 14px' }}>
                    <div style={{ fontSize: '3.4rem', marginBottom: '8px' }}>🖼️🏆</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                        Stage {Math.max(0, stage - 1)} 클리어! ({score.toLocaleString()}점)
                    </h2>
                    {round && (
                        <div
                            style={{
                                background: '#fdf2f8',
                                border: '1px solid #fbcfe8',
                                borderRadius: '16px',
                                padding: '12px 14px',
                                margin: '12px auto 20px',
                                textAlign: 'left',
                                fontSize: '0.78rem',
                                color: '#9d174d',
                            }}
                        >
                            <div style={{ fontWeight: 900, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <AlertCircle size={14} /> 이번 판 정답 {round.diffCount}군데 공개:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {round.diffIds.map((fid) => {
                                    const found = foundIds.includes(fid);
                                    return (
                                        <span
                                            key={fid}
                                            style={{
                                                background: found ? '#dcfce7' : 'white',
                                                color: found ? '#15803d' : '#be185d',
                                                border: `1px solid ${found ? '#86efac' : '#f9a8d4'}`,
                                                padding: '3px 9px',
                                                borderRadius: '100px',
                                                fontWeight: 800,
                                            }}
                                        >
                                            {found ? '✓ ' : '• '}
                                            {round.diffMap[fid]?.desc}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <Tooltip text="새로운 랜덤 AI 일러스트와 배치로 다시 도전합니다">
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
                            <RotateCcw size={18} /> 새 그림으로 다시 도전
                        </motion.button>
                    </Tooltip>
                </div>
            )}
        </ArcadeGameLayout>
    );
};

export default SpotMemoryGamePage;
