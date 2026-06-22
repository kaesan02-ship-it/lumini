import { create } from 'zustand';
import { getProfile, updateProfile, upsertProfile } from '../supabase/queries';
import { supabase } from '../supabase/client';


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
            } else {
                // 실시간 데이터베이스(Supabase) 모드일 때 profiles 테이블에 데이터가 없는 경우 복구 시도
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const metadata = user.user_metadata || {};
                    // 실명 정보가 있다면 그것을 우선 사용합니다.
                    let defaultUsername = metadata.username || metadata.name || '';
                    if (!defaultUsername) {
                        defaultUsername = `user_${userId.substring(0, 6)}_${Date.now().toString().slice(-4)}`;
                    }

                    console.log('DB에 프로필 정보가 없어 자동 복구 생성을 진행합니다. 생성할 닉네임:', defaultUsername);

                    // 최소 정보로 프로필 생성 시도
                    const newProfileData = {
                        id: userId,
                        username: defaultUsername,
                        bio: '반가워요! 루미니에 오신 것을 환영합니다 ✨',
                        mbti_type: '?',
                        personality_data: null
                    };

                    const createdProfile = await upsertProfile(newProfileData);
                    if (createdProfile) {
                        set({
                            profile: createdProfile,
                            userName: createdProfile.username,
                            mbtiType: '?',
                            userData: null
                        });
                        localStorage.setItem('lumini_user_name', createdProfile.username);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile (using fallback):', err);
            set({ error: err.message });
            
            // 극단적인 API 에러 상황에서 화이트아웃을 방지하기 위한 최소 복구용 fallback 프로필 설정
            const fallbackProfile = {
                id: userId,
                username: localStorage.getItem('lumini_user_name') || get().userName || '임시 사용자',
                mbti_type: localStorage.getItem('lumini_mbti_type') || get().mbtiType || '?',
                personality_data: null
            };
            
            try {
                const localData = localStorage.getItem('lumini_user_data');
                if (localData) {
                    fallbackProfile.personality_data = JSON.parse(localData);
                }
            } catch (jsonErr) {
                console.error('Failed to parse local personality data:', jsonErr);
            }
            
            set({
                profile: fallbackProfile,
                userName: fallbackProfile.username,
                mbtiType: fallbackProfile.mbti_type,
                userData: fallbackProfile.personality_data
            });
        } finally {
            set({ loading: false });
        }
    },

    updateProfile: async (userId, data) => {
        try {
            const safeData = { ...data };
            if (!get().profile?.username && !data.username) {
                const currentName = get().userName;
                if (!currentName) {
                    // 고유 닉네임을 생성하여 UNIQUE 제약 조건 오류를 방지함
                    safeData.username = `user_${userId.substring(0, 6)}_${Date.now().toString().slice(-4)}`;
                } else {
                    safeData.username = currentName;
                }
            }
            const updated = await upsertProfile({ id: userId, ...safeData });
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
