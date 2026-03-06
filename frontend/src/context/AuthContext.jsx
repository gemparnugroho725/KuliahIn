import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) setUser(formatUser(session.user));
            setLoading(false);
        });

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(formatUser(session.user));
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const formatUser = (supabaseUser) => {
        const meta = supabaseUser.user_metadata || {};
        const savedPrefs = JSON.parse(localStorage.getItem('kuliahin_prefs') || 'null');
        return {
            id: supabaseUser.id,
            email: supabaseUser.email || 'demo@kuliahin.app',
            name: meta.full_name || meta.name || 'Mahasiswa',
            avatar: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
            preferences: savedPrefs || {
                notifJadwal: true,
                notifDeadline: true,
                notifBrowser: false,
            },
        };
    };

    // Login dengan Google
    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw error;
    };

    // Logout
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        localStorage.removeItem('kuliahin_prefs');
        setUser(null);
    };

    const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
