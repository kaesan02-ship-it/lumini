import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Play, Gem, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// 6면체 주사위 눈 디자인 헬퍼 컴포넌트
const DiceDot = ({ value }) => {
    const dotPositions = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom-right'],
    };

    const dots = dotPositions[value] || [];

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: 'white',
            borderRadius: '12px',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.15)',
            border: '2px solid #e2e8f0',
            boxSizing: 'border-box',
            padding: '8px'
        }}>
            {dots.map((pos, idx) => {
                const getStyle = () => {
                    switch (pos) {
                        case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                        case 'top-left': return { top: '20%', left: '20%' };
                        case 'top-right': return { top: '20%', right: '20%' };
                        case 'center-left': return { top: '50%', left: '20%', transform: 'translateY(-50%)' };
                        case 'center-right': return { top: '50%', right: '20%', transform: 'translateY(-50%)' };
                        case 'bottom-left': return { bottom: '20%', left: '20%' };
                        case 'bottom-right': return { bottom: '20%', right: '20%' };
                        default: return {};
                    }
                };

                return (
                    <span
                        key={idx}
                        style={{
                            position: 'absolute',
                            width: '8px',
                            height: '8px',
                            background: '#334155',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.5)',
                            ...getStyle()
                        }}
                    />
                );
            })}
        </div>
    );
};

// 열(Column)별 점수 합산 룰
const getColScore = (colArray) => {
    const counts = {};
    colArray.forEach(val => {
        counts[val] = (counts[val] || 0) + 1;
    });

    let sum = 0;
    Object.entries(counts).forEach(([valStr, count]) => {
        const val = parseInt(valStr);
        // 동일 눈금 보너스 배수 공식: 1개->1배, 2개->4배, 3개->9배
        sum += val * count * count;
    });
    return sum;
};

// 보드 전체 점수 합산
const getBoardTotalScore = (board) => {
    return board.reduce((acc, col) => acc + getColScore(col), 0);
};

// AI 최적 수 탐색 알고리즘
const evaluateMove = (col, diceVal, playerBoard, opponentBoard) => {
    if (playerBoard[col].length >= 3) return -Infinity;

    // 1. 점수 획득 이득 계산
    const currentScore = getColScore(playerBoard[col]);
    const nextCol = [...playerBoard[col], diceVal];
    const nextScore = getColScore(nextCol);
    const scoreGain = nextScore - currentScore;

    // 2. 상대방 주사위 파괴 가치 계산
    const oppCol = opponentBoard[col];
    const matchCount = oppCol.filter(val => val === diceVal).length;
    let destructionValue = 0;
    if (matchCount > 0) {
        const oppCurrentScore = getColScore(oppCol);
        const oppNextCol = oppCol.filter(val => val !== diceVal);
        const oppNextScore = getColScore(oppNextCol);
        destructionValue = oppCurrentScore - oppNextScore;
    }

    // 3. 칸 잠김 감쇄 페널티
    const spacePenalty = nextCol.length === 3 ? -2 : 0;

    // 파괴 가중치(1.3배) 부여
    return scoreGain + (destructionValue * 1.3) + spacePenalty;
};

const TikatukaGamePage = ({ onBack }) => {
    const { crystals, earnCrystals } = useCrystalStore();
    const { user } = useAuthStore();
    const { userName } = useUserStore();
    const userId = user?.id || 'guest';
    const streakKey = `tikatuka_best_win_streak_${userId}`;

    // 상태 관리
    const [gameState, setGameState] = useState('ready'); // ready, playing, finished
    const [winStreak, setWinStreak] = useState(0);
    const [bestWinStreak, setBestWinStreak] = useState(() => parseInt(localStorage.getItem(streakKey) || '0'));
    const [currentTurn, setCurrentTurn] = useState('player'); // player, ai
    const [playerBoard, setPlayerBoard] = useState([[], [], []]); // 3열 보드
    const [aiBoard, setAiBoard] = useState([[], [], []]);
    const [currentDice, setCurrentDice] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameResult, setGameResult] = useState(null); // 'win', 'lose', 'draw'
    
    // 파괴 이펙트(파티클) 연출용 상태
    const [particles, setParticles] = useState([]);
    const [aiThinking, setAiThinking] = useState(false);

    const bgmRef = useRef(null);

    // 랭킹 리더보드 동기화
    const fetchLeaderboard = useCallback(() => {
        if (USE_MOCK_DATA) {
            setLeaderboard([
                { username: '김민지', win_streak: 11 },
                { username: '원채김', win_streak: 8 },
                { username: '김민지', win_streak: 5 },
                { username: '윤선희', win_streak: 4 },
                { username: '지후', win_streak: 3 }
            ]);
            return;
        }

        supabase.from('tikatuka_game_scores')
            .select('max_win_streak, profiles(username)')
            .order('max_win_streak', { ascending: false })
            .limit(10)
            .then(({ data, error }) => {
                if (data && !error) {
                    const mapped = data.map(item => ({
                        username: item.profiles?.username || '익명',
                        win_streak: item.max_win_streak
                    }));
                    setLeaderboard(mapped);
                }
            });
    }, []);

    useEffect(() => {
        if (!USE_MOCK_DATA && user) {
            supabase.from('tikatuka_game_scores')
                .select('max_win_streak')
                .eq('user_id', user.id)
                .order('max_win_streak', { ascending: false })
                .limit(1)
                .single()
                .then(({ data, error }) => {
                    if (data && !error) {
                        setBestWinStreak(data.max_win_streak);
                        localStorage.setItem(streakKey, data.max_win_streak.toString());
                    }
                });
        }
        fetchLeaderboard();
    }, [user, streakKey, fetchLeaderboard]);

    // 게임 시작
    const startGame = () => {
        setPlayerBoard([[], [], []]);
        setAiBoard([[], [], []]);
        setCurrentDice(null);
        setIsRolling(false);
        setGameResult(null);
        setCurrentTurn('player');
        setGameState('playing');

        setTimeout(() => {
            if (bgmRef.current && !isMuted) {
                bgmRef.current.volume = 0.15;
                bgmRef.current.play().catch(() => {});
            }
        }, 100);
    };

    // 파괴 파티클 생성 함수
    const triggerDestroyParticle = (x, y) => {
        const newParticles = Array.from({ length: 8 }).map(() => ({
            id: Math.random(),
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 3,
            size: Math.floor(Math.random() * 4) + 4
        }));
        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.includes(p)));
        }, 800);
    };

    // 주사위 굴리기 격발
    const rollDice = () => {
        if (isRolling || currentDice !== null || gameState !== 'playing') return;
        setIsRolling(true);

        const rollSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-hard-pop-click-2364.mp3');
        rollSfx.volume = 0.2;
        if (!isMuted) rollSfx.play().catch(() => {});

        // 0.8초 동안 데굴데굴 애니메이션
        let count = 0;
        const interval = setInterval(() => {
            setCurrentDice(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 8) {
                clearInterval(interval);
                setIsRolling(false);
            }
        }, 80);
    };

    // 플레이어가 주사위를 특정 열에 둘 때
    const handlePlaceDice = (colIndex) => {
        if (currentTurn !== 'player' || currentDice === null || isRolling) return;
        if (playerBoard[colIndex].length >= 3) return; // 3칸 넘기 불가능

        const placeSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-clunk-3024.mp3');
        placeSfx.volume = 0.2;
        if (!isMuted) placeSfx.play().catch(() => {});

        // 1. 주사위 배치
        const newBoard = [...playerBoard];
        newBoard[colIndex] = [...newBoard[colIndex], currentDice];
        setPlayerBoard(newBoard);

        // 2. 상대방(AI)의 1번 열에 일치하는 주사위 파괴 처리
        const targetVal = currentDice;
        const oppCol = aiBoard[colIndex];
        if (oppCol.includes(targetVal)) {
            // 파괴 효과 연출
            triggerDestroyParticle(120 + colIndex * 85, 180);
            const destroySfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-boxer-punch-strike-2382.mp3');
            destroySfx.volume = 0.25;
            if (!isMuted) destroySfx.play().catch(() => {});

            // 필터링 제거
            const newAiBoard = [...aiBoard];
            newAiBoard[colIndex] = oppCol.filter(val => val !== targetVal);
            setAiBoard(newAiBoard);
        }

        // 3. 턴 교체
        setCurrentDice(null);
        checkGameStatus(newBoard, aiBoard, 'ai');
    };

    // 게임 종료 조건 점검
    const checkGameStatus = (pBoard, aBoard, nextPlayer) => {
        const isPlayerFull = pBoard.every(col => col.length >= 3);
        const isAiFull = aBoard.every(col => col.length >= 3);

        if (isPlayerFull || isAiFull) {
            // 보드가 꽉 차면 게임 종료 및 최종 합산 점수 판정
            const pScore = getBoardTotalScore(pBoard);
            const aScore = getBoardTotalScore(aBoard);
            
            let result = 'draw';
            if (pScore > aScore) {
                result = 'win';
            } else if (pScore < aScore) {
                result = 'lose';
            }

            setGameResult(result);
            setGameState('finished');
            if (bgmRef.current) bgmRef.current.pause();

            // 연승 기록 관리
            if (result === 'win') {
                const nextStreak = winStreak + 1;
                setWinStreak(nextStreak);
                earnCrystals(20); // 20 크리스탈 지급

                if (nextStreak > bestWinStreak) {
                    setBestWinStreak(nextStreak);
                    localStorage.setItem(streakKey, nextStreak.toString());

                    // Supabase DB 업데이트
                    if (!USE_MOCK_DATA && user) {
                        supabase.from('tikatuka_game_scores')
                            .select('max_win_streak, total_wins, total_games')
                            .eq('user_id', user.id)
                            .single()
                            .then(({ data, error }) => {
                                if (data && !error) {
                                    // 기존 레코드가 있으면 업데이트
                                    supabase.from('tikatuka_game_scores')
                                        .update({ 
                                            max_win_streak: nextStreak,
                                            total_wins: (data.total_wins || 0) + 1,
                                            total_games: (data.total_games || 0) + 1
                                        })
                                        .eq('user_id', user.id)
                                        .then(() => fetchLeaderboard());
                                } else {
                                    // 없으면 새로 삽입
                                    supabase.from('tikatuka_game_scores')
                                        .insert({ 
                                            user_id: user.id, 
                                            max_win_streak: nextStreak,
                                            total_wins: 1,
                                            total_games: 1
                                        })
                                        .then(() => fetchLeaderboard());
                                }
                            });
                    }
                }
            } else if (result === 'lose') {
                setWinStreak(0); // 연승 초기화
                if (!USE_MOCK_DATA && user) {
                    supabase.from('tikatuka_game_scores')
                        .select('total_games')
                        .eq('user_id', user.id)
                        .single()
                        .then(({ data, error }) => {
                            if (data && !error) {
                                supabase.from('tikatuka_game_scores')
                                    .update({ total_games: data.total_games + 1 })
                                    .eq('user_id', user.id);
                            }
                        });
                }
            }
        } else {
            // 게임이 안 끝났으면 턴을 바꿈
            setCurrentTurn(nextPlayer);
        }
    };

    // AI 자동 매치 턴 처리
    useEffect(() => {
        if (gameState !== 'playing' || currentTurn !== 'ai' || gameResult) return;

        setAiThinking(true);
        let aiDiceVal = Math.floor(Math.random() * 6) + 1;

        // 1. AI 주사위 굴리기 연출 (0.8초)
        let diceAnimInterval;
        let count = 0;
        setTimeout(() => {
            diceAnimInterval = setInterval(() => {
                setCurrentDice(Math.floor(Math.random() * 6) + 1);
                count++;
                if (count > 8) {
                    clearInterval(diceAnimInterval);
                    setCurrentDice(aiDiceVal);
                    
                    // 2. 가치 평가를 바탕으로 최적의 칸 선택
                    setTimeout(() => {
                        let bestCol = -1;
                        let maxVal = -Infinity;

                        // 3개 열의 배치 가치 평가
                        for (let c = 0; c < 3; c++) {
                            const val = evaluateMove(c, aiDiceVal, aiBoard, playerBoard);
                            if (val > maxVal) {
                                maxVal = val;
                                bestCol = c;
                            }
                        }

                        // 가용 열이 없으면 안전 덤핑
                        if (bestCol === -1) {
                            for (let c = 0; c < 3; c++) {
                                if (aiBoard[c].length < 3) {
                                    bestCol = c;
                                    break;
                                }
                            }
                        }

                        if (bestCol !== -1) {
                            // AI 주사위 장착
                            const newAiBoard = [...aiBoard];
                            newAiBoard[bestCol] = [...newAiBoard[bestCol], aiDiceVal];
                            setAiBoard(newAiBoard);

                            const placeSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-clunk-3024.mp3');
                            placeSfx.volume = 0.2;
                            if (!isMuted) placeSfx.play().catch(() => {});

                            // 플레이어의 매칭 주사위 파괴
                            const pCol = playerBoard[bestCol];
                            if (pCol.includes(aiDiceVal)) {
                                triggerDestroyParticle(120 + bestCol * 85, 340);
                                const destroySfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-boxer-punch-strike-2382.mp3');
                                destroySfx.volume = 0.25;
                                if (!isMuted) destroySfx.play().catch(() => {});

                                const newPlayerBoard = [...playerBoard];
                                newPlayerBoard[bestCol] = pCol.filter(val => val !== aiDiceVal);
                                setPlayerBoard(newPlayerBoard);
                            }

                            setCurrentDice(null);
                            setAiThinking(false);
                            checkGameStatus(playerBoard, newAiBoard, 'player');
                        }
                    }, 600);
                }
            }, 80);
        }, 600);

        return () => {
            if (diceAnimInterval) clearInterval(diceAnimInterval);
        };
    }, [currentTurn, gameState]);

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
            padding: '20px 2%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            userSelect: 'none', color: '#1e293b', position: 'relative', overflow: 'hidden'
        }}>
            {/* 파괴 파티클 레이어 */}
            {particles.map(p => (
                <span
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        background: '#a855f7',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        zIndex: 99,
                        boxShadow: '0 2px 4px rgba(168,85,247,0.4)',
                        transform: `translate(${p.vx * 3}px, ${p.vy * 3}px)`,
                        transition: 'transform 0.8s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.8s',
                        opacity: 0
                    }}
                />
            ))}

            <audio ref={bgmRef} loop src="https://assets.mixkit.co/music/preview/mixkit-retro-arcade-casino-key-515.mp3" />

            {/* Header */}
            <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 10 }}>
                <button onClick={() => { if (bgmRef.current) bgmRef.current.pause(); onBack(); }} title="대시보드로 돌아갑니다" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b21a8', fontWeight: 800, background: 'white', padding: '10px 20px', borderRadius: '15px', border: '1px solid #e9d5ff', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <ArrowLeft size={20} /> 취소
                </button>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🎲 티카투카 주사위 배틀
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => { setIsMuted(!isMuted); if (bgmRef.current) isMuted ? bgmRef.current.play() : bgmRef.current.pause(); }} title={isMuted ? "배경음악 켜기" : "배경음악 끄기"} style={{ background: 'white', padding: '12px', borderRadius: '50%', border: '1px solid #e9d5ff', cursor: 'pointer', color: '#6b21a8', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '10px 20px', borderRadius: '100px', border: '1px solid #e9d5ff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <Gem size={20} color="#a855f7" fill="#a855f7" />
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#7e22ce' }}>{crystals}</span>
                    </div>
                </div>
            </div>

            <div style={{
                width: '100%', maxWidth: '1000px', display: 'grid',
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 340px', gap: '30px', zIndex: 10
            }}>
                {/* 메인 게임판 */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
                    borderRadius: '35px', padding: '25px', border: '1px solid rgba(255,255,255,1)',
                    boxShadow: '0 20px 45px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    position: 'relative'
                }}>
                    {/* 상단 스탯바 */}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.1)', padding: '8px 16px', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                            <Sparkles size={16} color="#a855f7" />
                            <span style={{ fontWeight: 900, color: '#7e22ce', fontSize: '1rem' }}>현재 {winStreak}연승 중</span>
                        </div>
                        <div style={{ fontWeight: 800, color: '#6b21a8', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            {currentTurn === 'player' ? '🟢 내 차례입니다' : '🟣 AI가 생각 중...'}
                        </div>
                    </div>

                    {/* 대전 대형 플레이 필드 */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                        
                        {/* 1. AI 보드 (상단) */}
                        <div style={{ textAlign: 'center', width: '100%', maxWidth: '320px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 6px 8px', fontSize: '0.85rem', fontWeight: 800, color: '#7e22ce' }}>
                                <span>🤖 상대 AI 보드</span>
                                <span>합계: {getBoardTotalScore(aiBoard)}점</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', background: 'rgba(168, 85, 247, 0.05)', padding: '12px', borderRadius: '24px', border: '2px solid rgba(168, 85, 247, 0.15)' }}>
                                {aiBoard.map((col, cIdx) => (
                                    <div key={cIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: '10px', height: '180px', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', border: '1.5px dashed rgba(168,85,247,0.2)', padding: '8px', position: 'relative' }}>
                                        {col.map((val, rIdx) => (
                                            <motion.div key={rIdx} initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', aspectRatio: '1/1' }}>
                                                <DiceDot value={val} />
                                            </motion.div>
                                        ))}
                                        <div style={{ position: 'absolute', bottom: '-26px', left: 0, right: 0, textAlign: 'center', fontSize: '0.78rem', fontWeight: 900, color: '#7e22ce' }}>
                                            {getColScore(col)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. 중앙 주사위 굴림 그릇 & 격발 */}
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '15px 0' }}>
                            {currentTurn === 'player' ? (
                                <button
                                    onClick={rollDice}
                                    disabled={currentDice !== null || isRolling}
                                    title="주사위를 힘차게 굴립니다"
                                    style={{
                                        padding: '12px 24px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                                        border: 'none', color: 'white', fontWeight: 900, borderRadius: '16px', fontSize: '1rem',
                                        cursor: (currentDice !== null || isRolling) ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 8px 15px rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    <RefreshCw size={18} className={isRolling ? 'animate-spin' : ''} /> 주사위 굴리기
                                </button>
                            ) : (
                                <div style={{ padding: '12px 24px', background: 'white', border: '2.5px solid #ffd3db', color: '#c084fc', fontWeight: 800, borderRadius: '16px', fontSize: '0.95rem' }}>
                                    AI 대전 상대 대기 중...
                                </div>
                            )}

                            {/* 굴려진 주사위 디스플레이 */}
                            <div style={{ width: '64px', height: '64px' }}>
                                {currentDice !== null ? (
                                    <motion.div animate={isRolling ? { rotate: 360 } : {}} transition={isRolling ? { repeat: Infinity, duration: 0.3, ease: 'linear' } : {}} style={{ width: '100%', height: '100%' }}>
                                        <DiceDot value={currentDice} />
                                    </motion.div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', border: '2.5px dashed #d8b4fe', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', fontSize: '1.2rem', fontWeight: 900 }}>
                                        ?
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. 내 보드 (하단) */}
                        <div style={{ textAlign: 'center', width: '100%', maxWidth: '320px' }}>
                            <div style={{ display: 'flex', gap: '15px', background: 'rgba(168, 85, 247, 0.05)', padding: '12px', borderRadius: '24px', border: '2px solid rgba(168, 85, 247, 0.2)' }}>
                                {playerBoard.map((col, cIdx) => {
                                    const canPlace = currentTurn === 'player' && currentDice !== null && !isRolling && col.length < 3;
                                    return (
                                        <div
                                            key={cIdx}
                                            onClick={() => canPlace && handlePlaceDice(cIdx)}
                                            style={{
                                                flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', height: '180px',
                                                background: canPlace ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.4)',
                                                borderRadius: '16px',
                                                border: canPlace ? '2px dashed #a855f7' : '1.5px dashed rgba(168,85,247,0.2)',
                                                padding: '8px', position: 'relative', cursor: canPlace ? 'pointer' : 'default',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            {col.map((val, rIdx) => (
                                                <motion.div key={rIdx} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', aspectRatio: '1/1' }}>
                                                    <DiceDot value={val} />
                                                </motion.div>
                                            ))}
                                            <div style={{ position: 'absolute', top: '-26px', left: 0, right: 0, textAlign: 'center', fontSize: '0.78rem', fontWeight: 900, color: '#6b21a8' }}>
                                                {getColScore(col)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#6b21a8', marginTop: '4px' }}>
                                <span>👑 내 보드 (배치하려면 터치)</span>
                                <span>합계: {getBoardTotalScore(playerBoard)}점</span>
                            </div>
                        </div>
                    </div>

                    {/* 대기화면 및 게임종료 화면 모달 팝업 */}
                    {gameState === 'ready' && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '35px', background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
                            <div style={{ fontSize: '5rem', marginBottom: '15px' }}>🎲</div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7e22ce', marginBottom: '8px' }}>티카투카 주사위 대전</h3>
                            <p style={{ color: '#6b21a8', fontSize: '0.82rem', fontWeight: 600, maxWidth: '280px', lineHeight: 1.45, textAlign: 'center', marginBottom: '24px' }}>
                                주사위를 한 줄에 나란히 놓아 점수를 뻥튀기하고, 상대와 똑같은 숫자를 매칭시켜 상대 주사위를 폭파하세요! 2줄 이상 이기면 승리 🏆
                            </p>
                            <button onClick={startGame} title="티카투카 주사위 대전을 시작합니다" style={{ padding: '14px 45px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none', color: 'white', fontWeight: 900, borderRadius: '15px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)' }}>
                                대전 시작
                            </button>
                        </div>
                    )}

                    {gameState === 'finished' && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '35px', background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
                            <div style={{ fontSize: '5.5rem', marginBottom: '15px' }}>
                                {gameResult === 'win' ? '🏆' : gameResult === 'lose' ? '💀' : '🤝'}
                            </div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: gameResult === 'win' ? '#7e22ce' : '#475569', marginBottom: '8px' }}>
                                {gameResult === 'win' ? '대결 승리!' : gameResult === 'lose' ? '대결 패배...' : '무승부!'}
                            </h3>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#334155', marginBottom: '30px' }}>
                                최종 점수: <span style={{ color: '#7e22ce' }}>{getBoardTotalScore(playerBoard)}</span> 대 <span style={{ color: '#a855f7' }}>{getBoardTotalScore(aiBoard)}</span>
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={onBack} title="대시보드로 돌아갑니다" style={{ flex: 1, padding: '12px 20px', borderRadius: '15px', fontWeight: 800, background: 'white', color: '#64748b', border: '1px solid #e9d5ff', cursor: 'pointer', fontSize: '0.9rem' }}>돌아가기</button>
                                    <button onClick={startGame} title="다시 대결에 임합니다" style={{ flex: 1.2, padding: '12px 20px', borderRadius: '15px', fontWeight: 900, background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 15px rgba(168, 85, 247, 0.2)', fontSize: '0.95rem' }}>다시 하기</button>
                                </div>
                                <button onClick={() => {
                                    useUserStore.getState().setActiveRankingTab('tikatuka');
                                    window.dispatchEvent(new CustomEvent('changeStep', { detail: 'ranking' }));
                                }} title="전체 연승 랭킹을 확인하러 이동합니다" style={{ width: '100%', padding: '12px 20px', background: 'white', border: '1px solid #ffd3db', color: '#a855f7', fontWeight: 800, borderRadius: '15px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(168, 85, 247, 0.05)' }}>
                                    <Trophy size={16} color="#a855f7" /> 전체 연승 랭킹 보기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 사이드바 연승 명예의 전당 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        background: 'white', borderRadius: '30px', padding: '25px',
                        border: '1px solid #e9d5ff', boxShadow: '0 8px 25px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Trophy size={22} color="#fbbf24" fill="#fbbf24" />
                            <h3 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#6b21a8' }}>연승 명예의 전당 (최고기록)</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {leaderboard.length > 0 ? (
                                leaderboard.map((item, i) => {
                                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                                    const badge = medals[i] || `${i + 1}위`;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', padding: '12px 14px',
                                            background: item.username === userName ? 'rgba(168, 85, 247, 0.06)' : '#fdfbff',
                                            border: item.username === userName ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid #e9d5ff',
                                            borderRadius: '14px', alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 800, color: '#475569', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.1rem' }}>{badge}</span>
                                                <span>{item.username}</span>
                                            </span>
                                            <span style={{ fontWeight: 900, color: '#a855f7', fontSize: '0.9rem' }}>{item.win_streak}연승</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#6b21a8', fontSize: '0.8rem', fontWeight: 600 }}>
                                    연승 기록을 남기는 첫 왕관을 획득해 보세요! 👑
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 플레이 조작 도움 가이드 */}
                    <div style={{
                        background: 'white', borderRadius: '30px', padding: '25px',
                        border: '1px solid #e9d5ff', boxShadow: '0 8px 25px rgba(0,0,0,0.03)'
                    }}>
                        <h4 style={{ fontWeight: 900, fontSize: '0.95rem', color: '#6b21a8', marginBottom: '12px' }}>🎲 점수 계산 가이드</h4>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>한 줄에 같은 숫자 2개 ➔ 눈금의 **4배**</li>
                            <li>한 줄에 같은 숫자 3개 ➔ 눈금의 **9배**</li>
                            <li>상대방 줄에 있는 주사위와 일치하는 숫자를 두면 상대방 주사위가 즉시 **파괴(삭제)** 됩니다.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TikatukaGamePage;
