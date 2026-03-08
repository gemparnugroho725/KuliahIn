import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdNotifications } from 'react-icons/md';
import { getGreeting } from '../../utils/helpers';

const PAGE_TITLES = {
    '/admin/dashboard': { title: 'Dashboard Admin', subtitle: () => `${getGreeting()}! Selamat datang di Pusat Kendali` },
    '/admin': { title: 'Overview Data', subtitle: () => 'Ringkasan statistik dan aktivitas sistem' },
    '/admin/users': { title: 'Kelola Pengguna', subtitle: () => 'Manajemen akses dan status mahasiswa' },
};

const AdminTopbar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Admin Panel', subtitle: () => 'Manajemen Kuliahin' };

    return (
        <header className="topbar">
            <div>
                <div className="topbar-title">{pageInfo.title}</div>
                <div className="topbar-subtitle">{pageInfo.subtitle?.()}</div>
            </div>
            <div className="topbar-actions">
                <button className="topbar-btn" title="Notifikasi Sistem">
                    <MdNotifications />
                </button>
                <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                    alt="avatar admin"
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--color-secondary)' }}
                />
            </div>
        </header>
    );
};

export default AdminTopbar;
