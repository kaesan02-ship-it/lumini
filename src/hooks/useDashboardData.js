import { useState, useMemo } from 'react';
import { sortUsersByMatchingScore } from '../utils/matchingAlgorithm';

/**
 * 대시보드에서 사용하는 모든 데이터 로직을 관리하는 커스텀 훅
 */
export const useDashboardData = (userData, nearbyUsers, profile) => {
    const [activeTab, setActiveTab] = useState('all');

    // 문자열 ID를 숫자로 변환하는 헬퍼 함수
    const getStringSeed = (str) => {
        if (!str) return 0;
        if (typeof str === 'number') return str;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const user = profile || {};
    const seed = getStringSeed(user?.id);
    
    // 내 지역 (localStorage 우선 → mock default)
    const myDistrict = localStorage.getItem('lumini_user_district') || '서울 마포구';
    
    // 챌린지 완료 횟수 계산
    const completedChallenges = useMemo(() => {
        try {
            const userId = user?.id || 'guest';
            const saved = localStorage.getItem(`lumini_challenges_done_${userId}`);
            const today = new Date().toDateString();
            if (saved) {
                const p = JSON.parse(saved);
                return (p && p.date === today && Array.isArray(p.ids)) ? p.ids.length : 0;
            }
        } catch (e) {
            console.error('Failed to parse challenges:', e);
        }
        return 0;
    }, [user?.id]);

    const streak = parseInt(localStorage.getItem('lumini_streak') || '0');
    const hasDeepSoul = !!(profile?.deep_soul || localStorage.getItem('lumini_deep_soul'));

    // 매칭 알고리즘 적용
    const sortedUsers = useMemo(() => {
        if (!userData || !nearbyUsers) return nearbyUsers || [];
        return sortUsersByMatchingScore(nearbyUsers, userData);
    }, [userData, nearbyUsers]);

    // 동네 친구 필터
    const neighborUsers = useMemo(() => {
        if (!myDistrict) return sortedUsers;
        return sortedUsers.filter(u => u.district && u.district === myDistrict);
    }, [sortedUsers, myDistrict]);

    // 표시할 유저 목록
    const displayedUsers = useMemo(() => {
        const users = activeTab === 'friend' ? neighborUsers : sortedUsers;
        return users.slice(0, 5);
    }, [activeTab, sortedUsers, neighborUsers]);

    return {
        activeTab,
        setActiveTab,
        seed,
        myDistrict,
        completedChallenges,
        streak,
        hasDeepSoul,
        sortedUsers,
        neighborUsers,
        displayedUsers
    };
};
