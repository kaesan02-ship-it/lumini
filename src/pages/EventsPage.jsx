import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Plus, Filter, Search, Loader, ChevronRight, Clock } from 'lucide-react';
import { getEvents } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const EventsPage = ({ onBack, onSelectEvent, onCreateEvent }) => {
    const { user } = useAuthStore();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, upcoming, my

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getEvents();
            setEvents(data);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'upcoming') {
            return matchesSearch && new Date(event.event_date) > new Date();
        }
        if (filter === 'my') {
            return matchesSearch && event.created_by === user?.id;
        }
        return matchesSearch;
    });

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
                zIndex: 10,
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>오프라인 모임</h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>함께 만나서 더 즐거운 시간을 보내세요</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreateEvent}
                    className="primary"
                    style={{
                        padding: '10px 18px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 700
                    }}
                >
                    <Plus size={18} /> 모임 만들기
                </motion.button>
            </div>

            <div style={{ padding: '25px 5%' }}>
                {/* Search & Filter */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
                    <div style={{
                        flex: 1,
                        minWidth: '200px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="모임 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                borderRadius: '15px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--surface)',
                                color: 'var(--text)',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['all', 'upcoming', 'my'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: filter === f ? 'var(--primary)' : 'var(--glass-border)',
                                    background: filter === f ? 'var(--primary-faint)' : 'var(--surface)',
                                    color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {f === 'all' ? '전체' : f === 'upcoming' ? '예정된 모임' : '내가 만든 모임'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader className="spin" size={40} color="var(--primary)" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'var(--surface)',
                        borderRadius: '25px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <Calendar size={60} color="var(--glass-border)" style={{ marginBottom: '20px' }} />
                        <h3 style={{ margin: 0, color: 'var(--text)' }}>등록된 모임이 없습니다</h3>
                        <p style={{ color: 'var(--text-muted)' }}>첫 번째 모임의 주인공이 되어보세요!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {filteredEvents.map((event, index) => (
                            <EventCard key={event.id} event={event} onClick={() => onSelectEvent(event)} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const EventCard = ({ event, onClick, index }) => {
    const eventDate = new Date(event.event_date);
    const isPast = eventDate < new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, boxShadow: 'var(--shadow)' }}
            onClick={onClick}
            style={{
                background: 'var(--surface)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {isPast && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.05)', zIndex: 1, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', backdropFilter: 'grayscale(1)'
                }}>
                    <span style={{
                        background: 'var(--text-muted)', color: 'white',
                        padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
                    }}>종료된 모임</span>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <span style={{
                    padding: '5px 12px', background: 'var(--primary-faint)', color: 'var(--primary)',
                    borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700
                }}>
                    {event.hives?.name || '일반'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Users size={14} /> {event.participant_count || 0} / {event.max_participants || '∞'}
                </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text)' }}>{event.title}</h3>
            <p style={{
                fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 20px 0',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', minHeight: '40px'
            }}>
                {event.description}
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Calendar size={16} color="var(--primary)" />
                    {eventDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Clock size={16} color="var(--primary)" />
                    {eventDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <MapPin size={16} color="var(--primary)" />
                    {event.location}
                </div>
            </div>

            <div style={{
                marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: 'white', fontWeight: 700
                    }}>
                        {event.creator?.username?.[0] || 'U'}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.creator?.username}</span>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
            </div>
        </motion.div>
    );
};

export default EventsPage;
