import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap } from 'lucide-react';
import Tooltip from '../Tooltip';

const QuickActionsGrid = ({ onNavigate, completedChallenges, streak, showValueGame = true }) => {
    return (
        <div className="quick-actions-grid">
            <Tooltip text="중독성 강한 숫자 퍼즐 게임!" style={{ display: 'block', width: '100%' }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate('apple-game')}
                    className="action-card apple"
                >
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>역대급 중독성 🔥</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🍎 사과 게임
                        </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>드래그 10 만들기 🏆</div>
                </motion.div>
            </Tooltip>

            <Tooltip text="동물 짝을 2번 꺾임 선 이내로 맞추는 스피드 퍼즐!" style={{ display: 'block', width: '100%' }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate('shisen-sho')}
                    className="action-card sacheonseong"
                >
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>타임어택 경쟁 ⏱️</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🐾 사천성 게임
                        </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>루미니 짝 맞추기 🏆</div>
                </motion.div>
            </Tooltip>

            <Tooltip text="슬라이딩하여 소울펫을 합쳐 진화시키세요!" style={{ display: 'block', width: '100%' }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate('game-2048')}
                    className="action-card game2048"
                >
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>진화의 끝은? 👑</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🥚 2048 진화
                        </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>소울펫 진화 합성 🏆</div>
                </motion.div>
            </Tooltip>
            
            <Tooltip text="매일 주어지는 미션을 완료하고 크리스탈을 받으세요." style={{ display: 'block', width: '100%' }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate && onNavigate('daily-challenges')}
                    className="action-card challenge"
                >
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>오늘의 챌린지</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Target size={16} /> {completedChallenges}/3
                        </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>🔥 {streak}일 연속</div>
                </motion.div>
            </Tooltip>

            {showValueGame && (
                <Tooltip text="나의 핵심 가치관을 선택하고 더 잘 맞는 인연을 추천받으세요." style={{ display: 'block', width: '100%' }}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onNavigate && onNavigate('value-game')}
                        className="action-card value"
                    >
                        <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>가치관 밸런스</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Zap size={16} /> 시작하기
                            </div>
                        </div>
                        <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>매칭 확률 UP 🚀</div>
                        <motion.div
                            animate={{ x: [0, 100], opacity: [0, 0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '100%', background: 'white', filter: 'blur(10px)', skewX: '-20deg' }}
                        />
                    </motion.div>
                </Tooltip>
            )}
        </div>
    );
};

export default QuickActionsGrid;
