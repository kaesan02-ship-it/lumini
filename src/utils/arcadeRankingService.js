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

// 클라우드 서버 연결 상태 추적 (UI에서 서버 절전 배너를 표시하기 위함)
let lastCloudStatus = { online: true, errorMsg: '' };

export function getLastCloudStatus() {
    return lastCloudStatus;
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
 * 예: 'color-eye_season_3', 'memory-match_season_4' (기존 2048 게임의 'season_3'과 절대 충돌하지 않음)
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
 * 로그인된 회원의 profiles 행이 누락되어 FK 에러가 나지 않도록 사전 보장
 */
async function ensureProfileExists(user, displayName, displayMbti) {
    if (!isValidUuid(user?.id)) return;
    try {
        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
        if (!data) {
            await supabase.from('profiles').upsert({
                id: user.id,
                username: displayName || user.email?.split('@')[0] || '회원',
                mbti_type: displayMbti || '?',
            });
        }
    } catch {
        // ignore
    }
}

/**
 * 게임 점수 저장 (로컬 + Supabase 클라우드 전체 공유)
 * 반환값: { synced: boolean, offline: boolean, error?: string }
 */
export async function submitArcadeScore({
    gameId,
    score,
    detail = '',
    user,
    userName,
    mbtiType,
    season = null,
}) {
    if (!score || score <= 0) return { synced: false, offline: false };

    const targetSeason = season || getDefaultSeasonForGame(gameId);
    const roundedScore = Math.round(score);
    const userId = user?.id || 'guest';
    const displayName =
        userName ||
        user?.user_metadata?.username ||
        user?.email?.split('@')[0] ||
        '익명 플레이어';
    const displayMbti = mbtiType && mbtiType !== '?' ? mbtiType : '?';

    // 1. 내 최고 점수 갱신
    const bestKey = `lumini_real_best_${gameId}_${userId}_${targetSeason}`;
    const prevBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
    if (roundedScore > prevBest) {
        localStorage.setItem(bestKey, String(roundedScore));
    }

    // 2. 로컬 실제 기록 저장소에 추가 (오프라인이어도 내 점수는 절대 유실되지 않음)
    const store = getLocalStore();
    if (!store[gameId]) store[gameId] = {};
    if (!store[gameId][targetSeason]) store[gameId][targetSeason] = [];

    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    store[gameId][targetSeason].push({
        entryId,
        userId,
        name: displayName,
        mbti: displayMbti,
        score: roundedScore,
        detail,
        createdAt: Date.now(),
        synced: false,
    });

    store[gameId][targetSeason].sort((a, b) => b.score - a.score);
    store[gameId][targetSeason] = store[gameId][targetSeason].slice(0, 30);
    saveLocalStore(store);

    // 3. 로그인 유저일 경우 Supabase 클라우드 DB에 즉시 저장 (모든 기기·모든 유저와 랭킹 공유)
    if (isValidUuid(user?.id) && !USE_MOCK_DATA) {
        const cloudSeason = getCloudSeasonKey(gameId, targetSeason);
        const encodedDetail = encodeDetailToNumber(gameId, detail);

        try {
            await ensureProfileExists(user, displayName, displayMbti);

            const { error } = await supabase.from('game_2048_scores').insert({
                user_id: user.id,
                score: roundedScore,
                max_tile: encodedDetail,
                season: cloudSeason,
            });

            if (!error) {
                lastCloudStatus = { online: true, errorMsg: '' };
                const updatedStore = getLocalStore();
                const list = updatedStore[gameId]?.[targetSeason] || [];
                const found = list.find((item) => item.entryId === entryId) ||
                    list.find((item) => item.score === roundedScore && !item.synced);
                if (found) {
                    found.synced = true;
                    saveLocalStore(updatedStore);
                }
                return { synced: true, offline: false };
            }

            const msg = error.message || '';
            const isNetworkErr =
                msg.toLowerCase().includes('fetch') ||
                msg.toLowerCase().includes('network') ||
                msg.toLowerCase().includes('failed');
            lastCloudStatus = { online: !isNetworkErr, errorMsg: msg };
            console.warn('Cloud score insert error:', msg);
            return { synced: false, offline: isNetworkErr, error: msg };
        } catch (err) {
            const msg = err?.message || 'network error';
            lastCloudStatus = { online: false, errorMsg: msg };
            console.warn('Cloud score sync error:', msg);
            return { synced: false, offline: true, error: msg };
        }
    }

    return { synced: false, offline: false, reason: 'guest' };
}

/**
 * 로컬에 저장되어 있던 내 기록 중 아직 클라우드에 올라가지 않은 기록이 있으면 로그인 세션으로 자동 동기화
 */
export async function syncUnsyncedLocalScores(gameId, season, currentUserId) {
    if (USE_MOCK_DATA || !isValidUuid(currentUserId)) return 0;
    const store = getLocalStore();
    const list = store[gameId]?.[season] || [];
    const unsynced = list.filter(
        (item) => !item.synced && (item.userId === currentUserId || item.userId === 'guest')
    );
    if (unsynced.length === 0) return 0;

    const cloudSeason = getCloudSeasonKey(gameId, season);
    let syncedCount = 0;

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
                syncedCount += 1;
                lastCloudStatus = { online: true, errorMsg: '' };
            } else {
                const msg = (error.message || '').toLowerCase();
                if (msg.includes('fetch') || msg.includes('network')) {
                    lastCloudStatus = { online: false, errorMsg: error.message };
                    break;
                }
            }
        } catch (err) {
            lastCloudStatus = { online: false, errorMsg: err?.message || 'offline' };
            break;
        }
    }

    if (syncedCount > 0) {
        saveLocalStore(store);
    }
    return syncedCount;
}

/**
 * 특정 게임 & 시즌의 전체 유저 통합 랭킹 조회 (Supabase 클라우드 + 로컬 병합)
 * - profiles 조인 실패 시에도 2단계 안전 조회로 100% 모든 회원의 이름을 표시
 */
export async function fetchArcadeLeaderboard(gameId, season = null, currentUserId = null) {
    const targetSeason = season || getDefaultSeasonForGame(gameId);

    if (isValidUuid(currentUserId)) {
        await syncUnsyncedLocalScores(gameId, targetSeason, currentUserId);
    }

    const store = getLocalStore();
    const localEntries = (store[gameId]?.[targetSeason] || []).map((item) => ({
        name: item.name,
        mbti: item.mbti || '?',
        score: item.score,
        detail: item.detail || '',
        isMe: currentUserId ? item.userId === currentUserId : item.userId === 'guest',
        userId: item.userId,
        source: 'local',
        synced: !!item.synced,
    }));

    let remoteEntries = [];
    if (!USE_MOCK_DATA) {
        try {
            const cloudSeason = getCloudSeasonKey(gameId, targetSeason);
            // 1차: profiles 조인 조회 시도
            const { data, error } = await supabase
                .from('game_2048_scores')
                .select('score, max_tile, user_id, profiles(username, mbti_type)')
                .eq('season', cloudSeason)
                .order('score', { ascending: false })
                .limit(30);

            if (!error && data) {
                lastCloudStatus = { online: true, errorMsg: '' };
                remoteEntries = data.map((row) => ({
                    name: row.profiles?.username || '익명',
                    mbti: row.profiles?.mbti_type || '?',
                    score: row.score || 0,
                    detail: decodeNumberToDetail(gameId, row.max_tile),
                    isMe: currentUserId ? row.user_id === currentUserId : false,
                    userId: row.user_id,
                    source: 'remote',
                    synced: true,
                }));
            } else if (error) {
                const lower = (error.message || '').toLowerCase();
                if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed')) {
                    lastCloudStatus = { online: false, errorMsg: error.message };
                } else {
                    // 2차: FK/조인 에러일 경우 scores와 profiles를 별도 조회하여 안전 매핑
                    const { data: rawScores, error: rawErr } = await supabase
                        .from('game_2048_scores')
                        .select('score, max_tile, user_id')
                        .eq('season', cloudSeason)
                        .order('score', { ascending: false })
                        .limit(30);

                    if (!rawErr && rawScores) {
                        lastCloudStatus = { online: true, errorMsg: '' };
                        const userIds = [...new Set(rawScores.map((r) => r.user_id).filter(Boolean))];
                        const profileMap = {};
                        if (userIds.length > 0) {
                            const { data: profs } = await supabase
                                .from('profiles')
                                .select('id, username, mbti_type')
                                .in('id', userIds);
                            if (profs) {
                                profs.forEach((p) => {
                                    profileMap[p.id] = p;
                                });
                            }
                        }
                        remoteEntries = rawScores.map((row) => ({
                            name: profileMap[row.user_id]?.username || '익명',
                            mbti: profileMap[row.user_id]?.mbti_type || '?',
                            score: row.score || 0,
                            detail: decodeNumberToDetail(gameId, row.max_tile),
                            isMe: currentUserId ? row.user_id === currentUserId : false,
                            userId: row.user_id,
                            source: 'remote',
                            synced: true,
                        }));
                    }
                }
            }
        } catch (err) {
            lastCloudStatus = { online: false, errorMsg: err?.message || 'offline' };
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
