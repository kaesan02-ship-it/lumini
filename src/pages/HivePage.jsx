import React from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';

const HivePage = ({ chatMessages, chatInput, setChatInput, onSendMessage, userName, onBack }) => {
    return (
        <motion.div
            key="hive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ padding: '20px 0', maxWidth: '900px', margin: 'auto' }}
        >
            <div className="glass-card" style={{ height: '75vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
                <div style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button
                            onClick={onBack}
                            style={{ background: 'transparent', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <ArrowLeft size={20} color="var(--text)" />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>🐝 조용한 북카페 하이브</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>실시간 접속 중: 6명</p>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {chatMessages.map((msg, i) => (
                        <div key={i} style={{
                            alignSelf: msg.isSystem ? 'center' : (msg.sender === userName ? 'flex-end' : 'flex-start'),
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === userName ? 'flex-end' : 'flex-start',
                            gap: '6px',
                            maxWidth: '80%'
                        }}>
                            {!msg.isSystem && (
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: msg.sender === userName ? '0' : '8px' }}>
                                    {msg.sender}
                                </span>
                            )}
                            <div style={{
                                background: msg.isSystem ? 'transparent' : (msg.sender === userName ? 'var(--primary)' : '#f1f5f9'),
                                color: msg.isSystem ? 'var(--secondary)' : (msg.sender === userName ? 'white' : 'var(--text)'),
                                padding: '12px 18px',
                                borderRadius: msg.isSystem ? '0' : (msg.sender === userName ? '20px 4px 20px 20px' : '4px 20px 20px 20px'),
                                fontSize: msg.isSystem ? '0.85rem' : '1rem',
                                border: msg.isSystem ? 'none' : '1px solid #f1f5f9',
                                boxShadow: msg.isSystem ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '25px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
                    <input
                        style={{
                            flex: 1,
                            padding: '15px 20px',
                            borderRadius: '15px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && onSendMessage()}
                        placeholder="따뜻한 대화를 나눠보세요..."
                    />
                    <button
                        onClick={onSendMessage}
                        className="primary"
                        style={{ padding: '12px 24px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default HivePage;
