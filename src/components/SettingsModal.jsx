import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, User, Settings, LogOut, ChevronRight, RefreshCcw, Moon, Sun, Heart, FileText, Brain, Shield } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useAuthStore from '../store/authStore';

const SettingsModal = ({ isOpen, onClose, userName, setUserName, onReset, mbtiType, userData, onNavigate }) => {
    const { theme, toggleTheme } = useThemeStore();
    const { signOut } = useAuthStore();
    const [activeSection, setActiveSection] = useState('main');

    if (!isOpen) return null;

    // 9지표 계산 헬퍼
    const build9Traits = (d) => {
        if (!d) return [];
        const O = d.O || 0, C = d.C || 0, E = d.E || 0;
        const A = d.A || 0, N = d.N || 0, H = d.H || 50;
        return [
            { label: '사교성', value: Math.round(E), emoji: '🎉', color: '#8B5CF6' },
            { label: '창의성', value: Math.round(O * 0.6 + E * 0.4), emoji: '🎨', color: '#EC4899' },
            { label: '공감력', value: Math.round(A * 0.6 + (100 - N) * 0.4), emoji: '🤝', color: '#10B981' },
            { label: '계획성', value: Math.round(C), emoji: '📋', color: '#3B82F6' },
            { label: '자기주도', value: Math.round(C * 0.55 + H * 0.45), emoji: '🎯', color: '#6366F1' },
            { label: '유연성', value: Math.round(O), emoji: '🌊', color: '#06B6D4' },
            { label: '따뜻함', value: Math.round(A), emoji: '💛', color: '#F59E0B' },
            { label: '회복탄력', value: Math.round(100 - N), emoji: '😌', color: '#10B981' },
            { label: '신뢰도', value: Math.round(H), emoji: '🛡️', color: '#9333EA' },
        ];
    };

    // 내 검사 결과 섹션
    const renderMyResults = () => {
        const traits = build9Traits(userData);
        return (
            <div style={{ display: 'grid', gap: '16px' }}>
                <button
                    onClick={() => setActiveSection('main')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'transparent', border: 'none', color: 'var(--primary)',
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', padding: '0'
                    }}
                >
                    ← 뒤로
                </button>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>내 성격 진단 결과</h3>

                {mbtiType && mbtiType !== '?' ? (
                    <>
                        <div style={{
                            padding: '20px', borderRadius: '18px', textAlign: 'center',
                            background: 'linear-gradient(135deg, var(--primary-faint), #F5F3FF)',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '6px' }}>
                                {mbtiType}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                HEXACO + Big5 통합 9지표 분석
                            </div>
                        </div>

                        {/* 9지표 스탯 바 */}
                        {userData && (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {traits.map(trait => (
                                    <div key={trait.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '1rem' }}>{trait.emoji}</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{trait.label}</span>
                                            </div>
                                            <span style={{
                                                fontSize: '0.85rem', fontWeight: 900,
                                                color: trait.value >= 70 ? trait.color : trait.value >= 50 ? '#10B981' : '#94A3B8'
                                            }}>{trait.value}점</span>
                                        </div>
                                        <div style={{ height: '7px', background: 'var(--glass-border)', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${trait.value}%`, height: '100%', borderRadius: '100px',
                                                background: trait.value >= 70
                                                    ? `linear-gradient(90deg, ${trait.color}, ${trait.color}99)`
                                                    : trait.value >= 50 ? '#10B981' : '#CBD5E1',
                                                transition: 'width 1s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => { onClose(); onNavigate?.('result'); }}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--primary-faint), #F5F3FF)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--primary)', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            📊 전체 성향 리포트 보기
                        </button>

                        <button
                            onClick={() => { onClose(); onNavigate?.('test'); }}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                background: 'var(--background)', border: '1px solid var(--glass-border)',
                                color: 'var(--text)', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <RefreshCcw size={16} /> 성격 검사 다시하기
                        </button>

                        {/* 딥 소울 버튼 */}
                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />
                        <button
                            onClick={() => localStorage.getItem('lumini_deep_soul') ? setActiveSection('deep-soul-inline') : (onClose(), onNavigate?.('deep-soul-test'))}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                background: localStorage.getItem('lumini_deep_soul') ? 'linear-gradient(135deg, #4F46E512, #7C3AED10)' : 'var(--background)',
                                border: '1px solid ' + (localStorage.getItem('lumini_deep_soul') ? '#7C3AED30' : 'var(--glass-border)'),
                                color: localStorage.getItem('lumini_deep_soul') ? '#6366F1' : 'var(--text-muted)',
                                fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            {'💎'} {localStorage.getItem('lumini_deep_soul') ? '딥 소울 결과 확인' : '딥 소울 검사 시작하기'}
                        </button>
                        {localStorage.getItem('lumini_deep_soul') && (
                            <button
                                onClick={() => { if (window.confirm('딥 소울 검사를 다시 하시겠어요?')) { localStorage.removeItem('lumini_deep_soul'); onClose(); onNavigate?.('deep-soul-test'); } }}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '12px',
                                    background: 'transparent', border: '1px dashed #94A3B8',
                                    color: '#94A3B8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <RefreshCcw size={14} /> 딥 소울 재검사
                            </button>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <Brain size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
                        <p style={{ fontWeight: 600 }}>아직 검사를 진행하지 않았습니다.</p>
                        <button
                            className="primary"
                            onClick={() => { onClose(); onNavigate?.('test'); }}
                            style={{ marginTop: '15px', padding: '12px 24px' }}
                        >
                            성격 진단 시작하기
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // 딥 소울 인라인 요약 섹션
    const renderDeepSoulInline = () => {
        let ds = null;
        try { ds = JSON.parse(localStorage.getItem('lumini_deep_soul') || 'null'); } catch { ds = null; }

        // 성향 레이블 매핑 (점수 대신 성향 키워드 표시)
        const TENDENCY_LABELS = {
            family: [
                { min: 0, label: '자유로운 편', desc: '각자의 공간을 중시해요' },
                { min: 50, label: '균형형', desc: '함께와 혼자 모두 좋아요' },
                { min: 75, label: '따뜻한 가정형', desc: '가족과의 시간을 소중히 여겨요' },
            ],
            love: [
                { min: 0, label: '천천히 친해지는 편', desc: '신중하게 마음을 여는 타입' },
                { min: 50, label: '자연스러운 연애형', desc: '상황에 따라 유연하게 표현해요' },
                { min: 75, label: '적극적 표현형', desc: '감정을 솔직하게 전달해요' },
            ],
            values: [
                { min: 0, label: '현실주의자', desc: '실용성과 안정을 중시해요' },
                { min: 50, label: '균형잡힌 가치관', desc: '꿈과 현실 모두 중요해요' },
                { min: 75, label: '이상주의자', desc: '의미와 성장을 최우선으로 해요' },
            ],
            communication: [
                { min: 0, label: '사려 깊은 경청형', desc: '듣는 것을 더 좋아해요' },
                { min: 50, label: '조화로운 대화형', desc: '상황에 맞게 대화해요' },
                { min: 75, label: '활발한 표현형', desc: '생각을 바로 나누는 편이에요' },
            ],
        };

        const cats = [
            { key: 'family', label: '가족관', icon: '🏠' },
            { key: 'love', label: '연애관', icon: '💜' },
            { key: 'values', label: '가치관', icon: '⭐' },
            { key: 'communication', label: '소통 방식', icon: '💬' },
        ];

        const getTendency = (catKey) => {
            const labels = TENDENCY_LABELS[catKey];
            if (!ds || !Array.isArray(ds)) {
                // 딥소울 데이터가 배열이 아니면 중간 성향 반환
                return labels[1];
            }
            const answers = ds.filter(a => a.category === catKey);
            const avg = answers.length > 0 ? answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length : 0.5;
            const pct = avg * 100;
            const matched = [...labels].reverse().find(l => pct >= l.min);
            return matched || labels[0];
        };

        return (
            <div style={{ display: 'grid', gap: '16px' }}>
                <button onClick={() => setActiveSection('results')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', padding: '0' }}>
                    ← 돌아가기
                </button>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>💎 딥 소울 성향 요약</h3>
                {ds !== null ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {cats.map(cat => {
                                const tendency = getTendency(cat.key);
                                return (
                                    <div key={cat.key} style={{ padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg, #4F46E508, #7C3AED05)', border: '1px solid #7C3AED20', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem' }}>{cat.icon}</div>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>{cat.label}</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#6366F1', marginTop: '3px', lineHeight: 1.3 }}>{tendency.label}</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>{tendency.desc}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--primary-faint)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            💎 이 성향을 바탕으로 가치관 기반 정밀 매칭이 적용되고 있어요!
                        </div>
                        <button onClick={() => { onClose(); onNavigate?.('deep-soul-result'); }}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            💎 전체 결과 페이지 보기
                        </button>
                        <button onClick={() => { if (window.confirm('딥 소울 검사를 다시 하시겠어요?')) { localStorage.removeItem('lumini_deep_soul'); onClose(); onNavigate?.('deep-soul-test'); } }}
                            style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'transparent', border: '1px dashed #94A3B8', color: '#94A3B8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <RefreshCcw size={14} /> 재검사
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        💎 딥 소울 검사를 완료하면 성향 요약을 볼 수 있어요
                    </div>
                )}
            </div>
        );
    };



    // 메인 설정 섹션
    const renderMain = () => (
        <div style={{ display: 'grid', gap: '20px' }}>
            <h2 style={{ marginBottom: '10px', fontSize: '1.75rem', color: 'var(--text)' }}>설정</h2>

            {/* 프로필 이름 */}
            <div className="setting-group">
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>내 프로필 이름</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '10px',
                        background: 'var(--background)', border: '1px solid var(--glass-border)',
                        color: 'var(--text)', outline: 'none'
                    }}
                />
            </div>

            <Divider />

            {/* 다크모드 토글 */}
            <div onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                        {theme === 'dark' ? '다크 모드' : '라이트 모드'}
                    </span>
                </div>
                <div style={{
                    width: '50px', height: '26px', borderRadius: '13px',
                    background: theme === 'dark' ? 'var(--primary)' : '#e2e8f0',
                    position: 'relative', transition: 'all 0.3s'
                }}>
                    <motion.div
                        animate={{ x: theme === 'dark' ? 24 : 0 }}
                        style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: 'white', position: 'absolute', top: '2px', left: '2px'
                        }}
                    />
                </div>
            </div>

            <Divider />

            {/* 내 검사 결과 */}
            <SettingItem
                icon={<Brain size={18} color="var(--primary)" />}
                label="내 검사 결과"
                sublabel={mbtiType && mbtiType !== '?' ? mbtiType : '미완료'}
                onClick={() => setActiveSection('results')}
            />

            {/* 찜한 목록 */}
            <SettingItem
                icon={<Heart size={18} color="#ec4899" />}
                label="찜한 목록"
                onClick={() => { onClose(); onNavigate?.('favorites'); }}
            />

            {/* 알림 설정 */}
            <SettingItem
                icon={<Bell size={18} />}
                label="알림 설정"
                onClick={() => alert('알림 설정 기능은 곧 추가됩니다!')}
            />

            {/* 계정 관리 */}
            <SettingItem
                icon={<User size={18} />}
                label="프로필 편집"
                onClick={() => { onClose(); onNavigate?.('profile-edit'); }}
            />

            <Divider />

            {/* 진단 초기화 */}
            <div
                onClick={onReset}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ color: '#f59e0b' }}><RefreshCcw size={18} /></div>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>진단 데이터 초기화</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
            </div>

            <SettingItem
                icon={<LogOut size={18} color="#ef4444" />}
                label="로그아웃"
                isDangerous
                onClick={async () => {
                    console.log('Logout button clicked');
                    if (window.confirm('정말 로그아웃하시겠습니까?')) {
                        try {
                            console.log('Calling signOut...');
                            await signOut();
                            console.log('signOut completed. Closing modal...');
                            onClose();
                            const baseUrl = import.meta.env.BASE_URL || '/lumini/';
                            console.log('Redirecting to:', baseUrl);
                            window.location.href = baseUrl;
                        } catch (err) {
                            console.error('Logout failed:', err);
                            alert('로그아웃 중 오류가 발생했습니다.');
                        }
                    }
                }}
            />
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{
                    width: '480px', maxHeight: '85vh', overflowY: 'auto',
                    padding: '35px', position: 'relative', background: 'var(--surface)'
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
                >
                    <X size={24} />
                </button>

                {activeSection === 'main' && renderMain()}
                {activeSection === 'results' && renderMyResults()}
                {activeSection === 'deep-soul-inline' && renderDeepSoulInline()}

                <button className="primary" style={{ width: '100%', marginTop: '30px' }} onClick={onClose}>
                    닫기
                </button>
            </motion.div>
        </div>
    );
};

const Divider = () => (
    <div style={{ height: '1px', background: 'var(--glass-border)' }} />
);

const SettingItem = ({ icon, label, sublabel, isDangerous, onClick }) => (
    <div
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: isDangerous ? '#ef4444' : 'var(--text-muted)' }}>{icon}</div>
            <span style={{ color: isDangerous ? '#ef4444' : 'var(--text)', fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sublabel && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--background)', padding: '2px 8px', borderRadius: '6px' }}>
                    {sublabel}
                </span>
            )}
            <ChevronRight size={16} color="var(--text-muted)" />
        </div>
    </div>
);

export default SettingsModal;
