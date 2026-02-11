import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from '../components/RadarChart';
import PersonalityExplanation from '../components/PersonalityExplanation';
import { Sparkles, ArrowRight, CheckCircle2, Award, Zap, Heart, ShieldCheck, Share2, Download, Gamepad2, Users } from 'lucide-react';

const ResultReport = ({ data, mbtiType, onExplore }) => {
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("성격 데이터 분석 중...");

    useEffect(() => {
        const messages = [
            "성격 데이터 분석 중...",
            "MBTI 유형 매칭 중...",
            "최적의 인연 찾는 중...",
            "결과 생성 완료!"
        ];

        let index = 0;
        const interval = setInterval(() => {
            index++;
            if (index < messages.length) {
                setLoadingText(messages[index]);
            } else {
                clearInterval(interval);
                setLoading(false);
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    // 소셜 공유 기능
    const handleShare = async () => {
        const shareData = {
            title: 'Lumini 성격 진단 결과',
            text: `나는 ${mbtiType}! 나와 맞는 친구를 찾아보세요 ✨`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: 클립보드에 복사
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('링크가 클립보드에 복사되었습니다!');
            }
        } catch (error) {
            console.error('공유 실패:', error);
        }
    };

    if (loading) {
        return (
            <div style={{
                height: '80vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center'
            }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    style={{ marginBottom: '40px' }}
                >
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '30px',
                        background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
                    }}>
                        <Sparkles size={50} color="white" />
                    </div>
                </motion.div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px' }}>{loadingText}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>당신만의 특별한 성격 리포트를 구성하고 있습니다.</p>

                <div style={{ width: '100%', maxWidth: '400px', height: '10px', background: '#f1f5f9', borderRadius: '5px', marginTop: '50px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.8 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)' }}
                    />
                </div>
            </div>
        );
    }

    const mbtis = {
        'ENFJ': { name: '정의로운 사회운동가', desc: '온화하며 진심으로 타인을 생각하는 타고난 리더입니다.', color: '#ef4444' },
        'ENFP': { name: '재기발랄한 활동가', desc: '자유로운 영혼이며 항상 주변에 웃음과 에너지를 전파합니다.', color: '#f59e0b' },
        'ENTJ': { name: '대담한 통솔자', desc: '미래를 설계하며 효율적으로 목표를 달성하는 철저한 전략가입니다.', color: '#3b82f6' },
        'ENTP': { name: '뜨거운 논쟁을 즐기는 변론가', desc: '지적 호기심이 매우 많고 기존의 틀을 깨는 혁신가입니다.', color: '#a855f7' },
        'ESFJ': { name: '사교적인 외교관', desc: '주변 사람을 꼼꼼하게 잘 챙기며 공동체의 조화를 최우선으로 합니다.', color: '#ec4899' },
        'ESFP': { name: '자유로운 영혼의 연예인', desc: '지금 이 순간을 즐기며 사람들을 기쁘게 하는 마법 같은 매력의 소유자입니다.', color: '#f97316' },
        'ESTJ': { name: '엄격한 관리자', desc: '질서와 전통을 소중히 여기며 정직한 노력을 통해 결과를 만들어냅니다.', color: '#64748b' },
        'ESTP': { name: '모험을 즐기는 사업가', desc: '넘치는 에너지로 복잡한 문제를 즉각적으로 해결하는 실천가입니다.', color: '#10b981' },
        'INFJ': { name: '선의의 옹호자', desc: '조용하고 신비로운 통찰력을 지닌 인류애 넘치는 이상주의자입니다.', color: '#14b8a6' },
        'INFP': { name: '열정적인 중재자', desc: '상냥하고 이타적인 마음을 가진, 예술적 감각이 뛰어난 따뜻한 영혼입니다.', color: '#8b5cf6' },
        'INTJ': { name: '용의주도한 전략가', desc: '독창적인 아이디어와 철저한 분석능력으로 미래를 한 수 앞섭니다.', color: '#6366f1' },
        'INTP': { name: '논리적인 사색가', desc: '비판적 통찰력을 지닌 고독한 혁신가이며 호기심이 끝이 없습니다.', color: '#06b6d4' },
        'ISFJ': { name: '용감한 수호자', desc: '소중한 이들을 보호하고 헌신하는 조용하지만 강한 따뜻함의 소유자입니다.', color: '#fb7185' },
        'ISFP': { name: '호기심 많은 예술가', desc: '매 순간을 오감으로 즐기며 새로운 시도를 두려워하지 않는 모험가입니다.', color: '#facc15' },
        'ISTJ': { name: '청렴결백한 논리주의자', desc: '사실과 데이터에 충실하며 맡은 바 책임을 끝까지 완수하는 관리자입니다.', color: '#475569' },
        'ISTP': { name: '만능 재주꾼', desc: '도구를 다루는 손재주와 냉철한 이성을 겸비한 실용적인 기술자입니다.', color: '#22c55e' }
    };

    const currentMbti = mbtis[mbtiType] || { name: '신비로운 탐험가', desc: '당신만의 특별한 매력을 가진 미지의 탐험가입니다.', color: '#8b5cf6' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '1100px', margin: 'auto', paddingBottom: '100px' }}
        >
            {/* Top Badge Section */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)',
                        padding: '10px 20px', borderRadius: '30px', fontWeight: 800, fontSize: '0.9rem'
                    }}
                >
                    <CheckCircle2 size={18} /> 정밀 진단 시스템 검증 완료
                </motion.div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.15)' }}>
                {/* Visual Header Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

                    {/* Left: Shareable Card Section */}
                    <div style={{ padding: '60px', background: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ width: '12px', height: '40px', background: currentMbti.color, borderRadius: '6px' }}></div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{mbtiType}</h2>
                        </div>

                        <div className="glass-card" style={{ padding: '40px', background: '#fcfaff', border: '1px solid #f5f3ff', marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text)' }}>
                                {currentMbti.name}
                            </h3>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0' }}>
                                "{currentMbti.desc}"
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <AnalysisCard
                                icon={<Zap size={20} color="#8b5cf6" />}
                                title="에너지 효율"
                                desc={`${data.E > 50 ? '사회적 활력' : '내면적 집중'} 우세`}
                            />
                            <AnalysisCard
                                icon={<ShieldCheck size={20} color="#10b981" />}
                                title="정직/신뢰"
                                desc={`${data.H > 70 ? '매우 높음' : '평균 수준'}`}
                            />
                        </div>

                        <div style={{ marginTop: '50px', display: 'flex', gap: '15px' }}>
                            <button
                                onClick={handleShare}
                                aria-label="SNS에 결과 공유하기"
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', background: 'white',
                                    fontWeight: 700, cursor: 'pointer'
                                }}>
                                <Share2 size={18} /> SNS 공유하기
                            </button>
                            <button style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', background: 'white',
                                fontWeight: 700, cursor: 'pointer'
                            }}>
                                <Download size={18} /> 카드 저장
                            </button>
                        </div>
                    </div>

                    {/* Right: Radar Chart Visual Section */}
                    <div style={{
                        padding: '60px',
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            background: 'white', padding: '30px', borderRadius: '40px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative'
                        }}>
                            <RadarChart data={data} size={380} />
                            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                <Award size={32} color="var(--primary)" style={{ opacity: 0.4 }} />
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                MBTI + OCEAN + HEXACO 통합 성향 지도
                            </p>
                        </div>
                    </div>
                </div>

                {/* Personality Explanation Section */}
                <PersonalityExplanation data={data} />

                {/* 확장 기능 안내 */}
                <div style={{ marginTop: '80px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '50px' }}>🚀 Lumini와 함께 시작하세요</h2>
                </div>

                {/* Footer Action Banner */}
                <div style={{
                    padding: '40px 60px', background: 'rgba(139, 92, 246, 0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid rgba(139, 92, 246, 0.1)'
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>분석이 완료되었습니다! 🏁</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>지금 당신과 찰떡궁합인 친구들이 대시보드에서 기다리고 있어요.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <motion.button
                            whileHover={{ x: 5 }}
                            className="primary"
                            style={{
                                padding: '18px 40px', fontSize: '1.1rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '18px'
                            }}
                            onClick={onExplore}
                        >
                            인연 찾으러 가기 <ArrowRight size={20} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Expansion Hint Section (Leo's Idea) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '40px' }}>
                <ExpansionCard icon={<Heart size={20} color="#ec4899" />} title="운명의 연인 찾기" />
                <ExpansionCard icon={<Gamepad2 size={20} color="#8b5cf6" />} title="게임 듀오 탐색" />
                <ExpansionCard icon={<Users size={20} color="#3b82f6" />} title="취미 소모임 하이브" />
            </div>
        </motion.div>
    );
};

const AnalysisCard = ({ icon, title, desc }) => (
    <div style={{
        display: 'flex', gap: '12px', padding: '15px', background: '#f8fafc',
        border: '1px solid #f1f5f9', borderRadius: '15px', alignItems: 'center'
    }}>
        <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            {icon}
        </div>
        <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '2px', color: 'var(--text)' }}>{title}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</p>
        </div>
    </div>
);

const ExpansionCard = ({ icon, title }) => (
    <div className="glass-card" style={{
        padding: '20px', display: 'flex', alignItems: 'center', gap: '12px',
        justifyContent: 'center', opacity: 0.7, cursor: 'not-allowed'
    }}>
        {icon}
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{title}</span>
        <span style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>Soon</span>
    </div>
);

export default ResultReport;
