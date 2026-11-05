import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://uotscostmadmnaypdxus.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mHGxmjB5owN6nW4yGf6N7g_m4TovL_t';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
