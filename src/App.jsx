import './App.css'
import { getOrCreateDeviceId } from './utils/deviceId'
import { useNavigate } from 'react-router-dom'
import { db, studentsCol, attendanceCol } from './firebase'
import { addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { UserIcon } from '@heroicons/react/24/solid'

function App() {
  const deviceId = getOrCreateDeviceId();
  const navigate = useNavigate();
  const [info, setInfo] = useState('');
  const [student, setStudent] = useState(null);
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState({});

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true);
      const q = query(studentsCol, where('deviceId', '==', deviceId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setStudent({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
      setLoading(false);
    }
    fetchStudent();
  }, [deviceId]);

  useEffect(() => {
    async function fetchAttendance() {
      if (!student) return;
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const q = query(attendanceCol, where('studentId', '==', student.id));
      const snap = await getDocs(q);
      const att = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const todayAtt = {};
      att.forEach(a => {
        const attDate = a.timestamp?.toDate?.() || new Date(a.timestamp.seconds * 1000);
        if (attDate.toISOString().slice(0, 10) === todayStr) {
          todayAtt[a.kategori] = true;
        }
      });
      setTodayAttendance(todayAtt);
    }
    fetchAttendance();
  }, [student]);

  const timeRanges = {
    'Sabah': [17, 0, 17, 30],
    'Öğlen': [15, 0, 15, 30],
    'Akşam': [17, 0, 18, 0],
  };

  function isInTimeRange(kategori) {
    const now = new Date();
    const [startH, startM, endH, endM] = timeRanges[kategori];
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
    return now >= start && now <= end;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setInfo('');
    if (!ad || !soyad) {
      setInfo('Lütfen ad ve soyad giriniz!');
      return;
    }
    try {
      const docRef = await addDoc(studentsCol, { ad, soyad, deviceId });
      setStudent({ id: docRef.id, ad, soyad, deviceId });
      setInfo('Kayıt başarılı! Artık yoklama alabilirsiniz.');
    } catch (e) {
      setInfo('Kayıt sırasında hata oluştu!');
    }
  };

  const handleAttendance = async (kategori) => {
    setInfo('');
    if (!student) {
      setInfo('Önce kayıt olmalısınız!');
      return;
    }
    if (todayAttendance[kategori]) {
      setInfo(`Bu zaman diliminde zaten yoklama aldınız!`);
      return;
    }
    if (!isInTimeRange(kategori)) {
      setInfo(`${kategori} yoklaması sadece belirtilen saat aralığında alınabilir!`);
      return;
    }
    try {
      await addDoc(attendanceCol, {
        studentId: student.id,
        deviceId,
        kategori,
        timestamp: Timestamp.now(),
      });
      setTodayAttendance(prev => ({ ...prev, [kategori]: true }));
      setInfo(`${kategori} yoklaması başarıyla alındı!`);
    } catch (e) {
      setInfo('Yoklama alınırken hata oluştu!');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-2xl">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-2 py-8">
      <div className="card w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl mb-2 text-center tracking-tight">Alf Kurs Merkezi</h1>
        <p className="text-base text-muted mb-8 text-center font-medium max-w-md">
          Dershanenin WiFi ağına bağlı olduğunuzdan emin olun ve ilgili yoklama saatinde yoklama alın.
        </p>
        {!student ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-xs mb-6">
            <div className="text-center text-base font-semibold mb-2 text-[var(--primary)]">Cihazınız kayıtlı değil. Lütfen kayıt olun:</div>
            <input type="text" placeholder="Ad" value={ad} onChange={e => setAd(e.target.value)} required />
            <input type="text" placeholder="Soyad" value={soyad} onChange={e => setSoyad(e.target.value)} required />
            <button type="submit" className="w-full mt-2">Kaydol</button>
          </form>
        ) : (
          <>
            <div className="mb-6 text-center text-base font-semibold text-[var(--primary)] flex items-center justify-center gap-2">
              <UserIcon className="w-6 h-6 text-[var(--primary)]" /> Hoş geldin, <span className="font-bold">{student.ad} {student.soyad}</span>
            </div>
            <div className="w-full flex flex-col gap-4 mb-8 items-center">
              <button onClick={() => handleAttendance('Sabah')} disabled={!!todayAttendance['Sabah']} className={`w-full ${todayAttendance['Sabah'] ? 'opacity-50 cursor-not-allowed' : ''}`}>Sabah Yoklaması (10:00-10:30)</button>
              <button onClick={() => handleAttendance('Öğlen')} disabled={!!todayAttendance['Öğlen']} className={`w-full ${todayAttendance['Öğlen'] ? 'opacity-50 cursor-not-allowed' : ''}`}>Öğlen Yoklaması (15:00-15:30)</button>
              <button onClick={() => handleAttendance('Akşam')} disabled={!!todayAttendance['Akşam']} className={`w-full ${todayAttendance['Akşam'] ? 'opacity-50 cursor-not-allowed' : ''}`}>Akşam Yoklaması (17:30-18:00)</button>
            </div>
          </>
        )}
        {info && <div className="mb-4 text-center text-base text-[var(--accent)] font-bold">{info}</div>}
        <button onClick={() => navigate('/admin-login')} className="mt-2 w-full bg-[var(--accent)]">Yönetici Girişi</button>
        <p className="mt-8 text-xs text-muted text-center">
          © {new Date().getFullYear()} Alf Kurs Merkezi. Tüm hakları saklıdır.
        </p>
      </div>
      <div className="flex flex-col items-center mt-8 mb-2 opacity-80">
        <a href="https://softnix.com.tr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[var(--primary)] font-semibold hover:underline">
          
          Tüm Haklar Softnix'e Aittir.
        </a>
      </div>
    </div>
  )
}

export default App
