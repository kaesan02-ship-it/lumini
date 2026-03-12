import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, Check, X } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';
import Tooltip from '../components/Tooltip';

// ─── 아이템 카탈로그 ───────────────────────────────────────────────
const ITEMS = [
    // 모자 / 머리장식
    { id: 'hat_star', name: '별 왕관', icon: '⭐', price: 50, category: 'hat', layer: 'top', style: { fontSize: '2.4rem', top: '-38px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'hat_flower', name: '꽃 리본', icon: '🌸', price: 30, category: 'hat', layer: 'top', style: { fontSize: '2rem', top: '-32px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'hat_gem', name: '보석 티아라', icon: '👑', price: 120, category: 'hat', layer: 'top', style: { fontSize: '2.2rem', top: '-36px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'hat_rainbow', name: '무지개 띠', icon: '🌈', price: 80, category: 'hat', layer: 'top', style: { fontSize: '2rem', top: '-32px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'hat_santa', name: '산타 모자', icon: '🎅', price: 45, category: 'hat', layer: 'top', style: { fontSize: '2.2rem', top: '-35px', left: '50%', transform: 'translateX(-50%)' } },
    // 소품 / 액세서리
    { id: 'acc_scarf', name: '목도리', icon: '🧣', price: 35, category: 'acc', layer: 'bottom', style: { fontSize: '1.8rem', bottom: '0px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'acc_glasses', name: '귀여운 안경', icon: '👓', price: 25, category: 'acc', layer: 'mid', style: { fontSize: '1.6rem', top: '10px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'acc_fish', name: '물고기 친구', icon: '🐟', price: 60, category: 'acc', layer: 'side', style: { fontSize: '1.6rem', bottom: '8px', right: '-20px' } },
    { id: 'acc_heart', name: '하트 볼터치', icon: '❤️', price: 20, category: 'acc', layer: 'side', style: { fontSize: '1.2rem', top: '16px', left: '-16px' } },
    { id: 'acc_music', name: '음표', icon: '🎵', price: 15, category: 'acc', layer: 'float', style: { fontSize: '1.4rem', top: '-20px', right: '-12px' } },
    { id: 'acc_pearl', name: '진주 목걸이', icon: '📿', price: 90, category: 'acc', layer: 'bottom', style: { fontSize: '1.6rem', bottom: '2px', left: '50%', transform: 'translateX(-50%)' } },
    // 배경
    { id: 'bg_ocean', name: '바다 배경', icon: '🌊', price: 40, category: 'bg', bg: 'ocean' },
    { id: 'bg_forest', name: '숲 배경', icon: '🌲', price: 40, category: 'bg', bg: 'forest' },
    { id: 'bg_space', name: '우주 배경', icon: '🌌', price: 80, category: 'bg', bg: 'space' },
    { id: 'bg_cherry', name: '벚꽃 정원', icon: '🌸', price: 60, category: 'bg', bg: 'cherry' },
    { id: 'bg_rainy', name: '비 오는 날', icon: '🌧️', price: 50, category: 'bg', bg: 'rain' },
];

// ─── 배경 컴포넌트 ────────────────────────────────────────────────
const BgOcean = () => (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 60%, #0369a1 100%)', overflow: 'hidden' }}>
        {/* 파도 1 */}
        <motion.div animate={{ x: [0, -40, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: 20, left: '-10%', right: '-10%', height: '50px', background: 'rgba(255,255,255,0.25)', borderRadius: '50% 50% 0 0' }} />
        <motion.div animate={{ x: [0, 30, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{ position: 'absolute', bottom: 8, left: '-10%', right: '-10%', height: '38px', background: 'rgba(255,255,255,0.18)', borderRadius: '50% 50% 0 0' }} />
        {/* 거품들 */}
        {[10, 30, 55, 75, 90].map((l, i) => (
            <motion.div key={i} animate={{ y: [0, -20, 0], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.4 }}
                style={{ position: 'absolute', bottom: 35 + (i % 3) * 8, left: `${l}%`, width: 8 + (i % 2) * 4, height: 8 + (i % 2) * 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
        ))}
        <div style={{ position: 'absolute', top: 10, right: 20, fontSize: '1.2rem' }}>⛅</div>
    </div>
);

const BgForest = () => (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #86efac 0%, #22c55e 50%, #166534 100%)', overflow: 'hidden' }}>
        {[15, 35, 60, 80].map((l, i) => (
            <motion.div key={i}
                animate={{ rotate: [0, i % 2 === 0 ? 3 : -3, 0] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: 0, left: `${l}%`, fontSize: `${2.2 + (i % 2) * 0.6}rem` }}>
                {i % 2 === 0 ? '🌲' : '🌳'}
            </motion.div>
        ))}
        <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ position: 'absolute', bottom: 12, left: '45%', fontSize: '1rem' }}>🍄</motion.div>
        <div style={{ position: 'absolute', top: 10, left: 20, fontSize: '1.2rem' }}>🌤️</div>
        <motion.div animate={{ x: [0, 80, 160], opacity: [0, 1, 0] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            style={{ position: 'absolute', top: 30, left: 0, fontSize: '0.9rem' }}>🦋</motion.div>
    </div>
);

const BgSpace = () => (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 60%, #24243e 100%)', overflow: 'hidden' }}>
        {Array.from({ length: 18 }).map((_, i) => (
            <motion.div key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
                style={{ position: 'absolute', top: `${5 + (i * 13) % 75}%`, left: `${(i * 17) % 95}%`, width: 2 + (i % 3), height: 2 + (i % 3), borderRadius: '50%', background: 'white' }} />
        ))}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', top: 15, right: 25, fontSize: '1.4rem' }}>🪐</motion.div>
        <div style={{ position: 'absolute', top: 8, left: 15, fontSize: '1.1rem' }}>🌙</div>
        <motion.div animate={{ x: [-20, 120], opacity: [1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            style={{ position: 'absolute', top: '40%', left: '-5%', fontSize: '0.8rem' }}>💫</motion.div>
    </div>
);

const BgCherry = () => (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)', overflow: 'hidden' }}>
        {Array.from({ length: 12 }).map((_, i) => (
            <motion.div key={i}
                animate={{ y: [0, 200], x: [0, (i % 2 === 0 ? 20 : -20)], opacity: [1, 0], rotate: [0, 360] }}
                transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.5, ease: 'linear' }}
                style={{ position: 'absolute', top: `${-10}%`, left: `${(i * 10) % 100}%`, fontSize: '0.9rem' }}>
                🌸
            </motion.div>
        ))}
        <div style={{ position: 'absolute', bottom: 0, left: '10%', fontSize: '2.5rem' }}>🌸</div>
        <div style={{ position: 'absolute', bottom: 0, right: '15%', fontSize: '2rem' }}>🌸</div>
        <div style={{ position: 'absolute', top: 10, right: 20, fontSize: '1rem' }}>☀️</div>
    </div>
);

const BgRain = () => (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #64748b 0%, #475569 50%, #334155 100%)', overflow: 'hidden' }}>
        {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i}
                animate={{ y: [-20, 240] }}
                transition={{ duration: 0.8 + (i % 4) * 0.2, repeat: Infinity, delay: i * 0.15, ease: 'linear' }}
                style={{ position: 'absolute', top: 0, left: `${(i * 5.3) % 100}%`, width: 2, height: 14, background: 'rgba(147,197,253,0.6)', borderRadius: '1px' }} />
        ))}
        <div style={{ position: 'absolute', top: 10, left: '30%', fontSize: '1.2rem' }}>⛈️</div>
        <motion.div animate={{ x: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: 15, left: '-5%', fontSize: '2rem' }}>☁️</motion.div>
    </div>
);

const BgDefault = () => (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #ddd6fe 0%, #e0f2fe 100%)' }}>
        <div style={{ position: 'absolute', top: 10, right: 20, fontSize: '1.1rem' }}>☀️</div>
        <div style={{ position: 'absolute', bottom: 8, left: 20, fontSize: '0.9rem' }}>🌿</div>
    </div>
);

const BG_MAP = { ocean: BgOcean, forest: BgForest, space: BgSpace, cherry: BgCherry, rain: BgRain };

// ─── 수달 + 아이템 레이어 렌더러 ────────────────────────────────────
const OtterCanvas = ({ petData, previewItem = null, animation, onPlayTap, mood }) => {
    const mergedEquip = { ...petData };
    if (previewItem) {
        if (previewItem.category === 'hat') mergedEquip.equippedHat = previewItem.id;
        if (previewItem.category === 'acc') mergedEquip.equippedAcc = previewItem.id;
        if (previewItem.category === 'bg') mergedEquip.equippedBg = previewItem.id;
    }

    const hatItem = ITEMS.find(i => i.id === mergedEquip.equippedHat);
    const accItem = ITEMS.find(i => i.id === mergedEquip.equippedAcc);
    const bgKey = mergedEquip.equippedBg ? (ITEMS.find(i => i.id === mergedEquip.equippedBg)?.bg || 'default') : 'default';
    const BgComp = BG_MAP[bgKey] || BgDefault;

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '220px', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <BgComp />
            {/* 수달 + 레이어 */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* 수달 + 오버레이 레이어 */}
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* 모자 레이어 (수달 위) */}
                    {hatItem && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                            style={{ position: 'absolute', ...hatItem.style, zIndex: 3 }}>
                            {hatItem.icon}
                        </motion.div>
                    )}
                    {/* 수달 본체 */}
                    <motion.div
                        animate={animation === 'feed'
                            ? { y: [-10, 0, -10, 0], rotate: [0, -5, 5, 0] }
                            : animation === 'play'
                                ? { scale: [1, 1.3, 1, 1.2, 1], rotate: [0, 10, -10, 5, 0] }
                                : { y: [0, -6, 0] }}
                        transition={animation ? { duration: 0.8 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            fontSize: '5.5rem', cursor: 'pointer', zIndex: 2, userSelect: 'none',
                            filter: bgKey === 'space' ? 'drop-shadow(0 0 12px rgba(139,92,246,0.6))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))'
                        }}
                        onClick={onPlayTap}
                    >
                        🦦
                    </motion.div>
                    {/* 악세서리 mid 레이어 (안경 등) */}
                    {accItem && accItem.layer === 'mid' && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', ...accItem.style, zIndex: 4 }}>
                            {accItem.icon}
                        </motion.div>
                    )}
                    {/* 악세서리 side 레이어 */}
                    {accItem && accItem.layer === 'side' && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', ...accItem.style, zIndex: 3 }}>
                            {accItem.icon}
                        </motion.div>
                    )}
                    {/* 악세서리 float 레이어 (음표 등 떠있는 것) */}
                    {accItem && accItem.layer === 'float' && (
                        <motion.div
                            animate={{ y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ position: 'absolute', ...accItem.style, zIndex: 5 }}>
                            {accItem.icon}
                        </motion.div>
                    )}
                </div>
                {/* 목도리 / bottom 악세서리 */}
                {accItem && accItem.layer === 'bottom' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ zIndex: 3, marginTop: '-10px' }}>
                        {accItem.icon}
                    </motion.div>
                )}
            </div>
            {/* 말풍선 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', zIndex: 3, marginTop: '12px', background: bgKey === 'space' ? 'rgba(15,12,41,0.85)' : 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', padding: '8px 18px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: bgKey === 'space' ? 'white' : '#1e293b' }}
            >
                {mood.face} {mood.mood}
            </motion.div>
        </div>
    );
};

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
const SoulPetPage = ({ onBack, nearbyUsers }) => {
    const { user } = useAuthStore();
    const userId = user?.id || 'guest';
    const PET_STORAGE_KEY = `lumini_soul_pet_${userId}`;

    const { crystals, spendCrystals } = useCrystalStore();
    const [activeTab, setActiveTab] = useState('pet');
    const [previewItem, setPreviewItem] = useState(null);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [toast, setToast] = useState('');
    const [animation, setAnimation] = useState(null);

    const [petData, setPetData] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(PET_STORAGE_KEY) || 'null') || {
                name: '루미', level: 1, exp: 0, maxExp: 100,
                hunger: 80, happiness: 70,
                equippedHat: null, equippedBg: null, equippedAcc: null,
                ownedItems: [], lastFed: null, lastPlayed: null,
            };
        } catch {
            return {
                name: '루미', level: 1, exp: 0, maxExp: 100,
                hunger: 80, happiness: 70,
                equippedHat: null, equippedBg: null, equippedAcc: null,
                ownedItems: [], lastFed: null, lastPlayed: null,
            };
        }
    });

    const savePet = (data) => { localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(data)); setPetData(data); };
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };
    const triggerAnim = (type) => { setAnimation(type); setTimeout(() => setAnimation(null), 1200); };

    const mood = (() => {
        if (petData.hunger < 20) return { face: '😢', mood: '배가 고파요...' };
        if (petData.happiness < 20) return { face: '😞', mood: '심심해요...' };
        if (petData.level >= 10) return { face: '😎', mood: '최고의 루미에요!' };
        if (petData.happiness > 70) return { face: '🥰', mood: '행복해요!' };
        return { face: '😊', mood: '오늘도 즐거워요!' };
    })();

    const handleFeed = () => {
        const now = Date.now();
        if (petData.lastFed && now - petData.lastFed < 3600000) { showToast('1시간에 한 번만 밥을 줄 수 있어요 🍚'); return; }
        const newHunger = Math.min(100, petData.hunger + 25);
        const newExp = petData.exp + 10;
        const levelUp = newExp >= petData.maxExp;
        triggerAnim('feed');
        savePet({ ...petData, hunger: newHunger, exp: levelUp ? newExp - petData.maxExp : newExp, level: levelUp ? petData.level + 1 : petData.level, maxExp: levelUp ? petData.maxExp + 50 : petData.maxExp, lastFed: now });
        showToast(levelUp ? `🎉 레벨 업! Lv.${petData.level + 1}` : '🍚 맛있게 먹었어요! +10 XP');
    };

    const handlePlay = () => {
        const now = Date.now();
        if (petData.lastPlayed && now - petData.lastPlayed < 1800000) { showToast('30분에 한 번만 놀 수 있어요 🎮'); return; }
        const newHappiness = Math.min(100, petData.happiness + 20);
        const newExp = petData.exp + 15;
        const levelUp = newExp >= petData.maxExp;
        triggerAnim('play');
        savePet({ ...petData, happiness: newHappiness, exp: levelUp ? newExp - petData.maxExp : newExp, level: levelUp ? petData.level + 1 : petData.level, maxExp: levelUp ? petData.maxExp + 50 : petData.maxExp, lastPlayed: now });
        showToast(levelUp ? `🎉 레벨 업! Lv.${petData.level + 1}` : '🎮 신나게 놀았어요! +15 XP');
    };

    const handleBuy = (item) => {
        if (petData.ownedItems.includes(item.id)) { showToast('이미 보유 중인 아이템이에요!'); return; }
        if (crystals < item.price) { showToast(`크리스탈이 부족해요! (${item.price}💎 필요)`); return; }
        spendCrystals(item.price);
        const newData = { ...petData, ownedItems: [...petData.ownedItems, item.id] };
        savePet(newData);
        showToast(`✅ ${item.name} 구매 완료!`);
    };

    const handleEquip = (item) => {
        if (!petData.ownedItems.includes(item.id)) return;
        const update = { ...petData };
        if (item.category === 'hat') update.equippedHat = update.equippedHat === item.id ? null : item.id;
        if (item.category === 'bg') update.equippedBg = update.equippedBg === item.id ? null : item.id;
        if (item.category === 'acc') update.equippedAcc = update.equippedAcc === item.id ? null : item.id;
        savePet(update);
        setPreviewItem(null);
    };

    const handleSaveName = () => {
        if (!nameInput.trim()) return;
        savePet({ ...petData, name: nameInput.trim() });
        setEditingName(false);
        showToast(`이름이 "${nameInput.trim()}"(으)로 바뀌었어요! 🎀`);
    };

    const matchingBonus = Math.min(5, petData.level * 0.5).toFixed(1);

    const catLabels = { hat: '🎩 모자 & 머리장식', bg: '🖼️ 배경', acc: '🎀 소품 & 악세서리' };

    return (
        <div style={{ maxWidth: '520px', margin: '0 auto', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 5%', marginBottom: '4px' }}>
                {onBack && (
                    <button onClick={onBack} style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div style={{ flex: 1 }}>
                    {editingName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                autoFocus maxLength={10}
                                style={{ fontSize: '1.2rem', fontWeight: 900, background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: '10px', padding: '4px 10px', color: 'var(--text)', outline: 'none', width: '140px' }} />
                            <button onClick={handleSaveName} style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'white' }}><Check size={16} /></button>
                            <button onClick={() => setEditingName(false)} style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>🦦 {petData.name}</h1>
                            <button onClick={() => { setNameInput(petData.name); setEditingName(true); }}
                                style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                <Edit2 size={13} />
                            </button>
                        </div>
                    )}
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>크리스탈로 꾸미고 키워보세요</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, color: '#6366F1', fontSize: '1.1rem' }}>{crystals}💎</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>보유 크리스탈</div>
                </div>
            </div>

            {/* Tab */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '0 5%', marginBottom: '20px' }}>
                {[{ id: 'pet', label: '🦦 루미' }, { id: 'shop', label: '🛍️ 꾸미기 샵' }, { id: 'profile', label: '👤 프로필 카드' }].map(tab => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPreviewItem(null); }}
                        style={{ padding: '12px 16px', background: 'none', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s' }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '0 5%' }}>
                {/* ── 루미 탭 ── */}
                {activeTab === 'pet' && (
                    <div>
                        <div className="glass-card" style={{ borderRadius: '28px', overflow: 'hidden', marginBottom: '20px', padding: 0 }}>
                            <OtterCanvas petData={petData} animation={animation} onPlayTap={handlePlay} mood={mood} />
                            <div style={{ padding: '20px 24px', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <div>
                                        <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{petData.name}</span>
                                        <span style={{ marginLeft: '8px', background: 'var(--primary-faint)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>Lv.{petData.level}</span>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>🎯 매칭 보너스 +{matchingBonus}%</div>
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                                        <span>경험치</span><span>{petData.exp}/{petData.maxExp} XP</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--background)', borderRadius: '100px', overflow: 'hidden' }}>
                                        <motion.div animate={{ width: `${(petData.exp / petData.maxExp) * 100}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', borderRadius: '100px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {[{ label: '🍚 배고픔', value: petData.hunger, color: '#F59E0B' }, { label: '💜 행복도', value: petData.happiness, color: '#EC4899' }].map(stat => (
                                        <div key={stat.label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600 }}>
                                                <span>{stat.label}</span><span>{stat.value}%</span>
                                            </div>
                                            <div style={{ height: '5px', background: 'var(--background)', borderRadius: '100px', overflow: 'hidden' }}>
                                                <motion.div animate={{ width: `${stat.value}%` }} style={{ height: '100%', background: stat.color, borderRadius: '100px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            {(() => {
                                const now = Date.now();
                                const feedCoolMs = 3600000;
                                const playCoolMs = 1800000;
                                const feedLeft = petData.lastFed ? Math.max(0, feedCoolMs - (now - petData.lastFed)) : 0;
                                const playLeft = petData.lastPlayed ? Math.max(0, playCoolMs - (now - petData.lastPlayed)) : 0;
                                const feedMin = Math.ceil(feedLeft / 60000);
                                const playMin = Math.ceil(playLeft / 60000);
                                return (<>
                                    <div>
                                        <Tooltip text={feedLeft > 0 ? `${feedMin}분 후에 다시 줄 수 있어요` : "루미에게 맛있는 밥을 줍니다 (+배고픔 회복)"}>
                                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleFeed}
                                                disabled={feedLeft > 0}
                                                style={{ width: '100%', padding: '16px', borderRadius: '18px', border: 'none', background: feedLeft > 0 ? '#e2e8f0' : 'linear-gradient(135deg, #F59E0B, #F97316)', color: feedLeft > 0 ? '#94a3b8' : 'white', fontWeight: 800, fontSize: '1rem', cursor: feedLeft > 0 ? 'not-allowed' : 'pointer' }}>
                                                🍚 밥 주기
                                            </motion.button>
                                        </Tooltip>
                                        {feedLeft > 0 && <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '5px', fontWeight: 600 }}>⏳ {feedMin}분 후 가능</div>}
                                    </div>
                                    <div>
                                        <Tooltip text={playLeft > 0 ? `${playMin}분 후에 다시 놀 수 있어요` : "루미와 즐겁게 놉니다 (+행복도 상승)"}>
                                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePlay}
                                                disabled={playLeft > 0}
                                                style={{ width: '100%', padding: '16px', borderRadius: '18px', border: 'none', background: playLeft > 0 ? '#e2e8f0' : 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: playLeft > 0 ? '#94a3b8' : 'white', fontWeight: 800, fontSize: '1rem', cursor: playLeft > 0 ? 'not-allowed' : 'pointer' }}>
                                                🎮 놀아주기
                                            </motion.button>
                                        </Tooltip>
                                        {playLeft > 0 && <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '5px', fontWeight: 600 }}>⏳ {playMin}분 후 가능</div>}
                                    </div>
                                </>);
                            })()}
                        </div>
                        <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #EEF2FF, #FAF5FF)', border: '1px solid #6366F120' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#6366F1', marginBottom: '4px' }}>🎯 {petData.name} 레벨 보너스</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                레벨이 높을수록 추천 매칭에서 더 앞에 노출됩니다.<br />
                                현재 <strong style={{ color: '#6366F1' }}>+{matchingBonus}% 매칭 노출 보너스</strong> 적용 중 (최대 5%)
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 꾸미기 샵 탭 ── */}
                {activeTab === 'shop' && (
                    <div>
                        {/* 실시간 미리보기 패널 */}
                        <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '24px', padding: 0 }}>
                            <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #EDE9FE, #FAF5FF)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#7C3AED' }}>
                                    {previewItem ? `미리보기: ${previewItem.name}` : '아이템을 선택하면 미리볼 수 있어요 👆'}
                                </span>
                                {previewItem && (
                                    <button onClick={() => setPreviewItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={16} /></button>
                                )}
                            </div>
                            <OtterCanvas petData={petData} previewItem={previewItem} animation={null} onPlayTap={() => { }} mood={mood} />
                        </div>

                        {/* 아이템 목록 */}
                        {['hat', 'bg', 'acc'].map(cat => (
                            <div key={cat} style={{ marginBottom: '28px' }}>
                                <h4 style={{ fontWeight: 800, marginBottom: '12px', color: 'var(--text)', fontSize: '1rem' }}>{catLabels[cat]}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {ITEMS.filter(i => i.category === cat).map(item => {
                                        const owned = petData.ownedItems.includes(item.id);
                                        const equipped = petData.equippedHat === item.id || petData.equippedBg === item.id || petData.equippedAcc === item.id;
                                        const isPreviewing = previewItem?.id === item.id;
                                        return (
                                            <motion.div key={item.id} whileHover={{ scale: 1.04 }}
                                                onMouseEnter={() => !owned && setPreviewItem(item)}
                                                onMouseLeave={() => !owned && !isPreviewing && setPreviewItem(null)}
                                                onClick={() => {
                                                    if (owned) {
                                                        handleEquip(item);
                                                    } else {
                                                        setPreviewItem(item);
                                                    }
                                                }}
                                                style={{ padding: '14px 8px', borderRadius: '16px', background: equipped ? '#8B5CF620' : isPreviewing ? '#E0E7FF' : 'var(--surface)', border: `1.5px solid ${equipped ? '#8B5CF6' : isPreviewing ? '#6366F1' : 'var(--glass-border)'}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{item.icon}</div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '5px', color: 'var(--text)' }}>{item.name}</div>
                                                {owned ? (
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: equipped ? '#8B5CF6' : '#10B981', background: equipped ? '#8B5CF620' : '#10B98118', padding: '2px 7px', borderRadius: '100px' }}>
                                                        {equipped ? '✓ 장착 중' : '장착하기'}
                                                    </div>
                                                ) : (
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={e => { e.stopPropagation(); handleBuy(item); }}
                                                        style={{ fontSize: '0.7rem', fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', padding: '3px 10px', borderRadius: '100px', border: 'none', cursor: 'pointer' }}>
                                                        {item.price}💎 구매
                                                    </motion.button>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── 프로필 카드 탭 ── */}
                {activeTab === 'profile' && (
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                            💌 다른 루미니 멤버들의 소울 펫을 구경해보세요!
                        </p>
                        {/* 내 소울 펫 카드 */}
                        <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '20px', padding: 0 }}>
                            <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, var(--primary-faint), #FAF5FF)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>🦦 내 소울 펫</span>
                                <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>Lv.{petData.level}</span>
                            </div>
                            <OtterCanvas petData={petData} animation={null} onPlayTap={() => { }} mood={mood} />
                            <div style={{ padding: '16px 20px', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{petData.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>소울 펫 · Lv.{petData.level} · XP {petData.exp}/{petData.maxExp}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>+{matchingBonus}% 보너스</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>보유 아이템 {petData.ownedItems.length}개</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 다른 멤버 예시 */}
                        <h4 style={{ fontWeight: 800, marginBottom: '14px', color: 'var(--text)' }}>✨ 다른 멤버들의 소울 펫</h4>
                        {/* Neighbor Users Souls (Actual Data) */}
                        {Array.isArray(nearbyUsers) && nearbyUsers.filter(u => u?.pet_data).length > 0 ? (
                            nearbyUsers.filter(u => u?.pet_data).slice(0, 3).map((u, idx) => {
                                const friend = {
                                    name: u.pet_data.name || '루미',
                                    ownerName: u.username || u.name,
                                    level: u.pet_data.level || 1,
                                    equippedHat: u.pet_data.equippedHat,
                                    equippedBg: u.pet_data.equippedBg,
                                    equippedAcc: u.pet_data.equippedAcc,
                                    hunger: u.pet_data.hunger || 80,
                                    happiness: u.pet_data.happiness || 70,
                                    ownedItems: u.pet_data.ownedItems || []
                                };
                                const friendMood = friend.happiness > 80 ? { face: '🥰', mood: '행복해요!' } : { face: '😊', mood: '즐거워요!' };
                                
                                return (
                                    <div key={`real-${u.id}`} className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '16px', padding: 0 }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>🦦 {friend.ownerName}의 {friend.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>Lv.{friend.level}</span>
                                        </div>
                                        <div style={{ height: '160px', opacity: 0.9 }}>
                                            <OtterCanvas petData={friend} animation={null} onPlayTap={() => {}} mood={friendMood} isSmall={true} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            /* Fallback to Mock with Label */
                            [
                                { name: '별이', ownerName: '소이', level: 7, equippedHat: 'hat_gem', equippedBg: 'bg_space', equippedAcc: 'acc_music', hunger: 90, happiness: 85, ownedItems: ['hat_gem', 'bg_space', 'acc_music'] },
                                { name: '하루', ownerName: '준혁', level: 3, equippedHat: 'hat_flower', equippedBg: 'bg_cherry', equippedAcc: 'acc_heart', hunger: 70, happiness: 65, ownedItems: ['hat_flower', 'bg_cherry', 'acc_heart'] },
                            ].map((friend, idx) => {
                                const friendMood = friend.happiness > 80 ? { face: '🥰', mood: '행복해요!' } : { face: '😊', mood: '즐거워요!' };
                                return (
                                    <div key={idx} className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '16px', padding: 0, opacity: 0.8 }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>🦦 {friend.ownerName}의 {friend.name} (예시)</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Lv.{friend.level}</span>
                                        </div>
                                        <div style={{ height: '140px' }}>
                                            <OtterCanvas petData={friend} animation={null} onPlayTap={() => {}} mood={friendMood} isSmall={true} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{ position: 'fixed', bottom: '100px', left: '50%', background: '#7C3AED', color: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: 800, zIndex: 9999, boxShadow: '0 8px 30px rgba(124,58,237,0.4)', whiteSpace: 'nowrap' }}>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SoulPetPage;
