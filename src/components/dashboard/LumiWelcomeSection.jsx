import React from 'react';
import Tooltip from '../Tooltip';
import LumiMascot from '../LumiMascot';

const LumiWelcomeSection = ({ userName, userData }) => {
    return (
        <div className="welcome-card">
            <Tooltip text="루미니의 마스코트 루미가 당신을 반겨줍니다! 🦦">
                <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                    <LumiMascot size={80} personalityData={userData} />
                </div>
            </Tooltip>
            <div className="welcome-bubble">
                {userName}님, 반가워요! 🦦<br />
                오늘 루미니에서 <span style={{ color: '#7c3aed' }}>운명의 소울메이트</span>를 만날 확률이 무척 높아요!
            </div>
        </div>
    );
};

export default LumiWelcomeSection;
