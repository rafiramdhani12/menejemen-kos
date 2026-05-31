const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');
const tenantRoutes = require('./routes/tenantRoutes'); 
const transactionRoutes = require('./routes/transactionRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const dashboardRoutes = require('./routes/dashboardRoutes');

// Konfigurasi dotenv
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Berhasil terhubung ke database MongoDB (indekos_system)'))
  .catch((err) => console.error('Gagal terhubung ke MongoDB:', err));

// Rute Aplikasi
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes); 
app.use('/api/transactions', transactionRoutes); 
app.use('/api/auth', authRoutes); 
app.use('/api/dashboard', dashboardRoutes);

// Route Testing Sederhana
app.get('/', (req, res) => {
  res.send('Backend Sistem Manajemen Rumah Indekos Aktif!');
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});