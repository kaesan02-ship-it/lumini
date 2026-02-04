import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';

const MapContainer = () => {
    // 실제 지도 API를 연동하기 전 시각적 프로토타입
    return (
        <div className="glass-card" style={{
            height: '450px',
            background: '#f8fafc',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* 가상 지도 배경 */}
            <div style={{
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: 'radial-gradient(circle, #f1f5f9 2px, transparent 2px)',
                backgroundSize: '40px 40px',
                opacity: 0.5,
                transform: 'rotate(15deg)'
            }}></div>

            <div style={{ textAlign: 'center', zIndex: 1, padding: '40px' }}>
                <MapPin size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>주변 매칭 지도 가동 중</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', margin: 'auto' }}>
                    당신과 성향이 비슷한 친구들이 지도 위에 표시됩니다.<br />
                    (현재 시뮬레이션 모드 활성화)
                </p>
            </div>

            {/* 가상 사용자 마커들 */}
            <UserMarker top="30%" left="40%" color="#8b5cf6" label="지후 (92%)" />
            <UserMarker top="60%" left="70%" color="#ec4899" label="서연 (88%)" />
            <UserMarker top="20%" left="60%" color="#10b981" label="민준 (81%)" />
        </div>
    );
};

const UserMarker = ({ top, left, color, label }) => (
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
            position: 'absolute', top, left, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
        }}
    >
        <div style={{
            width: '12px', height: '12px', background: color, borderRadius: '50%',
            boxShadow: `0 0 15px ${color}`, border: '2px solid white'
        }}></div>
        <div style={{
            background: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem',
            fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #edf2f7'
        }}>
            {label}
        </div>
    </motion.div>
);

export default MapContainer;
