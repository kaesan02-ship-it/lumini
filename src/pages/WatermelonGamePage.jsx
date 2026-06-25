import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, ArrowLeft, Play, Gem, Volume2, VolumeX, Sparkles } from 'lucide-react';
import useCrystalStore from '../store/crystalStore';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { supabase } from '../supabase/client';
import { USE_MOCK_DATA } from '../config';

// 과일 도감 및 정보 설정 (1 ~ 10단계)
const FRUIT_PRESETS = {
    1:  { name: '체리', emoji: '🍒', radius: 15, color: '#f43f5e', score: 2 },
    2:  { name: '딸기', emoji: '🍓', radius: 22, color: '#ec4899', score: 4 },
    3:  { name: '포도', emoji: '🍇', radius: 30, color: '#a855f7', score: 8 },
    4:  { name: '귤', emoji: '🍊', radius: 38, color: '#f97316', score: 16 },
    5:  { name: '사과', emoji: '🍎', radius: 48, color: '#ef4444', score: 32 },
    6:  { name: '배', emoji: '🍐', radius: 58, color: '#eab308', score: 64 },
    7:  { name: '복숭아', emoji: '🍑', radius: 68, color: '#f472b6', score: 128 },
    8:  { name: '파인애플', emoji: '🍍', radius: 78, color: '#fbbf24', score: 256 },
    9:  { name: '멜론', emoji: '🍈', radius: 88, color: '#84cc16', score: 512 },
    10: { name: '수박', emoji: '🍉', radius: 100, color: '#10b981', score: 1024 }
};

const GAME_TIME = 120; // 2분 제한
const CONTAINER_WIDTH = 480;
const CONTAINER_HEIGHT = 640;
const DEADLINE_Y = 100; // 상단 한계선

const WatermelonGamePage = ({ onBack }) => {
    const { crystals, earnCrystals } = useCrystalStore();
    const { user } = useAuthStore();
    const { userName } = useUserStore();
    const userId = user?.id || 'guest';
    const bestScoreKey = `watermelon_game_best_score_${userId}`;

    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem(bestScoreKey) || '0'));
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [gameState, setGameState] = useState('ready'); // ready, playing, finished
    const [isMuted, setIsMuted] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [nextFruitLevel, setNextFruitLevel] = useState(1);
    const [currentFruitLevel, setCurrentFruitLevel] = useState(1);
    
    // 물리 엔진을 제어할 canvas 및 refs
    const canvasRef = useRef(null);
    const bgmRef = useRef(null);
    const scoreRef = useRef(0);
    const fruitsRef = useRef([]); // 물리 입자로 작동할 과일들
    const mouseXRef = useRef(CONTAINER_WIDTH / 2);
    const canDropRef = useRef(true);
    const deadlineTimerRef = useRef(null);
    const [isDeadlineWarning, setIsDeadlineWarning] = useState(false);

    // 랭킹 리더보드 로드 (중복 허용 탑 10)
    const fetchLeaderboard = useCallback(() => {
        if (USE_MOCK_DATA) {
            setLeaderboard([
                { username: '원채김', score: 2850 },
                { username: '김민지', score: 2420 },
                { username: '김민지', score: 1980 },
                { username: '윤선희', score: 1650 },
                { username: '지후', score: 1220 },
                { username: '서연', score: 980 }
            ]);
            return;
        }

        supabase.from('watermelon_game_scores')
            .select('score, profiles(username)')
            .order('score', { ascending: false })
            .limit(10)
            .then(({ data, error }) => {
                if (data && !error) {
                    const mapped = data.map(item => ({
                        username: item.profiles?.username || '익명',
                        score: item.score
                    }));
                    setLeaderboard(mapped);
                } else {
                    console.error('Failed to load watermelon leaderboard:', error);
                }
            });
    }, []);

    // 초기 최고 기록 및 리더보드 가져오기
    useEffect(() => {
        if (!USE_MOCK_DATA && user) {
            supabase.from('watermelon_game_scores')
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
    }, [user, bestScoreKey, fetchLeaderboard]);

    // 게임 시작 시 초기화
    const startGame = () => {
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(GAME_TIME);
        fruitsRef.current = [];
        canDropRef.current = true;
        setIsDeadlineWarning(false);
        if (deadlineTimerRef.current) {
            clearTimeout(deadlineTimerRef.current);
            deadlineTimerRef.current = null;
        }

        // 과일 초기화
        const initialLevel = Math.floor(Math.random() * 4) + 1; // 1~4단계 랜덤
        const nextLevel = Math.floor(Math.random() * 4) + 1;
        setCurrentFruitLevel(initialLevel);
        setNextFruitLevel(nextLevel);

        setGameState('playing');

        setTimeout(() => {
            if (bgmRef.current && !isMuted) {
                bgmRef.current.volume = 0.2;
                bgmRef.current.play().catch(e => console.log('BGM Play deferred:', e));
            }
        }, 100);
    };

    // 타임어택 시 타이머 처리
    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState, timeLeft]);

    // 게임 종료 처리
    const endGame = () => {
        setGameState('finished');
        if (bgmRef.current) bgmRef.current.pause();

        const finalScore = scoreRef.current;
        
        // 최고 기록 동기화
        setBestScore(prevBest => {
            const newBest = Math.max(prevBest, finalScore);
            localStorage.setItem(bestScoreKey, newBest.toString());

            // Supabase에 데이터 등록
            if (!USE_MOCK_DATA && user?.id && finalScore > 0) {
                // 최대 과일 단계 찾기
                const maxLevel = fruitsRef.current.reduce((max, f) => Math.max(max, f.level), 1);

                supabase.from('watermelon_game_scores')
                    .insert({ user_id: user.id, score: finalScore, max_fruit_level: maxLevel })
                    .then(({ error }) => {
                        if (error) console.error('Failed to save watermelon score:', error);
                        else fetchLeaderboard();
                    });
            }
            return newBest;
        });

        // 결과 리로드
        if (deadlineTimerRef.current) {
            clearTimeout(deadlineTimerRef.current);
            deadlineTimerRef.current = null;
        }
    };

    // 마우스/터치 위치 트래킹
    const handleMouseMove = (e) => {
        if (gameState !== 'playing' || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        
        // 컨테이너 범위 내로 조준 좌표 고정
        const activeRadius = FRUIT_PRESETS[currentFruitLevel].radius;
        mouseXRef.current = Math.max(activeRadius + 10, Math.min(CONTAINER_WIDTH - activeRadius - 10, x));
    };

    // 과일 낙하 격발
    const handleDrop = () => {
        if (gameState !== 'playing' || !canDropRef.current) return;

        canDropRef.current = false;
        const preset = FRUIT_PRESETS[currentFruitLevel];
        const newFruit = {
            id: `f-${Date.now()}-${Math.random()}`,
            x: mouseXRef.current,
            y: 50, // 발사 고도 고정
            vx: 0,
            vy: 2, // 떨어지는 초기 속도
            radius: preset.radius,
            level: currentFruitLevel,
            isCombined: false,
            opacity: 1
        };

        // 낙하 연출 사운드
        const dropSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-mechanical-clunk-2898.mp3');
        dropSfx.volume = 0.2;
        if (!isMuted) dropSfx.play().catch(() => {});

        fruitsRef.current.push(newFruit);

        // 쿨다운 0.8초 후 다음 과일 로드
        setTimeout(() => {
            if (gameState === 'playing') {
                setCurrentFruitLevel(nextFruitLevel);
                const nextLevel = Math.floor(Math.random() * 4) + 1; // 1~4단계 무작위
                setNextFruitLevel(nextLevel);
                canDropRef.current = true;
            }
        }, 800);
    };

    // 물리 엔진 및 애니메이션 루프
    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;

        const gravity = 0.35; // 중력 세기
        const friction = 0.98; // 벽 마찰력
        const restitution = 0.2; // 반발 계수

        const updatePhysics = () => {
            const fruits = fruitsRef.current;
            
            // 1. 물리 갱신 (중력 + 속도 갱신)
            fruits.forEach(f => {
                f.vy += gravity;
                f.x += f.vx;
                f.y += f.vy;

                // 벽 충돌 (좌우)
                if (f.x < f.radius) {
                    f.x = f.radius;
                    f.vx = -f.vx * restitution;
                } else if (f.x > CONTAINER_WIDTH - f.radius) {
                    f.x = CONTAINER_WIDTH - f.radius;
                    f.vx = -f.vx * restitution;
                }

                // 바닥 충돌
                if (f.y > CONTAINER_HEIGHT - f.radius) {
                    f.y = CONTAINER_HEIGHT - f.radius;
                    f.vy = -f.vy * restitution;
                    f.vx *= friction; // 바닥 마찰력 적용
                }
            });

            // 2. 과일 충돌 처리 및 합성 판정 (2D Elastic Collision)
            // 밀도가 뭉쳐도 찌그러짐을 없애기 위해 충돌 보정을 5회 반복 루프(Sub-stepping) 처리
            for (let step = 0; step < 5; step++) {
                for (let i = 0; i < fruits.length; i++) {
                    for (let j = i + 1; j < fruits.length; j++) {
                        const f1 = fruits[i];
                        const f2 = fruits[j];

                        if (f1.isCombined || f2.isCombined) continue;

                        const dx = f2.x - f1.x;
                        const dy = f2.y - f1.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const minDist = f1.radius + f2.radius;

                        if (distance < minDist) {
                            // 겹침 해결 (Overlay Resolution)
                            const overlap = minDist - distance;
                            const nx = dx / distance;
                            const ny = dy / distance;

                            // 서로 밀어내기
                            f1.x -= nx * overlap * 0.5;
                            f1.y -= ny * overlap * 0.5;
                            f2.x += nx * overlap * 0.5;
                            f2.y += ny * overlap * 0.5;

                            // 2-1. 같은 단계 과일 합성 판정
                            if (f1.level === f2.level) {
                                f1.isCombined = true;
                                f2.isCombined = true;

                                // 합성 좌표 (중앙)
                                const mergeX = (f1.x + f2.x) / 2;
                                const mergeY = (f1.y + f2.y) / 2;

                                handleMergeFruits(f1.level, mergeX, mergeY);
                                continue;
                            }

                            // 2-2. 튕겨나가는 탄성 속도 갱신
                            const kx = f1.vx - f2.vx;
                            const ky = f1.vy - f2.vy;
                            const vn = kx * nx + ky * ny;

                            if (vn > 0) {
                                // 임의의 가상 질량 (반지름의 면적 비례)
                                const m1 = f1.radius * f1.radius;
                                const m2 = f2.radius * f2.radius;
                                const impulse = (2 * vn) / (m1 + m2);

                                f1.vx -= impulse * m2 * nx * restitution;
                                f1.vy -= impulse * m2 * ny * restitution;
                                f2.vx += impulse * m1 * nx * restitution;
                                f2.vy += impulse * m1 * ny * restitution;
                            }
                        }
                    }
                }
            }

            // 결합 완료된 과일 정적 제거 및 필터링
            fruitsRef.current = fruits.filter(f => !f.isCombined);
        };

        // 과일 결합 처리
        const handleMergeFruits = (level, x, y) => {
            const scoreAddition = FRUIT_PRESETS[level].score * 5; // 결합 점수 가중치
            scoreRef.current += scoreAddition;
            setScore(scoreRef.current);

            // 결합 사운드
            const popSfx = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bubble-pop-up-alert-2352.mp3');
            popSfx.volume = 0.25;
            if (!isMuted) popSfx.play().catch(() => {});

            // 최고 레벨(수박, 레벨 10) 합성 시 폭발 이펙트와 보너스 점수 획득 후 사라짐
            if (level === 10) {
                scoreRef.current += 2048; // 수박 합성 보너스!
                setScore(scoreRef.current);
                return;
            }

            // 다음 단계 과일 생성
            const nextLevel = level + 1;
            const preset = FRUIT_PRESETS[nextLevel];
            const mergedFruit = {
                id: `f-${Date.now()}-${Math.random()}`,
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2, // 좌우 살짝 반동
                vy: -1, // 위로 살짝 반동
                radius: preset.radius,
                level: nextLevel,
                isCombined: false
            };

            // 다음 프레임에 합성된 과일 강제 추가
            fruitsRef.current.push(mergedFruit);
        };

        // 3. Canvas 렌더링
        const draw = () => {
            ctx.clearRect(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT);

            // 가이드 그리드 및 데드라인 점선 그리기
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, DEADLINE_Y);
            ctx.lineTo(CONTAINER_WIDTH, DEADLINE_Y);
            ctx.stroke();
            ctx.setLineDash([]); // 대시 리셋

            // 낙하 조준선 가이드
            if (canDropRef.current) {
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(mouseXRef.current, 50);
                ctx.lineTo(mouseXRef.current, CONTAINER_HEIGHT);
                ctx.stroke();

                // 대기 중인 낙하 과일 그리기 (귀엽고 입체적인 젤리 구슬 형태)
                const preset = FRUIT_PRESETS[currentFruitLevel];
                const r = preset.radius;
                const x = mouseXRef.current;
                const y = 50;

                const gradient = ctx.createRadialGradient(
                    x - r * 0.25, y - r * 0.25, r * 0.1,
                    x, y, r
                );
                gradient.addColorStop(0, '#ffffff'); // 하이라이트 광원 시작점
                gradient.addColorStop(0.2, preset.color); // 원본 색상 유지
                gradient.addColorStop(1, preset.color + 'CC'); // 입체 쉐도우

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();

                // 흰색 내부 테두리
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, r - 1.5, 0, Math.PI * 2);
                ctx.stroke();

                // 바깥 원본색 테두리
                ctx.strokeStyle = preset.color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.stroke();

                // 이모지 그리기
                ctx.font = `${r * 1.25}px Poppins, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(preset.emoji, x, y);

                // 광택 물방울 반짝임 얹기
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.beginPath();
                ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.18, 0, Math.PI * 2);
                ctx.fill();
            }

            // 낙하한 과일 입자 렌더링
            const fruits = fruitsRef.current;
            fruits.forEach(f => {
                const preset = FRUIT_PRESETS[f.level];
                const r = f.radius;

                // 과일 풍선/젤리 입체 그라데이션 적용
                const gradient = ctx.createRadialGradient(
                    f.x - r * 0.25, f.y - r * 0.25, r * 0.1,
                    f.x, f.y, r
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.2, preset.color);
                gradient.addColorStop(1, preset.color + 'CC');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
                ctx.fill();

                // 내부 테두리 (귀엽고 뚜렷하게 테두리 적용)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(f.x, f.y, r - 1.5, 0, Math.PI * 2);
                ctx.stroke();

                // 외부 테두리
                ctx.strokeStyle = preset.color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
                ctx.stroke();

                // 이모지 그리기
                ctx.font = `${r * 1.25}px Poppins, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(preset.emoji, f.x, f.y);

                // 광택 물방울 반짝임 얹기
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.beginPath();
                ctx.arc(f.x - r * 0.35, f.y - r * 0.35, r * 0.18, 0, Math.PI * 2);
                ctx.fill();
            });

            // 데드라인 경고 텍스트 (침범 상태일 때)
            if (isDeadlineWarning) {
                ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
                ctx.fillRect(0, 0, CONTAINER_WIDTH, DEADLINE_Y);

                ctx.fillStyle = '#f43f5e';
                ctx.font = '900 16px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚠️ 데드라인 침범! 위험 ⚠️', CONTAINER_WIDTH / 2, DEADLINE_Y - 20);
            }
        };

        // 4. 데드라인 경보 감지 로직
        const checkDeadline = () => {
            const fruits = fruitsRef.current;
            
            // 발사 지점 근처가 아닌, 실제로 안착해서 쌓여 있는 과일이 데드라인 위로 침범했는지 체크
            const isCrossing = fruits.some(f => f.y > 60 && f.y - f.radius < DEADLINE_Y);

            if (isCrossing) {
                if (!deadlineTimerRef.current) {
                    setIsDeadlineWarning(true);
                    deadlineTimerRef.current = setTimeout(() => {
                        endGame();
                    }, 3000); // 3초 침범 시 게임오버
                }
            } else {
                if (deadlineTimerRef.current) {
                    clearTimeout(deadlineTimerRef.current);
                    deadlineTimerRef.current = null;
                    setIsDeadlineWarning(false);
                }
            }
        };

        // 5. 프레임 루프
        const loop = () => {
            updatePhysics();
            checkDeadline();
            draw();
            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationId);
            if (deadlineTimerRef.current) {
                clearTimeout(deadlineTimerRef.current);
            }
        };
    }, [gameState, currentFruitLevel, nextFruitLevel, isMuted, isDeadlineWarning]);

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '20px 2%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            userSelect: 'none', touchAction: 'none', color: '#334155', position: 'relative', overflow: 'hidden'
        }}>
            {/* 배경 데코레이션 */}
            <div style={{ position: 'absolute', top: '15%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

            {/* BGM */}
            <audio ref={bgmRef} loop src="https://assets.mixkit.co/music/preview/mixkit-retro-arcade-casino-key-515.mp3" />

            {/* Header */}
            <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
                <button onClick={() => { if (bgmRef.current) bgmRef.current.pause(); onBack(); }} title="대시보드로 돌아갑니다" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 800, background: 'white', padding: '10px 20px', borderRadius: '15px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <ArrowLeft size={20} /> 취소
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🍉 루미니 수박 농장
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => { setIsMuted(!isMuted); if (bgmRef.current) isMuted ? bgmRef.current.play() : bgmRef.current.pause(); }} title={isMuted ? "배경음악 켜기" : "배경음악 끄기"} style={{ background: 'white', padding: '12px', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 20px', borderRadius: '100px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <Gem size={20} color="#10b981" fill="#10b981" />
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#334155' }}>{crystals}</span>
                    </div>
                </div>
            </div>

            <div style={{
                width: '100%', maxWidth: '1000px', display: 'grid',
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 340px', gap: '30px', position: 'relative', zIndex: 10
            }}>
                {/* 메인 게임 컨테이너 */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
                    borderRadius: '35px', padding: '20px', border: '1px solid rgba(255,255,255,1)',
                    boxShadow: '0 20px 45px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    {/* 정보 스탯바 */}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <Timer size={20} color="#10b981" />
                            <span style={{ fontWeight: 900, color: '#10b981', fontSize: '1.4rem' }}>{timeLeft}초</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* 다음 스폰 대기 과일 예고 */}
                            {gameState === 'playing' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>NEXT</span>
                                    <span style={{ fontSize: '1.4rem' }}>{FRUIT_PRESETS[nextFruitLevel].emoji}</span>
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(251, 191, 36, 0.1)', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#d97706' }}>SCORE</span>
                                <span style={{ fontWeight: 900, color: '#d97706', fontSize: '1.4rem' }}>{score.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* 물리 시뮬레이션용 Canvas 그릇 */}
                    <div style={{
                        position: 'relative', width: '100%', maxWidth: `${CONTAINER_WIDTH}px`,
                        background: '#f8fafc', borderRadius: '24px', border: '3px solid #e2e8f0',
                        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.03)', overflow: 'hidden'
                    }}>
                        {gameState === 'ready' ? (
                            <div style={{ height: `${CONTAINER_HEIGHT}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                                <motion.div
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    style={{ fontSize: '7rem', filter: 'drop-shadow(0 10px 15px rgba(16, 185, 129, 0.2))', cursor: 'pointer', marginBottom: '20px' }}
                                    onClick={startGame}
                                >
                                    🍉
                                </motion.div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>타임어택 수박 농장</h3>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, maxWidth: '280px', lineHeight: 1.5, marginBottom: '30px' }}>
                                    120초 제한시간 안에 과일을 합쳐 수박을 수확하세요! 그릇 밖으로 넘치면 즉시 아웃 ⚠️
                                </p>
                                <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '320px' }}>
                                    <button onClick={() => {
                                        useUserStore.getState().setActiveRankingTab('watermelon');
                                        window.dispatchEvent(new CustomEvent('changeStep', { detail: 'ranking' }));
                                    }} title="수박게임 전체 랭킹을 확인하러 이동합니다" style={{ flex: 1, padding: '14px 20px', background: 'white', border: '1px solid #ffd3db', color: '#10b981', fontWeight: 800, borderRadius: '15px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.05)' }}>
                                        <Trophy size={18} color="#10b981" /> 랭킹 보기
                                    </button>
                                    <button onClick={startGame} title="수박게임을 새로 시작합니다" style={{ flex: 1.2, padding: '14px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: 'white', fontWeight: 900, borderRadius: '15px', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                                        게임 시작
                                    </button>
                                </div>
                            </div>
                        ) : gameState === 'finished' ? (
                            <div style={{ height: `${CONTAINER_HEIGHT}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '6rem', marginBottom: '20px' }}>🎉</div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', marginBottom: '10px' }}>타임 만료!</h3>
                                <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#334155', marginBottom: '30px' }}>
                                    최종 기록: <span style={{ color: '#d97706' }}>{score.toLocaleString()}</span>점
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={onBack} title="대시보드로 돌아갑니다" style={{ flex: 1, padding: '14px 20px', borderRadius: '15px', fontWeight: 800, background: 'white', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer' }}>돌아가기</button>
                                        <button onClick={startGame} title="수박 농장 게임을 처음부터 다시 도전합니다" style={{ flex: 1.2, padding: '14px 20px', borderRadius: '15px', fontWeight: 900, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 15px rgba(16, 185, 129, 0.2)' }}>다시 하기</button>
                                    </div>
                                    <button onClick={() => {
                                        useUserStore.getState().setActiveRankingTab('watermelon');
                                        window.dispatchEvent(new CustomEvent('changeStep', { detail: 'ranking' }));
                                    }} title="명예의 전당 전체 랭킹으로 이동하여 경쟁 기록을 확인합니다" style={{ width: '100%', padding: '14px 20px', background: 'white', border: '1px solid #ffd3db', color: '#10b981', fontWeight: 800, borderRadius: '15px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.05)' }}>
                                        <Trophy size={18} color="#10b981" /> 전체 랭킹 구경하기
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <canvas
                                ref={canvasRef}
                                width={CONTAINER_WIDTH}
                                height={CONTAINER_HEIGHT}
                                onMouseMove={handleMouseMove}
                                onTouchMove={handleMouseMove}
                                onClick={handleDrop}
                                style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
                            />
                        )}
                    </div>
                </div>

                {/* 사이드바 명예의 전당 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        background: 'white', borderRadius: '30px', padding: '25px',
                        border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Trophy size={22} color="#fbbf24" fill="#fbbf24" />
                            <h3 style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1e293b' }}>명예의 전당 (수박)</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {leaderboard.length > 0 ? (
                                leaderboard.map((item, i) => {
                                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                                    const badge = medals[i] || `${i + 1}위`;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', padding: '12px 14px',
                                            background: item.username === userName ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
                                            border: item.username === userName ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #e2e8f0',
                                            borderRadius: '14px', alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 800, color: '#475569', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.15rem' }}>{badge}</span>
                                                <span>{item.username}</span>
                                            </span>
                                            <span style={{ fontWeight: 900, color: '#10b981', fontSize: '0.95rem' }}>{item.score.toLocaleString()}점</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                    수박 수확 기록을 등록하는 첫 고득점자가 되어보세요! 🍉
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 도감 정보 매뉴얼 */}
                    <div style={{
                        background: 'white', borderRadius: '30px', padding: '25px',
                        border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.03)'
                    }}>
                        <h4 style={{ fontWeight: 900, fontSize: '1rem', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={18} color="#10b981" /> 🍉 진화 순서 도감
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                                {Object.entries(FRUIT_PRESETS).map(([lvl, p], idx) => (
                                    <React.Fragment key={lvl}>
                                        <span style={{ 
                                            background: '#f8fafc', 
                                            border: `1.5px solid ${p.color}`, 
                                            padding: '6px 12px', 
                                            borderRadius: '12px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}>
                                            <span style={{ fontSize: '1.1rem' }}>{p.emoji}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.name}</span>
                                        </span>
                                        {idx < Object.keys(FRUIT_PRESETS).length - 1 && (
                                            <span style={{ color: '#94a3b8', fontWeight: 900, fontSize: '1.1rem' }}>➔</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, lineHeight: 1.45 }}>
                                * 같은 종류의 과일 2개가 만나면 화살표 방향의 다음 단계 과일로 합성됩니다! 마지막 수박(🍉) 두 개를 합성하면 보너스 대폭발!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatermelonGamePage;
