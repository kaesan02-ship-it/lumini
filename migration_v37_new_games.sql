-- =====================================================================
-- Lumini Migration v37: 신규 6종 아케이드 미니게임 통합 점수/랭킹 테이블
-- 대상 게임:
--   1. color-eye (🎨 컬러 아이 테스트)
--   2. speed-number (⚡ 1~25 스피드 터치)
--   3. blind-timer (⏱️ 인간 스톱워치 7.77초)
--   4. stack-tower (🥞 소울펫 팬케이크 탑)
--   5. reflex-battle (🧠 청개구리 반사신경)
--   6. memory-match (🃏 소울펫 기억력 카드)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.arcade_game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    detail TEXT DEFAULT '',
    season TEXT NOT NULL DEFAULT 'season_3',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 시즌별·게임별 고득점 정렬 조회를 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_arcade_game_scores_lookup
    ON public.arcade_game_scores (game_id, season, score DESC);

-- RLS 활성화 및 정책 설정
ALTER TABLE public.arcade_game_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read arcade_game_scores" ON public.arcade_game_scores;
CREATE POLICY "Anyone can read arcade_game_scores"
    ON public.arcade_game_scores FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert arcade_game_scores" ON public.arcade_game_scores;
CREATE POLICY "Authenticated users can insert arcade_game_scores"
    ON public.arcade_game_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);
