import React from 'react';
import { Home, Users, Gamepad2, Heart, ShoppingBag } from 'lucide-react';
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
    'groups', 'group-chat', 'weekly-report', 'feed', 'create-post'
];

/**
 * BottomNav — 하단 탭 네비게이션
 */
const BottomNav = ({ step, onNavigate }) => {
    // 특정 게임 하위 페이지들의 활성화 상태를 아케이드 탭에 매핑
    const isArcadeActive = [
        'arcade', 'apple-game', 'shisen-sho', 'game-2048', 'watermelon-game', 'tikatuka-game'
    ].includes(step);

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

            <Tooltip text="다양한 캐주얼 미니게임 오락실로 진입합니다.">
                <NavItem
                    active={isArcadeActive}
                    icon={<Gamepad2 size={22} />}
                    label="아케이드"
                    onClick={() => onNavigate('arcade')}
                />
            </Tooltip>

            <Tooltip text="소울펫을 돌보고 성장 리포트를 확인합니다.">
                <NavItem
                    active={step === 'soul-pet'}
                    icon={<Heart size={22} />}
                    label="소울펫"
                    onClick={() => onNavigate('soul-pet')}
                />
            </Tooltip>

            <Tooltip text="동네 소식과 모임에 참여합니다.">
                <NavItem
                    active={COMMUNITY_STEPS.includes(step)}
                    icon={<Users size={22} />}
                    label="커뮤니티"
                    onClick={() => onNavigate('community')}
                />
            </Tooltip>

            <Tooltip text="크리스탈로 펫 스킨과 유용한 아이템을 구매합니다.">
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
