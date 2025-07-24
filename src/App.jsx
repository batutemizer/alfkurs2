import './App.css'
import { getOrCreateDeviceId } from './utils/deviceId'
import { useNavigate } from 'react-router-dom'
import { db, studentsCol, attendanceCol } from './firebase'
import { addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { UserIcon, CheckCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'

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
      // Bugünün yoklamalarını kategorilere göre ayır
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
    'Sabah': [10, 0, 10, 30],
    'Öğlen': [15, 0, 15, 30],
    'Akşam': [17, 30, 18, 0],
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-fuchsia-500 to-orange-400 px-2 py-8">
      <div className="relative glass-card gradient-border p-12 max-w-lg w-full flex flex-col items-center animate-fade-in">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-fuchsia-500 to-orange-400 p-2 rounded-full shadow-xl border-4 border-white">
          <UserIcon className="w-20 h-20 text-white drop-shadow-lg" />
        </div>
        <h1 className="agency-title text-6xl mb-4 text-center tracking-tight mt-16 animate-fade-in bg-gradient-to-r from-blue-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
          Akıllı Yoklama
        </h1>
        <p className="text-lg text-gray-700 mb-10 text-center font-medium animate-fade-in max-w-md">
          Dershanenin WiFi ağına bağlı olduğunuzdan emin olun ve ilgili yoklama saatinde yoklama alın.
        </p>
        {!student ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-xs mb-6 animate-fade-in">
            <div className="text-center text-lg font-semibold mb-2 text-fuchsia-700">Cihazınız kayıtlı değil. Lütfen kayıt olun:</div>
            <input type="text" placeholder="Ad" value={ad} onChange={e => setAd(e.target.value)} className="p-3 rounded-lg border-2 border-fuchsia-300 focus:border-fuchsia-500 outline-none transition" required />
            <input type="text" placeholder="Soyad" value={soyad} onChange={e => setSoyad(e.target.value)} className="p-3 rounded-lg border-2 border-fuchsia-300 focus:border-fuchsia-500 outline-none transition" required />
            <button type="submit" className="py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-fuchsia-500 hover:from-fuchsia-500 hover:to-blue-500 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-white" /> Kaydol
            </button>
          </form>
        ) : (
          <>
            <div className="mb-6 text-center text-lg font-semibold text-blue-700 flex items-center justify-center gap-2 animate-fade-in">
              <UserIcon className="w-6 h-6 text-blue-700" /> Hoş geldin, <span className="font-bold">{student.ad} {student.soyad}</span>
            </div>
            <div className="w-full flex flex-col gap-6 mb-10 animate-fade-in items-center">
              <button onClick={() => handleAttendance('Sabah')} disabled={!!todayAttendance['Sabah']} className={`max-w-sm w-full py-5 rounded-3xl font-extrabold text-white text-lg bg-gradient-to-r from-blue-500 via-fuchsia-500 to-orange-400 bg-[length:200%_200%] bg-left-bottom hover:bg-right-top transition-all duration-300 shadow-xl flex items-center justify-center gap-4 tracking-wide hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-fuchsia-400/40 ${todayAttendance['Sabah'] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="flex items-center gap-3"><CheckCircleIcon className="w-7 h-7 text-white drop-shadow" /> Sabah Yoklaması (10:00-10:30)</span>
              </button>
              <button onClick={() => handleAttendance('Öğlen')} disabled={!!todayAttendance['Öğlen']} className={`max-w-sm w-full py-5 rounded-3xl font-extrabold text-white text-lg bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 bg-[length:200%_200%] bg-left-bottom hover:bg-right-top transition-all duration-300 shadow-xl flex items-center justify-center gap-4 tracking-wide hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-pink-400/40 ${todayAttendance['Öğlen'] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="flex items-center gap-3"><CheckCircleIcon className="w-7 h-7 text-white drop-shadow" /> Öğlen Yoklaması (15:00-15:30)</span>
              </button>
              <button onClick={() => handleAttendance('Akşam')} disabled={!!todayAttendance['Akşam']} className={`max-w-sm w-full py-5 rounded-3xl font-extrabold text-white text-lg bg-gradient-to-r from-fuchsia-600 via-blue-600 to-blue-400 bg-[length:200%_200%] bg-left-bottom hover:bg-right-top transition-all duration-300 shadow-xl flex items-center justify-center gap-4 tracking-wide hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-blue-400/40 ${todayAttendance['Akşam'] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="flex items-center gap-3"><CheckCircleIcon className="w-7 h-7 text-white drop-shadow" /> Akşam Yoklaması (17:30-18:00)</span>
              </button>
            </div>
          </>
        )}
        {info && <div className="mb-4 text-center text-base text-fuchsia-700 font-bold animate-fade-in-slow">{info}</div>}
        <button onClick={() => navigate('/admin-login')} className="mt-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-gray-700 to-gray-400 hover:from-gray-400 hover:to-gray-700 hover:scale-105 transition-all shadow flex items-center gap-2 animate-fade-in">
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-white" /> Yönetici Girişi
        </button>
        <p className="mt-8 text-xs text-gray-400 text-center animate-fade-in">
          © {new Date().getFullYear()} Akıllı Yoklama Sistemi. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  )
}

export default App
