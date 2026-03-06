import { useState, useEffect, useCallback } from 'react';
import { jadwalAPI } from '../services/api';
import { HARI_LIST, WARNA_OPTIONS } from '../utils/helpers';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

const EMPTY_FORM = {
    mataKuliah: '', hari: 'Senin', jamMulai: '08:00', jamSelesai: '10:00',
    dosen: '', ruangan: '', warna: '#2563EB',
};

const JadwalForm = ({ initial, onSave, onClose }) => {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.mataKuliah || form.mataKuliah.length < 4) e.mataKuliah = 'Nama mata kuliah minimal 4 karakter';
        if (!form.hari) e.hari = 'Hari wajib dipilih';
        if (!form.jamMulai) e.jamMulai = 'Jam mulai wajib diisi';
        if (!form.jamSelesai) e.jamSelesai = 'Jam selesai wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            await onSave(form);
        } finally {
            setSaving(false);
        }
    };

    const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{initial?.id ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Nama Mata Kuliah *</label>
                            <input className={`form-input ${errors.mataKuliah ? 'error' : ''}`}
                                value={form.mataKuliah} onChange={(e) => set('mataKuliah', e.target.value)}
                                placeholder="Contoh: Pemrograman Web" />
                            {errors.mataKuliah && <span className="form-error">{errors.mataKuliah}</span>}
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Hari *</label>
                                <select className="form-select" value={form.hari} onChange={(e) => set('hari', e.target.value)}>
                                    {HARI_LIST.map((h) => <option key={h}>{h}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Warna</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {WARNA_OPTIONS.map((c) => (
                                        <div key={c} onClick={() => set('warna', c)} style={{
                                            width: 24, height: 24, borderRadius: '50%', background: c,
                                            cursor: 'pointer',
                                            border: form.warna === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Jam Mulai *</label>
                                <input type="time" className={`form-input ${errors.jamMulai ? 'error' : ''}`}
                                    value={form.jamMulai} onChange={(e) => set('jamMulai', e.target.value)} />
                                {errors.jamMulai && <span className="form-error">{errors.jamMulai}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Jam Selesai *</label>
                                <input type="time" className={`form-input ${errors.jamSelesai ? 'error' : ''}`}
                                    value={form.jamSelesai} onChange={(e) => set('jamSelesai', e.target.value)} />
                                {errors.jamSelesai && <span className="form-error">{errors.jamSelesai}</span>}
                            </div>
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Dosen (opsional)</label>
                                <input className="form-input" value={form.dosen} onChange={(e) => set('dosen', e.target.value)}
                                    placeholder="Nama dosen" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ruangan (opsional)</label>
                                <input className="form-input" value={form.ruangan} onChange={(e) => set('ruangan', e.target.value)}
                                    placeholder="Nomor ruangan" />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="spinner" /> : null}
                            {initial?.id ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const today = new Date().toLocaleString('id-ID', { weekday: 'long' });

const Jadwal = () => {
    const [jadwal, setJadwal] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await jadwalAPI.getAll();
            setJadwal(res.data.data);
        } catch { toast.error('Gagal memuat jadwal'); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            if (editing?.id) {
                await jadwalAPI.update(editing.id, form);
                toast.success('Jadwal berhasil diperbarui!');
            } else {
                await jadwalAPI.create(form);
                toast.success('Jadwal berhasil ditambahkan!');
            }
            setShowForm(false);
            setEditing(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan jadwal');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus jadwal ini?')) return;
        try {
            await jadwalAPI.delete(id);
            toast.success('Jadwal dihapus');
            load();
        } catch { toast.error('Gagal menghapus jadwal'); }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Jadwal Kuliah</h1>
                    <p className="page-subtitle">Tampilan mingguan jadwal perkuliahan kamu</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                    <MdAdd /> Tambah Jadwal
                </button>
            </div>

            {loading ? (
                <div className="page-loader"><div className="spinner spinner-primary" style={{ width: 32, height: 32 }} /></div>
            ) : (
                <div className="card">
                    <div className="weekly-grid">
                        {HARI_LIST.map((hari) => {
                            const items = jadwal.filter((j) => j.hari === hari).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
                            const isToday = today.toLowerCase().includes(hari.toLowerCase());
                            return (
                                <div key={hari} className="day-column">
                                    <div className={`day-header ${isToday ? 'today' : ''}`}>{hari.slice(0, 3)}</div>
                                    {items.length === 0 ? (
                                        <div style={{
                                            padding: '12px 8px', textAlign: 'center', fontSize: 11,
                                            color: 'var(--text-muted)', borderRadius: 'var(--radius-md)',
                                            border: '1.5px dashed var(--border-light)', minHeight: 60,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            Kosong
                                        </div>
                                    ) : items.map((j) => (
                                        <div key={j.id} className="jadwal-item"
                                            style={{ background: j.warna + '15', borderLeftColor: j.warna, color: j.warna }}
                                        >
                                            <div className="jadwal-mk" style={{ color: 'var(--text-primary)' }}>{j.mataKuliah}</div>
                                            <div className="jadwal-time" style={{ color: 'var(--text-secondary)' }}>{j.jamMulai}–{j.jamSelesai}</div>
                                            {j.ruangan && <div className="jadwal-room" style={{ color: 'var(--text-muted)' }}>📍 {j.ruangan}</div>}
                                            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                                                <button className="btn btn-sm" style={{ padding: '2px 6px', borderRadius: 4, background: j.warna + '25', color: j.warna, fontSize: 11 }}
                                                    onClick={() => { setEditing(j); setShowForm(true); }}>
                                                    <MdEdit />
                                                </button>
                                                <button className="btn btn-sm" style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--color-danger-light)', color: 'var(--color-danger)', fontSize: 11 }}
                                                    onClick={() => handleDelete(j.id)}>
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showForm && (
                <JadwalForm
                    initial={editing}
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditing(null); }}
                />
            )}
        </div>
    );
};

export default Jadwal;
