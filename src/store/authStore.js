import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';
import useUserStore from './userStore';

// ─── 데모 계정 (Mock 모드에서 유일하게 허용) ─────────────────────────
const DEMO_ACCOUNTS = {
    'demo@lumini.me': { password: 'lumini123', username: '루미니 탐험가', isAdmin: false },
    'admin@lumini.me': { password: 'admin1234', username: '관리자', isAdmin: true },
};

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            session: null,
            loading: !USE_MOCK_DATA,
            isAdmin: false,

            setSession: (session) => {
                if (!session) {
                    set({ session: null, user: null, loading: false, isAdmin: false });
                    return;
                }
                const isAdmin = session.user?.email === 'admin@lumini.me' || session.user?.user_metadata?.isAdmin === true;
                set({ session, user: session.user, loading: false, isAdmin });
            },

            signIn: async (email, password) => {
                if (USE_MOCK_DATA) {
                    const account = DEMO_ACCOUNTS[email];
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
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                const isAdmin = data.user?.email === 'admin@lumini.me' || data.user?.user_metadata?.isAdmin === true;
                set({ isAdmin, user: data.user, session: data.session });
                return data;
            },

            signUp: async (email, password, metadata) => {
                if (USE_MOCK_DATA) {
                    if (!email || !password || password.length < 6) {
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
                const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
                if (error) throw error;
                return data;
            },

            signOut: async () => {
                if (!USE_MOCK_DATA) await supabase.auth.signOut();

                // 모든 관련 로컬 스토리지 데이터 제거 (persist에서 관리하지 않는 별도 항목들)
                localStorage.removeItem('lumini_profile_avatar');
                localStorage.removeItem('lumini_deep_soul');
                localStorage.removeItem('lumini_user_district');

                // 전역 상태 리셋
                useUserStore.getState().resetStore();

                set({ user: null, session: null, isAdmin: false, loading: false });
            },

            signInWithGoogle: async () => {
                if (USE_MOCK_DATA) {
                    throw new Error('데모 모드에서는 소셜 로그인을 지원하지 않습니다.\ndemo@lumini.me / lumini123 으로 로그인해주세요.');
                }
                const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                if (error) throw error;
                return data;
            }
        }),
        {
            name: 'lumini-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useAuthStore;
