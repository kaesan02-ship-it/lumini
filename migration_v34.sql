-- migration_v34.sql
-- 티카투카 주사위 대전 연승 기록용 테이블 생성

CREATE TABLE IF NOT EXISTS public.tikatuka_game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    max_win_streak INTEGER NOT NULL DEFAULT 0,
    total_wins INTEGER NOT NULL DEFAULT 0,
    total_games INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tikatuka_game_scores ENABLE ROW LEVEL SECURITY;

-- 누구나 연승 리더보드를 조회할 수 있는 셀렉트 정책
CREATE POLICY "Tikatuka game scores are viewable by everyone." 
ON public.tikatuka_game_scores FOR SELECT 
USING ( true );

-- 사용자가 자기 자신의 최고 연승 기록을 등록할 수 있는 인서트 정책
CREATE POLICY "Users can insert their own Tikatuka game scores." 
ON public.tikatuka_game_scores FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

-- 사용자가 자기 자신의 최고 연승 기록을 업데이트할 수 있는 업데이트 정책
CREATE POLICY "Users can update their own Tikatuka game scores."
ON public.tikatuka_game_scores FOR UPDATE
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- 연승 기준 내림차순 정렬 조회를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tikatuka_game_scores_streak ON public.tikatuka_game_scores(max_win_streak DESC);
