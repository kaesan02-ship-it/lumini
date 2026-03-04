/**
 * 딥 소울 유형 분류 시스템
 * 각 카테고리별 avg 점수(0~100)를 유형 레이블로 변환합니다.
 * avg = 0: 완전 low 성향, avg = 100: 완전 high 성향
 * 35 ~ 65: 중립/유연형
 */

export const DEEP_SOUL_TYPES = {
    relationship: {
        high: { label: '밀착 연애형', desc: '수시로 연락하고 함께하는 시간을 중시해요. 정서적 연결이 중요해요.', emoji: '🤗', badge: 'FC346B' },
        neutral: { label: '균형 연애형', desc: '상황에 따라 유연하게 맞춰가며 연애해요.', emoji: '⚖️', badge: 'A855F7' },
        low: { label: '독립 연애형', desc: '각자의 공간과 시간을 존중하며 성숙하게 연애해요.', emoji: '🦋', badge: '6366F1' },
    },
    lifestyle: {
        high: { label: '계획형 라이프', desc: '건강·운동·일정을 꼼꼼히 계획하며 사는 스타일이에요.', emoji: '📋', badge: '10B981' },
        neutral: { label: '유연형 라이프', desc: '계획과 즉흥 사이 적절히 균형을 맞추며 살아요.', emoji: '🌿', badge: '34D399' },
        low: { label: '자유형 라이프', desc: '즉흥적이고 자유로운 생활을 즐기는 스타일이에요.', emoji: '🌊', badge: '06B6D4' },
    },
    family: {
        high: { label: '전통 가족형', desc: '결혼·자녀·가족 간 유대를 삶의 중심으로 여겨요.', emoji: '🏠', badge: 'F59E0B' },
        neutral: { label: '개방 가족형', desc: '가족 계획을 열린 마음으로 함께 만들어가요.', emoji: '🌻', badge: 'FBBF24' },
        low: { label: '자유 동반자형', desc: '전통보다 두 사람만의 방식으로 미래를 설계해요.', emoji: '✨', badge: 'F97316' },
    },
    values: {
        high: { label: '진보 가치형', desc: '성평등·다양성·환경 등 사회적 가치에 적극적이에요.', emoji: '🌈', badge: '6366F1' },
        neutral: { label: '중도 가치형', desc: '다양한 관점을 열린 마음으로 수용해요.', emoji: '🌎', badge: '8B5CF6' },
        low: { label: '전통 가치형', desc: '안정적이고 전통적인 가치관이 삶의 기반이에요.', emoji: '🛡️', badge: '9333EA' },
    },
};

/**
 * 카테고리 점수(0~100)를 유형으로 변환
 * @param {string} category - 'relationship' | 'lifestyle' | 'family' | 'values'
 * @param {number} score - 0 ~ 100
 */
export const getDeepSoulType = (category, score) => {
    const types = DEEP_SOUL_TYPES[category];
    if (!types) return { label: '미분류', desc: '', emoji: '❓', badge: '94A3B8' };
    if (score >= 62) return { ...types.high, tendency: 'high' };
    if (score <= 38) return { ...types.low, tendency: 'low' };
    return { ...types.neutral, tendency: 'neutral' };
};

/**
 * 두 사람의 점수를 비교해서 호환도(%) + 메시지 반환
 * 같은 유형(tendency)이면 높은 호환도, 반대이면 낮음
 */
export const calcDeepCompatibility = (scoreA, scoreB) => {
    if (scoreA == null || scoreB == null) return null;
    const diff = Math.abs(scoreA - scoreB);
    const pct = Math.round(100 - diff * 0.85);
    const clamped = Math.max(10, Math.min(100, pct));
    let msg = '';
    if (clamped >= 80) msg = '🔥 매우 잘 맞아요!';
    else if (clamped >= 65) msg = '💜 좋은 궁합이에요';
    else if (clamped >= 50) msg = '🤝 보완적 궁합이에요';
    else msg = '⚡ 서로 다른 스타일이에요';
    return { pct: clamped, msg };
};

/**
 * answers 객체 → 카테고리별 평균 점수(0~100) 반환
 */
export const buildCatScores = (answers, questions) => {
    if (!answers || !questions) return {};
    const catMap = {};
    questions.forEach(q => {
        if (answers[q.id] === undefined) return;
        if (!catMap[q.category]) catMap[q.category] = [];
        catMap[q.category].push(answers[q.id]);
    });
    const result = {};
    Object.entries(catMap).forEach(([cat, vals]) => {
        result[cat] = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 25);
    });
    return result;
};
