import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, MapPin, Zap, ClipboardList, TrendingUp, Heart, Gamepad2 } from 'lucide-react';

const LandingPage = ({ onStart, onNavigateLogin }) => {
    return (
        <div className="landing-container">
            {/* Header Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                padding: '100px 20px 140px',
                textAlign: 'center',
                color: 'white',
                borderRadius: '0 0 50px 50px',
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <Sparkles size={40} className="text-white" /> Lumini
                    </h1>
                    <p style={{ opacity: 0.95, fontSize: '1.4rem', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>
                        데이터로 연결되는 당신의 가장 완벽한 인연
                    </p>
                </motion.div>

                {/* Floating Elements for visual interest */}
                <div style={{ position: 'absolute', top: '20%', left: '10%', opacity: 0.2 }}><Heart size={40} /></div>
                <div style={{ position: 'absolute', bottom: '20%', right: '15%', opacity: 0.2 }}><Gamepad2 size={40} /></div>
            </section>

            {/* Main Action Card */}
            <section style={{ display: 'flex', justifyContent: 'center', marginTop: '-80px', padding: '0 5%' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                    style={{
                        width: '100%',
                        maxWidth: '900px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 10,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{
                            width: '80px', height: '80px', background: 'var(--primary-faint)',
                            borderRadius: '24px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 25px'
                        }}>
                            <Users size={40} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text)' }}>
                            평생을 함께할 인연을 찾고 계신가요? 🌟
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
                            단순한 만남을 넘어, MBTI와 성격 빅데이터 기반으로<br />
                            당신의 가치관과 라이프스타일에 꼭 맞는 상대만을 추천합니다.
                        </p>
                    </div>
                    <button
                        className="primary"
                        style={{ padding: '20px 80px', borderRadius: '40px', fontSize: '1.4rem', fontWeight: 700, boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)' }}
                        onClick={onStart}
                    >
                        성격 기반 매칭 시작하기
                    </button>
                    {onNavigateLogin && (
                        <div style={{ marginTop: '20px' }}>
                            <button
                                onClick={onNavigateLogin}
                                style={{
                                    background: 'transparent', border: 'none', color: 'var(--primary)',
                                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer', textDecoration: 'underline'
                                }}
                            >
                                이미 계정이 있으신가요? 로그인
                            </button>
                        </div>
                    )}
                    <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        현재 1,240명이 매칭 대기 중입니다
                    </p>
                </motion.div>
            </section>

            {/* Expansion Categories - Future Vision */}
            <section style={{ padding: '100px 5% 60px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '50px' }}>어떤 인연을 찾고 계신가요?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                    <CategoryCard
                        icon={<Users size={32} color="var(--primary)" />}
                        title="동네 친구"
                        desc="퇴근 후 시원하게 맥주 한 잔, 혹은 주말 전시회를 함께 즐길 취향 저격 친구"
                    />
                    <CategoryCard
                        icon={<Heart size={32} color="#ec4899" />}
                        title="운명의 연인"
                        desc="가치관부터 대화 스타일까지, 깊은 공감대를 형성할 수 있는 특별한 설레임"
                        badge="준비 중"
                    />
                    <CategoryCard
                        icon={<Gamepad2 size={32} color="#8b5cf6" />}
                        title="게임 파트너"
                        desc="환상의 호흡으로 승리로 이끌어줄, 내 성향에 딱 맞는 듀오/파티원"
                        badge="준비 중"
                    />
                    <CategoryCard
                        icon={<Heart size={32} color="#f59e0b" />}
                        title="결혼 상대"
                        desc="심층 가치관 분석을 통해 미래를 함께 그려나갈 믿음직한 인생의 동반자"
                        badge="준비 중"
                    />
                </div>
            </section>

            {/* Verified Trust Stats */}
            <section style={{ padding: '40px 5% 120px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)' }}>
                        <TrendingUp size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text)' }}>94%</div>
                        <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>매칭 후 대화 만족도</div>
                    </div>
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
                        <Sparkles size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text)' }}>24회</div>
                        <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>정밀 진단 문항 수</div>
                    </div>
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
                        <Zap size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text)' }}>1.2초</div>
                        <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>추천 인연 매칭 속도</div>
                    </div>
                </div>
            </section>

            {/* Footer Copy */}
            <footer style={{ padding: '60px 5%', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    &copy; 2026 Lumini. Data for your soulmate.
                </p>
            </footer>
        </div>
    );
};

const CategoryCard = ({ icon, title, desc, badge }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="glass-card"
        style={{ padding: '40px 30px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface)' }}
    >
        <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--background)', borderRadius: '15px' }}>{icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{title}</h3>
            {badge && (
                <span style={{
                    fontSize: '0.7rem', background: '#f5f3ff', color: 'var(--primary)',
                    padding: '2px 8px', borderRadius: '10px', fontWeight: 700
                }}>{badge}</span>
            )}
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
    </motion.div>
);

export default LandingPage;
