import { useState, useEffect, useCallback } from 'react';
import { todoAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCheck } from 'react-icons/md';

const EMPTY_FORM = { judul: '', deskripsi: '' };

const TodoForm = ({ initial, onSave, onClose }) => {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.judul || form.judul.length < 4) e.judul = 'Judul todo minimal 4 karakter';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try { await onSave(form); } finally { setSaving(false); }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 460 }}>
                <div className="modal-header">
                    <h2 className="modal-title">{initial?.id ? 'Edit Todo' : 'Tambah Todo'}</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Judul Todo *</label>
                            <input className={`form-input ${errors.judul ? 'error' : ''}`} value={form.judul}
                                onChange={(e) => set('judul', e.target.value)} placeholder="Min. 4 karakter" autoFocus />
                            {errors.judul && <span className="form-error">{errors.judul}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deskripsi (opsional)</label>
                            <input className="form-input" value={form.deskripsi}
                                onChange={(e) => set('deskripsi', e.target.value)} placeholder="Catatan singkat" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="spinner" /> : null}
                            {initial?.id ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Todo = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        try {
            const res = await todoAPI.getAll();
            setTodos(res.data.data);
        } catch { toast.error('Gagal memuat todo'); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            if (editing?.id) {
                await todoAPI.update(editing.id, form);
                toast.success('Todo diperbarui!');
            } else {
                await todoAPI.create(form);
                toast.success('Todo ditambahkan!');
            }
            setShowForm(false); setEditing(null); load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan todo');
        }
    };

    const handleToggle = async (id) => {
        try { await todoAPI.toggle(id); load(); }
        catch { toast.error('Gagal update todo'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus todo ini?')) return;
        try { await todoAPI.delete(id); toast.success('Todo dihapus'); load(); }
        catch { toast.error('Gagal menghapus'); }
    };

    const active = todos.filter((t) => !t.selesai);
    const done = todos.filter((t) => t.selesai);
    const progress = todos.length > 0 ? Math.round((done.length / todos.length) * 100) : 0;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Todo List</h1>
                    <p className="page-subtitle">{done.length}/{todos.length} selesai</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                    <MdAdd /> Tambah Todo
                </button>
            </div>

            {/* Progress Bar */}
            {todos.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Progress Harian</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{progress}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 'var(--radius-full)',
                            background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`,
                            width: `${progress}%`,
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="page-loader"><div className="spinner spinner-primary" style={{ width: 32, height: 32 }} /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Active Todos */}
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>
                            🔵 Belum Selesai ({active.length})
                        </h3>
                        {active.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px 20px' }}>
                                <div className="empty-icon">🎉</div>
                                <div className="empty-title">Semua selesai!</div>
                            </div>
                        ) : (
                            <div className="todo-list">
                                {active.map((t) => (
                                    <div key={t.id} className="todo-item">
                                        <div className="todo-checkbox" onClick={() => handleToggle(t.id)} />
                                        <div className="todo-text">
                                            <div className="todo-title">{t.judul}</div>
                                            {t.deskripsi && <div className="todo-desc">{t.deskripsi}</div>}
                                        </div>
                                        <div className="todo-actions">
                                            <button className="btn btn-icon btn-secondary btn-sm" onClick={() => { setEditing(t); setShowForm(true); }}>
                                                <MdEdit style={{ fontSize: 15 }} />
                                            </button>
                                            <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                                                <MdDelete style={{ fontSize: 15 }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Done Todos */}
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: 'var(--text-secondary)' }}>
                            ✅ Selesai ({done.length})
                        </h3>
                        {done.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px 20px' }}>
                                <div className="empty-icon">📝</div>
                                <div className="empty-title">Belum ada yang selesai</div>
                            </div>
                        ) : (
                            <div className="todo-list">
                                {done.map((t) => (
                                    <div key={t.id} className="todo-item done">
                                        <div className="todo-checkbox checked" onClick={() => handleToggle(t.id)}>
                                            <MdCheck />
                                        </div>
                                        <div className="todo-text">
                                            <div className="todo-title">{t.judul}</div>
                                            {t.deskripsi && <div className="todo-desc">{t.deskripsi}</div>}
                                        </div>
                                        <div className="todo-actions">
                                            <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                                                <MdDelete style={{ fontSize: 15 }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showForm && <TodoForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
        </div>
    );
};

export default Todo;
