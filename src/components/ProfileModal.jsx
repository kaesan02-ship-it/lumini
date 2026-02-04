import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from './RadarChart';
import { X, MessageCircle, Heart } from 'lucide-react';

const ProfileModal = ({ user, onClose, userData }) => {
    if (!user) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card"
                style={{ width: '90%', maxWidth: '600px', padding: '30px', position: 'relative', background: 'white' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text)' }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}></div>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{user.name}</h2>
                        <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>성향 일치도 {user.similarity}%</p>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '1rem' }}>"함께 대화하며 서로의 가치관을 공유하는 시간을 소중히 여깁니다."</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: '#f8fafc', marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Heart size={20} color="var(--secondary)" /> 성향 분석 비교
                    </h3>
                    <RadarChart data={user.data} comparisonData={userData} size={250} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#ec4899', borderRadius: '50%' }}></div> {user.name}님
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '50%' }}></div> 나
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <MessageCircle size={20} /> 대화 시작하기
                    </button>
                    <button style={{ flex: 1, background: '#f1f5f9', color: 'var(--text)', border: '1px solid var(--glass-border)' }}>
                        관심 등록
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileModal;
