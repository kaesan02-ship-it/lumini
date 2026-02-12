/**
 * 성향 일치도 세부 분석 유틸리티
 * MBTI + OCEAN + HEXACO 기반 차원별 호환성 분석
 */

/**
 * 두 사용자 간의 차원별 호환성 분석
 * @param {Array<Object>} userA - 사용자 A의 성격 데이터
 * @param {Array<Object>} userB - 사용자 B의 성격 데이터
 * @returns {Object} - 차원별 분석 결과 및 인사이트
 */
export const analyzeCompatibility = (userA, userB) => {
    if (!userA || !userB || userA.length === 0 || userB.length === 0) {
        return null;
    }

    const dimensions = [
        { key: '개방성', icon: '🎨', weight: 1.2 },
        { key: '성실성', icon: '📋', weight: 1.0 },
        { key: '외향성', icon: '🎉', weight: 1.3 },
        { key: '우호성', icon: '🤝', weight: 1.4 },
        { key: '신경증', icon: '😌', weight: 0.8 },
        { key: '정직성', icon: '💎', weight: 1.1 }
    ];

    const dimensionAnalysis = dimensions.map(dim => {
        const userAItem = userA.find(d => d.subject === dim.key);
        const userBItem = userB.find(d => d.subject === dim.key);

        if (!userAItem || !userBItem) {
            return null;
        }

        const userAScore = userAItem.A;
        const userBScore = userBItem.A;
        const difference = Math.abs(userAScore - userBScore);
        const similarity = 100 - difference;

        // 호환성 레벨 결정
        let level, color, label;
        if (similarity >= 85) {
            level = 'high';
            color = '#10b981';
            label = '강한 일치';
        } else if (similarity >= 65) {
            level = 'medium';
            color = '#3b82f6';
            label = '좋은 조화';
        } else if (similarity >= 45) {
            level = 'complementary';
            color = '#f59e0b';
            label = '보완 관계';
        } else {
            level = 'different';
            color = '#ef4444';
            label = '차이 존재';
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
            insight: generateInsight(dim.key, similarity, userAScore, userBScore)
        };
    }).filter(Boolean);

    // 전체 가중 평균 계산
    const totalWeight = dimensionAnalysis.reduce((sum, d) => sum + d.weight, 0);
    const weightedScore = dimensionAnalysis.reduce((sum, d) => sum + (d.similarity * d.weight), 0) / totalWeight;

    // 강점과 보완점 분류
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

/**
 * 차원별 인사이트 생성
 */
const generateInsight = (dimension, similarity) => {
    const insights = {
        '개방성': {
            high: '새로운 경험과 창의적 활동을 함께 즐길 수 있어요',
            medium: '다양한 관심사를 공유하며 서로 자극을 줄 수 있어요',
            low: '한 분은 모험적, 한 분은 안정적인 성향이에요'
        },
        '성실성': {
            high: '계획적이고 책임감 있는 관계를 만들어갈 수 있어요',
            medium: '서로의 페이스를 존중하며 균형을 맞출 수 있어요',
            low: '한 분은 계획적, 한 분은 즉흥적인 편이에요'
        },
        '외향성': {
            high: '사교 활동과 대화를 함께 즐기며 에너지를 얻어요',
            medium: '사회적 활동과 조용한 시간의 균형이 좋아요',
            low: '한 분은 사교적, 한 분은 조용한 편이에요'
        },
        '우호성': {
            high: '서로 배려심이 깊고 공감 능력이 뛰어나요',
            medium: '따뜻한 마음으로 서로를 이해하려 노력해요',
            low: '감정 표현 방식에 차이가 있을 수 있어요'
        },
        '신경증': {
            high: '감정적 안정성이 비슷해 서로 이해하기 쉬워요',
            medium: '스트레스 대처 방식을 배울 수 있어요',
            low: '감정 기복의 차이를 이해하는 것이 중요해요'
        },
        '정직성': {
            high: '신뢰와 정직함을 바탕으로 깊은 관계를 맺어요',
            medium: '서로의 가치관을 존중하며 성장할 수 있어요',
            low: '가치관의 차이를 대화로 풀어가는 것이 좋아요'
        }
    };

    const level = similarity >= 75 ? 'high' : similarity >= 50 ? 'medium' : 'low';
    return insights[dimension]?.[level] || '서로의 차이를 이해하고 존중해요';
};

/**
 * 관계 조언 생성
 */
const generateRelationshipAdvice = (strengths, complementary) => {
    const advice = {
        commonGround: [],
        differences: [],
        activities: []
    };

    // 공통점 분석
    if (strengths.some(s => s.dimension === '우호성')) {
        advice.commonGround.push('깊은 공감과 배려로 따뜻한 관계를 만들 수 있어요');
    }
    if (strengths.some(s => s.dimension === '개방성')) {
        advice.commonGround.push('새로운 경험을 함께 탐험하며 성장할 수 있어요');
    }
    if (strengths.some(s => s.dimension === '외향성')) {
        advice.commonGround.push('활발한 대화와 사교 활동을 즐길 수 있어요');
    }

    // 차이점 조언
    if (complementary.some(c => c.dimension === '외향성')) {
        advice.differences.push('에너지 충전 방식이 달라 서로의 공간을 존중해주세요');
    }
    if (complementary.some(c => c.dimension === '성실성')) {
        advice.differences.push('계획성과 즉흥성의 균형을 맞춰보세요');
    }
    if (complementary.some(c => c.dimension === '신경증')) {
        advice.differences.push('감정 표현 방식의 차이를 이해해주세요');
    }

    // 활동 추천
    const hasHighOpenness = strengths.some(s => s.dimension === '개방성' && s.level === 'high');
    const hasHighAgreeableness = strengths.some(s => s.dimension === '우호성' && s.level === 'high');
    const hasHighExtraversion = strengths.some(s => s.dimension === '외향성' && s.level === 'high');

    if (hasHighOpenness && hasHighAgreeableness) {
        advice.activities.push('예술 전시회', '독립 영화 감상', '철학 카페');
    } else if (hasHighExtraversion) {
        advice.activities.push('페스티벌', '파티', '그룹 활동');
    } else {
        advice.activities.push('조용한 카페', '산책', '독서 모임');
    }

    return advice;
};

/**
 * 호환성 등급 가져오기
 */
export const getCompatibilityGrade = (score) => {
    if (score >= 90) {
        return { label: '완벽한 궁합', emoji: '💚', color: '#10b981' };
    } else if (score >= 80) {
        return { label: '매우 좋은 궁합', emoji: '💙', color: '#3b82f6' };
    } else if (score >= 70) {
        return { label: '좋은 궁합', emoji: '💜', color: '#8b5cf6' };
    } else if (score >= 60) {
        return { label: '괜찮은 궁합', emoji: '🧡', color: '#f59e0b' };
    } else {
        return { label: '보완 관계', emoji: '🤍', color: '#64748b' };
    }
};
