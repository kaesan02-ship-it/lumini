import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config';
import { getFromStorage, saveToStorage } from '../utils/storage';

/**
 * 사용자 데이터 관리 Custom Hook
 */
export const useUserData = () => {
    const [userData, setUserData] = useState(() =>
        getFromStorage(STORAGE_KEYS.USER_DATA, null)
    );

    const [mbtiType, setMbtiType] = useState(() =>
        getFromStorage(STORAGE_KEYS.MBTI_TYPE, 'Unknown')
    );

    const [userName, setUserName] = useState(() =>
        getFromStorage(STORAGE_KEYS.USER_NAME, '사용자')
    );

    // 자동 저장
    useEffect(() => {
        if (userData) {
            saveToStorage(STORAGE_KEYS.USER_DATA, userData);
        }
    }, [userData]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.MBTI_TYPE, mbtiType);
    }, [mbtiType]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.USER_NAME, userName);
    }, [userName]);

    const resetUserData = () => {
        setUserData(null);
        setMbtiType('Unknown');
        saveToStorage(STORAGE_KEYS.USER_DATA, null);
        saveToStorage(STORAGE_KEYS.MBTI_TYPE, 'Unknown');
    };

    return {
        userData,
        setUserData,
        mbtiType,
        setMbtiType,
        userName,
        setUserName,
        resetUserData,
    };
};

/**
 * UI 상태 관리 Custom Hook
 */
export const useUIState = () => {
    const [step, setStep] = useState(() => {
        const savedData = getFromStorage(STORAGE_KEYS.USER_DATA);
        const onboardingCompleted = getFromStorage(STORAGE_KEYS.ONBOARDING_COMPLETED);

        // 온보딩 미완료 시 splash부터 시작
        if (!onboardingCompleted) return 'splash';
        // 진단 미완료 시 welcome부터 시작
        if (!savedData) return 'welcome';
        // 모두 완료 시 dashboard
        return 'dashboard';
    });

    const [onboardingStep, setOnboardingStep] = useState('splash'); // splash, howItWorks, privacy
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(() =>
        !getFromStorage(STORAGE_KEYS.ONBOARDING_COMPLETED)
    );

    const [showInterestSelector, setShowInterestSelector] = useState(false);

    const completeOnboarding = () => {
        setShowOnboarding(false);
        saveToStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    };

    const nextOnboardingStep = () => {
        if (onboardingStep === 'splash') {
            setOnboardingStep('howItWorks');
        } else if (onboardingStep === 'howItWorks') {
            setOnboardingStep('privacy');
        } else if (onboardingStep === 'privacy') {
            // 온보딩 완료, 성격진단으로 이동
            completeOnboarding();
            setStep('test');
        }
    };

    const prevOnboardingStep = () => {
        if (onboardingStep === 'howItWorks') {
            setOnboardingStep('splash');
        } else if (onboardingStep === 'privacy') {
            setOnboardingStep('howItWorks');
        }
    };

    return {
        step,
        setStep,
        onboardingStep,
        setOnboardingStep,
        nextOnboardingStep,
        prevOnboardingStep,
        selectedUser,
        setSelectedUser,
        showSettings,
        setShowSettings,
        showOnboarding,
        completeOnboarding,
        showInterestSelector,
        setShowInterestSelector,
    };
};

/**
 * 커뮤니티 기능 상태 관리 Custom Hook
 */
export const useCommunityState = () => {
    const [selectedInterests, setSelectedInterests] = useState(() =>
        getFromStorage(STORAGE_KEYS.INTERESTS, [])
    );

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { sender: '시스템', text: '새로운 멤버 \'사용자\'님이 입장했습니다.', isSystem: true },
        { sender: '지후', text: '안녕하세요! 다들 책 읽는 거 좋아하시나요?' },
        { sender: '서연', text: '네, 저는 요즘 인문학 서적에 빠져있어요.' },
    ]);

    // 자동 저장
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.INTERESTS, selectedInterests);
    }, [selectedInterests]);

    const sendMessage = (userName, message) => {
        if (!message.trim()) return;
        setChatMessages(prev => [...prev, { sender: userName, text: message }]);
        setChatInput('');

        // Mock 응답 (실제로는 서버에서 받아올 데이터)
        const timeoutId = setTimeout(() => {
            setChatMessages(prev => [...prev, {
                sender: '지후',
                text: '반가워요! 어떤 분야를 가장 좋아하시나요?'
            }]);
        }, 1500);

        // Cleanup function to prevent memory leak
        return () => clearTimeout(timeoutId);
    };

    return {
        selectedInterests,
        setSelectedInterests,
        selectedGroup,
        setSelectedGroup,
        chatInput,
        setChatInput,
        chatMessages,
        setChatMessages,
        sendMessage,
    };
};

/**
 * 테마 관리 Custom Hook
 */
export const useTheme = () => {
    const [theme, setTheme] = useState(() =>
        getFromStorage(STORAGE_KEYS.THEME, 'light')
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        saveToStorage(STORAGE_KEYS.THEME, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return {
        theme,
        setTheme,
        toggleTheme,
    };
};
