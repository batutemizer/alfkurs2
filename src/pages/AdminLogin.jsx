import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'admin@alf.com';
const ADMIN_PASSWORD = 'alf2025';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setError('');
      navigate('/admin');
    } else {
      setError('Geçersiz e-posta veya şifre!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-2 py-8">
      <form onSubmit={handleSubmit} className="card w-full max-w-xs flex flex-col gap-4 items-center">
        <h1 className="text-2xl font-bold text-center mb-2">Yönetici Girişi</h1>
        <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <span className="text-red-500 text-sm text-center">{error}</span>}
        <button type="submit" className="w-full mt-2">Giriş Yap</button>
        <p className="mt-8 text-xs text-muted text-center">
          © {new Date().getFullYear()} Alf Kurs Merkezi
        </p>
      </form>
    </div>
  );
} 