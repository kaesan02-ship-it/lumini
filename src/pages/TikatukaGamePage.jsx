import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Play, Gem, Volume2, VolumeX, Sparkles, RefreshCw, Swords, Shield, AlertTriangle } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// 앤틱 스톤 질감의 6면체 주사위 눈 디자인 컴포넌트
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
            background: 'radial-gradient(circle, #f7f3e8 0%, #e2d9c3 100%)',
            borderRadius: '14px',
            boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.9), 0 6px 12px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.15)',
            border: '2.5px solid #8e7a63',
            boxSizing: 'border-box',
            padding: '8px'
        }}>
            {dots.map((pos, idx) => {
                const getStyle = () => {
                    switch (pos) {
                        case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                        case 'top-left': return { top: '22%', left: '22%' };
                        case 'top-right': return { top: '22%', right: '22%' };
                        case 'center-left': return { top: '50%', left: '22%', transform: 'translateY(-50%)' };
                        case 'center-right': return { top: '50%', right: '22%', transform: 'translateY(-50%)' };
                        case 'bottom-left': return { bottom: '22%', left: '22%' };
                        case 'bottom-right': return { bottom: '22%', right: '22%' };
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
                            background: '#4a3628',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 1.5px 2px rgba(0,0,0,0.6), 0 1px 0px rgba(255,255,255,0.4)',
                            ...getStyle()
                        }}
                    />
                );
            })}
        </div>
    );
};

// 열(Column)별 점수 합산 룰 (객체 배열 호환 지원)
const getColScore = (colArray) => {
    const counts = {};
    colArray.forEach(item => {
        const val = typeof item === 'object' ? item.val : item;
        counts[val] = (counts[val] || 0) + 1;
    });

    let sum = 0;
    Object.entries(counts).forEach(([valStr, count]) => {
        const val = parseInt(valStr);
        // 동일 눈금 콤보 공식: 1개->1배, 2개->4배, 3개->9배
        sum += val * count * count;
    });
    return sum;
};

// 보드 전체 점수 합산 (객체 배열 호환 지원)
const getBoardTotalScore = (board) => {
    return board.reduce((acc, col) => acc + getColScore(col), 0);
};

// AI 최적 수 탐색 알고리즘
const evaluateMove = (col, diceVal, playerBoard, opponentBoard) => {
    if (playerBoard[col].length >= 3) return -Infinity;

    // 1. 점수 획득 이득 계산
    const currentScore = getColScore(playerBoard[col]);
    const nextCol = [...playerBoard[col], { id: 'temp', val: diceVal }];
    const nextScore = getColScore(nextCol);
    const scoreGain = nextScore - currentScore;

    // 2. 상대방 주사위 파괴 가치 계산
    const oppCol = opponentBoard[col];
    const matchCount = oppCol.filter(item => {
        const val = typeof item === 'object' ? item.val : item;
        return val === diceVal;
    }).length;
    
    let destructionValue = 0;
    let extraTurnValue = 0; // 추가 턴 획득에 따른 보너스 가치
    if (matchCount > 0) {
        const oppCurrentScore = getColScore(oppCol);
        const oppNextCol = oppCol.filter(item => {
            const val = typeof item === 'object' ? item.val : item;
            return val !== diceVal;
        });
        const oppNextScore = getColScore(oppNextCol);
        destructionValue = oppCurrentScore - oppNextScore;
        extraTurnValue = 9; // 추가 턴 획득 시 보너스로 가치에 큰 점수(+9) 부여
    }

    // 3. 칸 잠김 감쇄 페널티
    const spacePenalty = nextCol.length === 3 ? -2.5 : 0;

    // 파괴 시 추가 턴 획득의 어마어마한 전술적 이점을 고려해 가중치 1.65배 부여
    return scoreGain + (destructionValue * 1.65) + extraTurnValue + spacePenalty;
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
    const [playerBoard, setPlayerBoard] = useState([[], [], []]); // [{id, val}][]
    const [aiBoard, setAiBoard] = useState([[], [], []]);
    const [currentDice, setCurrentDice] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameResult, setGameResult] = useState(null); // 'win', 'lose', 'draw'
    const [gameRoundResult, setGameRoundResult] = useState({ playerWins: 0, aiWins: 0, ties: 0 });
    
    // 추가 턴 (Extra Turn) 연출용 상태
    const [showExtraTurnBanner, setShowExtraTurnBanner] = useState(false);
    const [extraTurnOwner, setExtraTurnOwner] = useState(null); // 'player' or 'ai'

    // 파괴 이펙트(파티클) 및 AI 상태
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
                .select('max_win_streak, total_wins, total_games')
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
        setGameRoundResult({ playerWins: 0, aiWins: 0, ties: 0 });
        setShowExtraTurnBanner(false);
        setExtraTurnOwner(null);
        setCurrentTurn('player');
        setGameState('playing');

        setTimeout(() => {
            if (bgmRef.current && !isMuted) {
                bgmRef.current.volume = 0.12;
                bgmRef.current.play().catch(() => {});
            }
        }, 100);
    };

    // 파괴 파티클 연출
    const triggerDestroyParticle = (x, y) => {
        const newParticles = Array.from({ length: 12 }).map(() => ({
            id: Math.random(),
            x,
            y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 - 4,
            size: Math.floor(Math.random() * 5) + 5
        }));
        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.includes(p)));
        }, 800);
    };

    // 주사위 굴리기
    const rollDice = () => {
        if (isRolling || currentDice !== null || gameState !== 'playing') return;
        setIsRolling(true);

        const rollSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-hard-pop-click-2364.mp3');
        rollSfx.volume = 0.2;
        if (!isMuted) rollSfx.play().catch(() => {});

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
        if (playerBoard[colIndex].length >= 3) return;

        const placeSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-clunk-3024.mp3');
        placeSfx.volume = 0.2;
        if (!isMuted) placeSfx.play().catch(() => {});

        // 1. 주사위 배치 (고유 ID 장착)
        const newItem = { id: `p_${colIndex}_${Date.now()}_${Math.random()}`, val: currentDice };
        const newBoard = [...playerBoard];
        newBoard[colIndex] = [...newBoard[colIndex], newItem];
        setPlayerBoard(newBoard);

        // 2. 상대방(AI) 일치 주사위 파괴 처리
        const targetVal = currentDice;
        const oppCol = aiBoard[colIndex];
        const matchExists = oppCol.some(item => item.val === targetVal);

        let newAiBoard = [...aiBoard];
        let hasDestroyed = false;

        if (matchExists) {
            hasDestroyed = true;
            // 화면 기준 AI 보드의 열 위치 계산 (반응형 대응)
            const rect = document.getElementById(`ai-col-${colIndex}`)?.getBoundingClientRect();
            if (rect) {
                triggerDestroyParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            } else {
                triggerDestroyParticle(350 + colIndex * 90, 250);
            }

            const destroySfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-boxer-punch-strike-2382.mp3');
            destroySfx.volume = 0.25;
            if (!isMuted) destroySfx.play().catch(() => {});

            newAiBoard[colIndex] = oppCol.filter(item => item.val !== targetVal);
            setAiBoard(newAiBoard);
        }

        // 3. 주사위 리셋
        setCurrentDice(null);

        // 4. 추가 턴 규칙 적용 여부 확인
        if (hasDestroyed) {
            // 파괴 성공 시 플레이어 추가 턴 획득
            setExtraTurnOwner('player');
            setShowExtraTurnBanner(true);
            setTimeout(() => {
                setShowExtraTurnBanner(false);
            }, 1500);

            // 턴 교체 없이 현재 보드로 게임 상태만 재검토 (턴은 player 유지)
            checkGameStatus(newBoard, newAiBoard, 'player');
        } else {
            // 파괴 실패 시 정상적으로 AI 턴으로 교대
            checkGameStatus(newBoard, newAiBoard, 'ai');
        }
    };

    // 게임 종료 및 승패 조건 점검 (3판 2선승제 적용)
    const checkGameStatus = (pBoard, aBoard, nextPlayer) => {
        const isPlayerFull = pBoard.every(col => col.length >= 3);
        const isAiFull = aBoard.every(col => col.length >= 3);

        if (isPlayerFull || isAiFull) {
            // 라인별 1:1 비교
            let playerWins = 0;
            let aiWins = 0;
            let ties = 0;

            for (let i = 0; i < 3; i++) {
                const pScore = getColScore(pBoard[i]);
                const aScore = getColScore(aBoard[i]);
                if (pScore > aScore) {
                    playerWins++;
                } else if (aScore > pScore) {
                    aiWins++;
                } else {
                    ties++;
                }
            }

            let result = 'draw';
            if (playerWins > aiWins) {
                result = 'win';
            } else if (aiWins > playerWins) {
                result = 'lose';
            } else {
                // 획득 라인 전적이 동률(예: 1승 1무 1패 등)일 경우, 총점 비교로 최종 우열 판정
                const pTotal = getBoardTotalScore(pBoard);
                const aTotal = getBoardTotalScore(aBoard);
                if (pTotal > aTotal) result = 'win';
                else if (pTotal < aTotal) result = 'lose';
            }

            setGameRoundResult({ playerWins, aiWins, ties });
            setGameResult(result);
            setGameState('finished');
            if (bgmRef.current) bgmRef.current.pause();

            // 연승 관리 및 DB 저장
            if (result === 'win') {
                const nextStreak = winStreak + 1;
                setWinStreak(nextStreak);
                earnCrystals(25); // 승리 보너스 상향

                if (nextStreak > bestWinStreak) {
                    setBestWinStreak(nextStreak);
                    localStorage.setItem(streakKey, nextStreak.toString());

                    if (!USE_MOCK_DATA && user) {
                        supabase.from('tikatuka_game_scores')
                            .select('max_win_streak, total_wins, total_games')
                            .eq('user_id', user.id)
                            .single()
                            .then(({ data, error }) => {
                                if (data && !error) {
                                    supabase.from('tikatuka_game_scores')
                                        .update({ 
                                            max_win_streak: nextStreak,
                                            total_wins: (data.total_wins || 0) + 1,
                                            total_games: (data.total_games || 0) + 1
                                        })
                                        .eq('user_id', user.id)
                                        .then(() => fetchLeaderboard());
                                } else {
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
                setWinStreak(0);
                if (!USE_MOCK_DATA && user) {
                    supabase.from('tikatuka_game_scores')
                        .select('total_games')
                        .eq('user_id', user.id)
                        .single()
                        .then(({ data, error }) => {
                            if (data && !error) {
                                supabase.from('tikatuka_game_scores')
                                    .update({ total_games: (data.total_games || 0) + 1 })
                                    .eq('user_id', user.id);
                            }
                        });
                }
            }
        } else {
            setCurrentTurn(nextPlayer);
        }
    };

    // AI 행동 턴 처리
    useEffect(() => {
        if (gameState !== 'playing' || currentTurn !== 'ai' || gameResult) return;

        setAiThinking(true);
        let aiDiceVal = Math.floor(Math.random() * 6) + 1;

        let diceAnimInterval;
        let count = 0;
        setTimeout(() => {
            diceAnimInterval = setInterval(() => {
                setCurrentDice(Math.floor(Math.random() * 6) + 1);
                count++;
                if (count > 8) {
                    clearInterval(diceAnimInterval);
                    setCurrentDice(aiDiceVal);
                    
                    // 최적 가치 평가 배치
                    setTimeout(() => {
                        let bestCol = -1;
                        let maxVal = -Infinity;

                        for (let c = 0; c < 3; c++) {
                            const val = evaluateMove(c, aiDiceVal, aiBoard, playerBoard);
                            if (val > maxVal) {
                                maxVal = val;
                                bestCol = c;
                            }
                        }

                        if (bestCol === -1) {
                            for (let c = 0; c < 3; c++) {
                                if (aiBoard[c].length < 3) {
                                    bestCol = c;
                                    break;
                                }
                            }
                        }

                        if (bestCol !== -1) {
                            // AI 주사위 안착
                            const newItem = { id: `ai_${bestCol}_${Date.now()}_${Math.random()}`, val: aiDiceVal };
                            const newAiBoard = [...aiBoard];
                            newAiBoard[bestCol] = [...newAiBoard[bestCol], newItem];
                            setAiBoard(newAiBoard);

                            const placeSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-clunk-3024.mp3');
                            placeSfx.volume = 0.2;
                            if (!isMuted) placeSfx.play().catch(() => {});

                            // 플레이어 주사위 격파
                            const pCol = playerBoard[bestCol];
                            const matchExists = pCol.some(item => item.val === aiDiceVal);
                            
                            let newPlayerBoard = [...playerBoard];
                            let hasDestroyed = false;

                            if (matchExists) {
                                hasDestroyed = true;
                                const rect = document.getElementById(`player-col-${bestCol}`)?.getBoundingClientRect();
                                if (rect) {
                                    triggerDestroyParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
                                } else {
                                    triggerDestroyParticle(150 + bestCol * 90, 450);
                                }

                                const destroySfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-boxer-punch-strike-2382.mp3');
                                destroySfx.volume = 0.25;
                                if (!isMuted) destroySfx.play().catch(() => {});

                                newPlayerBoard[bestCol] = pCol.filter(item => item.val !== aiDiceVal);
                                setPlayerBoard(newPlayerBoard);
                            }

                            // AI 주사위 컵 리셋
                            setCurrentDice(null);
                            setAiThinking(false);

                            // 추가 턴 분기 적용
                            if (hasDestroyed) {
                                // 파괴 성공 시 AI 추가 턴 획득
                                setExtraTurnOwner('ai');
                                setShowExtraTurnBanner(true);
                                setTimeout(() => {
                                    setShowExtraTurnBanner(false);
                                }, 1500);

                                // 턴 변경 없이 AI 턴 유지
                                checkGameStatus(newPlayerBoard, newAiBoard, 'ai');
                            } else {
                                // 파괴 실패 시 플레이어 턴으로 교대
                                checkGameStatus(newPlayerBoard, newAiBoard, 'player');
                            }
                        }
                    }, 600);
                }
            }, 80);
        }, 600);

        return () => {
            if (diceAnimInterval) clearInterval(diceAnimInterval);
        };
    }, [currentTurn, gameState]);

    // 라인 0,1,2의 대결 상황 판정 (깃발 인디케이터용)
    const getLineWinnerSymbol = (lineIdx) => {
        const pScore = getColScore(playerBoard[lineIdx]);
        const aScore = getColScore(aiBoard[lineIdx]);
        if (pScore > aScore) return '👑';
        if (aScore > pScore) return '💀';
        return '⚔️';
    };

    return (
        <div style={{
            minHeight: '100vh', 
            background: 'radial-gradient(circle, #1a231d 0%, #0d120f 100%)', // 마법의 숲 어두운 앤틱 그린 배경
            padding: '20px 2%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            userSelect: 'none', color: '#e2e8f0', position: 'relative', overflow: 'hidden'
        }}>
            {/* 파괴 파티클 레이어 (불꽃 이펙트 강화) */}
            {particles.map(p => (
                <span
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        background: '#d4af37', // 골드 조각 파티클
                        borderRadius: '2px',
                        pointerEvents: 'none',
                        zIndex: 99,
                        boxShadow: '0 0 8px #fbbf24',
                        transform: `translate(${p.vx * 3.5}px, ${p.vy * 3.5}px)`,
                        transition: 'transform 0.8s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.8s',
                        opacity: 0
                    }}
                />
            ))}

            {/* 황금빛 앤틱 EXTRA TURN 배너 팝업 */}
            <AnimatePresence>
                {showExtraTurnBanner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -40 }}
                        animate={{ opacity: 1, scale: 1.1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 11 }}
                        style={{
                            position: 'absolute',
                            top: '38%',
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                            background: 'linear-gradient(135deg, #d4af37 0%, #a27a18 100%)',
                            color: '#1e1100',
                            padding: '22px 50px',
                            borderRadius: '24px',
                            border: '3px solid #ffdf7a',
                            boxShadow: '0 15px 45px rgba(212, 175, 55, 0.65), 0 0 60px rgba(212, 175, 55, 0.35)',
                            zIndex: 100,
                            textAlign: 'center',
                            pointerEvents: 'none'
                        }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.95, color: '#3d2600' }}>
                            {extraTurnOwner === 'player' ? '⚡ 용사의 기적 ⚡' : '🔮 마법의 견제 🔮'}
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 950, marginTop: '4px', textShadow: '0 1px 2px rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
                            {extraTurnOwner === 'player' ? '추가 턴 획득!' : 'AI 추가 턴 획득!'}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, marginTop: '6px', color: '#1a0f00' }}>
                            상대 주사위를 폭파하여 보너스 주사위를 굴립니다.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <audio ref={bgmRef} loop src="https://assets.mixkit.co/music/preview/mixkit-retro-arcade-casino-key-515.mp3" />

            {/* Header (앤틱 앤 골드) */}
            <div style={{ width: '100%', maxWidth: '1150px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 10 }}>
                <button onClick={() => { if (bgmRef.current) bgmRef.current.pause(); onBack(); }} title="대시보드로 돌아갑니다" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', fontWeight: 800, background: 'rgba(30,41,34,0.85)', padding: '10px 20px', borderRadius: '15px', border: '1.5px solid #d4af37', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'all 0.2s' }}>
                    <ArrowLeft size={20} /> 로비로
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', textShadow: '0 0 10px rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    ⚔️ 에스더 주사위 배틀 (티카투카)
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => { setIsMuted(!isMuted); if (bgmRef.current) isMuted ? bgmRef.current.play() : bgmRef.current.pause(); }} title={isMuted ? "배경음악 켜기" : "배경음악 끄기"} style={{ background: 'rgba(30,41,34,0.85)', padding: '12px', borderRadius: '50%', border: '1.5px solid #d4af37', cursor: 'pointer', color: '#d4af37', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30,41,34,0.85)', padding: '10px 20px', borderRadius: '100px', border: '1.5px solid #d4af37', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                        <Gem size={20} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fbbf24' }}>{crystals}</span>
                    </div>
                </div>
            </div>

            <div style={{
                width: '100%', maxWidth: '1150px', display: 'grid',
                gridTemplateColumns: window.innerWidth <= 1024 ? '1fr' : '1fr 340px', gap: '30px', zIndex: 10
            }}>
                {/* 메인 게임판 (나무와 금속 몰딩 고풍 테마) */}
                <div style={{
                    background: 'radial-gradient(circle, #2a1b15 0%, #150d0a 100%)', // 깊고 중후한 어두운 나무 질감
                    border: '4px solid #b8860b', // 황금 테두리 몰딩
                    boxShadow: '0 25px 50px rgba(0,0,0,0.75), inset 0 0 20px rgba(0,0,0,0.6)',
                    borderRadius: '35px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    position: 'relative'
                }}>
                    {/* 상단 깃발 정보 */}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.15)', padding: '8px 16px', borderRadius: '14px', border: '1px solid #d4af37' }}>
                            <Sparkles size={16} color="#fbbf24" />
                            <span style={{ fontWeight: 900, color: '#fbbf24', fontSize: '0.95rem' }}>현재 {winStreak}연승 유지 중</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
                            <AlertTriangle size={15} /> 3개 라인 중 2개 라인을 먼저 선점한 측이 전장에 승리합니다!
                        </div>
                        <div style={{ fontWeight: 800, color: currentTurn === 'player' ? '#10b981' : '#a78bfa', fontSize: '0.95rem' }}>
                            {currentTurn === 'player' ? '🟢 용사 턴 (내 차례)' : '🟣 AI 분석 중...'}
                        </div>
                    </div>

                    {/* 대결 플레이 필드 (가로 대칭형: 내 보드 - 중앙 조작 - 상대 보드) */}
                    <div style={{
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: window.innerWidth <= 768 ? 'column' : 'row', 
                        gap: '20px', 
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        margin: '15px 0'
                    }}>
                        
                        {/* 1. 플레이어 보드 (왼쪽) */}
                        <div style={{ textAlign: 'center', flex: '1', maxWidth: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 8px 8px', fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>
                                <span>👑 내 영토</span>
                                <span>총점: {getBoardTotalScore(playerBoard)}점</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '24px', border: '2px solid #3d271d', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)' }}>
                                {playerBoard.map((col, cIdx) => {
                                    const canPlace = currentTurn === 'player' && currentDice !== null && !isRolling && col.length < 3;
                                    return (
                                        <div
                                            key={cIdx}
                                            id={`player-col-${cIdx}`}
                                            onClick={() => canPlace && handlePlaceDice(cIdx)}
                                            style={{
                                                flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', height: '260px',
                                                background: canPlace ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.35)',
                                                borderRadius: '16px',
                                                border: canPlace ? '2px dashed #10b981' : '1.5px solid #4a3325',
                                                padding: '8px', position: 'relative', cursor: canPlace ? 'pointer' : 'default',
                                                justifyContent: 'flex-end',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ position: 'absolute', top: '-28px', left: 0, right: 0, textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>
                                                {getColScore(col)}점
                                            </div>
                                            <AnimatePresence>
                                                {col.map((item) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ scale: 0.2, y: -150, rotate: 15 }}
                                                        animate={{ scale: 1, y: 0, rotate: 0 }}
                                                        exit={{ 
                                                            scale: 0.4, 
                                                            y: 200, 
                                                            x: (Math.random() - 0.5) * 160, 
                                                            rotate: 360, 
                                                            opacity: 0 
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                                                        style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}
                                                    >
                                                        <DiceDot value={item.val} />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. 중앙 점령 지표 및 주사위 컨트롤러 */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '15px', 
                            background: 'rgba(0,0,0,0.3)',
                            padding: '16px', 
                            borderRadius: '20px',
                            border: '1.5px solid #4a3325',
                            minWidth: '160px'
                        }}>
                            {/* 라인별 실시간 점령 현황 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 800 }}>라인 전투 현황</span>
                                {[0, 1, 2].map((idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 800 }}>
                                        <span style={{ color: '#10b981' }}>{getColScore(playerBoard[idx])}</span>
                                        <span style={{ fontSize: '1.1rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                                            {getLineWinnerSymbol(idx)}
                                        </span>
                                        <span style={{ color: '#a78bfa' }}>{getColScore(aiBoard[idx])}</span>
                                    </div>
                                ))}
                            </div>

                            <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #4a3325' }} />

                            {/* 굴려진 주사위 디스플레이 */}
                            <div style={{ width: '70px', height: '70px', position: 'relative' }}>
                                {currentDice !== null ? (
                                    <motion.div 
                                        animate={isRolling ? { rotate: 360, scale: [1, 1.1, 1] } : { scale: 1.1 }} 
                                        transition={isRolling ? { repeat: Infinity, duration: 0.3, ease: 'linear' } : { type: 'spring', stiffness: 300, damping: 10 }} 
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <DiceDot value={currentDice} />
                                    </motion.div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', border: '2.5px dashed #8e7a63', borderRadius: '14px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e7a63', fontSize: '1.4rem', fontWeight: 900 }}>
                                        ?
                                    </div>
                                )}
                            </div>

                            {/* 주사위 컨트롤러 단추 */}
                            {currentTurn === 'player' ? (
                                <button
                                    onClick={rollDice}
                                    disabled={currentDice !== null || isRolling}
                                    title="주사위를 굴립니다"
                                    style={{
                                        padding: '10px 18px', background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                                        border: 'none', color: '#1a0d00', fontWeight: 900, borderRadius: '12px', fontSize: '0.85rem',
                                        cursor: (currentDice !== null || isRolling) ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 6px 15px rgba(212, 175, 55, 0.35)', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <RefreshCw size={14} className={isRolling ? 'animate-spin' : ''} /> 굴리기
                                </button>
                            ) : (
                                <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.5)', border: '1.5px solid #8b5cf6', color: '#a78bfa', fontWeight: 800, borderRadius: '12px', fontSize: '0.78rem' }}>
                                    AI 차례...
                                </div>
                            )}
                        </div>

                        {/* 3. AI 보드 (오른쪽) */}
                        <div style={{ textAlign: 'center', flex: '1', maxWidth: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 8px 8px', fontSize: '0.9rem', fontWeight: 800, color: '#a78bfa' }}>
                                <span>🤖 상대 AI</span>
                                <span>총점: {getBoardTotalScore(aiBoard)}점</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '24px', border: '2px solid #3d271d', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)' }}>
                                {aiBoard.map((col, cIdx) => (
                                    <div 
                                        key={cIdx} 
                                        id={`ai-col-${cIdx}`}
                                        style={{ 
                                            flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', height: '260px', 
                                            background: 'rgba(0,0,0,0.35)', borderRadius: '16px', border: '1.5px solid #4a3325', 
                                            padding: '8px', position: 'relative', justifyContent: 'flex-end'
                                        }}
                                    >
                                        <div style={{ position: 'absolute', top: '-28px', left: 0, right: 0, textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#a78bfa' }}>
                                            {getColScore(col)}점
                                        </div>
                                        <AnimatePresence>
                                            {col.map((item) => (
                                                <motion.div 
                                                    key={item.id} 
                                                    initial={{ scale: 0.2, y: -150, rotate: -15 }} 
                                                    animate={{ scale: 1, y: 0, rotate: 0 }} 
                                                    exit={{ 
                                                        scale: 0.4, 
                                                        y: -200, 
                                                        x: (Math.random() - 0.5) * 160, 
                                                        rotate: -360, 
                                                        opacity: 0 
                                                    }}
                                                    transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                                                    style={{ width: '100%', aspectRatio: '1/1' }}
                                                >
                                                    <DiceDot value={item.val} />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* 대기화면 (판타지 고대 서판풍) */}
                    {gameState === 'ready' && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '35px', background: 'radial-gradient(circle, #251812 0%, #0d0705 100%)', border: '4px solid #b8860b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
                            <div style={{ fontSize: '4.5rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>⚔️</div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>티카투카 주사위 대결</h3>
                            <p style={{ color: '#d8c5b0', fontSize: '0.85rem', fontWeight: 600, maxWidth: '380px', lineHeight: 1.5, textAlign: 'center', marginBottom: '30px' }}>
                                주사위를 3개 라인에 배치하여 경쟁합니다.<br/>
                                같은 주사위를 나란히 두면 **배수 보너스** 콤보!<br/>
                                상대방과 동일한 눈금을 두면 상대 주사위를 **완전 폭파**시킵니다.<br/>
                                **상대 주사위를 폭파하면 1회 추가 주사위 기회** 획득! ⚡<br/>
                                **3개 라인 중 2개 라인을 선점**하는 측이 영토에 승리합니다!
                            </p>
                            <button onClick={startGame} title="대결을 시작합니다" style={{ padding: '14px 45px', background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)', color: '#1a0d00', fontWeight: 900, borderRadius: '15px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(212, 175, 55, 0.45)', border: '1px solid #ffdf7a' }}>
                                전장 진입
                            </button>
                        </div>
                    )}

                    {/* Game finished modal (판타지 전장 통계 정보) */}
                    {gameState === 'finished' && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '35px', background: 'radial-gradient(circle, #251812 0%, #0d0705 100%)', border: '4px solid #b8860b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
                            <div style={{ fontSize: '5rem', marginBottom: '15px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}>
                                {gameResult === 'win' ? '🏆' : gameResult === 'lose' ? '💀' : '🤝'}
                            </div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: gameResult === 'win' ? '#f59e0b' : '#94a3b8', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                {gameResult === 'win' ? '전투 승리!' : gameResult === 'lose' ? '전투 패배...' : '무승부'}
                            </h3>
                            
                            {/* 라인 및 총점 결과 상세 표시 */}
                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '15px 30px', borderRadius: '18px', border: '1.5px solid #4a3325', marginBottom: '30px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3e8ff', marginBottom: '6px' }}>
                                    점령 전적: <span style={{ color: '#10b981' }}>{gameRoundResult.playerWins}라인</span> 대 <span style={{ color: '#a78bfa' }}>{gameRoundResult.aiWins}라인</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#d8c5b0' }}>
                                    (누적 점수: {getBoardTotalScore(playerBoard)}점 vs {getBoardTotalScore(aiBoard)}점)
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={onBack} title="대시보드로 돌아갑니다" style={{ flex: 1, padding: '12px 20px', borderRadius: '15px', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: '#d8c5b0', border: '1.5px solid #8e7a63', cursor: 'pointer', fontSize: '0.9rem' }}>로비로</button>
                                    <button onClick={startGame} title="다시 대결에 임합니다" style={{ flex: 1.2, padding: '12px 20px', borderRadius: '15px', fontWeight: 900, background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)', color: '#1a0d00', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(212, 175, 55, 0.35)', fontSize: '0.95rem' }}>다시 도전</button>
                                </div>
                                <button onClick={() => {
                                    useUserStore.getState().setActiveRankingTab('tikatuka');
                                    window.dispatchEvent(new CustomEvent('changeStep', { detail: 'ranking' }));
                                }} title="전체 연승 랭킹을 확인하러 이동합니다" style={{ width: '100%', padding: '12px 20px', background: 'rgba(0,0,0,0.4)', border: '1px solid #d4af37', color: '#fbbf24', fontWeight: 800, borderRadius: '15px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                    <Trophy size={16} color="#fbbf24" fill="#fbbf24" /> 전체 연승 랭킹 보기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 사이드바 (연승 명예의 전당 및 도움 정보) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        background: 'rgba(23,17,13,0.95)', borderRadius: '30px', padding: '25px',
                        border: '2px solid #b8860b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Trophy size={22} color="#fbbf24" fill="#fbbf24" />
                            <h3 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fbbf24' }}>최고 연승 리더보드</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {leaderboard.length > 0 ? (
                                leaderboard.map((item, i) => {
                                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                                    const badge = medals[i] || `${i + 1}위`;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', padding: '12px 14px',
                                            background: item.username === userName ? 'rgba(212,175,55,0.1)' : 'rgba(0,0,0,0.3)',
                                            border: item.username === userName ? '1px solid #d4af37' : '1px solid #4a3325',
                                            borderRadius: '14px', alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.1rem' }}>{badge}</span>
                                                <span>{item.username}</span>
                                            </span>
                                            <span style={{ fontWeight: 900, color: '#fbbf24', fontSize: '0.9rem' }}>{item.win_streak}연승</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#d4af37', fontSize: '0.8rem', fontWeight: 600 }}>
                                    첫 왕관을 차지하세요! 👑
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 플레이 조작 도움 가이드 */}
                    <div style={{
                        background: 'rgba(23,17,13,0.95)', borderRadius: '30px', padding: '25px',
                        border: '2px solid #b8860b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <h4 style={{ fontWeight: 900, fontSize: '0.95rem', color: '#fbbf24', marginBottom: '12px' }}>📜 에스더 룰북</h4>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#d8c5b0', fontWeight: 600, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>**동일 눈금 콤보**: 동일한 주사위를 한 라인에 나란히 놓으면 점수 배수가 중첩됩니다. (1개 1배, 2개 4배, 3개 9배)</li>
                            <li>**폭파 및 추가 턴**: 내가 주사위를 놓은 자리에 상대방의 동일한 숫자가 존재하면, 상대방의 주사위가 날아가며 파괴되고 **내게 1회 추가 주사위 굴리기 기회(Extra Turn)**가 주어집니다! ⚡</li>
                            <li>**승리 기준**: 한 사람의 보드가 꽉 차면 종료되며, 3개 라인 중 더 높은 라인을 **2개 이상 선점**한 자가 승리합니다.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TikatukaGamePage;
