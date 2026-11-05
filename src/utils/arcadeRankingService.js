import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// 가짜 데이터를 완전히 배제한 실제 플레이 기록 전용 스토리지 키
const STORAGE_KEY = 'lumini_arcade_real_rankings_v1';

// 이전 버전 캐시 잔재 정리
try {
    localStorage.removeItem('lumini_arcade_hybrid_rankings_v3');
} catch {
    // ignore
}

// 6종 신규 게임 기본 메타데이터 (가짜/더미 초기 랭킹 데이터 전면 제거 — 100% 실제 기록만 표시)
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
        initialRankings: { season_3: [], season_2: [], season_1: [] },
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
        initialRankings: { season_3: [], season_2: [], season_1: [] },
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
        initialRankings: { season_3: [], season_2: [], season_1: [] },
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
        initialRankings: { season_3: [], season_2: [], season_1: [] },
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
        initialRankings: { season_3: [], season_2: [], season_1: [] },
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
        initialRankings: { season_3: [], season_2: [], season_1: [] },
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
    const key = `lumini_real_best_${gameId}_${userId}_season_3`;
    return parseInt(localStorage.getItem(key) || '0', 10);
}

/**
 * 게임 점수 저장 (실제 플레이 기록만 저장)
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
        '익명 플레이어';
    const displayMbti = mbtiType && mbtiType !== '?' ? mbtiType : '?';

    // 1. 내 최고 점수 갱신
    const bestKey = `lumini_real_best_${gameId}_${userId}_${season}`;
    const prevBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
    if (score > prevBest) {
        localStorage.setItem(bestKey, String(score));
    }

    // 2. 로컬 실제 기록 저장소에 추가
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

    store[gameId][season].sort((a, b) => b.score - a.score);
    store[gameId][season] = store[gameId][season].slice(0, 30);
    saveLocalStore(store);

    // 3. 로그인 유저이고 Supabase 사용 가능 시 원격 DB에도 저장
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
            console.warn('Remote score sync skipped:', err?.message);
        }
    }
}

/**
 * 특정 게임 & 시즌의 실제 랭킹 조회 (가짜 데이터 없이 실제 원격 + 실제 로컬 기록만 표시)
 */
export async function fetchArcadeLeaderboard(gameId, season = 'season_3', currentUserId = null) {
    const store = getLocalStore();
    const localEntries = (store[gameId]?.[season] || []).map((item) => ({
        name: item.name,
        mbti: item.mbti || '?',
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
            // 서버 오프라인 시 실제 로컬 기록만 사용
        }
    }

    // 원격 DB에 데이터가 있으면 원격 우선, 없으면 로컬 실제 플레이 기록 표시 (더미 데이터 0개)
    const sourceList = remoteEntries.length > 0 ? remoteEntries : localEntries;

    return sourceList
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
            badge: idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '',
        }));
}
