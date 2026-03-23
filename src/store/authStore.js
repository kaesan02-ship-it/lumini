import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';
import useUserStore from './userStore';

// ─── 데모 계정 (Mock 모드에서 유일하게 허용) ─────────────────────────
const DEMO_ACCOUNTS = {
    'demo@lumini.me': { password: 'lumini123', username: '루미니 탐험가', isAdmin: false },
    'admin@lumini.me': { password: 'admin1234', username: '관리자', isAdmin: true },
};

// ─────────────────────────────────────────────────────────────────────────
// 🚨 중요: persist 미들웨어를 사용하지 않음
// 이유: persist로 session 토큰을 localStorage에 저장하면 기기를 공유하는 다른 사람이
//       이전 사용자의 계정으로 자동 로그인되는 심각한 보안 문제가 발생.
//       세션 관리는 Supabase SDK가 자체적으로 처리하며, 앱 시작 시
//       `supabase.auth.getSession()`으로 항상 서버에서 검증한다.
// ─────────────────────────────────────────────────────────────────────────
const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    loading: true, // 앱 시작 시 세션 확인 중 true
    isAdmin: false,

    setSession: (session) => {
        if (!session) {
            set({ session: null, user: null, loading: false, isAdmin: false });
            return;
        }
        const isAdmin =
            session.user?.email === 'admin@lumini.me' ||
            session.user?.user_metadata?.isAdmin === true;
        set({ session, user: session.user, loading: false, isAdmin });
    },

    signIn: async (email, password) => {
        const cleanEmail = email.trim().toLowerCase();

        if (USE_MOCK_DATA) {
            const account = DEMO_ACCOUNTS[cleanEmail];
            if (!account || account.password !== password) {
                throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.\n(데모: demo@lumini.me / lumini123)');
            }
            const mockUser = {
                id: `mock-${email}`,
                email,
                username: account.username,
                avatar_url: '',
                user_metadata: { username: account.username, isAdmin: account.isAdmin },
            };
            const mockSession = { user: mockUser, access_token: 'mock-token' };
            set({ user: mockUser, session: mockSession, loading: false, isAdmin: account.isAdmin });
            return { user: mockUser, session: mockSession };
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) {
            console.error('Login error:', error);
            throw error;
        }
        const isAdmin =
            data.user?.email === 'admin@lumini.me' ||
            data.user?.user_metadata?.isAdmin === true;
        set({ isAdmin, user: data.user, session: data.session, loading: false });
        return data;
    },

    signUp: async (email, password, metadata) => {
        const cleanEmail = email.trim().toLowerCase();

        if (USE_MOCK_DATA) {
            if (!cleanEmail || !password || password.length < 6) {
                throw new Error('이메일과 6자 이상의 비밀번호를 입력해주세요.');
            }
            const mockUser = {
                id: `mock-${email}-${Date.now()}`,
                email,
                username: metadata?.username || email.split('@')[0],
                avatar_url: '',
                user_metadata: { username: metadata?.username || '', age: metadata?.age || null, isAdmin: false },
            };
            const mockSession = { user: mockUser, access_token: 'mock-token' };
            set({ user: mockUser, session: mockSession, loading: false, isAdmin: false });
            return { user: mockUser, session: mockSession, isNewUser: true };
        }

        const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: { data: metadata },
        });
        if (error) {
            console.error('Signup error:', error);
            throw error;
        }
        return data;
    },

    signOut: async () => {
        if (!USE_MOCK_DATA) await supabase.auth.signOut();

        // ─── localStorage 완전 초기화 ──────────────────────────────────
        // 세션과 관련된 모든 키 제거 (이전 사용자 데이터 완전 소거)
        const keysToRemove = [
            'lumini-auth-storage',  // (구) persist 스토어 잔재
            'lumini-user-storage',  // userStore persist 잔재
            'lumini_profile_avatar',
            'lumini_deep_soul',
            'lumini_user_district',
            'lumini_user_data',
            'lumini_mbti_type',
            'lumini_user_name',
            'lumini_visited',       // 튜토리얼 완료 여부도 리셋
            'lumini_guest_personality',
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // 전역 상태 리셋
        useUserStore.getState().resetStore();
        set({ user: null, session: null, isAdmin: false, loading: false });
    },

    signInWithGoogle: async () => {
        if (USE_MOCK_DATA) {
            throw new Error('데모 모드에서는 소셜 로그인을 지원하지 않습니다.\ndemo@lumini.me / lumini123 으로 로그인해주세요.');
        }
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
        });
        if (error) throw error;
        return data;
    },
}));

export default useAuthStore;
