import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Gem, Volume2, VolumeX, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// 앤틱 스톤 질감의 6면체 주사위 눈 디자인 컴포넌트 (보호막 이펙트 탑재)
const MiniDice = ({ value, color = '#10b981' }) => {
    const dotPositions = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom-right'],
    };

    const dots = dotPositions[value] || [];
    const isPlayerColor = color === '#10b981';

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            margin: '0 -2px',
            zIndex: 10
        }}>
            <span style={{ width: '8px', borderTop: `2px dashed ${color}`, opacity: 0.8 }} />
            <div style={{
                width: '26px',
                height: '26px',
                position: 'relative',
                background: isPlayerColor
                    ? 'radial-gradient(circle, #ffffff 0%, #f0fdf4 100%)'
                    : 'radial-gradient(circle, #ffffff 0%, #fff5f5 100%)',
                borderRadius: '6px',
                boxShadow: `0 0 8px ${color}80, inset 0 1px 2px rgba(255,255,255,1)`,
                border: `1.8px dashed ${color}`,
                boxSizing: 'border-box',
                padding: '2px'
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
                                width: '3.5px',
                                height: '3.5px',
                                background: color,
                                borderRadius: '50%',
                                ...getStyle()
                            }}
                        />
                    );
                })}
            </div>
            <span style={{ width: '8px', borderTop: `2px dashed ${color}`, opacity: 0.8 }} />
        </div>
    );
};

const DiceDot = ({ value, isShielded, isComboActive, isPlayer }) => {
    const dotPositions = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom-right'],
    };

    const dots = dotPositions[value] || [];

    // 플레이어/AI 주사위 색상 정보 분기 정의
    let bgStyle = '';
    let borderColor = '';
    let shadowStyle = '';
    let dotColor = '';

    if (isShielded) {
        // 신성한 황금 보호막 주사위 테마 (초록색/분홍색 보드 위에서 눈에 띄도록 황금색으로 단일화)
        bgStyle = 'radial-gradient(circle, #fffbeb 0%, #fef08a 100%)';
        borderColor = '#eab308';
        shadowStyle = '0 0 18px rgba(234, 179, 8, 0.85), inset 0 3px 6px rgba(255,255,255,0.95)';
        dotColor = isPlayer ? '#047857' : '#be123c'; // 눈금 색상으로 소유자 판별
    } else {
        if (isPlayer) {
            // 플레이어 주사위 (초록/민트 젤리 테마)
            bgStyle = 'radial-gradient(circle, #ffffff 0%, #f0fdf4 100%)';
            borderColor = isComboActive ? '#10b981' : '#a7f3d0';
            shadowStyle = isComboActive
                ? '0 0 15px rgba(16, 185, 129, 0.6), inset 0 3px 6px rgba(255,255,255,0.9)'
                : 'inset 0 3px 6px rgba(255,255,255,1), 0 4px 10px rgba(16, 185, 129, 0.1)';
            dotColor = '#10b981';
        } else {
            // AI 주사위 (빨강/살구 젤리 테마)
            bgStyle = 'radial-gradient(circle, #ffffff 0%, #fff5f5 100%)';
            borderColor = isComboActive ? '#f43f5e' : '#fecdd3';
            shadowStyle = isComboActive
                ? '0 0 15px rgba(244, 63, 94, 0.6), inset 0 3px 6px rgba(255,255,255,0.9)'
                : 'inset 0 3px 6px rgba(255,255,255,1), 0 4px 10px rgba(244, 63, 94, 0.1)';
            dotColor = '#ef4444';
        }
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: bgStyle,
            borderRadius: '14px',
            boxShadow: shadowStyle,
            border: `2.5px solid ${borderColor}`,
            boxSizing: 'border-box',
            padding: '8px',
            transition: 'all 0.3s'
        }}>
            {isShielded && (
                <div style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '18px',
                    border: '1.5px solid rgba(234, 179, 8, 0.7)',
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
                            width: '7.5px',
                            height: '7.5px',
                            background: dotColor,
                            borderRadius: '50%',
                            boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.15)',
                            ...getStyle()
                        }}
                    />
                );
            })}
        </div>
    );
};

const OPPONENTS = {
    1: { name: '호기심 가득 루미', emoji: '🐰', difficulty: 'easy', desc: '루미니의 마스코트 토끼 루미! 주사위를 던지는 법을 막 배웠어요.' },
    2: { name: '잠꾸러기 곰 코지', emoji: '🐻', difficulty: 'normal', desc: '푹신한 곰인형 코지! 느긋하지만 은근히 높은 주사위 눈을 잘 골라요.' },
    3: { name: '장난꾸러기 여우 치코', emoji: '🦊', difficulty: 'hard', desc: '꾀가 많은 여우 치코! 내 소중한 주사위를 호시탐탐 파괴하려 노려봅니다.' },
    4: { name: '아기 드래곤 슈슈', emoji: '🐉', difficulty: 'expert', desc: '영리한 미니 드래곤 슈슈! 마법 같은 지능으로 완벽한 침투 전술을 씁니다.' },
    5: { name: '정령의 왕 루미엘', emoji: '🦄', difficulty: 'master', desc: '루미니 아케이드의 전설적인 정령왕 루미엘! 한 치의 오차도 없는 강력함을 자랑합니다.' }
};

const getOpponentInfo = (stageNum) => {
    return OPPONENTS[stageNum] || { name: `심연의 군주 (Lv.${stageNum})`, emoji: '😈', difficulty: 'master', desc: '도전을 불허하는 강력한 적입니다.' };
};

const canPlaceAnywhere = (board, oppBoard, diceVal, isShielded, isFirstMove) => {
    if (diceVal === null) return false;
    
    // 1. 내 보드에 들어갈 자리가 있는지 확인
    for (let i = 0; i < 3; i++) {
        if (board[i].length < 3) return true;
    }
    
    // 2. 보호막(실드) 주사위인 경우, 첫 턴이 아니고 상대 보드에 침투할 빈 자리가 있다면 가능
    if (isShielded && !isFirstMove) {
        for (let i = 0; i < 3; i++) {
            if (oppBoard[i].length < 3) return true;
        }
    }
    
    return false;
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
        // 동일 눈금 콤보 공식: 1개->1배, 2개->3배, 3개->5배
        if (count === 2) {
            sum += val * 3;
        } else if (count === 3) {
            sum += val * 5;
        } else {
            sum += val;
        }
    });
    return sum;
};

// 보드 전체 점수 합산
const getBoardTotalScore = (board) => {
    return board.reduce((acc, col) => acc + getColScore(col), 0);
};

// AI 최적 수 탐색 알고리즘 (리팩토링: 실드 주사위 침투 가치 계산 포함)
const evaluateMove = (col, diceVal, playerBoard, opponentBoard, isShieldPlacement, isCurrentDiceShielded, difficulty = 'normal') => {
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

    // 2. 상대방 주사위 파괴 가치 계산 (현재 주사위가 보호막이 아니고, 상대방 주사위가 보호막이 아닐 때만 파괴 가능)
    const oppCol = opponentBoard[col];
    const destructibleCount = (!isCurrentDiceShielded)
        ? oppCol.filter(item => item.val === diceVal && !item.isShielded).length
        : 0;
    
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
    let destWeight = 1.65;
    let extraWeight = 12;
    let spacePen = -2.5;

    if (difficulty === 'easy') {
        destWeight = 0.8;
        extraWeight = 5;
        spacePen = -4.0;
    } else if (difficulty === 'hard') {
        destWeight = 2.4;
        extraWeight = 16;
        spacePen = -1.2;
    } else if (difficulty === 'expert' || difficulty === 'master') {
        destWeight = 2.0;
        extraWeight = 14;
        spacePen = -2.0;
    }

    return scoreGain + (destructionValue * destWeight) + extraWeight + spacePen;
};

const TikatukaGamePage = ({ onBack }) => {
    const { crystals, earnCrystals } = useCrystalStore();
    const { user } = useAuthStore();
    const { userName } = useUserStore();
    const userId = user?.id || 'guest';
    const streakKey = `tikatuka_best_win_streak_${userId}`;

    // 상태 관리
    const [gameState, setGameState] = useState('ready'); // ready, playing, finished
    const [stage, setStage] = useState(1);
    const opponentInfo = getOpponentInfo(stage);
    const [winStreak, setWinStreak] = useState(0);
    const [bestWinStreak, setBestWinStreak] = useState(() => parseInt(localStorage.getItem(streakKey) || '0'));
    const [currentTurn, setCurrentTurn] = useState('player'); // player, ai
    const [playerBoard, setPlayerBoard] = useState([[], [], []]); // [{id, val, isShielded}][] (가로 행 3라인)
    const [aiBoard, setAiBoard] = useState([[], [], []]);
    const [showPassBanner, setShowPassBanner] = useState(false);
    
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

    // 게임 포기 및 이탈 처리 (랭킹 연승 리셋 및 판수 누적)
    const handleAbandonGame = () => {
        if (bgmRef.current) bgmRef.current.pause();
        
        if (gameState === 'playing') {
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
                                .eq('user_id', user.id)
                                .then(() => fetchLeaderboard());
                        }
                    });
            }
        }
        onBack();
    };

    // 게임 시작 (resetStage 파라미터 적용)
    const startGame = (resetStage = false) => {
        if (resetStage) {
            setStage(1);
            setWinStreak(0);
        }
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
        
        // 선턴 랜덤 결정 (플레이어 또는 AI)
        const firstTurn = Math.random() < 0.5 ? 'player' : 'ai';
        setCurrentTurn(firstTurn);
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
        
        // 상대 라인에서 '보호막이 없는' 일치 주사위가 존재하는지 확인 (현재 배치하는 주사위가 보호막 주사위인 경우 파괴 격발 배제)
        const matchExists = !isCurrentDiceShielded && oppLine.some(item => item.val === targetVal && !item.isShielded);

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

    // 게임 종료 및 최종 라인 3판 2선승 판정 (양쪽 보드 완결형)
    const checkGameStatus = (pBoard, aBoard, nextPlayer) => {
        const isPlayerFull = pBoard.every(col => col.length >= 3);
        const isAiFull = aBoard.every(col => col.length >= 3);

        if (isPlayerFull && isAiFull) {
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
            // 아직 게임이 끝나지 않은 경우
            // 다음 차례 플레이어가 턴에서 주사위를 둘 수 있는 공간이 있는지 감지 (보통 일반 턴이 시작되므로 자기 보드 꽉 찼으면 불가능)
            const nextBoard = nextPlayer === 'player' ? pBoard : aBoard;
            const oppBoard = nextPlayer === 'player' ? aBoard : pBoard;
            const isNextBoardFull = nextBoard.every(col => col.length >= 3);
            
            // 만약 보호막(실드) 주사위 상태(추가 턴 격발 시)이고 상대 보드에 빈칸이 있으면 침투 가능하므로 스킵하지 않음
            const hasIntrudeSpace = isCurrentDiceShielded && oppBoard.some(col => col.length < 3);

            if (isNextBoardFull && !hasIntrudeSpace) {
                // 둘 공간이 절대 없으므로 턴을 스킵하고 상대방이 연속으로 턴을 진행함
                const finalNextPlayer = nextPlayer === 'player' ? 'ai' : 'player';
                setCurrentTurn(finalNextPlayer);
            } else {
                setCurrentTurn(nextPlayer);
            }
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
                            const val = evaluateMove(c, aiDiceVal, aiBoard, playerBoard, false, isCurrentDiceShielded, opponentInfo.difficulty);
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
                                    const val = evaluateMove(c, aiReRollVal, aiBoard, playerBoard, false, isCurrentDiceShielded, opponentInfo.difficulty);
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
                    const val = evaluateMove(c, diceVal, aiBoard, playerBoard, false, isCurrentDiceShielded, opponentInfo.difficulty);
                    if (val > maxVal) {
                        maxVal = val;
                        bestCol = c;
                        shouldPlaceOpponent = false;
                    }
                }

                // 상대 보드 침투 배치 가치 분석
                if (canIntrude) {
                    for (let c = 0; c < 3; c++) {
                        const val = evaluateMove(c, diceVal, aiBoard, playerBoard, true, isCurrentDiceShielded, opponentInfo.difficulty);
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
    }, [currentTurn, gameState, currentDice, aiThinking, isRolling, showReRollSelect, aiBoard, playerBoard, isCurrentDiceShielded, isFirstMove, aiReRollUsed, opponentInfo.difficulty]);

    // 주사위 배치 확정 시 패스 조건 체크 (둘 곳이 없을 때 알림 배너 띄우고 1.5초 후 강제 턴 양도)
    useEffect(() => {
        if (gameState !== 'playing' || isRolling || isReRolling || showReRollSelect || currentDice === null) return;

        const board = currentTurn === 'player' ? playerBoard : aiBoard;
        const oppBoard = currentTurn === 'player' ? aiBoard : playerBoard;

        const possible = canPlaceAnywhere(board, oppBoard, currentDice, isCurrentDiceShielded, isFirstMove);
        if (!possible) {
            // 플레이어 턴이고 리롤 찬스가 남아있다면, 리롤 기회를 먼저 사용할 수 있게 자동 패스를 유예함
            if (currentTurn === 'player' && !playerReRollUsed) {
                return;
            }

            // 둘 곳이 아예 없는 확정 패스 상태
            setShowPassBanner(true);
            const passSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-947.mp3');
            passSfx.volume = 0.15;
            if (!isMuted) passSfx.play().catch(() => {});

            setTimeout(() => {
                setShowPassBanner(false);
                setCurrentDice(null);
                
                // 턴을 상대방에게 패스하고 상태 갱신
                const nextTurn = currentTurn === 'player' ? 'ai' : 'player';
                checkGameStatus(playerBoard, aiBoard, nextTurn);
            }, 1800);
        }
    }, [currentDice, isRolling, isReRolling, showReRollSelect, currentTurn, playerBoard, aiBoard, isCurrentDiceShielded, isFirstMove, playerReRollUsed, gameState, isMuted]);

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
            background: 'radial-gradient(circle, #fff5f6 0%, #f0f4ff 100%)', // 루미니 핑크 라벤더 파스텔 배경
            padding: '20px 2%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            userSelect: 'none', color: '#334155', position: 'relative', overflow: 'hidden'
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
            {/* PASS 턴 패스 배너 팝업 */}
            <AnimatePresence>
                {showPassBanner && (
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
                            background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
                            color: '#ffffff',
                            padding: '22px 55px',
                            borderRadius: '24px',
                            border: '3px solid #fca55d',
                            boxShadow: '0 15px 45px rgba(239, 68, 68, 0.5), 0 0 65px rgba(239, 68, 68, 0.3)',
                            zIndex: 100,
                            textAlign: 'center',
                            pointerEvents: 'none'
                        }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#ffd6cc' }}>
                            ⚠️ 전술적 한계 ⚠️
                        </div>
                        <div style={{ fontSize: '1.9rem', fontWeight: 950, marginTop: '3px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            턴 패스 (Pass)
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, marginTop: '6px', color: '#ffebe6' }}>
                            더 이상 주사위를 배치할 공간이 없습니다!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <audio ref={bgmRef} loop src="https://assets.mixkit.co/music/preview/mixkit-retro-arcade-casino-key-515.mp3" />

            {/* Header */}
            <div style={{ width: '100%', maxWidth: '1180px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 10 }}>
                <button onClick={handleAbandonGame} title="대시보드로 돌아갑니다" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: 800, background: '#ffffff', padding: '10px 20px', borderRadius: '15px', border: '1.5px solid #fecdd3', cursor: 'pointer', boxShadow: '0 4px 12px rgba(244,63,94,0.1)', transition: 'all 0.2s' }}>
                    <ArrowLeft size={20} /> 로비로
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f43f5e', textShadow: '0 0 10px rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    ⚔️ 에스더 주사위 배틀 (Stage {stage})
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => { setIsMuted(!isMuted); if (bgmRef.current) isMuted ? bgmRef.current.play() : bgmRef.current.pause(); }} title={isMuted ? "배경음악 켜기" : "배경음악 끄기"} style={{ background: '#ffffff', padding: '12px', borderRadius: '50%', border: '1.5px solid #fecdd3', cursor: 'pointer', color: '#f43f5e', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '10px 20px', borderRadius: '100px', border: '1.5px solid #fecdd3', boxShadow: '0 4px 12px rgba(244,63,94,0.1)' }}>
                        <Gem size={20} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f43f5e' }}>{crystals}</span>
                    </div>
                </div>
            </div>

            <div style={{
                width: '100%', maxWidth: '1180px', display: 'grid',
                gridTemplateColumns: window.innerWidth <= 1024 ? '1fr' : '1fr 340px', gap: '30px', zIndex: 10
            }}>
                {/* 메인 게임판 (나무 질감과 황금 몰딩) */}
                <div style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #fffbfe 100%)', // 부드러운 화이트 핑크 그라데이션
                    border: '5px solid #ffe4e6', // 더 도톰하고 뽀송한 핑크 테두리
                    boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.15), inset 0 0 30px rgba(244, 63, 94, 0.02)',
                    borderRadius: '35px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    position: 'relative',
                    maxWidth: '720px',
                    width: '100%'
                }}>
                    {/* 상단 깃발 정보 */}
                    <div style={{ 
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        marginBottom: '25px', 
                        background: '#fff5f6', 
                        padding: '16px 20px', 
                        borderRadius: '20px', 
                        border: '1.5px solid #ffe4e6' 
                    }}>
                        {/* 첫 번째 줄: 연승 상태 & 턴 진행 상태 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 14px', borderRadius: '12px', border: '1px solid #fecdd3', boxShadow: '0 2px 5px rgba(244,63,94,0.03)' }}>
                                <Sparkles size={16} color="#f43f5e" />
                                <span style={{ fontWeight: 900, color: '#e11d48', fontSize: '0.88rem' }}>현재 {winStreak}연승 유지 중</span>
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ color: '#ec4899' }}>{opponentInfo.emoji} {opponentInfo.name}</span>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <span style={{ color: currentTurn === 'player' ? '#10b981' : '#a855f7' }}>
                                    {currentTurn === 'player' ? '🟢 내 턴 (주사위를 굴리세요)' : '🟣 AI 행동 설계 중...'}
                                </span>
                            </div>
                        </div>
                        
                        {/* 두 번째 줄: 룰북 팁 메시지 */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '6px', 
                            color: '#e11d48', 
                            fontSize: '0.82rem', 
                            fontWeight: 800,
                            background: 'rgba(255, 255, 255, 0.6)',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <AlertTriangle size={13} color="#f43f5e" /> 
                            보호막 주사위(실드)는 파괴되지 않으며 상대 보드에도 심을 수 있습니다.
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
                                        background: 'linear-gradient(135deg, #ffffff 0%, #fffbfc 100%)', // 뽀얀 순수 화이트 핑크
                                        padding: '15px 25px',
                                        borderRadius: '20px',
                                        border: '2px solid #ffeef0', // 산뜻한 연핑크 테두리
                                        boxShadow: '0 10px 25px rgba(244, 63, 94, 0.05)'
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
                                            title={canPlacePlayer ? "클릭하여 주사위를 배치합니다" : "주사위를 배치할 수 없습니다"}
                                            style={{
                                                width: '285px', height: '70px',
                                                background: canPlacePlayer ? 'rgba(16, 185, 129, 0.12)' : 'rgba(240, 253, 244, 0.45)',
                                                borderRadius: '16px',
                                                border: canPlacePlayer ? '2.5px dashed #10b981' : '1.5px solid rgba(16, 185, 129, 0.15)',
                                                padding: '6px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: canPlacePlayer ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                boxShadow: 'inset 0 2px 6px rgba(16, 185, 129, 0.05)'
                                            }}
                                        >
                                            <AnimatePresence mode="popLayout">
                                                {(() => {
                                                    const counts = {};
                                                    playerBoard[idx].forEach(item => {
                                                        counts[item.val] = (counts[item.val] || 0) + 1;
                                                    });

                                                    const elements = [];
                                                    playerBoard[idx].forEach((item, itemIdx) => {
                                                        const isCombo = counts[item.val] >= 2;
                                                        
                                                        if (itemIdx > 0 && playerBoard[idx][itemIdx - 1].val === item.val) {
                                                            elements.push(
                                                                <div key={`link_${item.id}`} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                                    <MiniDice value={item.val} color="#10b981" />
                                                                </div>
                                                            );
                                                        }

                                                        elements.push(
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
                                                                style={{ 
                                                                    width: '48px', 
                                                                    height: '48px',
                                                                    borderRadius: '14px',
                                                                    boxShadow: item.isShielded 
                                                                        ? '0 0 18px rgba(234, 179, 8, 0.85)' 
                                                                        : isCombo 
                                                                            ? '0 0 15px rgba(16, 185, 129, 0.95), 0 0 5px rgba(16, 185, 129, 0.5)' 
                                                                            : 'none',
                                                                    transition: 'box-shadow 0.3s',
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <DiceDot value={item.val} isShielded={item.isShielded} isComboActive={isCombo} isPlayer={true} />
                                                            </motion.div>
                                                        );
                                                    });
                                                    return elements;
                                                })()}
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
                                            title={canPlaceAIIntrude ? "클릭하여 실드 주사위로 침투 배치합니다" : "침투 배치할 수 없습니다 (실드 주사위가 필요합니다)"}
                                            style={{
                                                width: '285px', height: '70px',
                                                background: canPlaceAIIntrude ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 241, 242, 0.45)',
                                                borderRadius: '16px',
                                                border: canPlaceAIIntrude ? '2.5px dashed #f43f5e' : '1.5px solid rgba(244, 63, 94, 0.15)',
                                                padding: '6px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'row-reverse',
                                                gap: '10px',
                                                cursor: canPlaceAIIntrude ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                boxShadow: 'inset 0 2px 6px rgba(244, 63, 94, 0.05)'
                                            }}
                                        >
                                            <AnimatePresence mode="popLayout">
                                                {(() => {
                                                    const counts = {};
                                                    aiBoard[idx].forEach(item => {
                                                        counts[item.val] = (counts[item.val] || 0) + 1;
                                                    });

                                                    const elements = [];
                                                    aiBoard[idx].forEach((item, itemIdx) => {
                                                        const isCombo = counts[item.val] >= 2;

                                                        if (itemIdx > 0 && aiBoard[idx][itemIdx - 1].val === item.val) {
                                                            elements.push(
                                                                <div key={`link_${item.id}`} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                                    <MiniDice value={item.val} color="#f97316" />
                                                                </div>
                                                            );
                                                        }

                                                        elements.push(
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
                                                                style={{ 
                                                                    width: '48px', 
                                                                    height: '48px',
                                                                    borderRadius: '14px',
                                                                    boxShadow: item.isShielded 
                                                                        ? '0 0 18px rgba(234, 179, 8, 0.85)' 
                                                                        : isCombo 
                                                                            ? '0 0 15px rgba(249, 115, 22, 0.95), 0 0 5px rgba(249, 115, 22, 0.5)' 
                                                                            : 'none',
                                                                    transition: 'box-shadow 0.3s',
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <DiceDot value={item.val} isShielded={item.isShielded} isComboActive={isCombo} isPlayer={false} />
                                                            </motion.div>
                                                        );
                                                    });
                                                    return elements;
                                                })()}
                                            </AnimatePresence>
                                        </div>
                                        <div style={{ width: '48px', textAlign: 'left', fontWeight: 900, color: '#a855f7', fontSize: '1.1rem' }}>
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
                        background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 100%)',
                        padding: '20px', borderRadius: '24px',
                        border: '2px solid #fff1f2', position: 'relative',
                        boxShadow: '0 10px 25px rgba(244, 63, 94, 0.04)'
                    }}>
                        {/* 굴려진 주사위 디스플레이 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48' }}>
                                {isCurrentDiceShielded ? '🛡️ 보호막 주사위 장전' : '🎲 일반 주사위 장전'}
                            </span>
                            <div style={{ width: '70px', height: '70px', position: 'relative' }}>
                                {currentDice !== null ? (
                                    <motion.div 
                                        animate={isRolling ? { rotate: 360, scale: [1, 1.15, 1] } : { scale: 1.1 }} 
                                        transition={isRolling ? { repeat: Infinity, duration: 0.3, ease: 'linear' } : { type: 'spring', stiffness: 300, damping: 10 }} 
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <DiceDot value={currentDice} isShielded={isCurrentDiceShielded} isComboActive={false} isPlayer={currentTurn === 'player'} />
                                    </motion.div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', border: '2.5px dashed #fecdd3', borderRadius: '14px', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca55d', fontSize: '1.4rem', fontWeight: 900 }}>
                                        ?
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 리롤 2지선다 팝업 UI (세이프가드 강화) */}
                        {showReRollSelect && currentTurn === 'player' && currentDice !== null && reRolledDice !== null && (
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '24px',
                                background: '#ffffff',
                                border: '2px solid #fecdd3', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '25px', zIndex: 15
                            }}>
                                <span style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.85rem' }}>배치할 주사위 선택:</span>
                                <button 
                                    onClick={() => handleSelectDiceOption(currentDice)}
                                    style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid #cbd5e1', borderRadius: '14px', width: '56px', height: '56px', padding: '0', cursor: 'pointer' }}
                                >
                                    <DiceDot value={currentDice} isShielded={isCurrentDiceShielded} isComboActive={false} isPlayer={true} />
                                </button>
                                <span style={{ fontWeight: 900, color: '#f43f5e' }}>VS</span>
                                <button 
                                    onClick={() => handleSelectDiceOption(reRolledDice)}
                                    style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid #fecdd3', borderRadius: '14px', width: '56px', height: '56px', padding: '0', cursor: 'pointer', boxShadow: '0 0 10px rgba(254,205,211,0.5)' }}
                                >
                                    <DiceDot value={reRolledDice} isShielded={isCurrentDiceShielded} isComboActive={false} isPlayer={true} />
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
                                            background: playerReRollUsed 
                                                ? '#e2e8f0' 
                                                : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                            border: playerReRollUsed ? '1.5px solid #cbd5e1' : 'none', 
                                            color: playerReRollUsed ? '#94a3b8' : 'white', 
                                            fontWeight: 900, borderRadius: '12px', fontSize: '0.88rem',
                                            cursor: (playerReRollUsed || currentDice === null || isRolling) ? 'not-allowed' : 'pointer',
                                            boxShadow: playerReRollUsed ? 'none' : '0 6px 15px rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        다시 굴리기 (1회)
                                    </button>
                                </div>
                            ) : (
                                <div style={{ 
                                    padding: '12px 35px', 
                                    background: 'rgba(168, 85, 247, 0.08)', 
                                    border: '2px dashed #c084fc', 
                                    color: '#7e22ce', 
                                    fontWeight: 900, 
                                    borderRadius: '12px', 
                                    fontSize: '0.9rem', 
                                    textAlign: 'center',
                                    boxShadow: 'inset 0 2px 4px rgba(168, 85, 247, 0.05)'
                                }}>
                                    {aiThinking ? '🤖 AI가 전술 계산 중...' : '🤖 상대가 행동 준비 중...'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 대기화면 */}
                    {gameState === 'ready' && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '35px', background: '#ffffff', border: '4.5px solid #fecdd3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
                            <div style={{ fontSize: '4.5rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 8px rgba(244,63,94,0.15))' }}>🐰</div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f43f5e', marginBottom: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>루미니 주사위 배틀</h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, maxWidth: '440px', lineHeight: 1.55, textAlign: 'center', marginBottom: '30px' }}>
                                **루미니 아케이드 공식 룰 완벽 적용!**<br/>
                                1. **동귀어진 파괴**: 일반 주사위로 알까기 성공 시 내 주사위와 상대 주사위가 둘 다 소멸합니다.<br/>
                                2. **보호막(Shield) 주사위**: 첫 턴 및 추가 턴의 주사위는 보호막이 적용되어 상대에게 파괴되지 않으며, 내 보드 및 상대방 보드 빈칸에 강제 침투시킬 수 있습니다. 단, **보호막 주사위는 상대방 주사위를 파괴(알까기)할 수 없습니다.**<br/>
                                3. **리롤 찬스**: 판당 1번 리롤하여 원래 눈과 새로운 눈 중 원하는 것을 고를 수 있습니다.<br/>
                                4. **종료 및 승리 조건**: 양쪽 보드가 모두 채워지면 각 라인의 점수를 겨뤄 3개 라인 중 2개 이상 선점한 측이 최종 승리합니다.
                            </p>
                            <button onClick={() => startGame(true)} title="대결을 시작합니다" style={{ padding: '14px 45px', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', color: '#ffffff', fontWeight: 900, borderRadius: '15px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)', border: '1px solid #fda4af' }}>
                                전장 진입
                            </button>
                        </div>
                    )}

                    {/* Game finished modal */}
                    {gameState === 'finished' && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '35px', background: '#ffffff', border: '4.5px solid #fecdd3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
                            <div style={{ fontSize: '5rem', marginBottom: '15px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' }}>
                                {gameResult === 'win' ? '🏆' : gameResult === 'lose' ? '😭' : '🤝'}
                            </div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: gameResult === 'win' ? '#f43f5e' : '#64748b', marginBottom: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {gameResult === 'win' ? '승리했어요!' : gameResult === 'lose' ? '아쉽게 패배...' : '무승부'}
                            </h3>
                            
                            {/* 라인 및 총점 결과 상세 표시 */}
                            <div style={{ background: '#f8fafc', padding: '15px 30px', borderRadius: '18px', border: '1.5px solid #e2e8f0', marginBottom: '30px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                                    점령 전적: <span style={{ color: '#10b981' }}>{gameRoundResult.playerWins}라인</span> 대 <span style={{ color: '#a855f7' }}>{gameRoundResult.aiWins}라인</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    (최종 점수: {getBoardTotalScore(playerBoard)}점 vs {getBoardTotalScore(aiBoard)}점)
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={handleAbandonGame} title="대시보드로 돌아갑니다" style={{ flex: 1, padding: '12px 20px', borderRadius: '15px', fontWeight: 800, background: '#ffffff', color: '#64748b', border: '1.5px solid #cbd5e1', cursor: 'pointer', fontSize: '0.9rem' }}>로비로</button>
                                    {gameResult === 'win' ? (
                                        <button onClick={() => { setStage(prev => prev + 1); startGame(false); }} title="다음 단계 에스더에게 도전합니다" style={{ flex: 1.2, padding: '12px 20px', borderRadius: '15px', fontWeight: 900, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)', fontSize: '0.95rem' }}>다음 단계</button>
                                    ) : (
                                        <button onClick={() => startGame(true)} title="1단계부터 다시 도전을 시작합니다" style={{ flex: 1.2, padding: '12px 20px', borderRadius: '15px', fontWeight: 900, background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.35)', fontSize: '0.95rem' }}>다시 도전</button>
                                    )}
                                </div>
                                <button onClick={() => {
                                    useUserStore.getState().setActiveRankingTab('tikatuka');
                                    window.dispatchEvent(new CustomEvent('changeStep', { detail: 'ranking' }));
                                }} title="전체 연승 랭킹을 확인하러 이동합니다" style={{ width: '100%', padding: '12px 20px', background: '#ffffff', border: '1px solid #fecdd3', color: '#f43f5e', fontWeight: 800, borderRadius: '15px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(244, 63, 94, 0.05)' }}>
                                    <Trophy size={16} color="#f43f5e" fill="#f43f5e" /> 전체 연승 랭킹 보기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 사이드바 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        background: '#ffffff', borderRadius: '30px', padding: '25px',
                        border: '2.5px solid #fecdd3', boxShadow: '0 10px 30px rgba(244, 63, 94, 0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Trophy size={22} color="#f43f5e" fill="#f43f5e" />
                            <h3 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#f43f5e' }}>최고 연승 리더보드</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {leaderboard.length > 0 ? (
                                leaderboard.map((item, i) => {
                                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                                    const badge = medals[i] || `${i + 1}위`;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', padding: '12px 14px',
                                            background: item.username === userName ? '#ffe4e6' : '#f8fafc',
                                            border: item.username === userName ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                                            borderRadius: '14px', alignItems: 'center',
                                            color: '#334155'
                                        }}>
                                            <span style={{ fontWeight: 800, color: '#475569', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.1rem' }}>{badge}</span>
                                                <span>{item.username}</span>
                                            </span>
                                            <span style={{ fontWeight: 900, color: '#f43f5e', fontSize: '0.9rem' }}>{item.win_streak}연승</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#fda4af', fontSize: '0.8rem', fontWeight: 600 }}>
                                    첫 왕관을 차지하세요! 👑
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 플레이 조작 도움 가이드 */}
                    <div style={{
                        background: '#ffffff', borderRadius: '30px', padding: '25px',
                        border: '2.5px solid #fecdd3', boxShadow: '0 10px 30px rgba(244, 63, 94, 0.05)'
                    }}>
                        <h4 style={{ fontWeight: 900, fontSize: '0.95rem', color: '#f43f5e', marginBottom: '12px' }}>📜 루미니 룰북 (가로형)</h4>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>**동일 눈금 콤보**: 동일한 주사위를 한 라인에 나란히 놓으면 점수 배수가 중첩됩니다. (1개 1배, 2개 3배, 3개 5배)</li>
                            <li>**동귀어진(파괴)**: 일반 주사위가 상대 눈금을 파괴하면, 상대 주사위뿐만 아니라 내 주사위도 보드에 깔리지 않고 소멸(동귀어진)합니다.</li>
                            <li>**실드 주사위 (하늘색)**: 최초 시작 및 추가 턴의 주사위는 보호막이 적용되어 상대에게 파괴되지 않으며, 내 보드 및 상대방 보드 빈칸에 강제 침투시킬 수 있습니다. **(파괴 기능은 작동하지 않음)**</li>
                            <li>**추가 턴 (Extra Turn)**: 상대방 주사위 파괴 시 보너스 턴을 받지만, 추가 턴 상태에서는 다시 추가 턴을 얻을 수 없습니다(밸런싱).</li>
                            <li>**리롤 (1회)**: 주사위를 다시 던져 원래 주사위와 다시 굴린 주사위 중 하나를 선택할 수 있습니다.</li>
                            <li>**종료 및 승리**: 한쪽 보드가 다 차더라도 즉시 끝나지 않고 양쪽 보드가 완전히 채워질 때까지 끝까지 진행한 후, 각 라인의 최종 점수를 비교하여 3개 라인 중 2개 이상을 이긴 쪽이 매치에서 승리합니다.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TikatukaGamePage;
