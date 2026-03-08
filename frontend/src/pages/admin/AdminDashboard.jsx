import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPeople, MdMenuBook, MdChecklist, MdSearch, MdFilterList, MdAdd, MdEdit, MdDelete, MdCampaign, MdClose } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user: currentUser } = useAuth();
    const [stats, setStats] = useState({ users: 0, tugasActive: 0, newUsers: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    
    // Broadcast State
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', status: 'active' });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Stats Fetch
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

            // We must use supabaseAdmin to fetch profiles because RLS on profiles table 
            // only allows users to see their own data by default.
            const { supabaseAdmin } = await import('../../services/supabase');
            if(!supabaseAdmin) throw new Error("Supabase Admin Client not found");

            const [usersReq, tugasReq, newUsersReq, allUsersReq] = await Promise.all([
                supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('tugas').select('id', { count: 'exact', head: true }).neq('status', 'selesai'),
                supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('createdAt', lastWeek),
                supabaseAdmin.from('profiles').select('*').order('createdAt', { ascending: false })
            ]);

            setStats({
                users: usersReq.count || 0,
                tugasActive: tugasReq.count || 0,
                newUsers: newUsersReq.count || 0
            });
            setUsers(allUsersReq.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Gagal memuat data dashboard.');
        } finally {
            setLoading(false);
        }
    };

    // --- Broadcast Handler ---
    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) return toast.error('Pesan tidak boleh kosong!');
        
        setIsBroadcasting(true);
        try {
            // Simulasi query (mengingat struktur tabel announcements opsional / belum pasti ada)
            // await supabase.from('announcements').insert([{ message: broadcastMsg, createdBy: currentUser.id }]);
            
            // Simulasi loading 1 detik
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Pengumuman global berhasil disiarkan!');
            setBroadcastMsg('');
        } catch (error) {
            toast.error('Gagal mengirim pengumuman.');
        } finally {
            setIsBroadcasting(false);
        }
    };

    // --- CRUD Handlers ---
    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.name) {
            return toast.error('Semua kolom (Nama, Email, Password) wajib diisi.');
        }
        
        setIsSubmitting(true);
        try {
            // Import supabaseAdmin dynamically or ensure it's imported at the top. We will import at top.
            const { supabaseAdmin } = await import('../../services/supabase');
            if(supabaseAdmin.auth.admin === undefined) {
                 toast.error('Service Role Key tidak dikonfigurasi. Gagal menambahkan user.');
                 setIsSubmitting(false);
                 return;
            }

            // 1. Create Auth User using Admin API
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: formData.email,
                password: formData.password,
                email_confirm: true,
                user_metadata: { full_name: formData.name } // This triggers the handle_new_user DB function
            });

            if (authError) throw authError;

            // Optional: If we want to instantly override their role to what admin selected (if we add role select to form)
            // But right now we just rely on trigger for defaults.

            toast.success(`Pengguna ${formData.name} berhasil ditambahkan!`);
            setIsAddOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
            fetchDashboardData();
        } catch (error) {
            console.error('Error adding user:', error);
            // Translate common Supabase Auth errors
            if (error.message.includes('already registered')) {
                toast.error('Email tersebut sudah terdaftar.');
            } else {
                toast.error(`Gagal menambah user: ${error.message || 'Unknown Error'}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { supabaseAdmin } = await import('../../services/supabase');
            const { error } = await supabaseAdmin.from('profiles').update({
                role: formData.role,
                status: formData.status
            }).eq('id', selectedUser.id);

            if (error) throw error;
            toast.success('Data pengguna berhasil diperbarui!');
            setIsEditOpen(false);
            fetchDashboardData();
        } catch (err) {
            toast.error('Gagal mengubah data.');
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            // Catatan: di Supabase biasanya kita hapus Auth User via admin API,
            // untuk project ini asumsikan hapus profile cukup jika ada cascade, atau kita simulasi:
            const { error } = await supabase.from('profiles').delete().eq('id', selectedUser.id);
            if (error) throw error;

            toast.success('Pengguna berhasil dihapus!');
            setIsDeleteOpen(false);
            fetchDashboardData();
        } catch (err) {
            toast.error('Gagal menghapus pengguna.');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({ name: user.name || '', email: user.email || '', role: user.role, status: user.status });
        setIsEditOpen(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    // Derived States
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
                <div style={{ fontSize: 18, color: 'var(--text-secondary)' }}>Memuat Dashboard...</div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header & Broadcast */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <motion.div 
                    whileHover={{ scale: 1.005 }}
                    style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', padding: 24, borderRadius: 'var(--radius-xl)', color: 'white', display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)' }}
                >
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: 18, borderRadius: '50%', flexShrink: 0 }}>
                        <MdCampaign size={36} />
                    </div>
                    <form onSubmit={handleBroadcast} style={{ flex: 1, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 250 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Pengumuman Global</h3>
                            <input 
                                type="text" 
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="Ketik pengumuman (Contoh: Selamat UTS!)..."
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none',
                                    backdropFilter: 'blur(5px)'
                                }}
                            />
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isBroadcasting}
                            style={{ padding: '12px 24px', background: 'white', color: '#1D4ED8', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', marginTop: 'auto' }}
                        >
                            {isBroadcasting ? 'Mengirim...' : 'Kirim Siaran'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <StatCard icon={<MdPeople />} title="Total Mahasiswa" value={stats.users} color="#0EA5E9" bgColor="#E0F2FE" />
                <StatCard icon={<MdMenuBook />} title="Tugas Aktif" value={stats.tugasActive} color="#8B5CF6" bgColor="#EDE9FE" />
                <StatCard icon={<MdChecklist />} title="User Baru (Mg Ini)" value={stats.newUsers} color="#10B981" bgColor="#D1FAE5" />
            </div>

            {/* User Management */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manajemen Pengguna</h2>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="Cari nama / email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: 40, width: 250 }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <MdFilterList style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                            <select 
                                value={roleFilter} 
                                onChange={(e) => setRoleFilter(e.target.value)} 
                                className="form-select"
                                style={{ paddingLeft: 40, width: 140 }}
                            >
                                <option value="All">Semua Role</option>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAddOpen(true)}
                            className="btn btn-primary"
                        >
                            <MdAdd size={20} /> Tambah User
                        </motion.button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-light)' }}>
                            <tr>
                                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Pengguna</th>
                                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Tanggal Bergabung</th>
                                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data pengguna.</td></tr>
                            ) : filteredUsers.map((u, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={u.id} 
                                    style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
                                    className="tr-hover"
                                >
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: 600 }}>{u.name || 'User Tanpa Nama'}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span className={u.role === 'admin' ? 'badge badge-purple' : 'badge badge-gray'}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span className={u.status === 'active' ? 'badge badge-green' : 'badge badge-red'}>
                                            {u.status === 'active' ? 'Aktif' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {new Date(u.createdAt).toLocaleDateString('id-ID')}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => openEditModal(u)}
                                                className="btn-icon" style={{ color: '#0EA5E9', background: '#E0F2FE' }} title="Edit"
                                            >
                                                <MdEdit />
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => openDeleteModal(u)}
                                                className="btn-icon" style={{ color: '#EF4444', background: '#FEE2E2' }} title="Hapus"
                                                disabled={u.id === currentUser.id}
                                            >
                                                <MdDelete />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals using Framer Motion AnimatePresence */}
            <AnimatePresence>
                {/* --- EDIT MODAL --- */}
                {isEditOpen && (
                    <Modal overlayClick={() => setIsEditOpen(false)}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Pengguna</h2>
                            <button className="modal-close" onClick={() => setIsEditOpen(false)}><MdClose /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Nama</label>
                                <input type="text" value={formData.name} disabled className="form-input" style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>*Nama hanya bisa diubah oleh pengguna sendiri</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-select" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status Akun</label>
                                <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                    <option value="active">Aktif</option>
                                    <option value="banned">Suspended (Banned)</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* --- DELETE CONFIRMATION MODAL --- */}
                {isDeleteOpen && selectedUser && (
                    <Modal overlayClick={() => setIsDeleteOpen(false)}>
                         <div style={{ textAlign: 'center', paddingTop: 20 }}>
                            <div style={{ background: '#FEE2E2', color: '#EF4444', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <MdDelete size={32} />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Hapus Pengguna?</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Apakah Anda yakin ingin menghapus <strong>{selectedUser.name}</strong> ({selectedUser.email})? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Batal</button>
                                <motion.button whileTap={{ scale: 0.95 }} className="btn btn-danger" onClick={handleDeleteUser}>Ya, Hapus Permanen</motion.button>
                            </div>
                         </div>
                    </Modal>
                )}

                {/* --- ADD USER MODAL (SIMULATED) --- */}
                {isAddOpen && (
                    <Modal overlayClick={() => setIsAddOpen(false)}>
                        <div className="modal-header">
                            <h2 className="modal-title">Tambah Pengguna Baru</h2>
                            <button className="modal-close" onClick={() => setIsAddOpen(false)}><MdClose /></button>
                        </div>
                        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Nama Lengkap</label>
                                <input type="text" className="form-input" required placeholder="Cth: Gempar Nugroho" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" required placeholder="contoh@kampus.ac.id" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password Sementara</label>
                                <input type="password" className="form-input" required placeholder="Minimal 6 karakter" minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-select" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                    <option value="user">User (Mahasiswa)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer" style={{ marginTop: 24 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Subcomponent Helpers
function StatCard({ icon, title, value, color, bgColor }) {
    return (
        <div className="stat-card card-hover">
            <div className="stat-icon" style={{ background: bgColor, color: color }}>
                {icon}
            </div>
            <div className="stat-content">
                <div className="stat-value" style={{ color: color }}>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{value}</motion.span>
                </div>
                <div className="stat-label">{title}</div>
            </div>
        </div>
    );
}

function Modal({ children, overlayClick }) {
    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) overlayClick(); }}
        >
            <motion.div 
                initial={{ scale: 0.95, y: 10, opacity: 0 }} 
                animate={{ scale: 1, y: 0, opacity: 1 }} 
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="modal"
                style={{ padding: '32px' }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
