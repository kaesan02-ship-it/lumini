import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreVertical, Send, Plus, Smile } from 'lucide-react';
import { MOCK_GROUP_MESSAGES } from '../data/mockData';

const GroupChatPage = ({ group, onBack, userName }) => {
    const [messages, setMessages] = useState(MOCK_GROUP_MESSAGES[group.id] || []);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            sender: '나',
            mbti: 'ENFP',
            text: inputText,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            reactions: {}
        };

        setMessages([...messages, newMessage]);
        setInputText('');

        // Mock: 자동 응답
        setIsTyping(true);
        setTimeout(() => {
            const responses = [
                '좋은 생각이네요! 👍',
                '저도 동의해요 ㅎㅎ',
                '오 재밌겠다!',
                '언제 시간 되세요?'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, {
                id: prev.length + 1,
                sender: '지민',
                mbti: 'ENFP',
                text: randomResponse,
                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                reactions: {}
            }]);
            setIsTyping(false);
        }, 2000);
    };

    const handleReaction = (messageId, emoji) => {
        setMessages(messages.map(msg => {
            if (msg.id === messageId) {
                const reactions = { ...msg.reactions };
                reactions[emoji] = (reactions[emoji] || 0) + 1;
                return { ...msg, reactions };
            }
            return msg;
        }));
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                padding: '15px 5%',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
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
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {group.emoji} {group.name}
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {group.memberCount}명
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    <MoreVertical size={24} />
                </motion.button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 5%',
                background: '#f8fafc'
            }}>
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.sender === '나'}
                            onReaction={(emoji) => handleReaction(msg.id, emoji)}
                        />
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '15px',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            gap: '4px'
                        }}>
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}
                            />
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}
                            />
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}
                            />
                        </div>
                        지민님이 입력 중...
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '15px 5%',
                borderTop: '1px solid var(--glass-border)',
                background: 'white',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
            }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--text-muted)'
                    }}
                >
                    <Plus size={24} />
                </motion.button>

                <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    style={{
                        flex: 1,
                        padding: '12px 15px',
                        borderRadius: '20px',
                        border: '1px solid var(--glass-border)',
                        fontSize: '1rem'
                    }}
                />

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="primary"
                    style={{
                        padding: '12px 20px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Send size={20} />
                </motion.button>
            </div>
        </div>
    );
};

const MessageBubble = React.memo(({ message, isOwn, onReaction }) => {
    const [showReactions, setShowReactions] = useState(false);

    const reactionEmojis = ['❤️', '👍', '😂', '😮', '😢'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: '15px'
            }}
        >
            <div style={{ maxWidth: '70%' }}>
                {!isOwn && (
                    <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 700
                        }}>
                            {message.sender[0]}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message.sender}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            background: '#f1f5f9',
                            borderRadius: '10px',
                            color: 'var(--primary)',
                            fontWeight: 700
                        }}>
                            {message.mbti}
                        </span>
                    </div>
                )}

                <div
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                    style={{ position: 'relative' }}
                >
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isOwn ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'white',
                        color: isOwn ? 'white' : 'var(--text)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {message.text}
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '5px',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                    }}>
                        <span>{message.time}</span>
                        {Object.entries(message.reactions).length > 0 && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {Object.entries(message.reactions).map(([emoji, count]) => (
                                    <span key={emoji} style={{
                                        padding: '2px 6px',
                                        background: '#f1f5f9',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem'
                                    }}>
                                        {emoji} {count}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {showReactions && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                [isOwn ? 'right' : 'left']: 0,
                                marginBottom: '5px',
                                background: 'white',
                                borderRadius: '20px',
                                padding: '8px 12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                display: 'flex',
                                gap: '8px',
                                zIndex: 10
                            }}
                        >
                            {reactionEmojis.map(emoji => (
                                <motion.button
                                    key={emoji}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onReaction(emoji)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        padding: '4px'
                                    }}
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

export default React.memo(GroupChatPage);
