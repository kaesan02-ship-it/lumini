import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Shield, Save, Tag } from 'lucide-react';
import InterestTagsSelector from '../components/InterestTagsSelector';

const ProfileEditPage = ({ userData, userName, mbtiType, selectedInterests: initialInterests, onBack, onSave }) => {
    const [name, setName] = useState(userName);
    const [bio, setBio] = useState('안녕하세요! Lumini를 통해 진정한 인연을 찾고 있습니다. 🌟');
    const [selectedTags, setSelectedTags] = useState(initialInterests || []);
    const [privacy, setPrivacy] = useState('public'); // public, friends, private
    const [activeTab, setActiveTab] = useState('basic'); // basic, interests, privacy

    const handleSave = () => {
        onSave({
            name,
            bio,
            interests: selectedTags,
            privacy
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
                <TabItem active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} label="공개 범위" />
            </div>

            <div className="glass-card" style={{ padding: '40px', background: 'var(--surface)' }}>
                {activeTab === 'basic' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    color: 'white',
                                    boxShadow: '0 10px 30px var(--primary-glow)'
                                }}>
                                    {name.charAt(0)}
                                </div>
                                <button style={{
                                    position: 'absolute', bottom: '0', right: '0',
                                    background: 'var(--primary)', color: 'white',
                                    padding: '10px', borderRadius: '50%', border: '4px solid var(--surface)'
                                }}>
                                    <Camera size={18} />
                                </button>
                            </div>
                            <p style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>아바타 이미지는 곧 직접 업로드 가능합니다</p>
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
                            onComplete={() => setActiveTab('privacy')}
                        />
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
                                title="친구에게만 공개"
                                desc="친구 맺은 사용자에게만 상세 분석 데이터가 공개됩니다"
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
        </div>
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
