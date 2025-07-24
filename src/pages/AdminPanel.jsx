import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-2 py-8">
      <div className="card w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center mb-6">Yönetici Paneli - Alf Kurs Merkezi</h1>
        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          {KATEGORILER.map(k => (
            <button
              key={k}
              onClick={() => setSelectedKategori(k)}
              className={`px-6 py-2 rounded-md font-bold text-base transition-all w-32 ${selectedKategori === k ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg)] text-[var(--primary)] border border-[var(--border)]'}`}
            >
              {k}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center text-lg">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="bg-[var(--bg)] rounded-lg p-5 flex flex-col items-center min-h-[180px] border border-[var(--border)]">
              <div className="mb-3 text-lg font-bold text-[var(--primary)]">Katılanlar ({katilanlar.length})</div>
              <div className="flex flex-col gap-2 w-full max-h-48 overflow-y-auto">
                {katilanlar.length === 0 ? (
                  <div className="flex flex-col items-center text-muted text-center mt-4">
                    <span>Hiç yok</span>
                  </div>
                ) : katilanlar.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-2 py-1">
                    <span className="font-semibold text-[var(--primary)]">{s.ad} {s.soyad}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--bg)] rounded-lg p-5 flex flex-col items-center min-h-[180px] border border-[var(--border)]">
              <div className="mb-3 text-lg font-bold text-[var(--accent)]">Katılmayanlar ({katilmayanlar.length})</div>
              <div className="flex flex-col gap-2 w-full max-h-48 overflow-y-auto">
                {katilmayanlar.length === 0 ? (
                  <div className="flex flex-col items-center text-muted text-center mt-4">
                    <span>Hiç yok</span>
                  </div>
                ) : katilmayanlar.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-2 py-1">
                    <span className="font-semibold text-[var(--primary)]">{s.ad} {s.soyad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <p className="mt-8 text-xs text-muted text-center">
          © {new Date().getFullYear()} Alf Kurs Merkezi
        </p>
      </div>
    </div>
  );
} 