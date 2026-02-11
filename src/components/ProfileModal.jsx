import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from './RadarChart';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import useFavorites from '../hooks/useFavorites';
import { analyzeCompatibility } from '../utils/compatibilityAnalysis';
import {
    X, MessageCircle, Heart, Award, User as UserIcon,
    Edit3, Save, Settings, Trash2, LogOut, Shield,
    Star, TrendingUp, Calendar, Tag
} from 'lucide-react';
import { toggleConnection } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const ProfileModal = ({ user, onClose, userData, mbtiType, userName, selectedInterests, onResetData, onStartChat }) => {
    // Favorites Hook
    const { toggleFavorite, isFavorite } = useFavorites();

    // user가 null/undefined이면 "내 정보" 모달로 표시
    const isMyProfile = user === null || user === undefined;
    const displayName = isMyProfile ? userName : user?.name;
    const displayData = isMyProfile ? userData : user?.data;

    // 편집 모드 상태
    const [isEditing, setIsEditing] = useState(false);
    const [editedBio, setEditedBio] = useState('안녕하세요! Lumini를 통해 진정한 인연을 찾고 있습니다. 🌟');
    const [activeTab, setActiveTab] = useState('profile'); // profile, interests, settings

    // 관심 등록 여부 확인 (다른 사람 프로필일 때만)
    const isUserFavorited = !isMyProfile && user?.id ? isFavorite(user.id) : false;

    // 관심 등록/해제 핸들러
    const handleToggleFavorite = async () => {
        if (!isMyProfile && user?.id) {
            const { user: currentUser } = useAuthStore.getState();

            if (currentUser) {
                try {
                    const result = await toggleConnection(currentUser.id, user.id, user.similarity);
                    toggleFavorite(user.id); // Also update local store for UI reactivity

                    if (result.status === 'deleted') {
                        alert(`${user.name}님을 관심 목록에서 제거했습니다.`);
                    } else {
                        alert(`${user.name}님을 관심 목록에 추가했습니다!`);
                    }
                } catch (err) {
                    console.error('Connection toggle error:', err);
                    alert('연결 처리 중 오류가 발생했습니다.');
                }
            } else {
                // Not logged in - just use local storage
                toggleFavorite(user.id);
                if (isUserFavorited) {
                    alert(`${user.name}님을 관심 목록에서 제거했습니다.`);
                } else {
                    alert(`${user.name}님을 관심 목록에 추가했습니다! (로그인하시면 더 많은 기능을 이용할 수 있습니다)`);
                }
            }
        }
    };

    if (!displayData) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ width: '90%', maxWidth: '500px', padding: '40px', textAlign: 'center', background: 'var(--surface)', position: 'relative' }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
                        <X size={24} />
                    </button>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        아직 성격 진단을 완료하지 않으셨습니다.<br />
                        먼저 성격 진단을 진행해주세요!
                    </p>
                </motion.div>
            </div>
        );
    }

    // MBTI 설명 가져오기
    const getMBTIDescription = () => {
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
        return mbtis[mbtiType] || { name: '알 수 없음', emoji: '❓' };
    };

    const mbtiInfo = getMBTIDescription();

    // 성향 점수 요약
    const getPersonalitySummary = () => {
        if (!displayData || displayData.length === 0) return [];

        return displayData.map(item => ({
            name: item.subject,
            score: item.A,
            level: item.A >= 70 ? '높음' : item.A >= 30 ? '중간' : '낮음',
            color: item.A >= 70 ? '#10b981' : item.A >= 30 ? '#3b82f6' : '#f59e0b'
        }));
    };

    const personalitySummary = getPersonalitySummary();

    // 호환성 분석 (다른 사람 프로필일 때만)
    const compatibilityAnalysis = useMemo(() => {
        if (isMyProfile || !userData || !displayData) {
            return null;
        }
        return analyzeCompatibility(userData, displayData);
    }, [isMyProfile, userData, displayData]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    background: 'var(--surface)',
                    borderRadius: '30px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'sticky',
                        top: '20px',
                        right: '20px',
                        float: 'right',
                        background: 'var(--background)',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text)',
                        zIndex: 10,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div style={{ padding: '40px 40px 30px 40px', textAlign: 'center' }}>
                    {/* Profile Picture */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}>
                        <UserIcon size={60} color="white" />
                    </div>

                    {/* Name */}
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text)' }}>
                        {displayName}
                    </h2>

                    {isMyProfile && (
                        <button
                            onClick={() => {
                                onClose();
                                // This assumes we have a way to trigger step change in App.jsx
                                // Since we don't pass setStep, we might need a prop or to use an event
                                window.dispatchEvent(new CustomEvent('changeStep', { detail: 'profile-edit' }));
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto 20px',
                                padding: '8px 16px', borderRadius: '20px', background: 'var(--primary-faint)',
                                color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            <Edit3 size={16} /> 프로필 편집하기
                        </button>
                    )}

                    {/* MBTI Badge & Similarity */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        {isMyProfile && mbtiType && (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                marginBottom: '15px'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>{mbtiInfo.emoji}</span>
                                <div>
                                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>{mbtiType}</p>
                                    <p style={{ color: '#4a5568', fontSize: '0.9rem', margin: 0 }}>{mbtiInfo.name}</p>
                                </div>
                            </div>
                        )}
                        {!isMyProfile && (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#10b98115',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                marginBottom: '15px'
                            }}>
                                <TrendingUp size={20} color="#10b981" />
                                <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>성향 일치도 {user.similarity}%</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '0 40px 40px 40px' }}>
                    {/* Profile Content */}
                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>
                            📊 {isMyProfile ? '나의 성향 분석' : '성향 분석 비교'}
                        </h3>

                        {/* Radar Chart */}
                        <div style={{
                            background: 'var(--background)',
                            padding: '30px',
                            borderRadius: '20px',
                            marginBottom: '30px'
                        }}>
                            <RadarChart
                                data={displayData}
                                comparisonData={!isMyProfile && userData ? userData : null}
                                size={280}
                            />
                        </div>
                        {!isMyProfile && userData && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '20px',
                                marginTop: '10px',
                                fontSize: '0.85rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#ec4899', borderRadius: '50%' }}></div>
                                    <span style={{ color: '#64748b' }}>{displayName}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '50%' }}></div>
                                    <span style={{ color: '#64748b' }}>나</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Compatibility Breakdown - 다른 사람 프로필일 때만 표시 */}
                    {!isMyProfile && compatibilityAnalysis && (
                        <CompatibilityBreakdown analysis={compatibilityAnalysis} />
                    )}
                </div>

                {/* Action Buttons (Footer) - 다른 사람 프로필일 때만 표시 */}
                {!isMyProfile && (
                    <div style={{
                        padding: '20px 40px',
                        borderTop: '1px solid var(--glass-border)',
                        display: 'flex',
                        gap: '15px',
                        background: 'var(--surface)',
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 10
                    }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (onStartChat) {
                                    onStartChat(user);
                                    onClose();
                                } else {
                                    alert('대화 시작하기 기능은 곧 추가됩니다!');
                                }
                            }}
                            className="primary"
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '16px',
                                fontSize: '1rem',
                                fontWeight: 700
                            }}
                        >
                            <MessageCircle size={20} />
                            대화 시작하기
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleToggleFavorite}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '16px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                background: isUserFavorited ? '#ef4444' : 'var(--surface)',
                                color: isUserFavorited ? 'white' : '#ef4444',
                                border: `2px solid #ef4444`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Heart size={20} fill={isUserFavorited ? 'white' : 'none'} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{isUserFavorited ? '관심 해제' : '관심 등록'}</span>
                                {!isUserFavorited && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>NEW 기능!</span>}
                            </div>
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProfileModal;
