import { USE_MOCK_DATA } from '../config';

let openai = null;

// OpenAI는 실제 API 키가 있을 때만 초기화
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (apiKey && apiKey !== 'dummy-key' && !USE_MOCK_DATA) {
    import('openai').then(({ default: OpenAI }) => {
        openai = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true
        });
    });
}

// =============================================
// 모크 데이터 — 리뉴얼된 성향 페르소나 컨셉 반영
// =============================================

const MOCK_ADVICE_POOL = {
    NT: [
        {
            analysis: "전략적 사고가 뛰어난 당신은 대화에서도 핵심을 짚는 능력이 탁월합니다. 하지만 가끔은 정답을 찾기보다 상대방의 과정에 귀를 기울여보세요. 공감 한 마디가 논리적인 조언보다 더 큰 신뢰를 쌓아줄 것입니다.",
            strengths: ["본질을 꿰뚫는 통찰력", "효율적인 문제 해결 능력", "지적 호기심과 넓은 시야"],
            cautions: ["결과 중심적인 태도로 인한 오해", "감정적 맥락을 놓칠 수 있음"]
        },
        {
            analysis: "창의적인 아이디어가 넘치는 당신은 주변에 영감을 주는 존재입니다. 하지만 너무 많은 생각은 가끔 행동을 늦출 수 있습니다. 오늘 만나는 사람과 아주 작고 구체적인 실행 계획을 대화 주제로 삼아보세요.",
            strengths: ["독창적인 발상", "빠른 상황 분석력", "유연한 적응력"],
            cautions: ["마무리가 약할 수 있음", "현실적인 디테일 간과"]
        }
    ],
    NF: [
        {
            analysis: "깊은 공감 능력을 가진 당신은 사람들의 마음을 여는 열쇠를 가졌습니다. 하지만 타인의 감정에 너무 동화되어 스스로를 잃지 않도록 주의하세요. 당신의 진심은 건강한 거리감 속에서 더 빛이 납니다.",
            strengths: ["섬세한 감정 파악", "진정성 있는 소통", "따뜻한 포용력"],
            cautions: ["타인의 시선에 예민함", "갈등 상황 회피 성향"]
        },
        {
            analysis: "세상의 아름다움을 발견하는 당신의 시각은 주변을 행복하게 합니다. 당신의 가치관을 공유할 때 더 깊은 유대감을 느낄 것입니다. 오늘은 본인이 소중하게 생각하는 가치에 대해 이야기해보는 건 어떨까요?",
            strengths: ["풍부한 감수성", "독창적인 미적 감각", "이상적인 가치 추구"],
            cautions: ["현실적인 문제에 취약", "혼자만의 세계에 빠지기 쉬움"]
        }
    ],
    SJ: [
        {
            analysis: "성실하고 책임감 있는 당신은 모두가 믿고 의지하는 든든한 버팀목입니다. 가끔은 정해진 규칙에서 벗어나 우연이 주는 즐거움을 즐겨보세요. 예상치 못한 상황에서도 당신은 충분히 잘 해낼 수 있습니다.",
            strengths: ["철저한 책임감", "안정적인 공동체 운영", "정확하고 꼼꼼한 일 처리"],
            cautions: ["변화에 대한 거부감", "보수적인 판단 기준"]
        }
    ],
    SP: [
        {
            analysis: "현재를 즐기는 당신의 활기는 주변을 밝게 만듭니다. 당신의 즉흥적이고 유연한 태도는 긴장된 상황을 부드럽게 만드는 힘이 있습니다. 오늘은 처음 보는 사람과도 가벼운 농담으로 대화를 시작해보세요.",
            strengths: ["대담한 실행력", "뛰어난 적응력", "낙천적인 에너지"],
            cautions: ["장기적 계획의 부재", "충동적인 결정"]
        }
    ]
};

const MOCK_TOPICS_POOL = [
    "최근에 나만 알고 싶은 소소한 행복이 있었나요? 😊",
    "만약 내일 당장 어디든 떠날 수 있다면 어디로 가고 싶으세요? ✈️",
    "요즘 당신의 플레이리스트 상위권을 차지한 곡은 무엇인가요? 🎵",
    "인생에서 가장 중요하게 생각하는 가치 한 가지만 꼽는다면? ✨",
    "최근에 새로 시작했거나 도전하고 싶은 취미가 있으신가요? 🧶",
    "나만 아는 동네 최고의 맛집이나 카페가 있다면 알려주세요! ☕",
    "어릴 적 꿈꾸던 모습과 지금의 모습은 얼마나 닮아있나요? 🌈"
];

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * 성격 기반 조언 생성
 */
export const getAIAdvice = async (mbti, traits) => {
    // 그룹 판별 (NT, NF, SJ, SP)
    let group = 'NT';
    if (mbti.includes('N') && mbti.includes('F')) group = 'NF';
    else if (mbti.includes('S') && mbti.includes('J')) group = 'SJ';
    else if (mbti.includes('S') && mbti.includes('P')) group = 'SP';

    const pool = MOCK_ADVICE_POOL[group] || MOCK_ADVICE_POOL.NT;

    if (USE_MOCK_DATA || !apiKey || apiKey === 'dummy-key') {
        // 인위적인 딜레이 (로딩 체감용)
        await new Promise(r => setTimeout(r, 800));
        return getRandomItem(pool);
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: "당신은 소셜 관계 전문가입니다. 사용자의 성향 지표를 바탕으로 친근하고 따뜻한 어조로 조언을 제공합니다. JSON 형식으로 답하며 키는 'analysis', 'strengths' (리스트), 'cautions' (리스트) 입니다."
                },
                {
                    role: "user",
                    content: `MBTI: ${mbti}, Traits: ${JSON.stringify(traits)}. 이 유저에게 어울리는 다정한 조언과 분석 리포트를 작성해줘.`
                }
            ],
            temperature: 0.8,
        });

        const rawContent = response.choices[0].message.content;
        return JSON.parse(rawContent);
    } catch (error) {
        console.error('OpenAI Error:', error);
        return getRandomItem(pool);
    }
};

/**
 * 대화 주제 추천
 */
export const getConversationTopics = async (mbti, interestTags) => {
    if (USE_MOCK_DATA || !apiKey || apiKey === 'dummy-key') {
        // 랜덤하게 3개 추출
        const shuffled = [...MOCK_TOPICS_POOL].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: `MBTI ${mbti}, 관심사 ${interestTags.join(', ')}인 사람에게 추천할만한 첫 대화 주제 3가지를 리스트로 제안해줘. (번호 없이 문장만)`
                }
            ],
            temperature: 0.8,
        });

        const content = response.choices[0].message.content;
        return content.split('\n').filter(line => line.trim() !== '').slice(0, 3);
    } catch (error) {
        console.error('OpenAI Error:', error);
        const shuffled = [...MOCK_TOPICS_POOL].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
};

/**
 * 아이스브레이킹 질문 생성 (Phase 5)
 */
export const getIceBreakerQuestions = async (myMbti, theirMbti, similarity) => {
    if (USE_MOCK_DATA || !apiKey || apiKey === 'dummy-key') {
        const mockQuestions = [
            `안녕하세요! MBTI가 ${theirMbti}시네요! 저희 일치도가 ${similarity}%나 되어서 무척 반가워요. 😊`,
            `${theirMbti} 성향이신 분들은 보통 세심하시던데, 오늘 하루는 어떠셨나요?`,
            `루미니가 저희를 소울메이트 후보로 추천해줬어요! 공통점이 많을 것 같은데 어떤 스타일의 대화를 좋아하세요? 🦦`
        ];
        await new Promise(r => setTimeout(r, 600));
        return mockQuestions;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: `나의 MBTI: ${myMbti}, 상대방의 MBTI: ${theirMbti}, 우리 둘의 성향 일치도: ${similarity}%. 
                    상대방과 처음 대화를 시작할 때 보내기 좋은 다정하고 센스 있는 첫 인사 및 질문 3가지를 제안해줘. (번호 없이 문장만, 한 줄에 하나씩)`
                }
            ],
            temperature: 0.8,
        });

        const content = response.choices[0].message.content;
        return content.split('\n').filter(line => line.trim() !== '').slice(0, 3);
    } catch (error) {
        console.error('OpenAI Error:', error);
        return [
            "안녕하세요! 반가워요. 😊",
            "루미니 추천으로 오게 되었어요!",
            "함께 즐거운 대화 나눠요! 🦦"
        ];
    }
};

export default openai;
