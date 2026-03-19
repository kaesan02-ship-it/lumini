import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Tooltip from '../Tooltip';

const DeepSoulBanner = ({ hasDeepSoul, onNavigate }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate && onNavigate(hasDeepSoul ? 'deep-soul-result' : 'deep-soul-test')}
            className={`deep-soul-banner ${hasDeepSoul ? 'active' : 'inactive'}`}
        >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{hasDeepSoul ? '💎' : '✨'}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '4px' }}>
                    {hasDeepSoul ? '딥 소울 매칭 활성화됨' : '딥 소울 매칭 시작하기'}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.5 }}>
                    {hasDeepSoul
                        ? '가족관·연애관·가치관 기반 정밀 매칭 중 💜'
                        : '가족관·연애 스타일·가치관까지 맞는 사람을 찾아드릴게요'}
                </div>
            </div>
            <ChevronRight size={20} style={{ opacity: 0.7, flexShrink: 0 }} />
            <Tooltip text={hasDeepSoul ? "딥 소울 매칭 결과를 확인합니다." : "가치관 기반 정밀 매칭을 위해 검사를 시작합니다."} position="bottom" />
        </motion.div>
    );
};

export default DeepSoulBanner;
