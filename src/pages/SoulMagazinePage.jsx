import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Clock, Heart, Share2, Bookmark, ArrowLeft, TrendingUp, Star } from 'lucide-react';

// 성향별 매거진 아티클 데이터
const ARTICLES = [
    {
        id: 1,
        category: 'INFP · INFJ',
        tag: '공감형',
        title: '당신이 상대방의 말에 너무 깊이 빠지는 이유',
        summary: '공감 능력이 뛰어난 당신, 그 능력이 때로 당신 자신을 소진시키고 있지는 않나요?',
        readTime: '3분',
        emoji: '💜',
        gradient: ['#F3E8FF', '#E9D5FF'],
        accentColor: '#9333EA',
        likes: 234,
        content: [
            { heading: '공감의 역설', text: '공감 능력이란 상대방의 감정을 함께 느끼는 힘입니다. INFP와 INFJ 타입의 사람들은 이 능력이 특히 발달되어 있어, 주변 사람이 힘들 때 자신도 함께 무너지는 경험을 자주 합니다.' },
            { heading: '경계선이 필요한 이유', text: '진정한 공감은 "함께 빠지는 것"이 아닌 "함께 있어주는 것"입니다. 상대방의 고통에 함께 빠지면 당신은 더 이상 그 사람을 도울 수 없게 됩니다.' },
            { heading: '실천 팁 3가지', text: '①하루 10분의 감정 리셋 타임 갖기 ②"나는 지금 어떤 감정인가?" 체크하기 ③구체적인 도움 한 가지만 제공하고 나머지는 상대에게 맡기기' },
        ],
    },
    {
        id: 2,
        category: 'ENTJ · INTJ',
        tag: '전략형',
        title: '항상 계획대로만 하려는 당신, 이것이 관계를 망친다',
        summary: '효율과 목표를 중시하는 당신이 사람들과 자주 부딪히는 진짜 이유.',
        readTime: '4분',
        emoji: '⚡',
        gradient: ['#EFF6FF', '#DBEAFE'],
        accentColor: '#2563EB',
        likes: 189,
        content: [
            { heading: '전략가의 딜레마', text: '당신은 항상 최선의 방법을 알고 있습니다. 그래서 다른 사람이 비효율적인 방법을 선택할 때 참기 어렵죠. 하지만 관계는 효율성으로 운영되지 않습니다.' },
            { heading: '감정은 논리가 아니다', text: '사람들이 원하는 것은 최선의 해결책이 아니라, 이해받는 경험입니다. 당신의 조언이 아무리 완벽해도, 공감 없이는 전달되지 않습니다.' },
            { heading: '오늘의 연습', text: '누군가 고민을 털어놓을 때, 해결책 제시 전에 딱 한 문장만 먼저 해보세요: "그게 정말 힘들었겠다."' },
        ],
    },
    {
        id: 3,
        category: 'ESFP · ESTP',
        tag: '활람형',
        title: '지금 이 순간을 사는 당신이 미래를 준비하는 법',
        summary: '현재에 충실한 당신의 강점을 유지하면서 장기적인 관계를 만드는 전략.',
        readTime: '3분',
        emoji: '🔥',
        gradient: ['#FFF7ED', '#FED7AA'],
        accentColor: '#EA580C',
        likes: 312,
        content: [
            { heading: '현재 집중의 힘', text: '당신은 지금 이 순간을 온전히 살아갈 수 있는 능력을 가지고 있습니다. 파티에서 분위기를 이끌고, 위기 상황에서 즉각 대응하는 것이 자연스럽죠.' },
            { heading: '장기적 관계의 함정', text: '그러나 사람들은 때로 예측 가능성을 원합니다. 당신이 오늘 열정적이었다가 내일 차갑게 느껴질 때, 상대방은 혼란스러워합니다.' },
            { heading: '균형 찾기', text: '작은 약속부터 시작하세요. "다음 주 같은 시간에 또 만나자"처럼 간단한 것부터. 약속을 지키는 패턴이 신뢰를 만듭니다.' },
        ],
    },
    {
        id: 4,
        category: '모든 타입',
        tag: '특집',
        title: '첫 번째 대화에서 호감을 사는 MBTI별 접근법',
        summary: '상대방의 타입을 알면 첫 만남이 훨씬 자연스러워집니다.',
        readTime: '5분',
        emoji: '💬',
        gradient: ['#F0FDF4', '#BBF7D0'],
        accentColor: '#059669',
        likes: 521,
        content: [
            { heading: 'I 타입에게', text: '조용히 시간을 줘보세요. 처음부터 많은 말을 요구하면 I 타입은 부담을 느낍니다. 가벼운 공통 화제로 시작하고, 그들이 먼저 말을 꺼내도록 기다리세요.' },
            { heading: 'E 타입에게', text: '적극적으로 반응해 주세요. E 타입은 자신의 이야기에 활발하게 반응해 주는 사람에게 즉각 호감을 느낍니다. 고개를 끄덕이고, 질문을 이어가 주세요.' },
            { heading: 'N 타입과 S 타입', text: 'N: 미래, 가능성, 아이디어 주제를 던져보세요. S: 현실적인 경험담, 오늘 있었던 일, 구체적인 계획을 함께 이야기해 보세요.' },
        ],
    },
    {
        id: 5,
        category: 'ISFJ · ISTJ',
        tag: '안정형',
        title: '당신이 새로운 사람을 믿기까지 오래 걸리는 이유',
        summary: '신중하고 책임감 있는 당신이 관계에서 먼저 마음을 열지 못하는 심리학적 이유.',
        readTime: '4분',
        emoji: '🛡️',
        gradient: ['#F8FAFC', '#E2E8F0'],
        accentColor: '#475569',
        likes: 167,
        content: [
            { heading: '신뢰의 비용', text: '당신에게 신뢰는 가볍게 주어지는 것이 아닙니다. 한 번 배신당한 경험이 오래 남고, 그래서 더 조심스럽게 됩니다.' },
            { heading: '방어의 역설', text: '너무 오래 관망하면 상대방이 먼저 떠나버릴 수 있습니다. 작은 신뢰의 제스처가 큰 관계를 만드는 신호탄이 됩니다.' },
            { heading: '첫 걸음', text: '완전히 믿지 않아도 괜찮습니다. 작은 정보 하나를 먼저 나눠보세요. 상대방의 반응을 보며 신뢰를 쌓아가는 것도 방법입니다.' },
        ],
    },
    {
        id: 6,
        category: 'ENTP · ENFP',
        tag: '탐험형',
        title: '아이디어는 넘치는데 실행이 안 되는 당신에게',
        summary: '창의적인 당신의 에너지를 실제 관계와 삶에 연결하는 방법.',
        readTime: '3분',
        emoji: '🌈',
        gradient: ['#FDF4FF', '#FAE8FF'],
        accentColor: '#C026D3',
        likes: 289,
        content: [
            { heading: '아이디어 폭발의 문제', text: '당신의 머릿속은 항상 새로운 가능성으로 가득합니다. 하지만 그 아이디어들이 서로 경쟁하며 결국 아무것도 실행되지 않는 경험, 익숙하지 않나요?' },
            { heading: '더 좋은 아이디어의 함정', text: '관계도 마찬가지입니다. 더 재미있는 사람이 있을 것 같아서, 현재 관계에 충분히 투자하지 못하는 경우가 있습니다.' },
            { heading: '한 가지에 집중하기', text: '이번 주 한 사람에게 온전히 집중해보세요. 새로운 사람을 만나는 것보다 기존 관계의 깊이를 더하는 것이 더 큰 만족을 줄 수 있습니다.' },
        ],
    },
];

// 아티클 카드 컴포넌트
const ArticleCard = ({ article, onClick, saved, onSave }) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        style={{
            background: `linear-gradient(135deg, ${article.gradient[0]}, ${article.gradient[1]})`,
            borderRadius: '22px',
            padding: '22px',
            cursor: 'pointer',
            border: `1px solid ${article.accentColor}20`,
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.6rem' }}>{article.emoji}</span>
                <span style={{ background: article.accentColor, color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '100px' }}>{article.tag}</span>
            </div>
            <button
                onClick={e => { e.stopPropagation(); onSave(article.id); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: saved ? article.accentColor : '#CBD5E1' }}
            >
                <Bookmark size={20} fill={saved ? article.accentColor : 'none'} />
            </button>
        </div>
        <h3 style={{ fontWeight: 900, fontSize: '1.05rem', margin: '0 0 8px', color: '#1E293B', lineHeight: 1.4 }}>
            {article.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 14px', lineHeight: 1.5 }}>{article.summary}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {article.readTime} 읽기
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={13} color={article.accentColor} /> {article.likes}
            </span>
        </div>
    </motion.div>
);

// 아티클 상세 뷰
const ArticleDetail = ({ article, onBack }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(article.likes);

    const handleLike = () => {
        setLiked(prev => !prev);
        setLikes(prev => liked ? prev - 1 : prev + 1);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 5% 40px' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', marginBottom: '24px', fontSize: '0.95rem' }}>
                <ArrowLeft size={18} /> 돌아가기
            </button>
            <div style={{ background: `linear-gradient(135deg, ${article.gradient[0]}, ${article.gradient[1]})`, borderRadius: '24px', padding: '30px', marginBottom: '30px', border: `1px solid ${article.accentColor}20` }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{article.emoji}</div>
                <span style={{ background: article.accentColor, color: 'white', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: '100px' }}>{article.category}</span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '14px 0 10px', lineHeight: 1.35 }}>{article.title}</h1>
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{article.summary}</p>
                <div style={{ marginTop: '16px', fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {article.readTime} 읽기
                </div>
            </div>

            {article.content.map((section, i) => (
                <div key={i} style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: article.accentColor, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '28px', height: '28px', background: article.accentColor, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 900 }}>{i + 1}</span>
                        {section.heading}
                    </h2>
                    <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text)', margin: 0, padding: '18px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                        {section.text}
                    </p>
                </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleLike} style={{
                    flex: 1, padding: '14px', borderRadius: '14px', border: `2px solid ${liked ? article.accentColor : 'var(--glass-border)'}`,
                    background: liked ? article.accentColor : 'var(--surface)', color: liked ? 'white' : 'var(--text)',
                    fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                    <Heart size={18} fill={liked ? 'white' : 'none'} /> {likes} 공감
                </motion.button>
                <button style={{
                    flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid var(--glass-border)',
                    background: 'var(--surface)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                    <Share2 size={18} /> 공유
                </button>
            </div>
        </motion.div>
    );
};

const SoulMagazinePage = ({ mbtiType, onBack }) => {
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [savedArticles, setSavedArticles] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    const toggleSave = (id) => setSavedArticles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const filteredArticles = activeFilter === 'saved'
        ? ARTICLES.filter(a => savedArticles.includes(a.id))
        : activeFilter === 'my-type'
            ? ARTICLES.filter(a => !mbtiType || a.category.includes(mbtiType) || a.category === '모든 타입')
            : ARTICLES;

    const featured = ARTICLES[3]; // '첫 번째 대화' 특집

    if (selectedArticle) {
        return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ padding: '24px 5%', background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    {onBack && <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>←</button>}
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>📖 소울 매거진</h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem' }}>성향별 큐레이션 아티클</p>
                    </div>
                </div>
                {/* Featured */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedArticle(featured)}
                    style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                    <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px', fontWeight: 700 }}>✨ 이번 주 특집</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: '6px' }}>{featured.title}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{featured.summary}</div>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', opacity: 0.8 }}>
                        <Clock size={13} /> {featured.readTime} · <Heart size={13} /> {featured.likes}
                    </div>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <div style={{ padding: '16px 5%', background: 'var(--surface)', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {[
                    { id: 'all', label: '전체' },
                    { id: 'my-type', label: `${mbtiType || '나의'} 타입` },
                    { id: 'saved', label: `저장됨 ${savedArticles.length > 0 ? `(${savedArticles.length})` : ''}` },
                ].map(f => (
                    <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
                        padding: '8px 20px', borderRadius: '100px', border: 'none', whiteSpace: 'nowrap',
                        background: activeFilter === f.id ? 'var(--primary)' : '#F1F5F9',
                        color: activeFilter === f.id ? 'white' : 'var(--text-muted)',
                        fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem',
                    }}>{f.label}</button>
                ))}
            </div>

            {/* Articles Grid */}
            <div style={{ padding: '20px 5%', display: 'grid', gap: '16px' }}>
                <AnimatePresence>
                    {filteredArticles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔖</div>
                            <p>저장한 아티클이 없습니다.<br />북마크 버튼으로 저장해보세요!</p>
                        </div>
                    ) : (
                        filteredArticles.map(article => (
                            <motion.div key={article.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ArticleCard
                                    article={article}
                                    onClick={() => setSelectedArticle(article)}
                                    saved={savedArticles.includes(article.id)}
                                    onSave={toggleSave}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SoulMagazinePage;
