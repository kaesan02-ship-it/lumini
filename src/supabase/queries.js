import { supabase } from './client';
import { USE_MOCK_DATA } from '../config';

// =============================================
// 인메모리 모크 스토어 (CRUD가 즉시 반영됨)
// =============================================

// 유저별 프로필 저장소
const MOCK_PROFILE_STORE = {};

const MOCK_USER_ME = {
    id: 'mock-user-001', username: '루미니 탐험가', avatar_url: '',
    mbti_type: 'ENFP', personality_data: { O: 85, C: 45, E: 90, A: 75, N: 30, H: 95 },
    bio: '반가워요! 루미니에서 함께 성장해요 ✨',
    district: '서울 마포구',
    crystals: 100
};

const MOCK_USERS = [
    MOCK_USER_ME,
    {
        id: 'u2', username: '김민수', avatar_url: '', mbti_type: 'INTJ', personality_data: { O: 90, C: 85, E: 30, A: 40, N: 20, H: 80 }, bio: '조용히 세상을 설계합니다', district: '서울 마포구',
        game: 'League of Legends', tier: 'Challenger',
        deep_soul: { r1: 3, r2: 1, r3: 2, r4: 3, r5: 1, r6: 2, r7: 3, r8: 1, l1: 2, l2: 1, l3: 3, l4: 2, l5: 1, l6: 2, l7: 3, l8: 1, f1: 3, f2: 2, f3: 1, f4: 3, f5: 2, f6: 1, f7: 3, f8: 2, v1: 3, v2: 2, v3: 1, v4: 3, v5: 2, v6: 1, v7: 3 }
    },
    { id: 'u3', username: '이지우', avatar_url: '', mbti_type: 'ISFJ', personality_data: { O: 40, C: 70, E: 50, A: 85, N: 40, H: 90 }, bio: '따뜻한 커피 한 잔의 위로', district: '서울 서대문구', game: 'Genshin Impact', tier: 'Lv.60' },
    {
        id: 'u4', username: '박서연', avatar_url: '', mbti_type: 'ENTP', personality_data: { O: 95, C: 35, E: 88, A: 50, N: 55, H: 70 }, bio: '아이디어가 넘쳐나는 사람', district: '서울 강남구', game: 'Valorant', tier: 'Immortal',
        deep_soul: { r1: 4, r2: 3, r3: 4, r4: 3, r5: 4, r6: 3, r7: 4, r8: 3, l1: 4, l2: 3, l3: 4, l4: 3, l5: 4, l6: 3, l7: 4, l8: 3, f1: 2, f2: 1, f3: 2, f4: 1, f5: 2, f6: 1, f7: 2, f8: 1, v1: 4, v2: 3, v3: 4, v4: 3, v5: 4, v6: 3, v7: 4 }
    },
    {
        id: 'u5', username: '최도현', avatar_url: '', mbti_type: 'INFP', personality_data: { O: 80, C: 55, E: 35, A: 90, N: 65, H: 85 }, bio: '그림 그리고 글 쓰는 몽상가', district: '서울 마포구', game: 'Lost Ark', tier: '아이템 1620레벨',
        deep_soul: { r1: 2, r2: 3, r3: 1, r4: 2, r5: 3, r6: 1, r7: 2, r8: 3, l1: 3, l2: 2, l3: 1, l4: 3, l5: 2, l6: 1, l7: 3, l8: 2, f1: 4, f2: 3, f3: 4, f4: 3, f5: 4, f6: 3, f7: 4, f8: 3, v1: 2, v2: 3, v3: 2, v4: 3, v5: 2, v6: 3, v7: 2 }
    },
    { id: 'u6', username: '정하은', avatar_url: '', mbti_type: 'ESTJ', personality_data: { O: 50, C: 95, E: 75, A: 60, N: 15, H: 88 }, bio: '계획대로 살기 프로', district: '서울 용산구', game: 'LoL', tier: 'Diamond II' },
];

// 초기 모크 데이터 로드
MOCK_USERS.forEach(u => MOCK_PROFILE_STORE[u.id] = u);

// 인메모리 게시물
let mockPosts = [
    { id: 'post-1', content: 'MBTI 검사 후 친구들과 대화하니까 서로를 더 잘 이해하게 된 기분이에요! 역시 성격은 과학적으로 파악해야 하나봐요 😊', category: 'experience', author_id: 'u3', author: MOCK_USERS[2], created_at: '2026-02-12T10:30:00Z', likes_count: 12 },
    { id: 'post-2', content: '루미니에서 추천받은 사람이랑 실제로 만났는데, 대화가 진짜 잘 통해요! 성향 매칭의 힘을 실감합니다 💜', category: 'experience', author_id: 'u4', author: MOCK_USERS[3], created_at: '2026-02-12T09:15:00Z', likes_count: 25 },
    { id: 'post-3', content: '💡 꿀팁: 성격 진단은 3개월마다 다시 하면 좋아요. 사람은 변하니까요! 한 달 전과 비교해보면 성장한 나를 발견할 수 있어요.', category: 'tip', author_id: 'u2', author: MOCK_USERS[1], created_at: '2026-02-11T22:00:00Z', likes_count: 34 },
    { id: 'post-4', content: 'INTJ와 ENFP가 같은 팀이 되면 어떨까요? 반대 성향끼리 오히려 시너지가 나는 이유가 궁금합니다!', category: 'question', author_id: 'u5', author: MOCK_USERS[4], created_at: '2026-02-11T18:45:00Z', likes_count: 8 },
    { id: 'post-5', content: '오늘 루미니에서 만난 모임 정말 좋았어요! 같은 취향을 공유하는 사람들이 모이니까 에너지가 넘쳤습니다 ⚡', category: 'experience', author_id: 'u6', author: MOCK_USERS[5], created_at: '2026-02-11T15:20:00Z', likes_count: 19 },
];

// 인메모리 이벤트
let mockEvents = [
    { id: 'evt-1', title: '강남구 인디밴드 공연 관람', description: '같은 음악 취향을 가진 루미니 멤버들과 함께 공연을 즐겨요! 공연 후 카페에서 감상 이야기도 나눠봐요.', location: '강남구 역삼동 뮤직 라운지', event_date: '2026-02-15T19:00:00Z', max_participants: 12, participant_count: 7, hive_id: 'hive-1', hives: { name: '예술/문화' }, created_by: 'u4', creator: MOCK_USERS[3] },
    { id: 'evt-2', title: 'AI 스터디 모임 (초보 환영)', description: '인공지능에 관심 있는 분들, 함께 기초부터 배워봐요! 노트북만 갖고 오시면 됩니다.', location: '판교 스타트업 카페', event_date: '2026-02-18T14:00:00Z', max_participants: 8, participant_count: 3, hive_id: 'hive-2', hives: { name: '기술/IT' }, created_by: 'u2', creator: MOCK_USERS[1] },
    { id: 'evt-3', title: '한강 러닝 크루 🏃', description: '주말 아침 한강에서 함께 뛰어요! 페이스 상관없이 누구나 환영합니다. 러닝 후 브런치까지!', location: '여의도 한강공원 물빛광장', event_date: '2026-02-20T07:30:00Z', max_participants: 20, participant_count: 11, hive_id: null, hives: null, created_by: 'u6', creator: MOCK_USERS[5] },
];

// 인메모리 댓글
let mockComments = {
    'post-1': [
        { id: 'c1', post_id: 'post-1', content: '완전 공감해요! 저도 루미니 덕분에 친구와 더 많은 대화를 나누게 됐어요.', author_id: 'u2', author: MOCK_USERS[1], created_at: '2026-02-12T11:00:00Z' },
        { id: 'c2', post_id: 'post-1', content: '과학적 접근이라니 멋져요 👍', author_id: 'u5', author: MOCK_USERS[4], created_at: '2026-02-12T11:30:00Z' },
    ],
    'post-2': [
        { id: 'c3', post_id: 'post-2', content: '부러워요! 저도 매칭 추천 받은 분한테 메시지 보내볼까 고민 중이에요 ㅎㅎ', author_id: 'u3', author: MOCK_USERS[2], created_at: '2026-02-12T10:00:00Z' },
    ],
    'post-4': [
        { id: 'c4', post_id: 'post-4', content: 'INTJ인데 ENFP 친구랑 프로젝트 했을 때 진짜 시너지 대박이었어요! 서로 부족한 부분을 채워주는 느낌이랄까?', author_id: 'u2', author: MOCK_USERS[1], created_at: '2026-02-11T19:00:00Z' },
        { id: 'c5', post_id: 'post-4', content: '반대 성향이 오히려 새로운 시각을 줄 수 있다고 생각해요!', author_id: 'u6', author: MOCK_USERS[5], created_at: '2026-02-11T19:30:00Z' },
    ],
};

// 인메모리 좋아요 상태
const mockLikes = {};

// 인메모리 성장 기록
let mockGrowthLogs = [
    { id: 'gl-1', user_id: 'mock-user-001', content: '오늘은 모르는 사람 3명과 대화를 나눴다. 외향성 점수가 높다고 나왔는데, 실제로 노력하니까 정말 즐거운 대화가 가능했다!', created_at: '2026-02-10T20:00:00Z' },
    { id: 'gl-2', user_id: 'mock-user-001', content: '계획대로 일정을 진행하는 것이 어렵지만, 작은 목표부터 세워보기로 했다. 성실성을 키워보자!', created_at: '2026-02-08T18:30:00Z' },
];

let mockPersonalityHistory = [
    { id: 'ph-1', user_id: 'mock-user-001', created_at: '2025-11-01T00:00:00Z', openness: 75, conscientiousness: 40, extraversion: 82, agreeableness: 68, neuroticism: 35, mbti_type: 'ENFP' },
    { id: 'ph-2', user_id: 'mock-user-001', created_at: '2026-01-15T00:00:00Z', openness: 80, conscientiousness: 42, extraversion: 87, agreeableness: 72, neuroticism: 32, mbti_type: 'ENFP' },
    { id: 'ph-3', user_id: 'mock-user-001', created_at: '2026-02-12T00:00:00Z', openness: 85, conscientiousness: 45, extraversion: 90, agreeableness: 75, neuroticism: 30, mbti_type: 'ENFP' },
];

let idCounter = 100;
const nextId = () => `mock-${++idCounter}`;

// =============================================
// API 함수 (원본 Supabase 로직 유지 + 모크 모드)
// =============================================

// --- [Profiles] ---
export const getProfile = async (userId) => {
    if (USE_MOCK_DATA) {
        // 이미 저장소에 있으면 반환
        if (MOCK_PROFILE_STORE[userId]) return MOCK_PROFILE_STORE[userId];

        // 없으면 새로 생성하여 저장소에 기록
        // 닉네임 추천 로직 개선 (데모 계정 대응)
        let suggestedName = '루미니';
        if (userId === 'mock-demo@lumini.me') {
            suggestedName = '루미니 탐험가';
        } else if (userId === 'mock-admin@lumini.me') {
            suggestedName = '관리자';
        } else if (userId.startsWith('mock-')) {
            const parts = userId.split('mock-');
            if (parts[1]) {
                suggestedName = parts[1].split('@')[0].split('-')[0]; // email-timestamp 호환
            }
        }

        const newProfile = { 
            ...MOCK_USER_ME, 
            id: userId, 
            username: suggestedName 
        };
        MOCK_PROFILE_STORE[userId] = newProfile;
        return newProfile;
    }
    try {
        const { data, error } = await supabase.from('profiles').select('id, username, mbti_type, bio, personality_data, deep_soul, created_at').eq('id', userId).single();
        if (error) {
            console.error('Supabase getProfile error:', error);
            // 만약 유저를 찾지 못한 경우(가입 직후 등) 빈 프로필 반환 시도 또는 에러 전파
            if (error.code === 'PGRST116') return null; 
            throw error;
        }
        return data;
    } catch (err) {
        console.error('getProfile execution failed:', err);
        throw err;
    }
};

export const updateProfile = async (userId, updates) => {
    if (USE_MOCK_DATA) {
        const existing = MOCK_PROFILE_STORE[userId] || { id: userId, ...MOCK_USER_ME };
        const updated = { ...existing, ...updates };
        MOCK_PROFILE_STORE[userId] = updated;
        return updated;
    }
    try {
        const { data, error } = await supabase.from('profiles').upsert({ id: userId, ...updates }, { onConflict: 'id' }).select().single();
        if (error) {
            console.error('updateProfile error:', error);
            // 특정 컬럼 에러일 경우 해당 필드 제외 후 재시도 로직 등을 고려할 수 있으나, 우선 로깅 후 에러 던짐
            throw error;
        }
        return data;
    } catch (err) {
        console.error('updateProfile exception:', err);
        throw err;
    }
};

export const upsertProfile = async (profileData) => {
    if (USE_MOCK_DATA) {
        console.log('Mock Upsert Profile:', profileData);
        // 모크 데이터 저장소 업데이트
        const updatedProfile = { 
            ...MOCK_PROFILE_STORE[profileData.id], 
            ...profileData,
            updated_at: new Date().toISOString()
        };
        MOCK_PROFILE_STORE[profileData.id] = updatedProfile;

        // 로컬 상태 동기화 (userStore 등에서 참조할 수 있도록)
        if (profileData.username) localStorage.setItem('lumini_user_name', profileData.username);
        if (profileData.mbti_type) localStorage.setItem('lumini_mbti_type', profileData.mbti_type);
        
        return updatedProfile;
    }
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('upsertProfile error:', error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('upsertProfile exception:', err);
        throw err;
    }
};

// --- [Social / Connections] ---
export const getNearbyProfiles = async (limit = 10) => {
    if (USE_MOCK_DATA) return [...MOCK_USERS].reverse().slice(0, limit);
    try {
        // pet_data 등 누락 가능성 있는 필드를 제외한 안전한 컬럼만 조회하거나, 에러 시 빈 배열 반환
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, mbti_type, bio, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);
            
        if (error) {
            console.error('getNearbyProfiles error:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('getNearbyProfiles exception:', err);
        return [];
    }
};

export const toggleConnection = async (reqId, targetId, sim) => {
    if (USE_MOCK_DATA) return { status: 'created', data: { id: nextId() } };
    const { data: existing } = await supabase.from('connections').select('*').eq('requester_id', reqId).eq('target_id', targetId).single();
    if (existing) {
        const { error } = await supabase.from('connections').delete().eq('id', existing.id);
        if (error) throw error;
        return { status: 'deleted' };
    } else {
        const { data, error } = await supabase.from('connections').insert({ requester_id: reqId, target_id: targetId, similarity_score: sim, status: 'pending' }).select().single();
        if (error) throw error;
        return { status: 'created', data };
    }
};

export const getConnections = async (userId) => {
    if (USE_MOCK_DATA) return MOCK_USERS.filter(u => u.id !== 'mock-user-001').map(p => ({ profiles: p }));
    const { data, error } = await supabase.from('connections').select('*, profiles!connections_target_id_fkey(id, username, mbti_type, bio, created_at)').eq('requester_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// --- [Communities / Hives] ---
export const getHives = async () => {
    if (USE_MOCK_DATA) return [
        { id: 'hive-1', name: '예술/문화', description: '음악, 미술, 공연 등 예술을 사랑하는 사람들', member_count: 156 },
        { id: 'hive-2', name: '기술/IT', description: 'AI, 개발, 데이터 사이언스 모임', member_count: 203 },
        { id: 'hive-3', name: '운동/건강', description: '러닝, 헬스, 요가 등 건강한 라이프', member_count: 89 },
        { id: 'hive-4', name: '맛집/요리', description: '맛집 탐방과 홈쿡을 즐기는 미식가', member_count: 134 },
    ];
    const { data, error } = await supabase.from('communities').select('*');
    if (error) throw error;
    return data;
};

export const getCommunities = getHives;

export const joinCommunity = async (communityId, profileId) => {
    if (USE_MOCK_DATA) return { status: 'joined', community_id: communityId };
    const { data, error } = await supabase.from('community_members').insert({ community_id: communityId, profile_id: profileId }).select().single();
    if (error) throw error;
    return data;
};

// --- [Posts / Feed] ---  **인메모리 CRUD**
export const getPosts = async (category = null) => {
    if (USE_MOCK_DATA) {
        let filtered = [...mockPosts];
        if (category) filtered = filtered.filter(p => p.category === category);
        return filtered;
    }
    let query = supabase.from('posts').select('*, author:profiles(id, username, mbti_type, bio, created_at)').order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const createPost = async (postData) => {
    if (USE_MOCK_DATA) {
        const newPost = {
            id: nextId(),
            ...postData,
            author: MOCK_USER_ME,
            created_at: new Date().toISOString(),
            likes_count: 0
        };
        mockPosts = [newPost, ...mockPosts];
        return newPost;
    }
    const { data, error } = await supabase.from('posts').insert(postData).select().single();
    if (error) throw error;
    return data;
};

export const toggleLike = async (postId, userId) => {
    if (USE_MOCK_DATA) {
        const key = `${postId}_${userId}`;
        if (mockLikes[key]) {
            delete mockLikes[key];
            return { status: 'unliked' };
        }
        mockLikes[key] = true;
        return { status: 'liked' };
    }
    const { data: existing } = await supabase.from('post_likes').select('*').eq('post_id', postId).eq('user_id', userId).single();
    if (existing) {
        const { error } = await supabase.from('post_likes').delete().eq('id', existing.id);
        if (error) throw error;
        return { status: 'unliked' };
    } else {
        const { data, error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId }).select().single();
        if (error) throw error;
        return { status: 'liked', data };
    }
};

// --- [Comments] ---  **인메모리 CRUD**
export const getComments = async (postId) => {
    if (USE_MOCK_DATA) return mockComments[postId] || [];
    const { data, error } = await supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(id, username, mbti_type, bio, created_at)').eq('post_id', postId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

export const createComment = async (commentData) => {
    if (USE_MOCK_DATA) {
        const newComment = {
            id: nextId(),
            ...commentData,
            author: MOCK_USER_ME,
            created_at: new Date().toISOString()
        };
        if (!mockComments[commentData.post_id]) mockComments[commentData.post_id] = [];
        mockComments[commentData.post_id].push(newComment);
        return newComment;
    }
    const { data, error } = await supabase.from('comments').insert(commentData).select().single();
    if (error) throw error;
    return data;
};

// --- [Events] ---  **인메모리 CRUD**
export const getEvents = async (hiveId = null) => {
    if (USE_MOCK_DATA) {
        if (hiveId) return mockEvents.filter(e => e.hive_id === hiveId);
        return [...mockEvents];
    }
    let query = supabase.from('events').select('*, hives(name), creator:profiles!events_created_by_fkey(id, username, mbti_type, bio, created_at)').order('event_date', { ascending: true });
    if (hiveId) query = query.eq('hive_id', hiveId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const getEventDetail = async (eventId) => {
    if (USE_MOCK_DATA) return mockEvents.find(e => e.id === eventId) || mockEvents[0];
    const { data, error } = await supabase.from('events').select('*, hives(name), creator:profiles!events_created_by_fkey(id, username, mbti_type, bio, created_at)').eq('id', eventId).single();
    if (error) throw error;
    return data;
};

export const createEvent = async (eventData) => {
    if (USE_MOCK_DATA) {
        const newEvent = {
            id: nextId(),
            ...eventData,
            participant_count: 0,
            hives: eventData.hive_id ? { name: '일반' } : null,
            creator: MOCK_USER_ME,
            created_at: new Date().toISOString()
        };
        mockEvents = [newEvent, ...mockEvents];
        return newEvent;
    }
    const { data, error } = await supabase.from('events').insert(eventData).select().single();
    if (error) throw error;
    return data;
};

export const toggleEventParticipation = async (eventId, userId) => {
    if (USE_MOCK_DATA) return { status: 'attending' };
    const { data: existing } = await supabase.from('event_participants').select('*').eq('event_id', eventId).eq('user_id', userId).single();
    if (existing) {
        const { error } = await supabase.from('event_participants').delete().eq('id', existing.id);
        if (error) throw error;
        return { status: 'cancelled' };
    } else {
        const { data, error } = await supabase.from('event_participants').insert({ event_id: eventId, user_id: userId, status: 'attending' }).select().single();
        if (error) throw error;
        return { status: 'attending', data };
    }
};

export const getEventParticipants = async (eventId) => {
    if (USE_MOCK_DATA) return MOCK_USERS.slice(0, 4).map(u => ({ profiles: u }));
    const { data, error } = await supabase.from('event_participants').select('*, profiles(id, username, mbti_type, bio, created_at)');
    if (error) throw error;
    return data;
};

// --- [Growth & Insights] ---  **인메모리 CRUD**
export const getPersonalityHistory = async (userId) => {
    if (USE_MOCK_DATA) return mockPersonalityHistory;
    const { data, error } = await supabase.from('personality_results').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

export const getGrowthLogs = async (userId) => {
    if (USE_MOCK_DATA) return [...mockGrowthLogs];
    const { data, error } = await supabase.from('growth_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createGrowthLog = async (logData) => {
    if (USE_MOCK_DATA) {
        const newLog = {
            id: nextId(),
            ...logData,
            created_at: new Date().toISOString()
        };
        mockGrowthLogs = [newLog, ...mockGrowthLogs];
        return newLog;
    }
    const { data, error } = await supabase.from('growth_logs').insert(logData).select().single();
    if (error) throw error;
    return data;
};

export const getMBTIDistribution = async () => {
    if (USE_MOCK_DATA) return [
        { type: 'ENFP', count: 28 }, { type: 'INTJ', count: 19 },
        { type: 'ISFJ', count: 22 }, { type: 'ENTP', count: 15 },
        { type: 'INFP', count: 24 }, { type: 'ESTJ', count: 12 },
        { type: 'ISFP', count: 10 }, { type: 'ENTJ', count: 8 },
    ];
    const { data, error } = await supabase.from('profiles').select('mbti_type');
    if (error) throw error;
    const stats = data.reduce((acc, curr) => { if (!curr.mbti_type) return acc; acc[curr.mbti_type] = (acc[curr.mbti_type] || 0) + 1; return acc; }, {});
    return Object.entries(stats).map(([type, count]) => ({ type, count }));
};

export const getMyActivityStats = async (userId) => {
    if (USE_MOCK_DATA) return { hiveCount: 2, eventCount: 3, postCount: mockPosts.filter(p => p.author_id === userId || p.author_id === 'mock-user-001').length };
    const [hives, events, posts] = await Promise.all([
        supabase.from('hive_members').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('event_participants').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('posts').select('id', { count: 'exact' }).eq('author_id', userId)
    ]);
    return { hiveCount: hives.count || 0, eventCount: events.count || 0, postCount: posts.count || 0 };
};

// --- [Messaging] ---
export const getMessages = async (options) => {
    if (USE_MOCK_DATA) return [];
    let query = supabase.from('messages').select('*, sender:profiles(username, avatar_url)');
    if (options.communityId) query = query.eq('community_id', options.communityId);
    else if (options.receiverId) query = query.or(`and(sender_id.eq.${options.senderId},receiver_id.eq.${options.receiverId}),and(sender_id.eq.${options.receiverId},receiver_id.eq.${options.senderId})`);
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

export const sendMessage = async (msg) => {
    if (USE_MOCK_DATA) return { id: nextId(), ...msg, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('messages').insert(msg).select().single();
    if (error) throw error;
    return data;
};
