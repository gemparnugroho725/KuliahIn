import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            console.log('[Auth] initAuth started');
            try {
                console.log('[Auth] Fetching session...');
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log('[Auth] Session fetched:', session, error);
                if (error) throw error;
                
                if (session?.user) {
                    console.log('[Auth] User found, handling session...');
                    await handleUserSession(session.user);
                    console.log('[Auth] User session handled');
                }
            } catch (err) {
                console.error('[Auth] Initialization error:', err);
                setUser(null); // Ensure user is null if auth fails
            } finally {
                console.log('[Auth] initAuth finally block executed');
                setLoading(false); // This MUST run
            }
        };

        initAuth();

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await handleUserSession(session.user);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUserSession = async (supabaseUser) => {
        console.log('[Auth] handleUserSession started for:', supabaseUser.id);
        try {
            console.log('[Auth] Fetching profile from database...');
            // Fetch profile data with a strict 5-second timeout (Fail-safe against browser extensions blocking fetch silently)
            const fetchPromise = supabase
                .from('profiles')
                .select('role, status')
                .eq('id', supabaseUser.id)
                .single();
                
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('SUPABASE_TIMEOUT')), 5000)
            );

            // Race the fetch against the timeout
            const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]);

            console.log('[Auth] Profile fetched:', profile, error);

            if (error && error.code !== 'PGRST116') {
                console.error('[Auth] Error fetching profile:', error);
                throw error; // Rethrow so we don't accidentally log in a banned user silently
            }

            // If banned, log them out immediately
            if (profile?.status === 'banned') {
                console.log('[Auth] User is banned, signing out...');
                await supabase.auth.signOut();
                setUser(null);
                toast.error('Akun kamu telah diblokir oleh Admin.');
                return;
            }

            console.log('[Auth] Setting user state...');
            setUser(formatUser(supabaseUser, profile));
        } catch (error) {
            console.error('[Auth] Session handling error:', error);
            setUser(formatUser(supabaseUser, null)); // Fallback if profile fetch completely fails
        }
    };

    const formatUser = (supabaseUser, profile) => {
        const meta = supabaseUser.user_metadata || {};
        const savedPrefs = JSON.parse(localStorage.getItem('kuliahin_prefs') || 'null');
        return {
            id: supabaseUser.id,
            email: supabaseUser.email || 'demo@kuliahin.app',
            name: meta.full_name || meta.name || 'Mahasiswa',
            avatar: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
            role: profile?.role || 'user',
            status: profile?.status || 'active',
            preferences: savedPrefs || {
                notifJadwal: true,
                notifDeadline: true,
                notifBrowser: false,
            },
        };
    };

    // Register manual (Email & Password)
    const register = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw error;
        return data;
    };

    // Login manual (Email & Password)
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    // Verify OTP (One-Time Password)
    const verifyOTP = async (email, token) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup',
        });
        if (error) throw error;
        return data;
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
        <AuthContext.Provider value={{ user, loading, register, login, verifyOTP, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
