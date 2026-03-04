import { create } from 'zustand';
import { getProfile, upsertProfile } from '../supabase/queries';

// localStorage에서 저장된 데이터 복원
const savedUserData = (() => {
    try {
        const raw = localStorage.getItem('lumini_user_data');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
})();

const savedMbtiType = localStorage.getItem('lumini_mbti_type') || 'Unknown';
const savedUserName = localStorage.getItem('lumini_user_name') || '사용자';

const useUserStore = create((set, get) => ({
    userData: savedUserData,
    mbtiType: savedMbtiType,
    userName: savedUserName,
    profile: null,
    loading: false,
    error: null,

    setUserData: (data) => {
        localStorage.setItem('lumini_user_data', JSON.stringify(data));
        set({ userData: data });
    },
    setMbtiType: (type) => {
        localStorage.setItem('lumini_mbti_type', type);
        set({ mbtiType: type });
    },
    setUserName: (name) => {
        localStorage.setItem('lumini_user_name', name);
        set({ userName: name });
    },

    fetchProfile: async (userId) => {
        if (!userId) return;
        set({ loading: true });
        try {
            const profile = await getProfile(userId);
            if (profile) {
                set({
                    profile,
                    userName: profile.username || get().userName,
                    mbtiType: profile.mbti_type || get().mbtiType,
                    userData: profile.personality_data || get().userData
                });
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
                userName: updated.username,
                mbtiType: updated.mbti_type,
                userData: updated.personality_data
            });
            return updated;
        } catch (err) {
            console.error('Failed to update profile:', err);
            throw err;
        }
    }
}));

export default useUserStore;
