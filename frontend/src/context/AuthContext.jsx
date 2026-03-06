import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('kuliahin_token');
            if (token) {
                try {
                    const res = await authAPI.getMe();
                    setUser(res.data.user);
                } catch {
                    localStorage.removeItem('kuliahin_token');
                    localStorage.removeItem('kuliahin_user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const loginDemo = async () => {
        const res = await authAPI.demoLogin();
        const { token, user: userData } = res.data;
        localStorage.setItem('kuliahin_token', token);
        localStorage.setItem('kuliahin_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const loginWithToken = (token, userData) => {
        localStorage.setItem('kuliahin_token', token);
        localStorage.setItem('kuliahin_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try { await authAPI.logout(); } catch { }
        localStorage.removeItem('kuliahin_token');
        localStorage.removeItem('kuliahin_user');
        setUser(null);
    };

    const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

    return (
        <AuthContext.Provider value={{ user, loading, loginDemo, loginWithToken, logout, updateUser }}>
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
