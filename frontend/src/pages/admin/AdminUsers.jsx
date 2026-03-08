import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { MdBlock, MdCheckCircle, MdSecurity, MdPersonOutline } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { supabaseAdmin } = await import('../../services/supabase');
            if(!supabaseAdmin) throw new Error("Supabase Admin Client not found");

            const { data, error } = await supabaseAdmin
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
            const { supabaseAdmin } = await import('../../services/supabase');
            const { error } = await supabaseAdmin
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

    const toggleUserRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        
        // Cek jika admin mencoba ubah rolenya sendiri menjadi user
        if (userId === currentUser.id && newRole === 'user') {
            toast.error('Kamu tidak bisa menghapus akses admin kamu sendiri dari halaman ini.');
            return;
        }

        if(!window.confirm(`Apakah kamu yakin ingin mengubah peran user ini menjadi ${newRole.toUpperCase()}?`)) return;

        try {
            const { supabaseAdmin } = await import('../../services/supabase');
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            
            toast.success(`Berhasil! User sekarang adalah ${newRole.toUpperCase()}`);
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Gagal mengubah peran user.');
        }
    };

    if (loading) return <div>Memuat daftar user...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                                <td style={{ padding: '16px 24px', display: 'flex', gap: 12 }}>
                                    {u.id !== currentUser.id && (
                                        <>
                                            <button 
                                                onClick={() => toggleUserRole(u.id, u.role)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: u.role === 'admin' ? '#D97706' : '#7C3AED',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    padding: '4px 8px',
                                                    borderRadius: 6,
                                                }}
                                                className="hover-bg-gray"
                                            >
                                                {u.role === 'admin' ? <><MdPersonOutline size={18} /> Jadikan User</> : <><MdSecurity size={18} /> Jadikan Admin</>}
                                            </button>

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
                                                        fontWeight: 600,
                                                        padding: '4px 8px',
                                                        borderRadius: 6,
                                                    }}
                                                    className="hover-bg-gray"
                                                >
                                                    {u.status === 'active' ? <><MdBlock size={18} /> Blokir Akun</> : <><MdCheckCircle size={18} /> Aktifkan</>}
                                                </button>
                                            )}
                                        </>
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
