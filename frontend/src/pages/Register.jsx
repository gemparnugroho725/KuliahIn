import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdPerson, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error('Konfirmasi password tidak cocok');
        }

        if (password.length < 6) {
            return toast.error('Password minimal 6 karakter');
        }

        setLoading(true);
        try {
            await register(email, password, fullName);
            setIsSent(true);
            toast.success('Pendaftaran berhasil!');
        } catch (error) {
            toast.error(error.message || 'Gagal mendaftar. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-icon-success">📧</div>
                    <h2 className="auth-title">Cek Email Kamu!</h2>
                    <p className="auth-subtitle">
                        Kami telah mengirimkan link verifikasi ke <strong>{email}</strong>.
                        Silakan klik link tersebut untuk mengaktifkan akun Kuliahin kamu.
                    </p>
                    <button className="btn btn-primary btn-full" onClick={() => navigate('/login')} style={{ marginTop: 24 }}>
                        Lanjut ke Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <Link to="/" className="auth-back">
                <MdArrowBack /> Kembali ke Beranda
            </Link>

            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Daftar Akun Baru</h1>
                    <p className="auth-subtitle">Mulai kelola perkuliahanmu dengan lebih tertata.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nama Lengkap</label>
                        <div className="auth-input-wrapper">
                            <MdPerson className="auth-input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Masukkan nama lengkap kamu"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="auth-input-wrapper">
                            <MdEmail className="auth-input-icon" />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="auth-input-wrapper">
                            <MdLock className="auth-input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min. 6 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Konfirmasi Password</label>
                        <div className="auth-input-wrapper">
                            <MdLock className="auth-input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Masukkan ulang password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 12 }}>
                        {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Sudah punya akun? <Link to="/login">Login di sini</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
