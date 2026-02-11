import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Info, Users, Clock, Sparkles } from 'lucide-react';
import { createEvent, getHives } from '../supabase/queries';
import useAuthStore from '../store/authStore';
import { useEffect } from 'react';

const CreateEventPage = ({ onBack, onSuccess }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [hives, setHives] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        event_date: '',
        event_time: '19:00',
        max_participants: 10,
        hive_id: ''
    });

    useEffect(() => {
        const fetchHives = async () => {
            try {
                const data = await getHives();
                setHives(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, hive_id: data[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch hives:', err);
            }
        };
        fetchHives();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        try {
            setLoading(true);
            const eventDateTime = `${formData.event_date}T${formData.event_time}:00`;

            await createEvent({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                event_date: eventDateTime,
                max_participants: formData.max_participants,
                hive_id: formData.hive_id || null,
                created_by: user.id
            });
            onSuccess();
        } catch (err) {
            console.error('Failed to create event:', err);
            alert('모임 생성 중 오류가 발생했습니다.');
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
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>새 모임 만들기</h1>
            </div>

            <div style={{ padding: '30px 5%', maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
                    {/* Basic Info */}
                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.1rem' }}>
                            <Info size={18} color="var(--primary)" /> 모임 정보
                        </h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>모임 제목</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="어떤 모임인가요?"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>소개</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="모임에 대해 자세히 설명해 주세요"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', outline: 'none', minHeight: '120px', resize: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Location */}
                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.1rem' }}>
                            <Calendar size={18} color="var(--primary)" /> 일정 및 장소
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>날짜</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.event_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>시간</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.event_time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>장소</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '15px', color: 'var(--primary)' }} />
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="어디서 만나나요?"
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Community & Settings */}
                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.1rem' }}>
                            <Sparkles size={18} color="var(--primary)" /> 소속 및 정원
                        </h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>소속 하이브 (선택)</label>
                                <select
                                    value={formData.hive_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hive_id: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'var(--background)',
                                        color: 'var(--text)', fontWeight: 600, outline: 'none'
                                    }}
                                >
                                    <option value="">일반 모임 (소속 없음)</option>
                                    {hives.map(hive => (
                                        <option key={hive.id} value={hive.id}>{hive.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>최대 참가 인원</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>참가 가능한 인원을 제한합니다</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setFormData(prev => ({ ...prev, max_participants: Math.max(2, prev.max_participants - 1) }))}
                                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--background)', cursor: 'pointer', color: 'var(--text)' }}
                                    >-</motion.button>
                                    <span style={{ fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{formData.max_participants}</span>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setFormData(prev => ({ ...prev, max_participants: prev.max_participants + 1 }))}
                                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--background)', cursor: 'pointer', color: 'var(--text)' }}
                                    >+</motion.button>
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
                        {loading ? '생성 중...' : '모임 만들기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEventPage;
