import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Selamat datang kembali!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            if (error.message.includes('Email not confirmed')) {
                toast.error('Email belum diverifikasi. Cek inbox kamu!');
            } else {
                toast.error('Login gagal. Cek email dan password kamu.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            toast.error('Gagal login dengan Google.');
        }
    };

    return (
        <div className="auth-container">
            <Link to="/" className="auth-back">
                <MdArrowBack /> Kembali ke Beranda
            </Link>

            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Masuk ke Kuliahin</h1>
                    <p className="auth-subtitle">Silakan masukkan email dan password kamu.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
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

                    <div className="form-group" style={{ marginBottom: 8 }}>
                        <label className="form-label">Password</label>
                        <div className="auth-input-wrapper">
                            <MdLock className="auth-input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: 20 }}>
                        <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>
                            Lupa password?
                        </Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Sedang Masuk...' : 'Masuk Sekarang'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>Atau masuk dengan</span>
                </div>

                <button className="btn btn-secondary btn-full" onClick={handleGoogleLogin}>
                    <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: 16, height: 16 }} />
                    Google
                </button>

                <div className="auth-footer">
                    <p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
