// Firebase yapılandırması ve başlatılması
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC9Y8rcIah8Q8Ffx0UBYXVnPT_4RTFPtlM",
  authDomain: "alf2025-c011b.firebaseapp.com",
  projectId: "alf2025-c011b",
  storageBucket: "alf2025-c011b.firebasestorage.app",
  messagingSenderId: "1079613193656",
  appId: "1:1079613193656:web:6b67286cd9b4cba7b8234d",
  measurementId: "G-YLRPCTHE8F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Firestore koleksiyon referansları
export const studentsCol = collection(db, 'students'); // { id, ad, soyad, deviceId }
export const attendanceCol = collection(db, 'attendance'); // { id, studentId, deviceId, kategori, timestamp } 