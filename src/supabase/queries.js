import { supabase } from './client';

// --- [Profiles] ---

/**
 * 사용자 프로필 가져오기
 */
export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

/**
 * 프로필 생성 또는 업데이트
 */
export const upsertProfile = async (profileData) => {
    const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// --- [Social / Connections] ---

/**
 * 주변 사용자 목록 가져오기 (성향 일치도 포함 가능)
 */
export const getNearbyProfiles = async (limit = 10) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(limit);

    if (error) throw error;
    return data;
};

/**
 * 관심 등록 (Like)
 */
export const toggleConnection = async (requesterId, targetId, similarity) => {
    // 기존 연결 확인
    const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', requesterId)
        .eq('target_id', targetId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from('connections')
            .delete()
            .eq('id', existing.id);
        if (error) throw error;
        return { status: 'deleted' };
    } else {
        const { data, error } = await supabase
            .from('connections')
            .insert({
                requester_id: requesterId,
                target_id: targetId,
                similarity_score: similarity,
                status: 'pending'
            })
            .select()
            .single();
        if (error) throw error;
        return { status: 'created', data };
    }
};

// --- [Communities / Hives] ---

/**
 * 커뮤니티 목록 가져오기
 */
export const getCommunities = async () => {
    const { data, error } = await supabase
        .from('communities')
        .select('*');

    if (error) throw error;
    return data;
};

/**
 * 커뮤니티 가입
 */
export const joinCommunity = async (communityId, profileId) => {
    const { data, error } = await supabase
        .from('community_members')
        .insert({ community_id: communityId, profile_id: profileId })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// --- [Messaging] ---

/**
 * 대화 메시지 가져오기 (다이렉트 또는 커뮤니티)
 */
export const getMessages = async (options) => {
    let query = supabase.from('messages').select('*, sender:profiles(username, avatar_url)');

    if (options.communityId) {
        query = query.eq('community_id', options.communityId);
    } else if (options.receiverId) {
        // 1:1 대화 (A -> B OR B -> A)
        query = query.or(`and(sender_id.eq.${options.senderId},receiver_id.eq.${options.receiverId}),and(sender_id.eq.${options.receiverId},receiver_id.eq.${options.senderId})`);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

/**
 * 메시지 전송
 */
export const sendMessage = async (messageData) => {
    const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

    if (error) throw error;
    return data;
};
// --- Event (Gathering) Management ---

/**
 * 이벤트 목록 가져오기
 */
export const getEvents = async (hiveId = null) => {
    let query = supabase
        .from('events')
        .select(`
            *,
            hives (name),
            creator:profiles!events_created_by_fkey (username, avatar_url)
        `)
        .order('event_date', { ascending: true });

    if (hiveId) {
        query = query.eq('hive_id', hiveId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

/**
 * 이벤트 상세 정보 가져오기
 */
export const getEventDetail = async (eventId) => {
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            hives (name),
            creator:profiles!events_created_by_fkey (username, avatar_url)
        `)
        .eq('id', eventId)
        .single();
    if (error) throw error;
    return data;
};

/**
 * 이벤트 생성
 */
export const createEvent = async (eventData) => {
    const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * 이벤트 참가 신청/취소
 */
export const toggleEventParticipation = async (eventId, userId) => {
    const { data: existing } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from('event_participants')
            .delete()
            .eq('id', existing.id);
        if (error) throw error;
        return { status: 'cancelled' };
    } else {
        const { data, error } = await supabase
            .from('event_participants')
            .insert({
                event_id: eventId,
                user_id: userId,
                status: 'attending'
            })
            .select()
            .single();
        if (error) throw error;
        return { status: 'attending', data };
    }
};

/**
 * 이벤트 참가자 목록 가져오기
 */
export const getEventParticipants = async (eventId) => {
    const { data, error } = await supabase
        .from('event_participants')
        .select(`
            *,
            profiles (
                id,
                username,
                avatar_url,
                mbti_type
            )
        `)
    if (error) throw error;
    return data;
};

// --- Post (Feed) Management ---

/**
 * 게시물 목록 가져오기
 */
export const getPosts = async (category = null) => {
    let query = supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey (id, username, avatar_url, mbti_type)
        `)
        .order('created_at', { ascending: false });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

/**
 * 게시물 생성
 */
export const createPost = async (postData) => {
    const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * 좋아요 토글
 */
export const toggleLike = async (postId, userId) => {
    const { data: existing } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('id', existing.id);
        if (error) throw error;
        return { status: 'unliked' };
    } else {
        const { data, error } = await supabase
            .from('post_likes')
            .insert({ post_id: postId, user_id: userId })
            .select()
            .single();
        if (error) throw error;
        return { status: 'liked', data };
    }
};

/**
 * 댓글 가져오기
 */
export const getComments = async (postId) => {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            author:profiles!comments_author_id_fkey (username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

/**
 * 댓글 작성
 */
export const createComment = async (commentData) => {
    const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

// --- Growth & Insights (Phase 4) ---

/**
 * 성격 진단 기록 가져오기
 */
export const getPersonalityHistory = async (userId) => {
    const { data, error } = await supabase
        .from('personality_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

/**
 * 성장 일지 가져오기
 */
export const getGrowthLogs = async (userId) => {
    const { data, error } = await supabase
        .from('growth_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

/**
 * 성장 일지 작성
 */
export const createGrowthLog = async (logData) => {
    const { data, error } = await supabase
        .from('growth_logs')
        .insert(logData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * 전체 사용자 MBTI 분포 통계 (자체 집계)
 */
export const getMBTIDistribution = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('mbti_type');

    if (error) throw error;

    const stats = data.reduce((acc, curr) => {
        if (!curr.mbti_type) return acc;
        acc[curr.mbti_type] = (acc[curr.mbti_type] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(stats).map(([type, count]) => ({ type, count }));
};

/**
 * 내 활동 통계 가져오기
 */
export const getMyActivityStats = async (userId) => {
    const [hives, events, posts] = await Promise.all([
        supabase.from('hive_members').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('event_participants').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('posts').select('id', { count: 'exact' }).eq('author_id', userId)
    ]);

    return {
        hiveCount: hives.count || 0,
        eventCount: events.count || 0,
        postCount: posts.count || 0
    };
};


