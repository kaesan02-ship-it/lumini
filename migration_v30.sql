-- migration_v30.sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table sync
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS game TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deep_soul JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_data JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mbti_type TEXT;

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
