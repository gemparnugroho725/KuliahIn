import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdAdd, MdNotifications } from 'react-icons/md';
import { getGreeting } from '../../utils/helpers';

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', subtitle: () => `${getGreeting()}! Siap produktif hari ini?` },
    '/jadwal': { title: 'Jadwal Kuliah', subtitle: () => 'Kelola jadwal perkuliahan mingguan kamu' },
    '/tugas': { title: 'Tugas', subtitle: () => 'Pantau dan selesaikan tugas tepat waktu' },
    '/todo': { title: 'Todo List', subtitle: () => 'Checklist aktivitas harianmu' },
    '/ruang-belajar': { title: 'Ruang Belajar AI', subtitle: () => 'Buat ringkasan materi dengan bantuan AI' },
    '/profil': { title: 'Profil & Pengaturan', subtitle: () => 'Kelola akun dan preferensi kamu' },
};

const Topbar = ({ onAddClick }) => {
    const location = useLocation();
    const { user } = useAuth();
    const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Kuliahin', subtitle: () => '' };

    return (
        <header className="topbar">
            <div>
                <div className="topbar-title">{pageInfo.title}</div>
                <div className="topbar-subtitle">{pageInfo.subtitle?.()}</div>
            </div>
            <div className="topbar-actions">
                {onAddClick && (
                    <button className="btn btn-primary btn-sm" onClick={onAddClick}>
                        <MdAdd style={{ fontSize: '18px' }} /> Tambah
                    </button>
                )}
                <button className="topbar-btn" title="Notifikasi">
                    <MdNotifications />
                </button>
                <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                    alt="avatar"
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--color-primary-light)' }}
                />
            </div>
        </header>
    );
};

export default Topbar;
