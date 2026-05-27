const jwt = require('jsonwebtoken');

// 1. Middleware untuk memverifikasi apakah pengguna sudah login (Punya Token Valid)
const protect = (req, res, next) => {
  let token;

  // Memeriksa apakah ada token di header Authorization (Format: Bearer <TOKEN>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil tokennya saja (buang kata 'Bearer')
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token menggunakan secret key dari .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'KUNCI_RAHASIA_KOS_DEFAULT');

      // Simpan data id dan role dari token ke dalam objek request (req.user)
      req.user = decoded;

      // Lanjut ke proses berikutnya
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Sesi habis atau token tidak valid, silakan login ulang!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan!' });
  }
};

// 2. Middleware untuk membatasi hak akses berdasarkan Role (Role-Based Access Control)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Pastikan req.user sudah diisi oleh middleware 'protect' sebelumnya
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Akses ditolak: Akun dengan role [${req.user?.role?.toUpperCase()}] tidak diizinkan mengakses fitur ini.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };