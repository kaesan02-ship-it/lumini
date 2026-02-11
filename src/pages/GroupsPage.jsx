import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, TrendingUp, MapPin, Target } from 'lucide-react';
import { MOCK_GROUPS } from '../data/mockData';

const GroupsPage = ({ onSelectGroup }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredGroups = useMemo(() => {
        let groups = MOCK_GROUPS;

        if (searchQuery) {
            groups = groups.filter(group =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (activeFilter !== 'all') {
            groups = groups.filter(group => group.category === activeFilter);
        }

        return groups;
    }, [searchQuery, activeFilter]);

    const popularGroups = useMemo(() => MOCK_GROUPS.filter(g => g.category === 'popular'), []);
    const nearbyGroups = useMemo(() => MOCK_GROUPS.filter(g => g.category === 'nearby'), []);
    const interestGroups = useMemo(() => MOCK_GROUPS.filter(g => g.category === 'interest'), []);

    return (
        <div style={{ padding: '20px 5%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                    그룹 💬
                </h1>

                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{
                        flex: 1,
                        position: 'relative'
                    }}>
                        <Search
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="그룹 이름이나 태그로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 45px',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="primary"
                        style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={20} /> 그룹 만들기
                    </motion.button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                        { key: 'all', label: '전체', icon: null },
                        { key: 'popular', label: '인기', icon: TrendingUp },
                        { key: 'nearby', label: '내 주변', icon: MapPin },
                        { key: 'interest', label: '관심사', icon: Target }
                    ].map(filter => {
                        const Icon = filter.icon;
                        const isActive = activeFilter === filter.key;

                        return (
                            <motion.button
                                key={filter.key}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveFilter(filter.key)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: isActive ? 'none' : '1px solid var(--glass-border)',
                                    background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'white',
                                    color: isActive ? 'white' : 'var(--text)',
                                    fontWeight: isActive ? 700 : 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                {Icon && <Icon size={16} />}
                                {filter.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Groups List */}
            {activeFilter === 'all' && !searchQuery ? (
                <>
                    <GroupSection title="🔥 인기 그룹" groups={popularGroups} onSelectGroup={onSelectGroup} />
                    <GroupSection title="📍 내 주변 그룹" groups={nearbyGroups} onSelectGroup={onSelectGroup} />
                    <GroupSection title="🎯 관심사 기반 추천" groups={interestGroups} onSelectGroup={onSelectGroup} />
                </>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredGroups.map(group => (
                        <GroupCard key={group.id} group={group} onSelect={onSelectGroup} />
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupSection = React.memo(({ title, groups, onSelectGroup }) => (
    <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>{title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {groups.map(group => (
                <GroupCard key={group.id} group={group} onSelect={onSelectGroup} />
            ))}
        </div>
    </div>
));

const GroupCard = React.memo(({ group, onSelect }) => {
    const activityColor = group.activity === '활발함' ? '#10b981' : group.activity === '보통' ? '#f59e0b' : '#94a3b8';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => onSelect(group)}
            className="glass-card"
            style={{
                padding: '20px',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                    fontSize: '2rem',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    borderRadius: '12px'
                }}>
                    {group.emoji}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
                        {group.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>{group.memberCount}명</span>
                        <span>·</span>
                        <span style={{ color: activityColor, fontWeight: 600 }}>{group.activity}</span>
                    </div>
                </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '12px', flex: 1 }}>
                {group.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {group.tags.map(tag => (
                    <span
                        key={tag}
                        style={{
                            padding: '4px 10px',
                            background: '#f1f5f9',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600
                        }}
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            <div style={{
                padding: '10px',
                background: '#f8fafc',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
            }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>최근 메시지</div>
                <div>{group.lastMessage}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{group.lastMessageTime}</div>
            </div>
        </motion.div>
    );
});

export default React.memo(GroupsPage);
