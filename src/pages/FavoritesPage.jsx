import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, User, TrendingUp, Sparkles, HeartOff, Loader } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getConnections, toggleConnection } from '../supabase/queries';

const FavoritesPage = ({ onBack, nearbyUsers, onSelectUser, onStartChat }) => {
    const { user } = useAuthStore();
    const [favoriteUsers, setFavoriteUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const connections = await getConnections(user.id);
            // connections format: [{ ..., profiles: { ... } }]
            // We need to map this to the format expected by the UI
            const mappedUsers = connections
                .filter(conn => conn.status === 'accepted')
                .map(conn => ({
                    ...conn.profiles,
                    name: conn.profiles.username,
                    similarity: conn.similarity || 0,
                    id: conn.profiles.id,
                    mbti: conn.profiles.mbti_type
                }));
            setFavoriteUsers(mappedUsers);
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleRemoveFavorite = async (friendId) => {
        if (!user) return;
        try {
            await toggleConnection(user.id, friendId);
            setFavoriteUsers(prev => prev.filter(u => u.id !== friendId));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    // 매칭률 순 정렬
    const sortedFavorites = [...favoriteUsers].sort((a, b) => b.similarity - a.similarity);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '20px 5%',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack}
                        style={{
                            background: 'var(--primary-faint)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={24} color="var(--primary)" />
                    </motion.button>

                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'var(--text)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Heart size={28} color="#ef4444" fill="#ef4444" />
                            관심 목록
                        </h1>
                        <p style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)',
                            margin: '5px 0 0 0'
                        }}>
                            {favoriteUsers.length}명의 인연을 저장했습니다
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '30px 5%' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader className="spin" size={40} color="var(--primary)" />
                    </div>
                ) : sortedFavorites.length === 0 ? (
                    // Empty State
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            background: 'var(--surface)',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow)'
                        }}
                    >
                        <Heart size={80} color="var(--glass-border)" strokeWidth={1.5} />
                        <h2 style={{
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: 'var(--text)',
                            marginTop: '20px',
                            marginBottom: '10px'
                        }}>
                            아직 관심 등록한 인연이 없어요
                        </h2>
                        <p style={{
                            fontSize: '1rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.6,
                            marginBottom: '30px'
                        }}>
                            마음에 드는 사람을 발견하면<br />
                            하트 버튼을 눌러 관심 목록에 추가해보세요!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="primary"
                            style={{
                                padding: '15px 40px',
                                fontSize: '1rem',
                                fontWeight: 700
                            }}
                        >
                            인연 찾으러 가기
                        </motion.button>
                    </motion.div>
                ) : (
                    // User Cards
                    <div style={{
                        display: 'grid',
                        gap: '20px',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
                    }}>
                        <AnimatePresence>
                            {sortedFavorites.map((user, index) => (
                                <FavoriteUserCard
                                    key={user.id}
                                    user={user}
                                    index={index}
                                    onSelectUser={onSelectUser}
                                    onStartChat={onStartChat}
                                    onRemove={() => handleRemoveFavorite(user.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

// Favorite User Card Component
const FavoriteUserCard = ({ user, index, onSelectUser, onStartChat, onRemove }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
            style={{
                background: 'var(--surface)',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: 'var(--shadow)',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Gradient */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                opacity: 0.1
            }} />

            {/* Remove Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRemove}
                style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'var(--surface)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow)',
                    zIndex: 2
                }}
            >
                <HeartOff size={18} color="#ef4444" />
            </motion.button>

            {/* Profile */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 800,
                    margin: '0 auto 15px',
                    border: '4px solid var(--surface)',
                    boxShadow: 'var(--shadow)'
                }}>
                    {user.name[0]}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: 'var(--text)',
                        margin: '0 0 8px 0'
                    }}>
                        {user.name}
                    </h3>
                    <div style={{
                        display: 'inline-block',
                        background: 'var(--primary-faint)',
                        color: 'var(--primary)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 700
                    }}>
                        {user.mbti}
                    </div>
                </div>

                {/* Matching Score */}
                <div style={{
                    background: 'var(--background)',
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '5px'
                    }}>
                        <Sparkles size={18} color="#8b5cf6" />
                        <span style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600
                        }}>
                            성향 일치도
                        </span>
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {user.similarity}%
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStartChat(user)}
                        className="primary"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px',
                            fontSize: '0.95rem'
                        }}
                    >
                        <MessageCircle size={18} />
                        대화하기
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectUser(user)}
                        style={{
                            flex: 1,
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            border: '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            padding: '14px',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <User size={18} />
                        프로필
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default FavoritesPage;
