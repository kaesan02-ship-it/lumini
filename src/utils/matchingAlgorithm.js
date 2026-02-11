// Cosine Similarity 기반 매칭 알고리즘

/**
 * 두 벡터 간의 Cosine Similarity 계산
 * @param {Array<number>} vecA - 첫 번째 벡터
 * @param {Array<number>} vecB - 두 번째 벡터
 * @returns {number} - 0~1 사이의 유사도 (1에 가까울수록 유사)
 */
export const cosineSimilarity = (vecA, vecB) => {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    // 내적 (dot product)
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

    // 벡터 크기 (magnitude)
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    // 0으로 나누기 방지
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Big5 성격 요인에 가중치 적용
 * @param {Object} personalityData - 성격 데이터 (subject, A 포함)
 * @returns {Array<number>} - 가중치가 적용된 벡터
 */
export const applyWeights = (personalityData) => {
    // 가중치 설정 (중요도에 따라)
    const weights = {
        '개방성': 1.2,      // 가치관과 관심사에 중요
        '성실성': 1.0,      // 신뢰성
        '외향성': 1.3,      // 소통 스타일에 매우 중요
        '우호성': 1.4,      // 관계 형성에 가장 중요
        '신경증': 0.8,      // 상대적으로 덜 중요
        '정직성': 1.1       // 신뢰 관계에 중요
    };

    return personalityData.map(item => {
        const weight = weights[item.subject] || 1.0;
        return item.A * weight;
    });
};

/**
 * Bias 제거 및 정규화
 * @param {Array<number>} vector - 입력 벡터
 * @returns {Array<number>} - 정규화된 벡터
 */
export const removeBias = (vector) => {
    // 평균 제거 (mean centering)
    const mean = vector.reduce((sum, val) => sum + val, 0) / vector.length;
    const centered = vector.map(val => val - mean);

    // Min-Max 정규화 (0~1 범위로)
    const min = Math.min(...centered);
    const max = Math.max(...centered);
    const range = max - min;

    if (range === 0) {
        return centered.map(() => 0.5); // 모든 값이 같으면 중간값
    }

    return centered.map(val => (val - min) / range);
};

/**
 * 두 사용자 간의 매칭 점수 계산
 * @param {Array<Object>} userA - 사용자 A의 성격 데이터
 * @param {Array<Object>} userB - 사용자 B의 성격 데이터
 * @param {Object} options - 옵션 (useWeights, removeBiasFlag)
 * @returns {number} - 0~100 사이의 매칭 점수
 */
export const calculateMatchingScore = (userA, userB, options = {}) => {
    const { useWeights = true, removeBiasFlag = true } = options;

    // 가중치 적용
    let vecA = userA.map(item => item.A);
    let vecB = userB.map(item => item.A);

    if (useWeights) {
        vecA = applyWeights(userA);
        vecB = applyWeights(userB);
    }

    // Bias 제거
    if (removeBiasFlag) {
        vecA = removeBias(vecA);
        vecB = removeBias(vecB);
    }

    // Cosine Similarity 계산
    const similarity = cosineSimilarity(vecA, vecB);

    // 0~100 범위로 변환
    return Math.round(similarity * 100);
};

/**
 * 사용자 목록을 매칭 점수 순으로 정렬
 * @param {Array<Object>} users - 사용자 목록
 * @param {Array<Object>} currentUserData - 현재 사용자의 성격 데이터
 * @returns {Array<Object>} - 매칭 점수가 추가된 정렬된 사용자 목록
 */
export const sortUsersByMatchingScore = (users, currentUserData) => {
    return users
        .map(user => ({
            ...user,
            similarity: calculateMatchingScore(currentUserData, user.data)
        }))
        .sort((a, b) => b.similarity - a.similarity);
};

/**
 * 매칭 점수에 따른 등급 반환
 * @param {number} score - 매칭 점수 (0~100)
 * @returns {Object} - 등급 정보 (label, color, emoji)
 */
export const getMatchingGrade = (score) => {
    if (score >= 90) {
        return { label: '완벽한 궁합', color: '#10b981', emoji: '💚' };
    } else if (score >= 80) {
        return { label: '매우 좋은 궁합', color: '#3b82f6', emoji: '💙' };
    } else if (score >= 70) {
        return { label: '좋은 궁합', color: '#8b5cf6', emoji: '💜' };
    } else if (score >= 60) {
        return { label: '괜찮은 궁합', color: '#f59e0b', emoji: '🧡' };
    } else {
        return { label: '보통 궁합', color: '#64748b', emoji: '🤍' };
    }
};
