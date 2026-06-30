import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Gamepad2 } from 'lucide-react';
import Tooltip from '../Tooltip';

const QuickActionsGrid = ({ onNavigate, completedChallenges, streak, showValueGame = true }) => {
    return (
        <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
            <Tooltip text="재미있는 캐주얼 미니게임 오락실로 즉시 이동합니다." style={{ display: 'block', width: '100%' }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate('arcade')}
                    className="action-card tikatuka"
                    style={{ background: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)', border: '1px solid #fda4af', color: '#e11d48', position: 'relative', overflow: 'hidden' }}
                >
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px', color: '#be123c' }}>캐주얼 미니게임 존 🎮</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Gamepad2 size={20} /> 루미 아케이드
                        </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9, color: '#9f1239' }}>💎 크리스탈 획득처 🏆</div>
                    <motion.div
                        animate={{ x: [0, 200], opacity: [0, 0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '100%', background: 'white', filter: 'blur(10px)', skewX: '-20deg' }}
                    />
                </motion.div>
            </Tooltip>
            
            <Tooltip text="매일 주어지는 미션을 완료하고 크리스탈을 받으세요." style={{ display: 'block', width: '100%' }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate('daily-challenges')}
                    className="action-card challenge"
                    style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '1px solid #86efac', color: '#16a34a' }}
                >
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px', color: '#15803d' }}>오늘의 미션</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Target size={18} /> 일일 챌린지
                        </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9, color: '#166534' }}>{completedChallenges}/3 완료 (🔥 {streak}일 연속)</div>
                </motion.div>
            </Tooltip>

            {showValueGame && (
                <Tooltip text="나의 핵심 가치관을 선택하고 더 잘 맞는 인연을 추천받으세요." style={{ display: 'block', width: '100%' }}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate && onNavigate('value-game')}
                        className="action-card value"
                        style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '1px solid #7dd3fc', color: '#0284c7' }}
                    >
                        <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px', color: '#0369a1' }}>성향 분석</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={18} /> 가치관 밸런스
                            </div>
                        </div>
                        <div style={{ fontSize: '0.68rem', opacity: 0.9, color: '#075985' }}>매칭 확률 UP 🚀</div>
                    </motion.div>
                </Tooltip>
            )}
        </div>
    );
};

export default QuickActionsGrid;
