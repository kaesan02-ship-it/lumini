-- ==============================================================================
-- [루미니] 시즌 3 (Season 3) 랭킹 초기화 및 마이그레이션 SQL 스크립트 (migration_v36.sql)
-- ==============================================================================
-- 목적:
-- 1. 기존 '시즌 2' 기록들을 안전하게 보존하고, 신규 기록은 '시즌 3'으로 분리 등록되도록 테이블 기본값을 갱신합니다.
-- 2. 신규 '시즌 3' 랭킹판은 0점에서 새롭게 시작(초기화)됩니다.
-- ==============================================================================

-- 1. [안전장치] 수박 게임 테이블이 없을 경우 자동 생성
CREATE TABLE IF NOT EXISTS public.watermelon_game_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_fruit_level INTEGER DEFAULT 1 NOT NULL,
    season TEXT DEFAULT 'season_3' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.watermelon_game_scores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'watermelon_game_scores' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.watermelon_game_scores FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'watermelon_game_scores' AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users only" ON public.watermelon_game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 2. [안전장치] 모든 게임 점수 테이블에 season 컬럼이 없을 때만 추가 (PL/pgSQL 안전 블록)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apple_game_scores' AND column_name='season') THEN
        ALTER TABLE public.apple_game_scores ADD COLUMN season TEXT DEFAULT 'season_3' NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shisen_sho_scores' AND column_name='season') THEN
        ALTER TABLE public.shisen_sho_scores ADD COLUMN season TEXT DEFAULT 'season_3' NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='game_2048_scores' AND column_name='season') THEN
        ALTER TABLE public.game_2048_scores ADD COLUMN season TEXT DEFAULT 'season_3' NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tikatuka_game_scores' AND column_name='season') THEN
        ALTER TABLE public.tikatuka_game_scores ADD COLUMN season TEXT DEFAULT 'season_3' NOT NULL;
    END IF;
END $$;

-- 3. [기본값 갱신] 신규 저장 시 기본 시즌을 'season_3'으로 변경
ALTER TABLE public.apple_game_scores ALTER COLUMN season SET DEFAULT 'season_3';
ALTER TABLE public.shisen_sho_scores ALTER COLUMN season SET DEFAULT 'season_3';
ALTER TABLE public.game_2048_scores ALTER COLUMN season SET DEFAULT 'season_3';
ALTER TABLE public.watermelon_game_scores ALTER COLUMN season SET DEFAULT 'season_3';
ALTER TABLE public.tikatuka_game_scores ALTER COLUMN season SET DEFAULT 'season_3';

-- 4. [인덱스 생성] 시즌별 리더보드 조회 성능 최적화 (빠른 랭킹 로딩)
CREATE INDEX IF NOT EXISTS idx_apple_game_scores_season_score ON public.apple_game_scores(season, score DESC);
CREATE INDEX IF NOT EXISTS idx_shisen_sho_scores_season_score ON public.shisen_sho_scores(season, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_2048_scores_season_score ON public.game_2048_scores(season, score DESC);
CREATE INDEX IF NOT EXISTS idx_watermelon_game_scores_season_score ON public.watermelon_game_scores(season, score DESC);
CREATE INDEX IF NOT EXISTS idx_tikatuka_game_scores_season_streak ON public.tikatuka_game_scores(season, max_win_streak DESC);
