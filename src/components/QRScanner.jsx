import { useState } from 'react';
import { QrReader } from 'react-qr-reader';

export default function QRScanner({ onScan }) {
  const [error, setError] = useState(null);

  return (
    <div className="flex flex-col items-center">
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={(result, error) => {
          if (!!result) {
            onScan(result?.text);
          }
          if (!!error) {
            setError(error?.message);
          }
        }}
        style={{ width: '100%' }}
      />
      {error && <span className="text-red-500 mt-2">Kamera hatası: {error}</span>}
    </div>
  );
} 