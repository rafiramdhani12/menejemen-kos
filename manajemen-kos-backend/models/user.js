const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Nama wajib diisi'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email wajib diisi'], 
    unique: true,
    trim: true, // Menghapus spasi yang tidak sengaja terketik di awal/akhir email
    lowercase: true, // Otomatis mengubah email jadi huruf kecil semua agar tidak duplikat
    match: [/.+\@.+\..+/, 'Format email tidak valid']
  },
  password: { 
    type: String, 
    required: [true, 'Password wajib diisi'] 
  },
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'owner'], // PERUBAHAN: Ditambahkan 'owner' agar diizinkan oleh database
    default: 'staff' 
  }
}, {
  timestamps: true // Otomatis membuat kolom createdAt dan updatedAt di MongoDB
});

// Mengekspor model dengan nama 'User'
const User = mongoose.model('User', userSchema);
module.exports = User;