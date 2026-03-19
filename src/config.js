// 환경 설정
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Supabase 설정이 없거나 명시적으로 모크 모드일 때만 true
const HAS_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !HAS_SUPABASE;

// API 설정
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.lumini.app';

// Google Maps API Key
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

// 제한값
export const LIMITS = {
    MAX_INTEREST_TAGS: 10,
    RADAR_CHART_SIZE: 250,
    MAX_GROUP_MEMBERS: 1000,
    MAX_CHAT_MESSAGES: 100,
};

// 로컬 스토리지 키
export const STORAGE_KEYS = {
    USER_DATA: 'lumini_user_data',
    MBTI_TYPE: 'lumini_mbti_type',
    USER_NAME: 'lumini_user_name',
    THEME: 'theme',
    INTERESTS: 'lumini_interests',
    ONBOARDING_COMPLETED: 'lumini_onboarding_completed',
    FAVORITES: 'lumini_favorites',
};

// 에러 메시지
export const ERROR_MESSAGES = {
    STORAGE_LOAD_FAILED: '데이터를 불러오는데 실패했습니다.',
    STORAGE_SAVE_FAILED: '데이터를 저장하는데 실패했습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};
