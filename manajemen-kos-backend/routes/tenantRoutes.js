const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');

// IMPORT MITRA KEAMANAN: Hubungkan middleware pengecekan token dan role
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ========================================================
// 1. POST: Mendaftarkan Penyewa Baru / Check-In (ADMIN & STAFF)
// ========================================================
// Ditambahkan protect dan authorizeRoles('admin', 'staff') -> Owner akan ditolak
router.post('/add', protect, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { name, nik, phone, emergencyContact, roomId } = req.body;

    // Validasi input kosong wajib
    if (!name || !nik || !roomId) {
      return res.status(400).json({ message: 'Nama, NIK, dan ID Kamar wajib diisi!' });
    }

    // 1. Cek apakah kamar yang dituju ada dan tersedia
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Kamar tidak ditemukan!' });
    }
    if (room.status === 'occupied') {
      return res.status(400).json({ message: 'Kamar sudah diisi oleh orang lain!' });
    }

    // 2. Cek apakah NIK sudah terdaftar
    const nikExists = await Tenant.findOne({ nik });
    if (nikExists) {
      return res.status(400).json({ message: 'Penyewa dengan NIK ini sudah terdaftar!' });
    }

    // 3. Simpan data penyewa baru
    const newTenant = new Tenant({ name, nik, phone, emergencyContact, roomId });
    await newTenant.save();

    // 4. OTOMATIS: Ubah status kamar menjadi 'occupied'
    room.status = 'occupied';
    await room.save();

    res.status(201).json({ message: '🎉 Penyewa berhasil didaftarkan!', data: newTenant });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// ========================================================
// 2. GET: Mengambil Semua Data Penyewa (ADMIN, STAFF, OWNER)
// ========================================================
// Ditambahkan protect dan authorizeRoles agar Owner bisa melihat seluruh daftar penghuni kos
router.get('/', protect, authorizeRoles('admin', 'staff', 'owner'), async (req, res) => {
  try {
    const tenants = await Tenant.find().populate('roomId');
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// ========================================================
// 3. PUT: Proses Penyewa Keluar / Check-Out (ADMIN & STAFF)
// ========================================================
// Ditambahkan protect dan authorizeRoles('admin', 'staff') -> Owner tidak bisa melakukan check-out data
router.put('/checkout/:id', protect, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const tenantId = req.params.id;

    // 1. Cari data penyewa berdasarkan ID di URL
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan!' });
    }

    // Validasi jika penyewa memang sudah keluar sebelumnya
    if (tenant.status === 'moved_out') {
      return res.status(400).json({ message: 'Penyewa ini sudah berstatus keluar!' });
    }

    // 2. Ubah status penyewa menjadi moved_out
    tenant.status = 'moved_out';
    await tenant.save();

    // 3. OTOMATIS: Ubah status kamar yang ditinggalkan menjadi 'available' (tersedia kembali)
    await Room.findByIdAndUpdate(tenant.roomId, { status: 'available' });

    res.status(200).json({ 
      message: '🎉 Proses Check-Out berhasil! Kamar kosong dan tersedia kembali.', 
      data: tenant 
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;