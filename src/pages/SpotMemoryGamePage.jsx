import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Eye, Search, FastForward, CheckCircle2, AlertCircle } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

/**
 * 5가지 풍성한 테마 일러스트 장면 (각 장면마다 12개 오브젝트)
 * 각 오브젝트는 고유한 변형 방식(color: 색 변경, vanish: 사라짐, swap: 모양 변경, move: 위치/크기 변경)을 지닙니다.
 */
const SCENE_THEMES = [
    {
        id: 'camping',
        title: '🏕️ 별빛 숲속 캠핑장',
        skyTop: '#0f172a',
        skyBottom: '#1e3a8a',
        groundColor: '#15803d',
        groundY: 195,
        decor: 'hills',
        items: [
            { id: 'moon', label: '초승달', x: 65, y: 55, icon: '🌙', bg: '#fef08a', size: 32, diffType: 'color', diffBg: '#f472b6', diffIcon: '🌙', diffDesc: '🎨 달 색상 변경' },
            { id: 'star', label: '반짝별', x: 155, y: 42, icon: '⭐', bg: '#fde047', size: 26, diffType: 'swap', diffBg: '#fde047', diffIcon: '💖', diffDesc: '🔄 별 → 하트 변경' },
            { id: 'cloud', label: '밤구름', x: 265, y: 52, icon: '☁️', bg: '#e2e8f0', size: 30, diffType: 'vanish', diffDesc: '👻 구름 사라짐' },
            { id: 'owl', label: '부엉이', x: 345, y: 78, icon: '🦉', bg: '#fed7aa', size: 28, diffType: 'swap', diffBg: '#fed7aa', diffIcon: '🦇', diffDesc: '🔄 부엉이 → 박쥐' },
            { id: 'pine1', label: '큰 소나무', x: 55, y: 155, icon: '🌲', bg: '#bbf7d0', size: 34, diffType: 'color', diffBg: '#fca5a5', diffIcon: '🌲', diffDesc: '🎨 소나무 배경색 변경' },
            { id: 'tent', label: '캠핑 텐트', x: 160, y: 170, icon: '⛺', bg: '#fca5a5', size: 40, diffType: 'color', diffBg: '#a78bfa', diffIcon: '⛺', diffDesc: '🎨 텐트 색상 변경' },
            { id: 'flag', label: '깃발', x: 235, y: 140, icon: '🚩', bg: '#fecaca', size: 26, diffType: 'move', dx: 18, dy: -16, diffDesc: '📐 깃발 위치 이동' },
            { id: 'pine2', label: '오른쪽 나무', x: 338, y: 158, icon: '🌳', bg: '#86efac', size: 34, diffType: 'vanish', diffDesc: '👻 오른쪽 나무 사라짐' },
            { id: 'backpack', label: '등산 배낭', x: 75, y: 245, icon: '🎒', bg: '#93c5fd', size: 30, diffType: 'color', diffBg: '#fde047', diffIcon: '🎒', diffDesc: '🎨 배낭 색상 변경' },
            { id: 'fire', label: '모닥불', x: 195, y: 248, icon: '🔥', bg: '#fdba74', size: 34, diffType: 'swap', diffBg: '#bae6fd', diffIcon: '💧', diffDesc: '🔄 모닥불 → 물방울' },
            { id: 'lantern', label: '캠핑 랜턴', x: 280, y: 235, icon: '🏮', bg: '#fca5a5', size: 28, diffType: 'vanish', diffDesc: '👻 랜턴 사라짐' },
            { id: 'mug', label: '코코아 컵', x: 345, y: 252, icon: '☕', bg: '#e9d5ff', size: 28, diffType: 'swap', diffBg: '#e9d5ff', diffIcon: '🥤', diffDesc: '🔄 코코아 → 음료컵' },
        ],
    },
    {
        id: 'cafe',
        title: '☕ 소울펫 루프탑 카페',
        skyTop: '#fff7ed',
        skyBottom: '#ffedd5',
        groundColor: '#d97706',
        groundY: 190,
        decor: 'awning',
        items: [
            { id: 'clock', label: '벽시계', x: 65, y: 65, icon: '🕒', bg: '#e0e7ff', size: 30, diffType: 'swap', diffBg: '#e0e7ff', diffIcon: '🕘', diffDesc: '🔄 시계 시간 변경' },
            { id: 'frame', label: '벽 액자', x: 160, y: 62, icon: '🖼️', bg: '#fde68a', size: 32, diffType: 'color', diffBg: '#a7f3d0', diffIcon: '🖼️', diffDesc: '🎨 액자 테두리 색 변경' },
            { id: 'lamp', label: '천장 조명', x: 255, y: 55, icon: '💡', bg: '#fef08a', size: 28, diffType: 'vanish', diffDesc: '👻 조명 사라짐' },
            { id: 'menu', label: '메뉴판', x: 340, y: 72, icon: '📋', bg: '#fed7aa', size: 30, diffType: 'move', dx: -16, dy: 14, diffDesc: '📐 메뉴판 위치 이동' },
            { id: 'plant', label: '화분', x: 58, y: 150, icon: '🪴', bg: '#bbf7d0', size: 32, diffType: 'swap', diffBg: '#fbcfe8', diffIcon: '🌷', diffDesc: '🔄 화분 → 튤립' },
            { id: 'cat', label: '소울펫 고양이', x: 150, y: 155, icon: '🐱', bg: '#fef3c7', size: 36, diffType: 'swap', diffBg: '#fef3c7', diffIcon: '🦊', diffDesc: '🔄 고양이 → 여우' },
            { id: 'teapot', label: '찻주전자', x: 245, y: 155, icon: '🫖', bg: '#bfdbfe', size: 32, diffType: 'color', diffBg: '#f9a8d4', diffIcon: '🫖', diffDesc: '🎨 주전자 색상 변경' },
            { id: 'bell', label: '호출벨', x: 335, y: 158, icon: '🔔', bg: '#fde047', size: 28, diffType: 'vanish', diffDesc: '👻 호출벨 사라짐' },
            { id: 'cake', label: '딸기 케이크', x: 85, y: 242, icon: '🍰', bg: '#fecdd3', size: 34, diffType: 'swap', diffBg: '#fecdd3', diffIcon: '🍩', diffDesc: '🔄 케이크 → 도넛' },
            { id: 'coffee', label: '라떼잔', x: 185, y: 245, icon: '☕', bg: '#e2e8f0', size: 32, diffType: 'vanish', diffDesc: '👻 라떼잔 사라짐' },
            { id: 'croissant', label: '크루아상', x: 270, y: 244, icon: '🥐', bg: '#fde68a', size: 30, diffType: 'color', diffBg: '#c4b5fd', diffIcon: '🥐', diffDesc: '🎨 접시 색상 변경' },
            { id: 'gift', label: '쿠키 상자', x: 345, y: 246, icon: '🎁', bg: '#fca5a5', size: 30, diffType: 'color', diffBg: '#6ee7b7', diffIcon: '🎁', diffDesc: '🎨 상자 색상 변경' },
        ],
    },
    {
        id: 'space',
        title: '🚀 우주 정거장 전망대',
        skyTop: '#020617',
        skyBottom: '#312e81',
        groundColor: '#334155',
        groundY: 205,
        decor: 'stars',
        items: [
            { id: 'saturn', label: '토성', x: 70, y: 55, icon: '🪐', bg: '#fde68a', size: 34, diffType: 'color', diffBg: '#67e8f9', diffIcon: '🪐', diffDesc: '🎨 토성 색상 변경' },
            { id: 'comet', label: '유성', x: 165, y: 45, icon: '☄️', bg: '#fdba74', size: 28, diffType: 'vanish', diffDesc: '👻 유성 사라짐' },
            { id: 'earth', label: '푸른 지구', x: 265, y: 58, icon: '🌍', bg: '#93c5fd', size: 34, diffType: 'swap', diffBg: '#fef08a', diffIcon: '🌕', diffDesc: '🔄 지구 → 보름달' },
            { id: 'ufo', label: 'UFO', x: 345, y: 52, icon: '🛸', bg: '#c4b5fd', size: 30, diffType: 'move', dx: -18, dy: 16, diffDesc: '📐 UFO 위치 이동' },
            { id: 'rocket', label: '우주 로켓', x: 68, y: 145, icon: '🚀', bg: '#fca5a5', size: 36, diffType: 'color', diffBg: '#86efac', diffIcon: '🚀', diffDesc: '🎨 로켓 배경색 변경' },
            { id: 'astronaut', label: '우주인', x: 165, y: 150, icon: '🧑‍🚀', bg: '#e2e8f0', size: 36, diffType: 'swap', diffBg: '#e2e8f0', diffIcon: '🤖', diffDesc: '🔄 우주인 → 로봇' },
            { id: 'satellite', label: '인공위성', x: 260, y: 142, icon: '🛰️', bg: '#cbd5e1', size: 30, diffType: 'vanish', diffDesc: '👻 인공위성 사라짐' },
            { id: 'alien', label: '외계인', x: 340, y: 152, icon: '👽', bg: '#bbf7d0', size: 32, diffType: 'swap', diffBg: '#f5d0fe', diffIcon: '👾', diffDesc: '🔄 외계인 모양 변경' },
            { id: 'radar', label: '레이더', x: 80, y: 248, icon: '📡', bg: '#93c5fd', size: 30, diffType: 'vanish', diffDesc: '👻 레이더 사라짐' },
            { id: 'gem', label: '우주 보석', x: 175, y: 252, icon: '💎', bg: '#67e8f9', size: 30, diffType: 'color', diffBg: '#fda4af', diffIcon: '💎', diffDesc: '🎨 보석 색상 변경' },
            { id: 'battery', label: '에너지셀', x: 265, y: 250, icon: '🔋', bg: '#86efac', size: 28, diffType: 'color', diffBg: '#fde047', diffIcon: '🔋', diffDesc: '🎨 에너지셀 색상 변경' },
            { id: 'joystick', label: '조종간', x: 342, y: 248, icon: '🕹️', bg: '#fca5a5', size: 30, diffType: 'move', dx: -16, dy: -12, diffDesc: '📐 조종간 위치 이동' },
        ],
    },
    {
        id: 'ocean',
        title: '🐠 깊은 바다 아쿠아리움',
        skyTop: '#0284c7',
        skyBottom: '#0369a1',
        groundColor: '#eab308',
        groundY: 210,
        decor: 'waves',
        items: [
            { id: 'whale', label: '고래', x: 78, y: 58, icon: '🐳', bg: '#bae6fd', size: 36, diffType: 'swap', diffBg: '#bae6fd', diffIcon: '🐬', diffDesc: '🔄 고래 → 돌고래' },
            { id: 'jelly', label: '해파리', x: 175, y: 52, icon: '🪼', bg: '#f5d0fe', size: 30, diffType: 'vanish', diffDesc: '👻 해파리 사라짐' },
            { id: 'sub', label: '잠수함', x: 270, y: 60, icon: '🚤', bg: '#fde047', size: 32, diffType: 'color', diffBg: '#fca5a5', diffIcon: '🚤', diffDesc: '🎨 배 색상 변경' },
            { id: 'bubble', label: '물방울', x: 348, y: 56, icon: '🫧', bg: '#e0f2fe', size: 28, diffType: 'move', dx: -16, dy: 16, diffDesc: '📐 물방울 위치 이동' },
            { id: 'fish1', label: '열대어', x: 65, y: 145, icon: '🐠', bg: '#fed7aa', size: 32, diffType: 'swap', diffBg: '#fed7aa', diffIcon: '🐡', diffDesc: '🔄 열대어 → 복어' },
            { id: 'octopus', label: '문어', x: 165, y: 148, icon: '🐙', bg: '#fecdd3', size: 36, diffType: 'color', diffBg: '#c4b5fd', diffIcon: '🐙', diffDesc: '🎨 문어 색상 변경' },
            { id: 'turtle', label: '바다거북', x: 262, y: 146, icon: '🐢', bg: '#bbf7d0', size: 32, diffType: 'vanish', diffDesc: '👻 바다거북 사라짐' },
            { id: 'shark', label: '상어', x: 342, y: 150, icon: '🦈', bg: '#cbd5e1', size: 34, diffType: 'swap', diffBg: '#cbd5e1', diffIcon: '🦭', diffDesc: '🔄 상어 → 물개' },
            { id: 'coral', label: '산호초', x: 72, y: 246, icon: '🪸', bg: '#fda4af', size: 32, diffType: 'color', diffBg: '#6ee7b7', diffIcon: '🪸', diffDesc: '🎨 산호 색상 변경' },
            { id: 'shell', label: '진주조개', x: 168, y: 250, icon: '🐚', bg: '#fef3c7', size: 30, diffType: 'vanish', diffDesc: '👻 진주조개 사라짐' },
            { id: 'crab', label: '꽃게', x: 262, y: 248, icon: '🦀', bg: '#fca5a5', size: 32, diffType: 'swap', diffBg: '#fca5a5', diffIcon: '🦞', diffDesc: '🔄 꽃게 → 랍스터' },
            { id: 'anchor', label: '바다 닻', x: 342, y: 248, icon: '⚓', bg: '#94a3b8', size: 30, diffType: 'color', diffBg: '#fde047', diffIcon: '⚓', diffDesc: '🎨 닻 색상 변경' },
        ],
    },
    {
        id: 'magic',
        title: '📚 마법사의 비밀 서재',
        skyTop: '#3b0764',
        skyBottom: '#581c87',
        groundColor: '#78350f',
        groundY: 200,
        decor: 'stars',
        items: [
            { id: 'hat', label: '마법 모자', x: 68, y: 58, icon: '🎩', bg: '#e9d5ff', size: 32, diffType: 'swap', diffBg: '#e9d5ff', diffIcon: '👑', diffDesc: '🔄 모자 → 왕관' },
            { id: 'candle', label: '양초', x: 162, y: 55, icon: '🕯️', bg: '#fef08a', size: 30, diffType: 'vanish', diffDesc: '👻 양초 사라짐' },
            { id: 'owl2', label: '서재 부엉이', x: 260, y: 58, icon: '🦉', bg: '#fed7aa', size: 32, diffType: 'color', diffBg: '#a5f3fc', diffIcon: '🦉', diffDesc: '🎨 부엉이 배경색 변경' },
            { id: 'broom', label: '빗자루', x: 342, y: 62, icon: '🧹', bg: '#fde68a', size: 30, diffType: 'move', dx: -16, dy: 16, diffDesc: '📐 빗자루 위치 이동' },
            { id: 'potion', label: '마법 물약', x: 66, y: 148, icon: '🧪', bg: '#86efac', size: 32, diffType: 'color', diffBg: '#f472b6', diffIcon: '🧪', diffDesc: '🎨 물약 색상 변경' },
            { id: 'crystal', label: '수정구슬', x: 165, y: 152, icon: '🔮', bg: '#c084fc', size: 36, diffType: 'color', diffBg: '#38bdf8', diffIcon: '🔮', diffDesc: '🎨 수정구슬 색상 변경' },
            { id: 'hourglass', label: '모래시계', x: 262, y: 148, icon: '⏳', bg: '#fde68a', size: 30, diffType: 'vanish', diffDesc: '👻 모래시계 사라짐' },
            { id: 'key', label: '황금 열쇠', x: 342, y: 150, icon: '🗝️', bg: '#fef08a', size: 30, diffType: 'swap', diffBg: '#fef08a', diffIcon: '🔒', diffDesc: '🔄 열쇠 → 자물쇠' },
            { id: 'book', label: '마법책', x: 75, y: 248, icon: '📖', bg: '#bfdbfe', size: 32, diffType: 'swap', diffBg: '#bfdbfe', diffIcon: '📜', diffDesc: '🔄 마법책 → 두루마리' },
            { id: 'wand', label: '요술봉', x: 170, y: 250, icon: '🪄', bg: '#fbcfe8', size: 32, diffType: 'vanish', diffDesc: '👻 요술봉 사라짐' },
            { id: 'telescope', label: '망원경', x: 265, y: 248, icon: '🔭', bg: '#cbd5e1', size: 32, diffType: 'color', diffBg: '#fca5a5', diffIcon: '🔭', diffDesc: '🎨 망원경 색상 변경' },
            { id: 'feather', label: '깃펜', x: 342, y: 248, icon: '🪶', bg: '#e2e8f0', size: 30, diffType: 'move', dx: -16, dy: -14, diffDesc: '📐 깃펜 위치 이동' },
        ],
    },
];

const DIFF_TARGET_COUNT = 5;

/**
 * 스테이지에 맞는 랜덤 장면 + 무작위 5군데 변형 생성
 */
function generateSpotRound(stage, prevThemeId = '') {
    const candidates = SCENE_THEMES.filter((t) => t.id !== prevThemeId);
    const theme = candidates[Math.floor(Math.random() * candidates.length)] || SCENE_THEMES[0];

    // 12개 오브젝트 중 무작위로 5개를 선택하여 변형 대상으로 지정
    const shuffledIds = theme.items.map((item) => item.id).sort(() => Math.random() - 0.5);
    const diffIds = shuffledIds.slice(0, DIFF_TARGET_COUNT);

    // 암기 시간은 충분히 제공 (1단계 30초, 고단계 35초 / 찾기 시간 65초)
    const memorizeSec = stage <= 2 ? 30 : 35;
    const findSec = Math.max(45, 70 - (stage - 1) * 4);

    return {
        theme,
        diffIds,
        memorizeSec,
        findSec,
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
    const [timeLeft, setTimeLeft] = useState(30);
    const [foundIds, setFoundIds] = useState([]);
    const [wrongTap, setWrongTap] = useState(null); // { x, y, ts }
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
            earnCrystals(reward, '유배지 틀린그림찾기 보상');
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
        toast('🔍 그림이 바뀌었습니다! 달라진 5군데를 찾아 터치하세요!', { icon: '👀' });
    }, [round]);

    // 타이머 (암기 페이즈 → 자동 찾기 전환 / 찾기 페이즈 → 0초 시 종료)
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
                        toast.error('시간 종료! 달라진 5군데를 모두 찾지 못했습니다.');
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

        // 달라진 5개 오브젝트의 위치(이동된 경우 원래 위치와 새 위치 모두 인정!) 검사
        let matchedItem = null;
        for (const diffId of round.diffIds) {
            if (foundIds.includes(diffId)) continue;
            const item = round.theme.items.find((it) => it.id === diffId);
            if (!item) continue;

            const tx = item.diffType === 'move' ? item.x + (item.dx || 0) : item.x;
            const ty = item.diffType === 'move' ? item.y + (item.dy || 0) : item.y;
            const distNew = Math.hypot(clickX - tx, clickY - ty);
            const distOrig = Math.hypot(clickX - item.x, clickY - item.y);

            if (distNew <= 36 || distOrig <= 34) {
                matchedItem = item;
                break;
            }
        }

        if (matchedItem) {
            const nextFound = [...foundIds, matchedItem.id];
            setFoundIds(nextFound);
            const gained = 120 + stageRef.current * 25;
            scoreRef.current += gained;
            setScore(scoreRef.current);
            toast.success(`${matchedItem.diffDesc}! (+${gained}점)`);

            if (nextFound.length >= DIFF_TARGET_COUNT) {
                const timeBonus = timeLeft * 5;
                scoreRef.current += timeBonus;
                setScore(scoreRef.current);
                setGameState('stageClear');
                toast.success(`🎉 Stage ${stageRef.current} 5군데 모두 발견! (시간 보너스 +${timeBonus}점)`);
            }
        } else {
            // 오답 터치: -3초 패널티
            setWrongTap({ x: clickX, y: clickY, ts: Date.now() });
            setTimeout(() => setWrongTap(null), 650);
            setTimeLeft((prev) => {
                const nextT = prev - 3;
                if (nextT <= 0) {
                    setTimeout(() => finishGame(), 50);
                    return 0;
                }
                return nextT;
            });
            toast.error('여기는 그대로입니다! (-3초)');
        }
    };

    const handleNextStage = () => {
        const nextSt = stageRef.current + 1;
        stageRef.current = nextSt;
        setStage(nextSt);
        startRound(nextSt);
    };

    // SVG 일러스트 씬 렌더링 (isModified: false면 원본, true면 5군데 변형 적용)
    const renderSceneSvg = (isModified) => {
        if (!round) return null;
        const { theme, diffIds } = round;

        return (
            <svg
                viewBox="0 0 400 300"
                onClick={isModified ? handleCanvasClick : undefined}
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '18px',
                    border: isModified ? '2.5px solid #ec4899' : '2.5px solid #6366f1',
                    cursor: isModified && gameState === 'find' ? 'crosshair' : 'default',
                    userSelect: 'none',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.1)',
                }}
            >
                <defs>
                    <linearGradient id={`sky-${theme.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.skyTop} />
                        <stop offset="100%" stopColor={theme.skyBottom} />
                    </linearGradient>
                </defs>

                {/* 배경 하늘 */}
                <rect x="0" y="0" width="400" height="300" fill={`url(#sky-${theme.id})`} />

                {/* 배경 장식 */}
                {theme.decor === 'stars' && (
                    <g fill="white" opacity="0.55">
                        <circle cx="30" cy="25" r="1.5" />
                        <circle cx="115" cy="20" r="2" />
                        <circle cx="215" cy="30" r="1.5" />
                        <circle cx="310" cy="22" r="2" />
                        <circle cx="380" cy="38" r="1.5" />
                        <circle cx="120" cy="105" r="1.5" />
                        <circle cx="295" cy="100" r="1.8" />
                    </g>
                )}
                {theme.decor === 'hills' && (
                    <>
                        <ellipse cx="100" cy="205" rx="140" ry="50" fill="#166534" opacity="0.85" />
                        <ellipse cx="310" cy="210" rx="150" ry="55" fill="#14532d" opacity="0.85" />
                    </>
                )}
                {theme.decor === 'awning' && (
                    <g>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <rect
                                key={i}
                                x={i * 50}
                                y="0"
                                width="50"
                                height="22"
                                fill={i % 2 === 0 ? '#f43f5e' : '#ffffff'}
                                opacity="0.85"
                            />
                        ))}
                    </g>
                )}
                {theme.decor === 'waves' && (
                    <path
                        d="M0 28 Q 50 16 100 28 T 200 28 T 300 28 T 400 28 L 400 0 L 0 0 Z"
                        fill="#38bdf8"
                        opacity="0.35"
                    />
                )}

                {/* 바닥 영역 */}
                <rect
                    x="0"
                    y={theme.groundY}
                    width="400"
                    height={300 - theme.groundY}
                    fill={theme.groundColor}
                    opacity="0.92"
                />
                <line
                    x1="0"
                    y1={theme.groundY}
                    x2="400"
                    y2={theme.groundY}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                />

                {/* 12개 인터랙티브 오브젝트 렌더링 */}
                {theme.items.map((item) => {
                    const isDiff = isModified && diffIds.includes(item.id);
                    const isFound = foundIds.includes(item.id);

                    // 사라짐(vanish) 변형이면 그리지 않되, 이미 찾았으면 빈자리에 초록 링 표시
                    if (isDiff && item.diffType === 'vanish') {
                        return isFound ? (
                            <g key={item.id}>
                                <circle
                                    cx={item.x}
                                    cy={item.y}
                                    r="26"
                                    fill="rgba(16, 185, 129, 0.25)"
                                    stroke="#10b981"
                                    strokeWidth="3.5"
                                    strokeDasharray="5 3"
                                />
                                <text
                                    x={item.x}
                                    y={item.y + 4}
                                    textAnchor="middle"
                                    fontSize="13"
                                    fontWeight="900"
                                    fill="#ecfdf5"
                                >
                                    사라짐!
                                </text>
                            </g>
                        ) : null;
                    }

                    const cx = isDiff && item.diffType === 'move' ? item.x + (item.dx || 0) : item.x;
                    const cy = isDiff && item.diffType === 'move' ? item.y + (item.dy || 0) : item.y;
                    const bgColor = isDiff && item.diffBg ? item.diffBg : item.bg;
                    const iconChar = isDiff && item.diffIcon ? item.diffIcon : item.icon;

                    return (
                        <g key={item.id}>
                            {/* 오브젝트 컬러 뱃지 */}
                            <circle
                                cx={cx}
                                cy={cy}
                                r="24"
                                fill={bgColor}
                                stroke="rgba(255,255,255,0.85)"
                                strokeWidth="2.5"
                            />
                            <text
                                x={cx}
                                y={cy + 2}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={item.size}
                            >
                                {iconChar}
                            </text>

                            {/* 찾은 정답 표시 링 */}
                            {isModified && isFound && (
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r="29"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="4"
                                />
                            )}
                        </g>
                    );
                })}

                {/* 오답 터치 빨간 X 표시 */}
                {wrongTap && (
                    <g>
                        <circle cx={wrongTap.x} cy={wrongTap.y} r="18" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="3" />
                        <text
                            x={wrongTap.x}
                            y={wrongTap.y + 1}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="18"
                            fontWeight="900"
                            fill="#ffffff"
                        >
                            ✕
                        </text>
                    </g>
                )}
            </svg>
        );
    };

    return (
        <ArcadeGameLayout
            gameId="spot-memory"
            title="🖼️ 유배지 틀린그림찾기"
            subtitle="원본 그림을 기억한 뒤, 색상·모양·위치가 바뀐 5군데를 찾아 터치하세요!"
            accentColor="#ec4899"
            accentBg="#fdf2f8"
            onBack={onBack}
            score={score}
            extraStatLabel={gameState === 'memorize' ? '암기 남은 시간' : '발견 / 남은 시간'}
            extraStatValue={
                gameState === 'ready'
                    ? '5군데 기억 찾기'
                    : gameState === 'memorize'
                    ? `👀 암기 ${timeLeft}초`
                    : `${foundIds.length}/${DIFF_TARGET_COUNT} · ${timeLeft}초`
            }
            refreshTrigger={refreshTrigger}
        >
            {gameState === 'ready' && (
                <div style={{ textAlign: 'center', padding: '26px 14px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🖼️🔍</div>
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
                        🔥 데블스 플랜 유배지 기억력 매치 스타일
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                        원본을 외우고 달라진 5군데를 찾아라!
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.65, marginBottom: '18px' }}>
                        먼저 <strong>30초 동안 원본 그림</strong>을 꼼꼼하게 기억하세요.<br />
                        암기 시간이 끝나면 그림이 바뀌며, <strong>매판 무작위로 달라진 5군데</strong>를 제한 시간 안에 직접 터치해 찾아내야 합니다!
                    </p>
                    <div
                        style={{
                            background: '#fdf2f8',
                            border: '1px solid #fbcfe8',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            fontSize: '0.8rem',
                            color: '#9d174d',
                            textAlign: 'left',
                            marginBottom: '22px',
                            lineHeight: 1.6,
                        }}
                    >
                        <strong>🎯 매판 바뀌는 4가지 변화 유형:</strong><br />
                        • 🎨 <strong>색상(컬러) 변화</strong> — 아이템이나 배경 색이 달라집니다<br />
                        • 👻 <strong>소품 사라짐</strong> — 원래 있던 물건이 감쪽같이 없어집니다<br />
                        • 🔄 <strong>모양 변경</strong> — 다른 동물이나 소품으로 바뀝니다<br />
                        • 📐 <strong>위치 이동</strong> — 원래 자리에서 슬쩍 이동합니다 (오답 시 -3초!)
                    </div>
                    <Tooltip text="유배지 기억력 틀린그림찾기 게임을 시작합니다">
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
                            <Play size={18} /> 암기 & 찾기 시작
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
                            background: gameState === 'memorize' ? '#eef2ff' : '#fdf2f8',
                            border: `1.5px solid ${gameState === 'memorize' ? '#c7d2fe' : '#fbcfe8'}`,
                            borderRadius: '14px',
                            padding: '10px 14px',
                            marginBottom: '12px',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900, fontSize: '0.86rem', color: gameState === 'memorize' ? '#4338ca' : '#be185d' }}>
                            {gameState === 'memorize' ? <Eye size={16} /> : <Search size={16} />}
                            <span>
                                Stage {stage} · {round.theme.title}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {gameState === 'memorize' ? (
                                <Tooltip text="충분히 외웠다면 바로 틀린 5군데 찾기로 넘어갑니다">
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
                                    발견 {foundIds.length} / {DIFF_TARGET_COUNT}
                                </span>
                            )}
                            <span style={{ fontWeight: 900, fontSize: '0.92rem', color: timeLeft <= 10 ? '#ef4444' : '#0f172a' }}>
                                ⏱️ {timeLeft}초
                            </span>
                        </div>
                    </div>

                    {/* 안내 문구 */}
                    <div
                        style={{
                            textAlign: 'center',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: gameState === 'memorize' ? '#4f46e5' : '#db2777',
                            marginBottom: '10px',
                        }}
                    >
                        {gameState === 'memorize'
                            ? '👀 원본 그림의 12가지 소품 위치·색상·모양을 꼼꼼히 기억하세요!'
                            : '👆 원본과 달라진 5군데(색 변화·사라짐·모양·이동)를 직접 터치하세요!'}
                    </div>

                    {/* SVG 그림판 */}
                    {renderSceneSvg(gameState === 'find')}

                    {/* 발견한 변화 목록 뱃지 */}
                    {gameState === 'find' && foundIds.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                            {foundIds.map((fid) => {
                                const it = round.theme.items.find((x) => x.id === fid);
                                return (
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
                                        <CheckCircle2 size={13} /> {it?.diffDesc}
                                    </span>
                                );
                            })}
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
                        {round.theme.title}에서 달라진 5군데를 모두 찾아냈습니다!
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
                        {round.diffIds.map((fid) => {
                            const it = round.theme.items.find((x) => x.id === fid);
                            return (
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
                                    {it?.diffDesc}
                                </span>
                            );
                        })}
                    </div>
                    <Tooltip text="새로운 테마와 새로운 5군데 변형으로 다음 스테이지에 도전합니다">
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
                            Stage {stage + 1} 도전하기 🚀
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
                                <AlertCircle size={14} /> 이번 판 정답 5군데 공개:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {round.diffIds.map((fid) => {
                                    const it = round.theme.items.find((x) => x.id === fid);
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
                                            {it?.diffDesc}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <Tooltip text="새로운 랜덤 그림과 변형으로 다시 도전합니다">
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
