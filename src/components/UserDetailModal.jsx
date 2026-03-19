import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MapPin } from 'lucide-react';
import { getSoulType } from '../data/soulTypes';
import IdentityBadge from './IdentityBadge';

const UserDetailModal = ({ user, onClose }) => {
    if (!user) return null;
    const soul = getSoulType(user.mbti);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                onClick={onClose}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%', maxWidth: '420px', background: 'white',
                        borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}
                >
                    <div style={{ height: '120px', background: `linear-gradient(135deg, ${soul.gradient[0]}, ${soul.gradient[1]})`, position: 'relative' }}>
                        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'white' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '0 24px 24px', position: 'relative' }}>
                        <div style={{
                            width: '90px', height: '90px', borderRadius: '24px', background: 'white',
                            padding: '4px', position: 'absolute', top: '-45px', left: '24px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '20px',
                                background: `linear-gradient(135deg, ${soul.gradient[0]}, ${soul.gradient[1]})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem'
                            }}>
                                {soul.emoji}
                            </div>
                        </div>

                        <div style={{ paddingTop: '55px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{user.name}</h2>
                                <span style={{ fontSize: '0.8rem', background: 'var(--primary-faint)', color: 'var(--primary)', padding: '3px 12px', borderRadius: '100px', fontWeight: 800 }}>{soul.soulName}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                                <MapPin size={14} /> {user.district || '주변 지역'}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                {user.game && <IdentityBadge type="GAME" label={user.game} />}
                                {user.tier && <IdentityBadge type="TIER" label={user.tier} />}
                                {user.similarity > 90 && <IdentityBadge type="HOT" label="슈퍼 매칭" />}
                                <IdentityBadge type="MBTI" label={user.mbti} />
                            </div>

                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', marginBottom: '25px', fontSize: '0.95rem', lineHeight: 1.6, color: '#334155' }}>
                                {user.bio || "아직 자기소개가 작성되지 않았습니다. 🦦"}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button style={{ padding: '15px', borderRadius: '18px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <User size={18} /> 프로필 정보
                                </button>
                                <button style={{ padding: '15px', borderRadius: '18px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
                                    <Send size={18} /> 메세지 보내기
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserDetailModal;
