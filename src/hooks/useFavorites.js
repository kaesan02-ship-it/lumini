import useFavoriteStore from '../store/favoriteStore';

const useFavorites = () => {
    const { favorites, toggleFavorite, isFavorite, clearFavorites } = useFavoriteStore();

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites
    };
};

export default useFavorites;
