import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config';
import { getFromStorage, saveToStorage } from '../utils/storage';

const useFavorites = () => {
    const [favorites, setFavorites] = useState(() => {
        const saved = getFromStorage(STORAGE_KEYS.FAVORITES);
        return saved || [];
    });

    // localStorage에 저장
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
    }, [favorites]);

    // 관심 등록/해제 토글
    const toggleFavorite = (userId) => {
        setFavorites(prev => {
            if (prev.includes(userId)) {
                // 이미 있으면 제거
                return prev.filter(id => id !== userId);
            } else {
                // 없으면 추가
                return [...prev, userId];
            }
        });
    };

    // 관심 등록 여부 확인
    const isFavorite = (userId) => {
        return favorites.includes(userId);
    };

    // 모든 관심 목록 제거
    const clearFavorites = () => {
        setFavorites([]);
    };

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites
    };
};

export default useFavorites;
