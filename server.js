const express = require('express');
const path = require('path');
const app = express();

// Sadece bu IP aralığına izin ver (ör: 192.168.1.x)
const ALLOWED_SUBNET = '192.168.1.';

app.use((req, res, next) => {
  // IPv4 için ::ffff:192.168.1.x formatı da gelebilir
  const ip = req.ip || req.connection.remoteAddress;
  if (ip.startsWith('::ffff:' + ALLOWED_SUBNET) || ip.startsWith(ALLOWED_SUBNET)) {
    next();
  } else {
    res.status(403).send('<h2>Bu uygulamaya sadece dershane WiFi’sinden erişebilirsiniz.</h2>');
  }
});

// React build (dist) klasörünü sun
app.use(express.static(path.join(__dirname, 'dist')));

// Tüm diğer isteklerde index.html dön
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Alf Kurs Merkezi uygulaması ${PORT} portunda çalışıyor.`);
}); 