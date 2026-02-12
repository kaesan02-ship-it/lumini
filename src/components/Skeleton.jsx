import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '', style = {} }) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`skeleton-loader ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: 'linear-gradient(90deg, var(--glass-light) 25%, var(--glass-border) 50%, var(--glass-light) 75%)',
                backgroundSize: '200% 100%',
                ...style
            }}
        />
    );
};

export const CardSkeleton = () => (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Skeleton width="64px" height="64px" borderRadius="22px" />
            <div style={{ flex: 1 }}>
                <Skeleton width="40%" height="24px" style={{ marginBottom: '8px' }} />
                <Skeleton width="60%" height="16px" />
            </div>
        </div>
    </div>
);

export const ChartSkeleton = () => (
    <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <Skeleton width="220px" height="220px" borderRadius="50%" />
        <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="60px" height="12px" />
            <Skeleton width="60px" height="12px" />
            <Skeleton width="60px" height="12px" />
        </div>
    </div>
);

export default Skeleton;
