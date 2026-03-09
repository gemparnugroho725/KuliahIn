import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdAdd, MdNotifications } from 'react-icons/md';
import { getGreeting } from '../../utils/helpers';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

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
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const [showNotif, setShowNotif] = useState(false);
    
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
                <div style={{ position: 'relative' }}>
                    <button 
                        className="topbar-btn" 
                        title="Notifikasi"
                        onClick={() => setShowNotif(!showNotif)}
                    >
                        <MdNotifications />
                        {unreadCount > 0 && (
                            <span className="notif-badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <span>Notifikasi</span>
                                <button onClick={clearAll} className="notif-clear-btn">Hapus Semua</button>
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">Tidak ada notifikasi</div>
                                ) : (
                                    notifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            className={`notif-item ${!n.read ? 'unread' : ''}`}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <div className="notif-item-title">{n.title}</div>
                                            <div className="notif-item-msg">{n.message}</div>
                                            <div className="notif-item-time">
                                                {formatDistanceToNow(new Date(n.time), { addSuffix: true, locale: idLocale })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
