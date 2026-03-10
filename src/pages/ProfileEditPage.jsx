import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Shield, Save, Tag, Sparkles } from 'lucide-react';
import InterestTagsSelector from '../components/InterestTagsSelector';

// 서울 주요 구청 목록
const SEOUL_GU = ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'];
const OTHER_DISTRICTS = ['부산 해운대구', '부산 수영구', '인천 연수구', '대구 수성구', '대전 유성구', '광주 남구', '수원시', '성남시 분당구', '용인시', '고양시', '화성시'];
const ALL_DISTRICTS = [...SEOUL_GU.map(g => `서울 ${g}`), ...OTHER_DISTRICTS];

const ProfileEditPage = ({ userData, userName, mbtiType, profile, profileAvatar, onBack, onSave }) => {
    const [name, setName] = useState(userName);
    const [bio, setBio] = useState(profile?.bio || '안녕하세요! Lumini를 통해 진정한 인연을 찾고 있습니다. 🌟');
    const [selectedTags, setSelectedTags] = useState(profile?.interests || []);
    const [privacy, setPrivacy] = useState(profile?.privacy_level || 'public');
    const [district, setDistrict] = useState(profile?.district || '');
    const [game, setGame] = useState(profile?.game || '');
    const [tier, setTier] = useState(profile?.tier || '');
    const [activeTab, setActiveTab] = useState('basic');

    const handleSave = () => {
        onSave({
            name,
            bio,
            interests: selectedTags,
            privacy,
            district,
            game,
            tier
        });
        onBack();
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <button onClick={onBack} style={{ background: 'var(--surface)', color: 'var(--text)', padding: '10px', borderRadius: '50%', boxShadow: 'var(--shadow)' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>프로필 편집</h2>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <TabItem active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} label="기본 정보" />
                <TabItem active={activeTab === 'interests'} onClick={() => setActiveTab('interests')} label="관심사" />
                <TabItem active={activeTab === 'game'} onClick={() => setActiveTab('game')} label="게임 듀오" />
                <TabItem active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} label="공개 범위" />
            </div>

            <div className="glass-card" style={{ padding: '40px', background: 'var(--surface)' }}>
                {activeTab === 'basic' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                                <img
                                    src={profile?.avatar || profileAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--surface)', boxShadow: '0 10px 30px var(--primary-glow)', background: '#f8fafc' }}
                                />
                                <button style={{
                                    position: 'absolute', bottom: '0px', right: '0px',
                                    background: 'var(--surface)', color: 'var(--text-muted)',
                                    padding: '12px', borderRadius: '50%', border: '1px solid var(--glass-border)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Camera size={20} />
                                </button>
                            </div>
                            <button
                                onClick={onBack}
                                style={{
                                    marginTop: '25px', padding: '10px 24px', borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #6366F1, #F43F5E)', color: 'white', border: 'none',
                                    fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                <Sparkles size={18} /> 프로필에서 AI 아바타 생성하기
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '25px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: 'var(--text)' }}>사용자 이름</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름을 입력하세요"
                                    style={{ width: '100%', padding: '15px', borderRadius: '15px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: 'var(--text)' }}>자기소개 (200자 제한)</label>
                                <textarea
                                    className="glass-input"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value.substring(0, 200))}
                                    placeholder="나를 멋지게 소개해보세요!"
                                    rows={4}
                                    style={{ width: '100%', padding: '15px', borderRadius: '15px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--text)', resize: 'none' }}
                                />
                                <p style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>{bio.length}/200</p>
                            </div>

                            {/* 지역 설정 */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📍 내 동네 설정 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>(구 단위까지 설정하면 동네 친구를 만날 수 있어요)</span>
                                </label>
                                <select
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 16px', borderRadius: '15px',
                                        background: 'var(--background)', border: '1px solid var(--glass-border)',
                                        color: district ? 'var(--text)' : 'var(--text-muted)',
                                        fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                                        appearance: 'none', outline: 'none'
                                    }}
                                >
                                    <option value="">지역을 선택하세요</option>
                                    <optgroup label="서울">
                                        {SEOUL_GU.map(g => <option key={g} value={`서울 ${g}`}>서울 {g}</option>)}
                                    </optgroup>
                                    <optgroup label="기타 지역">
                                        {OTHER_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </optgroup>
                                </select>
                                {district && (
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 700 }}>
                                        📍 {district} 동네 친구들과 매칭됩니다
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--primary-faint)', padding: '20px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '1.5rem' }}>✨</div>
                                <div>
                                    <p style={{ fontWeight: 800, color: 'var(--primary)' }}>나의 성격 유형: {mbtiType}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>성격 진단 데이터는 프로필에 자동으로 반영됩니다</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'interests' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <InterestTagsSelector
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                            onComplete={() => setActiveTab('game')}
                        />
                    </motion.div>
                )}

                {activeTab === 'game' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Tag size={20} color="var(--primary)" /> 게임 프로필 설정
                        </h3>

                        <div style={{ display: 'grid', gap: '25px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700 }}>주로 즐기는 게임</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {['League of Legends', 'Valorant', 'Battlegrounds', 'Overwatch 2', 'Lost Ark', 'Genshin Impact'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGame(g)}
                                            style={{
                                                padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                                background: game === g ? 'var(--primary)' : 'var(--background)',
                                                color: game === g ? 'white' : 'var(--text)',
                                                fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                                            }}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="직접 입력..."
                                        value={['League of Legends', 'Valorant', 'Battlegrounds', 'Overwatch 2', 'Lost Ark', 'Genshin Impact'].includes(game) ? '' : game}
                                        onChange={(e) => setGame(e.target.value)}
                                        style={{
                                            padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                            background: 'var(--background)', color: 'var(--text)', width: '150px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700 }}>현재 티어 / 레벨</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    value={tier}
                                    onChange={(e) => setTier(e.target.value)}
                                    placeholder="예: 언랭크, 다이아몬드, Lv.500 등"
                                    style={{ width: '100%', padding: '15px', borderRadius: '15px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                                />
                            </div>

                            <div style={{ background: 'var(--surface-faint)', padding: '20px', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    💡 설정된 게임 정보는 매칭 카드와 프로필 하단에 표시되어,<br />
                                    비슷한 게임 취향을 가진 인연을 찾는 데 도움을 줍니다.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'privacy' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={20} color="var(--primary)" /> 프로필 공개 범위
                        </h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <PrivacyOption
                                active={privacy === 'public'}
                                onClick={() => setPrivacy('public')}
                                title="전체 공개"
                                desc="모든 사용자에게 내 프로필과 분석 리포트가 공개됩니다"
                            />
                            <PrivacyOption
                                active={privacy === 'friends'}
                                onClick={() => setPrivacy('friends')}
                                title="관심 등록한 유저에게만 공개"
                                desc="내가 관심 등록(♥ 좋아요)한 사용자에게만 상세 분석 데이터가 공개됩니다"
                            />
                            <PrivacyOption
                                active={privacy === 'private'}
                                onClick={() => setPrivacy('private')}
                                title="비공개"
                                desc="지도 마커에만 표시되며 상세 정보는 나만 볼 수 있습니다"
                            />
                        </div>
                    </motion.div>
                )}

                <div style={{ marginTop: '40px', pt: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '15px' }}>
                    <button
                        onClick={handleSave}
                        className="primary"
                        style={{ flex: 1, padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <Save size={20} /> 프로필 저장하기
                    </button>
                </div>
            </div>
        </div >
    );
};

const TabItem = ({ active, onClick, label }) => (
    <div
        onClick={onClick}
        style={{
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 700,
            color: active ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.3s'
        }}
    >
        {label}
    </div>
);

const PrivacyOption = ({ active, onClick, title, desc }) => (
    <div
        onClick={onClick}
        style={{
            padding: '20px',
            borderRadius: '15px',
            border: active ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
            background: active ? 'var(--primary-faint)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontWeight: 800, color: active ? 'var(--primary)' : 'var(--text)' }}>{title}</span>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--primary)', position: 'relative' }}>
                {active && <div style={{ position: 'absolute', top: '4px', left: '4px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />}
            </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
);

export default ProfileEditPage;
