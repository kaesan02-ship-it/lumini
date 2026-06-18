-- migration_v31.sql
-- 사과게임 누적 명예의 전당용 점수 기록 테이블 생성

CREATE TABLE IF NOT EXISTS public.apple_game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (보안 정책) 활성화
ALTER TABLE public.apple_game_scores ENABLE ROW LEVEL SECURITY;

-- 1. 모든 유저가 명예의 전당 점수를 조회할 수 있는 정책
CREATE POLICY "Scores are viewable by everyone." 
ON public.apple_game_scores FOR SELECT 
USING ( true );

-- 2. 로그인한 유저가 본인의 점수 기록을 기록(저장)할 수 있는 정책
CREATE POLICY "Users can insert their own scores." 
ON public.apple_game_scores FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

-- 성능 인덱싱 추가 (점수 높은 순서로 정렬하여 불러올 때 고속 검색 지원)
CREATE INDEX IF NOT EXISTS idx_apple_game_scores_score ON public.apple_game_scores(score DESC);
