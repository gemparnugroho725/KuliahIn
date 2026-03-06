import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdPerson, MdEmail, MdNotifications, MdSecurity, MdLogout } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Profil = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [prefs, setPrefs] = useState(user?.preferences || {
        notifJadwal: true, notifDeadline: true, notifBrowser: false,
    });

    const handleSavePrefs = async () => {
        setSaving(true);
        try {
            const res = await authAPI.updatePreferences(prefs);
            updateUser({ preferences: prefs });
            toast.success('Preferensi disimpan!');
        } catch { toast.error('Gagal menyimpan preferensi'); }
        setSaving(false);
    };

    const handleRequestNotif = async () => {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
                setPrefs((p) => ({ ...p, notifBrowser: true }));
                new Notification('Kuliahin', { body: 'Notifikasi browser aktif! 🎉', icon: '/icons/icon-192.png' });
                toast.success('Notifikasi browser aktif!');
            } else {
                toast.error('Izin notifikasi ditolak');
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success('Berhasil logout!');
        navigate('/');
    };

    const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profil & Pengaturan</h1>
                    <p className="page-subtitle">Kelola akun dan preferensi kamu</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
                {/* Profile Info Card */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MdPerson style={{ color: 'var(--color-primary)' }} /> Informasi Akun
                    </h3>
                    <div className="profile-header">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                            alt="avatar"
                            className="profile-avatar"
                        />
                        <div>
                            <div className="profile-name">{user?.name || 'Mahasiswa'}</div>
                            <div className="profile-email">{user?.email || '-'}</div>
                            <span className="badge badge-blue" style={{ marginTop: 8 }}>
                                Google Account
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                        <div style={{ padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <MdPerson style={{ color: 'var(--text-muted)', fontSize: 18 }} />
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nama</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || '-'}</div>
                            </div>
                        </div>
                        <div style={{ padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <MdEmail style={{ color: 'var(--text-muted)', fontSize: 18 }} />
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.email || '-'}</div>
                            </div>
                        </div>
                        <div style={{ padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <MdSecurity style={{ color: 'var(--text-muted)', fontSize: 18 }} />
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Auth</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>Google OAuth 2.0</div>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-danger"
                        style={{ width: '100%', marginTop: 20 }}
                        onClick={handleLogout}
                    >
                        <MdLogout /> Logout
                    </button>
                </div>

                {/* Notifications / Preferences */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdNotifications style={{ color: 'var(--color-warning)' }} /> Preferensi Notifikasi
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { key: 'notifJadwal', label: 'Notifikasi Jadwal', desc: 'Pengingat 15 menit sebelum kelas dimulai' },
                                { key: 'notifDeadline', label: 'Notifikasi Deadline', desc: 'Pengingat tugas yang akan jatuh tempo hari ini' },
                                { key: 'notifBrowser', label: 'Notifikasi Browser', desc: 'Notifikasi native dari browser (perlu izin)' },
                            ].map((item) => (
                                <div key={item.key} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 16px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={prefs[item.key]} onChange={() => togglePref(item.key)} />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSavePrefs} disabled={saving}>
                                {saving ? <span className="spinner" /> : null} Simpan Preferensi
                            </button>
                            {!prefs.notifBrowser && (
                                <button className="btn btn-secondary" onClick={handleRequestNotif}>
                                    Izinkan Browser
                                </button>
                            )}
                        </div>
                    </div>

                    {/* App Info */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📱 Informasi Aplikasi</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'Versi', value: 'Kuliahin v1.0.0' },
                                { label: 'Mode', value: 'Progressive Web App (PWA)' },
                                { label: 'Tech Stack', value: 'React + Express.js' },
                                { label: 'Auth', value: 'Google OAuth 2.0 + JWT' },
                            ].map((item) => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profil;
