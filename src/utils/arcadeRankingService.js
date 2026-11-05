import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

const STORAGE_KEY = 'lumini_arcade_hybrid_rankings_v3';

// 6종 신규 게임 기본 메타데이터 및 초기 시즌별 라이벌 기록
export const NEW_ARCADE_GAMES = {
    'color-eye': {
        id: 'color-eye',
        route: 'color-eye-game',
        title: '🎨 컬러 아이 테스트',
        shortTitle: '컬러아이',
        icon: '🎨',
        unit: '점',
        actionDesc: '미세하게 다른 색깔 타일 연속 찾기',
        pointsDesc: '단계·점수 경쟁',
        initialRankings: {
            season_3: [
                { name: '절대색감러', mbti: 'ISFP', score: 420, detail: 'Lv.18 달성', isMe: false },
                { name: '무지개탐정', mbti: 'INFJ', score: 350, detail: 'Lv.15 달성', isMe: false },
                { name: '파스텔요정', mbti: 'ENFP', score: 280, detail: 'Lv.12 달성', isMe: false },
            ],
            season_2: [
                { name: '김민지', mbti: 'ISFP', score: 680, detail: 'Lv.26 달성', isMe: false },
                { name: '원채김', mbti: 'ENFJ', score: 610, detail: 'Lv.24 달성', isMe: false },
                { name: '이지우', mbti: 'INFP', score: 540, detail: 'Lv.21 달성', isMe: false },
            ],
            season_1: [
                { name: '👑 색채의 마술사', mbti: 'INTJ', score: 950, detail: 'Lv.35 달성', isMe: false },
                { name: '호크아이', mbti: 'ISTP', score: 840, detail: 'Lv.31 달성', isMe: false },
                { name: '피카소후예', mbti: 'ENFP', score: 780, detail: 'Lv.29 달성', isMe: false },
            ],
        },
    },
    'speed-number': {
        id: 'speed-number',
        route: 'speed-number-game',
        title: '⚡ 1~25 스피드 터치',
        shortTitle: '스피드터치',
        icon: '⚡',
        unit: '점',
        actionDesc: '1부터 25까지 순서대로 빠르게 터치',
        pointsDesc: '초고속 타임어택',
        initialRankings: {
            season_3: [
                { name: '빛의손가락', mbti: 'ESTP', score: 1850, detail: '11.50초 클리어', isMe: false },
                { name: '순발력대장', mbti: 'ENTP', score: 1620, detail: '13.80초 클리어', isMe: false },
                { name: '집중력왕', mbti: 'ISTJ', score: 1400, detail: '16.00초 클리어', isMe: false },
            ],
            season_2: [
                { name: '김현우', mbti: 'ENTJ', score: 2150, detail: '8.50초 클리어', isMe: false },
                { name: '정하은', mbti: 'ESTP', score: 1980, detail: '10.20초 클리어', isMe: false },
                { name: '윤선희', mbti: 'ENFP', score: 1790, detail: '12.10초 클리어', isMe: false },
            ],
            season_1: [
                { name: '👑 0.1초의 지배자', mbti: 'ISTP', score: 2380, detail: '6.20초 클리어', isMe: false },
                { name: '번개손', mbti: 'ENTJ', score: 2210, detail: '7.90초 클리어', isMe: false },
                { name: '스피드러너', mbti: 'ESTJ', score: 2050, detail: '9.50초 클리어', isMe: false },
            ],
        },
    },
    'blind-timer': {
        id: 'blind-timer',
        route: 'blind-timer-game',
        title: '⏱️ 인간 스톱워치 7.77초',
        shortTitle: '7.77초',
        icon: '⏱️',
        unit: '점',
        actionDesc: '가려진 타이머로 목표 시간 정확히 맞추기',
        pointsDesc: '절대 시간감각 경쟁',
        initialRankings: {
            season_3: [
                { name: '인간시계', mbti: 'INTJ', score: 2640, detail: '평균 오차 0.08초', isMe: false },
                { name: '칼박자러버', mbti: 'ISTJ', score: 2350, detail: '평균 오차 0.15초', isMe: false },
                { name: '럭키세븐', mbti: 'ENFP', score: 1980, detail: '평균 오차 0.24초', isMe: false },
            ],
            season_2: [
                { name: '원채김', mbti: 'ENFJ', score: 2890, detail: '평균 오차 0.03초', isMe: false },
                { name: '김민지', mbti: 'ISFJ', score: 2710, detail: '평균 오차 0.06초', isMe: false },
                { name: '이지우', mbti: 'INFP', score: 2490, detail: '평균 오차 0.11초', isMe: false },
            ],
            season_1: [
                { name: '👑 시간의 신 크로노스', mbti: 'INTJ', score: 2980, detail: '평균 오차 0.01초', isMe: false },
                { name: '원자시계', mbti: 'ISTJ', score: 2910, detail: '평균 오차 0.02초', isMe: false },
                { name: '메트로놈', mbti: 'INFJ', score: 2820, detail: '평균 오차 0.04초', isMe: false },
            ],
        },
    },
    'stack-tower': {
        id: 'stack-tower',
        route: 'stack-tower-game',
        title: '🥞 소울펫 팬케이크 탑',
        shortTitle: '팬케이크탑',
        icon: '🥞',
        unit: '점',
        actionDesc: '타이밍 맞춰 블록을 하늘 끝까지 쌓기',
        pointsDesc: '최고 층수·퍼펙트 경쟁',
        initialRankings: {
            season_3: [
                { name: '팬케이크장인', mbti: 'ISFJ', score: 2450, detail: '22층 돌파', isMe: false },
                { name: '건축왕루미', mbti: 'ENTJ', score: 1920, detail: '18층 돌파', isMe: false },
                { name: '달콤파티시에', mbti: 'ESFJ', score: 1540, detail: '15층 돌파', isMe: false },
            ],
            season_2: [
                { name: '김지민', mbti: 'ENFJ', score: 3820, detail: '34층 돌파', isMe: false },
                { name: '김현우', mbti: 'ENTJ', score: 3410, detail: '31층 돌파', isMe: false },
                { name: '정하은', mbti: 'ENTP', score: 2950, detail: '27층 돌파', isMe: false },
            ],
            season_1: [
                { name: '👑 바벨탑 건축가', mbti: 'INTJ', score: 5600, detail: '50층 돌파', isMe: false },
                { name: '스카이타워', mbti: 'ISTP', score: 4850, detail: '44층 돌파', isMe: false },
                { name: '구름위산책', mbti: 'INFP', score: 4200, detail: '38층 돌파', isMe: false },
            ],
        },
    },
    'reflex-battle': {
        id: 'reflex-battle',
        route: 'reflex-battle-game',
        title: '🧠 청개구리 반사신경',
        shortTitle: '반사신경',
        icon: '🧠',
        unit: '점',
        actionDesc: '일반·청개구리 지시어를 순발력으로 터치',
        pointsDesc: '연속 콤보·순발력 경쟁',
        initialRankings: {
            season_3: [
                { name: '청개구리왕자', mbti: 'ENTP', score: 1680, detail: '24콤보 달성', isMe: false },
                { name: '두뇌풀가동', mbti: 'INTP', score: 1350, detail: '19콤보 달성', isMe: false },
                { name: '번개반사', mbti: 'ESTP', score: 1120, detail: '16콤보 달성', isMe: false },
            ],
            season_2: [
                { name: '이지우', mbti: 'ENFP', score: 2640, detail: '36콤보 달성', isMe: false },
                { name: '원채김', mbti: 'ENFJ', score: 2310, detail: '32콤보 달성', isMe: false },
                { name: '윤선희', mbti: 'ESFP', score: 1980, detail: '28콤보 달성', isMe: false },
            ],
            season_1: [
                { name: '👑 초감각 사이보그', mbti: 'ENTP', score: 3950, detail: '52콤보 달성', isMe: false },
                { name: '청기백기신', mbti: 'ESTP', score: 3420, detail: '46콤보 달성', isMe: false },
                { name: '멘탈갑', mbti: 'INTJ', score: 3100, detail: '41콤보 달성', isMe: false },
            ],
        },
    },
    'memory-match': {
        id: 'memory-match',
        route: 'memory-match-game',
        title: '🃏 소울펫 기억력 카드',
        shortTitle: '기억력카드',
        icon: '🃏',
        unit: '점',
        actionDesc: '카드의 위치를 기억해 빠르게 짝 맞추기',
        pointsDesc: '스테이지·기억력 경쟁',
        initialRankings: {
            season_3: [
                { name: '포토메모리', mbti: 'INFJ', score: 2250, detail: 'Stage 5 클리어', isMe: false },
                { name: '소울펫탐정', mbti: 'INTJ', score: 1840, detail: 'Stage 4 클리어', isMe: false },
                { name: '기억력천재', mbti: 'ENFJ', score: 1490, detail: 'Stage 3 클리어', isMe: false },
            ],
            season_2: [
                { name: '김민지', mbti: 'ISFJ', score: 3480, detail: 'Stage 7 클리어', isMe: false },
                { name: '김지민', mbti: 'ENFJ', score: 3120, detail: 'Stage 6 클리어', isMe: false },
                { name: '정하은', mbti: 'ENTP', score: 2790, detail: 'Stage 6 클리어', isMe: false },
            ],
            season_1: [
                { name: '👑 멘사 기억력왕', mbti: 'INTJ', score: 4920, detail: 'Stage 10 클리어', isMe: false },
                { name: '카드마스터', mbti: 'ISTJ', score: 4350, detail: 'Stage 9 클리어', isMe: false },
                { name: '셜록홈즈', mbti: 'INTP', score: 3980, detail: 'Stage 8 클리어', isMe: false },
            ],
        },
    },
};

function getLocalStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveLocalStore(store) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.warn('Failed to save local ranking store:', e);
    }
}

/**
 * 내 최고 기록 조회 (시즌 3 기준)
 */
export function getMyBestScore(gameId, userId = 'guest') {
    const key = `lumini_best_${gameId}_${userId}_season_3`;
    return parseInt(localStorage.getItem(key) || '0', 10);
}

/**
 * 게임 점수 저장 (로컬 스토리지 즉시 반영 + Supabase 비동기 동기화)
 */
export async function submitArcadeScore({
    gameId,
    score,
    detail = '',
    user,
    userName,
    mbtiType,
    season = 'season_3',
}) {
    if (!score || score <= 0) return;

    const userId = user?.id || 'guest';
    const displayName =
        userName ||
        user?.user_metadata?.username ||
        user?.email?.split('@')[0] ||
        '루미니 게스트';
    const displayMbti = mbtiType && mbtiType !== '?' ? mbtiType : 'ENFP';

    // 1. 내 최고 점수 갱신
    const bestKey = `lumini_best_${gameId}_${userId}_${season}`;
    const prevBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
    if (score > prevBest) {
        localStorage.setItem(bestKey, String(score));
    }

    // 2. 로컬 하이브리드 랭킹 보드에 즉시 기록 추가
    const store = getLocalStore();
    if (!store[gameId]) store[gameId] = {};
    if (!store[gameId][season]) store[gameId][season] = [];

    store[gameId][season].push({
        userId,
        name: displayName,
        mbti: displayMbti,
        score: Math.round(score),
        detail,
        createdAt: Date.now(),
    });

    // 상위 30개까지만 유지
    store[gameId][season].sort((a, b) => b.score - a.score);
    store[gameId][season] = store[gameId][season].slice(0, 30);
    saveLocalStore(store);

    // 3. 로그인 유저이고 Supabase 사용 가능 시 원격 DB에도 비동기 저장 시도
    if (user?.id && !String(user.id).startsWith('mock-') && !USE_MOCK_DATA) {
        try {
            await supabase.from('arcade_game_scores').insert({
                user_id: user.id,
                game_id: gameId,
                score: Math.round(score),
                detail,
                season,
            });
        } catch (err) {
            // 서버 절전 또는 테이블 미생성 시에도 로컬 랭킹은 정상 작동함
            console.warn('Remote score sync skipped (using hybrid local store):', err?.message);
        }
    }
}

/**
 * 특정 게임 & 시즌의 통합 랭킹 조회 (Supabase + 로컬 기록 + 기본 라이벌 병합)
 */
export async function fetchArcadeLeaderboard(gameId, season = 'season_3', currentUserId = null) {
    const gameMeta = NEW_ARCADE_GAMES[gameId];
    const baseList = gameMeta?.initialRankings?.[season] || [];

    const store = getLocalStore();
    const localEntries = (store[gameId]?.[season] || []).map((item) => ({
        name: item.name,
        mbti: item.mbti || 'ENFP',
        score: item.score,
        detail: item.detail || '',
        isMe: currentUserId ? item.userId === currentUserId : item.userId === 'guest',
        userId: item.userId,
    }));

    let remoteEntries = [];
    if (!USE_MOCK_DATA) {
        try {
            const { data, error } = await supabase
                .from('arcade_game_scores')
                .select('score, detail, user_id, profiles(username, mbti_type)')
                .eq('game_id', gameId)
                .eq('season', season)
                .order('score', { ascending: false })
                .limit(20);

            if (!error && data && data.length > 0) {
                remoteEntries = data.map((row) => ({
                    name: row.profiles?.username || '익명',
                    mbti: row.profiles?.mbti_type || '?',
                    score: row.score || 0,
                    detail: row.detail || '',
                    isMe: currentUserId ? row.user_id === currentUserId : false,
                    userId: row.user_id,
                }));
            }
        } catch {
            // 오프라인/절전 시 무시하고 로컬+기본 랭킹 사용
        }
    }

    // 원격 + 로컬 + 기본 라이벌 합산 후 점수 내림차순 정렬 (중복 기록은 상위 20개까지 표시)
    const combined = [...remoteEntries, ...localEntries, ...baseList]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
            badge: idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '',
        }));

    return combined;
}
