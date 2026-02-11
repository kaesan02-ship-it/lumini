import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle, XCircle, Share2, Info, Loader } from 'lucide-react';
import { getEventDetail, getEventParticipants, toggleEventParticipation } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const EventDetailPage = ({ eventId, onBack }) => {
    const { user } = useAuthStore();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isParticipating, setIsParticipating] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [detail, parts] = await Promise.all([
                getEventDetail(eventId),
                getEventParticipants(eventId)
            ]);
            setEvent(detail);
            setParticipants(parts);
            setIsParticipating(parts.some(p => p.user_id === user?.id));
        } catch (err) {
            console.error('Failed to fetch event detail:', err);
        } finally {
            setLoading(false);
        }
    }, [eventId, user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleParticipation = async () => {
        if (!user) {
            alert('로그인이 필요한 기능입니다.');
            return;
        }

        try {
            setActionLoading(true);
            const result = await toggleEventParticipation(eventId, user.id);
            if (result.status === 'attending') {
                setIsParticipating(true);
                // Refresh participants
                const newParts = await getEventParticipants(eventId);
                setParticipants(newParts);
            } else {
                setIsParticipating(false);
                setParticipants(prev => prev.filter(p => p.user_id !== user.id));
            }
        } catch (err) {
            console.error('Participation error:', err);
            alert('처리 중 오류가 발생했습니다.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader className="spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    if (!event) return null;

    const eventDate = new Date(event.event_date);
    const isFull = event.max_participants && participants.length >= event.max_participants && !isParticipating;
    const isPast = eventDate < new Date();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* Hero Header */}
            <div style={{
                height: '250px',
                background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '30px 5%'
            }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    style={{
                        position: 'absolute', top: '20px', left: '20px',
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        border: 'none', borderRadius: '50%', padding: '10px',
                        cursor: 'pointer', color: 'white', zIndex: 10
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>

                <div style={{ color: 'white' }}>
                    <div style={{
                        display: 'inline-block', padding: '4px 12px',
                        background: 'var(--primary)', borderRadius: '20px',
                        fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px'
                    }}>
                        {event.hives?.name || '일반 모임'}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                        {event.title}
                    </h1>
                </div>
            </div>

            <div style={{ padding: '30px 5%', display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
                {/* Left: Info */}
                <div style={{ display: 'grid', gap: '30px' }}>
                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                            <Info size={20} color="var(--primary)" /> 상세 설명
                        </h3>
                        <p style={{
                            lineHeight: 1.8, color: 'var(--text)', fontSize: '1rem',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {event.description || '상세 설명이 없습니다.'}
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                            <Users size={20} color="var(--primary)" /> 참가자 ({participants.length} / {event.max_participants || '∞'})
                        </h3>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
                            {participants.map((p, idx) => (
                                <motion.div
                                    key={p.user_id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 700, fontSize: '1.2rem',
                                        border: '3px solid var(--surface)', boxShadow: 'var(--shadow)'
                                    }}>
                                        {p.profiles?.username?.[0] || 'U'}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.profiles?.username}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '25px', background: 'var(--surface)' }}>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: 'var(--primary-faint)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Calendar size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>날짜</p>
                                    <p style={{ margin: 0, fontWeight: 700 }}>{eventDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: 'var(--primary-faint)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Clock size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>시간</p>
                                    <p style={{ margin: 0, fontWeight: 700 }}>{eventDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: 'var(--primary-faint)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <MapPin size={20} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>장소</p>
                                    <p style={{ margin: 0, fontWeight: 700 }}>{event.location}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--background)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.8rem'
                                }}>
                                    {event.creator?.username?.[0] || 'U'}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>모임장</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{event.creator?.username}</p>
                                </div>
                            </div>
                            <button style={{
                                width: '100%', padding: '10px', borderRadius: '10px',
                                border: '1px solid var(--glass-border)', background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                color: 'var(--text)'
                            }}>
                                <Share2 size={16} /> 친구에게 공유
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'var(--surface)', borderTop: '1px solid var(--glass-border)',
                padding: '20px 5%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)'
            }}>
                <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div style={{ display: 'none' }}> {/* Mobile only participants count would go here */}
                    </div>

                    <button
                        onClick={handleToggleParticipation}
                        disabled={actionLoading || isFull || isPast}
                        className={isParticipating ? "" : "primary"}
                        style={{
                            flex: 1, padding: '16px', borderRadius: '15px',
                            fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '10px', border: 'none',
                            background: isPast ? 'var(--glass-border)' :
                                isFull ? 'var(--glass-border)' :
                                    isParticipating ? 'var(--error-faint)' : undefined,
                            color: isPast ? 'var(--text-muted)' :
                                isFull ? 'var(--text-muted)' :
                                    isParticipating ? 'var(--error)' : undefined
                        }}
                    >
                        {actionLoading ? <Loader className="spin" size={24} /> : (
                            <>
                                {isPast ? (
                                    <>익히 종료된 모임입니다</>
                                ) : isFull ? (
                                    <>정원이 가득 찼습니다</>
                                ) : isParticipating ? (
                                    <><XCircle size={22} /> 참가 취소하기</>
                                ) : (
                                    <><CheckCircle size={22} /> 지금 참가하기</>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;
