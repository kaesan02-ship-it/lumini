import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from '../components/RadarChart';
import { Sparkles, ArrowRight, CheckCircle2, Award, Zap, Heart, ShieldCheck } from 'lucide-react';

const ResultReport = ({ data, mbtiType, onExplore }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("Loading complete, showing report.");
            setLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div style={{
                height: '70vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    style={{ marginBottom: '30px' }}
                >
                    <Sparkles size={60} color="var(--primary)" />
                </motion.div>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>심층 성격 모델 분석 중...</h2>
                <p style={{ color: 'var(--text-muted)' }}>MBTI, OCEAN, HEXACO 통합 알고리즘이 작동 중입니다.</p>

                <div style={{ width: '300px', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '40px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5 }}
                        style={{ height: '100%', background: 'var(--primary)' }}
                    />
                </div>
            </div>
        );
    }

    const mbtiDescriptions = {
        'ENFJ': '정의로운 사회운동가 - 온화하며 진심으로 타인을 생각하는 리더입니다.',
        'ENFP': '재기발랄한 활동가 - 자유로운 영혼이며 항상 웃음과 즐거움을 전합니다.',
        'ENTJ': '대담한 통솔자 - 미래를 설계하며 효율적으로 목표를 달성하는 전략가입니다.',
        'ENTP': '뜨거운 논쟁을 즐기는 변론가 - 지적 호기심이 많고 새로운 해결책을 찾기를 즐깁니다.',
        'ESFJ': '사교적인 외교관 - 주변 사람을 꼼꼼하게 잘 챙기며 조화를 중요시합니다.',
        'ESFP': '자유로운 영혼의 연예인 - 지금 이 순간을 즐기며 사람들을 기쁘게 하는 마법사입니다.',
        'ESTJ': '엄격한 관리자 - 질서와 전통을 중요시하며 조화로운 공동체를 만듭니다.',
        'ESTP': '모험을 즐기는 사업가 - 넘치는 에너지로 문제를 해결하며 모험을 즐깁니다.',
        'INFJ': '선의의 옹호자 - 조용하고 신비롭지만 인류애를 위해 헌신하는 이상주의자입니다.',
        'INFP': '열정적인 중재자 - 상냥하고 이타적인 마음을 지닌 완벽주의적인 영혼입니다.',
        'INTJ': '용의주도한 전략가 - 독창적인 아이디어와 철저한 분석으로 미래를 설계합니다.',
        'INTP': '논리적인 사색가 - 비판적 통찰력을 지닌 혁신가이며 호기심이 끝이 없습니다.',
        'ISFJ': '용감한 수호자 - 소중한 이들을 보호하고 헌신하는 따뜻한 심성의 소유자입니다.',
        'ISFP': '호기심 많은 예술가 - 매 순간을 즐기며 새로운 시도를 멈추지 않는 예술가입니다.',
        'ISTJ': '청렴결백한 논리주의자 - 사실에 근거하여 계획을 수행하는 신중한 관리자입니다.',
        'ISTP': '만능 재주꾼 - 무엇이든 만들어내는 탁월한 손재주와 관찰력을 지녔습니다.'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '1000px', margin: 'auto' }}
        >
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <Award size={64} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '10px' }} className="title-gradient">
                        정밀 분석 리포트
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                        <span className="feature-badge" style={{ background: '#fef3c7', color: '#d97706' }}>MBTI: {mbtiType}</span>
                        <span className="feature-badge">Big Five (OCEAN)</span>
                        <span className="feature-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>HEXACO 지표 반영</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px', alignItems: 'start', marginTop: '50px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div className="glass-card" style={{ padding: '30px', background: '#f8fafc', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{mbtiType} 유형 개요</h3>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {mbtiDescriptions[mbtiType] || '당신은 독특하고 창의적인 에너지를 가진 사람입니다.'}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <AnalysisCard icon={<Zap size={20} />} title="OCEAN 지수" desc="개방성, 성실성, 외향성, 우호성, 신경증 수치가 균형 있게 반영되었습니다." />
                            <AnalysisCard icon={<ShieldCheck size={20} />} title="HEXACO 신뢰도" desc="정직-겸손성 지표를 포함하여 더욱 객관적인 분석이 완료되었습니다." />
                        </div>
                    </div>

                    <div style={{ position: 'sticky', top: '20px' }}>
                        <div className="glass-card" style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.02)' }}>
                            <RadarChart data={data} size={400} />
                        </div>

                        <button
                            className="primary"
                            style={{
                                marginTop: '30px', width: '100%', padding: '20px',
                                fontSize: '1.25rem', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '15px', borderRadius: '20px'
                            }}
                            onClick={() => {
                                console.log("Explore button clicked. Calling onExplore()...");
                                onExplore();
                            }}
                        >
                            내 주변 친구들 보러가기 <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AnalysisCard = ({ icon, title, desc }) => (
    <div style={{ display: 'flex', gap: '15px', padding: '20px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '15px' }}>
        <div style={{ color: 'var(--primary)' }}>{icon}</div>
        <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '5px' }}>{title}</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{desc}</p>
        </div>
    </div>
);

const ResultItem = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{value}</span>
    </div>
);

export default ResultReport;
