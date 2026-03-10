/**
 * 유저 간의 성향 데이터를 비교하여
 * 왜 매칭되었는지에 대한 "납득 가능한 문장(Reasoning)"을 생성합니다.
 */

export const generateMatchingInsight = (userA, userB, score) => {
    if (!userA || !userB || userA.length === 0 || userB.length === 0) return null;

    // 9지표 중 특히 비슷한 것들 추출 (차이가 15 이내)
    const similarTraits = userA.map((trait, idx) => {
        const otherTrait = userB.find(t => t.subject === trait.subject);
        if (!otherTrait) return null;
        const diff = Math.abs(trait.A - otherTrait.A);
        return { subject: trait.subject, diff, score: trait.A };
    }).filter(t => t && t.diff <= 15);

    // 공통점 중 상위 3개 선정
    const topTraits = similarTraits.sort((a, b) => a.diff - b.diff).slice(0, 3);

    let summary = "";
    if (score >= 90) {
        summary = "완벽에 가까운 소울메이트를 찾으셨네요! ";
    } else if (score >= 80) {
        summary = "서로를 깊게 이해할 수 있는 따뜻한 인연이에요. ";
    } else {
        summary = "서로의 부족한 점을 채워줄 수 있는 조화로운 관계예요. ";
    }

    const traitNames = topTraits.map(t => t.subject);

    let reasonText = "";
    if (traitNames.includes('공감력') && traitNames.includes('따뜻함')) {
        reasonText = "두 분 모두 타인의 감정에 민감하고 따뜻한 마음을 나누는 것을 중요하게 생각하시네요. 힘든 순간 서로에게 가장 큰 버팀목이 되어줄 거예요.";
    } else if (traitNames.includes('창의성') && traitNames.includes('유연성')) {
        reasonText = "새로운 아이디어와 자유로운 활동을 즐기는 에너지가 매우 비슷해요. 함께라면 매일이 지루하지 않은 흥미진진한 일상을 만들어갈 수 있습니다.";
    } else if (traitNames.includes('계획성') && traitNames.includes('자기주도')) {
        reasonText = "목표를 세우고 실천하는 성실한 태도가 두 분을 하나로 묶어주네요. 함께 미래를 설계하고 성장해 나가는 모습이 정말 기대되는 매칭입니다.";
    } else {
        const primaryTrait = traitNames[0] || "전반적인 가치관";
        reasonText = `특히 **${primaryTrait}** 부분에서 놀라울 정도로 비슷한 결을 가지고 계시네요. 대화를 나눌수록 "나랑 정말 비슷하다"는 느낌을 강하게 받으실 거예요.`;
    }

    return {
        summary,
        description: reasonText,
        keyTraits: traitNames
    };
};
