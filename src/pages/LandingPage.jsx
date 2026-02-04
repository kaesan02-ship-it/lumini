import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, MapPin, Zap, ClipboardList, TrendingUp } from 'lucide-react';

const LandingPage = ({ onStart }) => {
    return (
        <div className="landing-container">
            {/* Header Banner - Based on User's Image */}
            <section style={{
                background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'white',
                borderRadius: '0 0 30px 30px',
                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)'
            }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Sparkles size={32} /> Lumini
                    </h1>
                    <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>나와 잘 맞는 친구를 찾아보세요</p>
                </motion.div>
            </section>

            {/* Main Action Card */}
            <section className="section-padding" style={{ display: 'flex', justifyContent: 'center', marginTop: '-40px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ width: '100%', maxWidth: '800px', padding: '50px 30px', textAlign: 'center', position: 'relative', zIndex: 10 }}
                >
                    <div style={{ marginBottom: '30px' }}>
                        <Users size={60} color="var(--text)" style={{ margin: '0 auto 20px', opacity: 0.8 }} />
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '15px' }}>환영합니다! 🌟</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                            Lumini는 과학적인 성격 분석을 통해<br />진짜 잘 맞는 친구를 연결해드립니다.
                        </p>
                    </div>
                    <button className="primary" style={{ padding: '16px 60px', borderRadius: '30px', fontSize: '1.2rem' }} onClick={onStart}>
                        시작하기
                    </button>
                </motion.div>
            </section>

            {/* Feature Grid - Based on User's Image */}
            <section style={{ padding: '0 5% 60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                    <FeatureCard icon={<ClipboardList color="#a78bfa" />} title="과학적 매칭" desc="MDTI 기반의 정밀한 분석" />
                    <FeatureCard icon={<TrendingUp color="#a78bfa" />} title="시각적 분석" desc="레이더 차트로 보는 성향" />
                    <FeatureCard icon={<MapPin color="#a78bfa" />} title="위치 기반" desc="주변의 잘 맞는 친구 탐색" />
                    <FeatureCard icon={<Users color="#a78bfa" />} title="그룹 모임" desc="하이브 시스템 기반 소모임" />
                </div>
            </section>

            {/* Stats - Based on User's Image */}
            <section style={{ padding: '0 5% 100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#a78bfa' }}>15</div>
                        <div style={{ color: 'var(--text-muted)' }}>활동 중인 친구들</div>
                    </div>
                    <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#a78bfa' }}>98%</div>
                        <div style={{ color: 'var(--text-muted)' }}>매칭 만족도</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
);

export default LandingPage;
