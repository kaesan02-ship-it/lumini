import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // 클라이언트 측에서 OpenAI를 직접 호출할 때 필요
});

/**
 * 성격 기반 조언 생성
 */
export const getAIAdvice = async (mbti, traits) => {
    if (!apiKey) {
        return "API 키가 설정되지 않았습니다. 설정에서 OpenAI API 키를 입력해주세요.";
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "당신은 심리학 및 성격 분석 전문가입니다. 사용자의 MBTI와 성격 특성(개방성, 성실성, 외향성, 친화성, 신경증)을 바탕으로 유용한 조언을 제공합니다."
                },
                {
                    role: "user",
                    content: `내 MBTI는 ${mbti}이고, 주요 성격 지표는 다음과 같습니다: ${JSON.stringify(traits)}. 내 성격의 장점을 살려 대인관계를 잘 할 수 있는 성찰 조언을 3~4문장으로 짧고 명확하게 한국어로 제공해줘.`
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Error:', error);
        return "AI 조언을 가져오는 중 오류가 발생했습니다.";
    }
};

/**
 * 대화 주제 추천
 */
export const getConversationTopics = async (mbti, interestTags) => {
    if (!apiKey) return [];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "당신은 소셜 네트워킹 도우미입니다. 사용자의 성격과 관심사를 바탕으로 흥미로운 대화 주제를 추천합니다."
                },
                {
                    role: "user",
                    content: `내 MBTI는 ${mbti}이고, 관심사는 ${interestTags.join(', ')}입니다. 처음 만난 사람과 어색하지 않게 대화할 수 있는 주제 3가지를 리스트 형식으로 추천해줘. 각 주제는 짧은 설명과 질문 예시를 포함해줘.`
                }
            ],
            temperature: 0.8,
        });

        // 리스트 파싱 (간단한 구현)
        const content = response.choices[0].message.content;
        return content.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
        console.error('OpenAI Error:', error);
        return ["오늘 날씨에 대해 이야기해보기", "좋아하는 영화에 대해 물어보기", "최근에 읽은 책 공유하기"];
    }
};

export default openai;
