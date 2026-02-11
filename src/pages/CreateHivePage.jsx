import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Shield, Users, Info, Sparkles } from 'lucide-react';
import { createHive } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const CreateHivePage = ({ onBack, onSuccess }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'general',
        max_members: 50,
        is_public: true
    });

    const categories = [
        { id: 'general', name: '일반', icon: '🌟' },
        { id: 'art', name: '예술', icon: '🎨' },
        { id: 'reading', name: '독서', icon: '📚' },
        { id: 'music', name: '음악', icon: '🎵' },
        { id: 'health', name: '건강', icon: '🏃' },
        { id: 'entertainment', name: '엔터', icon: '🎬' },
        { id: 'travel', name: '여행', icon: '✈️' },
        { id: 'tech', name: '기술', icon: '💻' },
        { id: 'food', name: '음식', icon: '🍳' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setLoading(true);
            await createHive({
                ...formData,
                creator_id: user.id
            });
            onSuccess();
        } catch (err) {
            console.error('Failed to create hive:', err);
            alert('하이브 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                padding: '20px 5%',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--text)'
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>새 하이브 개설</h1>
            </div>

            <div style={{ padding: '30px 5%', maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
                    {/* Basic Info */}
                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.1rem' }}>
                            <Info size={18} color="var(--primary)" /> 기본 정보
                        </h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>하이브 이름</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="하이브 이름을 입력하세요"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>설명</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="하이브에 대해 간단히 소개해 주세요"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', outline: 'none', minHeight: '100px', resize: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.1rem' }}>
                            <Sparkles size={18} color="var(--primary)" /> 카테고리 설정
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                    style={{
                                        padding: '10px 18px', borderRadius: '20px', border: '1px solid',
                                        borderColor: formData.category === cat.id ? 'var(--primary)' : 'var(--glass-border)',
                                        background: formData.category === cat.id ? 'var(--primary-faint)' : 'var(--background)',
                                        color: formData.category === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    <span>{cat.icon}</span> {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.1rem' }}>
                            <Shield size={18} color="var(--primary)" /> 관리 설정
                        </h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>최대 멤버 수</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>하이브에 참여 가능한 인원을 제한합니다</p>
                                </div>
                                <select
                                    value={formData.max_members}
                                    onChange={(e) => setFormData(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
                                    style={{
                                        padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                        background: 'var(--background)', color: 'var(--text)', fontWeight: 600
                                    }}
                                >
                                    {[10, 30, 50, 100, 200, 500].map(val => (
                                        <option key={val} value={val}>{val}명</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>공개 여부</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>누구나 검색하여 참가할 수 있게 합니다</p>
                                </div>
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
                                    style={{
                                        width: '50px', height: '26px', borderRadius: '13px',
                                        background: formData.is_public ? 'var(--primary)' : '#cbd5e1',
                                        position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                                    }}
                                >
                                    <motion.div
                                        animate={{ x: formData.is_public ? 26 : 4 }}
                                        style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: 'white', position: 'absolute', top: '3px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="primary"
                        style={{ padding: '18px', fontSize: '1.1rem', fontWeight: 800, borderRadius: '15px' }}
                    >
                        {loading ? '생성 중...' : '하이브 개설하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateHivePage;
