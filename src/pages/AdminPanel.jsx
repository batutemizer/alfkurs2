import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/solid';

const KATEGORILER = ['Sabah', 'Öğlen', 'Akşam'];

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

export default function AdminPanel() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState('Sabah');
  const today = formatDateInput(new Date());

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const studentsSnap = await getDocs(collection(db, 'students'));
      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAttendance(attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchData();
  }, []);

  function isPresent(studentId) {
    return attendance.some(a => {
      const attDate = a.timestamp?.toDate?.() || new Date(a.timestamp.seconds * 1000);
      return a.studentId === studentId && a.kategori === selectedKategori && formatDateInput(attDate) === today;
    });
  }

  const katilanlar = students.filter(s => isPresent(s.id));
  const katilmayanlar = students.filter(s => !isPresent(s.id));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-fuchsia-500 to-orange-400 px-2 py-8">
      <div className="glass-card gradient-border p-10 max-w-4xl w-full flex flex-col items-center animate-fade-in">
        <h1 className="agency-title text-4xl mb-8 text-center tracking-tight bg-gradient-to-r from-blue-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
          Yönetici Paneli
        </h1>
        <div className="flex gap-6 mb-10 flex-wrap justify-center">
          {KATEGORILER.map(k => (
            <button
              key={k}
              onClick={() => setSelectedKategori(k)}
              className={`px-8 py-4 rounded-2xl font-extrabold text-xl transition-all shadow-lg border-2 duration-200 tracking-wide ${selectedKategori === k ? 'bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white border-fuchsia-500 scale-105' : 'bg-white/20 text-white border-white/30 hover:scale-105'}`}
              style={{minWidth: 140}}
            >
              {k}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center text-lg">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
            <div className="bg-white/10 rounded-2xl p-8 flex flex-col items-center shadow-xl min-h-[300px]">
              <div className="mb-6 text-xl font-bold text-green-200">Katılanlar ({katilanlar.length})</div>
              <div className="flex flex-col gap-3 w-full max-h-72 overflow-y-auto">
                {katilanlar.length === 0 ? (
                  <div className="flex flex-col items-center text-gray-300 text-center mt-8">
                    <span>Hiç yok</span>
                  </div>
                ) : katilanlar.map(s => (
                  <div key={s.id} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-green-400/80 flex items-center justify-center font-bold text-white text-xl uppercase">
                      {s.ad[0] || <UserIcon className="w-6 h-6" />}
                    </div>
                    <span className="text-white/90 font-semibold truncate text-lg">{s.ad} {s.soyad}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-8 flex flex-col items-center shadow-xl min-h-[300px]">
              <div className="mb-6 text-xl font-bold text-red-200">Katılmayanlar ({katilmayanlar.length})</div>
              <div className="flex flex-col gap-3 w-full max-h-72 overflow-y-auto">
                {katilmayanlar.length === 0 ? (
                  <div className="flex flex-col items-center text-gray-300 text-center mt-8">
                    <span>Hiç yok</span>
                  </div>
                ) : katilmayanlar.map(s => (
                  <div key={s.id} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-red-400/80 flex items-center justify-center font-bold text-white text-xl uppercase">
                      {s.ad[0] || <UserIcon className="w-6 h-6" />}
                    </div>
                    <span className="text-white/90 font-semibold truncate text-lg">{s.ad} {s.soyad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 