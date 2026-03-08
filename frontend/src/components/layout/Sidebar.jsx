import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdDashboard, MdCalendarToday, MdAssignment, MdChecklist, MdMenuBook, MdPerson, MdLogout, MdAdminPanelSettings } from 'react-icons/md';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
];

const mainItems = [
    { to: '/jadwal', icon: <MdCalendarToday />, label: 'Jadwal Kuliah' },
    { to: '/tugas', icon: <MdAssignment />, label: 'Tugas' },
    { to: '/todo', icon: <MdChecklist />, label: 'Todo' },
    { to: '/ruang-belajar', icon: <MdMenuBook />, label: 'Ruang Belajar' },
];

const Sidebar = () => {
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
                <div className="sidebar-logo-icon">📚</div>
                <div className="sidebar-logo-text">Kulia<span>hin</span></div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}

                <div className="sidebar-section-label">Menu Utama</div>

                {mainItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}

                <div className="sidebar-section-label">Akun</div>
                <NavLink
                    to="/profil"
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <span className="sidebar-link-icon"><MdPerson /></span>
                    Profil & Pengaturan
                </NavLink>

                {user?.role === 'admin' && (
                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <div className="sidebar-section-label" style={{ color: '#FCD34D' }}>Khusus Admin</div>
                        <NavLink
                            to="/admin"
                            className="sidebar-link"
                            style={{ background: '#FEF3C7', color: '#D97706', fontWeight: 600, marginTop: 8 }}
                        >
                            <span className="sidebar-link-icon" style={{ color: '#D97706' }}><MdAdminPanelSettings /></span>
                            Dashboard Admin →
                        </NavLink>
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={handleLogout} title="Logout">
                    <img
                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                        alt={user?.name}
                        className="sidebar-user-avatar"
                    />
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name || 'Mahasiswa'}</div>
                        <div className="sidebar-user-email">{user?.email || ''}</div>
                    </div>
                    <MdLogout style={{ color: '#94A3B8', fontSize: '18px' }} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
