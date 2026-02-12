import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 아이콘 수정
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapContainer = ({ users = [] }) => {
    const center = [37.5665, 126.9780]; // 서울 시청 기준

    // 가상 사용자 데이터 (실제 데이터와 결합 가능)
    const mockNearbyUsers = [
        { id: 1, name: '지후', position: [37.5685, 126.9800], similarity: 92, mbti: 'ENFJ', color: '#8b5cf6' },
        { id: 2, name: '서연', position: [37.5645, 126.9750], similarity: 88, mbti: 'INFP', color: '#ec4899' },
        { id: 3, name: '민준', position: [37.5700, 126.9730], similarity: 81, mbti: 'ENTP', color: '#10b981' },
    ];

    const displayUsers = users.length > 0 ? users.map((u, i) => ({
        ...u,
        position: [center[0] + (Math.random() - 0.5) * 0.02, center[1] + (Math.random() - 0.5) * 0.02]
    })) : mockNearbyUsers;

    return (
        <div style={{ height: '450px', width: '100%', borderRadius: '22px', overflow: 'hidden', position: 'relative' }}>
            <LeafletMap center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <RecenterMap center={center} />
                {displayUsers.map(user => (
                    <Marker key={user.id} position={user.position}>
                        <Popup>
                            <div style={{ textAlign: 'center', padding: '5px' }}>
                                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{user.name}</strong>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.mbti} | 매칭률 {user.similarity}%</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </LeafletMap>

            {/* Map Overlay Info */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000,
                background: 'rgba(255,255,255,0.9)', padding: '10px 15px', borderRadius: '12px',
                fontSize: '0.8rem', border: '1px solid #e2e8f0', backdropFilter: 'blur(4px)'
            }}>
                📍 현재 서울 시청 주변 분석 매칭 중
            </div>
        </div>
    );
};

// 지도를 이동시키는 기능
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

export default MapContainer;
