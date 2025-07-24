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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-fuchsia-500 to-orange-400">
      <form onSubmit={handleSubmit} className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-xl flex flex-col gap-4 w-80">
        <h2 className="text-2xl font-bold text-center mb-2">Yönetici Girişi</h2>
        <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} className="p-3 rounded-lg border" required />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} className="p-3 rounded-lg border" required />
        {error && <span className="text-red-500 text-sm text-center">{error}</span>}
        <button type="submit" className="py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-fuchsia-500 hover:scale-105 transition">Giriş Yap</button>
      </form>
    </div>
  );
} 