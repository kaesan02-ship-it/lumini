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
        currentSeason: 'season_4',
        initialRankings: { season_4: [], season_3: [], season_2: [], season_1: [] },
    },
};

/**
 * 게임별 현재 기본 시즌 반환 (소울펫 기억력 카드는 시즌 4, 나머지는 시즌 3)
 */
export function getDefaultSeasonForGame(gameId) {
    return NEW_ARCADE_GAMES[gameId]?.currentSeason || 'season_3';
}

/**
 * 게임별 상세 기록 문자열(detail)을 정수(max_tile 컬럼용)로 변환
 */
function encodeDetailToNumber(gameId, detail = '') {
    if (!detail) return 0;
    const str = String(detail);
    if (gameId === 'speed-number' || gameId === 'blind-timer') {
        const floatMatch = str.match(/(\d+(?:\.\d+)?)/);
        return floatMatch ? Math.round(parseFloat(floatMatch[1]) * 100) : 0;
    }
    const intMatch = str.match(/(\d+)/);
    return intMatch ? parseInt(intMatch[1], 10) : 0;
}

/**
 * DB에 저장된 정수(max_tile)를 다시 게임별 보기 좋은 상세 문자열로 복원
 */
function decodeNumberToDetail(gameId, numVal) {
    if (numVal === null || numVal === undefined || numVal <= 0) return '';
    switch (gameId) {
        case 'color-eye':
            return `Lv.${numVal}`;
        case 'speed-number':
            return `${(numVal / 100).toFixed(2)}초`;
        case 'blind-timer':
            return `평균오차 ${(numVal / 100).toFixed(2)}초`;
        case 'stack-tower':
            return `${numVal}층`;
        case 'reflex-battle':
            return `${numVal}콤보`;
        case 'memory-match': {
            const pairs = Math.min(3 + numVal, 18);
            return `${numVal}단계 (${pairs * 2}장)`;
        }
        default:
            return '';
    }
}

/**
 * 클라우드 DB(game_2048_scores)에서 게임과 시즌을 구분하기 위한 전용 시즌 키
 * 예: 'color-eye_season_3' (기존 2048 게임의 'season_3'과 절대 충돌하지 않음)
 */
function getCloudSeasonKey(gameId, season = 'season_3') {
    return `${gameId}_${season}`;
}

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
 * 내 최고 기록 조회 (게임별 현재 시즌 기준)
 */
export function getMyBestScore(gameId, userId = 'guest', season = null) {
    const targetSeason = season || getDefaultSeasonForGame(gameId);
    const key = `lumini_real_best_${gameId}_${userId}_${targetSeason}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
}

/**
 * 유효한 UUID 형식인지 검사
 */
function isValidUuid(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''));
}

/**
 * 게임 점수 저장 (로컬 + Supabase 클라우드 전체 공유)
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

    const roundedScore = Math.round(score);
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
    if (roundedScore > prevBest) {
        localStorage.setItem(bestKey, String(roundedScore));
    }

    // 2. 로컬 실제 기록 저장소에 추가
    const store = getLocalStore();
    if (!store[gameId]) store[gameId] = {};
    if (!store[gameId][season]) store[gameId][season] = [];

    store[gameId][season].push({
        userId,
        name: displayName,
        mbti: displayMbti,
        score: roundedScore,
        detail,
        createdAt: Date.now(),
        synced: false,
    });

    store[gameId][season].sort((a, b) => b.score - a.score);
    store[gameId][season] = store[gameId][season].slice(0, 30);
    saveLocalStore(store);

    // 3. 로그인 유저일 경우 Supabase 클라우드 DB에 즉시 저장 (모든 기기·모든 유저와 랭킹 공유)
    if (isValidUuid(user?.id) && !USE_MOCK_DATA) {
        const cloudSeason = getCloudSeasonKey(gameId, season);
        const encodedDetail = encodeDetailToNumber(gameId, detail);

        try {
            const { error } = await supabase.from('game_2048_scores').insert({
                user_id: user.id,
                score: roundedScore,
                max_tile: encodedDetail,
                season: cloudSeason,
            });

            if (!error) {
                const updatedStore = getLocalStore();
                const list = updatedStore[gameId]?.[season] || [];
                const found = list.find((item) => item.score === roundedScore && !item.synced);
                if (found) {
                    found.synced = true;
                    saveLocalStore(updatedStore);
                }
            }
        } catch (err) {
            console.warn('Cloud score sync error:', err?.message);
        }
    }
}

/**
 * 로컬에 저장되어 있던 내 기록 중 아직 클라우드에 올라가지 않은 기록이 있으면 로그인 세션으로 자동 동기화
 */
async function syncUnsyncedLocalScores(gameId, season, currentUserId) {
    if (USE_MOCK_DATA || !isValidUuid(currentUserId)) return;
    const store = getLocalStore();
    const list = store[gameId]?.[season] || [];
    const unsynced = list.filter((item) => !item.synced && (item.userId === currentUserId || item.userId === 'guest'));
    if (unsynced.length === 0) return;

    const cloudSeason = getCloudSeasonKey(gameId, season);
    let changed = false;

    for (const item of unsynced) {
        try {
            const { error } = await supabase.from('game_2048_scores').insert({
                user_id: currentUserId,
                score: Math.round(item.score),
                max_tile: encodeDetailToNumber(gameId, item.detail),
                season: cloudSeason,
            });
            if (!error) {
                item.synced = true;
                item.userId = currentUserId;
                changed = true;
            }
        } catch {
            // ignore
        }
    }

    if (changed) {
        saveLocalStore(store);
    }
}

/**
 * 특정 게임 & 시즌의 전체 유저 통합 랭킹 조회 (Supabase 클라우드 + 로컬 병합)
 */
export async function fetchArcadeLeaderboard(gameId, season = 'season_3', currentUserId = null) {
    if (isValidUuid(currentUserId)) {
        await syncUnsyncedLocalScores(gameId, season, currentUserId);
    }

    const store = getLocalStore();
    const localEntries = (store[gameId]?.[season] || []).map((item) => ({
        name: item.name,
        mbti: item.mbti || '?',
        score: item.score,
        detail: item.detail || '',
        isMe: currentUserId ? item.userId === currentUserId : item.userId === 'guest',
        userId: item.userId,
        source: 'local',
    }));

    let remoteEntries = [];
    if (!USE_MOCK_DATA) {
        try {
            const cloudSeason = getCloudSeasonKey(gameId, season);
            const { data, error } = await supabase
                .from('game_2048_scores')
                .select('score, max_tile, user_id, profiles(username, mbti_type)')
                .eq('season', cloudSeason)
                .order('score', { ascending: false })
                .limit(30);

            if (!error && data && data.length > 0) {
                remoteEntries = data.map((row) => ({
                    name: row.profiles?.username || '익명',
                    mbti: row.profiles?.mbti_type || '?',
                    score: row.score || 0,
                    detail: decodeNumberToDetail(gameId, row.max_tile),
                    isMe: currentUserId ? row.user_id === currentUserId : false,
                    userId: row.user_id,
                    source: 'remote',
                }));
            }
        } catch {
            // 서버 오프라인 시 로컬 기록 사용
        }
    }

    // 클라우드 전체 기록 + 로컬에만 있는 기록을 중복 없이 합산
    const combined = [...remoteEntries];
    for (const local of localEntries) {
        const alreadyInRemote = combined.some(
            (r) =>
                r.score === local.score &&
                (r.userId === local.userId || r.name === local.name)
        );
        if (!alreadyInRemote) {
            combined.push(local);
        }
    }

    return combined
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
            badge: idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '',
        }));
}
