import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, BookOpen, Plus, Loader, ChevronRight } from 'lucide-react';
import { getPersonalityHistory, getGrowthLogs, createGrowthLog } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const GrowthTrackingPage = ({ onBack, onRetest }) => {
    const { user } = useAuthStore();
    const [history, setHistory] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newLog, setNewLog] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [historyData, logsData] = await Promise.all([
                    getPersonalityHistory(user.id),
                    getGrowthLogs(user.id)
                ]);
                setHistory(historyData);
                setLogs(logsData);
            } catch (err) {
                console.error('Failed to fetch growth data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleAddLog = async (e) => {
        e.preventDefault();
        if (!newLog.trim() || !user) return;

        try {
            setIsSubmitting(true);
            const log = await createGrowthLog({
                user_id: user.id,
                content: newLog
            });
            setLogs(prev => [log, ...prev]);
            setNewLog('');
        } catch (err) {
            console.error('Failed to create log:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 차트 데이터 변환
    const chartData = history.map(h => ({
        date: new Date(h.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        open: h.openness || 0,
        cons: h.conscientiousness || 0,
        extra: h.extraversion || 0,
        agree: h.agreeableness || 0,
        neuro: h.neuroticism || 0
    }));

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
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>개인 성장 트래킹</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetest}
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
                    <TrendingUp size={18} /> 진단 다시하기
                </motion.button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader className="spin" size={40} color="var(--primary)" />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '40px' }}>
                        {/* Trend Chart */}
                        <section className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TrendingUp size={20} color="var(--primary)" /> 성격 변화 추이
                            </h3>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--surface)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px',
                                                color: 'var(--text)'
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="open" name="개방성" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="cons" name="성실성" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="extra" name="외향성" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="agree" name="친화성" stroke="#ff8042" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="neuro" name="신경증" stroke="#00c49f" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* Growth Log Form */}
                        <section className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BookOpen size={20} color="var(--primary)" /> 성장 일지 쓰기
                            </h3>
                            <form onSubmit={handleAddLog}>
                                <textarea
                                    value={newLog}
                                    onChange={(e) => setNewLog(e.target.value)}
                                    placeholder="오늘의 성장 포인트나 느낀 점을 기록해보세요."
                                    style={{
                                        width: '100%', padding: '15px', borderRadius: '15px',
                                        background: 'var(--background)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text)', outline: 'none', minHeight: '120px',
                                        resize: 'none', marginBottom: '15px'
                                    }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting || !newLog.trim()}
                                    className="primary"
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        fontWeight: 700, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <Plus size={18} /> {isSubmitting ? '저장 중...' : '기록 저장'}
                                </motion.button>
                            </form>
                        </section>

                        {/* Recent Logs List */}
                        <section>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)' }}>
                                <Calendar size={20} color="var(--primary)" /> 최근 일지
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {logs.map((log, idx) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{
                                            background: 'var(--surface)', padding: '20px',
                                            borderRadius: '18px', border: '1px solid var(--glass-border)',
                                            boxShadow: 'var(--shadow)'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                            {new Date(log.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text)' }}>{log.content}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrowthTrackingPage;
