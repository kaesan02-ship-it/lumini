import React from 'react';
import { motion } from 'framer-motion';
import {
    Gamepad2, ShieldCheck, Sparkles,
    Trophy, Heart, Zap, Star
} from 'lucide-react';

/**
 * 루미니 프리미엄 배지 타입 정의
 */
const BADGE_TYPES = {
    VERIFIED: {
        icon: ShieldCheck,
        label: 'Soul Verified',
        colors: { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', glow: '#0EA5E9' }
    },
    MBTI: {
        icon: Heart,
        label: '', // 동적 라벨 사용
        colors: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', glow: '#8B5CF6' }
    },
    GAME: {
        icon: Gamepad2,
        label: '', // 동적 라벨 사용
        colors: { bg: '#F0FDF4', text: '#15803D', border: '#DCFCE7', glow: '#22C55E' }
    },
    TIER: {
        icon: Trophy,
        label: '', // 동적 라벨 사용
        colors: { bg: '#FFFBEB', text: '#B45309', border: '#FEF3C7', glow: '#F59E0B' }
    },
    HOT: {
        icon: Zap,
        label: '인기 소울',
        colors: { bg: '#FFF1F2', text: '#BE123C', border: '#FFE4E6', glow: '#F43F5E' }
    },
    NEW: {
        icon: Sparkles,
        label: '뉴페이스',
        colors: { bg: '#ECFDF5', text: '#047857', border: '#D1FAE5', glow: '#10B981' }
    }
};

const IdentityBadge = ({ type, label, size = 'md' }) => {
    const config = BADGE_TYPES[type] || BADGE_TYPES.NEW;
    const Icon = config.icon;
    const displayLabel = label || config.label;

    const sizeStyles = {
        sm: { padding: '4px 10px', fontSize: '0.65rem', iconSize: 12, borderRadius: '8px' },
        md: { padding: '6px 14px', fontSize: '0.75rem', iconSize: 15, borderRadius: '12px' },
        lg: { padding: '8px 18px', fontSize: '0.85rem', iconSize: 18, borderRadius: '16px' }
    };

    const style = sizeStyles[size];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: config.colors.bg,
                color: config.colors.text,
                padding: style.padding,
                fontSize: style.fontSize,
                fontWeight: 900,
                borderRadius: style.borderRadius,
                border: `1.5px solid ${config.colors.border}`,
                boxShadow: `0 4px 12px ${config.colors.glow}15`,
                cursor: 'default',
                whiteSpace: 'nowrap',
                userSelect: 'none'
            }}
        >
            <Icon size={style.iconSize} style={{ opacity: 0.9 }} />
            <span style={{ letterSpacing: '-0.02em' }}>{displayLabel}</span>
        </motion.div>
    );
};

export default IdentityBadge;
