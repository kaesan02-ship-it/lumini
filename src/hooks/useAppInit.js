import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useCrystalStore from '../store/crystalStore';
import { getNearbyProfiles } from '../supabase/queries';

/**
 * useAppInit — 앱 최초 마운트 시 Supabase 세션 초기화 및 인증 상태 구독
 *
 * 반환값:
 *  - fetchNearbyUsers: 주변 유저 목록을 새로고침하는 함수
 *
 * 동작 흐름:
 *  1) supabase.auth.getSession() → 서버에서 현재 세션 검증
 *  2) 세션이 있으면 userStore.fetchProfile, crystalStore.fetchCrystalsFromDB 호출
 *  3) onAuthStateChange 구독 → 로그인/로그아웃 이벤트에 자동 반응
 */
const useAppInit = (setNearbyUsers) => {
    const mountedRef = useRef(true);
    const { setSession } = useAuthStore();
    const { fetchProfile } = useUserStore();

    // ─── 주변 유저 fetch ───────────────────────────────────────────
    const fetchNearbyUsers = useCallback(async () => {
        const { user } = useAuthStore.getState();
        if (!user?.id && !USE_MOCK_DATA) return;

        try {
            const profiles = await getNearbyProfiles(20);
            const currentUserId = user?.id || 'mock-user-001';
            const mapped = profiles
                .filter((p) => p.id !== currentUserId)
                .map((p) => {
                    const pd = p.personality_data || {};
                    const O = pd.O || 0;
                    const C = pd.C || 0;
                    const E = pd.E || 0;
                    const A = pd.A || 0;
                    const N = pd.N || 0;
                    return {
                        id: p.id,
                        name: p.username || '익명',
                        mbti: p.mbti_type || 'Unknown',
                        bio: p.bio || '',
                        district: p.district || '',
                        interests: p.interests || [],
                        similarity:
                            80 +
                            ((p.id.charCodeAt(0) + p.id.charCodeAt(p.id.length - 1)) % 15),
                        deep_soul: p.deep_soul || null,
                        pet_data: p.pet_data || null,
                        data: [
                            { subject: '사교성', A: Math.round(E), fullMark: 100 },
                            { subject: '창의성', A: Math.round(O * 0.6 + E * 0.4), fullMark: 100 },
                            { subject: '공감력', A: Math.round(A * 0.6 + (100 - N) * 0.4), fullMark: 100 },
                            { subject: '계획성', A: Math.round(C), fullMark: 100 },
                            { subject: '성실성', A: Math.round(pd.H || 50), fullMark: 100 },
                        ],
                    };
                });
            if (mountedRef.current) setNearbyUsers(mapped);
        } catch (err) {
            console.error('Failed to load nearby users:', err);
        }
    }, [setNearbyUsers]);

    // ─── 앱 초기화 ─────────────────────────────────────────────────
    useEffect(() => {
        mountedRef.current = true;

        const initializeAuth = async () => {
            try {
                // Mock 모드에서는 Supabase 호출 생략
                if (USE_MOCK_DATA) {
                    useAuthStore.getState().setSession(null);
                    await fetchNearbyUsers();
                    return;
                }

                const {
                    data: { session: currentSession },
                } = await supabase.auth.getSession();

                if (!mountedRef.current) return;

                if (currentSession?.user) {
                    setSession(currentSession);
                    await fetchProfile(currentSession.user.id);
                    useCrystalStore.getState().fetchCrystalsFromDB(currentSession.user.id);
                    await fetchNearbyUsers();
                } else {
                    // 세션 없음 → 로딩 해제
                    setSession(null);
                }
            } catch (err) {
                console.error('Auth init error:', err.message);
                if (mountedRef.current) setSession(null);
            }
        };

        initializeAuth();

        // 인증 상태 변경 구독 (로그인 / 로그아웃 / 세션 갱신)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mountedRef.current) return;

            setSession(session);

            if (session?.user) {
                await fetchProfile(session.user.id);
                useCrystalStore.getState().fetchCrystalsFromDB(session.user.id);
                fetchNearbyUsers();
            }
        });

        return () => {
            mountedRef.current = false;
            subscription.unsubscribe();
        };
    }, []); // 마운트 1회만 실행

    return { fetchNearbyUsers };
};

export default useAppInit;
