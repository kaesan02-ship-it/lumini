-- migration_v35.sql
-- 1. 모든 게임 점수 테이블에 season 컬럼 추가 (기본값 'season_2')
ALTER TABLE public.tikatuka_game_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.apple_game_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.shisen_sho_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.game_2048_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.watermelon_game_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;

-- 2. 6월 30일 16시 37분 이전의 모든 기존 데이터를 'season_1' (명예의 전당)으로 이전
-- (KST 16시 37분은 UTC 기준 2026-06-30 07:37:00에 해당합니다)
UPDATE public.tikatuka_game_scores SET season = 'season_1' WHERE created_at < '2026-06-30T07:37:00Z';
UPDATE public.apple_game_scores SET season = 'season_1' WHERE created_at < '2026-06-30T07:37:00Z';
UPDATE public.shisen_sho_scores SET season = 'season_1' WHERE created_at < '2026-06-30T07:37:00Z';
UPDATE public.game_2048_scores SET season = 'season_1' WHERE created_at < '2026-06-30T07:37:00Z';
UPDATE public.watermelon_game_scores SET season = 'season_1' WHERE created_at < '2026-06-30T07:37:00Z';
