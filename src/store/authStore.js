import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// ─── 데모 계정 (Mock 모드에서 유일하게 허용) ─────────────────────────
const DEMO_ACCOUNTS = {
    'demo@lumini.me': { password: 'lumini123', username: '루미니 탐험가', isAdmin: false },
    'admin@lumini.me': { password: 'admin1234', username: '관리자', isAdmin: true },
};

const MOCK_SESSION_KEY = 'lumini_mock_session';

// 저장된 Mock 세션 불러오기
const loadMockSession = () => {
    try {
        const raw = localStorage.getItem(MOCK_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// 초기 상태: Mock 모드라면 저장된 세션을 불러옴
const savedMockSession = USE_MOCK_DATA ? loadMockSession() : null;

const useAuthStore = create((set) => ({
    user: savedMockSession ? savedMockSession.user : null,
    session: savedMockSession ? savedMockSession : null,
    loading: !USE_MOCK_DATA, // 실제 Supabase 모드에서만 초기 로딩 true
    isAdmin: savedMockSession?.isAdmin ?? false,

    setSession: (session) => {
        if (USE_MOCK_DATA) {
            // Mock 모드에서 null 세션이 와도 강제 복구하지 않음
            if (!session) return;
            const isAdmin = session?.user?.email === 'admin@lumini.me';
            set({ session, user: session.user, loading: false, isAdmin });
            return;
        }
        const isAdmin = session?.user?.email === 'admin@lumini.me';
        set({ session, user: session?.user || null, loading: false, isAdmin });
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
                user_metadata: { username: account.username },
            };
            const mockSession = { user: mockUser, access_token: 'mock-token', isAdmin: account.isAdmin };
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
            set({ user: mockUser, session: mockSession, loading: false, isAdmin: account.isAdmin });
            return { user: mockUser, session: mockSession };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const isAdmin = data.user?.email === 'admin@lumini.me';
        set({ isAdmin });
        return data;
    },

    signUp: async (email, password, metadata) => {
        if (USE_MOCK_DATA) {
            // Mock 회원가입: demo 계정과 같은 방식으로 처리
            if (!email || !password || password.length < 6) {
                throw new Error('이메일과 6자 이상의 비밀번호를 입력해주세요.');
            }
            const mockUser = {
                id: `mock-${email}-${Date.now()}`,
                email,
                username: metadata?.username || email.split('@')[0],
                avatar_url: '',
                user_metadata: { username: metadata?.username || '' },
            };
            const mockSession = { user: mockUser, access_token: 'mock-token', isAdmin: false };
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
            set({ user: mockUser, session: mockSession, loading: false, isAdmin: false });
            return { user: mockUser, session: mockSession, isNewUser: true };
        }
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        if (!USE_MOCK_DATA) await supabase.auth.signOut();
        localStorage.removeItem(MOCK_SESSION_KEY);
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
}));

export default useAuthStore;
