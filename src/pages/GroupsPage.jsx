import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, TrendingUp, MapPin, Target, X, Users, Lock, Globe, Tag } from 'lucide-react';
import { MOCK_GROUPS } from '../data/mockData';

const DEFAULT_CATEGORIES = ['독서', '영화', '음악', '게임', '여행', '요리', '운동', '패션', '개발', 'MBTI', '성향 분석', '연애'];

const GroupsPage = ({ onSelectGroup }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createdGroups, setCreatedGroups] = useState(() => {
        const saved = localStorage.getItem('lumini_created_groups');
        return saved ? JSON.parse(saved) : [];
    });

    const allGroups = useMemo(() => [...MOCK_GROUPS, ...createdGroups], [createdGroups]);

    const filteredGroups = useMemo(() => {
        let groups = allGroups;
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
    }, [searchQuery, activeFilter, allGroups]);

    const popularGroups = useMemo(() => allGroups.filter(g => g.category === 'popular'), [allGroups]);
    const nearbyGroups = useMemo(() => allGroups.filter(g => g.category === 'nearby'), [allGroups]);
    const interestGroups = useMemo(() => allGroups.filter(g => g.category === 'interest'), [allGroups]);

    const handleCreateGroup = (newGroup) => {
        setCreatedGroups(prev => {
            const updated = [newGroup, ...prev];
            localStorage.setItem('lumini_created_groups', JSON.stringify(updated));
            return updated;
        });
        setShowCreateModal(false);
        // 바로 생성한 그룹으로 이동
        setTimeout(() => onSelectGroup?.(newGroup), 300);
    };

    return (
        <div style={{ padding: '20px 5%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>그룹 💬</h1>

                {/* Search + Create */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="그룹 이름이나 태그로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '1rem', background: 'var(--surface)', color: 'var(--text)' }}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="primary"
                        onClick={() => setShowCreateModal(true)}
                        style={{ padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
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
                                    padding: '8px 16px', borderRadius: '20px',
                                    border: isActive ? 'none' : '1px solid var(--glass-border)',
                                    background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
                                    color: isActive ? 'white' : 'var(--text)',
                                    fontWeight: isActive ? 700 : 600,
                                    display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
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
                    {createdGroups.length > 0 && (
                        <GroupSection title="✨ 내가 만든 그룹" groups={createdGroups} onSelectGroup={onSelectGroup} />
                    )}
                    <GroupSection title="🔥 인기 그룹" groups={popularGroups} onSelectGroup={onSelectGroup} />
                    <GroupSection title="📍 내 주변 그룹" groups={nearbyGroups} onSelectGroup={onSelectGroup} />
                    <GroupSection title="🎯 관심사 기반 추천" groups={interestGroups} onSelectGroup={onSelectGroup} />
                </>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredGroups.length > 0 ? filteredGroups.map(group => (
                        <GroupCard key={group.id} group={group} onSelect={onSelectGroup} />
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>검색 결과가 없어요</h3>
                            <p>다른 키워드로 검색하거나 새 그룹을 만들어보세요.</p>
                        </div>
                    )}
                </div>
            )}

            {/* 그룹 만들기 모달 */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateGroupModal
                        onClose={() => setShowCreateModal(false)}
                        onCreate={handleCreateGroup}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ── 그룹 만들기 모달 ─────────────────────────────────────────────
const CreateGroupModal = ({ onClose, onCreate }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        emoji: '💬',
        isPrivate: false,
        selectedTags: [],
        maxMembers: 20,
    });
    const [tagInput, setTagInput] = useState('');
    const [step, setStep] = useState(1); // 1: 기본정보, 2: 완료

    const EMOJI_OPTIONS = ['💬', '🎮', '📚', '🎵', '🎨', '✈️', '🍕', '💪', '🧠', '💜', '🌟', '🔥'];

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        const newGroup = {
            id: `user-created-${Date.now()}`,
            name: form.name.trim(),
            description: form.description.trim() || '새로 만들어진 그룹이에요!',
            emoji: form.emoji,
            memberCount: 1,
            activity: '활발함',
            category: 'interest',
            tags: form.selectedTags.length > 0 ? form.selectedTags : ['신규'],
            lastMessage: '그룹이 생성되었습니다! 환영해요 🎉',
            lastMessageTime: '방금',
            isPrivate: form.isPrivate,
            maxMembers: form.maxMembers,
            isOwner: true,
        };
        onCreate(newGroup);
    };

    const addTag = (tag) => {
        if (!form.selectedTags.includes(tag) && form.selectedTags.length < 5) {
            setForm(f => ({ ...f, selectedTags: [...f.selectedTags, tag] }));
        }
    };
    const removeTag = (tag) => setForm(f => ({ ...f, selectedTags: f.selectedTags.filter(t => t !== tag) }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ background: 'var(--surface)', borderRadius: '28px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}
            >
                {/* Header */}
                <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontWeight: 900, fontSize: '1.5rem' }}>새 그룹 만들기</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>관심사가 비슷한 사람들과 소통해보세요</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--background)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={18} color="var(--text-muted)" />
                    </button>
                </div>

                <div style={{ padding: '0 28px 28px', display: 'grid', gap: '20px' }}>
                    {/* 이모지 선택 */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>그룹 아이콘</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {EMOJI_OPTIONS.map(e => (
                                <button
                                    key={e}
                                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                                    style={{
                                        width: '44px', height: '44px', borderRadius: '12px', fontSize: '1.4rem',
                                        background: form.emoji === e ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'var(--background)',
                                        border: form.emoji === e ? 'none' : '1px solid var(--glass-border)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transform: form.emoji === e ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s'
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 그룹 이름 */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>그룹 이름 <span style={{ color: '#EF4444' }}>*</span></label>
                        <input
                            type="text"
                            placeholder="예: MBTI 이야기 나눠요 💜"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            maxLength={30}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: `1.5px solid ${form.name ? 'var(--primary)' : 'var(--glass-border)'}`, background: 'var(--background)', color: 'var(--text)', fontSize: '1rem', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{form.name.length}/30</div>
                    </div>

                    {/* 그룹 설명 */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>그룹 소개</label>
                        <textarea
                            placeholder="어떤 사람들을 위한 그룹인지 간단히 설명해주세요"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            maxLength={150}
                            rows={3}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1.5px solid var(--glass-border)', background: 'var(--background)', color: 'var(--text)', fontSize: '0.95rem', resize: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* 태그 */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} />태그 (최대 5개)
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '10px' }}>
                            {DEFAULT_CATEGORIES.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => form.selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                                    style={{
                                        padding: '5px 12px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                        background: form.selectedTags.includes(tag) ? 'var(--primary)' : 'var(--background)',
                                        color: form.selectedTags.includes(tag) ? 'white' : 'var(--text-muted)',
                                        border: `1px solid ${form.selectedTags.includes(tag) ? 'var(--primary)' : 'var(--glass-border)'}`,
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 공개/비공개 */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>공개 설정</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                                { val: false, icon: Globe, label: '공개 그룹', desc: '누구나 참여 가능' },
                                { val: true, icon: Lock, label: '비공개 그룹', desc: '초대받은 사람만' },
                            ].map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={String(opt.val)}
                                        onClick={() => setForm(f => ({ ...f, isPrivate: opt.val }))}
                                        style={{
                                            padding: '14px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                                            background: form.isPrivate === opt.val ? 'linear-gradient(135deg, #4F46E512, #7C3AED10)' : 'var(--background)',
                                            border: `1.5px solid ${form.isPrivate === opt.val ? '#7C3AED40' : 'var(--glass-border)'}`,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Icon size={20} color={form.isPrivate === opt.val ? '#6366F1' : 'var(--text-muted)'} style={{ marginBottom: '6px' }} />
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: form.isPrivate === opt.val ? '#6366F1' : 'var(--text)' }}>{opt.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 최대 인원 */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />최대 인원: <strong style={{ color: 'var(--primary)' }}>{form.maxMembers}명</strong>
                        </label>
                        <input
                            type="range" min={5} max={100} step={5}
                            value={form.maxMembers}
                            onChange={e => setForm(f => ({ ...f, maxMembers: Number(e.target.value) }))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>5명</span><span>100명</span>
                        </div>
                    </div>

                    {/* 만들기 버튼 */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={!form.name.trim()}
                        style={{
                            width: '100%', padding: '16px', borderRadius: '16px',
                            background: form.name.trim() ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--glass-border)',
                            color: form.name.trim() ? 'white' : 'var(--text-muted)',
                            fontWeight: 900, fontSize: '1.05rem', border: 'none',
                            cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <Plus size={20} /> {form.emoji} 그룹 만들기
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
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
            style={{ padding: '20px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '2rem', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', borderRadius: '12px' }}>
                    {group.emoji}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{group.name}</h3>
                        {group.isOwner && <span style={{ fontSize: '0.65rem', background: '#6366F110', color: '#6366F1', padding: '2px 7px', borderRadius: '10px', fontWeight: 800 }}>내 그룹</span>}
                        {group.isPrivate && <Lock size={13} color="#94A3B8" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>{group.memberCount}명</span>
                        <span>·</span>
                        <span style={{ color: activityColor, fontWeight: 600 }}>{group.activity}</span>
                    </div>
                </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px', flex: 1 }}>{group.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {group.tags.map(tag => (
                    <span key={tag} style={{ padding: '4px 10px', background: 'var(--background)', borderRadius: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        #{tag}
                    </span>
                ))}
            </div>
            <div style={{ padding: '10px', background: 'var(--background)', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>최근 메시지</div>
                <div>{group.lastMessage}</div>
                <div style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.7 }}>{group.lastMessageTime}</div>
            </div>
        </motion.div>
    );
});

export default React.memo(GroupsPage);
