import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LumiMascot = ({ mbti, personalityData, size = 150 }) => {
    const [hasP5, setHasP5] = useState(false);
    const renderRef = useRef();

    // p5.js가 있으면 사용, 없으면 CSS 기반 폴백
    useEffect(() => {
        let myP5;
        const tryP5 = async () => {
            try {
                const p5Module = await import('p5');
                const { getMascotSketch } = await import('../utils/mascotAlgorithm');
                const p5 = p5Module.default;
                const sketch = getMascotSketch(size, personalityData);
                if (renderRef.current) {
                    myP5 = new p5(sketch, renderRef.current);
                    setHasP5(true);
                }
            } catch (err) {
                console.log('p5.js not available, using fallback mascot');
                setHasP5(false);
            }
        };
        tryP5();
        return () => { if (myP5) myP5.remove(); };
    }, [mbti, personalityData, size]);

    // MBTI별 이모지와 그라디언트 색상
    const mbtiTheme = {
        ENFP: { emoji: '🎨', gradient: 'linear-gradient(135deg, #a78bfa, #f472b6)' },
        INTJ: { emoji: '♟️', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
        ISFJ: { emoji: '🛡️', gradient: 'linear-gradient(135deg, #10b981, #3b82f6)' },
        ENTP: { emoji: '💡', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
        INFP: { emoji: '🦋', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
        ESTJ: { emoji: '📋', gradient: 'linear-gradient(135deg, #059669, #0891b2)' },
        ENFJ: { emoji: '🌟', gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
        INTP: { emoji: '🔬', gradient: 'linear-gradient(135deg, #6366f1, #a855f7)' },
        ESFP: { emoji: '🎭', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
        ISFP: { emoji: '🎨', gradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)' },
        ISTJ: { emoji: '📚', gradient: 'linear-gradient(135deg, #4b5563, #6b7280)' },
        ISTP: { emoji: '🔧', gradient: 'linear-gradient(135deg, #78716c, #a8a29e)' },
        ESFJ: { emoji: '🤝', gradient: 'linear-gradient(135deg, #f97316, #84cc16)' },
        ESTP: { emoji: '🚀', gradient: 'linear-gradient(135deg, #ef4444, #f97316)' },
        ENTJ: { emoji: '👑', gradient: 'linear-gradient(135deg, #7c3aed, #2563eb)' },
        INFJ: { emoji: '🌙', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
    };

    const theme = mbtiTheme[mbti] || { emoji: '✨', gradient: 'linear-gradient(135deg, #a78bfa, #f472b6)' };

    // p5 성공 시 p5 렌더 div 사용
    if (hasP5) {
        return (
            <div
                ref={renderRef}
                style={{ width: size, height: size, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                className="mascot-container"
            />
        );
    }

    // 폴백: 예쁜 CSS 기반 아바타
    return (
        <motion.div
            ref={renderRef}
            animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: theme.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}
            className="mascot-container"
        >
            {/* Inner glow */}
            <div style={{
                position: 'absolute', inset: '8%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(4px)'
            }} />
            <span style={{
                fontSize: size * 0.35,
                zIndex: 1,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}>
                {theme.emoji}
            </span>
        </motion.div>
    );
};

export default LumiMascot;
