import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Jadwal from './pages/Jadwal';
import Tugas from './pages/Tugas';
import Todo from './pages/Todo';
import RuangBelajar from './pages/RuangBelajar';
import Profil from './pages/Profil';

// Admin Components
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';

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
    if (loading) return <div style={{ padding: 20 }}>Loading Public Route... (Menunggu Supabase)</div>;
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

// Wrapper Route (Khusus Admin)
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Memeriksa hak akses...</div>;
    }

    // Hanya perbolehkan role admin
    if (!user || user.role !== 'admin') {
        // Assuming toast is imported from 'react-hot-toast'
        // If not, you'll need to import it: import toast from 'react-hot-toast';
        // For now, I'll assume it's available or will be added.
        // toast.error('Akses ditolak! Halaman khusus Admin.'); // Uncomment if toast is imported
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />

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

        {/* Admin Routes */}
        <Route element={
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        }>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUsers />} />
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
