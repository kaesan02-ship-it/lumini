import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Crown, Star, Zap, Gift, Check, ChevronRight, ArrowLeft, Sparkles, Coffee, Heart, CreditCard, AlertCircle, X } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';

const CHARGE_PACKAGES = [
    { id: 'starter', crystals: 50, price: '₩1,000', bonus: 0, popular: false, label: '스타터' },
    { id: 'basic', crystals: 150, price: '₩2,500', bonus: 10, popular: false, label: '기본' },
    { id: 'popular', crystals: 400, price: '₩5,900', bonus: 50, popular: true, label: '인기 🔥' },
    { id: 'premium', crystals: 900, price: '₩11,900', bonus: 150, popular: false, label: '프리미엄' },
];

const PREMIUM_PLANS = [
    {
        id: 'monthly',
        name: '루미 프리미엄',
        price: '₩9,900/월',
        crystalBonus: 200,
        features: [
            'AI 인사이트 무제한 열람',
            '매일 크리스탈 +20💎 추가 지급',
            '매칭 알고리즘 우선 노출',
            '전용 프리미엄 소울 카드 스킨',
            '광고 없는 경험',
        ],
        color: '#9333EA',
        gradient: ['#F3E8FF', '#E9D5FF'],
    },
    {
        id: 'yearly',
        name: '루미 프리미엄 연간',
        price: '₩79,900/년',
        crystalBonus: 3000,
        features: [
            '월간 구독 대비 33% 할인',
            '크리스탈 3,000💎 즉시 지급',
            '프리미엄 모든 혜택 포함',
            '전용 연간 멤버 배지',
        ],
        color: '#F59E0B',
        gradient: ['#FEF3C7', '#FDE68A'],
    },
];

const ITEMS = [
    { id: 'super-like', name: '슈퍼 좋아요', desc: '상대방에게 특별한 관심 표현', price: 30, emoji: '⭐', category: 'social' },
    { id: 'insight-unlock', name: 'AI 심층 인사이트', desc: '숨겨진 성향 분석 1회 열람', price: 20, emoji: '🔮', category: 'insight' },
    { id: 'boost', name: '매칭 부스트', desc: '24시간 매칭 노출 2배 증가', price: 80, emoji: '🚀', category: 'social' },
    { id: 'skin-cosmic', name: '코스믹 소울 스킨', desc: '우주를 담은 희귀 소울 카드 스킨', price: 120, emoji: '🌌', category: 'skin' },
    { id: 'skin-bloom', name: '블룸 소울 스킨', desc: '꽃이 피어나는 프리미엄 스킨', price: 120, emoji: '🌸', category: 'skin' },
    { id: 'date-coupon', name: '데이트 코스 쿠폰', desc: '제휴 카페 10% 할인 쿠폰', price: 50, emoji: '☕', category: 'partner' },
];

const PAYMENT_METHODS = [
    { id: 'kakaopay', label: '카카오페이', emoji: '💛', pg: 'kakaopay' },
    { id: 'tosspay', label: '토스페이', emoji: '💙', pg: 'tosspay' },
    { id: 'card', label: '신용카드', emoji: '💳', pg: 'html5_inicis' },
];

const MERCHANT_ID = 'imp10391932'; // PortOne 테스트 가맹점 ID

const ShopPage = ({ onBack }) => {
    const { crystals, chargeCrystals, spendCrystals, isPremium, activatePremium } = useCrystalStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('charge');
    const [purchasedItem, setPurchasedItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentPending, setPaymentPending] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [pendingPkg, setPendingPkg] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('kakaopay');
    const [payError, setPayError] = useState(null);

    // ─── PortOne 실제 결제 요청 ───────────────────────────
    const requestPayment = useCallback(({ name, price, crystalAmount, crystalLabel, isPremiumPlan, premiumDays }) => {
        if (typeof window.IMP === 'undefined') {
            alert('결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        window.IMP.init(MERCHANT_ID);
        const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
        setPaymentPending(true);
        setShowPayModal(false);
        setPayError(null);

        window.IMP.request_pay(
            {
                pg: method.pg,
                pay_method: method.id === 'card' ? 'card' : method.id,
                merchant_uid: `lumini_${Date.now()}`,
                name,
                amount: price,
                buyer_name: user?.user_metadata?.username || '루미니 유저',
                buyer_email: user?.email || 'test@lumini.app',
            },
            (rsp) => {
                setPaymentPending(false);
                if (rsp.success) {
                    if (isPremiumPlan) {
                        activatePremium(premiumDays);
                    }
                    chargeCrystals(crystalAmount);
                    setPurchasedItem(`${crystalLabel} 충전 완료! ✨`);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                } else {
                    setPayError(rsp.error_msg || '결제가 취소되었습니다.');
                    setTimeout(() => setPayError(null), 4000);
                }
            }
        );
    }, [selectedMethod, user, chargeCrystals, activatePremium]);

    const handleCharge = (pkg) => {
        const total = pkg.crystals + pkg.bonus;
        setPendingPkg({ name: `루미니 크리스탈 ${total}💎`, price: parseInt(pkg.price.replace(/[₩,]/g, '')), crystalAmount: total, crystalLabel: `${total}💎` });
        setShowPayModal(true);
    };

    const handleBuyItem = (item) => {
        const success = spendCrystals(item.price);
        if (success) {
            setPurchasedItem(`${item.name} 구매 완료!`);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } else {
            alert(`크리스탈이 부족합니다. 현재 ${crystals}💎 보유 중입니다.`);
        }
    };

    const handleBuyPremium = (plan) => {
        const priceStr = plan.price.split('/')[0];
        const priceNum = parseInt(priceStr.replace(/[₩,]/g, ''));
        setPendingPkg({
            name: plan.name,
            price: priceNum,
            crystalAmount: plan.crystalBonus || 0,
            crystalLabel: `${plan.name} 활성화 + ${plan.crystalBonus}💎`,
            isPremiumPlan: true,
            premiumDays: plan.id === 'yearly' ? 365 : 30,
        });
        setShowPayModal(true);
    };

    const confirmPayment = () => {
        if (!pendingPkg) return;
        requestPayment(pendingPkg);
    };

    const tabs = [
        { id: 'charge', label: '💎 충전', icon: <Gem size={16} /> },
        { id: 'premium', label: '👑 프리미엄', icon: <Crown size={16} /> },
        { id: 'items', label: '🎁 아이템', icon: <Gift size={16} /> },
        { id: 'partner', label: '☕ 제휴', icon: <Coffee size={16} /> },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{
                padding: '20px 5%',
                background: 'linear-gradient(135deg, #9333EA, #7C3AED)',
                color: 'white',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    {onBack && (
                        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>루미 상점</h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>크리스탈로 특별한 경험을 열어보세요</p>
                    </div>
                </div>

                {/* Crystal Balance */}
                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    padding: '20px 25px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '5px' }}>보유 크리스탈</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Gem size={28} />
                            {crystals.toLocaleString()}
                        </div>
                    </div>
                    {isPremium && (
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Crown size={16} />
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>프리미엄</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '20px 5% 0', background: 'var(--surface)', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px 12px 0 0',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '25px 5%' }}>
                <AnimatePresence mode="wait">
                    {/* 충전 탭 */}
                    {activeTab === 'charge' && (
                        <motion.div key="charge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
                                💡 크리스탈을 충전하여 특별한 기능을 경험해 보세요!
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                {CHARGE_PACKAGES.map(pkg => (
                                    <motion.div
                                        key={pkg.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCharge(pkg)}
                                        style={{
                                            border: pkg.popular ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                            borderRadius: '20px',
                                            padding: '22px',
                                            background: pkg.popular ? 'var(--primary-faint)' : 'var(--surface)',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {pkg.popular && (
                                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '3px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>인기</div>
                                        )}
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💎</div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>
                                            {(pkg.crystals + pkg.bonus).toLocaleString()}
                                        </div>
                                        {pkg.bonus > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>+{pkg.bonus} 보너스!</div>
                                        )}
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{pkg.price}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* 무료 획득 방법 */}
                            <div style={{ marginTop: '30px', background: 'var(--surface)', borderRadius: '20px', padding: '25px', border: '1px solid var(--glass-border)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>✨ 무료로 받는 방법</h3>
                                {[
                                    { action: '매일 출석 체크', reward: '+30💎', icon: '📅' },
                                    { action: '데일리 챌린지 완료', reward: '+10💎', icon: '🎯' },
                                    { action: '대화 10분 이상', reward: '+8💎', icon: '💬' },
                                    { action: '친구 초대', reward: '+50💎', icon: '👥' },
                                ].map(item => (
                                    <div key={item.action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                                            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.action}</span>
                                        </div>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.reward}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* 프리미엄 탭 */}
                    {activeTab === 'premium' && (
                        <motion.div key="premium" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                                👑 프리미엄 멤버가 되어 루미니의 모든 것을 경험해 보세요.
                            </p>
                            {PREMIUM_PLANS.map(plan => (
                                <div key={plan.id} style={{
                                    background: `linear-gradient(135deg, ${plan.gradient[0]}, ${plan.gradient[1]})`,
                                    border: `2px solid ${plan.color}30`,
                                    borderRadius: '24px',
                                    padding: '28px',
                                    marginBottom: '20px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: plan.color, marginBottom: '5px' }}>{plan.name}</h3>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{plan.price}</div>
                                            {plan.crystalBonus > 0 && (
                                                <div style={{ fontSize: '0.85rem', color: plan.color, fontWeight: 700, marginTop: '5px' }}>💎 {plan.crystalBonus.toLocaleString()} 크리스탈 즉시 지급</div>
                                            )}
                                        </div>
                                        <Crown size={40} color={plan.color} />
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                                        {plan.features.map(f => (
                                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                <Check size={16} color={plan.color} />
                                                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleBuyPremium(plan)}
                                        disabled={isPremium}
                                        style={{
                                            width: '100%', padding: '16px', borderRadius: '14px',
                                            background: isPremium ? '#e2e8f0' : plan.color,
                                            color: isPremium ? '#94a3b8' : 'white',
                                            border: 'none', fontWeight: 800, fontSize: '1.1rem',
                                            cursor: isPremium ? 'default' : 'pointer',
                                        }}
                                    >
                                        {isPremium ? '✓ 이미 프리미엄 회원입니다' : '지금 시작하기'}
                                    </motion.button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* 아이템 탭 */}
                    {activeTab === 'items' && (
                        <motion.div key="items" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>크리스탈로 특별한 아이템을 구매하세요</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-faint)', padding: '6px 14px', borderRadius: '100px', color: 'var(--primary)', fontWeight: 800 }}>
                                    <Gem size={14} /> {crystals}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '14px' }}>
                                {ITEMS.filter(i => i.category !== 'partner').map(item => (
                                    <motion.div key={item.id} whileHover={{ scale: 1.01 }} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: 'var(--surface)', borderRadius: '18px', padding: '18px 22px',
                                        border: '1px solid var(--glass-border)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ fontSize: '2.2rem' }}>{item.emoji}</div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px' }}>{item.desc}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleBuyItem(item)}
                                            style={{
                                                background: crystals >= item.price ? 'var(--primary)' : '#e2e8f0',
                                                color: crystals >= item.price ? 'white' : '#94a3b8',
                                                border: 'none', borderRadius: '12px', padding: '10px 18px',
                                                fontWeight: 800, cursor: crystals >= item.price ? 'pointer' : 'default',
                                                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            <Gem size={14} /> {item.price}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* 제휴 쿠폰 탭 */}
                    {activeTab === 'partner' && (
                        <motion.div key="partner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1px solid #F59E0B30' }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '5px' }}>☕ Soul-Mate Spot</div>
                                <div style={{ fontSize: '0.88rem', color: '#92400E' }}>성향에 맞는 장소에서 만나보세요. 루미니 파트너십 쿠폰!</div>
                            </div>
                            {[
                                { name: '감성카페 루나', desc: 'INFP/ISFP 타입 추천 카페', discount: '15%', crystals: 40, emoji: '🌙', address: '서울 마포구' },
                                { name: '보드게임카페 인터렉트', desc: '외향형 타입 최고의 만남의 장소', discount: '20%', crystals: 50, emoji: '🎲', address: '서울 홍대' },
                                { name: '북카페 인트로버트', desc: 'I 타입을 위한 조용한 독서 공간', discount: '10%', crystals: 30, emoji: '📚', address: '서울 연남동' },
                                { name: '야경 루프탑 바 엑스트라', desc: 'E 타입의 파티 감성 핫플', discount: '25%', crystals: 60, emoji: '🌆', address: '서울 이태원' },
                            ].map(place => (
                                <div key={place.name} style={{
                                    background: 'var(--surface)', borderRadius: '20px', padding: '20px 22px',
                                    border: '1px solid var(--glass-border)', marginBottom: '14px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ fontSize: '2rem' }}>{place.emoji}</div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{place.name}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{place.address}</div>
                                            </div>
                                        </div>
                                        <div style={{ background: '#10b98115', color: '#10b981', padding: '4px 12px', borderRadius: '100px', fontWeight: 800, fontSize: '0.85rem' }}>{place.discount} 할인</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{place.desc}</div>
                                    <button
                                        onClick={() => handleBuyItem({ name: `${place.name} 쿠폰`, price: place.crystals })}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '12px',
                                            background: crystals >= place.crystals ? 'var(--primary-faint)' : '#f1f5f9',
                                            color: crystals >= place.crystals ? 'var(--primary)' : '#94a3b8',
                                            border: `1px solid ${crystals >= place.crystals ? 'var(--primary)' : '#e2e8f0'}`,
                                            fontWeight: 800, cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        }}
                                    >
                                        <Gem size={15} /> {place.crystals}💎로 쿠폰 받기
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 결제 확인 모달 */}
            <AnimatePresence>
                {showPayModal && pendingPkg && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowPayModal(false); }}
                    >
                        <motion.div
                            initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                            transition={{ type: 'spring', damping: 28 }}
                            style={{ background: 'var(--surface)', borderRadius: '28px 28px 0 0', padding: '28px', width: '100%', maxWidth: '560px', boxShadow: '0 -20px 60px rgba(0,0,0,0.2)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem' }}>💳 결제 확인</h3>
                                <button onClick={() => setShowPayModal(false)} style={{ background: 'var(--background)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* 상품 요약 */}
                            <div style={{ background: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)', borderRadius: '18px', padding: '18px 22px', marginBottom: '20px' }}>
                                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#7C3AED', marginBottom: '4px' }}>{pendingPkg.name}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{pendingPkg.price?.toLocaleString()}원</div>
                            </div>

                            {/* 결제 수단 선택 */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontWeight: 800, marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>결제 수단 선택</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {PAYMENT_METHODS.map(m => (
                                        <motion.button key={m.id} whileTap={{ scale: 0.96 }}
                                            onClick={() => setSelectedMethod(m.id)}
                                            style={{ padding: '12px 8px', borderRadius: '14px', border: `2px solid ${selectedMethod === m.id ? '#9333EA' : 'var(--glass-border)'}`, background: selectedMethod === m.id ? '#F3E8FF' : 'var(--surface)', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: selectedMethod === m.id ? '#7C3AED' : 'var(--text)' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                                            {m.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* 콜 투 액션 버튼 */}
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={confirmPayment}
                                disabled={paymentPending}
                                style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, #9333EA, #7C3AED)', color: 'white', border: 'none', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <CreditCard size={20} />
                                {paymentPending ? '결제 처리 중...' : `지금 결제하기`}
                            </motion.button>
                            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>PortOne 보안 결제 · SSL 암호화</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%',
                            background: '#10b981', color: 'white',
                            padding: '14px 28px', borderRadius: '100px',
                            fontWeight: 800, fontSize: '1rem',
                            boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
                            zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px',
                        }}
                    >
                        <Check size={20} /> {purchasedItem}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 결제 오류 Toast */}
            <AnimatePresence>
                {payError && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%',
                            background: '#EF4444', color: 'white',
                            padding: '14px 28px', borderRadius: '100px',
                            fontWeight: 800, fontSize: '0.95rem',
                            boxShadow: '0 8px 30px rgba(239,68,68,0.4)',
                            zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px',
                            maxWidth: '320px', textAlign: 'center',
                        }}
                    >
                        <AlertCircle size={20} /> {payError}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShopPage;
