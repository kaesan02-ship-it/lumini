import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from './RadarChart';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import useFavorites from '../hooks/useFavorites';
import { analyzeCompatibility } from '../utils/compatibilityAnalysis';
import {
    X, MessageCircle, Heart, Award, User as UserIcon,
    Edit3, Save, TrendingUp, Sparkles, Tag
} from 'lucide-react';
import { toggleConnection } from '../supabase/queries';
import useAuthStore from '../store/authStore';
import LumiMascot from './LumiMascot';
import { getAIAdvice } from '../lib/openaiClient';

const ProfileModal = ({ user, onClose, userData, mbtiType, userName, onStartChat }) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const isMyProfile = user === null || user === undefined;
    const displayName = isMyProfile ? userName : user?.name;

    const [activeTab, setActiveTab] = useState('profile');
    const [aiReport, setAiReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const isUserFavorited = !isMyProfile && user?.id ? isFavorite(user.id) : false;

    const formatPersonalityData = (raw) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        return [
            { subject: '개방성', A: raw.O || 0, fullMark: 100 },
            { subject: '성실성', A: raw.C || 0, fullMark: 100 },
            { subject: '외향성', A: raw.E || 0, fullMark: 100 },
            { subject: '우호성', A: raw.A || 0, fullMark: 100 },
            { subject: '신경증', A: raw.N || 0, fullMark: 100 },
            { subject: '정직성', A: raw.H || 50, fullMark: 100 },
        ];
    };

    const displayData = useMemo(() => {
        const raw = isMyProfile ? userData : user?.data;
        return formatPersonalityData(raw);
    }, [isMyProfile, userData, user?.data]);

    const myStandardizedData = useMemo(() => formatPersonalityData(userData), [userData]);

    const compatibilityAnalysis = useMemo(() => {
        if (isMyProfile || !myStandardizedData || !displayData) return null;
        return analyzeCompatibility(myStandardizedData, displayData);
    }, [isMyProfile, myStandardizedData, displayData]);

    const handleGenerateAIReport = async () => {
        setIsGenerating(true);
        const report = await getAIAdvice(mbtiType, isMyProfile ? userData : (user?.personality_data || user?.data));
        setAiReport(report);
        setIsGenerating(false);
        setActiveTab('analysis');
    };

    const handleToggleFavorite = async () => {
        if (!isMyProfile && user?.id) {
            const { user: currentUser } = useAuthStore.getState();
            if (currentUser) {
                try {
                    await toggleConnection(currentUser.id, user.id, user.similarity);
                    toggleFavorite(user.id);
                } catch (err) {
                    console.error('Connection toggle error:', err);
                }
            } else {
                toggleFavorite(user.id);
            }
        }
    };

    const mbtiInfo = useMemo(() => {
        const mbtis = {
            'ENFJ': { name: '정의로운 사회운동가', emoji: '🌟' },
            'ENFP': { name: '재기발랄한 활동가', emoji: '🎨' },
            'ENTJ': { name: '대담한 통솔자', emoji: '👑' },
            'ENTP': { name: '뜨거운 논쟁을 즐기는 변론가', emoji: '💡' },
            'ESFJ': { name: '사교적인 외교관', emoji: '🤝' },
            'ESFP': { name: '자유로운 영혼의 연예인', emoji: '🎭' },
            'ESTJ': { name: '엄격한 관리자', emoji: '📋' },
            'ESTP': { name: '모험을 즐기는 사업가', emoji: '🚀' },
            'INFJ': { name: '선의의 옹호자', emoji: '🌙' },
            'INFP': { name: '열정적인 중재자', emoji: '🦋' },
            'INTJ': { name: '용의주도한 전략가', emoji: '🧠' },
            'INTP': { name: '논리적인 사색가', emoji: '🔬' },
            'ISFJ': { name: '용감한 수호자', emoji: '🛡️' },
            'ISFP': { name: '호기심 많은 예술가', emoji: '🎨' },
            'ISTJ': { name: '청렴결백한 논리주의자', emoji: '📚' },
            'ISTP': { name: '만능 재주꾼', emoji: '🔧' }
        };
        const type = isMyProfile ? mbtiType : user?.mbti;
        return mbtis[type] || { name: '알 수 없음', emoji: '❓' };
    }, [isMyProfile, mbtiType, user?.mbti]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card"
                style={{
                    width: '100%', maxWidth: '850px', background: 'var(--surface)',
                    borderRadius: '35px', maxHeight: '92vh', overflowY: 'auto', position: 'relative',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)'
                }}
            >
                {/* Header Section */}
                <div style={{ padding: '40px', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '30px', right: '30px', background: 'var(--background)', border: 'none', cursor: 'pointer', color: 'var(--text)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <X size={24} />
                    </button>

                    <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ position: 'relative' }}>
                            <LumiMascot
                                mbti={isMyProfile ? mbtiType : user?.mbti}
                                personalityData={isMyProfile ? userData : user?.data}
                                size={180}
                            />
                            <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '45px', height: '45px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '3px solid var(--primary)' }}>
                                <UserIcon size={24} color="var(--primary)" />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>{displayName}</h2>
                                {isMyProfile && (
                                    <button onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('changeStep', { detail: 'profile-edit' })); }} style={{ padding: '8px 16px', borderRadius: '20px', background: 'var(--primary-faint)', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>편집</button>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ background: 'var(--primary-faint)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{mbtiInfo.emoji}</span> {isMyProfile ? mbtiType : user?.mbti}
                                </div>
                                {!isMyProfile && (
                                    <div style={{ background: '#10b98115', color: '#10b981', padding: '6px 14px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={16} /> 매칭률 {user.similarity}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid var(--glass-border)' }}>
                        {['profile', 'analysis', 'interests'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '15px 0', background: 'none', border: 'none',
                                    borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: 800, cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s'
                                }}
                            >
                                {tab === 'profile' ? '성향 분석' : tab === 'analysis' ? 'AI 심층 리포트' : '관심사'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div style={{ padding: '0 40px 40px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
                                    <div className="glass-card" style={{ padding: '30px', background: 'var(--background)' }}>
                                        <RadarChart
                                            data={displayData}
                                            comparisonData={!isMyProfile && myStandardizedData ? myStandardizedData : null}
                                            size={320}
                                        />
                                        {!isMyProfile && (
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '12px', height: '12px', background: '#ec4899', borderRadius: '50%' }}></div>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{displayName}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '50%' }}></div>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>나</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {!isMyProfile && compatibilityAnalysis && (
                                            <CompatibilityBreakdown analysis={compatibilityAnalysis} />
                                        )}
                                        {isMyProfile && (
                                            <div className="glass-card" style={{ padding: '25px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <h4 style={{ marginBottom: '15px', fontWeight: 800 }}>내 성향 요약</h4>
                                                <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
                                                    {mbtiType} 타입인 당신은 <span style={{ color: 'var(--primary)', fontWeight: 700 }}>주요 강점</span>들을 바탕으로 루미니에서 멋진 인연들을 만날 준비가 되어 있습니다.
                                                    상대방과의 성향 차트를 비교해보며 서로의 보완적인 매력을 확인해보세요!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'analysis' && (
                            <motion.div key="analysis" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                {!aiReport && !isGenerating ? (
                                    <div style={{ textAlign: 'center', padding: '60px' }} className="glass-card">
                                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧠</div>
                                        <h3 style={{ marginBottom: '12px', fontWeight: 800 }}>지능형 매칭 분석</h3>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>OpenAI GPT-4o가 성격 데이터를 정밀 분석하여<br />관계 조언과 성찰 포인트를 제공합니다.</p>
                                        <button onClick={handleGenerateAIReport} className="primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>분석 리포트 생성 (AI)</button>
                                    </div>
                                ) : isGenerating ? (
                                    <div style={{ textAlign: 'center', padding: '80px' }}>
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ fontSize: '4rem', marginBottom: '30px', display: 'inline-block' }}>🌀</motion.div>
                                        <h3 style={{ fontWeight: 800 }}>심리학 알고리즘 분석 중...</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>잠시만 기다려주세요. 루미니 AI가 최적의 관계 전략을 도출하고 있습니다.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '25px' }}>
                                        <div className="glass-card" style={{ padding: '30px', background: 'var(--primary-faint)', border: 'none' }}>
                                            <h4 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
                                                <Award size={22} /> 맞춤형 성찰 가이드
                                            </h4>
                                            <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text)' }}>{aiReport.analysis}</p>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                            <div className="glass-card" style={{ padding: '25px', border: '1px solid #10b98120' }}>
                                                <h5 style={{ color: '#10b981', marginBottom: '15px', fontWeight: 800, fontSize: '1.1rem' }}>✨ 핵심 강점</h5>
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {aiReport.strengths.map((s, i) => (
                                                        <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                                                            <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div> {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="glass-card" style={{ padding: '25px', border: '1px solid #f59e0b20' }}>
                                                <h5 style={{ color: '#f59e0b', marginBottom: '15px', fontWeight: 800, fontSize: '1.1rem' }}>⚠️ 상호 보완점</h5>
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {aiReport.cautions.map((c, i) => (
                                                        <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                                                            <div style={{ width: '6px', height: '6px', background: '#f59e0b', borderRadius: '50%' }}></div> {c}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'interests' && (
                            <motion.div key="interests" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏷️</div>
                                    <h4 style={{ marginBottom: '15px', fontWeight: 800 }}>관심사 & 태그</h4>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>공통 관심사를 기반으로 더 깊은 대화를 나눠보세요.</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                                        {['독서', '여행', '음악', '게임', '코딩'].map(tag => (
                                            <span key={tag} style={{ padding: '8px 20px', borderRadius: '20px', background: '#f8fafc', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--glass-border)' }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sticky Footer for Actions */}
                {!isMyProfile && (
                    <div style={{ padding: '25px 40px', borderTop: '1px solid var(--glass-border)', background: 'var(--surface)', position: 'sticky', bottom: 0, display: 'flex', gap: '20px', zIndex: 100 }}>
                        <button onClick={() => { onStartChat(user); onClose(); }} className="primary" style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', fontSize: '1.1rem', fontWeight: 800 }}>
                            <MessageCircle size={22} /> 대화하기
                        </button>
                        <button onClick={handleToggleFavorite} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', fontSize: '1.05rem', fontWeight: 800, background: isUserFavorited ? '#ef4444' : 'var(--surface)', color: isUserFavorited ? 'white' : '#ef4444', border: '2px solid #ef4444', borderRadius: '15px', cursor: 'pointer', transition: 'all 0.3s' }}>
                            <Heart size={22} fill={isUserFavorited ? 'white' : 'none'} /> {isUserFavorited ? '관심 해제' : '관심 등록'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProfileModal;
