import { motion } from 'framer-motion';

/**
 * CommunityHubPage — 커뮤니티 허브 메인 페이지
 * (이전에 App.jsx 하단에 인라인으로 정의되어 있던 컴포넌트를 분리)
 */
const CommunityHubPage = ({ onNavigate }) => {
    const cards = [
        {
            step: 'magazine',
            emoji: '📖',
            title: '소울 매거진',
            desc: '성향별 큐레이션 아티클 · 북마크 저장',
            gradient: ['#F3E8FF', '#E9D5FF'],
            accent: '#9333EA',
        },
        {
            step: 'compatibility-game',
            emoji: '💕',
            title: '소울 궁합 게임',
            desc: '6문제로 알아보는 나의 이상형 궁합 · +15💎',
            gradient: ['#FDF4FF', '#FAE8FF'],
            accent: '#D946EF',
        },
        {
            step: 'ranking',
            emoji: '🏆',
            title: '소울 랭킹',
            desc: '주간/월간 활동 리더보드 · +30💎 보상',
            gradient: ['#FFF7ED', '#FED7AA'],
            accent: '#F59E0B',
        },
        {
            step: 'groups',
            emoji: '💬',
            title: '소울 그룹',
            desc: '성향별 그룹 채팅 · 관심사 모임 참여',
            gradient: ['#EFF6FF', '#DBEAFE'],
            accent: '#3B82F6',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* 헤더 */}
            <div
                style={{
                    padding: '30px 5% 20px',
                    background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                    color: 'white',
                }}
            >
                <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.6rem' }}>🌟 커뮤니티</h1>
                <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '0.88rem' }}>
                    함께하면 더 즐거운 소울 공간
                </p>
            </div>

            {/* 카드 목록 */}
            <div style={{ padding: '24px 5%', display: 'grid', gap: '14px' }}>
                {cards.map((card) => (
                    <motion.div
                        key={card.step}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate(card.step)}
                        style={{
                            background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`,
                            borderRadius: '22px',
                            padding: '22px',
                            cursor: 'pointer',
                            border: `1px solid ${card.accent}20`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {card.badge && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: card.badge === 'NEW' ? '#10B981' : '#EF4444',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    padding: '3px 8px',
                                    borderRadius: '100px',
                                }}
                            >
                                {card.badge}
                            </div>
                        )}
                        <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{card.emoji}</div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '3px', color: '#1E293B' }}>
                                {card.title}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#475569' }}>{card.desc}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', color: card.accent, flexShrink: 0, fontSize: '1.2rem' }}>›</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CommunityHubPage;
