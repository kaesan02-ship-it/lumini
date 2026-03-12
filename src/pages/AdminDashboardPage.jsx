import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, TrendingUp, ShieldCheck, UserPlus, 
    Search, Filter, ChevronRight, MoreVertical,
    Activity, Database, LogOut, Settings,
    BarChart3, RefreshCcw, UserCircle, 
    Moon, Sun, Bell, LayoutDashboard, UserCheck,
    Gem, Zap, HelpCircle, AlertCircle
} from 'lucide-react';
import { supabase } from '../supabase/client';
import Badge from '../components/Badge';
import ProfileModal from '../components/ProfileModal';
import Tooltip from '../components/Tooltip';

const AdminDashboardPage = () => {
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        mbtiCount: {},
        activeNow: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const { data: membersData, error } = await supabase
                .from('profiles')
                .select('id, username, mbti_type, bio, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // 데이터 매핑 (기존 필드명 대응)
            const mappedMembers = membersData.map(m => ({
                ...m,
                name: m.username || m.name || '익명',
                mbti: m.mbti_type || m.mbti || 'N/A'
            }));
            
            setMembers(mappedMembers);

            // 통계 계산
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayJoined = mappedMembers.filter(m => new Date(m.created_at) >= today).length;
            const mbtiStats = mappedMembers.reduce((acc, curr) => {
                const mbti = curr.mbti || '미정';
                acc[mbti] = (acc[mbti] || 0) + 1;
                return acc;
            }, {});

            setStats({
                total: mappedMembers.length,
                today: todayJoined,
                mbtiCount: mbtiStats,
                activeNow: Math.floor(Math.random() * 10) + 5 // 상징적인 데이터
            });
        } catch (err) {
            console.error('Admin data fetch error:', err);
        } finally {
            setTimeout(() => {
                setLoading(false);
                setIsRefreshing(false);
            }, 500); // 부드러운 전환을 위한 지연
        }
    };

    const filteredMembers = members.filter(m => 
        (m.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.mbti?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] gap-6">
            <motion.div 
                animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                }} 
                transition={{ 
                    rotate: { repeat: Infinity, duration: 1.5, ease: "linear" },
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                className="text-primary"
            >
                <div className="p-5 bg-white rounded-3xl shadow-2xl shadow-primary/20">
                    <RefreshCcw size={48} />
                </div>
            </motion.div>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-black text-slate-400 uppercase tracking-widest italic"
            >
                Synchronizing Data...
            </motion.p>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="p-2.5 bg-gradient-to-tr from-primary to-indigo-400 rounded-2xl text-white shadow-lg shadow-primary/20">
                        <ShieldCheck size={26} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900">LUMINI</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Control</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { id: 'overview', icon: <LayoutDashboard size={20} />, label: '대시보드 요약' },
                        { id: 'members', icon: <Users size={20} />, label: '회원 관리' },
                        { id: 'verification', icon: <UserCheck size={20} />, label: '인증 승인' },
                        { id: 'system', icon: <Database size={20} />, label: '시스템 로그' },
                        { id: 'settings', icon: <Settings size={20} />, label: '서비스 설정' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between group px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                                activeTab === item.id 
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 -translate-y-0.5' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                {item.icon}
                                {item.label}
                            </div>
                            {activeTab !== item.id && (
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 mt-8 border-t border-slate-100 italic text-[11px] text-slate-400 text-center">
                    &copy; 2024 Lumini Space Management
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-10 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden p-2 bg-slate-100 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 capitalize italic">
                            {activeTab === 'overview' ? 'Dashboard Overview' : 'Member Management'}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                            <Activity size={14} className="text-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">System Normal</span>
                        </div>
                        
                        <div className="h-8 w-px bg-slate-200 mx-1"></div>
                        
                        <Tooltip text="중요한 알림을 확인합니다.">
                            <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all relative">
                                <Bell size={22} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>
                        </Tooltip>
                        
                        <Tooltip text="데이터를 최신 상태로 수동 갱신합니다.">
                            <button 
                                onClick={fetchData}
                                className={`p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                            >
                                <RefreshCcw size={22} />
                            </button>
                        </Tooltip>
                    </div>
                </header>

                <div className="p-10 max-w-[1600px] mx-auto min-h-full">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' ? (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                {/* Hero Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[
                                        { label: 'Total Members', value: stats.total, sub: '전체 등록 사용자', icon: <Users />, theme: 'from-blue-500 to-indigo-600' },
                                        { label: 'New Today', value: `+${stats.today}`, sub: '오늘 새로 가입한 회원', icon: <UserPlus />, theme: 'from-emerald-400 to-teal-600' },
                                        { label: 'Live Traffic', value: stats.activeNow, sub: '현재 활동 중인 사용자', icon: <Activity />, theme: 'from-rose-400 to-pink-600' },
                                        { label: 'Growth rate', value: '+18%', sub: '지난 달 대비 성장률', icon: <TrendingUp />, theme: 'from-amber-400 to-orange-600' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.theme} text-white flex items-center justify-center mb-6 shadow-lg relative z-10`}>
                                                {s.icon}
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{s.label}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black text-slate-900">{s.value}</span>
                                                </div>
                                                <p className="text-slate-400 text-[11px] mt-4 font-bold">{s.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* MBTI Distribution */}
                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2 italic tracking-tight">MBTI Community Insights</h3>
                                            <p className="text-slate-400 text-sm font-bold">커뮤니티 내 성향 분포 분석</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Tooltip text="현재 데이터를 CSV 또는 PDF로 내보냅니다.">
                                                <button className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-all border border-slate-100">보고서 내보내기</button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-3">
                                        {Object.entries(stats.mbtiCount).length > 0 ? (
                                            Object.entries(stats.mbtiCount).sort((a,b) => b[1] - a[1]).map(([type, count]) => (
                                                <div key={type} className="flex flex-col items-center group">
                                                    <div className="w-full bg-slate-50 h-48 rounded-2xl relative overflow-hidden mb-4 border border-slate-100/50">
                                                        <motion.div 
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${Math.max(10, (count / stats.total) * 100)}%` }}
                                                            transition={{ type: 'spring', damping: 15 }}
                                                            className="absolute bottom-0 w-full bg-primary/10 border-t-4 border-primary/40 group-hover:bg-primary/20 transition-all"
                                                        />
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-lg font-black text-primary drop-shadow-sm">{count}</span>
                                                            <span className="text-[10px] font-bold text-primary/40">Users</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-700 tracking-tighter uppercase">{type}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">
                                                No distribution data available yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="members"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-8"
                            >
                                {/* Member Management Header */}
                                <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                                    <div className="relative w-full xl:w-[500px]">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            type="text" 
                                            placeholder="Member name, email, or personality type..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 w-full xl:w-auto">
                                        <Tooltip text="검색 조건을 상세하게 설정합니다.">
                                            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-5 bg-white text-slate-600 rounded-[2rem] text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                                                <Filter size={20} />
                                                Advanced Filter
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="새로운 멤버를 서비스에 초대합니다.">
                                            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-sm font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all active:translate-y-0">
                                                <UserPlus size={20} />
                                                Invite Member
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Modern Member Card Grid or Table */}
                                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[1000px]">
                                            <thead>
                                                <tr className="bg-slate-50/50 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-100">
                                                    <th className="px-10 py-7">Profile Information</th>
                                                    <th className="px-8 py-7">Account Details</th>
                                                    <th className="px-8 py-7">Personality & Soul</th>
                                                    <th className="px-8 py-7">Access Level</th>
                                                    <th className="px-10 py-7 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredMembers.map((m) => (
                                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 shadow-inner group-hover:scale-110 transition-transform">
                                                                    {m.avatar_url ? (
                                                                        <img src={m.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                                                    ) : (
                                                                        <UserCircle size={32} />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-slate-900 text-base">{m.name}</div>
                                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{m.district || 'Location Private'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-sm font-bold text-slate-600">{m.email}</div>
                                                            <div className="text-[10px] text-slate-400 font-heavy tracking-tighter mt-1 italic">Joined {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Unknown'}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-3 py-1.5 bg-primary/5 text-primary rounded-xl font-black text-xs uppercase border border-primary/10 tracking-wider">
                                                                    {m.mbti}
                                                                </span>
                                                                {m.deep_soul ? (
                                                                    <Tooltip text="Deep Soul Recorded" position="right">
                                                                        <Badge variant="warning" size="sm" icon={Gem} className="opacity-90">
                                                                            Deep Soul
                                                                        </Badge>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Badge variant="default" size="sm" icon={HelpCircle} className="opacity-40">
                                                                        No Data
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <Badge 
                                                                variant={m.is_admin ? 'indigo' : 'success'} 
                                                                size="sm" 
                                                                pulse={m.is_admin}
                                                            >
                                                                {m.is_admin ? 'Admin' : 'User'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <Tooltip text="멤버의 프로필 정보를 상세히 확인합니다.">
                                                                    <button 
                                                                        onClick={() => setSelectedMember(m)}
                                                                        className="px-6 py-2.5 bg-slate-900 text-white rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                                                    >
                                                                        View Profile
                                                                    </button>
                                                                </Tooltip>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredMembers.length === 0 && (
                                        <div className="p-32 text-center flex flex-col items-center gap-4">
                                            <div className="p-5 bg-slate-50 rounded-full text-slate-200">
                                                <Users size={40} />
                                            </div>
                                            <p className="text-slate-400 font-heavy italic tracking-tight">No match found for your query.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Profile Modal integration */}
            {selectedMember && (
                <ProfileModal 
                    user={selectedMember} 
                    onClose={() => setSelectedMember(null)}
                    mbtiType={selectedMember.mbti}
                    userName={selectedMember.name}
                />
            )}

            {/* Global Tooltip Portal could go here */}
        </div>
    );
};

export default AdminDashboardPage;
