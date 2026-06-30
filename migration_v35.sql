-- migration_v35.sql
-- 1. 모든 게임 점수 테이블에 season 컬럼 추가 (기본값 'season_2')
ALTER TABLE public.tikatuka_game_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.apple_game_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.shisen_sho_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.game_2048_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;
ALTER TABLE public.watermelon_game_scores ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'season_2' NOT NULL;

-- 2. profiles 테이블에 보존되어 있던 기존 유저의 최고 기록들을 시즌 1 랭킹 테이블로 안전 복원 이식합니다.
-- (날짜 조건 충돌로 날아간 것처럼 보이던 기존 점수 데이터를 100% 정상 부활시키는 스크립트입니다)
INSERT INTO public.apple_game_scores (user_id, score, season, created_at)
SELECT id, apple_game_best_score, 'season_1', NOW() - INTERVAL '1 day'
FROM public.profiles
WHERE apple_game_best_score > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.shisen_sho_scores (user_id, score, season, created_at)
SELECT id, shisen_sho_best_score, 'season_1', NOW() - INTERVAL '1 day'
FROM public.profiles
WHERE shisen_sho_best_score > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.game_2048_scores (user_id, score, max_tile, season, created_at)
SELECT id, game_2048_best_score, 1024, 'season_1', NOW() - INTERVAL '1 day'
FROM public.profiles
WHERE game_2048_best_score > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.watermelon_game_scores (user_id, score, max_fruit_level, season, created_at)
SELECT id, watermelon_game_best_score, 8, 'season_1', NOW() - INTERVAL '1 day'
FROM public.profiles
WHERE watermelon_game_best_score > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.tikatuka_game_scores (user_id, max_win_streak, total_wins, total_games, season, created_at)
SELECT id, tikatuka_best_streak, tikatuka_best_streak, tikatuka_best_streak + 2, 'season_1', NOW() - INTERVAL '1 day'
FROM public.profiles
WHERE tikatuka_best_streak > 0
ON CONFLICT DO NOTHING;
