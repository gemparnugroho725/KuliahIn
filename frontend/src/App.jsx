import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Jadwal from './pages/Jadwal';
import Tugas from './pages/Tugas';
import Todo from './pages/Todo';
import RuangBelajar from './pages/RuangBelajar';
import Profil from './pages/Profil';

// Handles /auth/callback?token=xxx from Google OAuth redirect
const AuthCallback = () => {
    const [params] = useSearchParams();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token = params.get('token');
        if (token) {
            loginWithToken(token, {});
            window.location.href = '/dashboard';
        }
    }, []);

    return (
        <div className="page-loader">
            <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
            <span style={{ color: 'var(--text-secondary)' }}>Memproses login...</span>
        </div>
    );
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
            </div>
        );
    }
    if (!user) return <Navigate to="/" replace />;
    return children;
};

// Public route (redirect if logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/tugas" element={<Tugas />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/ruang-belajar" element={<RuangBelajar />} />
            <Route path="/profil" element={<Profil />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            borderRadius: '10px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
