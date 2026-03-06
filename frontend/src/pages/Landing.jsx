import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdCalendarToday, MdAssignment, MdChecklist, MdMenuBook, MdArrowForward, MdStar } from 'react-icons/md';
import toast from 'react-hot-toast';

const features = [
    {
        icon: '📅',
        title: 'Jadwal Kuliah Terorganisir',
        desc: 'Kelola jadwal perkuliahan dalam tampilan mingguan yang intuitif. Tidak ada lagi kebingungan kelas mana yang harus dihadiri.',
        bg: 'var(--color-primary-50)',
        color: 'var(--color-primary)',
    },
    {
        icon: '📝',
        title: 'Tugas & Deadline Terpantau',
        desc: 'Catat semua tugas dengan deadline, prioritas, dan status. Kamu tahu persis tugas mana yang harus diselesaikan duluan.',
        bg: 'var(--color-secondary-light)',
        color: 'var(--color-secondary)',
    },
    {
        icon: '✅',
        title: 'Todo Harian yang Simpel',
        desc: 'Checklist cepat untuk aktivitas harian. Dari belanja buku sampai reminder pertemuan, semua tercatat dengan rapi.',
        bg: 'var(--color-success-light)',
        color: 'var(--color-success)',
    },
    {
        icon: '🤖',
        title: 'Ruang Belajar Berbasis AI',
        desc: 'Upload materi atau tulis catatan, lalu biarkan AI merangkumnya untuk kamu. Belajar lebih efektif dan efisien.',
        bg: 'var(--color-warning-light)',
        color: 'var(--color-warning)',
    },
    {
        icon: '🔔',
        title: 'Notifikasi Tepat Waktu',
        desc: 'Dapatkan pengingat sebelum kelas dimulai dan sebelum deadline tugas tiba. Tidak ada lagi yang terlewat.',
        bg: 'var(--color-danger-light)',
        color: 'var(--color-danger)',
    },
    {
        icon: '☁️',
        title: 'Login dengan Google',
        desc: 'Satu akun Google cukup untuk semua. Data tersimpan di cloud dan bisa diakses kapan saja, di mana saja.',
        bg: '#E0F2FE',
        color: '#0284C7',
    },
];

const Landing = () => {
    const navigate = useNavigate();
    const { loginDemo } = useAuth();

    const handleDemoLogin = async () => {
        try {
            await loginDemo();
            toast.success('Selamat datang di Kuliahin! 🎉');
            navigate('/dashboard');
        } catch {
            toast.error('Gagal login demo. Pastikan backend berjalan.');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
    };

    return (
        <div className="landing">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-nav-logo">
                    <span style={{ fontSize: 28 }}>📚</span>
                    <span>Kuliah<span style={{ color: 'var(--color-primary)' }}>in</span></span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={handleDemoLogin}>
                        Coba Demo
                    </button>
                    <button className="btn btn-primary" onClick={handleGoogleLogin}>
                        Masuk dengan Google
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 80px 60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                    <div>
                        <div className="hero-badge">
                            <MdStar /> Platform #1 untuk Mahasiswa Indonesia
                        </div>
                        <h1 className="hero-title">
                            Stop jadi{' '}
                            <span className="hero-title-accent">H-1 Warrior,</span>{' '}
                            mulai kuliah tertata.
                        </h1>
                        <p className="hero-desc">
                            Kuliahin hadir untuk membantu kamu mengelola jadwal kuliah, tugas, dan aktivitas harian dalam satu platform yang simpel, modern, dan powerful.
                        </p>
                        <div className="hero-actions">
                            <button
                                className="btn btn-primary"
                                style={{ padding: '14px 28px', fontSize: 15 }}
                                onClick={handleDemoLogin}
                            >
                                Mulai Gratis <MdArrowForward />
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '14px 28px', fontSize: 15 }}
                                onClick={handleGoogleLogin}
                            >
                                <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: 16, height: 16 }} />
                                Masuk dengan Google
                            </button>
                        </div>

                        {/* Social proof */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
                            <div style={{ display: 'flex' }}>
                                {['Budi', 'Sari', 'Deni', 'Rani'].map((name) => (
                                    <img
                                        key={name}
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                                        alt={name}
                                        style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid white', marginLeft: -8, background: 'var(--color-primary-50)' }}
                                    />
                                ))}
                            </div>
                            <div>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: '#F59E0B' }}>★</span>)}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Dipercaya 1,000+ mahasiswa</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual – Dashboard Preview */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-secondary-light))',
                            borderRadius: 'var(--radius-xl)',
                            padding: 24,
                            boxShadow: 'var(--shadow-lg)',
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                📊 Dashboard Preview
                            </div>
                            {/* Mini stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                {[
                                    { label: 'Jadwal Minggu Ini', val: '6 MK', color: 'var(--color-primary)', bg: 'var(--color-primary-50)' },
                                    { label: 'Tugas Aktif', val: '4 Tugas', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
                                    { label: 'Todo Selesai', val: '3/5', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
                                    { label: 'Deadline Dekat', val: '2 Hari', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
                                ].map((s) => (
                                    <div key={s.label} style={{ background: s.bg, borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Mini jadwal list */}
                            {[
                                { mk: 'Pemrograman Web', time: '08:00 – 10:00', color: '#2563EB' },
                                { mk: 'Basis Data', time: '10:00 – 12:00', color: '#7C3AED' },
                                { mk: 'Rekayasa Perangkat Lunak', time: '13:00 – 15:00', color: '#D97706' },
                            ].map((j) => (
                                <div key={j.mk} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                                    background: 'white', borderRadius: 8, marginBottom: 6,
                                    borderLeft: `3px solid ${j.color}`,
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600 }}>{j.mk}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{j.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Floating badge */}
                        <div style={{
                            position: 'absolute', top: -16, right: -16,
                            background: 'var(--color-success)', color: 'white',
                            borderRadius: 'var(--radius-full)', padding: '6px 14px',
                            fontSize: 13, fontWeight: 700,
                            boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                        }}>
                            ✓ PWA Ready
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ background: 'var(--bg-base)', padding: '80px 80px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, color: 'var(--text-primary)' }}>
                            Semua yang kamu butuhkan,{' '}
                            <span style={{ color: 'var(--color-primary)' }}>dalam satu tempat</span>
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 12 }}>
                            Fitur-fitur yang dirancang khusus untuk kebutuhan mahasiswa modern Indonesia.
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((f) => (
                            <div key={f.title} className="feature-card">
                                <div className="feature-icon" style={{ background: f.bg }}>
                                    {f.icon}
                                </div>
                                <div className="feature-title">{f.title}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                padding: '80px',
                textAlign: 'center',
            }}>
                <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: -1 }}>
                    Siap jadi mahasiswa yang lebih produktif?
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 }}>
                    Gratis selamanya. Tidak perlu kartu kredit. Mulai sekarang.
                </p>
                <button
                    className="btn"
                    style={{ background: 'white', color: 'var(--color-primary)', padding: '16px 40px', fontSize: 16, fontWeight: 700, borderRadius: 'var(--radius-full)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    onClick={handleDemoLogin}
                >
                    Mulai Gratis Sekarang →
                </button>
            </section>

            {/* Footer */}
            <footer style={{ background: 'var(--bg-sidebar)', color: 'var(--text-sidebar)', padding: '32px 80px', textAlign: 'center', fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>📚</span>
                    <strong style={{ color: 'white', fontSize: 18 }}>Kuliahin</strong>
                </div>
                <p>© 2024 Kuliahin. Platform manajemen perkuliahan untuk mahasiswa Indonesia.</p>
            </footer>
        </div>
    );
};

export default Landing;
