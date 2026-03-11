import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from './RadarChart';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import useFavorites from '../hooks/useFavorites';
import { analyzeCompatibility } from '../utils/compatibilityAnalysis';
import { generateMatchingInsight } from '../utils/matchingInsightGenerator';
import {
    X, MessageCircle, Heart, Award, User as UserIcon,
    TrendingUp, Sparkles, Camera, Gem, Gamepad2, MapPin,
    ShieldCheck, ShieldAlert
} from 'lucide-react';
import { toggleConnection } from '../supabase/queries';
import useAuthStore from '../store/authStore';
import useCrystalStore from '../store/crystalStore';
import LumiMascot from './LumiMascot';
import IdentityBadge from './IdentityBadge';
import { getAIAdvice } from '../lib/openaiClient';
import { getDeepSoulType, buildCatScores } from '../data/deepSoulTypes';
import { DEEP_QUESTIONS } from '../data/deepQuestions';
import { getSoulType } from '../data/soulTypes';
import AIAvatarGenerator from './AIAvatarGenerator';

const ProfileModal = ({ user, onClose, userData, mbtiType, userName, profile, onStartChat }) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { crystals, giftCrystals } = useCrystalStore();
    const isMyProfile = user === null || user === undefined;
    const displayName = isMyProfile ? userName : user?.name;
    const { user: currentUser } = useAuthStore();

    const displayAge = isMyProfile
        ? (currentUser?.user_metadata?.age || profile?.age)
        : (user?.age || user?.user_metadata?.age);

    const [activeTab, setActiveTab] = useState('profile');
    const [aiReport, setAiReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [giftAmount, setGiftAmount] = useState(10);
    const [currentAvatar, setCurrentAvatar] = useState(profile?.avatar || profile?.avatarUrl || localStorage.getItem('lumini_profile_avatar') || null);

    React.useEffect(() => {
        if (isMyProfile) {
            setCurrentAvatar(profile?.avatar || profile?.avatarUrl || localStorage.getItem('lumini_profile_avatar') || null);
        }
    }, [profile, isMyProfile]);

    // 실제 렌더링 시 사용할 모들은 미리보기 상태에 따라 결정
    const effectiveIsMyProfile = isMyProfile && !isPreviewMode;
    const isUserFavorited = !isMyProfile && user?.id ? isFavorite(user.id) : false;

    // 항상 raw {O,C,E,A,N,H} 에서 9지표 배열로 변환 (Array로 들어와도 재계산)
    const formatPersonalityData = (raw) => {
        if (!raw) return [];
        // raw가 {O,C,E,A,N,H} object인 경우
        const src = Array.isArray(raw) ? null : raw;
        // Array인 경우 묵시적으로 이미 9지표 형식이면 그대로, 아니면 null
        if (Array.isArray(raw) && raw.length === 9 && raw[0]?.subject === '사교성') return raw;
        if (!src) return raw; // 9지표 배열이면 그대로
        const O = src.O || 0, C = src.C || 0, E = src.E || 0;
        const A = src.A || 0, N = src.N || 0, H = src.H || 50;
        return [
            { subject: '사교성', A: Math.round(E), fullMark: 100 },
            { subject: '창의성', A: Math.round(O * 0.6 + E * 0.4), fullMark: 100 },
            { subject: '공감력', A: Math.round(A * 0.6 + (100 - N) * 0.4), fullMark: 100 },
            { subject: '계획성', A: Math.round(C), fullMark: 100 },
            { subject: '자기주도', A: Math.round(C * 0.55 + H * 0.45), fullMark: 100 },
            { subject: '유연성', A: Math.round(O), fullMark: 100 },
            { subject: '따뜻함', A: Math.round(A), fullMark: 100 },
            { subject: '회복탄력', A: Math.round(100 - N), fullMark: 100 },
            { subject: '신뢰도', A: Math.round(H), fullMark: 100 },
        ];
    };

    // personality_data에서도 변환 가능하도록
    const formatFromPersonalityData = (pd) => {
        if (!pd) return [];
        if (Array.isArray(pd)) return formatPersonalityData(pd);
        return formatPersonalityData(pd);
    };

    // MBTI 기반 기본 성향 데이터 생성 (데이터 없을 때 fallback)
    const getMBTIDefaultData = (mbti) => {
        const type = (mbti || 'ISFJ').toUpperCase();
        const E = type[0] === 'E' ? 75 : 35;
        const N = type[1] === 'N' ? 72 : 45;
        const F = type[2] === 'F' ? 78 : 40;
        const J = type[3] === 'J' ? 72 : 55;
        return [
            { subject: '사교성', A: E, fullMark: 100 },
            { subject: '창의성', A: Math.round(N * 0.6 + E * 0.4), fullMark: 100 },
            { subject: '공감력', A: Math.round(F * 0.65 + 35 * 0.35), fullMark: 100 },
            { subject: '계획성', A: J, fullMark: 100 },
            { subject: '자기주도', A: Math.round(J * 0.55 + 50 * 0.45), fullMark: 100 },
            { subject: '유연성', A: Math.round(N * 0.7 + (100 - J) * 0.3), fullMark: 100 },
            { subject: '따뜻함', A: Math.round(F), fullMark: 100 },
            { subject: '회복탄력', A: 65, fullMark: 100 },
            { subject: '신뢰도', A: Math.round(J * 0.6 + 40 * 0.4), fullMark: 100 },
        ];
    };

    const displayData = useMemo(() => {
        // 내 프로필인 경우 userData (raw {O,C,E,A,N,H} 또는 9지표 배열)
        if (isMyProfile) return formatPersonalityData(userData);
        // 상대 프로필: user.personality_data (raw obj) > user.data (배열) 우선순위
        const raw = user?.personality_data || user?.data;
        const formatted = formatPersonalityData(raw);
        // 데이터가 없거나 비어있으면 MBTI 기반 기본값 생성
        if (!formatted || formatted.length === 0) {
            return getMBTIDefaultData(user?.mbti || user?.mbtiType);
        }
        return formatted;
    }, [isMyProfile, userData, user?.personality_data, user?.data, user?.mbti, user?.mbtiType]);

    const myStandardizedData = useMemo(() => {
        const formatted = formatPersonalityData(userData);
        // 내 데이터도 없으면 기본값
        if (!formatted || formatted.length === 0) return getMBTIDefaultData(mbtiType);
        return formatted;
    }, [userData, mbtiType]);


    const compatibilityAnalysis = useMemo(() => {
        if (isMyProfile) return null;
        // 항상 유효한 9지표 배열이 있어야 함
        const myData = myStandardizedData && myStandardizedData.length === 9 ? myStandardizedData : getMBTIDefaultData(mbtiType);
        const theirData = displayData && displayData.length === 9 ? displayData : getMBTIDefaultData(user?.mbti || user?.mbtiType);
        const result = analyzeCompatibility(myData, theirData);

        // 문장형 매칭 인사이트 추가
        const insight = generateMatchingInsight(myData, theirData, result?.overallScore || user?.similarity || 75);

        if (result) return { ...result, matchingInsight: insight };

        // analyzeCompatibility가 null을 반환하면 유사도 기반 보였는 기본값 생성
        const similarity = user?.similarity ? Math.round(user.similarity) : 75;
        return {
            overallScore: similarity,
            dimensions: [
                { dimension: '성격 유형', icon: '📊', similarity, color: '#8B5CF6', level: similarity >= 70 ? 'high' : 'medium', label: similarity >= 70 ? '좋은 조화' : '보완 관계', insight: 'MBTI 유형 기반으로 분석한 결과에요.' },
                { dimension: '소통 방식', icon: '💬', similarity: Math.min(100, similarity + 5), color: '#06B6D4', level: 'medium', label: '조화로운 대화형', insight: '서로다른 소통 스타일이 조널를 이룰 수 있어요.' },
                { dimension: '가치관', icon: '⭐', similarity: Math.max(60, similarity - 8), color: '#F59E0B', level: 'medium', label: '업데이트 예정', insight: '딥소울 검사 후 더 정밀한 분석이 가능해요.' },
            ],
            strengths: [],
            complementary: [],
            advice: null,
            matchingInsight: insight
        };
    }, [isMyProfile, myStandardizedData, displayData, user?.similarity, user?.mbti, user?.mbtiType, mbtiType]);

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
        const type = isMyProfile ? mbtiType : (user?.mbti || user?.mbtiType);
        return getSoulType(type);
    }, [isMyProfile, mbtiType, user?.mbti, user?.mbtiType]);

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

                    <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div className="relative">
                            <div
                                style={{
                                    position: 'relative', width: '130px', height: '130px',
                                    borderRadius: '50%',
                                    cursor: effectiveIsMyProfile ? 'pointer' : 'default',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                    border: '4px solid white',
                                    background: 'var(--surface)'
                                }}
                                onClick={() => { if (effectiveIsMyProfile) setShowAvatarGenerator(true); }}
                                className={effectiveIsMyProfile ? "group relative" : "relative"}
                            >
                                <img
                                    src={currentAvatar || user?.avatar || profile?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${displayName}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', transition: 'transform 0.2s', background: '#f8fafc' }}
                                    className={effectiveIsMyProfile ? "group-hover:scale-105" : ""}
                                />
                                {effectiveIsMyProfile && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-sm pointer-events-none z-20">
                                        <Camera size={24} />
                                        <span>변경</span>
                                    </div>
                                )}
                                {!effectiveIsMyProfile && isUserFavorited && (
                                    <div style={{ position: 'absolute', bottom: '0px', right: '0px', background: '#ef4444', borderRadius: '50%', padding: '8px', border: '3px solid var(--surface)', zIndex: 10, boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
                                        <Heart size={16} color="white" fill="white" />
                                    </div>
                                )}
                                {effectiveIsMyProfile && (
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{
                                            position: 'absolute', bottom: '0px', right: '0px',
                                            width: '38px', height: '38px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366F1, #F43F5E)',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                                            border: '3px solid white', zIndex: 10, cursor: 'pointer'
                                        }}
                                        title="AI 아바타 생성"
                                        className="group-hover:opacity-0 transition-opacity"
                                    >
                                        <Sparkles size={18} color="white" />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>
                                            {effectiveIsMyProfile ? displayName : (isMyProfile ? `${displayName} (미리보기)` : displayName)}
                                        </h2>
                                        {displayAge ? (
                                            <div title="인증된 사용자 연령입니다." style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800 }}>
                                                <ShieldCheck size={15} /> 나이 인증 ({displayAge}세)
                                            </div>
                                        ) : (
                                            <div title="나이 인증이 진행되지 않았습니다." style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fee2e2', color: '#dc2626', padding: '5px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800 }}>
                                                <ShieldAlert size={15} /> 미인증
                                            </div>
                                        )}
                                    </div>
                                    {isMyProfile && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '20px',
                                                    background: isPreviewMode ? 'var(--primary)' : 'var(--background)',
                                                    color: isPreviewMode ? 'white' : 'var(--primary)',
                                                    border: `1.5px solid var(--primary)`, cursor: 'pointer',
                                                    fontWeight: 700, fontSize: '0.85rem'
                                                }}
                                            >
                                                {isPreviewMode ? '편집 모드로' : '타인 시점 미리보기'}
                                            </button>
                                            {!isPreviewMode && (
                                                <button onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('changeStep', { detail: 'profile-edit' })); }} style={{ padding: '8px 16px', borderRadius: '20px', background: 'var(--primary-faint)', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>편집</button>
                                            )}
                                        </div>
                                    )}
                                    {!effectiveIsMyProfile && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                            <button onClick={handleToggleFavorite} style={{ padding: '8px 16px', borderRadius: '20px', background: isUserFavorited ? '#FEF2F2' : 'var(--background)', color: isUserFavorited ? '#EF4444' : 'var(--text)', border: `1.5px solid ${isUserFavorited ? '#FCA5A5' : 'var(--glass-border)'}`, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                                                <Heart size={16} fill={isUserFavorited ? "#EF4444" : "transparent"} /> {isUserFavorited ? '관심 해제' : '관심 표현'}
                                            </button>
                                            <button onClick={() => onStartChat?.(user)} style={{ padding: '8px 16px', borderRadius: '20px', background: 'var(--primary-faint)', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                                                <MessageCircle size={16} /> 대화하기
                                            </button>
                                            <button onClick={() => setShowGiftModal(true)} style={{ padding: '8px 16px', borderRadius: '20px', background: 'linear-gradient(135deg, #A855F7, #EC4899)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(236, 72, 153, 0.2)', transition: 'all 0.2s' }}>
                                                <Gem size={16} fill="white" /> 선물하기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <IdentityBadge type="MBTI" label={isMyProfile ? mbtiType : (user?.mbti || user?.mbtiType)} />
                                <span style={{
                                    padding: '4px 12px',
                                    background: 'var(--primary-faint)',
                                    color: 'var(--primary)',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    border: '1px solid var(--primary-glow)'
                                }}>
                                    {mbtiInfo.soulName}
                                </span>
                                {!effectiveIsMyProfile && (user?.similarity > 85 || isPreviewMode) && <IdentityBadge type="HOT" size="md" />}
                                {(isMyProfile || (user?.id && user.id % 3 === 0)) && <IdentityBadge type="VERIFIED" size="md" />}
                                {isPreviewMode && (
                                    <div style={{ background: '#10b98115', color: '#10b981', padding: '6px 14px', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={16} /> 매칭률 98% (예시)
                                    </div>
                                )}
                            </div>
                            {/* 소울 서랍 (Badge Drawer) */}
                            <div style={{
                                marginTop: '15px', display: 'flex', gap: '8px',
                                borderTop: '1px solid var(--glass-border)', paddingTop: '15px',
                                flexWrap: 'wrap'
                            }}>
                                {user?.game && <IdentityBadge type="GAME" label={user.game} size="sm" />}
                                {user?.tier && <IdentityBadge type="TIER" label={user.tier} size="sm" />}
                                {(isMyProfile ? !!localStorage.getItem('lumini_deep_soul') : !!user?.deep_soul) && (
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #4F46E510, #7C3AED10)',
                                        color: '#6366F1', border: '1.5px solid #6366F120',
                                        fontSize: '0.75rem', fontWeight: 900
                                    }}>
                                        💎 딥소울 인증
                                    </span>
                                )}
                            </div>

                            {/* Bio / 자기소개 */}
                            {(effectiveIsMyProfile ? null : (isMyProfile ? profile?.bio : user?.bio)) ? (
                                <div style={{ marginTop: '14px', padding: '14px 18px', background: 'var(--background)', borderRadius: '14px', border: '1px solid var(--glass-border)', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text)', maxWidth: '420px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>💬 자기소개</span>
                                    {isMyProfile ? profile?.bio : user?.bio}
                                </div>
                            ) : !effectiveIsMyProfile && (
                                <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--background)', borderRadius: '14px', border: '1px dashed var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    아직 자기소개를 작성하지 않았어요 ✏️
                                </div>
                            )}
                            {effectiveIsMyProfile && (
                                <div style={{ marginTop: '14px', padding: '14px 18px', background: 'var(--background)', borderRadius: '14px', border: '1px solid var(--glass-border)', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text)', maxWidth: '420px', cursor: 'pointer' }}
                                    onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('changeStep', { detail: 'profile-edit' })); }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>💬 자기소개</span>
                                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>{profile?.bio || '자기소개를 채워 더 많은 친구를 만나보세요 →'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--glass-border)', overflowX: 'auto' }}>
                        {['profile', 'details', 'analysis', 'interests', 'deep'].map(tab => {
                            const LABELS = { profile: '성향 분석', details: '상세 정보', analysis: 'AI 리포트', interests: '관심사', deep: '💎 딥 소울' };
                            const hasDeepData = isMyProfile ? !!localStorage.getItem('lumini_deep_soul') : !!user?.deep_soul;
                            const isDeepTab = tab === 'deep';
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '14px 0', background: 'none', border: 'none',
                                        borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                                        color: activeTab === tab ? 'var(--primary)' : isDeepTab && !hasDeepData ? '#94A3B8' : 'var(--text-muted)',
                                        fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {LABELS[tab]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div style={{ padding: '0 40px 40px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                {/* 레이더 차트를 2열로 — 오른쪽에는 호환도 */}
                                <div style={{ display: 'grid', gridTemplateColumns: !effectiveIsMyProfile ? '1.2fr 1fr' : '1fr', gap: '30px', alignItems: 'stretch' }}>
                                    <div className="glass-card" style={{ padding: '24px', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <RadarChart
                                            data={displayData}
                                            comparisonData={(!effectiveIsMyProfile && myStandardizedData) ? (isPreviewMode ? displayData : myStandardizedData) : null}
                                            nameA={!effectiveIsMyProfile ? (isMyProfile ? '나 (미리보기)' : (user?.username || '상대방')) : '나'}
                                            nameB={!effectiveIsMyProfile ? '나' : undefined}
                                            size={280}
                                        />
                                    </div>
                                    {!effectiveIsMyProfile && (compatibilityAnalysis || isPreviewMode) && (
                                        <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
                                            <CompatibilityBreakdown analysis={isPreviewMode ? {
                                                overallScore: 98,
                                                dimensions: [
                                                    { dimension: '성격 유형', icon: '📊', similarity: 95, color: '#8B5CF6', level: 'high', label: '완벽한 조화', insight: '서로를 가장 잘 이해할 수 있는 이상적인 관계입니다.' },
                                                    { dimension: '소통 방식', icon: '💬', similarity: 98, color: '#06B6D4', level: 'high', label: '물 흐르듯 편안한 대화', insight: '깊은 속마음까지 부드럽게 나눌 수 있는 파동을 가지고 있어요.' },
                                                    { dimension: '가치관', icon: '⭐', similarity: 90, color: '#F59E0B', level: 'high', label: '같은 방향을 바라보는 사이', insight: '추구하는 가치와 삶의 태도가 매우 유사합니다.' },
                                                ],
                                                matchingInsight: {
                                                    description: "사용자님은 **상대방을 포용하는 부드러운 카리스마**를 가지고 있으며, 특히 **창의적인 문제 해결 방식**이 타인에게 매우 매력적으로 다가갑니다.",
                                                    keyTraits: ['공감능력', '창의적사고', '신뢰감']
                                                }
                                            } : compatibilityAnalysis} />
                                        </div>
                                    )}
                                    {effectiveIsMyProfile && (
                                        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                            {(displayData || []).map((d, i) => (
                                                <div key={i} style={{ padding: '14px', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>{Math.round(d.A)}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.subject}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'details' && (
                            <motion.div key="details" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                <div style={{ display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>

                                    {/* Location Info */}
                                    <div className="glass-card" style={{ padding: '28px', background: 'var(--background)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text)' }}>주 활동 지역</h3>
                                            <p style={{ fontSize: '1.05rem', color: (effectiveIsMyProfile ? profile?.district : user?.district) ? 'var(--text)' : 'var(--text-muted)', fontWeight: 600 }}>
                                                {effectiveIsMyProfile ? (profile?.district || '거주지를 등록하지 않았습니다.') : (user?.district || '비공개이거나 설정하지 않았습니다.')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Game Duo Info */}
                                    <div className="glass-card" style={{ padding: '28px', background: 'var(--background)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                                            <Gamepad2 size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text)' }}>즐겨하는 게임</h3>
                                            {(effectiveIsMyProfile ? profile?.game : user?.game) ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{effectiveIsMyProfile ? profile?.game : user?.game}</span>
                                                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', fontSize: '0.85rem', fontWeight: 800 }}>
                                                        {effectiveIsMyProfile ? profile?.tier : user?.tier}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontWeight: 600 }}>등록된 게임 정보가 없습니다.</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'analysis' && (
                            <motion.div key="analysis" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                {!aiReport && !isGenerating ? (
                                    <div style={{ textAlign: 'center', padding: '60px' }} className="glass-card">
                                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔮</div>
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

                        {activeTab === 'deep' && (
                            <DeepSoulTab
                                isMyProfile={isMyProfile}
                                myDeepData={JSON.parse(localStorage.getItem('lumini_deep_soul') || 'null')}
                                otherDeepData={user?.deep_soul || null}
                                otherName={user?.username || displayName}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Sticky Footer for Actions */}
                {!effectiveIsMyProfile && (
                    <div style={{ padding: '25px 40px', borderTop: '1px solid var(--glass-border)', background: 'var(--surface)', position: 'sticky', bottom: 0, display: 'flex', gap: '20px', zIndex: 100 }}>
                        <button onClick={() => { onStartChat(user); onClose(); }} className="primary" style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', fontSize: '1.1rem', fontWeight: 800 }}>
                            <MessageCircle size={22} /> 대화하기
                        </button>
                        <button onClick={handleToggleFavorite} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', fontSize: '1.05rem', fontWeight: 800, background: isUserFavorited ? '#ef4444' : 'var(--surface)', color: isUserFavorited ? 'white' : '#ef4444', border: '2px solid #ef4444', borderRadius: '15px', cursor: 'pointer', transition: 'all 0.3s' }}>
                            <Heart size={22} fill={isUserFavorited ? 'white' : 'none'} /> {isUserFavorited ? '관심 해제' : '관심 등록'}
                        </button>
                    </div>
                )}

                {/* Gift Modal Overlay */}
                <AnimatePresence>
                    {showGiftModal && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', borderRadius: '40px', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => setShowGiftModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{ background: 'var(--surface)', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            >
                                <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #A855F7, #EC4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(236, 72, 153, 0.3)' }}>
                                    <Gem size={30} fill="white" color="white" />
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '10px', color: 'var(--text)' }}>마음 전하기</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                                    {displayName}님에게 응원의 크리스탈을<br />선물할 수 있어요!
                                </p>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px', background: 'var(--primary-faint)', padding: '6px 16px', borderRadius: '20px', display: 'inline-block' }}>
                                    보유 크리스탈: {crystals}💎
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                                    {[10, 50, 100].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setGiftAmount(amt)}
                                            style={{ flex: 1, padding: '12px 0', borderRadius: '14px', border: `2px solid ${giftAmount === amt ? '#EC4899' : 'var(--glass-border)'}`, background: giftAmount === amt ? 'rgba(236, 72, 153, 0.05)' : 'transparent', color: giftAmount === amt ? '#EC4899' : 'var(--text-muted)', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            {amt}💎
                                        </button>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>직접 입력</label>
                                    <input
                                        type="number"
                                        value={giftAmount}
                                        onChange={(e) => setGiftAmount(Number(e.target.value))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--background)', color: 'var(--text)', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', outline: 'none' }}
                                        min="1"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setShowGiftModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'var(--background)', color: 'var(--text-muted)', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>취소</button>
                                    <button
                                        onClick={() => {
                                            if (giftCrystals(giftAmount)) {
                                                alert(`${displayName}님에게 ${giftAmount} 크리스탈 선물을 보냈습니다! 🎁✨`);
                                                setShowGiftModal(false);
                                            } else {
                                                alert('앗, 보유한 크리스탈이 부족해요! 💎');
                                            }
                                        }}
                                        style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #A855F7, #EC4899)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(236, 72, 153, 0.25)' }}
                                    >선물하기</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* AI Avatar Generator Overlay */}
            {showAvatarGenerator && (
                <AIAvatarGenerator
                    onSelect={(url) => {
                        setCurrentAvatar(url);
                        setShowAvatarGenerator(false);
                        // 실제 앱에서는 여기서 프로필 업데이트 쿼리를 날리거나 전역 상태를 바꿉니다.
                        if (isMyProfile) {
                            const event = new CustomEvent('updateProfileAvatar', { detail: url });
                            window.dispatchEvent(event);
                        }
                    }}
                    onClose={() => setShowAvatarGenerator(false)}
                />
            )}
        </div>
    );
};

export default ProfileModal;

// ============================================================
// 딥 소울 탭 서브컴포넌트
// ============================================================
const DEEP_CAT_META = [
    { prefix: 'r', catId: 'relationship', label: '💑 연애 & 관계 스타일', color: '#EC4899', desc: '연락 빈도, 갈등 해결 방식, 관계의 깊이' },
    { prefix: 'l', catId: 'lifestyle', label: '🌿 라이프스타일', color: '#10B981', desc: '음주·흡연·운동·종교·아침형/저녁형' },
    { prefix: 'f', catId: 'family', label: '🏠 가족관 & 미래 계획', color: '#F59E0B', desc: '결혼관, 자녀, 경제 기반, 거주 지역' },
    { prefix: 'v', catId: 'values', label: '🌍 가치관 & 세계관', color: '#6366F1', desc: '성평등, 환경, 정치 성향, 다양성' },
];

const calcCatScore = (myData, otherData, prefix) => {
    if (!myData || !otherData) return null;
    const myKeys = Object.keys(myData).filter(k => k.startsWith(prefix));
    if (myKeys.length === 0) return null;
    const totalDiff = myKeys.reduce((acc, k) => acc + Math.abs((myData[k] || 2) - (otherData[k] || 2)), 0);
    return Math.round(100 - (totalDiff / (myKeys.length * 4)) * 100);
};

const DeepSoulTab = ({ isMyProfile, myDeepData, otherDeepData, otherName }) => {
    const bothHaveData = !!myDeepData && !!otherDeepData;
    const targetData = isMyProfile ? myDeepData : otherDeepData;

    // 유형 계산
    const myCatScores = useMemo(() => myDeepData ? buildCatScores(myDeepData, DEEP_QUESTIONS) : {}, [myDeepData]);
    const otherCatScores = useMemo(() => otherDeepData ? buildCatScores(otherDeepData, DEEP_QUESTIONS) : {}, [otherDeepData]);

    if (!myDeepData && isMyProfile) {
        return (
            <motion.div key="deep" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💎</div>
                    <h4 style={{ fontWeight: 900, marginBottom: '10px' }}>딥 소울 검사를 해보세요</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>가족관, 연애관, 가치관까지 맞는 인연을 찾을 수 있어요.</p>
                </div>
            </motion.div>
        );
    }

    if (!isMyProfile && !otherDeepData) {
        return (
            <motion.div key="deep" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
                    <h4 style={{ fontWeight: 900, marginBottom: '10px' }}>{otherName}님은 아직 딥 소울 검사를 완료하지 않았어요</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>상대방이 검사를 완료하면 가치관 유형 비교를 확인할 수 있어요.</p>
                </div>
            </motion.div>
        );
    }

    const overallScore = bothHaveData && !isMyProfile
        ? Math.round(DEEP_CAT_META.reduce((acc, cat) => acc + (calcCatScore(myDeepData, otherDeepData, cat.prefix) || 70), 0) / DEEP_CAT_META.length)
        : null;

    const displayScores = isMyProfile ? myCatScores : otherCatScores;

    return (
        <motion.div key="deep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '14px', paddingTop: '4px' }}>
            {overallScore !== null && (
                <div style={{ padding: '20px 24px', borderRadius: '20px', background: 'linear-gradient(135deg, #4F46E512, #7C3AED10)', border: '1.5px solid #7C3AED20', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '4px' }}>종합 가치관 호환도</div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#6366F1' }}>{overallScore}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>가치관이 일치하는 정도</div>
                </div>
            )}

            {DEEP_CAT_META.map(cat => {
                const compatPct = bothHaveData && !isMyProfile ? calcCatScore(myDeepData, otherDeepData, cat.prefix) : null;
                const score = displayScores[cat.catId] ?? 50;
                const myType = myCatScores[cat.catId] !== undefined ? getDeepSoulType(cat.catId, myCatScores[cat.catId]) : null;
                const otherType = otherCatScores[cat.catId] !== undefined ? getDeepSoulType(cat.catId, otherCatScores[cat.catId]) : null;
                const showType = isMyProfile ? myType : otherType;

                return (
                    <div key={cat.prefix} style={{ padding: '16px 20px', borderRadius: '16px', background: `${cat.color}08`, border: `1.5px solid ${cat.color}25` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)', marginBottom: '2px' }}>{cat.label}</div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{cat.desc}</div>
                            </div>
                            {/* 유형 뱃지 */}
                            {showType && (
                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: cat.color, background: `${cat.color}18`, padding: '4px 10px', borderRadius: '20px' }}>
                                        {showType.emoji} {showType.label}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 상대방 유형 vs 내 유형 비교 (both) */}
                        {bothHaveData && !isMyProfile && myType && otherType && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ padding: '8px 10px', borderRadius: '12px', background: 'var(--background)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '3px' }}>나</div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: cat.color }}>{myType.emoji} {myType.label}</div>
                                </div>
                                <div style={{ padding: '8px 10px', borderRadius: '12px', background: 'var(--background)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{otherName}</div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: cat.color }}>{otherType.emoji} {otherType.label}</div>
                                </div>
                            </div>
                        )}

                        {/* 호환도 바 or 성향 바 */}
                        {compatPct !== null ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>호환도</span>
                                    <span style={{ fontSize: '0.92rem', fontWeight: 900, color: cat.color }}>{compatPct}%</span>
                                </div>
                                <div style={{ height: '5px', background: 'var(--glass-border)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${compatPct}%` }}
                                        transition={{ duration: 0.7 }}
                                        style={{ height: '100%', background: cat.color, borderRadius: '100px' }}
                                    />
                                </div>
                            </>
                        ) : showType && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{showType.desc}</p>
                        )}
                    </div>
                );
            })}
        </motion.div>
    );
};
