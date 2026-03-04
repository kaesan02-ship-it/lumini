import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Image as ImageIcon, Hash, X } from 'lucide-react';
import { createPost } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const AI_TIPS = [
    "💡 감정을 솔직하게 표현해보세요. 공감되는 글이 더 많은 연결을 만들어요.",
    "✨ 지금 이 순간 느끼는 것을 3문장으로 표현해보는 건 어떨까요?",
    "🌿 오늘 가장 인상 깊었던 장면이나 대화를 기록해보세요.",
    "💜 나와 비슷한 가치관을 가진 사람들이 공감할 만한 이야기를 나눠보세요.",
    "📖 구체적인 경험 한 가지를 이야기하면 더 생동감 있게 전달돼요.",
];

const CreatePostPage = ({ onBack, onSuccess, userName: propUserName }) => {
    const { user } = useAuthStore();
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('experience');
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showAiTip, setShowAiTip] = useState(false);
    const [currentTip] = useState(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
    const fileInputRef = useRef(null);

    // 실제 표시할 작성자명
    const displayName = propUserName
        || localStorage.getItem('lumini_user_name')
        || user?.username
        || user?.email?.split('@')[0]
        || '루미니 멤버';
    const avatarLetter = displayName[0]?.toUpperCase() || 'L';

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.slice(0, 4 - selectedImages.length).map(file => ({
            url: URL.createObjectURL(file),
            file,
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
        e.target.value = '';
    };

    const removeImage = (idx) => {
        setSelectedImages(prev => {
            URL.revokeObjectURL(prev[idx].url);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || !user) return;
        try {
            setLoading(true);
            await createPost({ content, category, author_id: user.id });
            onSuccess();
        } catch (err) {
            console.error('Failed to create post:', err);
            alert('게시물 작성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div style={{
                padding: '20px 5%', background: 'var(--surface)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onBack}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text)' }}>
                        <ArrowLeft size={24} />
                    </motion.button>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>게시물 작성</h1>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit} disabled={!content.trim() || loading}
                    className="primary"
                    style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, opacity: content.trim() ? 1 : 0.5 }}
                >
                    <Send size={18} /> {loading ? '작성 중...' : '게시'}
                </motion.button>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
                <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                    {/* 실제 작성자명 표시 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '1.1rem'
                        }}>
                            {avatarLetter}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{displayName}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>루미니 멤버</p>
                        </div>
                    </div>

                    {/* AI 글쓰기 도움 팁 */}
                    <AnimatePresence>
                        {showAiTip && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                style={{ padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #EDE9FE, #FAF5FF)', border: '1px solid #8B5CF630', fontSize: '0.9rem', lineHeight: 1.6, color: '#6D28D9', fontWeight: 600 }}
                            >
                                {currentTip}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content Input */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="나누고 싶은 이야기를 적어보세요..."
                        style={{ width: '100%', minHeight: '180px', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.1rem', lineHeight: 1.6, outline: 'none', resize: 'none' }}
                    />

                    {/* 이미지 미리보기 */}
                    {selectedImages.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
                            {selectedImages.map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}>
                                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button onClick={() => removeImage(idx)}
                                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Category Selector */}
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>
                            <Hash size={16} /> 카테고리 선택
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {['experience', 'tip', 'question'].map(c => (
                                <button key={c} type="button" onClick={() => setCategory(c)}
                                    style={{
                                        padding: '8px 18px', borderRadius: '20px', border: '2px solid',
                                        borderColor: category === c ? 'var(--primary)' : 'var(--glass-border)',
                                        background: category === c ? 'var(--primary-faint)' : 'var(--background)',
                                        color: category === c ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease'
                                    }}>
                                    {c === 'experience' ? '경험담' : c === 'tip' ? '꿀팁' : '질문'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 이미지 추가 + AI 도우미 */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageSelect} />
                        <button
                            onClick={() => selectedImages.length < 4 && fileInputRef.current?.click()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: selectedImages.length > 0 ? 'var(--primary-faint)' : 'var(--background)',
                                border: `1px solid ${selectedImages.length > 0 ? 'var(--primary)' : 'var(--glass-border)'}`,
                                color: selectedImages.length > 0 ? 'var(--primary)' : 'var(--text-muted)',
                                padding: '8px 15px', borderRadius: '10px',
                                fontSize: '0.85rem', fontWeight: 600, cursor: selectedImages.length < 4 ? 'pointer' : 'not-allowed'
                            }}>
                            <ImageIcon size={18} /> {selectedImages.length > 0 ? `이미지 ${selectedImages.length}장` : '이미지 추가'}
                        </button>
                        <button
                            onClick={() => setShowAiTip(p => !p)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: showAiTip ? 'linear-gradient(135deg, #EDE9FE, #F5F3FF)' : 'var(--background)',
                                border: `1px solid ${showAiTip ? '#8B5CF6' : 'var(--glass-border)'}`,
                                color: showAiTip ? '#7C3AED' : 'var(--text-muted)',
                                padding: '8px 15px', borderRadius: '10px',
                                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                            <Sparkles size={18} /> AI 글쓰기 도움
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
