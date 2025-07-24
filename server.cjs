const express = require('express');
const path = require('path');
const app = express();

// Sadece bu IP aralığına ve test için belirli IP'ye izin ver
const ALLOWED_SUBNET = '192.168.1.';
const TEST_IP = '192.168.2.179';

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (
    ip.startsWith('::ffff:' + ALLOWED_SUBNET) ||
    ip.startsWith(ALLOWED_SUBNET) ||
    ip === TEST_IP ||
    ip === '::ffff:' + TEST_IP
  ) {
    next();
  } else {
    res.status(403).send('<h2>Bu uygulamaya sadece dershane WiFi’sinden veya test IP’sinden erişebilirsiniz.</h2>');
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Alf Kurs Merkezi uygulaması ${PORT} portunda çalışıyor.`);
}); 