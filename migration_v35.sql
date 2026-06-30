-- migration_v35.sql
-- 1. 누락되었던 watermelon_game_scores 테이블 생성 및 RLS 정책 수립
CREATE TABLE IF NOT EXISTS public.watermelon_game_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_fruit_level INTEGER DEFAULT 1 NOT NULL,
    season TEXT DEFAULT 'season_2' NOT NULL,
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

-- 2. 이미 존재하는 다른 게임 점수 테이블들에 season 컬럼이 없을 때만 추가하는 안전 쿼리 (PL/pgSQL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apple_game_scores' AND column_name='season') THEN
        ALTER TABLE public.apple_game_scores ADD COLUMN season TEXT DEFAULT 'season_2' NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shisen_sho_scores' AND column_name='season') THEN
        ALTER TABLE public.shisen_sho_scores ADD COLUMN season TEXT DEFAULT 'season_2' NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='game_2048_scores' AND column_name='season') THEN
        ALTER TABLE public.game_2048_scores ADD COLUMN season TEXT DEFAULT 'season_2' NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tikatuka_game_scores' AND column_name='season') THEN
        ALTER TABLE public.tikatuka_game_scores ADD COLUMN season TEXT DEFAULT 'season_2' NOT NULL;
    END IF;
END $$;

-- 3. 모든 게임(사과, 사천성, 2048, 주사위)의 기존 테이블 누적 데이터를 'season_1' (명예의 전당)으로 일괄 안전 이전
UPDATE public.apple_game_scores SET season = 'season_1';
UPDATE public.shisen_sho_scores SET season = 'season_1';
UPDATE public.game_2048_scores SET season = 'season_1';
UPDATE public.tikatuka_game_scores SET season = 'season_1';

-- 4. profiles 테이블의 apple_game_best_score에서 사과게임 시즌 1(명예의 전당)로 기록 이식 복원
INSERT INTO public.apple_game_scores (user_id, score, season, created_at)
SELECT id, apple_game_best_score, 'season_1', NOW() - INTERVAL '1 day'
FROM public.profiles
WHERE apple_game_best_score > 0
ON CONFLICT DO NOTHING;
