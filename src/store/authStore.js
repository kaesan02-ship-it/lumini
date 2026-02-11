import { create } from 'zustand';
import { supabase } from '../supabase/client';

const useAuthStore = create((set) => ({
    user: null,
    session: null,
    loading: true,

    setSession: (session) => set({
        session,
        user: session?.user || null,
        loading: false
    }),

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    signUp: async (email, password, metadata) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },

    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) throw error;
        return data;
    }
}));

export default useAuthStore;
