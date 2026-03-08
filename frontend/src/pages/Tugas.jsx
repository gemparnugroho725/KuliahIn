import { useState, useEffect, useCallback } from 'react';
import { tugasAPI, jadwalAPI } from '../services/api';
import { getDeadlineInfo, formatDate, STATUS_CONFIG, PRIORITAS_CONFIG } from '../utils/helpers';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

const EMPTY_FORM = {
    judul: '', deskripsi: '', mataKuliah: '',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: 'belum', prioritas: 'sedang',
};

const TugasForm = ({ initial, mataKuliahList, onSave, onClose }) => {
    const defaultMk = mataKuliahList && mataKuliahList.length > 0 ? mataKuliahList[0] : 'Lainnya';
    const [form, setForm] = useState(initial ? {
        ...initial, deadline: initial.deadline?.slice(0, 10)
    } : { ...EMPTY_FORM, mataKuliah: defaultMk });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.judul || form.judul.length < 4) e.judul = 'Judul tugas minimal 4 karakter';
        if (!form.mataKuliah) e.mataKuliah = 'Wajib diisi';
        if (!form.deadline) e.deadline = 'Deadline wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            await onSave({ ...form, deadline: new Date(form.deadline).toISOString() });
        } finally { setSaving(false); }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 580 }}>
                <div className="modal-header">
                    <h2 className="modal-title">{initial?.id ? 'Edit Tugas' : 'Tambah Tugas'}</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Judul Tugas *</label>
                            <input className={`form-input ${errors.judul ? 'error' : ''}`} value={form.judul}
                                onChange={(e) => set('judul', e.target.value)} placeholder="Min. 4 karakter" />
                            {errors.judul && <span className="form-error">{errors.judul}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea className="form-textarea" value={form.deskripsi}
                                onChange={(e) => set('deskripsi', e.target.value)} placeholder="Deskripsi tugas (opsional)" />
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Mata Kuliah *</label>
                                <select className="form-select" value={form.mataKuliah} onChange={(e) => set('mataKuliah', e.target.value)}>
                                    {mataKuliahList && mataKuliahList.length > 0 
                                        ? mataKuliahList.map((mk) => <option key={mk} value={mk}>{mk}</option>)
                                        : <option value="Lainnya">Lainnya</option>
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deadline *</label>
                                <input type="date" className={`form-input ${errors.deadline ? 'error' : ''}`}
                                    value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
                                {errors.deadline && <span className="form-error">{errors.deadline}</span>}
                            </div>
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                                    <option value="belum">Belum Dikerjakan</option>
                                    <option value="dikerjakan">Sedang Dikerjakan</option>
                                    <option value="selesai">Selesai</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Prioritas</label>
                                <select className="form-select" value={form.prioritas} onChange={(e) => set('prioritas', e.target.value)}>
                                    <option value="rendah">Rendah</option>
                                    <option value="sedang">Sedang</option>
                                    <option value="tinggi">Tinggi</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="spinner" /> : null}
                            {initial?.id ? 'Simpan Perubahan' : 'Tambah Tugas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Tugas = () => {
    const [tugas, setTugas] = useState([]);
    const [mataKuliahList, setMataKuliahList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        try {
            const [resTugas, resJadwal] = await Promise.all([
                tugasAPI.getAll(filterStatus ? { status: filterStatus } : {}),
                jadwalAPI.getAll()
            ]);
            setTugas(resTugas.data.data);
            
            const uniqueMK = [...new Set(resJadwal.data.data.map(j => j.mataKuliah))];
            setMataKuliahList(uniqueMK.length > 0 ? uniqueMK : ['Lainnya']);
        } catch { toast.error('Gagal memuat data'); }
        setLoading(false);
    }, [filterStatus]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            if (editing?.id) {
                await tugasAPI.update(editing.id, form);
                toast.success('Tugas diperbarui!');
            } else {
                await tugasAPI.create(form);
                toast.success('Tugas ditambahkan!');
            }
            setShowForm(false); setEditing(null); load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan tugas');
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await tugasAPI.updateStatus(id, status);
            load();
        } catch { toast.error('Gagal update status'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus tugas ini?')) return;
        try { await tugasAPI.delete(id); toast.success('Tugas dihapus'); load(); }
        catch { toast.error('Gagal menghapus'); }
    };

    const filters = [
        { label: 'Semua', value: '' },
        { label: 'Belum', value: 'belum' },
        { label: 'Dikerjakan', value: 'dikerjakan' },
        { label: 'Selesai', value: 'selesai' },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tugas</h1>
                    <p className="page-subtitle">{tugas.length} tugas ditemukan</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                    <MdAdd /> Tambah Tugas
                </button>
            </div>

            <div className="filter-bar">
                {filters.map((f) => (
                    <button key={f.value} className={`filter-btn ${filterStatus === f.value ? 'active' : ''}`}
                        onClick={() => setFilterStatus(f.value)}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="page-loader"><div className="spinner spinner-primary" style={{ width: 32, height: 32 }} /></div>
            ) : tugas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <div className="empty-title">Belum ada tugas</div>
                    <div className="empty-desc">Tambahkan tugas pertama kamu!</div>
                </div>
            ) : (
                <div className="tugas-list">
                    {tugas.map((t) => {
                        const dl = getDeadlineInfo(t.deadline);
                        const sc = STATUS_CONFIG[t.status];
                        const pc = PRIORITAS_CONFIG[t.prioritas];
                        return (
                            <div key={t.id} className="tugas-card">
                                <div style={{
                                    width: 4, height: '100%', minHeight: 60,
                                    background: t.prioritas === 'tinggi' ? 'var(--color-danger)' : t.prioritas === 'sedang' ? 'var(--color-warning)' : 'var(--color-success)',
                                    borderRadius: 4, flexShrink: 0,
                                }} />
                                <div className="tugas-info">
                                    <div className="tugas-title">{t.judul}</div>
                                    {t.deskripsi && (
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {t.deskripsi}
                                        </div>
                                    )}
                                    <div className="tugas-meta">
                                        <span>📘 {t.mataKuliah}</span>
                                        <span className={dl.class}>⏰ {dl.text}</span>
                                        <span className={`badge ${sc.badgeClass}`}>{sc.label}</span>
                                        <span className={`badge ${pc.badgeClass}`}>{pc.label}</span>
                                    </div>
                                </div>
                                <div className="tugas-actions">
                                    <select
                                        className="form-select"
                                        style={{ padding: '5px 10px', fontSize: 12, width: 'auto' }}
                                        value={t.status}
                                        onChange={(e) => handleStatus(t.id, e.target.value)}
                                    >
                                        <option value="belum">Belum</option>
                                        <option value="dikerjakan">Dikerjakan</option>
                                        <option value="selesai">Selesai</option>
                                    </select>
                                    <button className="btn btn-icon btn-secondary" onClick={() => { setEditing(t); setShowForm(true); }}>
                                        <MdEdit />
                                    </button>
                                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(t.id)}>
                                        <MdDelete />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && <TugasForm initial={editing} mataKuliahList={mataKuliahList} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
        </div>
    );
};

export default Tugas;
