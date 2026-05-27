const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// IMPORT MITRA KEAMANAN: Ambil middleware yang baru saja kita buat
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ========================================================
// 1. POST: Registrasi Admin/Staff/Owner Baru (DIPROTEKSI)
// ========================================================
// Ditambahkan 'protect' dan 'authorizeRoles' agar hanya ADMIN yang bisa meregistrasi akun baru
router.post('/register', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // VALIDASI 1: Pastikan semua data diisi
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Semua kolom input wajib diisi!' });
    }

    // VALIDASI 2: Batasi nilai role yang diperbolehkan di sistem kos
    const validRoles = ['admin', 'staff', 'owner'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: 'Role tidak valid! Pilih antara: admin, staff, atau owner.' });
    }

    // Cek apakah email sudah terdaftar
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email sudah terdaftar!' });
    }

    // Enkripsi / Hash password agar aman di database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru dengan memaksa format role huruf kecil (lowercase)
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase()
    });

    await newUser.save();
    res.status(201).json({ 
      message: `🎉 Pengguna dengan role [${role.toUpperCase()}] berhasil didaftarkan!`, 
      userId: newUser._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// ========================================================
// 2. POST: Login Pengguna (TIDAK DIPROTEKSI - Harus Terbuka Publik)
// ========================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDASI: Pastikan input tidak kosong
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi!' });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah!' });
    }

    // Cek kecocokan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah!' });
    }

    const secretKey = process.env.JWT_SECRET || 'KUNCI_RAHASIA_KOS_DEFAULT';

    // Buat token JWT yang berlaku selama 1 hari
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secretKey,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: '👋 Login berhasil!',
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;