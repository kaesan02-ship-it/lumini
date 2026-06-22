-- migration_v32.sql
-- 사천성 및 2048 게임 실시간 랭킹 기록용 테이블 생성

-- 1. 사천성 (제한시간제 기반 점수 기록)
CREATE TABLE IF NOT EXISTS public.shisen_sho_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.shisen_sho_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shisen-sho scores are viewable by everyone." 
ON public.shisen_sho_scores FOR SELECT 
USING ( true );

CREATE POLICY "Users can insert their own Shisen-sho scores." 
ON public.shisen_sho_scores FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

CREATE INDEX IF NOT EXISTS idx_shisen_sho_scores_score ON public.shisen_sho_scores(score DESC);

-- 2. 2048 (점수 기록)
CREATE TABLE IF NOT EXISTS public.game_2048_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    max_tile INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.game_2048_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "2048 scores are viewable by everyone." 
ON public.game_2048_scores FOR SELECT 
USING ( true );

CREATE POLICY "Users can insert their own 2048 scores." 
ON public.game_2048_scores FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

CREATE INDEX IF NOT EXISTS idx_game_2048_scores_score ON public.game_2048_scores(score DESC);
