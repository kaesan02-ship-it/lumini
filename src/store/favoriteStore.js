import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 찜하기(즐겨찾기) 전역 상태 관리
 */
const useFavoriteStore = create(
    persist(
        (set, get) => ({
            favorites: [],

            toggleFavorite: (userId) => {
                const { favorites } = get();
                if (favorites.includes(userId)) {
                    set({ favorites: favorites.filter(id => id !== userId) });
                } else {
                    set({ favorites: [...favorites, userId] });
                }
            },

            isFavorite: (userId) => {
                return get().favorites.includes(userId);
            },

            clearFavorites: () => set({ favorites: [] }),

            setFavorites: (list) => set({ favorites: list })
        }),
        {
            name: 'lumini-favorites-storage', // localStorage key
        }
    )
);

export default useFavoriteStore;
