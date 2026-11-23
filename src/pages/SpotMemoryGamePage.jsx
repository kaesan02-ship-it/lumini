import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Eye, Search, FastForward, CheckCircle2, AlertCircle, AlertTriangle, Maximize2 } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import ArcadeGameLayout from '../components/arcade/ArcadeGameLayout';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { submitArcadeScore } from '../utils/arcadeRankingService';
import { toast } from 'react-hot-toast';

const BASE = import.meta.env.BASE_URL || '/';

/**
 * 100% 고화질 AI 일러스트 원화 8종 (단순 SVG 0개 · 완벽히 통일된 동화풍 화질!)
 * - Stage 1~3: 표준 크기 · 5군데 마이크로 디테일 찾기
 * - Stage 4~8: 초대형 와이드 확장 뷰(wideMode) · 6군데(또는 AI 정밀 5군데) 극한 미세 디테일 찾기!
 */
const AI_PUZZLE_STAGES = [
    {
        id: 'cafe',
        title: '☕ 햇살 디저트 카페',
        difficulty: 'Lv.1 입문',
        wide: false,
        origImage: `${BASE}images/spot-diff/real/stage1_cafe.jpg`,
        diffImage: null,
        memorizeSec: 30,
        findSec: 65,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'clockHands', label: '시계 바늘 방향 변경', x: 26.5, y: 16.5, rx: 5, ry: 6, mode: 'mirror' },
            { id: 'tulipPetal', label: '액자 튤립 꽃잎 색 변경', x: 56.5, y: 19.5, rx: 3.5, ry: 5, mode: 'hue', hue: 215, minSat: 0.30 },
            { id: 'centerBerry', label: '케이크 위 가운데 딸기 색 변경', x: 40.5, y: 40.5, rx: 2.8, ry: 3.5, mode: 'hue', hue: 140, minSat: 0.35 },
            { id: 'cactusPot', label: '창턱 선인장 화분 색 변경', x: 74.5, y: 48, rx: 3.5, ry: 4, mode: 'hue', hue: 185, minSat: 0.25 },
            { id: 'rightCloud', label: '창문 오른쪽 구름 사라짐', x: 87.5, y: 28, rx: 4.5, ry: 5.5, mode: 'erase' },
            { id: 'cupHandle', label: '커피잔 손잡이 방향 반전', x: 19.5, y: 65, rx: 8.5, ry: 7.5, mode: 'mirror' },
            { id: 'leftCloud', label: '창문 왼쪽 구름 사라짐', x: 74.5, y: 31, rx: 4.5, ry: 4.5, mode: 'erase' },
        ],
    },
    {
        id: 'camping',
        title: '🏕️ 별빛 숲속 캠핑장',
        difficulty: 'Lv.2 초급',
        wide: false,
        origImage: `${BASE}images/spot-diff/real/stage2_camping.jpg`,
        diffImage: null,
        memorizeSec: 35,
        findSec: 70,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'boots', label: '텐트 앞 등산화 색 변경', x: 28, y: 73, rx: 3.5, ry: 4, mode: 'hue', hue: 210, minSat: 0.25 },
            { id: 'pinecone', label: '오른쪽 나뭇가지 솔방울 사라짐', x: 70.5, y: 30, rx: 2.5, ry: 4, mode: 'erase' },
            { id: 'bigStar', label: '밤하늘 반짝이는 큰 별 사라짐', x: 56.5, y: 13.5, rx: 2.2, ry: 3, mode: 'erase' },
            { id: 'pocket', label: '배낭 옆 노란 주머니 색 변경', x: 76.5, y: 75.5, rx: 2.8, ry: 4.5, mode: 'hue', hue: 260, minSat: 0.35 },
            { id: 'kettle', label: '모닥불 위 주전자 색 변경', x: 52, y: 61.5, rx: 4.2, ry: 5, mode: 'hue', hue: 250, minSat: 0.35 },
            { id: 'purpleFlower', label: '바닥 보라색 꽃 1송이 사라짐', x: 40.5, y: 86, rx: 2.5, ry: 3.2, mode: 'erase' },
            { id: 'leftFlower', label: '왼쪽 바위 위 꽃 색 변경', x: 13.5, y: 89.5, rx: 3.5, ry: 4, mode: 'hue', hue: 195, minSat: 0.25 },
        ],
    },
    {
        id: 'wizard',
        title: '📚 마법사의 비밀 서재',
        difficulty: 'Lv.3 중급',
        wide: false,
        origImage: `${BASE}images/spot-diff/real/stage3_wizard.jpg`,
        diffImage: null,
        memorizeSec: 35,
        findSec: 70,
        penaltySec: 10,
        diffCount: 5,
        candidates: [
            { id: 'candleFlame', label: '왼쪽 촛불 불꽃 꺼짐', x: 33.5, y: 45.5, rx: 2.2, ry: 3.8, mode: 'erase' },
            { id: 'windowMoon', label: '창밖 초승달 사라짐', x: 45.5, y: 18.5, rx: 3.2, ry: 4.2, mode: 'erase' },
            { id: 'hourglass', label: '책장 위 모래시계 색 변경', x: 26.5, y: 38.5, rx: 3.2, ry: 5.5, mode: 'hue', hue: 195, minSat: 0.20 },
            { id: 'potionLiquid', label: '물약병 속 액체 색 변경', x: 66.8, y: 68.5, rx: 3.8, ry: 4, mode: 'hue', hue: 220, minSat: 0.32 },
            { id: 'hatTip', label: '마법 모자 챙 색 변경', x: 87.5, y: 31, rx: 5.5, ry: 6, mode: 'hue', hue: 155, minSat: 0.28 },
            { id: 'redBook', label: '왼쪽 위 빨간 책 1권 색 변경', x: 20, y: 12.5, rx: 2.5, ry: 5.5, mode: 'hue', hue: 180, minSat: 0.30 },
            { id: 'crystalGlow', label: '수정구슬 빛깔 변경', x: 50, y: 60.5, rx: 4.8, ry: 6, mode: 'hue', hue: 145, minSat: 0.28 },
        ],
    },
    {
        id: 'library',
        title: '🕯️ 별빛 고대 도서관',
        difficulty: 'Lv.4 와이드 확대',
        wide: true,
        origImage: `${BASE}images/spot-diff/magic.jpg`,
        diffImage: null,
        memorizeSec: 40,
        findSec: 75,
        penaltySec: 10,
        diffCount: 6,
        candidates: [
            { id: 'moon', label: '창밖 초승달 사라짐', x: 55.5, y: 30, rx: 3.2, ry: 4.2, mode: 'erase' },
            { id: 'leftTorch', label: '왼쪽 벽 촛불 불꽃 꺼짐', x: 13, y: 27.5, rx: 2.2, ry: 4.2, mode: 'erase' },
            { id: 'rightTorch', label: '오른쪽 벽 촛불 불꽃 꺼짐', x: 88, y: 27.5, rx: 2.2, ry: 4.2, mode: 'erase' },
            { id: 'globe', label: '창턱 지구본 색 변경', x: 58.5, y: 55, rx: 4.5, ry: 6, mode: 'hue', hue: 190, minSat: 0.18 },
            { id: 'leftPlant', label: '창턱 작은 화분 사라짐', x: 42.5, y: 55.5, rx: 4, ry: 6.5, mode: 'erase' },
            { id: 'orbLeft', label: '왼쪽 책장 빛구슬 사라짐', x: 32, y: 41.5, rx: 2.6, ry: 3.2, mode: 'erase' },
            { id: 'orbRight', label: '오른쪽 책장 빛구슬 사라짐', x: 71, y: 49.5, rx: 2.6, ry: 3.2, mode: 'erase' },
            { id: 'topRedBook', label: '왼쪽 위 빨간 책 색 변경', x: 30, y: 14.5, rx: 2.5, ry: 5, mode: 'hue', hue: 185, minSat: 0.28 },
        ],
    },
    {
        id: 'terrace',
        title: '🌸 유럽풍 루프탑 테라스',
        difficulty: 'Lv.5 와이드 확대',
        wide: true,
        origImage: `${BASE}images/spot-diff/cafe.jpg`,
        diffImage: null,
        memorizeSec: 40,
        findSec: 75,
        penaltySec: 12,
        diffCount: 6,
        candidates: [
            { id: 'skyCloud', label: '오른쪽 창밖 하늘 구름 사라짐', x: 91, y: 23, rx: 6, ry: 6, mode: 'erase' },
            { id: 'cakeDome', label: '카운터 두 번째 유리돔 사라짐', x: 27, y: 50.5, rx: 3.8, ry: 5, mode: 'erase' },
            { id: 'vaseFlower', label: '카운터 꽃병의 꽃 사라짐', x: 43, y: 49, rx: 3.8, ry: 6.5, mode: 'erase' },
            { id: 'lavender', label: '오른쪽 라벤더 화분 색 변경', x: 73, y: 64, rx: 4.5, ry: 6.5, mode: 'hue', hue: 150, minSat: 0.22 },
            { id: 'pinkPot', label: '왼쪽 창턱 분홍 꽃 색 변경', x: 7.5, y: 46, rx: 3.5, ry: 5, mode: 'hue', hue: 170, minSat: 0.22 },
            { id: 'geranium', label: '중앙 창턱 빨간 꽃 색 변경', x: 31, y: 35, rx: 3.8, ry: 5.5, mode: 'hue', hue: 195, minSat: 0.28 },
            { id: 'tableCloth', label: '오른쪽 식탁보 색 변경', x: 76, y: 74, rx: 7, ry: 5, mode: 'hue', hue: 165, minSat: 0.16 },
            { id: 'lampShade', label: '천장 펜던트 조명 색 변경', x: 27.5, y: 28, rx: 3.5, ry: 4, mode: 'hue', hue: 180, minSat: 0.22 },
        ],
    },
    {
        id: 'space',
        title: '🚀 우주 정거장 전망대',
        difficulty: 'Lv.6 와이드 고난도',
        wide: true,
        origImage: `${BASE}images/spot-diff/space.jpg`,
        diffImage: null,
        memorizeSec: 45,
        findSec: 80,
        penaltySec: 12,
        diffCount: 6,
        candidates: [
            { id: 'leftPlanet', label: '왼쪽 고리 행성 사라짐', x: 21, y: 47, rx: 6.5, ry: 5.5, mode: 'erase' },
            { id: 'smallPlanet', label: '중앙 작은 고리 행성 사라짐', x: 60.5, y: 46, rx: 4.5, ry: 4.5, mode: 'erase' },
            { id: 'bigSaturn', label: '오른쪽 위 큰 토성 색 변경', x: 77, y: 25.5, rx: 7, ry: 7.5, mode: 'hue', hue: 160, minSat: 0.16 },
            { id: 'miniGalaxy', label: '오른쪽 끝 작은 은하 사라짐', x: 91, y: 8.5, rx: 5, ry: 5, mode: 'erase' },
            { id: 'leftCushion', label: '소파 왼쪽 쿠션 색 변경', x: 33.5, y: 60, rx: 3.5, ry: 3.8, mode: 'hue', hue: 170, minSat: 0.15 },
            { id: 'deskLamp', label: '오른쪽 스탠드 조명 색 변경', x: 76.5, y: 50.5, rx: 3.5, ry: 3.5, mode: 'hue', hue: 190, minSat: 0.22 },
            { id: 'plantLeaves', label: '왼쪽 화분 잎사귀 색 변경', x: 25.5, y: 59, rx: 4.5, ry: 7, mode: 'hue', hue: 165, minSat: 0.18 },
            { id: 'rightCushion', label: '오른쪽 소파 쿠션 사라짐', x: 70, y: 60.5, rx: 3.8, ry: 3.8, mode: 'erase' },
        ],
    },
    {
        id: 'ocean',
        title: '🐠 산호초 바닷속 세상',
        difficulty: 'Lv.7 와이드 극한',
        wide: true,
        origImage: `${BASE}images/spot-diff/real/stage4_ocean.jpg`,
        diffImage: null,
        memorizeSec: 45,
        findSec: 80,
        penaltySec: 12,
        diffCount: 6,
        candidates: [
            { id: 'orangeFish', label: '왼쪽 위 작은 주황 물고기 사라짐', x: 17.5, y: 34.5, rx: 3.8, ry: 4.5, mode: 'erase' },
            { id: 'subWindow', label: '잠수함 가운데 둥근 창문 색 변경', x: 25, y: 21.5, rx: 3.2, ry: 4.2, mode: 'hue', hue: 175, minSat: 0.15 },
            { id: 'stripeFish', label: '오른쪽 노란 줄무늬 물고기 사라짐', x: 76, y: 42.5, rx: 3.8, ry: 4.8, mode: 'erase' },
            { id: 'bottomShell', label: '바닥 왼쪽 회색 조개 사라짐', x: 4.5, y: 93, rx: 3.2, ry: 3.5, mode: 'erase' },
            { id: 'goldCoins', label: '보물상자 속 금화 색 변경', x: 83.5, y: 81.5, rx: 6.5, ry: 4.5, mode: 'hue', hue: 120, minSat: 0.35 },
            { id: 'anemone', label: '왼쪽 아래 보라 말미잘 색 변경', x: 23.5, y: 76, rx: 4.8, ry: 7.5, mode: 'hue', hue: 150, minSat: 0.24 },
            { id: 'blueFish', label: '가운데 아래 파란 물고기 사라짐', x: 56, y: 72, rx: 3.5, ry: 3.8, mode: 'erase' },
        ],
    },
    {
        id: 'festival',
        title: '🎡 야시장 불꽃 축제',
        difficulty: 'Lv.8 와이드 마스터',
        wide: true,
        origImage: `${BASE}images/spot-diff/real/stage5_festival.jpg`,
        diffImage: `${BASE}images/spot-diff/real/stage5_festival_diff.jpg`,
        memorizeSec: 45,
        findSec: 85,
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
 * 실제 고화질 일러스트의 미세 영역 픽셀만 정밀하게 변형
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
                    if (ss >= minSat && ll > 0.14 && ll < 0.90) {
                        const feather = dist2 > 0.72 ? (1 - dist2) / 0.28 : 1;
                        const newH = (hh + shift) % 1;
                        const [nr, ng, nb] = hslToRgb(newH, Math.min(1, ss * 1.1), ll);
                        data[idx] = Math.round(data[idx] * (1 - feather) + nr * feather);
                        data[idx + 1] = Math.round(data[idx + 1] * (1 - feather) + ng * feather);
                        data[idx + 2] = Math.round(data[idx + 2] * (1 - feather) + nb * feather);
                    }
                }
            }
        } else if (spot.mode === 'mirror') {
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
            // 행별 좌우 경계 보간으로 그라데이션 배경(밤하늘·바닷속·창문 등) 완벽 보존 지우기
            const copy = new Uint8ClampedArray(data);
            for (let y = minY; y <= maxY; y++) {
                const ny = (y - cy) / ry;
                if (ny * ny >= 1) continue;
                const halfSpan = rx * Math.sqrt(1 - ny * ny);
                const lx = Math.max(0, Math.min(w - 1, Math.floor(cx - halfSpan - 3)));
                const rxPos = Math.max(0, Math.min(w - 1, Math.ceil(cx + halfSpan + 3)));
                const li = (y * w + lx) * 4;
                const ri = (y * w + rxPos) * 4;

                for (let x = minX; x <= maxX; x++) {
                    const nx = (x - cx) / rx;
                    const dist2 = nx * nx + ny * ny;
                    if (dist2 > 1) continue;
                    const t = (x - lx) / Math.max(1, rxPos - lx);
                    const br = copy[li] * (1 - t) + copy[ri] * t;
                    const bg = copy[li + 1] * (1 - t) + copy[ri + 1] * t;
                    const bb = copy[li + 2] * (1 - t) + copy[ri + 2] * t;
                    const idx = (y * w + x) * 4;
                    const feather = dist2 > 0.65 ? (1 - dist2) / 0.35 : 1;
                    data[idx] = Math.round(copy[idx] * (1 - feather) + br * feather);
                    data[idx + 1] = Math.round(copy[idx + 1] * (1 - feather) + bg * feather);
                    data[idx + 2] = Math.round(copy[idx + 2] * (1 - feather) + bb * feather);
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
    const [round, setRound] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [foundIds, setFoundIds] = useState([]);
    const [wrongTap, setWrongTap] = useState(null);
    const [penaltyFlash, setPenaltyFlash] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const scoreRef = useRef(0);
    const stageRef = useRef(1);
    const stageOrderRef = useRef([]);
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
            const reward = Math.min(50, Math.max(8, Math.floor(finalScore / 120)));
            earnCrystals(reward, '틀린그림찾기 보상');
            toast.success(`Stage ${clearedStage} 기록 등록! +${reward}💎 획득!`);
            setRefreshTrigger((v) => v + 1);
        }
    }, [user, userName, mbtiType, earnCrystals]);

    const prepareStage = useCallback((st) => {
        const order = stageOrderRef.current.length > 0 ? stageOrderRef.current : AI_PUZZLE_STAGES;
        const config = order[(st - 1) % order.length];
        setGameState('loading');
        setFoundIds([]);
        setWrongTap(null);
        setPenaltyFlash(false);

        // AI 사전 편집 쌍 스테이지 (야시장 축제)
        if (config.diffImage) {
            const reverse = Math.random() < 0.5;
            setRound({
                config,
                spots: config.candidates,
                memorizeUrl: reverse ? config.diffImage : config.origImage,
                findUrl: reverse ? config.origImage : config.diffImage,
            });
            setTimeLeft(config.memorizeSec);
            setGameState('memorize');
            return;
        }

        // 매판 7~8개 마이크로 디테일 후보 중 무작위 5~6군데 선택!
        const selectedSpots = [...config.candidates]
            .sort(() => Math.random() - 0.5)
            .slice(0, config.diffCount);

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
            toast.error('이미지를 불러오지 못했습니다.');
            setGameState('ready');
        };
        img.src = config.origImage;
    }, []);

    const startGame = () => {
        finishedRef.current = false;
        scoreRef.current = 0;
        stageRef.current = 1;
        // Stage 1~3(표준 크기 3종) 셔플 후 Stage 4~8(초대형 와이드 5종) 셔플 배치!
        const normalStages = [...AI_PUZZLE_STAGES.slice(0, 3)].sort(() => Math.random() - 0.5);
        const wideStages = [...AI_PUZZLE_STAGES.slice(3)].sort(() => Math.random() - 0.5);
        stageOrderRef.current = [...normalStages, ...wideStages];
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

    const handleImageClick = (e) => {
        if (gameState !== 'find' || !round) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        let matched = null;
        for (const spot of round.spots) {
            if (foundIds.includes(spot.id)) continue;
            const rx = Math.max(spot.rx + 2.4, 5.2);
            const ry = Math.max(spot.ry + 2.4, 6.2);
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
            const gained = 150 + stageRef.current * 45;
            scoreRef.current += gained;
            setScore(scoreRef.current);
            toast.success(`정답! ${matched.label} (+${gained}점)`);

            if (nextFound.length >= round.spots.length) {
                const timeBonus = timeLeft * 6;
                scoreRef.current += timeBonus;
                setScore(scoreRef.current);
                setGameState('stageClear');
                toast.success(`🎉 Stage ${stageRef.current} ${round.spots.length}군데 모두 발견! (+${timeBonus}점)`);
            }
        } else {
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

    // Stage 4 이상(wide: true) 플레이 중에는 화면 가로 전체로 초대형 그림 확대!
    const isWideActive = Boolean(round?.config?.wide && (gameState === 'memorize' || gameState === 'find'));

    return (
        <ArcadeGameLayout
            gameId="spot-memory"
            title="🖼️ 틀린그림찾기"
            subtitle="100% 고화질 AI 일러스트 8종! 단계가 오를수록 그림이 화면 가득 확대되고 찾을 곳도 늘어납니다!"
            accentColor="#ec4899"
            accentBg="#fdf2f8"
            onBack={onBack}
            score={score}
            wideMode={isWideActive}
            extraStatLabel={gameState === 'memorize' ? '암기 남은 시간' : '발견 / 남은 시간'}
            extraStatValue={
                gameState === 'ready'
                    ? '고화질 원화 8종'
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
                        🎨 100% 고화질 AI 일러스트 8종 · 와이드 확대 난이도
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                        그림 속 숨은 미세 디테일을 찾아라!
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.65, marginBottom: '14px' }}>
                        <strong>창문 구름 1개 사라짐 · 등산화 색 · 솔방울 1개 · 촛불 불꽃 꺼짐 · 작은 물고기 1마리 · 빛구슬 사라짐</strong> 등<br />
                        <strong>Stage 1~3 (표준 크기 · 5군데)</strong>를 돌파하면 <strong>Stage 4~8에서는 그림이 화면 가득 초대형으로 커지며 6군데</strong>의 미세 변화를 찾아야 합니다!
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
                    <Tooltip text="고화질 AI 일러스트 8종 틀린그림찾기를 시작합니다">
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
                    🎨 고화질 AI 일러스트를 준비하고 있습니다...
                </div>
            )}

            {(gameState === 'memorize' || gameState === 'find') && round && (
                <div>
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
                                Stage {stage} · {round.config.title}
                            </span>
                            {round.config.wide && (
                                <span
                                    style={{
                                        background: '#7c3aed',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        borderRadius: '100px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                    }}
                                >
                                    <Maximize2 size={10} /> 초대형 와이드
                                </span>
                            )}
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
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: gameState === 'memorize' ? '#4f46e5' : '#db2777',
                            marginBottom: '8px',
                        }}
                    >
                        {gameState === 'memorize'
                            ? '👀 구름·꽃·불꽃·물고기·신발 등 구석구석 작은 디테일까지 꼼꼼히 기억하세요!'
                            : `👆 미세하게 달라진 ${round.spots.length}군데를 정확히 터치하세요! (오답 시 -${round.config.penaltySec}초!)`}
                    </div>

                    {/* 100% 고화질 AI 일러스트 뷰어 (Stage 4+는 화면 가로 전체로 웅장하게 확대!) */}
                    <motion.div
                        animate={penaltyFlash ? { x: [-6, 6, -5, 5, 0] } : { x: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={gameState === 'find' ? handleImageClick : undefined}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: round.config.wide ? '940px' : '560px',
                            margin: '0 auto',
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
                                : '0 12px 28px rgba(15, 23, 42, 0.16)',
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

                        {gameState === 'find' &&
                            foundIds.map((fid) => {
                                const spot = round.spots.find((s) => s.id === fid);
                                if (!spot) return null;
                                const showRx = Math.max(spot.rx, 4.2);
                                const showRy = Math.max(spot.ry, 5.2);
                                return (
                                    <div
                                        key={fid}
                                        style={{
                                            position: 'absolute',
                                            left: `${spot.x - showRx}%`,
                                            top: `${spot.y - showRy}%`,
                                            width: `${showRx * 2}%`,
                                            height: `${showRy * 2}%`,
                                            borderRadius: '50%',
                                            border: '3.5px solid #10b981',
                                            background: 'rgba(16, 185, 129, 0.18)',
                                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.7)',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                );
                            })}

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
                                    fontSize: '0.88rem',
                                    padding: '6px 12px',
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
                        {round.config.title}의 숨은 디테일 {round.spots.length}군데를 모두 찾아냈습니다!
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
                    <Tooltip text="다음 고화질 일러스트 스테이지에 도전합니다">
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
                                <AlertCircle size={14} /> 이번 그림 정답 {round.spots.length}군데 공개:
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
                    <Tooltip text="새로운 랜덤 순서와 미세 변화로 다시 도전합니다">
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
                            <RotateCcw size={18} /> 새 문제로 다시 도전
                        </motion.button>
                    </Tooltip>
                </div>
            )}
        </ArcadeGameLayout>
    );
};

export default SpotMemoryGamePage;
