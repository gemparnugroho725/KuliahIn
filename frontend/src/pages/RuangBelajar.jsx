import { useState, useRef } from 'react';
import { aiAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAutoAwesome, MdUploadFile, MdClear } from 'react-icons/md';

const RuangBelajar = () => {
    const [teks, setTeks] = useState('');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    const handleGenerate = async () => {
        if (!teks.trim() || teks.length < 10) {
            toast.error('Tulis minimal 10 karakter terlebih dahulu!');
            return;
        }
        setLoading(true);
        try {
            const res = await aiAPI.generateSummary(teks, uploadedFile?.namaFile);
            setSummary(res.data.data);
            toast.success('Ringkasan berhasil dibuat! 🎉');
        } catch {
            toast.error('Gagal membuat ringkasan. Coba lagi.');
        }
        setLoading(false);
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 10MB!');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            const res = await uploadAPI.upload(formData);
            setUploadedFile(res.data.data);
            toast.success(`File "${file.name}" berhasil diupload!`);
            if (!teks) setTeks(`[File diupload: ${file.name}]\n\nTulis catatan atau ringkasan dari file ini di sini...`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal upload file');
        }
        setUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ruang Belajar AI</h1>
                    <p className="page-subtitle">Tulis catatan atau upload materi, AI akan merangkumnya untuk kamu</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* Input Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Upload Area */}
                    <div
                        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                    >
                        <input ref={fileRef} type="file" hidden onChange={(e) => handleFileUpload(e.target.files[0])}
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" />
                        {uploading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Mengupload file...</span>
                            </div>
                        ) : uploadedFile ? (
                            <div>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-primary)' }}>
                                    ✓ {uploadedFile.originalName}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                    {(uploadedFile.size / 1024).toFixed(1)} KB · Klik untuk ganti file
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="upload-icon"><MdUploadFile /></div>
                                <div className="upload-label">Drag & drop atau klik untuk upload</div>
                                <div className="upload-sub">PDF, Word, PPT, TXT, Gambar · Maks 10MB</div>
                            </div>
                        )}
                    </div>

                    {/* Text Input */}
                    <div className="form-group">
                        <label className="form-label">Catatan / Materi</label>
                        <textarea
                            className="form-textarea"
                            value={teks}
                            onChange={(e) => setTeks(e.target.value)}
                            placeholder="Tulis atau paste catatan kuliah, materi belajar, atau ringkasan bacaan di sini..."
                            style={{ minHeight: 240, resize: 'vertical' }}
                        />
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                            {teks.length} karakter · {teks.split(/\s+/).filter(Boolean).length} kata
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '12px', fontSize: 15 }}
                            onClick={handleGenerate}
                            disabled={loading || teks.length < 10}
                        >
                            {loading ? (
                                <><span className="spinner" style={{ width: 16, height: 16 }} /> Membuat ringkasan...</>
                            ) : (
                                <><MdAutoAwesome /> Generate Ringkasan AI</>
                            )}
                        </button>
                        {(teks || summary) && (
                            <button className="btn btn-secondary btn-icon" onClick={() => { setTeks(''); setSummary(null); setUploadedFile(null); }}>
                                <MdClear />
                            </button>
                        )}
                    </div>
                </div>

                {/* Result Panel */}
                <div>
                    {!summary ? (
                        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                            <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
                            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Siap Membantu Belajar!</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                Tulis catatan atau upload file materi, lalu tekan <strong>Generate Ringkasan AI</strong> untuk mendapatkan hasil ringkasan yang terstruktur.
                            </p>
                            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                                {['📝 Ringkasan singkat materi', '🎯 Poin-poin penting', '💡 Rekomendasi belajar', '⏱️ Estimasi waktu belajar'].map((f) => (
                                    <div key={f} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="ai-summary-result">
                            <div className="ai-result-header">
                                <div className="ai-result-icon">🤖</div>
                                <div>
                                    <div className="ai-result-title">Hasil Ringkasan AI</div>
                                    <div className="ai-result-sub">
                                        {summary.sumber} · {summary.model}
                                    </div>
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                    <span className="badge badge-blue">{summary.tingkatKompleksitas}</span>
                                    <span className="badge badge-green">⏱️ {summary.estimasiWaktuBelajar}</span>
                                </div>
                            </div>

                            <div className="ai-result-section">
                                <div className="ai-result-section-title">📋 Ringkasan</div>
                                <p className="ai-result-text">{summary.ringkasan}</p>
                            </div>

                            <div className="ai-result-section">
                                <div className="ai-result-section-title">🎯 Poin Penting</div>
                                <div className="ai-result-list">
                                    {summary.poinPenting.map((p, i) => (
                                        <div key={i} className="ai-result-list-item">{p}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="ai-result-section">
                                <div className="ai-result-section-title">💡 Rekomendasi Belajar</div>
                                <div className="ai-result-list">
                                    {summary.rekomendasiBelajar.map((r, i) => (
                                        <div key={i} className="ai-result-list-item">{r}</div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12, marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                Dibuat pada {new Date(summary.diGenerasiPada).toLocaleString('id-ID')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RuangBelajar;
