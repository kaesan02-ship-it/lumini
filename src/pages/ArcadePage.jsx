import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Gamepad2, Sparkles } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import useUserStore from '../store/userStore';

/**
 * ArcadePage — 루미 아케이드 미니게임 포털
 * 역할: 파편화되어 대시보드를 채우고 있던 게임들을 한 장소로 통합한 오락실 메뉴
 */
const ArcadePage = ({ onNavigate }) => {
    const { profile } = useUserStore();

    const games = [
        {
            id: 'apple-game',
            title: '🍎 사과 게임',
            badge: '역대급 중독성 🔥',
            desc: '가로세로 드래그하여 합이 10이 되도록 사과를 제거하세요. 시각적 빠른 판단력이 필요합니다!',
            tooltip: '화면에 흩어진 숫자 사과들을 모아 10을 만드는 하이 스피드 두뇌 퍼즐!',
            theme: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '#fca5a5',
            color: '#dc2626'
        },
        {
            id: 'shisen-sho',
            title: '🐾 사천성 게임',
            badge: '타임어택 ⏱️',
            desc: '똑같은 소울펫 패를 2번 이하의 꺾임선으로 연결하여 지워나가세요. 빠른 패 스캔이 생명입니다.',
            tooltip: '루미니의 귀여운 펫 카드들의 짝을 맞추어 나가는 정통 타임어택 사천성 퍼즐!',
            theme: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '#fcd34d',
            color: '#d97706'
        },
        {
            id: 'game-2048',
            title: '🥚 2048 진화',
            badge: '소울펫 합성 👑',
            desc: '방향키 또는 슬라이딩으로 소울펫 알을 병합하여 최종 진화 단계를 이끌어내세요. 전술적 공간 배치가 필수입니다.',
            tooltip: '펫 알을 상하좌우로 합치며 상위 펫으로 진화해 나가는 중독적인 슬라이딩 매칭 퍼즐!',
            theme: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            border: '#86efac',
            color: '#16a34a'
        },
        {
            id: 'watermelon-game',
            title: '🍉 수박 게임',
            badge: '물리 합성 🍉',
            desc: '과일을 떨어뜨려 부딪히게 하여 더 큰 과일로 성장시키고, 용기를 넘치지 않게 왕수박을 완성하세요!',
            tooltip: '동글동글한 과일들을 떨어뜨려 물리 충돌로 병합시키는 힐링 과일 낙하 퍼즐!',
            theme: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '#7dd3fc',
            color: '#0284c7'
        },
        {
            id: 'tikatuka-game',
            title: '🎲 티카투카 주사위',
            badge: 'AI 전술 배틀 ⚔️',
            desc: '상대 AI와 주사위를 굴려 보드 위에 최적의 수로 배치하고 상대방의 주사위를 파괴하여 10연승에 도전하세요!',
            tooltip: '상대 주사위를 파괴하고 보호막 주사위로 변수를 설계하는 고도의 전략형 1:1 대결 보드게임!',
            theme: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
            border: '#d8b4fe',
            color: '#7e22ce'
        }
    ];

    return (
        <div className="page-container" style={{ padding: '0 20px 100px 20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* 헤더 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', textAlign: 'center', marginTop: '20px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Gamepad2 size={28} /> 루미 아케이드 (Lumi Arcade)
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>
                    재미있는 캐주얼 미니게임을 플레이하고 보상으로 <span style={{ color: '#f43f5e', fontWeight: 800 }}>💎 루미 크리스탈</span>을 모으세요!
                </p>
            </div>

            {/* 카드 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {games.map((game, idx) => (
                    <Tooltip key={game.id} text={game.tooltip} style={{ display: 'block' }}>
                        <motion.div
                            whileHover={{ scale: 1.015, translateY: -2 }}
                            onClick={() => onNavigate && onNavigate(game.id)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.75) 100%)',
                                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                                borderRadius: '24px',
                                padding: '20px 24px',
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px -5px rgba(244, 63, 94, 0.04), 0 8px 16px -6px rgba(0,0,0,0.02)',
                                backdropFilter: 'blur(10px)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* 파스텔 좌측 색상 띠 장식 */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '6px',
                                background: game.color,
                                opacity: 0.6
                            }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, paddingRight: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                                        {game.title}
                                    </h3>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        color: game.color,
                                        background: game.theme,
                                        border: `1px solid ${game.border}`,
                                        padding: '2px 8px',
                                        borderRadius: '100px'
                                    }}>
                                        {game.badge}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
                                    {game.desc}
                                </p>
                            </div>

                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '14px',
                                background: game.theme,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: game.color,
                                border: `1.5px solid ${game.border}`
                            }}>
                                <Trophy size={20} />
                            </div>
                        </motion.div>
                    </Tooltip>
                ))}
            </div>
            
            {/* 아케이드 장식용 배너 */}
            <div style={{
                marginTop: '30px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                borderRadius: '24px',
                padding: '20px 24px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                boxShadow: '0 10px 20px rgba(244, 63, 94, 0.15)'
            }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Sparkles size={22} color="#ffffff" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>오늘의 랭킹 도전!</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#ffe4e6', fontWeight: 600 }}>
                        모든 아케이드 미니게임은 일일 챌린지 점수로 누적 산정되어 연승 리더보드에 자동 등재됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ArcadePage;
