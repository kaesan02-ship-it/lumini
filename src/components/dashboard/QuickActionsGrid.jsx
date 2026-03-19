import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap } from 'lucide-react';
import Tooltip from '../Tooltip';

const QuickActionsGrid = ({ onNavigate, completedChallenges, streak, showValueGame = true }) => {
    return (
        <div className="quick-actions-grid">
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => onNavigate && onNavigate('apple-game')}
                className="action-card apple"
            >
                <Tooltip text="중독성 강한 숫자 퍼즐 게임!">
                    <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>역대급 중독성 🔥</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🍎 사과 게임
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '0.72rem', opacity: 0.9 }}>드래그로 10 만들기! 🏆</div>
                </Tooltip>
            </motion.div>
            
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => onNavigate && onNavigate('daily-challenges')}
                className="action-card challenge"
            >
                <Tooltip text="매일 주어지는 미션을 완료하고 크리스탈을 받으세요.">
                    <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>오늘의 챌린지</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={20} /> {completedChallenges}/3
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '0.72rem', opacity: 0.9 }}>🔥 {streak}일 연속</div>
                </Tooltip>
            </motion.div>

            {showValueGame && (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate('value-game')}
                    className="action-card value"
                >
                    <Tooltip text="나의 핵심 가치관을 선택하고 더 잘 맞는 인연을 추천받으세요.">
                        <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>가치관 밸런스</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={20} /> 시작하기
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '0.72rem', opacity: 0.9 }}>
                            매칭 확률 UP 🚀
                        </div>
                    </Tooltip>
                    <motion.div
                        animate={{ x: [0, 100], opacity: [0, 0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '100%', background: 'white', filter: 'blur(10px)', skewX: '-20deg' }}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default QuickActionsGrid;
