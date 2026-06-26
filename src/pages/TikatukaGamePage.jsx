import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Gem, Volume2, VolumeX, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// 앤틱 스톤 질감의 6면체 주사위 눈 디자인 컴포넌트 (보호막 이펙트 탑재)
const DiceDot = ({ value, isShielded }) => {
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
            background: isShielded 
                ? 'radial-gradient(circle, #e0f2fe 0%, #bae6fd 100%)' // 실드 주사위: 신비로운 하늘빛 돌
                : 'radial-gradient(circle, #f7f3e8 0%, #e2d9c3 100%)', // 일반 주사위: 앤틱 돌
            borderRadius: '14px',
            boxShadow: isShielded
                ? '0 0 15px rgba(56, 189, 248, 0.8), inset 0 3px 6px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(56, 189, 248, 0.4)'
                : 'inset 0 3px 6px rgba(255,255,255,0.9), 0 6px 12px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.15)',
            border: isShielded 
                ? '2.5px solid #0284c7' // 실드 테두리: 선명한 파란빛
                : '2.5px solid #8e7a63', // 일반 테두리
            boxSizing: 'border-box',
            padding: '8px',
            transition: 'all 0.3s'
        }}>
            {/* 보호막 아우라 시각화 */}
            {isShielded && (
                <div style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '18px',
                    border: '1.5px solid rgba(56, 189, 248, 0.6)',
                    animation: 'pulse 1.5s infinite alternate',
                    pointerEvents: 'none'
                }} />
            )}

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
                            width: '7px',
                            height: '7px',
                            background: isShielded ? '#0369a1' : '#4a3628',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 1px 1.5px rgba(0,0,0,0.6)',
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

// 보드 전체 점수 합산
const getBoardTotalScore = (board) => {
    return board.reduce((acc, col) => acc + getColScore(col), 0);
};

// AI 최적 수 탐색 알고리즘 (리팩토링: 실드 주사위 침투 가치 계산 포함)
const evaluateMove = (col, diceVal, playerBoard, opponentBoard, isShieldPlacement) => {
    // 상대 보드 침투 배치일 때
    if (isShieldPlacement) {
        if (opponentBoard[col].length >= 3) return -Infinity;

        const currentOppScore = getColScore(opponentBoard[col]);
        const nextOppCol = [...opponentBoard[col], { id: 'temp', val: diceVal, isShielded: true }];
        const nextOppScore = getColScore(nextOppCol);
        const scoreDifference = nextOppScore - currentOppScore;

        const lineFullBonus = nextOppCol.length === 3 ? 4 : 0;
        
        return -scoreDifference + lineFullBonus + 2; 
    }

    // 내 보드 배치일 때
    if (playerBoard[col].length >= 3) return -Infinity;

    // 1. 점수 획득 이득 계산
    const currentScore = getColScore(playerBoard[col]);
    const nextCol = [...playerBoard[col], { id: 'temp', val: diceVal }];
    const nextScore = getColScore(nextCol);
    const scoreGain = nextScore - currentScore;

    // 2. 상대방 주사위 파괴 가치 계산 (상대방 주사위가 보호막이 아닐 때만 파괴 가능)
    const oppCol = opponentBoard[col];
    const destructibleCount = oppCol.filter(item => item.val === diceVal && !item.isShielded).length;
    
    let destructionValue = 0;
    let extraTurnValue = 0;
    if (destructibleCount > 0) {
        const oppCurrentScore = getColScore(oppCol);
        const oppNextCol = oppCol.filter(item => !(item.val === diceVal && !item.isShielded));
        const oppNextScore = getColScore(oppNextCol);
        destructionValue = oppCurrentScore - oppNextScore;
        extraTurnValue = 12; // 추가 턴 획득 보상 가치
    }

    // 3. 칸 잠김 감쇄 페널티
    const spacePenalty = nextCol.length === 3 ? -2.5 : 0;

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
    const [playerBoard, setPlayerBoard] = useState([[], [], []]); // [{id, val, isShielded}][] (가로 행 3라인)
    const [aiBoard, setAiBoard] = useState([[], [], []]);
    
    // 주사위 롤링 및 선택 상태
    const [currentDice, setCurrentDice] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameResult, setGameResult] = useState(null); // 'win', 'lose', 'draw'
    const [gameRoundResult, setGameRoundResult] = useState({ playerWins: 0, aiWins: 0, ties: 0 });

    // 추가 턴 (Extra Turn) 및 보호막 주사위 상태
    const [isCurrentDiceShielded, setIsCurrentDiceShielded] = useState(true); // 첫 턴은 항상 실드 주사위
    const [isExtraTurn, setIsExtraTurn] = useState(false); // 현재 턴이 추가 턴인지 여부
    const [showExtraTurnBanner, setShowExtraTurnBanner] = useState(false);
    const [extraTurnOwner, setExtraTurnOwner] = useState(null);
    const [isFirstMove, setIsFirstMove] = useState(true); // 첫 턴 시작 여부 감지

    // 리롤(Re-roll) 찬스 상태
    const [playerReRollUsed, setPlayerReRollUsed] = useState(false);
    const [aiReRollUsed, setAiReRollUsed] = useState(false);
    const [reRolledDice, setReRolledDice] = useState(null);
    const [isReRolling, setIsReRolling] = useState(false);
    const [showReRollSelect, setShowReRollSelect] = useState(false); // 리롤 후 2지선다 주사위 선택창 표시

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
        setIsExtraTurn(false);
        setIsCurrentDiceShielded(true); // 최초 주사위는 실드 주사위로 장전
        setIsFirstMove(true);
        setPlayerReRollUsed(false);
        setAiReRollUsed(false);
        setReRolledDice(null);
        setShowReRollSelect(false);
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
        const newParticles = Array.from({ length: 15 }).map(() => ({
            id: Math.random(),
            x,
            y,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.5) * 14 - 4,
            size: Math.floor(Math.random() * 6) + 5
        }));
        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.includes(p)));
        }, 850);
    };

    // 주사위 굴리기
    const rollDice = () => {
        if (isRolling || currentDice !== null || gameState !== 'playing' || showReRollSelect) return;
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

    // 리롤 찬스 격발
    const triggerReRoll = () => {
        if (playerReRollUsed || currentDice === null || isRolling || isReRolling) return;
        setIsReRolling(true);

        const rollSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-hard-pop-click-2364.mp3');
        rollSfx.volume = 0.2;
        if (!isMuted) rollSfx.play().catch(() => {});

        let count = 0;
        const interval = setInterval(() => {
            setReRolledDice(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 8) {
                clearInterval(interval);
                setIsReRolling(false);
                setPlayerReRollUsed(true);
                setShowReRollSelect(true); // 2지선다 선택창 표시
            }
        }, 80);
    };

    // 리롤 결과 선택 완료
    const handleSelectDiceOption = (val) => {
        setCurrentDice(val);
        setReRolledDice(null);
        setShowReRollSelect(false);
    };

    // 주사위 배치 핵심 함수 (동귀어진 및 실드 침투 룰 반영, React 비동기 보정용 세 번째 인자 탑재)
    const placeDiceOnBoard = (lineIdx, targetOwner, customDiceVal = null) => {
        const diceToPlace = customDiceVal !== null ? customDiceVal : currentDice;
        if (diceToPlace === null || isRolling || showReRollSelect) return;

        // targetOwner: 'player' (내 보드) or 'ai' (상대 보드)
        const isTargetPlayerBoard = targetOwner === 'player';
        const targetBoard = isTargetPlayerBoard ? playerBoard : aiBoard;
        const oppBoard = isTargetPlayerBoard ? aiBoard : playerBoard;

        if (targetBoard[lineIdx].length >= 3) return; // 한 라인 최대 3개

        // 침투 조건 검증: 상대 보드에 박으려면 반드시 추가 턴 실드 주사위여야 하며, 첫 턴은 안 됨
        const isOpponentPlacement = (currentTurn === 'player' && !isTargetPlayerBoard) || (currentTurn === 'ai' && isTargetPlayerBoard);
        if (isOpponentPlacement) {
            if (!isCurrentDiceShielded || isFirstMove) return; // 추가 턴이 아닐 때는 침투 불가
        }

        const placeSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-clunk-3024.mp3');
        placeSfx.volume = 0.2;
        if (!isMuted) placeSfx.play().catch(() => {});

        const targetVal = diceToPlace;
        const oppLine = oppBoard[lineIdx];
        
        // 상대 라인에서 '보호막이 없는' 일치 주사위가 존재하는지 확인
        const matchExists = oppLine.some(item => item.val === targetVal && !item.isShielded);

        let newTargetBoard = [...targetBoard];
        let newOppBoard = [...oppBoard];
        let hasDestroyed = false;

        // 알까기 파괴가 발생하는 경우
        if (matchExists && !isOpponentPlacement) {
            hasDestroyed = true;
            
            // 파티클 생성 (수평 가로 라인 ID 적용)
            const colId = isTargetPlayerBoard ? `ai-line-${lineIdx}` : `player-line-${lineIdx}`;
            const rect = document.getElementById(colId)?.getBoundingClientRect();
            if (rect) {
                triggerDestroyParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            } else {
                triggerDestroyParticle(500, 300);
            }

            const destroySfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-boxer-punch-strike-2382.mp3');
            destroySfx.volume = 0.25;
            if (!isMuted) destroySfx.play().catch(() => {});

            // 상대 보드에서 파괴된 주사위(Shielded 제외) 필터링 소멸
            newOppBoard[lineIdx] = oppLine.filter(item => !(item.val === targetVal && !item.isShielded));
            
            // 동귀어진(Mutual Destruction): 내 주사위도 보드에 올라가지 않고 증발
            // (즉, newTargetBoard[lineIdx]에 주사위를 추가하지 않음)
        } else {
            // 알까기가 일어나지 않았거나 침투 배치일 때: 정상 배치
            const newItem = {
                id: `dice_${Date.now()}_${Math.random()}`,
                val: targetVal,
                isShielded: isCurrentDiceShielded
            };
            newTargetBoard[lineIdx] = [...newTargetBoard[lineIdx], newItem];
        }

        // 보드 상태 저장
        if (isTargetPlayerBoard) {
            setPlayerBoard(newTargetBoard);
            setAiBoard(newOppBoard);
        } else {
            setAiBoard(newTargetBoard);
            setPlayerBoard(newOppBoard);
        }

        // 주사위 소모 리셋
        setCurrentDice(null);
        setIsFirstMove(false);

        // 추가 턴 분기 연산 (추가 턴 상태에서는 추가 턴 연속 획득 불가로 밸런싱)
        if (hasDestroyed && !isExtraTurn) {
            // 파괴 성공 및 추가 턴 트리거
            setExtraTurnOwner(currentTurn);
            setShowExtraTurnBanner(true);
            setIsExtraTurn(true);
            setIsCurrentDiceShielded(true); // 추가 턴의 주사위는 "실드 주사위"

            setTimeout(() => {
                setShowExtraTurnBanner(false);
            }, 1500);

            // 턴 교체 없이 현재 턴(player or ai) 유지
            checkGameStatus(
                isTargetPlayerBoard ? newTargetBoard : newOppBoard,
                isTargetPlayerBoard ? newOppBoard : newTargetBoard,
                currentTurn
            );
        } else {
            // 일반 배치 완료: 턴 교대 및 실드/추가 턴 리셋
            setIsExtraTurn(false);
            setIsCurrentDiceShielded(false);
            
            const nextTurn = currentTurn === 'player' ? 'ai' : 'player';
            checkGameStatus(
                isTargetPlayerBoard ? newTargetBoard : newOppBoard,
                isTargetPlayerBoard ? newOppBoard : newTargetBoard,
                nextTurn
            );
        }
    };

    // 게임 종료 및 최종 라인 3판 2선승 판정
    const checkGameStatus = (pBoard, aBoard, nextPlayer) => {
        const isPlayerFull = pBoard.every(col => col.length >= 3);
        const isAiFull = aBoard.every(col => col.length >= 3);

        if (isPlayerFull || isAiFull) {
            // 라인 1:1 비교
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
                // 라인 득실 동률 시 최종 총점 비교
                const pTotal = getBoardTotalScore(pBoard);
                const aTotal = getBoardTotalScore(aBoard);
                if (pTotal > aTotal) result = 'win';
                else if (pTotal < aTotal) result = 'lose';
            }

            setGameRoundResult({ playerWins, aiWins, ties });
            setGameResult(result);
            setGameState('finished');
            if (bgmRef.current) bgmRef.current.pause();

            // 연승 관리 및 DB 기록
            if (result === 'win') {
                const nextStreak = winStreak + 1;
                setWinStreak(nextStreak);
                earnCrystals(25);

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

    // AI 행동 턴 처리 및 멈춤 버그 핫픽스 (상태 의존성 클로저 보강 완료)
    useEffect(() => {
        if (gameState !== 'playing' || currentTurn !== 'ai' || gameResult || aiThinking || isRolling) return;

        // AI 차례인데 아직 굴려진 주사위가 없는 경우 주사위 자동 롤링 격발
        if (currentDice === null && !showReRollSelect) {
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
                        
                        // 1. 리롤 조건 확인
                        let bestColNormal = -1;
                        let maxValNormal = -Infinity;
                        for (let c = 0; c < 3; c++) {
                            const val = evaluateMove(c, aiDiceVal, aiBoard, playerBoard, false);
                            if (val > maxValNormal) {
                                maxValNormal = val;
                                bestColNormal = c;
                            }
                        }

                        // 가치가 낮아 리롤을 해야 할 경우
                        if (maxValNormal < 4 && !aiReRollUsed) {
                            setAiReRollUsed(true);
                            let aiReRollVal = Math.floor(Math.random() * 6) + 1;
                            
                            setTimeout(() => {
                                let maxValReRoll = -Infinity;
                                for (let c = 0; c < 3; c++) {
                                    const val = evaluateMove(c, aiReRollVal, aiBoard, playerBoard, false);
                                    if (val > maxValReRoll) maxValReRoll = val;
                                }

                                if (maxValReRoll > maxValNormal) {
                                    setCurrentDice(aiReRollVal);
                                    executeAiPlacement(aiReRollVal);
                                } else {
                                    setCurrentDice(aiDiceVal);
                                    executeAiPlacement(aiDiceVal);
                                }
                            }, 500);
                        } else {
                            setCurrentDice(aiDiceVal);
                            executeAiPlacement(aiDiceVal);
                        }
                    }
                }, 80);
            }, 600);

            return () => {
                if (diceAnimInterval) clearInterval(diceAnimInterval);
            };
        }

        // AI 주사위 장착 실행 함수 (매개변수로 주사위 값을 전달받아 비동기 상태 지연 해결)
        function executeAiPlacement(diceVal) {
            setTimeout(() => {
                let bestCol = -1;
                let maxVal = -Infinity;
                let shouldPlaceOpponent = false;

                const canIntrude = isCurrentDiceShielded && !isFirstMove;

                // 내 보드 배치 가치 분석
                for (let c = 0; c < 3; c++) {
                    const val = evaluateMove(c, diceVal, aiBoard, playerBoard, false);
                    if (val > maxVal) {
                        maxVal = val;
                        bestCol = c;
                        shouldPlaceOpponent = false;
                    }
                }

                // 상대 보드 침투 배치 가치 분석
                if (canIntrude) {
                    for (let c = 0; c < 3; c++) {
                        const val = evaluateMove(c, diceVal, aiBoard, playerBoard, true);
                        if (val > maxVal) {
                            maxVal = val;
                            bestCol = c;
                            shouldPlaceOpponent = true;
                        }
                    }
                }

                // 가용 비상 덤핑
                if (bestCol === -1) {
                    for (let c = 0; c < 3; c++) {
                        if (aiBoard[c].length < 3) {
                            bestCol = c;
                            shouldPlaceOpponent = false;
                            break;
                        }
                    }
                }

                if (bestCol !== -1) {
                    setAiThinking(false);
                    // 핫픽스: 세 번째 매개변수로 결정된 주사위 값을 다이렉트로 전달해 멈춤 현상 차단
                    placeDiceOnBoard(bestCol, shouldPlaceOpponent ? 'player' : 'ai', diceVal);
                } else {
                    setAiThinking(false);
                }
            }, 600);
        }
    }, [currentTurn, gameState, currentDice, aiThinking, isRolling, showReRollSelect, aiBoard, playerBoard, isCurrentDiceShielded, isFirstMove, aiReRollUsed]);

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
            background: 'radial-gradient(circle, #18221c 0%, #0a0e0c 100%)', // 에스더 마법 숲 딥 그린 다크 배경
            padding: '20px 2%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            userSelect: 'none', color: '#e2e8f0', position: 'relative', overflow: 'hidden'
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
                        background: '#38bdf8', // 파란 조각 파티클
                        borderRadius: '2px',
                        pointerEvents: 'none',
                        zIndex: 99,
                        boxShadow: '0 0 10px #0ea5e9',
                        transform: `translate(${p.vx * 3.5}px, ${p.vy * 3.5}px)`,
                        transition: 'transform 0.85s cubic-bezier(0.1, 0.85, 0.35, 1), opacity 0.85s',
                        opacity: 0
                    }}
                />
            ))}

            {/* EXTRA TURN 배너 팝업 */}
            <AnimatePresence>
                {showExtraTurnBanner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -45 }}
                        animate={{ opacity: 1, scale: 1.15, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 11 }}
                        style={{
                            position: 'absolute',
                            top: '38%',
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                            background: 'linear-gradient(135deg, #d4af37 0%, #a27a18 100%)',
                            color: '#1a0d00',
                            padding: '22px 55px',
                            borderRadius: '24px',
                            border: '3px solid #ffdf7a',
                            boxShadow: '0 15px 45px rgba(212, 175, 55, 0.7), 0 0 65px rgba(212, 175, 55, 0.45)',
                            zIndex: 100,
                            textAlign: 'center',
                            pointerEvents: 'none'
                        }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#4a2f02' }}>
                            {extraTurnOwner === 'player' ? '⚡ 전장의 결단 ⚡' : '🔮 AI 전술 개입 🔮'}
                        </div>
                        <div style={{ fontSize: '1.9rem', fontWeight: 950, marginTop: '3px', textShadow: '0 1px 2px rgba(255,255,255,0.35)' }}>
                            {extraTurnOwner === 'player' ? '추가 턴 획득!' : 'AI 추가 턴 획득!'}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, marginTop: '6px', color: '#2a1a00' }}>
                            상대 주사위를 폭파해 **보호막(Shield) 주사위** 장전 완료!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <audio ref={bgmRef} loop src="https://assets.mixkit.co/music/preview/mixkit-retro-arcade-casino-key-515.mp3" />

            {/* Header */}
            <div style={{ width: '100%', maxWidth: '1180px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 10 }}>
                <button onClick={() => { if (bgmRef.current) bgmRef.current.pause(); onBack(); }} title="대시보드로 돌아갑니다" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', fontWeight: 800, background: 'rgba(23,28,25,0.9)', padding: '10px 20px', borderRadius: '15px', border: '1.5px solid #d4af37', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.2s' }}>
                    <ArrowLeft size={20} /> 로비로
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', textShadow: '0 0 10px rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    ⚔️ 에스더 주사위 배틀 (티카투카)
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => { setIsMuted(!isMuted); if (bgmRef.current) isMuted ? bgmRef.current.play() : bgmRef.current.pause(); }} title={isMuted ? "배경음악 켜기" : "배경음악 끄기"} style={{ background: 'rgba(23,28,25,0.9)', padding: '12px', borderRadius: '50%', border: '1.5px solid #d4af37', cursor: 'pointer', color: '#d4af37', boxShadow: '0 4px 6px rgba(0,0,0,0.4)' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(23,28,25,0.9)', padding: '10px 20px', borderRadius: '100px', border: '1.5px solid #d4af37', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                        <Gem size={20} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fbbf24' }}>{crystals}</span>
                    </div>
                </div>
            </div>

            <div style={{
                width: '100%', maxWidth: '1180px', display: 'grid',
                gridTemplateColumns: window.innerWidth <= 1024 ? '1fr' : '1fr 340px', gap: '30px', zIndex: 10
            }}>
                {/* 메인 게임판 (나무 질감과 황금 몰딩) */}
                <div style={{
                    background: 'radial-gradient(circle, #2e1e18 0%, #170f0b 100%)',
                    border: '4px solid #b8860b',
                    boxShadow: '0 25px 55px rgba(0,0,0,0.8), inset 0 0 25px rgba(0,0,0,0.7)',
                    borderRadius: '35px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    position: 'relative'
                }}>
                    {/* 상단 깃발 정보 */}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.15)', padding: '8px 16px', borderRadius: '14px', border: '1px solid #d4af37' }}>
                            <Sparkles size={16} color="#fbbf24" />
                            <span style={{ fontWeight: 900, color: '#fbbf24', fontSize: '0.95rem' }}>현재 {winStreak}연승 유지 중</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 800 }}>
                            <AlertTriangle size={14} /> 보호막 주사위(실드)는 파괴되지 않으며 상대 보드에도 심을 수 있습니다.
                        </div>
                        <div style={{ fontWeight: 800, color: currentTurn === 'player' ? '#10b981' : '#a78bfa', fontSize: '0.95rem' }}>
                            {currentTurn === 'player' ? '🟢 내 턴 (주사위를 굴리세요)' : '🟣 AI 행동 설계 중...'}
                        </div>
                    </div>

                    {/* 대칭 대결 플레이 필드 (가로 행(Row) 기반 대치 구조) */}
                    <div style={{
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '24px', 
                        padding: '10px 0',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {[0, 1, 2].map((idx) => {
                            const canPlacePlayer = currentTurn === 'player' && currentDice !== null && !isRolling && !showReRollSelect && playerBoard[idx].length < 3;
                            const canPlaceAIIntrude = currentTurn === 'player' && currentDice !== null && !isRolling && !showReRollSelect && isCurrentDiceShielded && !isFirstMove && aiBoard[idx].length < 3;

                            return (
                                <div 
                                    key={idx} 
                                    style={{ 
                                        width: '100%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        background: 'rgba(0,0,0,0.25)',
                                        padding: '15px 25px',
                                        borderRadius: '20px',
                                        border: '1.5px solid #4a3325',
                                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {/* 왼쪽: 플레이어 보드 라인 */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '48px', textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '1.1rem' }}>
                                            {getColScore(playerBoard[idx])}점
                                        </div>
                                        <div 
                                            id={`player-line-${idx}`}
                                            onClick={() => canPlacePlayer && placeDiceOnBoard(idx, 'player')}
                                            style={{
                                                width: '240px', height: '70px',
                                                background: canPlacePlayer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.45)',
                                                borderRadius: '16px',
                                                border: canPlacePlayer ? '2px dashed #10b981' : '1.5px solid #3d261b',
                                                padding: '6px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: canPlacePlayer ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
                                            }}
                                        >
                                            <AnimatePresence>
                                                {playerBoard[idx].map((item) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ scale: 0.1, x: -100, rotate: -45 }}
                                                        animate={{ scale: 1, x: 0, rotate: 0 }}
                                                        exit={{ 
                                                            scale: 0.3, 
                                                            y: (Math.random() - 0.5) * 150, 
                                                            x: -250, 
                                                            rotate: -360, 
                                                            opacity: 0 
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 220, damping: 13 }}
                                                        style={{ width: '48px', height: '48px' }}
                                                    >
                                                        <DiceDot value={item.val} isShielded={item.isShielded} />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* 중앙: 대치 점령 지표 깃발 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#8e7a63', fontWeight: 800 }}>LINE {idx + 1}</span>
                                        <span style={{ 
                                            fontSize: '1.4rem', 
                                            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))',
                                            transform: 'scale(1.1)'
                                        }}>
                                            {getLineWinnerSymbol(idx)}
                                        </span>
                                    </div>

                                    {/* 오른쪽: 상대 AI 보드 라인 */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div 
                                            id={`ai-line-${idx}`}
                                            onClick={() => canPlaceAIIntrude && placeDiceOnBoard(idx, 'ai')}
                                            style={{
                                                width: '240px', height: '70px',
                                                background: canPlaceAIIntrude ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0,0,0,0.45)',
                                                borderRadius: '16px',
                                                border: canPlaceAIIntrude ? '2px dashed #0284c7' : '1.5px solid #3d261b',
                                                padding: '6px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'row-reverse',
                                                gap: '10px',
                                                cursor: canPlaceAIIntrude ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
                                            }}
                                        >
                                            <AnimatePresence>
                                                {aiBoard[idx].map((item) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ scale: 0.1, x: 100, rotate: 45 }}
                                                        animate={{ scale: 1, x: 0, rotate: 0 }}
                                                        exit={{ 
                                                            scale: 0.3, 
                                                            y: (Math.random() - 0.5) * 150, 
                                                            x: 250, 
                                                            rotate: 360, 
                                                            opacity: 0 
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 220, damping: 13 }}
                                                        style={{ width: '48px', height: '48px' }}
                                                    >
                                                        <DiceDot value={item.val} isShielded={item.isShielded} />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                        <div style={{ width: '48px', textAlign: 'left', fontWeight: 900, color: '#a78bfa', fontSize: '1.1rem' }}>
                                            {getColScore(aiBoard[idx])}점
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 하단 통합 주사위 대시 컨트롤러 */}
                    <div style={{ 
                        marginTop: '25px', width: '100%', display: 'flex', 
                        justifyContent: 'center', gap: '30px', alignItems: 'center',
                        background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '24px',
                        border: '1.5px solid #4a3325', position: 'relative'
                    }}>
                        {/* 굴려진 주사위 디스플레이 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24' }}>
                                {isCurrentDiceShielded ? '🛡️ 보호막 주사위 장전' : '🎲 일반 주사위 장전'}
                            </span>
                            <div style={{ width: '70px', height: '70px', position: 'relative' }}>
                                {currentDice !== null ? (
                                    <motion.div 
                                        animate={isRolling ? { rotate: 360, scale: [1, 1.15, 1] } : { scale: 1.1 }} 
                                        transition={isRolling ? { repeat: Infinity, duration: 0.3, ease: 'linear' } : { type: 'spring', stiffness: 300, damping: 10 }} 
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <DiceDot value={currentDice} isShielded={isCurrentDiceShielded} />
                                    </motion.div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', border: '2.5px dashed #8e7a63', borderRadius: '14px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e7a63', fontSize: '1.4rem', fontWeight: 900 }}>
                                        ?
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 리롤 2지선다 팝업 UI (세이프가드 강화) */}
                        {showReRollSelect && currentTurn === 'player' && currentDice !== null && reRolledDice !== null && (
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '24px',
                                background: 'radial-gradient(circle, #2d1a12 0%, #150d0a 100%)',
                                border: '2px solid #fbbf24', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '25px', zIndex: 15
                            }}>
                                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.85rem' }}>배치할 주사위 선택:</span>
                                <button 
                                    onClick={() => handleSelectDiceOption(currentDice)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid #8e7a63', borderRadius: '14px', width: '56px', height: '56px', padding: '0', cursor: 'pointer' }}
                                >
                                    <DiceDot value={currentDice} isShielded={isCurrentDiceShielded} />
                                </button>
                                <span style={{ fontWeight: 900, color: '#d4af37' }}>VS</span>
                                <button 
                                    onClick={() => handleSelectDiceOption(reRolledDice)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid #fbbf24', borderRadius: '14px', width: '56px', height: '56px', padding: '0', cursor: 'pointer', boxShadow: '0 0 10px rgba(251,191,36,0.3)' }}
                                >
                                    <DiceDot value={reRolledDice} isShielded={isCurrentDiceShielded} />
                                </button>
                            </div>
                        )}

                        {/* 조작 버튼 영역 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {currentTurn === 'player' ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={rollDice}
                                        disabled={currentDice !== null || isRolling || showReRollSelect}
                                        style={{
                                            padding: '12px 24px', background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                                            border: 'none', color: '#1a0d00', fontWeight: 900, borderRadius: '12px', fontSize: '0.88rem',
                                            cursor: (currentDice !== null || isRolling) ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 6px 15px rgba(212, 175, 55, 0.35)', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <RefreshCw size={15} className={isRolling ? 'animate-spin' : ''} /> 주사위 굴리기
                                    </button>
                                    <button
                                        onClick={triggerReRoll}
                                        disabled={playerReRollUsed || currentDice === null || isRolling || isReRolling}
                                        style={{
                                            padding: '12px 20px', 
                                            background: playerReRollUsed ? 'rgba(0,0,0,0.3)' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                            border: playerReRollUsed ? '1.5px solid #4a3325' : 'none', 
                                            color: playerReRollUsed ? '#64748b' : 'white', 
                                            fontWeight: 900, borderRadius: '12px', fontSize: '0.88rem',
                                            cursor: (playerReRollUsed || currentDice === null || isRolling) ? 'not-allowed' : 'pointer',
                                            boxShadow: playerReRollUsed ? 'none' : '0 6px 15px rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        다시 굴리기 (1회)
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '12px 35px', background: 'rgba(0,0,0,0.5)', border: '1.5px solid #8b5cf6', color: '#a78bfa', fontWeight: 800, borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center' }}>
                                    {aiThinking ? '🤖 AI가 전술 계산 중...' : '🤖 상대가 행동 준비 중...'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 대기화면 */}
                    {gameState === 'ready' && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '35px', background: 'radial-gradient(circle, #251812 0%, #0d0705 100%)', border: '4px solid #b8860b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
                            <div style={{ fontSize: '4.5rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>⚔️</div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>에스더 주사위 배틀</h3>
                            <p style={{ color: '#d8c5b0', fontSize: '0.85rem', fontWeight: 600, maxWidth: '440px', lineHeight: 1.55, textAlign: 'center', marginBottom: '30px' }}>
                                **로스트아크 티카투카 미니게임 공식 룰 완벽 적용!**<br/>
                                1. **동귀어진 파괴**: 알까기 성공 시 내 주사위와 상대 주사위가 둘 다 소멸합니다.<br/>
                                2. **보호막(Shield) 주사위**: 첫 턴 및 추가 턴의 주사위는 보호막이 적용되어 상대에게 파괴되지 않으며, 내 보드 및 상대방 보드 빈칸에 강제 침투시킬 수 있습니다.<br/>
                                3. **리롤 찬스**: 판당 1번 리롤하여 원래 눈과 새로운 눈 중 원하는 것을 고를 수 있습니다.<br/>
                                4. **승리 조건**: 3개 가로 라인 중 2개 이상을 선점하는 측이 승리합니다!
                            </p>
                            <button onClick={startGame} title="대결을 시작합니다" style={{ padding: '14px 45px', background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)', color: '#1a0d00', fontWeight: 900, borderRadius: '15px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(212, 175, 55, 0.45)', border: '1px solid #ffdf7a' }}>
                                전장 진입
                            </button>
                        </div>
                    )}

                    {/* Game finished modal */}
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
                                    (최종 점수: {getBoardTotalScore(playerBoard)}점 vs {getBoardTotalScore(aiBoard)}점)
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
                                }} title="전체 연승 랭킹을 확인하러 이동합니다" style={{ width: '100%', padding: '12px 20px', background: 'rgba(0,0,0,0.4)', border: '1px solid #d4af37', color: '#fbbf24', fontWeight: 800, borderRadius: '15px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(168, 85, 247, 0.05)' }}>
                                    <Trophy size={16} color="#fbbf24" fill="#fbbf24" /> 전체 연승 랭킹 보기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 사이드바 */}
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
                        <h4 style={{ fontWeight: 900, fontSize: '0.95rem', color: '#fbbf24', marginBottom: '12px' }}>📜 에스더 룰북 (가로형)</h4>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#d8c5b0', fontWeight: 600, lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>**동일 눈금 콤보**: 동일한 주사위를 한 라인에 나란히 놓으면 점수 배수가 중첩됩니다. (1개 1배, 2개 4배, 3개 9배)</li>
                            <li>**동귀어진(파괴)**: 내 주사위가 상대 눈금을 파괴하면, 상대 주사위뿐만 아니라 내 주사위도 보드에 깔리지 않고 소멸(동귀어진)합니다.</li>
                            <li>**실드 주사위 (하늘색)**: 최초 시작 및 추가 턴의 주사위는 보호막이 적용되어 상대에게 파괴되지 않으며, 내 보드 및 상대방 보드 빈칸에 강제 침투시킬 수 있습니다.</li>
                            <li>**추가 턴 (Extra Turn)**: 상대방 주사위 파괴 시 보너스 턴을 받지만, 추가 턴 상태에서는 다시 추가 턴을 얻을 수 없습니다(밸런싱).</li>
                            <li>**리롤 (1회)**: 주사위를 다시 던져 원래 주사위와 다시 굴린 주사위 중 하나를 선택할 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TikatukaGamePage;
