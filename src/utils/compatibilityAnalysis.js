/**
 * 성향 일치도 세부 분석 유틸리티 (9지표 기반)
 * 사교성 / 창의성 / 공감력 / 계획성 / 자기주도 / 유연성 / 따뜻함 / 회복탄력 / 신뢰도
 */

export const analyzeCompatibility = (userA, userB) => {
    if (!userA || !userB || userA.length === 0 || userB.length === 0) {
        return null;
    }

    const dimensions = [
        { key: '사교성', icon: '🎉', weight: 1.3 },
        { key: '창의성', icon: '🎨', weight: 1.2 },
        { key: '공감력', icon: '🤝', weight: 1.4 },
        { key: '계획성', icon: '📋', weight: 1.0 },
        { key: '자기주도', icon: '🎯', weight: 1.1 },
        { key: '유연성', icon: '🌊', weight: 1.0 },
        { key: '따뜻함', icon: '💛', weight: 1.3 },
        { key: '회복탄력', icon: '😌', weight: 0.9 },
        { key: '신뢰도', icon: '💎', weight: 1.1 },
    ];

    const dimensionAnalysis = dimensions.map(dim => {
        const userAItem = userA.find(d => d.subject === dim.key);
        const userBItem = userB.find(d => d.subject === dim.key);

        if (!userAItem || !userBItem) return null;

        const userAScore = userAItem.A;
        const userBScore = userBItem.A;
        const difference = Math.abs(userAScore - userBScore);
        const similarity = 100 - difference;

        let level, color, label;
        if (similarity >= 85) {
            level = 'high'; color = '#10b981'; label = '강한 일치';
        } else if (similarity >= 65) {
            level = 'medium'; color = '#3b82f6'; label = '좋은 조화';
        } else if (similarity >= 45) {
            level = 'complementary'; color = '#f59e0b'; label = '보완 관계';
        } else {
            level = 'different'; color = '#ef4444'; label = '차이 존재';
        }

        return {
            dimension: dim.key,
            icon: dim.icon,
            weight: dim.weight,
            userAScore,
            userBScore,
            similarity: Math.round(similarity),
            difference: Math.round(difference),
            level,
            color,
            label,
            insight: generateInsight(dim.key, similarity)
        };
    }).filter(Boolean);

    const totalWeight = dimensionAnalysis.reduce((sum, d) => sum + d.weight, 0);
    const weightedScore = dimensionAnalysis.reduce((sum, d) => sum + (d.similarity * d.weight), 0) / totalWeight;

    const strengths = dimensionAnalysis.filter(d => d.level === 'high' || d.level === 'medium');
    const complementary = dimensionAnalysis.filter(d => d.level === 'complementary' || d.level === 'different');

    return {
        overallScore: Math.round(weightedScore),
        dimensions: dimensionAnalysis,
        strengths,
        complementary,
        advice: generateRelationshipAdvice(strengths, complementary)
    };
};

const generateInsight = (dimension, similarity) => {
    const insights = {
        '사교성': {
            high: '사교적 에너지가 비슷해 함께하면 즐거워요',
            medium: '활동 페이스를 맞추며 좋은 관계를 만들어갈 수 있어요',
            low: '한 분은 활발, 한 분은 조용한 편이에요. 서로의 에너지를 존중해요'
        },
        '창의성': {
            high: '새로운 경험과 창의적 활동을 함께 즐길 수 있어요',
            medium: '다양한 관심사를 공유하며 서로 자극을 줄 수 있어요',
            low: '한 분은 모험적, 한 분은 안정적인 성향이에요'
        },
        '공감력': {
            high: '서로 배려심이 깊고 공감 능력이 뛰어나요',
            medium: '따뜻한 마음으로 서로를 이해하려 노력해요',
            low: '감정 표현 방식에 차이가 있을 수 있어요. 대화로 풀어가세요'
        },
        '계획성': {
            high: '계획적이고 책임감 있는 관계를 만들어갈 수 있어요',
            medium: '서로의 페이스를 존중하며 균형을 맞출 수 있어요',
            low: '한 분은 계획적, 한 분은 즉흥적인 편이에요'
        },
        '자기주도': {
            high: '각자의 목표를 응원하며 함께 성장할 수 있어요',
            medium: '협업과 독립성을 균형 있게 나눌 수 있어요',
            low: '자기주도성의 차이를 이해하면 시너지가 생겨요'
        },
        '유연성': {
            high: '변화와 새로운 상황에 함께 적응하는 힘이 있어요',
            medium: '유연성과 안정성을 서로 보완할 수 있어요',
            low: '변화에 대한 견해 차이가 있을 수 있어요'
        },
        '따뜻함': {
            high: '서로에게 따뜻하고 정겨운 관계를 만들어갈 수 있어요',
            medium: '온기와 이성이 균형 잡힌 관계예요',
            low: '감정 표현 방식의 차이를 이해해주세요'
        },
        '회복탄력': {
            high: '정서적 안정감이 비슷해 갈등을 잘 회복할 수 있어요',
            medium: '스트레스 대처 방식을 서로 배울 수 있어요',
            low: '감정 기복의 차이를 이해하는 것이 중요해요'
        },
        '신뢰도': {
            high: '신뢰와 정직함을 바탕으로 깊은 관계를 맺어요',
            medium: '서로의 가치관을 존중하며 성장할 수 있어요',
            low: '가치관의 차이를 대화로 풀어가는 것이 좋아요'
        }
    };

    const level = similarity >= 75 ? 'high' : similarity >= 50 ? 'medium' : 'low';
    return insights[dimension]?.[level] || '서로의 차이를 이해하고 존중해요';
};

const generateRelationshipAdvice = (strengths, complementary) => {
    const advice = { commonGround: [], differences: [], activities: [] };

    if (strengths.some(s => s.dimension === '공감력')) advice.commonGround.push('깊은 공감과 배려로 따뜻한 관계를 만들 수 있어요');
    if (strengths.some(s => s.dimension === '창의성')) advice.commonGround.push('새로운 경험을 함께 탐험하며 성장할 수 있어요');
    if (strengths.some(s => s.dimension === '사교성')) advice.commonGround.push('활발한 대화와 사교 활동을 즐길 수 있어요');
    if (strengths.some(s => s.dimension === '신뢰도')) advice.commonGround.push('서로를 믿고 의지할 수 있는 신뢰 관계예요');

    if (complementary.some(c => c.dimension === '사교성')) advice.differences.push('에너지 충전 방식이 달라 서로의 공간을 존중해주세요');
    if (complementary.some(c => c.dimension === '계획성')) advice.differences.push('계획성과 즉흥성의 균형을 맞춰보세요');
    if (complementary.some(c => c.dimension === '회복탄력')) advice.differences.push('감정 표현 방식의 차이를 이해해주세요');

    const hasHighCreativity = strengths.some(s => s.dimension === '창의성' && s.level === 'high');
    const hasHighEmpathy = strengths.some(s => s.dimension === '공감력' && s.level === 'high');
    const hasHighSocial = strengths.some(s => s.dimension === '사교성' && s.level === 'high');

    if (hasHighCreativity && hasHighEmpathy) {
        advice.activities.push('예술 전시회', '독립 영화 감상', '철학 카페');
    } else if (hasHighSocial) {
        advice.activities.push('페스티벌', '파티', '그룹 활동');
    } else {
        advice.activities.push('조용한 카페', '산책', '독서 모임');
    }

    return advice;
};

export const getCompatibilityGrade = (score) => {
    if (score >= 90) return { label: '완벽한 궁합', emoji: '💚', color: '#10b981' };
    if (score >= 80) return { label: '매우 좋은 궁합', emoji: '💙', color: '#3b82f6' };
    if (score >= 70) return { label: '좋은 궁합', emoji: '💜', color: '#8b5cf6' };
    if (score >= 60) return { label: '괜찮은 궁합', emoji: '🧡', color: '#f59e0b' };
    return { label: '보완 관계', emoji: '🤍', color: '#64748b' };
};
