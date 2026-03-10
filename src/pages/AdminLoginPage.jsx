import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Lock, User, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminLoginPage = ({ onAuthSuccess, onBack }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            if (id === 'admin' && password === 'lumini2026!') {
                toast.success('관리자 권한을 인증했습니다.', { icon: '🛡️' });
                onAuthSuccess();
            } else {
                toast.error('관리자 정보가 일치하지 않습니다.');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'var(--background)', zIndex: 10000,
                    display: 'flex', flexDirection: 'column',
                    padding: '20px'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', paddingTop: '20px' }}>
                    <button onClick={onBack} style={{ background: 'var(--surface)', color: 'var(--text)', border: 'none', padding: '12px', borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow)', display: 'flex' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ flex: 1, textAlign: 'center', marginRight: '48px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>관리자 접근</h2>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px' }}>
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                        style={{
                            width: '90px', height: '90px', borderRadius: '30px',
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)', marginBottom: '30px'
                        }}
                    >
                        <ShieldCheck size={48} color="white" />
                    </motion.div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', marginBottom: '10px' }}>루미니 관리자 콘솔</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontWeight: 600 }}>승인된 관리자만 접근할 수 있습니다.</p>

                    <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <User size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="관리자 ID"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '2px solid transparent', background: 'var(--surface)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', outline: 'none', transition: 'all 0.2s' }}
                                required
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                placeholder="관리자 비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '2px solid transparent', background: 'var(--surface)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', outline: 'none', transition: 'all 0.2s' }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !id || !password}
                            style={{
                                width: '100%', padding: '18px', borderRadius: '16px',
                                background: (loading || !id || !password) ? 'var(--glass-border)' : 'var(--text)',
                                color: (loading || !id || !password) ? 'var(--text-muted)' : 'var(--background)',
                                border: 'none', fontSize: '1.1rem', fontWeight: 800, cursor: (loading || !id || !password) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                transition: 'all 0.2s', marginTop: '10px', boxShadow: (loading || !id || !password) ? 'none' : '0 10px 20px rgba(0,0,0,0.1)'
                            }}
                        >
                            {loading ? <Loader className="animate-spin" size={24} /> : '인증 및 접속'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminLoginPage;
