import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, MessageSquare, AlertTriangle, BarChart3,
    Settings, Search, ArrowUpRight, ShieldCheck,
    Trash2, UserCog, TrendingUp, Gem
} from 'lucide-react';
import { supabase } from '../supabase/client';

const AdminDashboardPage = ({ onBack }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        newMatches: 0,
        reports: 0,
        revenue: '0'
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                // 1. 통계 가져오기
                const { count: totalCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: activeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).not('last_login', 'is', null);
                
                setStats(prev => ({
                    ...prev,
                    totalUsers: totalCount || 0,
                    activeToday: activeCount || 0
                }));

                // 2. 유저 리스트 가져오기
                const { data: userList, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (userError) throw userError;
                setUsers(userList.map(u => ({
                    id: u.id,
                    name: u.username || '익명',
                    email: u.email || 'N/A',
                    mbti: u.mbti_type || '?',
                    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
                    status: 'Active' // 실제 상태 필드가 있다면 연동
                })));

            } catch (err) {
                console.error('Admin data fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const toggleStatus = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
    };

    const deleteUser = (id) => {
        if (window.confirm('정말 이 회원을 탈퇴 처리하시겠습니까?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleReport = (id, action) => {
        if (action === 'confirm') {
            alert('신고가 처리되었습니다. 해당 컨텐츠가 숨김 처리됩니다.');
        }
        setReports(reports.filter(r => r.id !== id));
    };

    const giveCrystals = async (id, name) => {
        const amount = prompt(`${name} 유저에게 지급할 크리스탈 양을 입력하세요:`, '100');
        if (amount && !isNaN(parseInt(amount))) {
            const added = parseInt(amount);
            try {
                const { data, error } = await supabase.from('profiles').select('crystals').eq('id', id).single();
                if (error) throw error;
                const currentCrystals = typeof data.crystals === 'number' ? data.crystals : 0;
                const newTotal = currentCrystals + added;
                
                const { error: updateError } = await supabase.from('profiles').update({ crystals: newTotal }).eq('id', id);
                if (updateError) throw updateError;
                
                alert(`${name} 유저에게 ${added}💎 크리스탈이 지급 되었습니다. (총 ${newTotal}💎)`);
            } catch (err) {
                console.error(err);
                alert('지급 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '0 0 60px 0' }}>
            {/* Admin Header */}
            <div style={{ background: '#0f172a', color: 'white', padding: '30px 5%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '8px', borderRadius: '12px' }}>
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>ADMIN CONSOLE</h1>
                            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>루미니 서비스 통합 관리 도구</p>
                        </div>
                    </div>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                        대시보드로 돌아가기
                    </button>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <StatCard icon={<Users color="#818cf8" />} label="전체 유저" value={stats.totalUsers} trend="+12%" />
                    <StatCard icon={<TrendingUp color="#34d399" />} label="오늘 활성" value={stats.activeToday} trend="+5%" />
                    <StatCard icon={<MessageSquare color="#f472b6" />} label="매칭 성공" value={stats.newMatches} trend="+24%" />
                    <StatCard icon={<Gem color="#fbbf24" />} label="매출 (KRW)" value={stats.revenue} trend="+8%" />
                </div>
            </div>

            <div style={{ padding: '30px 5%', display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '25px' }}>
                {/* User Management Section */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ margin: 0, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} color="#6366f1" /> 유저 관리
                        </h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="유저 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '10px 15px 10px 38px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '250px', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중...</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#64748b' }}>이름</th>
                                        <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#64748b' }}>MBTI</th>
                                        <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#64748b' }}>가입일</th>
                                        <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#64748b' }}>상태</th>
                                        <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '15px 10px' }}>
                                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.email}</div>
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', fontWeight: 800, fontSize: '0.75rem' }}>{user.mbti}</span>
                                            </td>
                                            <td style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#64748b' }}>{user.joined}</td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                                    color: user.status === 'Active' ? '#166534' : '#991b1b'
                                                }}>{user.status}</span>
                                            </td>
                                            <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => giveCrystals(user.id, user.name)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9333ea', padding: '5px' }} title="크리스탈 지급"><Gem size={18} /></button>
                                                <button
                                                    onClick={() => toggleStatus(user.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '5px' }} title="상태 변경"><UserCog size={18} /></button>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '5px' }} title="회원 탈퇴"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Side Sections */}
                <div style={{ display: 'grid', gap: '25px' }}>
                    {/* Content Reports */}
                    <div style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={20} color="#f59e0b" /> 신고 현황
                        </h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {reports.map(report => (
                                <div key={report.id} style={{ padding: '15px', borderRadius: '15px', background: '#fffbeb', border: '1px solid #fef3c7' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e' }}>신고자: {report.from}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#a16207' }}>{report.date}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600, marginBottom: '5px' }}>대상: {report.to}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#b45309' }}>사유: {report.reason}</div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <button
                                            onClick={() => handleReport(report.id, 'confirm')}
                                            style={{ flex: 1, padding: '6px', borderRadius: '8px', background: '#92400e', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>확인</button>
                                        <button
                                            onClick={() => handleReport(report.id, 'ignore')}
                                            style={{ flex: 1, padding: '6px', borderRadius: '8px', background: 'white', color: '#92400e', border: '1px solid #92400e', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>무시</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Settings */}
                    <div style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Settings size={20} color="#64748b" /> 시스템 관리
                        </h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <AdminControlItem label="가입 보상 크리스탈" value="50💎" color="#9333ea" />
                            <AdminControlItem label="매칭 성공 수수료" value="5%" color="#ec4899" />
                            <AdminControlItem label="공지사항 작성" action={<ArrowUpRight size={16} />} color="#6366f1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend }) => (
    <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px' }}>{icon}</div>
            <span style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 700 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? '#34d399' : '#f87171', fontWeight: 800 }}>{trend}</div>
        </div>
    </div>
);

const AdminControlItem = ({ label, value, action, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderRadius: '15px', background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: color, display: 'flex', alignItems: 'center' }}>
            {value} {action}
        </span>
    </div>
);

export default AdminDashboardPage;
