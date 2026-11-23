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
 * 5종 진짜 일러스트 틀린그림찾기 스테이지 (이모지/아이콘 0개!)
 * - Stage 1~4: 실제 일러스트 사물 좌표에 캔버스 픽셀 엔진(외곽선 보존 색상 변환 · 좌우 반전 · 깔끔한 지우기)을 적용
 *   (매판 6개 후보 중 무작위 5군데를 선택하므로 다시 시작해도 매번 다른 문제 출제!)
 * - Stage 5: AI로 정밀 편집된 완벽한 쌍(원본 + 변형 그림) + 역방향 출제 지원
 */
const REAL_PUZZLE_STAGES = [
    {
        id: 'cafe',
        title: '☕ 햇살 디저트 카페',
        difficulty: 'Lv.1 입문',
        origImage: `${BASE}images/spot-diff/real/stage1_cafe.jpg`,
        diffImage: null,
        memorizeSec: 30,
        findSec: 65,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'clock', label: '벽시계 바늘 방향 변경', x: 26, y: 17, rx: 8.5, ry: 11.5, mode: 'mirror' },
            { id: 'tulip', label: '액자 속 튤립 색상 변경', x: 56.5, y: 21, rx: 5.5, ry: 8, mode: 'hue', hue: 210, minSat: 0.24 },
            { id: 'cake', label: '딸기 케이크 색상 변경', x: 40.5, y: 46, rx: 10.5, ry: 10, mode: 'hue', hue: 175, minSat: 0.16 },
            { id: 'cactus', label: '창턱 선인장 색상 변경', x: 74.5, y: 42, rx: 5, ry: 7.5, mode: 'hue', hue: 175, minSat: 0.22 },
            { id: 'cup', label: '커피잔 손잡이 방향 반전', x: 19.5, y: 65, rx: 9, ry: 8.5, mode: 'mirror' },
            { id: 'cat', label: '의자 위 고양이 방향 반전', x: 79, y: 72, rx: 10.5, ry: 12.5, mode: 'mirror' },
        ],
    },
    {
        id: 'camping',
        title: '🏕️ 별빛 숲속 캠핑장',
        difficulty: 'Lv.2 초급',
        origImage: `${BASE}images/spot-diff/real/stage2_camping.jpg`,
        diffImage: null,
        memorizeSec: 35,
        findSec: 65,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'moon', label: '초승달 방향 반전', x: 26.5, y: 14, rx: 6, ry: 8, mode: 'mirror' },
            { id: 'tent', label: '캠핑 텐트 색상 변경', x: 25, y: 58, rx: 16.5, ry: 16, mode: 'hue', hue: 195, minSat: 0.28 },
            { id: 'kettle', label: '주전자 색상 변경', x: 52, y: 62, rx: 5, ry: 5.5, mode: 'hue', hue: 245, minSat: 0.35 },
            { id: 'backpack', label: '등산 배낭 색상 변경', x: 73, y: 73, rx: 8, ry: 12, mode: 'hue', hue: 155, minSat: 0.30 },
            { id: 'owl', label: '나뭇가지 위 부엉이 방향 반전', x: 83, y: 19, rx: 7, ry: 11, mode: 'mirror' },
            { id: 'fire', label: '모닥불 불꽃 색상 변경', x: 52.5, y: 73, rx: 6.5, ry: 7, mode: 'hue', hue: 190, minSat: 0.35 },
        ],
    },
    {
        id: 'wizard',
        title: '📚 마법사의 비밀 서재',
        difficulty: 'Lv.3 중급',
        origImage: `${BASE}images/spot-diff/real/stage3_wizard.jpg`,
        diffImage: null,
        memorizeSec: 40,
        findSec: 70,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'moon', label: '창밖 초승달 방향 반전', x: 45.5, y: 18.5, rx: 4.5, ry: 6, mode: 'mirror' },
            { id: 'crystal', label: '수정구슬 색상 변경', x: 50, y: 61, rx: 6.5, ry: 8.5, mode: 'hue', hue: 145, minSat: 0.25 },
            { id: 'potion', label: '마법 물약병 색상 변경', x: 67, y: 66, rx: 5.5, ry: 8, mode: 'hue', hue: 215, minSat: 0.28 },
            { id: 'hat', label: '마법 모자 색상 변경', x: 86.5, y: 31, rx: 7, ry: 8.5, mode: 'hue', hue: 160, minSat: 0.25 },
            { id: 'owl', label: '하얀 부엉이 방향 반전', x: 56.5, y: 42, rx: 6.5, ry: 9.5, mode: 'mirror' },
            { id: 'flame', label: '왼쪽 촛불 불꽃 사라짐', x: 33.5, y: 45.5, rx: 2.5, ry: 4, mode: 'erase' },
        ],
    },
    {
        id: 'ocean',
        title: '🐠 산호초 바닷속 세상',
        difficulty: 'Lv.4 고급',
        origImage: `${BASE}images/spot-diff/real/stage4_ocean.jpg`,
        diffImage: null,
        memorizeSec: 40,
        findSec: 75,
        penaltySec: 12,
        diffCount: 5,
        candidates: [
            { id: 'sub', label: '잠수함 색상 변경', x: 25.5, y: 19, rx: 14, ry: 13, mode: 'hue', hue: 280, minSat: 0.30 },
            { id: 'octopus', label: '문어 색상 변경', x: 18.5, y: 54, rx: 12, ry: 14, mode: 'hue', hue: 145, minSat: 0.30 },
            { id: 'starfish', label: '불가사리 색상 변경', x: 13.5, y: 89, rx: 8.5, ry: 9, mode: 'hue', hue: 210, minSat: 0.32 },
            { id: 'turtle', label: '바다거북 색상 변경', x: 54.5, y: 49, rx: 14, ry: 12, mode: 'hue', hue: 190, minSat: 0.22 },
            { id: 'whale', label: '큰 고래 색상 변경', x: 79, y: 21, rx: 17, ry: 13, mode: 'hue', hue: 135, minSat: 0.20 },
            { id: 'treasure', label: '보물상자 금화 색상 변경', x: 84, y: 81, rx: 9, ry: 6.5, mode: 'hue', hue: 100, minSat: 0.32 },
        ],
    },
    {
        id: 'festival',
        title: '🎡 야시장 불꽃 축제',
        difficulty: 'Lv.5 극한',
        origImage: `${BASE}images/spot-diff/real/stage5_festival.jpg`,
        diffImage: `${BASE}images/spot-diff/real/stage5_festival_diff.jpg`,
        memorizeSec: 45,
        findSec: 80,
        penaltySec: 12,
        diffCount: 5,
        candidates: [
            { id: 'fireworks', label: '밤하늘 불꽃놀이 유무', x: 22, y: 18, rx: 18, ry: 15, mode: 'prebuilt' },
            { id: 'chefhat', label: '요리사 모자 색상 변경', x: 22, y: 52, rx: 6, ry: 7.5, mode: 'prebuilt' },
            { id: 'luckycat', label: '황금 고양이 인형 유무', x: 49, y: 81, rx: 8, ry: 13, mode: 'prebuilt' },
            { id: 'balloon', label: '큰 별 풍선 색상 변경', x: 85, y: 26, rx: 9, ry: 11, mode: 'prebuilt' },
            { id: 'lanterns', label: '상단 줄등불 색상 변경', x: 54, y: 18, rx: 22, ry: 11, mode: 'prebuilt' },
        ],
    },
];

// RGB <-> HSL 변환 헬퍼 (검은 외곽선과 음영을 100% 보존하면서 사물 색깔만 정교하게 바꾸기 위함)
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * 실제 일러스트 이미지의 선택된 5군데 픽셀만 정교하게 변형하여 DataURL 생성
 */
function buildPixelEditedImage(imgEl, selectedSpots) {
    const w = imgEl.naturalWidth || 1024;
    const h = imgEl.naturalHeight || 768;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(imgEl, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (const spot of selectedSpots) {
        const cx = (spot.x / 100) * w;
        const cy = (spot.y / 100) * h;
        const rx = (spot.rx / 100) * w;
        const ry = (spot.ry / 100) * h;

        const minX = Math.max(0, Math.floor(cx - rx));
        const maxX = Math.min(w - 1, Math.ceil(cx + rx));
        const minY = Math.max(0, Math.floor(cy - ry));
        const maxY = Math.min(h - 1, Math.ceil(cy + ry));

        if (spot.mode === 'hue') {
            const shift = ((spot.hue || 180) / 360) % 1;
            const minSat = spot.minSat ?? 0.25;
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const nx = (x - cx) / rx;
                    const ny = (y - cy) / ry;
                    const dist2 = nx * nx + ny * ny;
                    if (dist2 > 1) continue;

                    const idx = (y * w + x) * 4;
                    const [hh, ss, ll] = rgbToHsl(data[idx], data[idx + 1], data[idx + 2]);
                    // 검은 외곽선(어두운 픽셀)과 무채색 배경은 건드리지 않고, 사물 고유의 유채색만 매끄럽게 변환!
                    if (ss >= minSat && ll > 0.14 && ll < 0.90) {
                        const feather = dist2 > 0.72 ? (1 - dist2) / 0.28 : 1;
                        const newH = (hh + shift) % 1;
                        const [nr, ng, nb] = hslToRgb(newH, Math.min(1, ss * 1.08), ll);
                        data[idx] = Math.round(data[idx] * (1 - feather) + nr * feather);
                        data[idx + 1] = Math.round(data[idx + 1] * (1 - feather) + ng * feather);
                        data[idx + 2] = Math.round(data[idx + 2] * (1 - feather) + nb * feather);
                    }
                }
            }
        } else if (spot.mode === 'mirror') {
            // 타원형 영역 내부를 자연스럽게 좌우 반전
            const copy = new Uint8ClampedArray(data);
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const nx = (x - cx) / rx;
                    const ny = (y - cy) / ry;
                    const dist2 = nx * nx + ny * ny;
                    if (dist2 > 1) continue;
                    const mx = Math.min(w - 1, Math.max(0, Math.round(2 * cx - x)));
                    const dstIdx = (y * w + x) * 4;
                    const srcIdx = (y * w + mx) * 4;
                    const feather = dist2 > 0.75 ? (1 - dist2) / 0.25 : 1;
                    data[dstIdx] = Math.round(copy[dstIdx] * (1 - feather) + copy[srcIdx] * feather);
                    data[dstIdx + 1] = Math.round(copy[dstIdx + 1] * (1 - feather) + copy[srcIdx + 1] * feather);
                    data[dstIdx + 2] = Math.round(copy[dstIdx + 2] * (1 - feather) + copy[srcIdx + 2] * feather);
                }
            }
        } else if (spot.mode === 'erase') {
            // 타원 바깥쪽 경계 픽셀 평균색으로 내부를 부드럽게 채워 불꽃/소품을 감쪽같이 지움
            let sr = 0, sg = 0, sb = 0, cnt = 0;
            for (let a = 0; a < 24; a++) {
                const rad = (a / 24) * Math.PI * 2;
                const sx = Math.min(w - 1, Math.max(0, Math.round(cx + Math.cos(rad) * rx * 1.15)));
                const sy = Math.min(h - 1, Math.max(0, Math.round(cy + Math.sin(rad) * ry * 1.15)));
                const si = (sy * w + sx) * 4;
                sr += data[si]; sg += data[si + 1]; sb += data[si + 2]; cnt++;
            }
            const br = sr / cnt, bg = sg / cnt, bb = sb / cnt;
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const nx = (x - cx) / rx;
                    const ny = (y - cy) / ry;
                    const dist2 = nx * nx + ny * ny;
                    if (dist2 > 1) continue;
                    const idx = (y * w + x) * 4;
                    const feather = dist2 > 0.65 ? (1 - dist2) / 0.35 : 1;
                    data[idx] = Math.round(data[idx] * (1 - feather) + br * feather);
                    data[idx + 1] = Math.round(data[idx + 1] * (1 - feather) + bg * feather);
                    data[idx + 2] = Math.round(data[idx + 2] * (1 - feather) + bb * feather);
                }
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
}

const SpotMemoryGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName, mbtiType } = useUserStore();
    const { earnCrystals } = useCrystalStore();

    const [gameState, setGameState] = useState('ready'); // ready | loading | memorize | find | stageClear | finished
    const [stage, setStage] = useState(1);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(null); // { config, spots, memorizeUrl, findUrl }
    const [timeLeft, setTimeLeft] = useState(30);
    const [foundIds, setFoundIds] = useState([]);
    const [wrongTap, setWrongTap] = useState(null);
    const [penaltyFlash, setPenaltyFlash] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const stageRef = useRef(1);
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

    // 스테이지 이미지 로드 및 5군데 실제 픽셀 변형 생성
    const prepareStage = useCallback((st) => {
        const idx = (st - 1) % REAL_PUZZLE_STAGES.length;
        const config = REAL_PUZZLE_STAGES[idx];
        setGameState('loading');
        setFoundIds([]);
        setWrongTap(null);
        setPenaltyFlash(false);

        // AI 사전 편집 쌍이 있는 스테이지 (Stage 5 야시장: 정방향/역방향 랜덤 출제!)
        if (config.diffImage) {
            const reverse = Math.random() < 0.5;
            const memorizeUrl = reverse ? config.diffImage : config.origImage;
            const findUrl = reverse ? config.origImage : config.diffImage;
            setRound({
                config,
                spots: config.candidates,
                memorizeUrl,
                findUrl,
            });
            setTimeLeft(config.memorizeSec);
            setGameState('memorize');
            return;
        }

        // 매판 6개 사물 후보 중 무작위 5군데 선택 + 색상 각도도 미세 랜덤화!
        const selectedSpots = [...config.candidates]
            .sort(() => Math.random() - 0.5)
            .slice(0, config.diffCount)
            .map((spot) =>
                spot.mode === 'hue'
                    ? { ...spot, hue: (spot.hue + Math.floor(Math.random() * 40 - 20) + 360) % 360 }
                    : spot
            );

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const editedDataUrl = buildPixelEditedImage(img, selectedSpots);
                const reverse = Math.random() < 0.5;
                setRound({
                    config,
                    spots: selectedSpots,
                    memorizeUrl: reverse ? editedDataUrl : config.origImage,
                    findUrl: reverse ? config.origImage : editedDataUrl,
                });
                setTimeLeft(config.memorizeSec);
                setGameState('memorize');
            } catch (err) {
                console.error('Image edit error:', err);
                toast.error('그림을 준비하는 중 오류가 발생했습니다.');
                setGameState('ready');
            }
        };
        img.onerror = () => {
            toast.error('이미지를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');
            setGameState('ready');
        };
        img.src = config.origImage;
    }, []);

    const startGame = () => {
        finishedRef.current = false;
        scoreRef.current = 0;
        stageRef.current = 1;
        setScore(0);
        setStage(1);
        prepareStage(1);
    };

    const goToFindPhase = useCallback(() => {
        if (!round) return;
        setTimeLeft(round.config.findSec);
        setGameState('find');
        toast(`🔍 그림이 바뀌었습니다! 달라진 ${round.spots.length}군데를 찾으세요! (오답 -${round.config.penaltySec}초)`, { icon: '👀' });
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

    // 그림 클릭/터치 판정 (정규화 % 좌표 기준 타원 히트박스)
    const handleImageClick = (e) => {
        if (gameState !== 'find' || !round) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        let matched = null;
        for (const spot of round.spots) {
            if (foundIds.includes(spot.id)) continue;
            // 터치 편의성을 위해 타원 반경에 약간 여유(+2.5%) 부여
            const rx = Math.max(spot.rx + 2.5, 6.5);
            const ry = Math.max(spot.ry + 2.5, 7.5);
            const nx = (clickX - spot.x) / rx;
            const ny = (clickY - spot.y) / ry;
            if (nx * nx + ny * ny <= 1.0) {
                matched = spot;
                break;
            }
        }

        if (matched) {
            const nextFound = [...foundIds, matched.id];
            setFoundIds(nextFound);
            const gained = 140 + stageRef.current * 40;
            scoreRef.current += gained;
            setScore(scoreRef.current);
            toast.success(`정답! ${matched.label} (+${gained}점)`);

            if (nextFound.length >= round.spots.length) {
                const timeBonus = timeLeft * 6;
                scoreRef.current += timeBonus;
                setScore(scoreRef.current);
                setGameState('stageClear');
                toast.success(`🎉 Stage ${stageRef.current} 5군데 모두 발견! (+${timeBonus}점)`);
            }
        } else {
            // 💥 과감한 오답 패널티 (-10초 ~ -12초!)
            const penalty = round.config.penaltySec;
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
            toast.error(`💥 오답! 시간이 -${penalty}초 대폭 차감되었습니다!`);
        }
    };

    const handleNextStage = () => {
        const nextSt = stageRef.current + 1;
        stageRef.current = nextSt;
        setStage(nextSt);
        prepareStage(nextSt);
    };

    return (
        <ArcadeGameLayout
            gameId="spot-memory"
            title="🖼️ 틀린그림찾기"
            subtitle="진짜 일러스트 그림을 암기한 뒤, 실제로 달라진 5군데를 찾아 터치하세요!"
            accentColor="#ec4899"
            accentBg="#fdf2f8"
            onBack={onBack}
            score={score}
            extraStatLabel={gameState === 'memorize' ? '암기 남은 시간' : '발견 / 남은 시간'}
            extraStatValue={
                gameState === 'ready'
                    ? '진짜 일러스트 5세트'
                    : gameState === 'memorize'
                    ? `👀 암기 ${timeLeft}초`
                    : `${foundIds.length}/${round?.spots.length || 5} · ${timeLeft}초`
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
                        🎨 100% 실제 일러스트 · 디테일 기억력 틀린그림찾기
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                        그림 속 달라진 5군데를 찾아라!
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.65, marginBottom: '14px' }}>
                        먼저 원본 일러스트를 <strong>30~45초 동안</strong> 꼼꼼히 눈에 담아 암기하세요.<br />
                        암기가 끝나면 그림 속 사물들의 <strong>색상 · 방향 · 소품 유무</strong>가 감쪽같이 바뀐 그림이 등장합니다!<br />
                        <strong>Lv.1 카페 → Lv.2 캠핑장 → Lv.3 마법 서재 → Lv.4 바닷속 → Lv.5 야시장 축제</strong>로 갈수록 그림이 훨씬 빽빽하고 어려워집니다!
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
                        <AlertTriangle size={16} /> 주의: 찍기 금지! 잘못 터치할 때마다 남은 시간이 <strong>-10초 ~ -12초</strong>씩 대폭 차감됩니다!
                    </div>
                    <br />
                    <Tooltip text="진짜 일러스트 틀린그림찾기 게임을 시작합니다">
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

            {gameState === 'loading' && (
                <div style={{ textAlign: 'center', padding: '60px 16px', color: '#64748b', fontWeight: 800 }}>
                    🎨 고화질 일러스트를 준비하고 있습니다...
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
                                {round.config.difficulty} · {round.config.title}
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
                                        💥 오답 -{round.config.penaltySec}초!
                                    </motion.span>
                                )}
                            </AnimatePresence>

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
                                    발견 {foundIds.length} / {round.spots.length}
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
                            ? '👀 그림 속 사물들의 색상·방향·위치를 구석구석 꼼꼼히 기억하세요!'
                            : `👆 달라진 ${round.spots.length}군데를 그림 위에서 직접 터치하세요! (오답 시 -${round.config.penaltySec}초!)`}
                    </div>

                    {/* 진짜 일러스트 이미지 뷰어 (이모지 0개!) */}
                    <motion.div
                        animate={penaltyFlash ? { x: [-6, 6, -5, 5, 0] } : { x: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={gameState === 'find' ? handleImageClick : undefined}
                        style={{
                            position: 'relative',
                            width: '100%',
                            borderRadius: '18px',
                            overflow: 'hidden',
                            border: penaltyFlash
                                ? '3px solid #ef4444'
                                : gameState === 'find'
                                ? '2.5px solid #ec4899'
                                : '2.5px solid #6366f1',
                            cursor: gameState === 'find' ? 'crosshair' : 'default',
                            userSelect: 'none',
                            boxShadow: penaltyFlash
                                ? '0 0 22px rgba(239, 68, 68, 0.5)'
                                : '0 10px 24px rgba(15, 23, 42, 0.14)',
                        }}
                    >
                        <img
                            src={gameState === 'memorize' ? round.memorizeUrl : round.findUrl}
                            alt={round.config.title}
                            draggable={false}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                pointerEvents: 'none',
                            }}
                        />

                        {/* 찾은 정답 위치 초록색 동그라미 마킹 */}
                        {gameState === 'find' &&
                            foundIds.map((fid) => {
                                const spot = round.spots.find((s) => s.id === fid);
                                if (!spot) return null;
                                return (
                                    <div
                                        key={fid}
                                        style={{
                                            position: 'absolute',
                                            left: `${spot.x - spot.rx}%`,
                                            top: `${spot.y - spot.ry}%`,
                                            width: `${spot.rx * 2}%`,
                                            height: `${spot.ry * 2}%`,
                                            borderRadius: '50%',
                                            border: '3.5px solid #10b981',
                                            background: 'rgba(16, 185, 129, 0.18)',
                                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.7)',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                );
                            })}

                        {/* 오답 터치 시 -10초! 경고 마크 */}
                        {wrongTap && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${wrongTap.x}%`,
                                    top: `${wrongTap.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    background: 'rgba(239, 68, 68, 0.92)',
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: '0.85rem',
                                    padding: '6px 11px',
                                    borderRadius: '100px',
                                    border: '2px solid white',
                                    pointerEvents: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                }}
                            >
                                -{wrongTap.penalty}초!
                            </div>
                        )}
                    </motion.div>

                    {/* 발견한 정답 요약 배지 */}
                    {gameState === 'find' && foundIds.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                            {foundIds.map((fid) => {
                                const sp = round.spots.find((s) => s.id === fid);
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
                                        <CheckCircle2 size={13} /> {sp?.label}
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
                        {round.config.title}에서 달라진 {round.spots.length}군데를 모두 찾아냈습니다!
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
                        {round.spots.map((sp) => (
                            <span
                                key={sp.id}
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
                                ✓ {sp.label}
                            </span>
                        ))}
                    </div>
                    <Tooltip text="더 많은 디테일이 숨겨진 다음 그림에 도전합니다">
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
                            Stage {stage + 1} 다음 그림 도전 🚀
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
                                <AlertCircle size={14} /> 이번 그림 정답 5군데 공개:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {round.spots.map((sp) => {
                                    const found = foundIds.includes(sp.id);
                                    return (
                                        <span
                                            key={sp.id}
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
                                            {sp.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <Tooltip text="새로운 랜덤 변형으로 다시 도전합니다">
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

export default SpotMemoryGamePage;
