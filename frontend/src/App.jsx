import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jadwal from './pages/Jadwal';
import Tugas from './pages/Tugas';
import Todo from './pages/Todo';
import RuangBelajar from './pages/RuangBelajar';
import Profil from './pages/Profil';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner spinner-primary" style={{ width: 36, height: 36 }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Memuat Kuliahin...</span>
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
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

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
