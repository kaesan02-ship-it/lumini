import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, Users as UsersIcon, Circle, Loader } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import useAuthStore from '../store/authStore';
import { getHiveMembers } from '../supabase/queries';

const HivePage = ({ hive, userName, onBack }) => {
    const { user } = useAuthStore();
    const { messages: chatMessages, send, loading: chatLoading } = useChat({
        communityId: hive.id,
        senderId: user?.id
    });
    const [chatInput, setChatInput] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [showUserList, setShowUserList] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchMembers = useCallback(async () => {
        try {
            setLoadingMembers(true);
            const members = await getHiveMembers(hive.id);
            setOnlineUsers(members.map(m => ({
                id: m.profiles.id,
                name: m.profiles.username,
                mbti: m.profiles.mbti_type,
                status: 'online'
            })));
        } catch (err) {
            console.error('Failed to fetch hive members:', err);
        } finally {
            setLoadingMembers(false);
        }
    }, [hive.id]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // 자동 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        await send(chatInput);
        setChatInput('');
    };

    // 메시지 그룹핑 (같은 사용자의 연속 메시지)
    const groupedMessages = chatMessages.reduce((groups, message, index) => {
        if (index === 0 || chatMessages[index - 1].sender_id !== message.sender_id) {
            groups.push([message]);
        } else {
            groups[groups.length - 1].push(message);
        }
        return groups;
    }, []);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--background)'
        }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '15px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack}
                        style={{
                            background: 'var(--primary-faint)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={24} color="var(--primary)" />
                    </motion.button>

                    <div>
                        <h1 style={{
                            fontSize: '1.3rem',
                            fontWeight: 800,
                            color: 'var(--text)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            🐝 {hive.name}
                        </h1>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            margin: '3px 0 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <Circle size={8} color="#10b981" fill="#10b981" />
                            {onlineUsers.length}명 참여 중
                        </p>
                    </div>
                </div>

                {/* User List Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserList(!showUserList)}
                    style={{
                        background: showUserList ? 'var(--primary)' : 'var(--primary-faint)',
                        color: showUserList ? 'white' : 'var(--primary)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}
                >
                    <UsersIcon size={18} />
                    사용자 목록
                </motion.button>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        <AnimatePresence>
                            {chatLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                                    <Loader className="spin" size={30} color="var(--primary)" />
                                </div>
                            ) : groupedMessages.map((group, groupIndex) => (
                                <MessageGroup
                                    key={groupIndex}
                                    messages={group}
                                    isOwn={group[0].sender_id === user?.id}
                                    delay={groupIndex * 0.05}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        background: 'var(--surface)',
                        borderTop: '1px solid var(--glass-border)',
                        padding: '15px 20px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    }}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                background: 'var(--background)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Smile size={22} color="var(--text-muted)" />
                        </motion.button>

                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && chatInput.trim() && handleSendMessage()}
                            placeholder="메시지를 입력하세요..."
                            style={{
                                flex: 1,
                                padding: '12px 18px',
                                borderRadius: '25px',
                                border: '2px solid var(--glass-border)',
                                background: 'var(--background)',
                                color: 'var(--text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        />

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim()}
                            className={chatInput.trim() ? "primary" : ""}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                background: !chatInput.trim() ? 'var(--glass-border)' : undefined,
                                color: !chatInput.trim() ? 'var(--text-muted)' : undefined,
                                border: 'none',
                                cursor: chatInput.trim() ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <Send size={18} />
                            전송
                        </motion.button>
                    </div>
                </div>

                {/* User List Sidebar */}
                <AnimatePresence>
                    {showUserList && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background: 'var(--surface)',
                                borderLeft: '1px solid var(--glass-border)',
                                overflowY: 'auto',
                                padding: '20px'
                            }}
                        >
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: 'var(--text)',
                                marginBottom: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <UsersIcon size={18} />
                                참여 사용자 ({onlineUsers.length})
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {loadingMembers ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                        <Loader className="spin" size={20} color="var(--primary)" />
                                    </div>
                                ) : onlineUsers.map((u, index) => (
                                    <motion.div
                                        key={u.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 5, backgroundColor: 'var(--background)' }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            position: 'relative'
                                        }}>
                                            {u.name[0]}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: '#10b981',
                                                border: '2px solid var(--surface)'
                                            }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                color: 'var(--text)'
                                            }}>
                                                {u.name}
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)'
                                            }}>
                                                {u.mbti}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Message Group Component
const MessageGroup = ({ messages, isOwn, delay }) => {
    const firstMessage = messages[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{
                display: 'flex',
                direction: 'ltr',
                flexDirection: 'column',
                alignItems: isOwn ? 'flex-end' : 'flex-start',
                gap: '5px'
            }}
        >
            {/* Sender Name (only for others) */}
            {!isOwn && (
                <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginLeft: '12px',
                    fontWeight: 600
                }}>
                    {firstMessage.sender?.username || '사용자'}
                </span>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
                <div
                    key={index}
                    style={{
                        background: isOwn
                            ? 'var(--primary)'
                            : 'var(--background)',
                        color: isOwn ? 'white' : 'var(--text)',
                        padding: '12px 18px',
                        borderRadius: isOwn
                            ? '20px 20px 5px 20px'
                            : '20px 20px 20px 5px',
                        boxShadow: 'var(--shadow)',
                        maxWidth: '70%',
                        wordBreak: 'break-word',
                        border: isOwn ? 'none' : '1px solid var(--glass-border)'
                    }}
                >
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {message.content}
                    </p>
                </div>
            ))}

            {/* Timestamp (only for last message in group) */}
            <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginLeft: isOwn ? '0' : '12px',
                marginRight: isOwn ? '12px' : '0'
            }}>
                {new Date(messages[messages.length - 1].created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </span>
        </motion.div>
    );
};

export default HivePage;
