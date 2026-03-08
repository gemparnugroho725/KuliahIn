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
            // We must use supabaseAdmin to bypass RLS to count all profiles
            const { supabaseAdmin } = await import('../../services/supabase');
            if(!supabaseAdmin) throw new Error("Supabase Admin Client not found");

            const [usersReq, tugasReq, jadwalReq] = await Promise.all([
                supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="stat-card card-hover">
                    <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                        <MdPeople />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ color: '#0284C7' }}>{stats.users}</div>
                        <div className="stat-label">Total User Terdaftar</div>
                    </div>
                </div>

                <div className="stat-card card-hover">
                    <div className="stat-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                        <MdMenuBook />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ color: '#DC2626' }}>{stats.tugas}</div>
                        <div className="stat-label">Total Tugas Dibuat</div>
                    </div>
                </div>

                <div className="stat-card card-hover">
                    <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                        <MdChecklist />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ color: '#D97706' }}>{stats.jadwal}</div>
                        <div className="stat-label">Total Jadwal Kuliah</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
