import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Image as ImageIcon, Hash } from 'lucide-react';
import { createPost } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const CreatePostPage = ({ onBack, onSuccess }) => {
    const { user } = useAuthStore();
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('experience');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        try {
            setLoading(true);
            await createPost({
                content,
                category,
                author_id: user.id
            });
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
                padding: '20px 5%',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            color: 'var(--text)'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>게시물 작성</h1>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!content.trim() || loading}
                    className="primary"
                    style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        opacity: content.trim() ? 1 : 0.5
                    }}
                >
                    <Send size={18} /> {loading ? '작성 중...' : '게시'}
                </motion.button>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
                <div className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                    {/* User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700
                        }}>
                            {user?.username?.[0] || 'U'}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700 }}>{user?.username}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>루미니 멤버</p>
                        </div>
                    </div>

                    {/* Content Input */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="나누고 싶은 이야기를 적어보세요..."
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text)',
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            outline: 'none',
                            resize: 'none'
                        }}
                    />

                    {/* Category Selector */}
                    <div style={{
                        marginTop: '30px', paddingTop: '20px',
                        borderTop: '1px solid var(--glass-border)',
                        display: 'flex', flexDirection: 'column', gap: '15px'
                    }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>
                            <Hash size={16} /> 카테고리 선택
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {['experience', 'tip', 'question'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '20px',
                                        border: '2px solid',
                                        borderColor: category === c ? 'var(--primary)' : 'var(--glass-border)',
                                        background: category === c ? 'var(--primary-faint)' : 'var(--background)',
                                        color: category === c ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {c === 'experience' ? '경험담' : c === 'tip' ? '꿀팁' : '질문'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'var(--background)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-muted)', padding: '8px 15px', borderRadius: '10px',
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'not-allowed'
                        }}>
                            <ImageIcon size={18} /> 이미지 추가 (준비중)
                        </button>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'var(--background)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-muted)', padding: '8px 15px', borderRadius: '10px',
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'not-allowed'
                        }}>
                            <Sparkles size={18} /> AI 도우미 (준비중)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
