import { createClient } from '@supabase/supabase-js';

// 🚨 중요: Supabase SDK가 createClient 실행 시 URL 해시(#access_token=...&type=recovery)를
// 자동으로 읽고 즉시 지워버리므로, SDK 초기화 직전에 복구 링크 진입 여부를 먼저 감지하여 보관합니다!
try {
    if (
        typeof window !== 'undefined' &&
        (window.location.hash.includes('type=recovery') ||
            window.location.search.includes('type=recovery'))
    ) {
        sessionStorage.setItem('lumini_password_recovery', 'true');
    }
} catch {
    // ignore
}

const DEFAULT_SUPABASE_URL = 'https://uotscostmadmnaypdxus.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mHGxmjB5owN6nW4yGf6N7g_m4TovL_t';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
