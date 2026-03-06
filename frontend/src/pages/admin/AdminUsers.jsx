import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { MdBlock, MdCheckCircle } from 'react-icons/md';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Gagal mengambil data user.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;
            
            toast.success(`User berhasil di-${newStatus === 'banned' ? 'Blokir' : 'Aktifkan'}`);
            fetchUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Gagal mengubah status user.');
        }
    };

    if (loading) return <div>Memuat daftar user...</div>;

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Kelola User</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Pantau dan kelola akses pengguna aplikasi.</p>

            <div style={{ background: 'white', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Nama User</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Email</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Role</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{u.name || 'User Baru'}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{u.email}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        background: u.role === 'admin' ? '#EDE9FE' : '#F1F5F9',
                                        color: u.role === 'admin' ? '#7C3AED' : '#475569',
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        background: u.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                                        color: u.status === 'active' ? '#16A34A' : '#DC2626',
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}>
                                        {u.status === 'active' ? 'Aktif' : 'Diblokir'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {u.role !== 'admin' && (
                                        <button 
                                            onClick={() => toggleUserStatus(u.id, u.status)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: u.status === 'active' ? '#EF4444' : '#10B981',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                fontSize: 13,
                                                fontWeight: 600
                                            }}
                                        >
                                            {u.status === 'active' ? <><MdBlock size={18} /> Blokir Akun</> : <><MdCheckCircle size={18} /> Aktifkan</>}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Belum ada data user.</div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
