import { Outlet, Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdPeople, MdLogout } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import '../../index.css';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();

    return (
        <div className="layout-container" style={{ background: '#f8fafc' }}>
            <aside className="sidebar" style={{ background: '#1e293b', color: 'white', borderRight: 'none' }}>
                <div className="sidebar-header" style={{ marginBottom: 32 }}>
                    <div className="sidebar-logo" style={{ color: 'white' }}>🛡️ Admin Panel</div>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/admin"
                        className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                        style={location.pathname === '/admin' ? { background: '#334155', color: 'white' } : { color: '#94a3b8' }}
                    >
                        <MdDashboard size={20} />
                        Overview
                    </Link>
                    <Link
                        to="/admin/users"
                        className={`nav-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
                        style={location.pathname === '/admin/users' ? { background: '#334155', color: 'white' } : { color: '#94a3b8' }}
                    >
                        <MdPeople size={20} />
                        Kelola User
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto', padding: '0 20px', paddingBottom: 24 }}>
                    <button className="btn btn-secondary btn-full" onClick={logout} style={{ color: '#f87171', border: '1px solid #f87171' }}>
                        <MdLogout /> Keluar
                    </button>
                    <Link to="/dashboard" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#94a3b8', fontSize: 13 }}>
                        Ke Dashboard User →
                    </Link>
                </div>
            </aside>

            <main className="main-content" style={{ padding: '32px 40px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
