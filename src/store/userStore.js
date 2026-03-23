import { create } from 'zustand';
import { getProfile, upsertProfile } from '../supabase/queries';

// ─────────────────────────────────────────────────────────────────────────
// 🚨 중요: persist를 사용하지 않음
// profile은 항상 Supabase DB에서 fetch → 이전 사용자 데이터 잔존 방지
// userData/mbtiType은 비로그인 게스트용으로만 localStorage에 별도 저장
// ─────────────────────────────────────────────────────────────────────────
const useUserStore = create((set, get) => ({
    userData: null,
    mbtiType: '?',
    userName: '사용자',
    profile: null,
    loading: false,
    error: null,

    setUserData: (data) => set({ userData: data }),
    setMbtiType: (type) => set({ mbtiType: type }),
    setUserName: (name) => set({ userName: name }),
    setProfile: (profileData) => set({ profile: profileData }),

    fetchProfile: async (userId) => {
        if (!userId) return;
        // 같은 유저의 프로필을 이미 로딩 중이면 중복 방지
        if (get().loading) return;
        // 이미 동일 유저 프로필 있으면 스킵 (단, username이 없는 미완성 프로필은 재시도)
        if (get().profile?.id === userId && get().profile?.username) return;

        set({ loading: true, error: null });
        try {
            const profile = await getProfile(userId);
            if (profile) {
                set({
                    profile,
                    userName: profile.username || get().userName,
                    mbtiType: profile.mbti_type || get().mbtiType,
                    userData: profile.personality_data || get().userData,
                });

                // 레거시 컴포넌트 호환용 localStorage 동기화 (읽기 전용)
                if (profile.deep_soul) {
                    localStorage.setItem('lumini_deep_soul', JSON.stringify(profile.deep_soul));
                }
                if (profile.username) {
                    localStorage.setItem('lumini_user_name', profile.username);
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    updateProfile: async (userId, data) => {
        try {
            const updated = await upsertProfile({ id: userId, ...data });
            set({
                profile: updated,
                userName: updated.username || get().userName,
                mbtiType: updated.mbti_type || get().mbtiType,
                userData: updated.personality_data || get().userData,
            });

            // localStorage 동기화 (레거시 컴포넌트 호환)
            if (updated.deep_soul) {
                localStorage.setItem('lumini_deep_soul', JSON.stringify(updated.deep_soul));
            }

            return updated;
        } catch (err) {
            console.error('Failed to update profile:', err);
            throw err;
        }
    },

    resetStore: () => {
        // 메모리 상태 초기화
        set({
            userData: null,
            mbtiType: '?',
            userName: '사용자',
            profile: null,
            loading: false,
            error: null,
        });
        // (구) persist 스토어 잔재가 있을 경우를 위해 명시적 제거
        localStorage.removeItem('lumini-user-storage');
    },
}));

export default useUserStore;
