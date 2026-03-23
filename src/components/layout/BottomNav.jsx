import React from 'react';
import { Home, ClipboardList, Users, Brain, ShoppingBag, Target } from 'lucide-react';
import Tooltip from '../Tooltip';

// ─── 네비게이션 아이템 ─────────────────────────────────────────────
const NavItem = ({ icon, label, active, onClick }) => (
    <div
        className={`nav-item ${active ? 'active' : ''}`}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
    >
        {icon}
        <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: active ? 700 : 500 }}>
            {label}
        </span>
    </div>
);

// ─── 커뮤니티 탭에 속하는 하위 페이지 목록 ────────────────────────
const COMMUNITY_STEPS = [
    'community', 'magazine', 'ranking', 'compatibility-game',
    'groups', 'group-chat', 'weekly-report',
];

// ─── 인사이트 탭에 속하는 하위 페이지 목록 ───────────────────────
const INSIGHTS_STEPS = ['insights', 'ai-insights', 'stats', 'growth'];

/**
 * BottomNav — 하단 탭 네비게이션
 * props:
 *  - step: 현재 페이지 이름 (string)
 *  - onNavigate(target): 페이지 이동 콜백
 */
const BottomNav = ({ step, onNavigate }) => {
    return (
        <nav className="bottom-nav">
            <Tooltip text="홈 화면으로 이동합니다.">
                <NavItem
                    active={step === 'dashboard'}
                    icon={<Home size={22} />}
                    label="홈"
                    onClick={() => onNavigate('dashboard')}
                />
            </Tooltip>

            <Tooltip text="동네 소식과 커뮤니티 피드를 확인합니다.">
                <NavItem
                    active={step === 'feed'}
                    icon={<ClipboardList size={22} />}
                    label="피드"
                    onClick={() => onNavigate('feed')}
                />
            </Tooltip>

            <Tooltip text="일일 과제를 수행하고 보상을 받으세요.">
                <NavItem
                    active={step === 'daily-challenges'}
                    icon={<Target size={22} />}
                    label="챌린지"
                    onClick={() => onNavigate('daily-challenges')}
                />
            </Tooltip>

            <Tooltip text="다양한 소울 모임과 게임에 참여하세요.">
                <NavItem
                    active={COMMUNITY_STEPS.includes(step)}
                    icon={<Users size={22} />}
                    label="커뮤니티"
                    onClick={() => onNavigate('community')}
                />
            </Tooltip>

            <Tooltip text="성향 분석 및 통계 데이터를 확인합니다.">
                <NavItem
                    active={INSIGHTS_STEPS.includes(step)}
                    icon={<Brain size={22} />}
                    label="인사이트"
                    onClick={() => onNavigate('insights')}
                />
            </Tooltip>

            <Tooltip text="포인트를 아이템으로 교환합니다.">
                <NavItem
                    active={step === 'shop'}
                    icon={<ShoppingBag size={24} />}
                    label="상점"
                    onClick={() => onNavigate('shop')}
                />
            </Tooltip>
        </nav>
    );
};

export default BottomNav;
