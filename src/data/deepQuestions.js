/**
 * 루미니 딥 소울 검사 질문 데이터
 * 4개 카테고리 × 총 35문항
 * Category: 'relationship' | 'lifestyle' | 'family' | 'values'
 */

export const DEEP_CATEGORIES = [
    {
        id: 'relationship',
        label: '연애 & 관계 스타일',
        emoji: '💑',
        color: '#EC4899',
        description: '나에게 맞는 연애 방식을 알아보아요',
        weight: 0.35,
    },
    {
        id: 'lifestyle',
        label: '라이프스타일',
        emoji: '🌿',
        color: '#10B981',
        description: '일상의 방식이 맞는 인연을 찾아요',
        weight: 0.25,
    },
    {
        id: 'family',
        label: '가족관 & 미래 계획',
        emoji: '🏠',
        color: '#F59E0B',
        description: '미래를 함께 그려볼 수 있는지 확인해요',
        weight: 0.25,
    },
    {
        id: 'values',
        label: '사회 & 가치관',
        emoji: '🌍',
        color: '#6366F1',
        description: '세상을 바라보는 시각이 맞는 인연을 만나요',
        weight: 0.15,
    },
];

export const DEEP_QUESTIONS = [
    // ── 연애 & 관계 스타일 (8문항) ─────────────────────────────────
    {
        id: 'r1',
        category: 'relationship',
        text: '연인과 하루에 연락을 얼마나 자주 하고 싶으세요?',
        type: 'scale', // 5점 척도
        low: '1-2회로 충분해요',
        high: '수시로 연락하고 싶어요',
    },
    {
        id: 'r2',
        category: 'relationship',
        text: '연인과 단둘이 보내는 시간 vs 친구들과 함께하는 모임, 어느 쪽을 더 자주 원하나요?',
        type: 'scale',
        low: '친구 모임이 더 중요해요',
        high: '연인과 둘만의 시간이 더 좋아요',
    },
    {
        id: 'r3',
        category: 'relationship',
        text: '갈등이 생겼을 때 즉시 이야기를 나눠 해결하는 것 vs 서로 시간을 갖고 나중에 풀어가는 것, 어느 쪽인가요?',
        type: 'scale',
        low: '시간이 필요해요',
        high: '바로 대화로 풀어요',
    },
    {
        id: 'r4',
        category: 'relationship',
        text: '연인에게 내 감정을 솔직하게 표현하는 편인가요?',
        type: 'scale',
        low: '속으로 삭이는 편이에요',
        high: '있는 그대로 표현해요',
    },
    {
        id: 'r5',
        category: 'relationship',
        text: '장거리 연애(다른 도시/해외)도 괜찮은가요?',
        type: 'scale',
        low: '가능하면 가까이 있고 싶어요',
        high: '거리는 문제없어요',
    },
    {
        id: 'r6',
        category: 'relationship',
        text: '연인의 친구, 가족 관계에 얼마나 적극적으로 참여하길 원하나요?',
        type: 'scale',
        low: '서로 독립적으로 유지해요',
        high: '가족처럼 한 팀이 되고 싶어요',
    },
    {
        id: 'r7',
        category: 'relationship',
        text: '연인과 경제적인 것들을 어떻게 나누는 걸 선호하세요?',
        type: 'scale',
        low: '각자 부담 (더치페이)',
        high: '상황에 따라 한쪽이 리드',
    },
    {
        id: 'r8',
        category: 'relationship',
        text: '연인 간의 개인 공간과 독립성이 얼마나 중요한가요?',
        type: 'scale',
        low: '함께하는 것이 우선이에요',
        high: '각자의 시간이 꼭 필요해요',
    },

    // ── 라이프스타일 (8문항) ────────────────────────────────────────
    {
        id: 'l1',
        category: 'lifestyle',
        text: '주말을 주로 어떻게 보내고 싶나요?',
        type: 'scale',
        low: '집에서 쉬며 충전해요',
        high: '밖에서 활동적으로 보내요',
    },
    {
        id: 'l2',
        category: 'lifestyle',
        text: '음주를 얼마나 즐기거나 허용하나요?',
        type: 'scale',
        low: '술은 마시지 않아요',
        high: '가끔 함께 즐기고 싶어요',
    },
    {
        id: 'l3',
        category: 'lifestyle',
        text: '흡연에 대해 어떻게 생각하나요?',
        type: 'scale',
        low: '전혀 수용이 안 돼요',
        high: '개인 선택이라 괜찮아요',
    },
    {
        id: 'l4',
        category: 'lifestyle',
        text: '운동이나 건강 관리를 얼마나 중요하게 여기나요?',
        type: 'scale',
        low: '개인 취향 문제예요',
        high: '함께 건강을 챙기고 싶어요',
    },
    {
        id: 'l5',
        category: 'lifestyle',
        text: '반려동물을 키우거나 좋아하나요?',
        type: 'scale',
        low: '동물은 어려워요',
        high: '함께 키우고 싶어요',
    },
    {
        id: 'l6',
        category: 'lifestyle',
        text: '밤형 인간 vs 아침형 인간, 어느 쪽인가요?',
        type: 'scale',
        low: '늦게 자고 늦게 일어나요',
        high: '일찍 자고 일찍 일어나요',
    },
    {
        id: 'l7',
        category: 'lifestyle',
        text: '여행을 갈 때 어떤 스타일인가요?',
        type: 'scale',
        low: '즉흥적이고 자유롭게요',
        high: '꼼꼼하게 계획 세워요',
    },
    {
        id: 'l8',
        category: 'lifestyle',
        text: '종교가 있거나 신앙이 일상에서 중요한가요?',
        type: 'scale',
        low: '특별한 신앙은 없어요',
        high: '신앙이 중요한 일부예요',
    },

    // ── 가족관 & 미래 계획 (8문항) ────────────────────────────────
    {
        id: 'f1',
        category: 'family',
        text: '결혼에 대해 어떻게 생각하나요?',
        type: 'scale',
        low: '결혼이 꼭 필요하지 않아요',
        high: '언젠가는 꼭 결혼하고 싶어요',
    },
    {
        id: 'f2',
        category: 'family',
        text: '자녀 계획이 있나요?',
        type: 'scale',
        low: '자녀를 원하지 않아요',
        high: '자녀를 꼭 갖고 싶어요',
    },
    {
        id: 'f3',
        category: 'family',
        text: '부모님(양가)과의 관계가 파트너에게 얼마나 중요한가요?',
        type: 'scale',
        low: '독립적으로 살고 싶어요',
        high: '가족이 삶의 중심이에요',
    },
    {
        id: 'f4',
        category: 'family',
        text: '경제적 안정(집, 재정)이 관계를 시작하기 전에 얼마나 중요한가요?',
        type: 'scale',
        low: '함께 만들어가면 돼요',
        high: '기반이 갖춰진 후가 맞아요',
    },
    {
        id: 'f5',
        category: 'family',
        text: '살고 싶은 곳이 있나요?',
        type: 'scale',
        low: '지방/자연 근처가 좋아요',
        high: '도심에서 살고 싶어요',
    },
    {
        id: 'f6',
        category: 'family',
        text: '커리어와 가정, 무엇이 더 우선인가요?',
        type: 'scale',
        low: '가정이 우선이에요',
        high: '커리어가 더 중요해요',
    },
    {
        id: 'f7',
        category: 'family',
        text: '파트너의 부모님을 자주 뵙거나 함께하는 것에 대해 어떻게 생각하나요?',
        type: 'scale',
        low: '명절 정도면 충분해요',
        high: '자주 함께하면 좋겠어요',
    },
    {
        id: 'f8',
        category: 'family',
        text: '파트너와 함께 사는 타이밍은 언제가 적절하다고 생각하나요?',
        type: 'scale',
        low: '결혼 후가 맞아요',
        high: '관계가 깊어지면 빨라도 돼요',
    },

    // ── 사회 & 가치관 (7문항) ──────────────────────────────────────
    {
        id: 'v1',
        category: 'values',
        text: '성별 역할(가사, 육아 분담 등)에 대해 어떻게 생각하나요?',
        type: 'scale',
        low: '전통적인 역할 분담이 편해요',
        high: '완전한 평등 분담이 맞아요',
    },
    {
        id: 'v2',
        category: 'values',
        text: '환경·기후 변화 문제가 일상의 선택에 얼마나 영향을 주나요?',
        type: 'scale',
        low: '일상에서 크게 신경 안 써요',
        high: '친환경 삶을 실천하려 해요',
    },
    {
        id: 'v3',
        category: 'values',
        text: '정치적 견해에 대해 파트너와 얼마나 비슷해야 한다고 생각하나요?',
        type: 'scale',
        low: '서로 다를 수 있어요',
        high: '비슷한 방향이면 좋겠어요',
    },
    {
        id: 'v4',
        category: 'values',
        text: '타인의 다양성(문화, 배경, 성소수자 등)을 얼마나 수용하나요?',
        type: 'scale',
        low: '전통적인 가치를 중시해요',
        high: '다양성을 적극 존중해요',
    },
    {
        id: 'v5',
        category: 'values',
        text: '돈을 어떻게 다루는 것이 맞다고 생각하나요?',
        type: 'scale',
        low: '아끼고 저축이 우선이에요',
        high: '즐기며 쓰는 것이 좋아요',
    },
    {
        id: 'v6',
        category: 'values',
        text: '사회적 이슈(빈곤, 인권 등)에 얼마나 적극적으로 관심을 갖나요?',
        type: 'scale',
        low: '내 주변을 먼저 챙겨요',
        high: '사회 문제에 적극 참여해요',
    },
    {
        id: 'v7',
        category: 'values',
        text: '인생에서 가장 중요한 것은 무엇인가요?',
        type: 'scale',
        low: '안정과 행복이 최우선이에요',
        high: '성취와 의미 있는 삶이 중요해요',
    },
];

// 카테고리별 문항 그룹핑
export const getQuestionsByCategory = (categoryId) =>
    DEEP_QUESTIONS.filter(q => q.category === categoryId);

export const TOTAL_DEEP_QUESTIONS = DEEP_QUESTIONS.length; // 35
