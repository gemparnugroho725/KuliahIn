import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { MdPeople, MdMenuBook, MdChecklist } from 'react-icons/md';

const AdminOverview = () => {
    const [stats, setStats] = useState({ users: 0, tugas: 0, jadwal: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [usersReq, tugasReq, jadwalReq] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('tugas').select('id', { count: 'exact', head: true }),
                supabase.from('jadwal').select('id', { count: 'exact', head: true })
            ]);

            setStats({
                users: usersReq.count || 0,
                tugas: tugasReq.count || 0,
                jadwal: jadwalReq.count || 0
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Memuat data statistik...</div>;

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Overview Sistem</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Pantau statistik penggunaan aplikasi Kuliahin.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ background: '#E0F2FE', color: '#0284C7', padding: 16, borderRadius: '50%' }}>
                            <MdPeople size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total User Terdaftar</div>
                            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.users}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: 16, borderRadius: '50%' }}>
                            <MdMenuBook size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Tugas Dibuat</div>
                            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.tugas}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ background: '#FEF3C7', color: '#D97706', padding: 16, borderRadius: '50%' }}>
                            <MdChecklist size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Jadwal Kuliah</div>
                            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.jadwal}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
