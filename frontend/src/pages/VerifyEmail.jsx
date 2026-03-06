import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdVpnKey, MdArrowBack, MdRefresh } from 'react-icons/md';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from query params or state
    const email = new URLSearchParams(location.search).get('email') || location.state?.email;

    const { verifyOTP } = useAuth();

    useEffect(() => {
        if (!email) {
            toast.error('Email tidak ditemukan. Silakan daftar ulang.');
            navigate('/register');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            return toast.error('Kode OTP harus 6 digit');
        }

        setLoading(true);
        try {
            await verifyOTP(email, otp);
            toast.success('Email berhasil diverifikasi!');
            navigate('/dashboard');
        } catch (error) {
            console.error('OTP Error:', error);
            toast.error('Kode OTP salah atau sudah kadaluwarsa.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            // In Supabase, re-signing up with the same email triggers a new confirmation email
            // Alternatively, use supabase.auth.resend({ type: 'signup', email })
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });
            if (error) throw error;
            toast.success('Kode OTP baru telah dikirim!');
        } catch (error) {
            toast.error('Gagal mengirim ulang kode. Coba lagi nanti.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-container">
            <Link to="/register" className="auth-back">
                <MdArrowBack /> Kembali ke Daftar
            </Link>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon-success" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <MdVpnKey size={32} />
                    </div>
                    <h1 className="auth-title">Verifikasi Email</h1>
                    <p className="auth-subtitle">
                        Masukkan 6 digit kode OTP yang kami kirimkan ke <br />
                        <strong>{email}</strong>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Kode OTP</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="000000"
                            maxLength={6}
                            style={{
                                textAlign: 'center',
                                letterSpacing: '8px',
                                fontSize: '24px',
                                fontWeight: '800',
                                height: '60px'
                            }}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 12 }}>
                        {loading ? 'Memverifikasi...' : 'Verifikasi Sekarang'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Tidak menerima kode?</p>
                    <button
                        className="btn btn-secondary btn-full"
                        onClick={handleResend}
                        disabled={resending}
                        style={{ marginTop: 8, gap: 8 }}
                    >
                        <MdRefresh className={resending ? 'spin' : ''} />
                        {resending ? 'Mengirim...' : 'Kirim Ulang Kode'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add to imports in components if needed, but for now we need supabase client for resend
import { supabase } from '../services/supabase';

export default VerifyEmail;
