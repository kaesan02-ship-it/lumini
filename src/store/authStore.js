import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// 모크 유저 (Supabase 연결 없이도 모든 기능 사용 가능)
const MOCK_USER = {
    id: 'mock-user-001',
    email: 'lumini@example.com',
    username: '루미니 탐험가',
    avatar_url: '',
    user_metadata: { username: '루미니 탐험가' }
};

const MOCK_SESSION = {
    user: MOCK_USER,
    access_token: 'mock-token'
};

const useAuthStore = create((set) => ({
    user: USE_MOCK_DATA ? MOCK_USER : null,
    session: USE_MOCK_DATA ? MOCK_SESSION : null,
    loading: USE_MOCK_DATA ? false : true,
    isAdmin: USE_MOCK_DATA ? true : false,

    setSession: (session) => {
        // 모크 모드에서 null 세션이 들어오면 모크 유저 유지
        if (USE_MOCK_DATA && !session) {
            set({ session: MOCK_SESSION, user: MOCK_USER, loading: false });
            return;
        }
        const isAdmin = session?.user?.email === 'admin@lumini.me';
        set({
            session,
            user: session?.user || null,
            loading: false,
            isAdmin
        });
    },

    signIn: async (email, password) => {
        if (USE_MOCK_DATA) {
            set({ user: MOCK_USER, session: MOCK_SESSION, loading: false });
            return { user: MOCK_USER, session: MOCK_SESSION };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    signUp: async (email, password, metadata) => {
        if (USE_MOCK_DATA) {
            set({ user: MOCK_USER, session: MOCK_SESSION, loading: false });
            return { user: MOCK_USER, session: MOCK_SESSION };
        }
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        if (!USE_MOCK_DATA) await supabase.auth.signOut();
        set({ user: null, session: null });
    },

    signInWithGoogle: async () => {
        if (USE_MOCK_DATA) {
            set({ user: MOCK_USER, session: MOCK_SESSION, loading: false });
            return { user: MOCK_USER, session: MOCK_SESSION };
        }
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
        return data;
    }
}));

export default useAuthStore;
