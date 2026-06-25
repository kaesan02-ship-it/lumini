-- migration_v33.sql
-- 수박게임 제한시간제 기반 점수 기록용 테이블 생성

CREATE TABLE IF NOT EXISTS public.watermelon_game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    max_fruit_level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.watermelon_game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Watermelon game scores are viewable by everyone." 
ON public.watermelon_game_scores FOR SELECT 
USING ( true );

CREATE POLICY "Users can insert their own Watermelon game scores." 
ON public.watermelon_game_scores FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

CREATE INDEX IF NOT EXISTS idx_watermelon_game_scores_score ON public.watermelon_game_scores(score DESC);
