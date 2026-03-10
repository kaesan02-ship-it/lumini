import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, RefreshCw, Camera, Upload, Image as ImageIcon } from 'lucide-react';

// DALL-E 3 Prompt 고도화 (한국 유저들의 '안 이뻐졌다'는 피드백 적극 반영: 서양 코믹스 대신 애니메이션/지브리 감성)
const AVATAR_STYLES = [
    { id: 'anime-1', label: '만화 주인공', emoji: '✨', prompt: 'masterpiece, best quality, beautiful anime style, japanese animation character, cute, soft pastel' },
    { id: 'anime-2', label: '지브리 감성', emoji: '🍃', prompt: 'studio ghibli style, beautiful anime scenery, cute character, warm colors, masterpiece' },
    { id: 'chibi', label: 'SD 치비', emoji: '🍡', prompt: 'super deformed, chibi style, extremely cute anime character, big eyes, simple pastel background, kawaii' },
];

const AIAvatarGenerator = ({ onSelect, onClose }) => {
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAvatars, setGeneratedAvatars] = useState([]);
    const [activeTab, setActiveTab] = useState('generate'); // generate, upload
    const fileInputRef = useRef(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const baseUrl = import.meta.env.BASE_URL;
            let finalImage = '';

            if (selectedStyle === 'anime-1') finalImage = `${baseUrl}avatars/anime1.png`;
            else if (selectedStyle === 'anime-2') finalImage = `${baseUrl}avatars/anime2.png`;
            else finalImage = `${baseUrl}avatars/anime3.png`;

            // Generate multiple variations if we had backend access. For mock, just return the 1 tailored image.
            setGeneratedAvatars([finalImage]);
            setIsGenerating(false);
        }, 1500);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            alert('사진 스캔 완료! 이 사진 기반으로 곧 귀여운 애니메이션 화풍의 AI 아바타를 만드는 기능이 추후 업데이트될 예정입니다. (현재는 샘플 이미지가 생성됩니다.)');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card"
                style={{
                    width: '100%', maxWidth: '520px', background: 'var(--surface)',
                    borderRadius: '40px', padding: '0', position: 'relative',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.4)', overflow: 'hidden'
                }}
            >
                {/* Header Section */}
                <div style={{ padding: '40px 40px 20px', textAlign: 'center' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '30px', right: '30px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <X size={22} />
                    </button>

                    <div style={{ display: 'inline-flex', padding: '10px', background: 'linear-gradient(135deg, #fef2f2, #fff1f2)', borderRadius: '25px', marginBottom: '20px' }}>
                        <Sparkles size={32} color="#ef4444" fill="#ef4444" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '10px', color: '#0f172a' }}>AI 아바타 메이커</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>당신을 닮은 귀여운 아바타로<br />오늘의 소울메이트를 만나보세요!</p>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '5px', background: '#f1f5f9', margin: '0 40px 30px', padding: '5px', borderRadius: '18px' }}>
                    <button
                        onClick={() => setActiveTab('generate')}
                        style={{ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', background: activeTab === 'generate' ? 'white' : 'transparent', color: activeTab === 'generate' ? '#0f172a' : '#94a3b8', transition: 'all 0.3s', boxShadow: activeTab === 'generate' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        스타일 선택
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        style={{ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', background: activeTab === 'upload' ? 'white' : 'transparent', color: activeTab === 'upload' ? '#0f172a' : '#94a3b8', transition: 'all 0.3s', boxShadow: activeTab === 'upload' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        사진으로 만들기 (Beta)
                    </button>
                </div>

                <div style={{ padding: '0 40px 40px' }}>
                    {!generatedAvatars.length ? (
                        activeTab === 'generate' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                {AVATAR_STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        style={{
                                            padding: '25px 15px', borderRadius: '24px',
                                            background: selectedStyle === style.id ? '#fdf2f2' : '#f8fafc',
                                            border: `2.5px solid ${selectedStyle === style.id ? '#ef4444' : 'transparent'}`,
                                            transition: 'all 0.2s', textAlign: 'center', cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{style.emoji}</div>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedStyle === style.id ? '#ef4444' : '#64748b' }}>{style.label}</div>
                                    </button>
                                ))}
                                <button
                                    disabled={!selectedStyle || isGenerating}
                                    onClick={handleGenerate}
                                    className="primary"
                                    style={{ gridColumn: 'span 3', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '64px', borderRadius: '22px', fontSize: '1.1rem', fontWeight: 800, opacity: !selectedStyle ? 0.5 : 1 }}
                                >
                                    {isGenerating ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
                                    {isGenerating ? 'AI가 마법을 부리는 중...' : '이 스타일로 생성하기'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div
                                    onClick={handleUploadClick}
                                    style={{ width: '100%', height: '180px', border: '3px dashed #e2e8f0', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.2s', background: '#f8fafc' }}
                                    className="hover:bg-slate-50 hover:border-slate-300"
                                >
                                    <div style={{ padding: '15px', background: 'white', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <Upload size={32} color="#94a3b8" />
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>사진을 드래그하거나 클릭하세요</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                </div>
                                <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                                    실제 사진을 업로드하면 AI가 특징을 분석하여<br />
                                    가장 잘 어울리는 귀여운 캐릭터로 변환해 드립니다.
                                </p>
                            </div>
                        )
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '35px' }}>
                                {generatedAvatars.map((url, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        style={{
                                            width: '120px', height: '120px', borderRadius: '32px',
                                            overflow: 'hidden', border: '4px solid white',
                                            boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                                            position: 'relative', margin: '0 auto'
                                        }}
                                    >
                                        <img src={url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#f8fafc' }} />
                                    </motion.div>
                                ))}
                            </div>
                            <p style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.05rem', marginBottom: '25px' }}>짜잔! 당신만의 소울 캐릭터예요 ✨</p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => setGeneratedAvatars([])}
                                    style={{ flex: 1, height: '56px', borderRadius: '20px', border: '2px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    다시 생성
                                </button>
                                <button
                                    onClick={() => onSelect(generatedAvatars[0])}
                                    style={{ flex: 1.5, height: '56px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, #6366F1, #F43F5E)', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 15px rgba(99, 102, 241, 0.3)', transition: 'all 0.2s' }}
                                >
                                    이 아바타 적용하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AIAvatarGenerator;

