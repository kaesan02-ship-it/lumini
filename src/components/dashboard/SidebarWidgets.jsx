import React from 'react';
import { motion } from 'framer-motion';
import Tooltip from '../Tooltip';

const SidebarWidgets = ({ hasDeepSoul, nearbyUsers, onSelectUser, onNavigate }) => {
    const pet = (() => { try { return JSON.parse(localStorage.getItem('lumini_soul_pet') || '{}'); } catch { return {}; } })();
    
    // Mock Deep Soul Matches
    const deepMatches = [
        { name: '김민수', mbti: 'INTJ', soulScore: 83, cats: [{ label: '💑 연애', score: 88 }, { label: '🌿 라이프', score: 79 }, { label: '🏠 가족관', score: 91 }, { label: '🌍 가치관', score: 75 }], district: '서울 마포구', emoji: '♟️', userId: 'u2' },
        { name: '박서연', mbti: 'ENTP', soulScore: 71, cats: [{ label: '💑 연애', score: 60 }, { label: '🌿 라이프', score: 73 }, { label: '🏠 가족관', score: 58 }, { label: '🌍 가치관', score: 82 }], district: '서울 강남구', emoji: '🎨', userId: 'u4' },
        { name: '최도현', mbti: 'INFP', soulScore: 78, cats: [{ label: '💑 연애', score: 82 }, { label: '🌿 라이프', score: 71 }, { label: '🏠 가족관', score: 88 }, { label: '🌍 가치관', score: 70 }], district: '서울 마포구', emoji: '🌙', userId: 'u5' },
    ];

    return (
        <div className="right-panel">
            <div className="sidebar-widget-grid">
                <Tooltip text="나의 소울 상태를 함께 나누는 반려동물 루미를 돌봅니다." position="top">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate?.('soul-pet')}
                        className="widget-card"
                        style={{ background: 'linear-gradient(135deg, #F0ABFC20, #E879F920)', border: '1.5px solid #C026D340' }}
                    >
                        <div style={{ fontSize: '2rem' }}>🦦</div>
                        <div style={{ fontWeight: 900, fontSize: '0.88rem', color: '#A21CAF' }}>
                            {pet.name || '루미'} <span style={{ fontSize: '0.72rem', background: '#C026D318', borderRadius: '100px', padding: '1px 7px' }}>Lv.{pet.level || 1}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#86198F', fontWeight: 600 }}>소울펫 돌보기 →</div>
                    </motion.div>
                </Tooltip>

                <Tooltip text="가치관 검사(딥 소울)를 통해 더 깊은 인연을 찾아보세요." position="top">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate?.(hasDeepSoul ? 'deep-soul-result' : 'deep-soul-test')}
                        className="widget-card"
                        style={{ border: `1.5px solid ${hasDeepSoul ? '#7C3AED30' : 'var(--glass-border)'}` }}
                    >
                        <div style={{ fontSize: '2rem' }}>{hasDeepSoul ? '💎' : '✨'}</div>
                        <div style={{ fontWeight: 900, fontSize: '0.88rem', color: hasDeepSoul ? '#6366F1' : 'var(--text)' }}>딥 소울</div>
                        <div style={{ fontSize: '0.72rem', color: hasDeepSoul ? '#8B5CF6' : 'var(--text-muted)', fontWeight: 600 }}>{hasDeepSoul ? '결과 보기 →' : '검사 시작 →'}</div>
                    </motion.div>
                </Tooltip>
            </div>

            {/* 딥 소울 매칭 예시 카드 */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <h3 style={{ fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💸 딥 소울 매칭 예시
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>딥 소울 완료 멤버</span>
                </div>
                <div style={{ display: 'grid', gap: '14px' }}>
                    {deepMatches.map((u) => {
                        const matchUser = nearbyUsers?.find(nu => nu.id === u.userId) || { id: u.userId, name: u.name, mbti: u.mbti, similarity: u.soulScore };
                        return (
                            <Tooltip key={u.name} text="딥 소울 검사를 마친 추천 멤버입니다. 가치관이 얼마나 일치하는지 확인해보세요!" position="left">
                                <motion.div
                                    className="glass-card"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => onSelectUser && onSelectUser(matchUser)}
                                    style={{ padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                                {u.emoji}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{u.name}</span>
                                                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-faint)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>{u.mbti}</span>
                                                    <span style={{ fontSize: '0.68rem', background: '#4F46E510', color: '#6366F1', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>💸 딥 완료</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {u.district}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366F1' }}>{u.soulScore}%</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>가치관 호환도</div>
                                        </div>
                                    </div>
                                    {hasDeepSoul && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                            {u.cats.map(c => (
                                                <div key={c.label} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)' }}>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px', wordBreak: 'keep-all' }}>{c.label}</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: c.score >= 80 ? '#6366F1' : c.score >= 65 ? '#10B981' : '#94A3B8' }}>{c.score}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'right' }}>
                                        프로필 보기 →
                                    </div>
                                </motion.div>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SidebarWidgets;
