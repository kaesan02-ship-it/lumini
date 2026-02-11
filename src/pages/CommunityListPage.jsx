import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, TrendingUp, Search, Filter, Plus, Loader } from 'lucide-react';
import { getHives } from '../supabase/queries';

const CommunityListPage = ({ onBack, onSelectCommunity, onCreateHive, userData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCommunities = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getHives();
            setCommunities(data);
        } catch (err) {
            console.error('Failed to fetch communities:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCommunities();
    }, [fetchCommunities]);



    // 카테고리 필터
    const categories = [
        { id: 'all', name: '전체', icon: '🌟' },
        { id: 'art', name: '예술', icon: '🎨' },
        { id: 'reading', name: '독서', icon: '📚' },
        { id: 'music', name: '음악', icon: '🎵' },
        { id: 'health', name: '건강', icon: '🏃' },
        { id: 'entertainment', name: '엔터', icon: '🎬' },
        { id: 'travel', name: '여행', icon: '✈️' },
        { id: 'tech', name: '기술', icon: '💻' },
        { id: 'food', name: '음식', icon: '🍳' }
    ];

    // 필터링된 커뮤니티
    const filteredCommunities = communities
        .filter(c => selectedCategory === 'all' || c.category === selectedCategory)
        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => b.matchRate - a.matchRate); // 매칭률 높은 순

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #e2e8f0',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <motion.button
                        whileHover={{ scale: 1.1, background: 'var(--primary-faint)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={24} color="var(--text)" />
                    </motion.button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>커뮤니티</h1>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
                            관심사가 비슷한 사람들과 소통하세요
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCreateHive}
                        className="primary"
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}
                    >
                        <Plus size={18} /> 하이브 개설
                    </motion.button>
                </div>

                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    marginBottom: '15px'
                }}>
                    <Search size={20} color="#94a3b8" style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }} />
                    <input
                        type="text"
                        placeholder="커뮤니티 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 15px 12px 45px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Category Filter */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '5px'
                }}>
                    {categories.map(cat => (
                        <motion.button
                            key={cat.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                background: selectedCategory === cat.id ? 'var(--primary)' : '#f1f5f9',
                                color: selectedCategory === cat.id ? 'white' : 'var(--text)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Community Grid */}
            <div style={{
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader className="spin" size={40} color="var(--primary)" />
                    </div>
                ) : filteredCommunities.map((community, index) => (
                    <CommunityCard
                        key={community.id}
                        community={community}
                        delay={index * 0.05}
                        onClick={() => onSelectCommunity(community)}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredCommunities.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-muted)'
                }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>검색 결과가 없습니다</p>
                    <p style={{ fontSize: '0.9rem' }}>다른 키워드로 검색해보세요</p>
                </div>
            )}
        </div>
    );
};

// Community Card Component
const CommunityCard = ({ community, delay, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(139, 92, 246, 0.2)' }}
            onClick={onClick}
            className="glass-card"
            style={{
                padding: '25px',
                cursor: 'pointer',
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s'
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '15px' }}>
                <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: '#1a202c'
                }}>
                    {community.name}
                </h3>
                <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    lineHeight: '1.5'
                }}>
                    {community.description}
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '15px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    background: '#10b98115',
                    borderRadius: '8px'
                }}>
                    <Users size={16} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                        {community.onlineCount}명 접속
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    background: 'var(--primary-faint)',
                    borderRadius: '8px'
                }}>
                    <TrendingUp size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                        매칭 {community.match_rate || 75}%
                    </span>
                </div>
            </div>

            {/* Tags */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '15px'
            }}>
                {(community.tags || []).map((tag, i) => (
                    <span
                        key={i}
                        style={{
                            padding: '4px 10px',
                            background: 'var(--background)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500
                        }}
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Member Count */}
            <div style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                fontWeight: 500
            }}>
                총 {community.totalMembers}명의 멤버
            </div>
        </motion.div>
    );
};

export default CommunityListPage;
