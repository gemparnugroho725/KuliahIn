import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdDashboard, MdPeople, MdMenuBook, MdLogout, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';

const adminNavItems = [
    { to: '/admin/dashboard', icon: <MdDashboard />, label: 'Dashboard Utama' },
    { to: '/admin', icon: <MdDashboard />, label: 'Overview Data' },
    { to: '/admin/users', icon: <MdPeople />, label: 'Kelola User' },
];

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success('Berhasil logout!');
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>🛡️</div>
                <div className="sidebar-logo-text">Admin<span>Panel</span></div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Manajemen Sistem</div>

                {adminNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        end={item.to === '/admin'} // Exact matching for /admin so it doesn't stay active on sub-routes
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}

                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <NavLink
                        to="/dashboard"
                        className="sidebar-link"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <span className="sidebar-link-icon"><MdArrowBack /></span>
                        Ke Dashboard User
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={handleLogout} title="Logout">
                    <img
                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                        alt={user?.name}
                        className="sidebar-user-avatar"
                    />
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name || 'Administrator'}</div>
                        <div className="sidebar-user-email">{user?.email || 'admin@kuliahin.com'}</div>
                    </div>
                    <MdLogout style={{ color: '#EF4444', fontSize: '18px' }} />
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
