const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');
const tenantRoutes = require('./routes/tenantRoutes'); 
const transactionRoutes = require('./routes/transactionRoutes'); 
const authRoutes = require('./routes/authRoutes'); // 👈 1. Tambahan: Import file rute autentikasi (User)

// Konfigurasi dotenv
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar server bisa membaca data berformat JSON

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Berhasil terhubung ke database MongoDB (indekos_system)'))
  .catch((err) => console.error('❌ Gagal terhubung ke MongoDB:', err));

// Registrasi Rute Aplikasi
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes); 
app.use('/api/transactions', transactionRoutes); 
app.use('/api/auth', authRoutes); // 👈 2. Tambahan: Aktifkan rute autentikasi dengan prefix /api/auth

// Route Testing Sederhana
app.get('/', (req, res) => {
  res.send('Backend Sistem Manajemen Rumah Indekos Aktif!');
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});