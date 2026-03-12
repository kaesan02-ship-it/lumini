import React from 'react';
import { motion } from 'framer-motion';

/**
 * 루미니 프리미엄 공용 배지 컴포넌트
 */
const Badge = ({ 
    children, 
    variant = 'default', 
    size = 'md', 
    className = '',
    pulse = false,
    icon: Icon
}) => {
    const variants = {
        default: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
        primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
        success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        danger: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    };

    const sizes = {
        xs: 'px-2 py-0.5 text-[9px]',
        sm: 'px-2.5 py-1 text-[10px]',
        md: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2 text-sm',
    };

    const selectedVariant = variants[variant] || variants.default;
    const selectedSize = sizes[size] || sizes.md;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                inline-flex items-center gap-1.5 font-black uppercase tracking-wider 
                border rounded-xl transition-all
                ${selectedVariant.bg} ${selectedVariant.text} ${selectedVariant.border}
                ${selectedSize}
                ${className}
            `}
        >
            {pulse && (
                <span className={`flex w-1.5 h-1.5 rounded-full ${selectedVariant.text.replace('text-', 'bg-')} animate-pulse mr-0.5`} />
            )}
            {Icon && <Icon size={size === 'xs' ? 10 : 12} />}
            {children}
        </motion.div>
    );
};

export default Badge;
