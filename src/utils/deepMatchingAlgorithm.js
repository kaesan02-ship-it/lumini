/**
 * 루미니 딥 소울 매칭 알고리즘
 * 가치관 유사도 계산 (카테고리 가중치 적용)
 */
import { DEEP_CATEGORIES } from '../data/deepQuestions';

/**
 * 두 딥 소울 결과 간의 카테고리별 유사도 계산
 * 각 문항: 0(low)~4(high) 5점 척도, 정규화 후 비교
 */
export const calcDeepCompatibility = (deepA, deepB) => {
    if (!deepA || !deepB) return null;

    const categoryResults = DEEP_CATEGORIES.map(cat => {
        const keysA = Object.keys(deepA).filter(k => deepA[k] !== undefined && k.startsWith(cat.id[0]));
        const keysB = Object.keys(deepB).filter(k => deepB[k] !== undefined && k.startsWith(cat.id[0]));
        const commonKeys = keysA.filter(k => keysB.includes(k));

        if (commonKeys.length === 0) return { category: cat.id, similarity: 70, label: cat.label, emoji: cat.emoji, color: cat.color };

        // 각 문항 차이의 합계 → 유사도로 변환
        const totalDiff = commonKeys.reduce((acc, key) => {
            return acc + Math.abs((deepA[key] || 2) - (deepB[key] || 2));
        }, 0);

        const maxDiff = commonKeys.length * 4; // 최대 차이 (0과 4 사이)
        const similarity = Math.round(100 - (totalDiff / maxDiff) * 100);

        return {
            category: cat.id,
            label: cat.label,
            emoji: cat.emoji,
            color: cat.color,
            similarity,
            weight: cat.weight,
            matchLevel: similarity >= 80 ? 'high' : similarity >= 60 ? 'medium' : 'low',
        };
    });

    // 가중 평균 종합 점수
    const totalWeight = categoryResults.reduce((s, r) => s + (r.weight || 0.25), 0);
    const weightedScore = categoryResults.reduce((s, r) => s + r.similarity * (r.weight || 0.25), 0) / totalWeight;

    return {
        overallScore: Math.round(weightedScore),
        categories: categoryResults,
        highlights: getCompatibilityHighlights(categoryResults),
    };
};

/**
 * 최종 매칭 점수 = 딥 가치관 70% + 기본 9지표 30%
 */
export const calcCombinedMatchScore = (basicSimilarity, deepCompatScore) => {
    if (deepCompatScore == null) return basicSimilarity;
    return Math.round(basicSimilarity * 0.3 + deepCompatScore * 0.7);
};

const getCompatibilityHighlights = (categoryResults) => {
    const sorted = [...categoryResults].sort((a, b) => b.similarity - a.similarity);
    return {
        bestMatch: sorted[0],
        worstMatch: sorted[sorted.length - 1],
        topMatches: sorted.filter(r => r.similarity >= 80),
        needsWork: sorted.filter(r => r.similarity < 60),
    };
};

/**
 * 딥 소울 점수 등급
 */
export const getDeepGrade = (score) => {
    if (score >= 90) return { label: '소울메이트', emoji: '✨', color: '#8B5CF6', desc: '가치관이 거의 완벽하게 일치해요!' };
    if (score >= 80) return { label: '딥 소울', emoji: '💜', color: '#EC4899', desc: '깊은 가치관이 서로 통해요' };
    if (score >= 70) return { label: '공명 소울', emoji: '💙', color: '#3B82F6', desc: '중요한 것들을 함께 나눌 수 있어요' };
    if (score >= 60) return { label: '탐색 소울', emoji: '💛', color: '#F59E0B', desc: '서로 알아가며 맞춰볼 수 있어요' };
    return { label: '보완 소울', emoji: '🤍', color: '#64748B', desc: '서로의 다름에서 배울 수 있어요' };
};

/**
 * 모의 딥 소울 데이터 생성 (mock users용)
 */
export const generateMockDeepData = (seed = 0) => {
    const categories = ['r', 'l', 'f', 'v'];
    const counts = { r: 8, l: 8, f: 8, v: 7 };
    const result = {};
    categories.forEach(cat => {
        for (let i = 1; i <= counts[cat]; i++) {
            const key = `${cat}${i}`;
            result[key] = Math.min(4, Math.max(0, Math.round(2 + Math.sin(seed * i + i) * 1.5)));
        }
    });
    return result;
};
