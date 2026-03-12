import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { useChat } from '../hooks/useChat';
import { getIceBreakerQuestions } from '../lib/openaiClient';
import { Sparkles, ArrowLeft, Phone, Video, MoreVertical, Send, Smile, RefreshCw } from 'lucide-react';
import Tooltip from '../components/Tooltip';

const CONVERSATION_PROMPTS = [
    { icon: '☕', text: '커피 한잔하며 대화나눌까요?' },
    { icon: '📚', text: '최근에 읽은 책 중에 어떤 게 좋으셨나요?' },
    { icon: '🎧', text: '요즘 자주 듣는 음악 추천해주세요!' },
    { icon: '🎬', text: '최근에 본 영화나 드라마 추천해주실 수 있나요?' },
    { icon: '✈️', text: '가장 기억에 남는 여행지는 어디인가요?' }
];

const ChatPage = ({ chatUser, onBack, userName }) => {
    const { user } = useAuthStore();
    const { messages: chatMessages, send, loading } = useChat({
        senderId: user?.id,
        receiverId: chatUser.id
    });
    const [inputText, setInputText] = useState('');
    const [showPrompts, setShowPrompts] = useState(true);
    const [aiQuestions, setAiQuestions] = useState([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const messagesEndRef = useRef(null);

    // 자동 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // 메시지 전송
    const handleSend = async () => {
        if (!inputText.trim()) return;

        await send(inputText);
        setInputText('');
        setShowPrompts(false);
    };

    // 프롬프트 선택
    const handlePromptClick = (promptText) => {
        setInputText(promptText);
        setShowPrompts(false);
    };

    const handleGetAiIcebreaker = async () => {
        setIsLoadingAi(true);
        try {
            const questions = await getIceBreakerQuestions(user?.mbti || 'ISFJ', chatUser.mbti, chatUser.similarity);
            setAiQuestions(questions);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingAi(false);
        }
    };

    // 랜덤 프롬프트 3개 선택
    const randomPrompts = CONVERSATION_PROMPTS
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8fafc'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '15px 20px',
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
                        <ArrowLeft size={24} color="#4a5568" />
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            flexShrink: 0
                        }}>
                            <img
                                src={chatUser.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(chatUser.name || 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt={chatUser.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1a202c' }}>
                                {chatUser.name}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                                성향 일치도 {chatUser.similarity}%
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Tooltip text="음성 통화를 시작합니다 (준비 중)">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                background: '#f8fafc',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Phone size={20} color="#4a5568" />
                        </motion.button>
                    </Tooltip>
                    <Tooltip text="영상 통화를 시작합니다 (준비 중)">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                background: '#f8fafc',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Video size={20} color="#4a5568" />
                        </motion.button>
                    </Tooltip>
                    <Tooltip text="더 보기">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                background: '#f8fafc',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <MoreVertical size={20} color="#4a5568" />
                        </motion.button>
                    </Tooltip>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <AnimatePresence>
                    {chatMessages.map((message, index) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.sender_id === user?.id}
                            delay={index * 0.05}
                        />
                    ))}
                </AnimatePresence>

                {/* Conversation Prompts */}
                {showPrompts && chatMessages.length <= 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            marginTop: '15px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>💡 대화를 시작해보세요</p>
                            <Tooltip text="AI가 두 분의 성향을 분석하여 최적의 대화 주제를 추천해줍니다.">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleGetAiIcebreaker}
                                    style={{
                                        background: 'linear-gradient(135deg, #FFD70030, #FFA50030)',
                                        border: '1px solid #FFD700',
                                        padding: '3px 10px',
                                        borderRadius: '100px',
                                        fontSize: '0.7rem',
                                        color: '#B8860B',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Sparkles size={11} /> AI 추천 질문
                                </motion.button>
                            </Tooltip>
                        </div>

                        {isLoadingAi ? (
                            <div style={{ textAlign: 'center', padding: '15px' }}>
                                <RefreshCw size={22} className="animate-spin" color="var(--primary)" />
                            </div>
                        ) : (
                            <>
                                {aiQuestions.length > 0 ? (
                                    aiQuestions.map((q, i) => (
                                        <motion.button
                                            key={`ai-${i}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => handlePromptClick(q)}
                                            style={{
                                                background: 'linear-gradient(135deg, #ffffff, #fdf4ff)',
                                                border: '1.5px solid #f0abfc',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '0.9rem',
                                                color: '#701a75'
                                            }}
                                        >
                                            ✨ {q}
                                        </motion.button>
                                    ))
                                ) : (
                                    randomPrompts.map((prompt, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handlePromptClick(prompt.text)}
                                            style={{
                                                background: 'white',
                                                border: '1.5px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.3rem' }}>{prompt.icon}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#2d3748' }}>{prompt.text}</span>
                                        </motion.button>
                                    ))
                                )}
                            </>
                        )}
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                background: 'white',
                borderTop: '1px solid #e2e8f0',
                padding: '10px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                paddingBottom: 'max(10px, env(safe-area-inset-bottom))'
            }}>
                <Tooltip text="이모지 선택">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            background: '#f8fafc',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Smile size={22} color="#4a5568" />
                    </motion.button>
                </Tooltip>

                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지를 입력하세요..."
                    style={{
                        flex: 1,
                        padding: '12px 18px',
                        borderRadius: '25px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />

                <Tooltip text={inputText.trim() ? "작성한 메시지를 전송합니다." : "메시지를 입력해주세요."}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        style={{
                            background: inputText.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e2e8f0',
                            border: 'none',
                            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                            padding: '12px 20px',
                            borderRadius: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.95rem'
                        }}
                    >
                        <Send size={18} />
                        전송
                    </motion.button>
                </Tooltip>
            </div>
        </div>
    );
};

// Message Bubble Component
const MessageBubble = ({ message, isOwn, delay }) => {
    if (message.isSystem) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                style={{
                    textAlign: 'center',
                    padding: '8px 16px',
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    color: '#64748b',
                    alignSelf: 'center',
                    maxWidth: '80%'
                }}
            >
                {message.text}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwn ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                alignSelf: isOwn ? 'flex-end' : 'flex-start'
            }}
        >
            {!isOwn && (
                <span style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    marginBottom: '5px',
                    marginLeft: '12px'
                }}>
                    {message.sender}
                </span>
            )}
            <div style={{
                background: isOwn
                    ? 'var(--primary)'
                    : 'white',
                color: isOwn ? 'white' : '#2d3748',
                padding: '12px 18px',
                borderRadius: isOwn
                    ? '20px 20px 5px 20px'
                    : '20px 20px 20px 5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                wordBreak: 'break-word',
                border: isOwn ? 'none' : '1px solid #e2e8f0'
            }}>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {message.content}
                </p>
            </div>
            <span style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                marginTop: '5px',
                marginLeft: isOwn ? '0' : '12px',
                marginRight: isOwn ? '12px' : '0'
            }}>
                {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </span>
        </motion.div>
    );
};

export default ChatPage;
