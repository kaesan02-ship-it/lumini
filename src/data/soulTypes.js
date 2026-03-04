/**
 * 루미니 성향 페르소나 시스템
 * 
 * 소셜 앱에 어울리는 친근하고 따뜻한 언어로 성향을 재정의합니다.
 * 컬러톤은 루미니의 상징인 퍼플과 밝은 파스텔 톤을 사용합니다.
 */

const SOUL_TYPES = {
    // ===== 분석가 그룹 (NT) =====
    INTJ: {
        soulName: '깊이 있는 비전가',
        title: '미래를 그리는 설계자',
        emoji: '🔭',
        desc: '차분하게 전체를 조망하며 본질을 꿰뚫어 보는 지혜를 가졌습니다. 당신의 계획은 늘 완벽한 지도를 그려냅니다.',
        shortDesc: '전략적 통찰과 논리적 비전의 소유자',
        gradient: ['#F3E8FF', '#E9D5FF', '#D8B4FE'], // 밝은 라벤더/퍼플
        accentColor: '#9333EA',
        trait: '탁월한 통찰력',
        compatibleTypes: ['ENFP', 'ENTP'],
    },
    INTP: {
        soulName: '아이디어 탐험가',
        title: '호기심 많은 분석가',
        emoji: '💡',
        desc: '세상의 모든 원리를 궁금해하며 자신만의 독창적인 논리를 구축합니다. 당신과 대화하면 새로운 시각이 열립니다.',
        shortDesc: '끊임없는 질문과 독창적 사유의 소유자',
        gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE'], // 연보라
        accentColor: '#7C3AED',
        trait: '논리적 상상력',
        compatibleTypes: ['ENTJ', 'ENFJ'],
    },
    ENTJ: {
        soulName: '확신 있는 리더',
        title: '앞서 나가는 행동가',
        emoji: '🚀',
        desc: '명확한 방향을 제시하고 모두를 조화롭게 이끄는 카리스마를 가졌습니다. 당신의 결정은 신뢰를 바탕으로 합니다.',
        shortDesc: '대담한 추진력과 전략적 판단의 소유자',
        gradient: ['#E0F2FE', '#BAE6FD', '#7DD3FC'], // 연한 블루/퍼플
        accentColor: '#0284C7',
        trait: '강력한 실행력',
        compatibleTypes: ['INTP', 'INFP'],
    },
    ENTP: {
        soulName: '자유로운 혁신가',
        title: '즐거운 토론가',
        emoji: '🎭',
        desc: '고정관념에 얽매이지 않고 늘 새로운 가능성을 제시합니다. 당신이 있는 곳은 항상 활기와 지적 즐거움이 넘칩니다.',
        shortDesc: '빠른 두뇌 회전과 창의적인 유머의 소유자',
        gradient: ['#FAF5FF', '#F3E8FF', '#E9D5FF'], // 아주 밝은 보라
        accentColor: '#A855F7',
        trait: '유연한 사고',
        compatibleTypes: ['INTJ', 'INFJ'],
    },

    // ===== 외교관 그룹 (NF) =====
    INFJ: {
        soulName: '공감하는 조언자',
        title: '따뜻한 통찰가',
        emoji: '🌿',
        desc: '사람들의 보이지 않는 아픔까지 섬세하게 어루만지는 능력이 있습니다. 당신 곁에 있으면 마음이 편안해집니다.',
        shortDesc: '깊은 공감과 단단한 신념의 소유자',
        gradient: ['#F0FDF4', '#DCFCE7', '#BBF7D0'], // 연한 그린/퍼플 조화
        accentColor: '#16A34A',
        trait: '섬세한 공감',
        compatibleTypes: ['ENFP', 'ENTP'],
    },
    INFP: {
        soulName: '낭만적인 몽상가',
        title: '마음을 짜는 예술가',
        emoji: '🎨',
        desc: '세상의 모든 소소한 아름다움에 감동하며 자신만의 따스한 세계를 그려냅니다. 당신의 진심은 사람을 감동시킵니다.',
        shortDesc: '풍부한 감수성과 포근한 진심의 소유자',
        gradient: ['#FFF1F2', '#FFE4E6', '#FECDD3'], // 연한 핑크/라벤더
        accentColor: '#E11D48',
        trait: '순수한 감수성',
        compatibleTypes: ['ENTJ', 'ENFJ'],
    },
    ENFJ: {
        soulName: '밝은 에너지의 인도자',
        title: '영감을 주는 멘토',
        emoji: '☀️',
        desc: '사람들의 장점을 찾아 꽃피우는 재능이 있습니다. 당신의 격려는 누군가의 삶에 소중한 햇살이 됩니다.',
        shortDesc: '포용력 있는 리더십과 긍정적인 영향력',
        gradient: ['#FFF7ED', '#FFEDD5', '#FED7AA'], // 따뜻한 오렌지/퍼플
        accentColor: '#D97706',
        trait: '긍정적 인도자',
        compatibleTypes: ['INTP', 'INFP'],
    },
    ENFP: {
        soulName: '열정적인 활동가',
        title: '매력 넘치는 주인공',
        emoji: '✨',
        desc: '매 순간을 축제처럼 즐기며 주변에 행복을 전파합니다. 당신의 넘치는 에너지는 세상을 더 밝게 만듭니다.',
        shortDesc: '자유로운 상상력과 사교적인 에너지의 소유자',
        gradient: ['#FDF4FF', '#FAE8FF', '#F5D0FE'], // 밝은 핑크/퍼플
        accentColor: '#C026D3',
        trait: '넘치는 활력',
        compatibleTypes: ['INTJ', 'INFJ'],
    },

    // ===== 관리자 그룹 (SJ) =====
    ISTJ: {
        soulName: '성실한 수호자',
        title: '신뢰의 파수꾼',
        emoji: '📏',
        desc: '책임감이 강하고 묵묵하게 자신의 자리를 지킵니다. 시스템과 약속을 소중히 여기는 당신은 모두의 모범이 됩니다.',
        shortDesc: '철저한 신용과 정직한 실행의 소유자',
        gradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'], // 깨끗한 그레이/화이트
        accentColor: '#475569',
        trait: '원칙과 성실성',
        compatibleTypes: ['ESFP', 'ESTP'],
    },
    ISFJ: {
        soulName: '사려 깊은 조력자',
        title: '헌신적인 동반자',
        emoji: '🍵',
        desc: '가까운 사람들의 사소한 필요를 기억하고 챙겨줍니다. 당신의 소리 없는 보살핌은 공동체를 단단하게 묶어줍니다.',
        shortDesc: '다정한 헌신과 안정감 있는 배려의 소유자',
        gradient: ['#F0F9FF', '#E0F2FE', '#BAE6FD'], // 맑은 수채화 블루
        accentColor: '#0891B2',
        trait: '세심한 보살핌',
        compatibleTypes: ['ESFP', 'ESTP'],
    },
    ESTJ: {
        soulName: '체계적인 관리자',
        title: '실용적인 조직가',
        emoji: '📁',
        desc: '효율을 바탕으로 목표를 완수하며 질서를 정립합니다. 현실적인 대안을 제시하는 당신의 판단은 늘 명쾌합니다.',
        shortDesc: '정교한 분석과 확고한 현실 감각의 소유자',
        gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE'], // 단정한 블루
        accentColor: '#2563EB',
        trait: '현실적 추진력',
        compatibleTypes: ['ISFP', 'ISTP'],
    },
    ESFJ: {
        soulName: '다정한 관계 메이커',
        title: '화합의 마에스트로',
        emoji: '🌸',
        desc: '타인의 행복을 자신의 기쁨으로 여기며 모임을 화기애애하게 만듭니다. 당신이 가는 곳엔 항상 웃음이 가득합니다.',
        shortDesc: '사교적인 매너와 따뜻한 공감 능력의 소유자',
        gradient: ['#FFF5F5', '#FFE3E3', '#FFC9C9'], // 연분홍
        accentColor: '#E03131',
        trait: '조화로운 사교성',
        compatibleTypes: ['ISFP', 'ISTP'],
    },

    // ===== 탐험가 그룹 (SP) =====
    ISTP: {
        soulName: '유연한 해결사',
        title: '능숙한 장인',
        emoji: '⚙️',
        desc: '침착하게 상황을 분석하고 최적의 도구를 사용하여 문제를 해결합니다. 당신의 기술적인 감각은 누구보다 예리합니다.',
        shortDesc: '실용적 대응과 객관적 분석의 소유자',
        gradient: ['#F0FDFA', '#CCFBF1', '#99F6E4'], // 민트/퍼플
        accentColor: '#0D9488',
        trait: '냉철한 적응력',
        compatibleTypes: ['ESFJ', 'ESTJ'],
    },
    ISFP: {
        soulName: '감각적인 탐험가',
        title: '자유로운 예술가',
        emoji: '🧶',
        desc: '풍부한 오감으로 현재를 즐기며 조화로운 미적 감각을 뽐냅니다. 당신의 삶 자체는 하나의 부드러운 예술 작품입니다.',
        shortDesc: '창의적인 안목과 유연한 정서의 소유자',
        gradient: ['#FEF2F2', '#FEE2E2', '#FECACA'], // 연한 코랄
        accentColor: '#DC2626',
        trait: '순수 예술성',
        compatibleTypes: ['ESFJ', 'ESTJ'],
    },
    ESTP: {
        soulName: '활동적인 모험가',
        title: '실전형 문제 해결사',
        emoji: '🛹',
        desc: '넘치는 에너지로 현장에 뛰어들어 결과를 만들어냅니다. 어떤 위기 앞에서도 위축되지 않는 당신은 실전의 강자입니다.',
        shortDesc: '빠른 실행력과 대담한 적응 능력의 소유자',
        gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A'], // 밝은 옐로우
        accentColor: '#D97706',
        trait: '대담한 기동성',
        compatibleTypes: ['ISTJ', 'ISFJ'],
    },
    ESFP: {
        soulName: '밝은 빛의 엔터테이너',
        title: '친밀한 친구',
        emoji: '🎈',
        desc: '함께 있으면 시간 가는 줄 모르는 즐거운 분위기를 연출합니다. 당신은 타고난 사교가이자 사랑스러운 동료입니다.',
        shortDesc: '긍정적인 에너지와 풍부한 표현력의 소유자',
        gradient: ['#FDF2F8', '#FCE7F3', '#FBCFE8'], // 밝은 마젠타
        accentColor: '#DB2777',
        trait: '즐거운 사교성',
        compatibleTypes: ['ISTJ', 'ISFJ'],
    }
};

/**
 * MBTI 유형으로 페르소나 정보를 조회합니다.
 */
export const getSoulType = (mbtiType) => {
    const type = mbtiType?.toUpperCase();
    return SOUL_TYPES[type] || SOUL_TYPES['INFP']; // 기본값
};

/**
 * 모든 페르소나를 배열로 반환합니다.
 */
export const getAllSoulTypes = () => {
    return Object.entries(SOUL_TYPES).map(([mbti, data]) => ({
        mbti,
        ...data
    }));
};

/**
 * 호환성 체크
 */
export const checkCompatibility = (myType, otherType) => {
    const my = getSoulType(myType);
    const isHighCompat = my.compatibleTypes?.includes(otherType?.toUpperCase());

    return {
        level: isHighCompat ? 'high' : 'medium',
        label: isHighCompat ? '찰떡 궁합' : '좋은 궁합',
        emoji: isHighCompat ? '💜' : '😊',
    };
};

export default SOUL_TYPES;
