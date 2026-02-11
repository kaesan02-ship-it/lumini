import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Heart, Share2, MoreHorizontal, Loader, Filter, Search, Bookmark, Send, X } from 'lucide-react';
import { getPosts, toggleLike, getComments, createComment } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const FeedPage = ({ onCreatePost, onSelectPost }) => {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPosts(filter === 'all' ? null : filter);
            setPosts(data);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
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
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>콘텐츠 피드</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreatePost}
                    className="primary"
                    style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 700
                    }}
                >
                    <Plus size={18} /> 글쓰기
                </motion.button>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                {/* Categories */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {['all', 'tip', 'experience', 'question'].map(c => (
                        <button
                            key={c}
                            onClick={() => setFilter(c)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: filter === c ? 'var(--primary)' : 'var(--glass-border)',
                                background: filter === c ? 'var(--primary-faint)' : 'var(--surface)',
                                color: filter === c ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {c === 'all' ? '전체' : c === 'tip' ? '꿀팁' : c === 'experience' ? '경험담' : '질문'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader className="spin" size={40} color="var(--primary)" />
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px', background: 'var(--surface)',
                        borderRadius: '20px', border: '1px solid var(--glass-border)'
                    }}>
                        <MessageSquare size={50} color="var(--glass-border)" style={{ marginBottom: '15px' }} />
                        <h3 style={{ margin: 0, color: 'var(--text)' }}>게시물이 아직 없습니다</h3>
                        <p style={{ color: 'var(--text-muted)' }}>첫 번째 이야기를 들려주세요!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {posts.map((post, index) => (
                            <PostCard key={post.id} post={post} user={user} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PostCard = ({ post, user, index }) => {
    const [isLiking, setIsLiking] = useState(false);
    const [isLiked, setIsLiked] = useState(false); // Local state for immediate UI feedback
    const [likesCount, setLikesCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // TODO: Initial sync with DB for likes and comments count
    // For now, these are mock counts as we haven't implemented complexity in queries for count aggregation yet

    const handleLike = async () => {
        if (!user) return;
        try {
            setIsLiking(true);
            const result = await toggleLike(post.id, user.id);
            if (result.status === 'liked') {
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            } else {
                setIsLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Like error:', err);
        } finally {
            setIsLiking(false);
        }
    };

    const fetchComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }

        try {
            setLoadingComments(true);
            setShowComments(true);
            const data = await getComments(post.id);
            setComments(data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        try {
            setIsSubmittingComment(true);
            const comment = await createComment({
                post_id: post.id,
                author_id: user.id,
                content: newComment
            });
            setComments(prev => [...prev, { ...comment, author: { username: user.username, avatar_url: user.avatar_url } }]);
            setNewComment('');
        } catch (err) {
            console.error('Comment error:', err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
                background: 'var(--surface)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '45px', height: '45px', borderRadius: '50%',
                        background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '1.1rem'
                    }}>
                        {post.author?.username?.[0] || 'U'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                            {post.author?.username}
                            <span style={{ marginLeft: '8px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)', background: 'var(--primary-faint)', padding: '2px 8px', borderRadius: '10px' }}>
                                {post.author?.mbti_type}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </div>
                    </div>
                </div>
                <MoreHorizontal size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '8px',
                    background: 'var(--background)', color: 'var(--text-muted)',
                    fontSize: '0.75rem', fontWeight: 600, marginBottom: '10px'
                }}>
                    #{post.category === 'tip' ? '꿀팁' : post.category === 'experience' ? '경험담' : '질문'}
                </span>
                <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                    {post.content}
                </p>
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                paddingTop: '15px', borderTop: '1px solid var(--glass-border)'
            }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    disabled={isLiking}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: isLiked ? 'var(--error)' : 'var(--text-muted)',
                        fontSize: '0.9rem', fontWeight: 600
                    }}
                >
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} color={isLiked ? 'var(--error)' : 'var(--text-muted)'} />
                    {likesCount}
                </motion.button>

                <button
                    onClick={fetchComments}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: showComments ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '0.9rem', fontWeight: 600
                    }}
                >
                    <MessageSquare size={20} />
                    {comments.length > 0 ? comments.length : ''} 댓글
                </button>

                <button style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600,
                    marginLeft: 'auto'
                }}>
                    <Bookmark size={20} />
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginTop: '15px' }}
                    >
                        <div style={{
                            background: 'var(--background)',
                            borderRadius: '15px',
                            padding: '15px',
                            display: 'grid',
                            gap: '12px'
                        }}>
                            {loadingComments ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                    <Loader className="spin" size={20} color="var(--primary)" />
                                </div>
                            ) : (
                                <>
                                    {comments.length === 0 ? (
                                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '10px 0' }}>
                                            첫 번째 댓글을 남겨보세요!
                                        </p>
                                    ) : (
                                        comments.map((comment, cIdx) => (
                                            <div key={comment.id || cIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    background: 'var(--primary-faint)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700
                                                }}>
                                                    {comment.author?.username?.[0] || 'U'}
                                                </div>
                                                <div style={{ flex: 1, background: 'var(--surface)', padding: '10px 14px', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>{comment.author?.username}</div>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{comment.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {/* Comment Input */}
                                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="댓글을 입력하세요..."
                                            style={{
                                                flex: 1, padding: '10px 15px', borderRadius: '10px',
                                                border: '1px solid var(--glass-border)', background: 'var(--surface)',
                                                color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
                                            }}
                                        />
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            type="submit"
                                            disabled={isSubmittingComment || !newComment.trim()}
                                            style={{
                                                background: 'var(--primary)', color: 'white', border: 'none',
                                                borderRadius: '10px', width: '40px', height: '40px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', opacity: newComment.trim() ? 1 : 0.5
                                            }}
                                        >
                                            <Send size={18} />
                                        </motion.button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FeedPage;
