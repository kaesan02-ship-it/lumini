import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { INTEREST_TAGS } from '../data/mockData';

const InterestTagsSelector = ({ selectedTags, onTagsChange, onComplete }) => {
    const MAX_TAGS = 10;

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag));
        } else if (selectedTags.length < MAX_TAGS) {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const progress = (selectedTags.length / MAX_TAGS) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 20px'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '15px' }}>
                    관심사를 선택하세요 🎯
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                    최대 {MAX_TAGS}개까지 선택 가능합니다
                </p>
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{
                        height: '8px',
                        background: 'var(--glass-border)',
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {selectedTags.length}/{MAX_TAGS} 선택됨
                    </p>
                </div>
            </div>

            {Object.entries(INTEREST_TAGS).map(([key, category]) => (
                <div key={key} style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {category.label}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {category.tags.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            const isDisabled = !isSelected && selectedTags.length >= MAX_TAGS;

                            return (
                                <motion.button
                                    key={tag}
                                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                    onClick={() => !isDisabled && toggleTag(tag)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '20px',
                                        border: isSelected ? 'none' : '2px solid var(--glass-border)',
                                        background: isSelected
                                            ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                                            : isDisabled
                                                ? 'var(--glass-border)'
                                                : 'var(--surface)',
                                        color: isSelected ? 'white' : isDisabled ? 'var(--text-muted)' : 'var(--text)',
                                        fontWeight: isSelected ? 700 : 600,
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        opacity: isDisabled ? 0.5 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tag}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                    className="primary"
                    onClick={onComplete}
                    disabled={selectedTags.length === 0}
                    style={{
                        padding: '15px 60px',
                        fontSize: '1.1rem',
                        opacity: selectedTags.length === 0 ? 0.5 : 1,
                        cursor: selectedTags.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    완료
                </button>
            </div>
        </motion.div>
    );
};

export default React.memo(InterestTagsSelector);
