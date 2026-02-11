import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart2, PieChart as PieChartIcon, Activity, Users, Map as MapIcon, Loader } from 'lucide-react';
import { getMBTIDistribution, getMyActivityStats } from '../supabase/queries';
import useAuthStore from '../store/authStore';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00c49f', '#ff0000', '#00ff00', '#0000ff'];

const StatsPage = () => {
    const { user } = useAuthStore();
    const [mbtiData, setMbtiData] = useState([]);
    const [activityStats, setActivityStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [dist, stats] = await Promise.all([
                    getMBTIDistribution(),
                    user ? getMyActivityStats(user.id) : Promise.resolve(null)
                ]);
                setMbtiData(dist);
                setActivityStats(stats);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                padding: '20px 5%',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--glass-border)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChart2 color="var(--primary)" /> 루미니 인사이트 대시보드
                </h1>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px', display: 'grid', gap: '30px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader className="spin" size={40} color="var(--primary)" />
                    </div>
                ) : (
                    <>
                        {/* Personal Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <StatCard
                                icon={<Activity color="#8884d8" />}
                                label="내가 쓴 게시글"
                                value={activityStats?.postCount || 0}
                            />
                            <StatCard
                                icon={<Users color="#82ca9d" />}
                                label="참여 중인 하이브"
                                value={activityStats?.hiveCount || 0}
                            />
                            <StatCard
                                icon={<MapIcon color="#ffc658" />}
                                label="참가한 모임"
                                value={activityStats?.eventCount || 0}
                            />
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                            {/* MBTI Dist Pie */}
                            <section className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                                <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <PieChartIcon size={20} color="var(--primary)" /> 유형별 분포 (전체 유저)
                                </h3>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={mbtiData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                                nameKey="type"
                                            >
                                                {mbtiData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            {/* MBTI Dist Bar */}
                            <section className="glass-card" style={{ padding: '30px', background: 'var(--surface)' }}>
                                <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <BarChart2 size={20} color="var(--primary)" /> 유형별 데이터 정밀 비교
                                </h3>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mbtiData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                            <XAxis dataKey="type" stroke="var(--text-muted)" />
                                            <YAxis stroke="var(--text-muted)" />
                                            <Tooltip
                                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
                                            />
                                            <Bar dataKey="count" name="인원" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => (
    <motion.div
        whileHover={{ y: -5 }}
        style={{
            background: 'var(--surface)', padding: '25px', borderRadius: '22px',
            border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        }}
    >
        <div style={{
            width: '50px', height: '50px', borderRadius: '15px',
            background: 'var(--background)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>{icon}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>{value}</div>
    </motion.div>
);

export default StatsPage;
