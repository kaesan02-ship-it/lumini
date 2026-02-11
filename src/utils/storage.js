import { STORAGE_KEYS, ERROR_MESSAGES } from '../config';

/**
 * localStorage에서 데이터를 안전하게 가져옵니다
 * @param {string} key - 스토리지 키
 * @param {*} defaultValue - 기본값
 * @returns {*} 저장된 값 또는 기본값
 */
export const getFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;

        // JSON 파싱 시도
        try {
            return JSON.parse(item);
        } catch {
            // JSON이 아닌 경우 문자열 그대로 반환
            return item;
        }
    } catch (error) {
        console.error(`Failed to load from storage (${key}):`, error);
        // TODO: Sentry 등 에러 트래킹 서비스에 보고
        return defaultValue;
    }
};

/**
 * localStorage에 데이터를 안전하게 저장합니다
 * @param {string} key - 스토리지 키
 * @param {*} value - 저장할 값
 * @returns {boolean} 성공 여부
 */
export const saveToStorage = (key, value) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        return true;
    } catch (error) {
        console.error(`Failed to save to storage (${key}):`, error);
        // TODO: Sentry 등 에러 트래킹 서비스에 보고
        return false;
    }
};

/**
 * localStorage에서 데이터를 안전하게 제거합니다
 * @param {string} key - 스토리지 키
 * @returns {boolean} 성공 여부
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Failed to remove from storage (${key}):`, error);
        return false;
    }
};

/**
 * localStorage를 안전하게 초기화합니다
 * @returns {boolean} 성공 여부
 */
export const clearStorage = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Failed to clear storage:', error);
        return false;
    }
};
