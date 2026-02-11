// 관심사 태그 데이터
export const INTEREST_TAGS = {
    entertainment: {
        label: '🎬 엔터테인먼트',
        tags: ['영화', '드라마', '음악', '공연', '유튜브', '넷플릭스']
    },
    sports: {
        label: '🏃 운동/건강',
        tags: ['헬스', '요가', '러닝', '등산', '수영', '자전거']
    },
    lifestyle: {
        label: '☕ 라이프스타일',
        tags: ['카페', '맛집', '요리', '베이킹', '인테리어', '패션']
    },
    gaming: {
        label: '🎮 게임',
        tags: ['롤', '발로란트', '배그', '오버워치', '모바일게임', '보드게임']
    },
    travel: {
        label: '✈️ 여행',
        tags: ['국내여행', '해외여행', '캠핑', '사진', '맛집투어']
    },
    culture: {
        label: '📚 문화/교양',
        tags: ['독서', '전시회', '박물관', '미술관', '공부', '언어']
    }
};

// 대화 시작 프롬프트
export const CONVERSATION_PROMPTS = [
    // 일상
    { category: '일상', icon: '🗓️', text: '이번 주말 계획이 있으세요?' },
    { category: '일상', icon: '😊', text: '요즘 어떻게 지내세요?' },
    { category: '일상', icon: '☀️', text: '오늘 하루는 어땠나요?' },

    // 취미/관심사
    { category: '취미', icon: '🎬', text: '최근 본 영화 중 추천할 만한 게 있나요?' },
    { category: '취미', icon: '🎯', text: '요즘 가장 관심있는 취미는?' },
    { category: '취미', icon: '🎵', text: '좋아하는 음악 장르는?' },
    { category: '취미', icon: '🎮', text: '즐겨하는 게임이 있나요?' },
    { category: '취미', icon: '📚', text: '최근에 읽은 책 중 인상 깊었던 게 있나요?' },

    // 라이프스타일
    { category: '라이프', icon: '☕', text: '좋아하는 카페가 있나요?' },
    { category: '라이프', icon: '🏃', text: '주로 어떤 운동을 하세요?' },
    { category: '라이프', icon: '✈️', text: '여행 가고 싶은 곳이 있나요?' },
    { category: '라이프', icon: '🌅', text: '아침형 인간이세요, 저녁형 인간이세요?' },

    // 음식
    { category: '음식', icon: '🍕', text: '좋아하는 음식은 뭐예요?' },
    { category: '음식', icon: '🌶️', text: '매운 음식 잘 드세요?' },
    { category: '음식', icon: '☕', text: '커피 vs 차, 어떤 걸 더 좋아하세요?' },
    { category: '음식', icon: '🍜', text: '한식, 양식, 중식, 일식 중 뭘 제일 좋아하세요?' },

    // 가치관
    { category: '가치관', icon: '💭', text: 'MBTI가 실생활에 도움이 된다고 생각하세요?' },
    { category: '가치관', icon: '🤝', text: '친구 관계에서 가장 중요한 건 뭐라고 생각하세요?' },
    { category: '가치관', icon: '🎯', text: '요즘 가장 이루고 싶은 목표가 있나요?' },
    { category: '가치관', icon: '⏰', text: '시간 약속을 중요하게 생각하시나요?' },

    // 재미
    { category: '재미', icon: '🎉', text: '주말에 주로 뭐 하면서 시간 보내세요?' },
    { category: '재미', icon: '🎪', text: '스트레스 받을 때 어떻게 푸세요?' },
    { category: '재미', icon: '🎨', text: '취미로 배워보고 싶은 게 있나요?' },
    { category: '재미', icon: '🌟', text: '인생에서 가장 기억에 남는 순간은?' },

    // 계절/날씨
    { category: '계절', icon: '🌸', text: '봄, 여름, 가을, 겨울 중 어느 계절을 제일 좋아하세요?' },
    { category: '계절', icon: '☔', text: '비 오는 날 뭐 하는 걸 좋아하세요?' },
    { category: '계절', icon: '❄️', text: '눈 오면 기분 좋아지는 편이세요?' },

    // MBTI 관련
    { category: 'MBTI', icon: '🔮', text: '본인 MBTI 특징 중 가장 공감되는 게 뭐예요?' },
    { category: 'MBTI', icon: '👥', text: '어떤 MBTI랑 제일 잘 맞는 것 같아요?' },
    { category: 'MBTI', icon: '💡', text: 'MBTI 알고 나서 달라진 게 있나요?' }
];

// Mock 그룹 데이터
export const MOCK_GROUPS = [
    {
        id: 1,
        name: 'ENFP 친구들',
        emoji: '💜',
        memberCount: 124,
        activity: '활발함',
        tags: ['친구', '카페', '영화'],
        category: 'popular',
        description: 'ENFP끼리 모여서 즐겁게 수다 떨어요!',
        lastMessage: '이번 주말에 카페 가실 분?',
        lastMessageTime: '5분 전'
    },
    {
        id: 2,
        name: '게임 듀오 찾기',
        emoji: '🎮',
        memberCount: 89,
        activity: '보통',
        tags: ['게임', '롤', '발로란트'],
        category: 'popular',
        description: '롤, 발로란트 듀오/파티원 구해요',
        lastMessage: '골드 티어 듀오 구합니다~',
        lastMessageTime: '15분 전'
    },
    {
        id: 3,
        name: '강남 카페 투어',
        emoji: '☕',
        memberCount: 45,
        activity: '조용함',
        tags: ['카페', '강남', '주말'],
        category: 'nearby',
        description: '강남 근처 카페 탐방하는 모임',
        lastMessage: '다음 주 토요일 어때요?',
        lastMessageTime: '1시간 전'
    },
    {
        id: 4,
        name: '영화 덕후 모임',
        emoji: '🎬',
        memberCount: 67,
        activity: '활발함',
        tags: ['영화', '넷플릭스', '리뷰'],
        category: 'interest',
        description: '영화 보고 리뷰 나누는 모임',
        lastMessage: '오펜하이머 보신 분?',
        lastMessageTime: '30분 전'
    },
    {
        id: 5,
        name: '운동 메이트',
        emoji: '🏃',
        memberCount: 52,
        activity: '보통',
        tags: ['운동', '헬스', '러닝'],
        category: 'interest',
        description: '같이 운동하실 분 모집',
        lastMessage: '내일 아침 러닝 가실 분!',
        lastMessageTime: '2시간 전'
    },
    {
        id: 6,
        name: 'INFP 감성 모임',
        emoji: '🌙',
        memberCount: 98,
        activity: '활발함',
        tags: ['INFP', '감성', '음악'],
        category: 'popular',
        description: 'INFP들의 감성 충만 수다방',
        lastMessage: '요즘 듣는 노래 추천해주세요',
        lastMessageTime: '10분 전'
    }
];

// Mock 그룹 채팅 메시지
export const MOCK_GROUP_MESSAGES = {
    1: [ // ENFP 친구들
        { id: 1, sender: '지민', mbti: 'ENFP', text: '안녕하세요! 처음 들어왔어요 😊', time: '14:23', reactions: { heart: 3, thumbsUp: 2 } },
        { id: 2, sender: '서연', mbti: 'INFP', text: '반가워요! 환영합니다 💕', time: '14:25', reactions: {} },
        { id: 3, sender: '민수', mbti: 'ENTP', text: 'ENFP끼리는 통하죠 ㅋㅋㅋ', time: '14:27', reactions: { laughing: 5 } },
        { id: 4, sender: '나', mbti: 'ENFP', text: '이번 주말에 카페 가실 분 계신가요? ☕', time: '14:30', reactions: {} }
    ]
};
