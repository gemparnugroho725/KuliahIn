import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jadwalAPI, tugasAPI, todoAPI } from '../services/api';
import { getTodayName, getDeadlineInfo, formatDate, STATUS_CONFIG } from '../utils/helpers';
import { MdCalendarToday, MdAssignment, MdChecklist, MdMenuBook, MdArrowForward, MdAccessTime } from 'react-icons/md';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jadwal, setJadwal] = useState([]);
    const [tugas, setTugas] = useState([]);
    const [todo, setTodo] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [j, t, td] = await Promise.all([jadwalAPI.getAll(), tugasAPI.getAll(), todoAPI.getAll()]);
                setJadwal(j.data.data);
                setTugas(t.data.data);
                setTodo(td.data.data);
            } catch { }
            setLoading(false);
        };
        load();
    }, []);

    const today = getTodayName();
    const todayJadwal = jadwal.filter((j) => j.hari === today).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
    const activeJadwal = tugas.filter((t) => t.status !== 'selesai').slice(0, 4);
    const activeTodo = todo.filter((t) => !t.selesai).slice(0, 5);
    const todoSelesai = todo.filter((t) => t.selesai).length;

    const stats = [
        { label: 'Jadwal Minggu Ini', value: jadwal.length, icon: '📅', bg: 'var(--color-primary-50)', color: 'var(--color-primary)', route: '/jadwal' },
        { label: 'Tugas Aktif', value: tugas.filter((t) => t.status !== 'selesai').length, icon: '📝', bg: 'var(--color-danger-light)', color: 'var(--color-danger)', route: '/tugas' },
        { label: 'Todo Selesai', value: `${todoSelesai}/${todo.length}`, icon: '✅', bg: 'var(--color-success-light)', color: 'var(--color-success)', route: '/todo' },
        {
            label: 'Deadline Dekat', value: tugas.filter((t) => {
                const d = getDeadlineInfo(t.deadline);
                return d.class !== 'deadline-ok' && t.status !== 'selesai';
            }).length, icon: '⚠️', bg: 'var(--color-warning-light)', color: 'var(--color-warning)', route: '/tugas'
        },
    ];

    if (loading) return (
        <div className="page-loader">
            <div className="spinner spinner-primary" style={{ width: 36, height: 36 }} />
            <span style={{ color: 'var(--text-secondary)' }}>Memuat dashboard...</span>
        </div>
    );

    return (
        <div>
            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="stat-card card-hover"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(s.route)}
                    >
                        <div className="stat-icon" style={{ background: s.bg }}>
                            {s.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Dashboard Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Today's Schedule */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: 16 }}>
                                    <MdCalendarToday style={{ verticalAlign: -2, marginRight: 6, color: 'var(--color-primary)' }} />
                                    Jadwal Hari Ini – {today}
                                </h3>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jadwal')}>
                                Lihat Semua <MdArrowForward />
                            </button>
                        </div>
                        {todayJadwal.length === 0 ? (
                            <div className="empty-state" style={{ padding: '24px 20px' }}>
                                <div className="empty-icon">🎉</div>
                                <div className="empty-title">Tidak ada kuliah hari ini!</div>
                                <div className="empty-desc">Saatnya catch up tugas atau istirahat.</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {todayJadwal.map((j) => (
                                    <div
                                        key={j.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-base)',
                                            borderLeft: `4px solid ${j.warna}`,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{j.mataKuliah}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 12 }}>
                                                <span><MdAccessTime style={{ verticalAlign: -1 }} /> {j.jamMulai} – {j.jamSelesai}</span>
                                                {j.ruangan && <span>📍 {j.ruangan}</span>}
                                                {j.dosen && <span>👨‍🏫 {j.dosen}</span>}
                                            </div>
                                        </div>
                                        <div className="badge" style={{ background: j.warna + '20', color: j.warna }}>
                                            {j.jamMulai}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>
                                <MdAssignment style={{ verticalAlign: -2, marginRight: 6, color: 'var(--color-danger)' }} />
                                Tugas Terdekat
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tugas')}>
                                Lihat Semua <MdArrowForward />
                            </button>
                        </div>
                        {activeJadwal.length === 0 ? (
                            <div className="empty-state" style={{ padding: '24px 20px' }}>
                                <div className="empty-icon">🎊</div>
                                <div className="empty-title">Semua tugas selesai!</div>
                            </div>
                        ) : (
                            <div className="tugas-list">
                                {activeJadwal.map((t) => {
                                    const dl = getDeadlineInfo(t.deadline);
                                    const sc = STATUS_CONFIG[t.status];
                                    return (
                                        <div key={t.id} className="tugas-card" onClick={() => navigate('/tugas')} style={{ cursor: 'pointer' }}>
                                            <div className="tugas-info">
                                                <div className="tugas-title">{t.judul}</div>
                                                <div className="tugas-meta">
                                                    <span>📘 {t.mataKuliah}</span>
                                                    <span className={dl.class}>⏰ {dl.text}</span>
                                                    <span className={`badge ${sc.badgeClass}`}>{sc.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Todo Card */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>
                                <MdChecklist style={{ verticalAlign: -2, marginRight: 6, color: 'var(--color-success)' }} />
                                Todo Aktif
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/todo')}>
                                Kelola <MdArrowForward />
                            </button>
                        </div>
                        {activeTodo.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Tidak ada todo aktif 🎉</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {activeTodo.map((t) => (
                                    <div key={t.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '8px 12px', background: 'var(--bg-base)',
                                        borderRadius: 'var(--radius-md)', fontSize: 13,
                                    }}>
                                        <div style={{
                                            width: 16, height: 16, borderRadius: 4,
                                            border: '2px solid var(--border-default)', flexShrink: 0,
                                        }} />
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.judul}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ruang Belajar Shortcut */}
                    <div
                        className="card"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate('/ruang-belajar')}
                    >
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
                        <h3 style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 8 }}>
                            Ruang Belajar AI
                        </h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 16 }}>
                            Upload materi atau tulis catatan, AI akan merangkumnya untuk kamu!
                        </p>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(255,255,255,0.2)', color: 'white',
                            padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600,
                        }}>
                            Buka Ruang Belajar <MdArrowForward />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
