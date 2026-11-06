import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trophy, Gem, Sparkles, RefreshCw } from 'lucide-react';
import Tooltip from '../Tooltip';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';
import useCrystalStore from '../../store/crystalStore';
import { fetchArcadeLeaderboard, getMyBestScore, getDefaultSeasonForGame } from '../../utils/arcadeRankingService';

/**
 * ArcadeGameLayout — 신규 아케이드 미니게임 6종 공통 레이아웃 & 실시간 시즌 랭킹 보드
 */
const ArcadeGameLayout = ({
    gameId,
    title,
    subtitle,
    accentColor = '#6366f1',
    accentBg = '#eef2ff',
    onBack,
    score = 0,
    extraStatLabel = '최고 기록',
    extraStatValue = null,
    refreshTrigger = 0,
    children,
}) => {
    const { user } = useAuthStore();
    const { userName } = useUserStore();
    const { crystals } = useCrystalStore();

    const userId = user?.id || 'guest';
    const defaultSeason = getDefaultSeasonForGame(gameId);
    const [activeSeason, setActiveSeason] = useState(defaultSeason);
    const [leaderboard, setLeaderboard] = useState([]);
    const [bestScore, setBestScore] = useState(() => getMyBestScore(gameId, userId, defaultSeason));

    const loadBoard = useCallback(async () => {
        const list = await fetchArcadeLeaderboard(gameId, activeSeason, user?.id || 'guest');
        setLeaderboard(list);
        setBestScore(getMyBestScore(gameId, userId, defaultSeason));
    }, [gameId, activeSeason, user?.id, userId, defaultSeason]);

    useEffect(() => {
        loadBoard();
    }, [loadBoard, refreshTrigger]);

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '16px 16px 110px 16px',
            }}
        >
            <div style={{ maxWidth: '1020px', margin: '0 auto' }}>
                {/* 상단 네비게이션 헤더 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                        gap: '10px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Tooltip text="아케이드 목록으로 돌아갑니다">
                            <button
                                onClick={onBack}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    width: '42px',
                                    height: '42px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#334155',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                                }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                        </Tooltip>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 우측 로그인 상태 배지 & 크리스탈 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {user ? (
                            <Tooltip text={`로그인 계정으로 ${defaultSeason === 'season_4' ? '시즌 4' : '시즌 3'} 랭킹에 점수가 등록됩니다`}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        padding: '6px 12px',
                                        borderRadius: '100px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#059669',
                                    }}
                                >
                                    <span>🟢</span> {userName || user.email?.split('@')[0] || '회원'} ({defaultSeason === 'season_4' ? '시즌 4' : '시즌 3'})
                                </div>
                            </Tooltip>
                        ) : (
                            <Tooltip text="현재 기기에 즉시 랭킹이 기록됩니다. 클릭하여 계정 로그인!">
                                <div
                                    onClick={() =>
                                        window.dispatchEvent(new CustomEvent('changeStep', { detail: 'auth' }))
                                    }
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        padding: '6px 12px',
                                        borderRadius: '100px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#4f46e5',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span>⚡</span> 게스트 랭킹 참여중 (로그인)
                                </div>
                            </Tooltip>
                        )}

                        <Tooltip text="보유 중인 루미 크리스탈">
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    padding: '6px 12px',
                                    borderRadius: '100px',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    color: '#7c3aed',
                                }}
                            >
                                <Gem size={14} color="#7c3aed" /> {crystals.toLocaleString()}
                            </div>
                        </Tooltip>
                    </div>
                </div>

                {/* 메인 그리드: 좌측 게임 보드 / 우측 실시간 시즌 랭킹 */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '20px',
                        alignItems: 'start',
                    }}
                >
                    {/* 게임 영역 카드 */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '28px',
                            padding: '20px',
                            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        {/* 상단 점수 HUD */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '16px',
                            }}
                        >
                            <div
                                style={{
                                    background: accentBg,
                                    borderRadius: '18px',
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: accentColor }}>
                                    현재 점수
                                </div>
                                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
                                    {score.toLocaleString()}점
                                </div>
                            </div>
                            <div
                                style={{
                                    background: '#f8fafc',
                                    borderRadius: '18px',
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                                    {extraStatLabel}
                                </div>
                                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: accentColor }}>
                                    {extraStatValue !== null
                                        ? extraStatValue
                                        : `${Math.max(bestScore, score).toLocaleString()}점`}
                                </div>
                            </div>
                        </div>

                        {/* 실제 게임 컨텐츠 */}
                        {children}
                    </div>

                    {/* 우측/하단 실시간 시즌 랭킹 보드 */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '28px',
                            padding: '22px',
                            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                flexWrap: 'wrap',
                                gap: '8px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trophy size={20} color="#f59e0b" />
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                                    실시간 최고 랭킹
                                </h3>
                            </div>

                            {/* 시즌 토글 (기억력 카드는 시즌 4 포함) */}
                            <div
                                style={{
                                    display: 'flex',
                                    background: '#f1f5f9',
                                    padding: '3px',
                                    borderRadius: '100px',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                {(defaultSeason === 'season_4'
                                    ? [
                                          { id: 'season_4', label: '시즌 4', tip: '현재 진행 중인 시즌 4 랭킹입니다 (오답 시간 차감 적용)' },
                                          { id: 'season_3', label: '시즌 3', tip: '이전 시즌 3 기록을 확인합니다' },
                                          { id: 'season_2', label: '시즌 2', tip: '이전 시즌 2 기록을 확인합니다' },
                                          { id: 'season_1', label: '시즌 1', tip: '시즌 1 명예의 전당 기록입니다' },
                                      ]
                                    : [
                                          { id: 'season_3', label: '시즌 3', tip: '현재 진행 중인 시즌 3 랭킹입니다' },
                                          { id: 'season_2', label: '시즌 2', tip: '이전 시즌 2 기록을 확인합니다' },
                                          { id: 'season_1', label: '시즌 1', tip: '시즌 1 명예의 전당 기록입니다' },
                                      ]
                                ).map((s) => (
                                    <Tooltip key={s.id} text={s.tip}>
                                        <button
                                            onClick={() => setActiveSeason(s.id)}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '0.72rem',
                                                borderRadius: '100px',
                                                fontWeight: 800,
                                                background: activeSeason === s.id ? accentColor : 'transparent',
                                                color: activeSeason === s.id ? 'white' : '#64748b',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {s.label}
                                        </button>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>

                        {/* 리더보드 리스트 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {leaderboard.length === 0 && (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '32px 16px',
                                        background: '#f8fafc',
                                        borderRadius: '18px',
                                        border: '1px dashed #cbd5e1',
                                        color: '#64748b',
                                        fontSize: '0.86rem',
                                        fontWeight: 700,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🏆</div>
                                    아직 등록된 기록이 없습니다.<br />
                                    게임을 플레이하고 <strong>첫 1위 주인공</strong>이 되어보세요!
                                </div>
                            )}
                            {leaderboard.slice(0, 10).map((item, idx) => (
                                <div
                                    key={`${item.name}-${item.score}-${idx}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '11px 14px',
                                        borderRadius: '14px',
                                        background: item.isMe
                                            ? accentBg
                                            : idx === 0
                                            ? 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)'
                                            : '#f8fafc',
                                        border: item.isMe
                                            ? `1.5px solid ${accentColor}`
                                            : idx === 0
                                            ? '1px solid #fde047'
                                            : '1px solid #e2e8f0',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span
                                            style={{
                                                width: '26px',
                                                textAlign: 'center',
                                                fontWeight: 900,
                                                fontSize: idx < 3 ? '1.05rem' : '0.82rem',
                                                color: '#475569',
                                            }}
                                        >
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b' }}>
                                                {item.name}{' '}
                                                {item.mbti && item.mbti !== '?' && (
                                                    <span
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            color: accentColor,
                                                            background: 'white',
                                                            padding: '1px 6px',
                                                            borderRadius: '6px',
                                                            fontWeight: 700,
                                                            marginLeft: '4px',
                                                        }}
                                                    >
                                                        {item.mbti}
                                                    </span>
                                                )}
                                                {item.isMe && (
                                                    <span
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            color: accentColor,
                                                            fontWeight: 900,
                                                            marginLeft: '4px',
                                                        }}
                                                    >
                                                        (나)
                                                    </span>
                                                )}
                                            </div>
                                            {item.detail && (
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                                                    {item.detail}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 900, fontSize: '0.92rem', color: accentColor }}>
                                        {item.score.toLocaleString()}점
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArcadeGameLayout;
