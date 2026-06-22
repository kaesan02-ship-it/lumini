import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';
import Tooltip from '../components/Tooltip';

// 진화 데이터 매핑
const EVOLUTION_MAP = {
  2:    { emoji: '🐣', name: '아기 병아리', bg: '#ffeef1', color: '#2d3748' },
  4:    { emoji: '🐥', name: '꼬마 병아리', bg: '#ffd8df', color: '#2d3748' },
  8:    { emoji: '🐹', name: '볼빵빵 햄찌', bg: '#ffb8c6', color: '#ffffff' },
  16:   { emoji: '🐰', name: '말랑 귀요미 토끼', bg: '#ff94a8', color: '#ffffff' },
  32:   { emoji: '🐱', name: '새침 도도 냐옹이', bg: '#ff708b', color: '#ffffff' },
  64:   { emoji: '🐶', name: '늠름 충성 댕댕이', bg: '#ff4d6e', color: '#ffffff' },
  128:  { emoji: '🦊', name: '꾀쟁이 붉은 여우', bg: '#e63956', color: '#ffffff', glow: '0 0 10px rgba(255,107,139,0.4)' },
  256:  { emoji: '🐻', name: '의리 우직 곰돌이', bg: '#cc243f', color: '#ffffff', glow: '0 0 15px rgba(255,107,139,0.5)' },
  512:  { emoji: '🐼', name: '뒹굴 판다 선생', bg: '#b3142d', color: '#ffffff' },
  1024: { emoji: '🦁', name: '초원의 맹수 사자', bg: '#99051b', color: '#ffffff' },
  2048: { emoji: '👑', name: '루미니 지배자', bg: '#ffd700', color: '#2d3748', glow: '0 0 20px rgba(255, 215, 0, 0.7)' }
};

const Game2048Page = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName } = useUserStore();
    const userId = user?.id || 'guest';
    const bestScoreKey = `game_2048_best_score_${userId}`;

    // Game States
    const [board, setBoard] = useState([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem(bestScoreKey) || '0'));
    const [gameState, setGameState] = useState('ready'); // ready, playing, finished, won
    const [leaderboard, setLeaderboard] = useState([]);
    
    // 모바일 터치 및 마우스 드래그 좌표 상태
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isMouseDown, setIsMouseDown] = useState(false);

    // 리더보드 로드 (Top 10으로 확장)
    const fetchLeaderboard = useCallback(() => {
        if (USE_MOCK_DATA) return;

        supabase.from('game_2048_scores')
            .select('score, max_tile, created_at, profiles(username)')
            .order('score', { ascending: false })
            .limit(10)
            .then(({ data, error }) => {
                if (data && !error) {
                    const mappedData = data.map(item => ({
                        username: item.profiles?.username || '익명',
                        score: item.score,
                        max_tile: item.max_tile
                    }));
                    setLeaderboard(mappedData);
                }
            });
    }, []);

    // 초기 최고기록 및 리더보드 동기화
    useEffect(() => {
        if (!USE_MOCK_DATA) {
            if (user) {
                supabase.from('game_2048_scores')
                    .select('score')
                    .eq('user_id', user.id)
                    .order('score', { ascending: false })
                    .limit(1)
                    .single()
                    .then(({ data, error }) => {
                        if (data && !error) {
                            setBestScore(data.score);
                            localStorage.setItem(bestScoreKey, data.score.toString());
                        }
                    });
            }
            fetchLeaderboard();
        }
    }, [user, bestScoreKey, fetchLeaderboard]);

    // 빈 공간에 무작위 2 or 4 배치
    const addRandomTile = (currentBoard) => {
        const nextBoard = currentBoard.map(row => [...row]);
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (nextBoard[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length > 0) {
            const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            nextBoard[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
        }
        return nextBoard;
    };

    const startGame = () => {
        let newBoard = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        newBoard = addRandomTile(newBoard);
        newBoard = addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameState('playing');
    };

    // 타일 이동 코어 알고리즘
    const slideAndMerge = useCallback((row, gainedScoreRef) => {
        let filtered = row.filter(val => val > 0);
        let merged = [];
        for (let i = 0; i < filtered.length; i++) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                const newVal = filtered[i] * 2;
                merged.push(newVal);
                gainedScoreRef.current += newVal;
                i++;
            } else {
                merged.push(filtered[i]);
            }
        }
        while (merged.length < 4) {
            merged.push(0);
        }
        return merged;
    }, []);

    const move = useCallback((direction) => {
        if (gameState !== 'playing') return;

        let moved = false;
        const gainedScoreRef = { current: 0 };
        let nextBoard = board.map(row => [...row]);

        if (direction === 'left') {
            for (let r = 0; r < 4; r++) {
                const oldRow = [...nextBoard[r]];
                const newRow = slideAndMerge(nextBoard[r], gainedScoreRef);
                nextBoard[r] = newRow;
                if (JSON.stringify(oldRow) !== JSON.stringify(newRow)) moved = true;
            }
        } else if (direction === 'right') {
            for (let r = 0; r < 4; r++) {
                const oldRow = [...nextBoard[r]];
                const reversed = [...nextBoard[r]].reverse();
                const newRow = slideAndMerge(reversed, gainedScoreRef).reverse();
                nextBoard[r] = newRow;
                if (JSON.stringify(oldRow) !== JSON.stringify(newRow)) moved = true;
            }
        } else if (direction === 'up') {
            for (let c = 0; c < 4; c++) {
                const oldCol = [nextBoard[0][c], nextBoard[1][c], nextBoard[2][c], nextBoard[3][c]];
                const newCol = slideAndMerge(oldCol, gainedScoreRef);
                for (let r = 0; r < 4; r++) {
                    nextBoard[r][c] = newCol[r];
                }
                const checkCol = [nextBoard[0][c], nextBoard[1][c], nextBoard[2][c], nextBoard[3][c]];
                if (JSON.stringify(oldCol) !== JSON.stringify(checkCol)) moved = true;
            }
        } else if (direction === 'down') {
            for (let c = 0; c < 4; c++) {
                const oldCol = [nextBoard[0][c], nextBoard[1][c], nextBoard[2][c], nextBoard[3][c]];
                const reversedCol = [...oldCol].reverse();
                const newCol = slideAndMerge(reversedCol, gainedScoreRef).reverse();
                for (let r = 0; r < 4; r++) {
                    nextBoard[r][c] = newCol[r];
                }
                const checkCol = [nextBoard[0][c], nextBoard[1][c], nextBoard[2][c], nextBoard[3][c]];
                if (JSON.stringify(oldCol) !== JSON.stringify(checkCol)) moved = true;
            }
        }

        if (moved) {
            nextBoard = addRandomTile(nextBoard);
            const nextScore = score + gainedScoreRef.current;
            setScore(nextScore);
            setBoard(nextBoard);

            const sfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-typewriter-soft-click-1125.mp3');
            sfx.volume = 0.15;
            sfx.play().catch(() => {});

            checkGameState(nextBoard, nextScore);
        }
    }, [board, score, gameState, slideAndMerge]);

    // 게임 상태(승리/패배) 판별
    const checkGameState = (currentBoard, currentScore) => {
        let has2048 = false;
        let hasEmpty = false;
        let maxTileVal = 0;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const val = currentBoard[r][c];
                if (val > maxTileVal) maxTileVal = val;
                if (val === 2048) has2048 = true;
                if (val === 0) hasEmpty = true;
            }
        }

        if (has2048) {
            handleGameOver(true, currentScore, maxTileVal);
            return;
        }

        if (hasEmpty) return;

        // 움직일 여유가 있는지 체크
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const val = currentBoard[r][c];
                if (c + 1 < 4 && val === currentBoard[r][c+1]) return;
                if (r + 1 < 4 && val === currentBoard[r+1][c]) return;
            }
        }

        handleGameOver(false, currentScore, maxTileVal);
    };

    const handleGameOver = (isWin, finalScore, maxTile) => {
        setGameState(isWin ? 'won' : 'finished');

        setBestScore(prev => {
            const nextBest = Math.max(prev, finalScore);
            localStorage.setItem(bestScoreKey, nextBest.toString());

            // Supabase 랭킹 등록
            if (!USE_MOCK_DATA && user?.id) {
                supabase.from('game_2048_scores')
                    .insert({ user_id: user.id, score: finalScore, max_tile: maxTile })
                    .then(({ error }) => {
                        if (!error) fetchLeaderboard();
                    });
            }
            return nextBest;
        });
    };

    // 키보드 조작 이벤트 리스너
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); move('left'); }
            if (e.key === 'ArrowRight') { e.preventDefault(); move('right'); }
            if (e.key === 'ArrowUp') { e.preventDefault(); move('up'); }
            if (e.key === 'ArrowDown') { e.preventDefault(); move('down'); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, move]);

    // -------------------------------------------------------------
    // 모바일 터치 및 데스크톱 마우스 스와이프 조작 설계
    // -------------------------------------------------------------
    const handleGestureStart = (clientX, clientY) => {
        setDragStart({ x: clientX, y: clientY });
    };

    const handleGestureEnd = (clientX, clientY) => {
        if (gameState !== 'playing') return;

        const diffX = clientX - dragStart.x;
        const diffY = clientY - dragStart.y;
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        // 30픽셀 이상 움직였을 때만 판정
        if (Math.max(absX, absY) > 30) {
            if (absX > absY) {
                if (diffX > 0) move('right');
                else move('left');
            } else {
                if (diffY > 0) move('down');
                else move('up');
            }
        }
    };

    // 모바일 터치 이벤트 핸들러
    const handleTouchStart = (e) => {
        handleGestureStart(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = (e) => {
        handleGestureEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    // 데스크톱 마우스 이벤트 핸들러
    const handleMouseDown = (e) => {
        // 드래그 충돌 방지용 방어막
        if (e.button !== 0) return; // 왼쪽 클릭만 인정
        setIsMouseDown(true);
        handleGestureStart(e.clientX, e.clientY);
    };

    const handleMouseUp = (e) => {
        if (!isMouseDown) return;
        setIsMouseDown(false);
        handleGestureEnd(e.clientX, e.clientY);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', margin: '0 auto' }}>
            {/* 상단 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: '#718096', fontWeight: 600
                    }}
                >
                    <ArrowLeft size={20} /> 대시보드
                </button>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: '#ffeef1', padding: '6px 12px', borderRadius: '12px' }}>
                    <Sparkles size={16} color="#ff6b8b" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ff6b8b' }}>루미니 아케이드</span>
                </div>
            </div>

            {/* 메인 게임 콘텐트 */}
            <div style={{ background: '#ffffff', border: '1px solid #ffd3db', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 30px rgba(255, 107, 139, 0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ff6b8b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        🥚 루미니 2048
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#718096', marginTop: '4px' }}>
                        키보드 방향키 또는 화면 드래그(마우스/터치)로 타일을 밀어 진화시키세요!
                    </p>
                </div>

                {gameState === 'ready' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐣🐹🦊</div>
                        <h3 style={{ fontWeight: 700, color: '#2d3748', marginBottom: '8px' }}>소울펫 진화 슬라이딩</h3>
                        <p style={{ fontSize: '0.82rem', color: '#718096', maxWidth: '300px', lineHeight: 1.5, marginBottom: '24px' }}>
                            모바일 터치뿐 아니라 **PC 마우스로도 드래그가 가능**하도록 개선되었습니다. 루미니 최고 지배자(2048) 소환에 도전해 보세요!
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                onClick={startGame}
                                style={{
                                    background: '#ff6b8b', color: 'white', border: 'none',
                                    padding: '14px 28px', borderRadius: '16px', fontWeight: 700,
                                    fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,107,139,0.3)',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                게임 시작하기
                            </button>
                            <button
                                onClick={() => {
                                    useUserStore.getState().setActiveRankingTab('game2048');
                                    // AppRouter에서 step을 'ranking'으로 이동하게끔 changeStep 이벤트 디스패치
                                    const event = new CustomEvent('changeStep', { detail: 'ranking' });
                                    window.dispatchEvent(event);
                                }}
                                style={{
                                    background: '#ffffff', color: '#2d3748', border: '1px solid #ffd3db',
                                    padding: '14px 28px', borderRadius: '16px', fontWeight: 700,
                                    fontSize: '1.05rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Trophy size={18} color="#ff6b8b" /> 전체 랭킹 보기
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <>
                        {/* 스코어보드 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ffeef1', padding: '10px 16px', borderRadius: '16px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <span style={{ fontSize: '0.7rem', color: '#ff6b8b', fontWeight: 700 }}>현재 점수</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#2d3748' }}>
                                    {score}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, borderLeft: '1px solid rgba(255,107,139,0.2)' }}>
                                <span style={{ fontSize: '0.7rem', color: '#ff6b8b', fontWeight: 700 }}>최고 기록</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#2d3748' }}>
                                    {bestScore}
                                </span>
                            </div>
                        </div>

                        {/* 4x4 그리드 보드 */}
                        <div
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={() => setIsMouseDown(false)} // 마우스가 게임판 밖으로 나가면 드래그 리셋
                            style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                background: '#ffdce3',
                                borderRadius: '20px',
                                padding: '10px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gridTemplateRows: 'repeat(4, 1fr)',
                                gridGap: '8px',
                                userSelect: 'none',
                                touchAction: 'none',
                                position: 'relative',
                                cursor: isMouseDown ? 'grabbing' : 'grab' // 잡기/잡은상태 마우스 커서 표시
                            }}
                        >
                            {/* 백그라운드 쉘들 */}
                            {Array.from({ length: 16 }).map((_, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }} />
                            ))}

                            {/* 떠 있는 타일들 */}
                            {board.map((row, r) => 
                                row.map((val, c) => {
                                    if (val === 0) return null;
                                    const evo = EVOLUTION_MAP[val] || { emoji: '👾', name: '환수', bg: '#e2e8f0', color: '#2d3748' };
                                    const topPercent = r * 25;
                                    const leftPercent = c * 25;

                                    return (
                                        <motion.div
                                            key={`${r}-${c}-${val}`}
                                            layoutId={`${r}-${c}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            style={{
                                                position: 'absolute',
                                                top: `calc(${topPercent}% + 10px)`,
                                                left: `calc(${leftPercent}% + 10px)`,
                                                width: 'calc(25% - 14px)',
                                                height: 'calc(25% - 14px)',
                                                background: evo.bg,
                                                color: evo.color,
                                                borderRadius: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: evo.glow || '0 4px 6px rgba(0,0,0,0.05)',
                                                zIndex: 5,
                                                fontWeight: 800,
                                                pointerEvents: 'none' // 드래그 시 마우스 이벤트를 판 전체가 받게 하기 위함
                                            }}
                                        >
                                            <span style={{ fontSize: window.innerWidth <= 480 ? '20px' : '28px', marginBottom: '2px' }}>{evo.emoji}</span>
                                            <span style={{ fontSize: '11px', opacity: 0.85 }}>{val}</span>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                            <button
                                onClick={startGame}
                                style={{
                                    width: '100%', padding: '12px', background: '#ff6b8b', border: 'none',
                                    borderRadius: '14px', fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <RefreshCw size={16} /> 처음부터 다시 시작
                            </button>
                        </div>
                    </>
                )}

                {(gameState === 'finished' || gameState === 'won') && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>{gameState === 'won' ? '👑' : '👾'}</div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff6b8b', marginBottom: '8px' }}>
                            {gameState === 'won' ? '지배자 달성 완료!' : '게임 오버!'}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '20px' }}>
                            {gameState === 'won' ? '축하합니다! 2048 최종 병합에 성공했습니다.' : '소울펫들을 소환할 빈 칸이 부족합니다.'}
                        </p>

                        <div style={{ background: '#ffeef1', padding: '16px 40px', borderRadius: '16px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#ff6b8b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>최종 점수</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d3748' }}>{score}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <button
                                onClick={startGame}
                                style={{
                                    flex: 1, padding: '14px', background: '#ff6b8b', color: 'white', border: 'none',
                                    borderRadius: '16px', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                다시 소환하기
                            </button>
                            <button
                                onClick={onBack}
                                style={{
                                    flex: 1, padding: '14px', background: '#ffffff', color: '#2d3748', border: '1px solid #ffd3db',
                                    borderRadius: '16px', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                대시보드
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 리더보드 */}
            <div style={{ background: '#ffffff', border: '1px solid #ffd3db', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 30px rgba(255, 107, 139, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trophy size={18} color="#ff6b8b" /> 명예의 전당 (최고 점수)
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                        내 최고 기록: <strong style={{ color: '#ff6b8b' }}>{bestScore}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {leaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#718096', fontSize: '0.8rem' }}>
                            아직 등록된 고득점자가 없습니다. 첫 고득점을 기록해보세요! 🚀
                        </div>
                    ) : (
                        leaderboard.map((item, idx) => {
                            const isMe = item.username === (userName || '나');
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                            const maxTileEvo = EVOLUTION_MAP[item.max_tile] || { emoji: '🥚' };
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: isMe ? '#ffeef1' : '#f7fafc',
                                        padding: '10px 14px', borderRadius: '12px',
                                        border: isMe ? '1px solid #ffd3db' : '1px solid transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.1rem' }}>{medals[idx] || `${idx + 1}`}</span>
                                        <span style={{ fontWeight: isMe ? 800 : 600, color: '#2d3748', fontSize: '0.9rem' }}>
                                            {item.username} {isMe && <span style={{ fontSize: '0.72rem', color: '#ff6b8b', marginLeft: '4px' }}>(나)</span>}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            최종 {maxTileEvo.emoji} ({item.max_tile})
                                        </span>
                                        <span style={{ fontWeight: 800, color: '#ff6b8b', fontSize: '0.95rem' }}>
                                            {item.score}점
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game2048Page;
