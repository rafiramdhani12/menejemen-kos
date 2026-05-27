const express = require('express');
const router = express.Router();
const Room = require('../models/Room'); // Mengambil model Kamar yang dibuat sebelumnya

// IMPORT MITRA KEAMANAN: Ambil middleware proteksi token dan role
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ========================================================
// 1. POST: Menambah Kamar Kos Baru (HANYA ADMIN)
// ========================================================
// Ditambahkan protect dan authorizeRoles('admin') agar Staff & Owner tidak bisa menambah data
router.post('/add', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { roomNumber, type, pricePerMonth, facilities, description } = req.body;

    // Validasi input kosong wajib
    if (!roomNumber || !pricePerMonth) {
      return res.status(400).json({ message: 'Nomor kamar dan harga sewa wajib diisi!' });
    }

    // Validasi apakah nomor kamar sudah terdaftar
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Nomor kamar sudah terdaftar!' });
    }

    // Membuat objek kamar baru
    const newRoom = new Room({
      roomNumber,
      type,
      pricePerMonth,
      facilities,
      description
    });

    // Simpan ke MongoDB
    await newRoom.save();
    res.status(201).json({ message: '🎉 Kamar berhasil ditambahkan!', data: newRoom });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// ========================================================
// 2. GET: Mengambil Semua Data Kamar Kos (ADMIN, STAFF, OWNER)
// ========================================================
// Ditambahkan protect dan authorizeRoles agar Owner, Staff, dan Admin bisa memantau data kamar
router.get('/', protect, authorizeRoles('admin', 'staff', 'owner'), async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;