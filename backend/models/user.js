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
    trim: true, 
    lowercase: true, // Otomatis mengubah email jadi huruf kecil semua agar tidak duplikat
    match: [/.+\@.+\..+/, 'Format email tidak valid']
  },
  role:{
    type:String,
    required:[true,'Role wajib diisi'],
    enum:['owner','admin']
  },
  password: { 
    type: String, 
    required: [true, 'Password wajib diisi'] 
  }
}, {
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;