import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, RefreshCw, ArrowLeft, Lightbulb, Shuffle, Sparkles, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';
import Tooltip from '../components/Tooltip';

// 10x10 격자 (테두리 제외 8x8 = 64개 카드)
const ROWS = 10;
const COLS = 10;
const INITIAL_LIMIT_TIME = 120; // 2분 제한시간

// 32종류 이모지 세트
const EMOJIS = [
  '🦊', '🐱', '🐶', '🐰', '🐯', '🐻', '🐼', '🦁',
  '🐸', '🐷', '🐵', '🐔', '🐧', '🐦', '🐹', '🐨',
  '🐮', '🐑', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠',
  '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐆', '🐘'
];

const SacheonseongGamePage = ({ onBack }) => {
    const { user } = useAuthStore();
    const { userName } = useUserStore();
    const userId = user?.id || 'guest';
    const bestScoreKey = `shisen_sho_best_score_v2_${userId}`;

    // Game States
    const [board, setBoard] = useState([]);
    const [selectedTile, setSelectedTile] = useState(null);
    const [timeLeft, setTimeLeft] = useState(INITIAL_LIMIT_TIME);
    const [pairsLeft, setPairsLeft] = useState(32); // 64개 카드 = 32쌍
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [shufflesRemaining, setShufflesRemaining] = useState(3);
    const [hintsRemaining, setHintsRemaining] = useState(3);
    const [gameState, setGameState] = useState('ready'); // ready, playing, finished, timeout
    const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem(bestScoreKey) || '0'));
    const [leaderboard, setLeaderboard] = useState([]);
    const [highlightedTiles, setHighlightedTiles] = useState([]);

    const canvasRef = useRef(null);
    const boardRef = useRef(null);
    const timerRef = useRef(null);

    // 랭킹 리더보드 가져오기 (중복 제거 및 Top 10)
    const fetchLeaderboard = useCallback(() => {
        if (USE_MOCK_DATA) return;

        supabase.from('shisen_sho_scores')
            .select('score, user_id, profiles(username)')
            .order('score', { ascending: false }) // 점수 높은 순 정렬
            .then(({ data, error }) => {
                if (data && !error) {
                    const uniqueUsers = [];
                    const seenUsers = new Set();
                    data.forEach(item => {
                        const uId = item.user_id;
                        if (uId && !seenUsers.has(uId)) {
                            seenUsers.add(uId);
                            uniqueUsers.push({
                                username: item.profiles?.username || '익명',
                                score: item.score
                            });
                        }
                    });
                    setLeaderboard(uniqueUsers.slice(0, 10));
                }
            });
    }, []);

    // 초기 데이터 연동
    useEffect(() => {
        if (!USE_MOCK_DATA) {
            if (user) {
                supabase.from('shisen_sho_scores')
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

    // 캔버스 사이즈 자동조절
    const resizeCanvas = useCallback(() => {
        if (canvasRef.current && boardRef.current) {
            canvasRef.current.width = boardRef.current.clientWidth;
            canvasRef.current.height = boardRef.current.clientHeight;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    // 타이머 틱
    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [gameState, timeLeft]);

    // 피셔-예이츠 셔플
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    // 보드판 초기 구조 생성
    const initBoard = useCallback(() => {
        const newBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
        let cardList = [];
        // 32쌍 배치
        EMOJIS.forEach(emoji => {
            cardList.push(emoji);
            cardList.push(emoji);
        });

        shuffleArray(cardList);

        let cardIdx = 0;
        for (let r = 1; r < ROWS - 1; r++) {
            for (let c = 1; c < COLS - 1; c++) {
                newBoard[r][c] = cardList[cardIdx++];
            }
        }
        return newBoard;
    }, []);

    // 꺾임 경로 탐색 BFS
    const findConnectionPath = useCallback((p1, p2, currentBoard = board) => {
        if (p1.r === p2.r && p1.c === p2.c) return null;
        if (currentBoard[p1.r][p1.c] !== currentBoard[p2.r][p2.c]) return null;

        const queue = [];
        const visited = Array.from({ length: ROWS }, () => 
            Array.from({ length: COLS }, () => Array(4).fill(Infinity))
        );

        const dr = [-1, 1, 0, 0];
        const dc = [0, 0, -1, 1];

        for (let i = 0; i < 4; i++) {
            const nr = p1.r + dr[i];
            const nc = p1.c + dc[i];
            
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (currentBoard[nr][nc] === '' || (nr === p2.r && nc === p2.c)) {
                    const startPath = [{ r: p1.r, c: p1.c }, { r: nr, c: nc }];
                    queue.push({ r: nr, c: nc, dir: i, turns: 0, path: startPath });
                    visited[nr][nc][i] = 0;
                }
            }
        }

        while (queue.length > 0) {
            const curr = queue.shift();

            if (curr.r === p2.r && curr.c === p2.c) {
                return curr.path;
            }

            for (let i = 0; i < 4; i++) {
                const nr = curr.r + dr[i];
                const nc = curr.c + dc[i];

                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    const isEmpty = (currentBoard[nr][nc] === '');
                    const isTarget = (nr === p2.r && nc === p2.c);

                    if (isEmpty || isTarget) {
                        const newTurns = (curr.dir === i) ? curr.turns : curr.turns + 1;

                        if (newTurns <= 2) {
                            if (newTurns < visited[nr][nc][i]) {
                                visited[nr][nc][i] = newTurns;
                                const newPath = [...curr.path, { r: nr, c: nc }];
                                queue.push({ r: nr, c: nc, dir: i, turns: newTurns, path: newPath });
                            }
                        }
                    }
                }
            }
        }

        return null;
    }, [board]);

    // 유효한 매칭 탐색
    const findAvailableMatch = useCallback((currentBoard = board) => {
        const activeTiles = [];
        for (let r = 1; r < ROWS - 1; r++) {
            for (let c = 1; c < COLS - 1; c++) {
                if (currentBoard[r][c] !== '') {
                    activeTiles.push({ r, c });
                }
            }
        }

        for (let i = 0; i < activeTiles.length; i++) {
            for (let j = i + 1; j < activeTiles.length; j++) {
                const p1 = activeTiles[i];
                const p2 = activeTiles[j];
                if (currentBoard[p1.r][p1.c] === currentBoard[p2.r][p2.c]) {
                    if (findConnectionPath(p1, p2, currentBoard)) {
                        return { p1, p2 };
                    }
                }
            }
        }
        return null;
    }, [board, findConnectionPath]);

    // 게임 시작
    const startGame = () => {
        const initialBoard = initBoard();
        setBoard(initialBoard);
        setSelectedTile(null);
        setTimeLeft(INITIAL_LIMIT_TIME);
        setPairsLeft(32);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setShufflesRemaining(3);
        setHintsRemaining(3);
        setHighlightedTiles([]);
        setGameState('playing');

        setTimeout(() => {
            resizeCanvas();
            let checkMatch = findAvailableMatch(initialBoard);
            let checkBoard = [...initialBoard];
            while (!checkMatch) {
                checkBoard = shuffleBoard(checkBoard);
                checkMatch = findAvailableMatch(checkBoard);
            }
            setBoard(checkBoard);
        }, 100);
    };

    // 보드 섞기
    const shuffleBoard = (currentBoard) => {
        let remainingCards = [];
        for (let r = 1; r < ROWS - 1; r++) {
            for (let c = 1; c < COLS - 1; c++) {
                if (currentBoard[r][c] !== '') {
                    remainingCards.push(currentBoard[r][c]);
                }
            }
        }
        if (remainingCards.length === 0) return currentBoard;

        shuffleArray(remainingCards);

        const newBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
        let idx = 0;
        for (let r = 1; r < ROWS - 1; r++) {
            for (let c = 1; c < COLS - 1; c++) {
                if (currentBoard[r][c] !== '') {
                    newBoard[r][c] = remainingCards[idx++];
                }
            }
        }
        return newBoard;
    };

    const handleShuffleClick = () => {
        if (shufflesRemaining <= 0) return;
        
        let newBoard = shuffleBoard(board);
        let safety = 0;
        while (!findAvailableMatch(newBoard) && safety < 10) {
            newBoard = shuffleBoard(newBoard);
            safety++;
        }

        setBoard(newBoard);
        setSelectedTile(null);
        setShufflesRemaining(prev => prev - 1);
        setCombo(0);
    };

    const handleHintClick = () => {
        if (hintsRemaining <= 0) return;
        const match = findAvailableMatch();
        if (match) {
            setHighlightedTiles([match.p1, match.p2]);
            setTimeout(() => {
                setHighlightedTiles([]);
            }, 1500);
            setHintsRemaining(prev => prev - 1);
        } else {
            alert('현재 맞출 수 있는 짝이 없습니다! 카드를 섞어보세요.');
        }
    };

    // 레이저 그리기
    const drawLaser = (path) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cellW = canvas.width / COLS;
        const cellH = canvas.height / ROWS;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        path.forEach((pt, idx) => {
            const x = pt.c * cellW + cellW / 2;
            const y = pt.r * cellH + cellH / 2;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#ff6b8b';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6b8b';
        ctx.stroke();

        ctx.beginPath();
        path.forEach((pt, idx) => {
            const x = pt.c * cellW + cellW / 2;
            const y = pt.r * cellH + cellH / 2;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.stroke();

        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 300);
    };

    // 타일 터치 핸들링
    const handleTileClick = (r, c) => {
        if (gameState !== 'playing' || board[r][c] === '') return;

        const tileEl = boardRef.current?.querySelector(`.tile-grid-item[data-pos="${r}-${c}"]`);

        if (selectedTile && selectedTile.r === r && selectedTile.c === c) {
            setSelectedTile(null);
            return;
        }

        if (!selectedTile) {
            setSelectedTile({ r, c });
            return;
        }

        const p1 = selectedTile;
        const p2 = { r, c };

        const path = findConnectionPath(p1, p2);

        if (path) {
            const nextBoard = board.map(row => [...row]);
            nextBoard[p1.r][p1.c] = '';
            nextBoard[p2.r][p2.c] = '';

            drawLaser(path);

            setBoard(nextBoard);
            setSelectedTile(null);
            const nextPairs = pairsLeft - 1;
            setPairsLeft(nextPairs);
            
            // 점수 부여 로직: 1쌍당 100점 + 콤보 보너스(콤보 수 * 10점)
            const nextCombo = combo + 1;
            setCombo(nextCombo);
            if (nextCombo > maxCombo) setMaxCombo(nextCombo);
            
            const pointsGained = 100 + (nextCombo * 10);
            const nextScore = score + pointsGained;
            setScore(nextScore);

            const sfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-musical-match-sound-2679.mp3');
            sfx.volume = 0.2;
            sfx.play().catch(() => {});

            if (nextPairs === 0) {
                handleGameClear(nextScore);
            } else {
                // 풀 수 있는 수 탐색 및 오토 셔플
                setTimeout(() => {
                    if (!findAvailableMatch(nextBoard)) {
                        let autoShuffled = shuffleBoard(nextBoard);
                        while (!findAvailableMatch(autoShuffled)) {
                            autoShuffled = shuffleBoard(autoShuffled);
                        }
                        setBoard(autoShuffled);
                    }
                }, 400);
            }
        } else {
            if (tileEl) {
                tileEl.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 300 });
            }
            setSelectedTile(null);
            setCombo(0);
        }
    };

    // 타임아웃 (획득한 점수가 0점보다 크면 랭킹 자동 등록)
    const handleTimeout = () => {
        setGameState('timeout');
        if (timerRef.current) clearInterval(timerRef.current);

        if (score > 0) {
            setBestScore(prevBest => {
                const newBest = Math.max(prevBest, score);
                localStorage.setItem(bestScoreKey, newBest.toString());

                // Supabase 랭킹 등록
                if (!USE_MOCK_DATA && user?.id) {
                    supabase.from('shisen_sho_scores')
                        .insert({ user_id: user.id, score: score })
                        .then(({ error }) => {
                            if (error) console.error('Failed to submit Shisen-sho score on timeout:', error);
                            else fetchLeaderboard();
                        });
                }
                return newBest;
            });
        }
    };

    // 미션 클리어
    const handleGameClear = (currentScore) => {
        setGameState('finished');
        if (timerRef.current) clearInterval(timerRef.current);

        // 최종 점수: 획득 점수 + 남은시간(초) * 15점 보너스
        const timeBonus = timeLeft * 15;
        const finalScore = currentScore + timeBonus;
        setScore(finalScore);

        setBestScore(prevBest => {
            const newBest = Math.max(prevBest, finalScore);
            localStorage.setItem(bestScoreKey, newBest.toString());

            // Supabase 랭킹 등록
            if (!USE_MOCK_DATA && user?.id) {
                supabase.from('shisen_sho_scores')
                    .insert({ user_id: user.id, score: finalScore })
                    .then(({ error }) => {
                        if (error) console.error('Failed to submit Shisen-sho score:', error);
                        else fetchLeaderboard();
                    });
            }
            return newBest;
        });
    };

    const formatTime = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '550px', margin: '0 auto' }}>
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
                        🐾 루미니 사천성
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#718096', marginTop: '4px' }}>
                        120초 제한시간 안에 64개의 모든 카드 짝을 제거해 점수를 올리세요!
                    </p>
                </div>

                {gameState === 'ready' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐱🐶🐼🐙</div>
                        <h3 style={{ fontWeight: 700, color: '#2d3748', marginBottom: '8px' }}>더 풍성해진 32쌍의 동물 매칭</h3>
                        <p style={{ fontSize: '0.82rem', color: '#718096', maxWidth: '300px', lineHeight: 1.5, marginBottom: '24px' }}>
                            보드가 **10x10(플레이 8x8)**으로 확장되었습니다. 120초의 한계를 이겨내고 신기록 고득점을 올려보세요!
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
                                    useUserStore.getState().setActiveRankingTab('shisen');
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
                        {/* 정보 표시줄 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ffeef1', padding: '10px 16px', borderRadius: '16px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: '#ff6b8b', fontWeight: 700 }}>남은 시간</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: timeLeft <= 15 ? '#e11d48' : '#2d3748', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Timer size={16} /> {formatTime(timeLeft)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: '#ff6b8b', fontWeight: 700 }}>획득 점수</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2d3748' }}>
                                    {score}점
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: '#ff6b8b', fontWeight: 700 }}>남은 짝</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2d3748' }}>
                                    {pairsLeft}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: '#ff6b8b', fontWeight: 700 }}>콤보</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ff6b8b' }}>
                                    🔥 {combo}
                                </span>
                            </div>
                        </div>

                        {/* 보드판 격자 */}
                        <div
                            ref={boardRef}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                                gridGap: '3px',
                                background: '#ffeef1',
                                padding: '4px',
                                borderRadius: '20px',
                                position: 'relative',
                                aspectRatio: '1/1',
                                border: '1px solid rgba(255, 107, 139, 0.1)',
                                marginBottom: '16px'
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    pointerEvents: 'none', zIndex: 10, borderRadius: '20px'
                                }}
                            />

                            {board.map((row, r) =>
                                row.map((val, c) => {
                                    const isEmpty = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 || val === '';
                                    const isSelected = selectedTile && selectedTile.r === r && selectedTile.c === c;
                                    const isHighlighted = highlightedTiles.some(pt => pt.r === r && pt.c === c);

                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            data-pos={`${r}-${c}`}
                                            className="tile-grid-item"
                                            onClick={() => handleTileClick(r, c)}
                                            onTouchStart={(e) => {
                                                if (e.cancelable) e.preventDefault();
                                                handleTileClick(r, c);
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: isEmpty ? 'transparent' : isSelected ? '#ff6b8b' : isHighlighted ? '#ffd3db' : '#ffffff',
                                                color: isSelected ? '#ffffff' : '#2d3748',
                                                borderRadius: '6px',
                                                fontSize: window.innerWidth <= 480 ? '12px' : '18px',
                                                cursor: isEmpty ? 'default' : 'pointer',
                                                userSelect: 'none',
                                                border: isEmpty ? 'none' : `1px solid ${isSelected ? '#ff6b8b' : '#ffd3db'}`,
                                                boxShadow: isEmpty ? 'none' : '0 1px 3px rgba(255,107,139,0.03)',
                                                transform: isSelected ? 'scale(1.05)' : 'none',
                                                transition: 'all 0.1s ease',
                                                pointerEvents: isEmpty ? 'none' : 'auto'
                                            }}
                                        >
                                            {!isEmpty && val}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* 조작 버튼그룹 */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Tooltip text="풀 수 있는 짝이 안 보일 때 카드를 임의 재정렬합니다." style={{ flex: 1 }}>
                                <button
                                    onClick={handleShuffleClick}
                                    disabled={shufflesRemaining <= 0}
                                    style={{
                                        width: '100%', padding: '12px', background: '#ffffff', border: '1px solid #ffd3db',
                                        borderRadius: '14px', fontWeight: 700, color: '#2d3748', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        opacity: shufflesRemaining <= 0 ? 0.5 : 1
                                    }}
                                >
                                    <Shuffle size={16} /> 섞기 ({shufflesRemaining})
                                </button>
                            </Tooltip>
                            <Tooltip text="지울 수 있는 카드 하나를 찾아 표시합니다." style={{ flex: 1 }}>
                                <button
                                    onClick={handleHintClick}
                                    disabled={hintsRemaining <= 0}
                                    style={{
                                        width: '100%', padding: '12px', background: '#ffffff', border: '1px solid #ffd3db',
                                        borderRadius: '14px', fontWeight: 700, color: '#2d3748', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        opacity: hintsRemaining <= 0 ? 0.5 : 1
                                    }}
                                >
                                    <Lightbulb size={16} /> 힌트 ({hintsRemaining})
                                </button>
                            </Tooltip>
                            <button
                                onClick={startGame}
                                style={{
                                    flex: 1, padding: '12px', background: '#ff6b8b', border: 'none',
                                    borderRadius: '14px', fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <RefreshCw size={16} /> 재시작
                            </button>
                        </div>
                    </>
                )}

                {gameState === 'timeout' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 10px', textAlign: 'center' }}>
                        <div style={{ color: '#e11d48', marginBottom: '16px' }}><AlertCircle size={60} /></div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d3748', marginBottom: '8px' }}>시간 초과!</h3>
                        <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '24px' }}>
                            제한 시간 120초가 모두 소진되었습니다. 다음 기회에 클리어해 보세요!
                        </p>
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <button
                                onClick={startGame}
                                style={{
                                    flex: 1, padding: '14px', background: '#ff6b8b', color: 'white', border: 'none',
                                    borderRadius: '16px', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                다시 도전하기
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

                {gameState === 'finished' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🏆</div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff6b8b', marginBottom: '8px' }}>미션 클리어!</h3>
                        <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '20px' }}>
                            제한시간 안에 모든 동물 구조 성공! 시간 가산점 보너스가 점수에 추가되었습니다.
                        </p>

                        <div style={{ display: 'flex', gap: '30px', background: '#ffeef1', padding: '16px 30px', borderRadius: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.72rem', color: '#ff6b8b', fontWeight: 700 }}>최종 획득 점수</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2d3748' }}>{score}점</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.72rem', color: '#ff6b8b', fontWeight: 700 }}>남은 시간 보너스</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2d3748' }}>+{timeLeft * 15}점</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <button
                                onClick={startGame}
                                style={{
                                    flex: 1, padding: '14px', background: '#ff6b8b', color: 'white', border: 'none',
                                    borderRadius: '16px', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                다시 도전하기
                            </button>
                            <button
                                onClick={onBack}
                                style={{
                                    flex: 1, padding: '14px', background: '#ffffff', color: '#2d3748', border: '1px solid #ffd3db',
                                    borderRadius: '16px', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                대시보드로 돌아가기
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
                        개인 최고 기록: <strong style={{ color: '#ff6b8b' }}>{bestScore}점</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {leaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#718096', fontSize: '0.8rem' }}>
                            아직 기록이 없습니다. 고득점 랭킹 등록에 먼저 도전해 보세요! 🚀
                        </div>
                    ) : (
                        leaderboard.map((item, idx) => {
                            const isMe = item.username === (userName || '나');
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
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
                                    <span style={{ fontWeight: 800, color: '#ff6b8b', fontSize: '0.95rem' }}>
                                        {item.score}점
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default SacheonseongGamePage;
