import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, RefreshCw, ArrowLeft, Star, Heart, Gem, Info, Volume2, VolumeX, ShoppingBag, Play, Sparkles } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';

const COLS = 17;
const ROWS = 10;
const GAME_TIME = 100; // 1분 40초
const FREE_PLAYS = 5;

const AppleGamePage = ({ onBack, userName }) => {
    const { crystals, useItem, buyItem, inventory, spendCrystals } = useCrystalStore();
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('apple_game_best_score') || '0'));
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [grid, setGrid] = useState([]);
    const [gameState, setGameState] = useState('ready'); // ready, playing, finished, shopping
    const [dailyPlays, setDailyPlays] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    // Drag states
    const [selection, setSelection] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const gridRef = useRef(null);
    const bgmRef = useRef(null);

    const initGrid = useCallback(() => {
        const newGrid = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                newGrid.push({
                    id: `${r}-${c}`,
                    row: r,
                    col: c,
                    value: Math.floor(Math.random() * 9) + 1,
                    removed: false
                });
            }
        }
        setGrid(newGrid);
    }, []);

    useEffect(() => {
        const lastDate = localStorage.getItem('apple_game_last_date');
        const today = new Date().toDateString();

        if (lastDate !== today) {
            localStorage.setItem('apple_game_last_date', today);
            localStorage.setItem('apple_game_daily_count', '0');
            setDailyPlays(0);
        } else {
            const count = parseInt(localStorage.getItem('apple_game_daily_count') || '0');
            setDailyPlays(count);
        }
    }, []);

    const startGame = async () => {
        if (dailyPlays >= FREE_PLAYS) {
            const tickets = inventory['apple-ticket'] || 0;
            if (tickets <= 0) {
                if (window.confirm('무료 플레이 횟수를 모두 소모했습니다.\n상점에서 추가 플레이 코인을 구매하시겠습니까?')) {
                    setGameState('shopping');
                }
                return;
            }
            useItem('apple-ticket');
        } else {
            const newCount = dailyPlays + 1;
            setDailyPlays(newCount);
            localStorage.setItem('apple_game_daily_count', newCount.toString());
        }

        setScore(0);
        setTimeLeft(GAME_TIME);
        initGrid();
        setGameState('playing');

        // Play BGM with User Interaction
        setTimeout(() => {
            if (bgmRef.current && !isMuted) {
                bgmRef.current.volume = 0.3;
                bgmRef.current.play().catch(e => console.log('BGM Play deferred or blocked:', e));
            }
        }, 100);
    };

    const handleShuffle = () => {
        const shuffleCount = inventory['apple-shuffle'] || 0;
        if (shuffleCount <= 0) {
            alert('셔플 아이템이 없습니다. 게임 전 상점에서 구매해 주세요!');
            return;
        }

        if (useItem('apple-shuffle')) {
            // High Quality Shuffle: Randomize existing values positionally
            const remainingValues = grid.filter(c => !c.removed).map(c => c.value);
            // Fisher-Yates
            for (let i = remainingValues.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remainingValues[i], remainingValues[j]] = [remainingValues[j], remainingValues[i]];
            }

            let valIdx = 0;
            const newGrid = grid.map(cell => {
                if (cell.removed) return cell;
                return { ...cell, value: remainingValues[valIdx++] || Math.floor(Math.random() * 9) + 1 };
            });
            setGrid(newGrid);

            // Shuffle Sound
            const sfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-marimba-wave-512.mp3');
            if (!isMuted) sfx.play().catch(() => { });

            if (gridRef.current) {
                gridRef.current.animate([
                    { transform: 'scale(1)', filter: 'blur(0px)' },
                    { transform: 'scale(0.95)', filter: 'blur(4px)' },
                    { transform: 'scale(1)', filter: 'blur(0px)' }
                ], { duration: 400 });
            }
        }
    };

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('finished');
            if (bgmRef.current) bgmRef.current.pause();

            setBestScore(prevBest => {
                const newBest = Math.max(prevBest, score);
                localStorage.setItem('apple_game_best_score', newBest.toString());
                return newBest;
            });
        }
    }, [gameState, timeLeft, score]);

    const getPos = (e) => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleStart = (e) => {
        if (gameState !== 'playing') return;
        const pos = getPos(e);
        if (!pos) return;
        setIsDragging(true);
        setSelection({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
    };

    const handleMove = (e) => {
        if (!isDragging || !selection) return;
        const pos = getPos(e);
        if (!pos) return;
        setSelection(prev => ({ ...prev, endX: pos.x, endY: pos.y }));
    };

    const handleEnd = () => {
        if (!isDragging || !selection) return;
        setIsDragging(false);

        if (!gridRef.current) { setSelection(null); return; }
        const gridRect = gridRef.current.getBoundingClientRect();

        // 드래그 영역(외부 좌표, 창 기준)
        const selLeft = Math.min(selection.startX, selection.endX);
        const selRight = Math.max(selection.startX, selection.endX);
        const selTop = Math.min(selection.startY, selection.endY);
        const selBottom = Math.max(selection.startY, selection.endY);

        // gridRef.current의 자식 요소(cell) 중심점 판정
        const gridChildren = Array.from(gridRef.current.children);
        const selectedCellsIdx = [];

        gridChildren.forEach((cellEl, i) => {
            if (grid[i]?.removed) return;
            const cr = cellEl.getBoundingClientRect();
            // 셋 중심점 (창 기준)
            const cx = cr.left + cr.width / 2 - gridRect.left;
            const cy = cr.top + cr.height / 2 - gridRect.top;
            if (cx >= selLeft && cx <= selRight && cy >= selTop && cy <= selBottom) {
                selectedCellsIdx.push(i);
            }
        });

        if (selectedCellsIdx.length > 0) {
            const sum = selectedCellsIdx.reduce((acc, idx) => acc + grid[idx].value, 0);
            if (sum === 10) {
                const newGrid = [...grid];
                selectedCellsIdx.forEach(idx => {
                    newGrid[idx] = { ...newGrid[idx], removed: true };
                });
                setGrid(newGrid);
                setScore(prev => prev + (selectedCellsIdx.length * 10));

                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-pop-down-3129.mp3');
                audio.volume = 0.4;
                if (!isMuted) audio.play().catch(() => { });
            }
        }
        setSelection(null);
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '20px 2%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            userSelect: 'none', touchAction: 'none', color: '#334155', position: 'relative', overflow: 'hidden'
        }}>
            {/* Soft Pastel Background Decor */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', zIndex: 0 }}></div>

            {/* BGM Audio */}
            <audio ref={bgmRef} loop src="https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3" />

            {/* Header */}
            <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'relative', zIndex: 10 }}>
                <button onClick={() => { if (bgmRef.current) bgmRef.current.pause(); onBack(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 800, background: 'white', padding: '10px 20px', borderRadius: '15px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <ArrowLeft size={20} /> 취소
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 10px rgba(244, 63, 94, 0.1)' }}>
                        🍎 루미니 사과 농장
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => { setIsMuted(!isMuted); if (bgmRef.current) isMuted ? bgmRef.current.play() : bgmRef.current.pause(); }} style={{ background: 'white', padding: '12px', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface)', padding: '10px 20px', borderRadius: '100px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <Gem size={20} color="var(--primary)" fill="var(--primary)" />
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#334155' }}>{crystals}</span>
                    </div>
                </div>
            </div>

            <div style={{
                width: '100%', maxWidth: '1200px', display: 'grid',
                gridTemplateColumns: '1fr 320px', gap: '40px', position: 'relative', zIndex: 10
            }}>
                {/* Board Container */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
                    borderRadius: '40px', padding: '30px', border: '1px solid rgba(255, 255, 255, 1)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)', position: 'relative'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(244, 63, 94, 0.1)', padding: '12px 25px', borderRadius: '20px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                <Timer size={24} color="#f43f5e" />
                                <span style={{ fontWeight: 900, color: '#f43f5e', fontSize: '1.8rem', fontFamily: "'Poppins', 'Nunito', sans-serif", letterSpacing: '-1px' }}>
                                    {timeLeft}초
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(251, 191, 36, 0.1)', padding: '12px 25px', borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#d97706' }}>SCORE</div>
                                <span style={{ fontWeight: 900, color: '#d97706', fontSize: '1.8rem' }}>{score.toLocaleString()}</span>
                            </div>
                        </div>

                        {gameState === 'playing' && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.1)', padding: '0 15px', borderRadius: '15px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <Sparkles size={18} color="#6366f1" />
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#4f46e5' }}>x{inventory['apple-shuffle'] || 0}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShuffle(); }}
                                    style={{ padding: '12px 25px', background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', color: '#6366f1', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.1)', transition: 'all 0.2s' }}
                                >
                                    <RefreshCw size={18} /> SHUFFLE
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative', background: '#f8fafc', borderRadius: '30px', padding: '15px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.02)' }}>
                        {gameState === 'ready' ? (
                            <div style={{ height: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <motion.div
                                    animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                    style={{ fontSize: '8rem', marginBottom: '20px', cursor: 'pointer', filter: 'drop-shadow(0 10px 20px rgba(244,63,94,0.2))' }}
                                    onClick={startGame}
                                >
                                    🍎
                                </motion.div>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '15px', color: '#334155' }}>사과 수확 준비 완료!</h3>
                                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px', fontWeight: 600 }}>합이 10이 되도록 사과를 드래그하세요 🦦</p>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <button onClick={() => setGameState('shopping')} style={{ padding: '18px 35px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 800, borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <ShoppingBag size={22} /> 상점 방문
                                    </button>
                                    <button onClick={startGame} style={{ padding: '18px 50px', background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', border: 'none', color: 'white', fontWeight: 900, borderRadius: '25px', fontSize: '1.3rem', boxShadow: '0 10px 20px rgba(244, 63, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <Play fill="white" size={24} /> 게임 시작
                                    </button>
                                </div>
                                <p style={{ marginTop: '30px', color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>무료 플레이: <span style={{ color: '#f43f5e', fontWeight: 800 }}>남은 횟수 {Math.max(0, FREE_PLAYS - dailyPlays)}회</span> | 코인: <span style={{ color: '#ec4899', fontWeight: 800 }}>{inventory['apple-ticket'] || 0}개</span></p>
                            </div>
                        ) : gameState === 'shopping' ? (
                            <div style={{ height: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', color: '#334155' }}>
                                    <ShoppingBag size={32} color="#f43f5e" /> 아이템 상점
                                </h3>

                                <div style={{ display: 'flex', gap: '30px', width: '100%', maxWidth: '800px', justifyContent: 'center' }}>
                                    {/* Shuffle Item */}
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '30px', border: '1px solid #e2e8f0', flex: 1, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                        <div style={{ width: '70px', height: '70px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                            <RefreshCw size={34} color="#6366f1" />
                                        </div>
                                        <h4 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', color: '#1e293b' }}>마법의 셔플</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 600, height: '40px' }}>배치된 사과를 섞어줍니다.</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <button onClick={() => { if (buyItem('apple-shuffle', 5, 1)) alert('셔플 1개 구매 완료! ✨'); else alert('크리스탈이 부족합니다! 💎'); }} style={{ width: '100%', background: 'var(--surface)', color: '#6366f1', border: '1px solid #c7d2fe', padding: '12px', borderRadius: '15px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#eef2ff'} onMouseOut={e => e.currentTarget.style.background = 'var(--surface)'}>
                                                1개 (5 <Gem size={14} fill="#6366f1" />)
                                            </button>
                                            <button onClick={() => { if (buyItem('apple-shuffle', 20, 5)) alert('셔플 5개 구매 완료! ✨'); else alert('크리스탈이 부족합니다! 💎'); }} style={{ width: '100%', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '12px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#c7d2fe'} onMouseOut={e => e.currentTarget.style.background = '#eef2ff'}>
                                                5개 (20 <Gem size={14} fill="#4f46e5" />)
                                            </button>
                                            <button onClick={() => { if (buyItem('apple-shuffle', 35, 10)) alert('셔플 10개 구매 완료! ✨'); else alert('크리스탈이 부족합니다! 💎'); }} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                10개 (35 <Gem size={14} fill="white" />)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Play Ticket Item */}
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '30px', border: '1px solid #e2e8f0', flex: 1, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                        <div style={{ width: '70px', height: '70px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                            <Play size={34} color="#ec4899" fill="#ec4899" />
                                        </div>
                                        <h4 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', color: '#1e293b' }}>추가 플레이 코인</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 600, height: '40px' }}>무료 횟수 소진 시 게임 1회 가능</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <button onClick={() => { if (buyItem('apple-ticket', 10, 1)) alert('코인 1개 구매 완료! 🎟️'); else alert('크리스탈이 부족합니다! 💎'); }} style={{ width: '100%', background: 'var(--surface)', color: '#ec4899', border: '1px solid #fbcfe8', padding: '12px', borderRadius: '15px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#fdf2f8'} onMouseOut={e => e.currentTarget.style.background = 'var(--surface)'}>
                                                1개 (10 <Gem size={14} fill="#ec4899" />)
                                            </button>
                                            <button onClick={() => { if (buyItem('apple-ticket', 45, 5)) alert('코인 5개 구매 완료! 🎟️'); else alert('크리스탈이 부족합니다! 💎'); }} style={{ width: '100%', background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', padding: '12px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#fbcfe8'} onMouseOut={e => e.currentTarget.style.background = '#fdf2f8'}>
                                                5개 (45 <Gem size={14} fill="#db2777" />)
                                            </button>
                                            <button onClick={() => { if (buyItem('apple-ticket', 80, 10)) alert('코인 10개 구매 완료! 🎟️'); else alert('크리스탈이 부족합니다! 💎'); }} style={{ width: '100%', background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                10개 (80 <Gem size={14} fill="white" />)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setGameState('ready')} style={{ marginTop: '30px', color: '#64748b', fontWeight: 800, textDecoration: 'none', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}>이전으로</button>
                            </div>
                        ) : gameState === 'finished' ? (
                            <div style={{ height: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} style={{ fontSize: '8rem', marginBottom: '30px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}>🎉</motion.div>
                                <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#f43f5e', marginBottom: '10px' }}>수확 완료!</h2>
                                <p style={{ fontSize: '1.8rem', color: '#64748b', marginBottom: '50px', fontWeight: 800 }}>최종 점수: <span style={{ color: '#f59e0b', fontWeight: 900 }}>{score.toLocaleString()}</span>점</p>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <button onClick={onBack} style={{ padding: '18px 40px', borderRadius: '25px', fontWeight: 800, background: 'white', color: '#64748b', border: '1px solid #e2e8f0', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>돌아가기</button>
                                    <button onClick={startGame} style={{ padding: '18px 50px', borderRadius: '25px', fontWeight: 900, background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', color: 'white', border: 'none', fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(244,63,94,0.3)', cursor: 'pointer' }}>다시 하기</button>
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={gridRef}
                                onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
                                onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                                style={{
                                    display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                                    gridTemplateRows: `repeat(${ROWS}, 1fr)`, gap: '6px',
                                    position: 'relative', cursor: 'crosshair', background: 'transparent',
                                    padding: '5px', borderRadius: '20px'
                                }}
                            >
                                {grid.map((cell) => (
                                    <div
                                        key={cell.id}
                                        style={{
                                            aspectRatio: '1', borderRadius: '12px',
                                            background: cell.removed ? 'transparent' : 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.3rem', fontWeight: 900,
                                            color: cell.removed ? 'transparent' : '#334155',
                                            border: cell.removed ? 'none' : '1px solid #e2e8f0',
                                            boxShadow: cell.removed ? 'none' : '0 4px 6px rgba(0,0,0,0.05)',
                                            position: 'relative', overflow: 'hidden',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {!cell.removed && (
                                            <>
                                                {/* Apple Glow (Soft Red) */}
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 35% 35%, rgba(244, 63, 94, 0.15) 0%, transparent 80%)', zIndex: 0 }}></div>
                                                <span style={{ position: 'relative', zIndex: 1 }}>{cell.value}</span>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* Drag Rectangle */}
                                {isDragging && selection && (
                                    <div style={{
                                        position: 'absolute',
                                        left: Math.min(selection.startX, selection.endX),
                                        top: Math.min(selection.startY, selection.endY),
                                        width: Math.abs(selection.startX - selection.endX),
                                        height: Math.abs(selection.startY - selection.endY),
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '3px solid #6366f1',
                                        borderRadius: '12px',
                                        boxSizing: 'border-box',
                                        pointerEvents: 'none', zIndex: 100,
                                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
                                    }} />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Leaderboard */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
                        borderRadius: '30px', padding: '25px', border: '1px solid rgba(255, 255, 255, 1)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                            <Trophy size={24} color="#f59e0b" fill="#f59e0b" />
                            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1e293b' }}>명예의 전당</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                { name: '딸기퐁듀', score: 4250, rank: 1 },
                                { name: '애플수달', score: 3820, rank: 2 },
                                { name: '루미니언', score: 3150, rank: 3 },
                                { name: '별빛가득', score: 2850, rank: 4 },
                                { name: userName || '나', score: Math.max(bestScore, score), isMe: true, rank: 5 }
                            ].sort((a, b) => b.score - a.score).map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', padding: '12px 16px',
                                    background: item.isMe ? 'rgba(99, 102, 241, 0.1)' : 'white',
                                    border: item.isMe ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid #e2e8f0',
                                    borderRadius: '16px', transition: 'transform 0.2s'
                                }}>
                                    <span style={{ fontWeight: 800, color: item.isMe ? '#4f46e5' : '#64748b', fontSize: '1rem' }}>{i + 1}위 {item.name}</span>
                                    <span style={{ fontWeight: 900, color: item.isMe ? '#4f46e5' : '#334155', fontSize: '1rem' }}>{item.score.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How to Play */}
                    <div style={{
                        background: 'white', borderRadius: '30px', padding: '25px', color: '#334155',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(255, 255, 255, 1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <Sparkles size={20} color="#f43f5e" />
                            <h4 style={{ fontWeight: 900, fontSize: '1.1rem' }}>게임 팁</h4>
                        </div>
                        <ul style={{ fontSize: '0.95rem', color: '#64748b', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: 1.5, fontWeight: 600 }}>
                            <li>사과를 드래그하여 **합이 10**이 되게 만드세요.</li>
                            <li>넓은 영역의 사과를 한 번에 묶을수록 고득점! 💸</li>
                            <li>더 이상 묶을 게 없다면 **마법의 셔플**을 사용해보세요.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppleGamePage;
