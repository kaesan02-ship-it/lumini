import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, text, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
        bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
        left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
        right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' },
    };

    return (
        <div 
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, ...positions[position] }}
                        animate={{ opacity: 1, scale: 1, ...positions[position] }}
                        exit={{ opacity: 0, scale: 0.8, ...positions[position] }}
                        style={{
                            position: 'absolute',
                            zIndex: 1000,
                            padding: '6px 12px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            backdropFilter: 'blur(4px)',
                            ...positions[position]
                        }}
                    >
                        {text}
                        {/* 화살표 */}
                        <div style={{
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            ...(position === 'top' && { borderTop: '5px solid rgba(15, 23, 42, 0.9)', bottom: '-5px', left: '50%', transform: 'translateX(-50%)' }),
                            ...(position === 'bottom' && { borderBottom: '5px solid rgba(15, 23, 42, 0.9)', top: '-5px', left: '50%', transform: 'translateX(-50%)' }),
                            ...(position === 'left' && { borderLeft: '5px solid rgba(15, 23, 42, 0.9)', right: '-5px', top: '50%', transform: 'translateY(-50%) rotate(90deg)' }),
                            ...(position === 'right' && { borderRight: '5px solid rgba(15, 23, 42, 0.9)', left: '-5px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }),
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
