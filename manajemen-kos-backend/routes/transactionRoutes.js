const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Tenant = require('../models/Tenant');

// IMPORT MITRA KEAMANAN: Hubungkan dengan middleware pengecekan token dan role
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ========================================================
// 1. POST: Mencatat Transaksi Pembayaran Baru (ADMIN & STAFF)
// ========================================================
// Ditambahkan protect dan authorizeRoles('admin', 'staff') -> Akun Owner akan ditolak jika mencoba mencatat data
router.post('/add', protect, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { tenantId, amountPaid, periodMonth, paymentMethod, status } = req.body;

    // Validasi input kosong wajib
    if (!tenantId || !amountPaid || !periodMonth) {
      return res.status(400).json({ message: 'ID Penyewa, Jumlah Bayar, dan Periode Bulan wajib diisi!' });
    }

    // Cek apakah penyewa ada di database
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan!' });
    }

    // Buat data transaksi baru (roomId diambil otomatis dari data penyewa)
    const newTransaction = new Transaction({
      tenantId,
      roomId: tenant.roomId, // Otomatis mengisi roomId sesuai kamar si penyewa
      amountPaid,
      periodMonth,
      paymentMethod,
      status
    });

    await newTransaction.save();
    res.status(201).json({ message: '🎉 Pembayaran berhasil dicatat!', data: newTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// ========================================================
// 2. GET: Mengambil Semua Riwayat Transaksi (ADMIN, STAFF, OWNER)
// ========================================================
// Ditambahkan protect dan authorizeRoles agar Owner, Staff, dan Admin bisa melihat buku jurnal keuangan kos
router.get('/', protect, authorizeRoles('admin', 'staff', 'owner'), async (req, res) => {
  try {
    // Menggunakan populate ganda untuk menarik data penyewa dan kamar sekaligus
    const transactions = await Transaction.find()
      .populate('tenantId', 'name phone') // Hanya ambil nama dan nomor hp penyewa
      .populate('roomId', 'roomNumber type'); // Hanya ambil nomor dan tipe kamar
      
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;