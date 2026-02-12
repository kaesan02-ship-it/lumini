import { create } from 'zustand';
import { getProfile, upsertProfile } from '../supabase/queries';

const useUserStore = create((set, get) => ({
    userData: null,
    mbtiType: 'Unknown',
    userName: '사용자',
    profile: null,
    loading: false,
    error: null,

    setUserData: (data) => set({ userData: data }),
    setMbtiType: (type) => set({ mbtiType: type }),
    setUserName: (name) => set({ userName: name }),

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
