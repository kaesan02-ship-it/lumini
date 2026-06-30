-- migration_v35.sql
-- 1. tikatuka_game_scores 테이블에 season 컬럼 추가 (기본값 'season_2')
ALTER TABLE public.tikatuka_game_scores 
ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;

-- 2. 6월 30일 16시 37분 이전의 모든 기존 데이터를 'season_1' (명예의 전당)으로 이전
-- (UTC 기준 2026-06-30T07:37:00Z 이전 데이터가 대상입니다)
UPDATE public.tikatuka_game_scores
SET season = 'season_1'
WHERE created_at < '2026-06-30T07:37:00Z';
