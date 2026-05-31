const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Nama penyewa wajib diisi'],
    trim: true
  },
  nik: { 
    type: String, 
    required: [true, 'NIK wajib diisi'], 
    unique: true,
    trim: true // Menghapus spasi tidak sengaja di awal/akhir NIK
  },
  phone: { 
    type: String, 
    required: [true, 'Nomor telepon wajib diisi'],
    trim: true
  },
  emergencyContact: { 
    type: String, 
    required: [true, 'Kontak darurat wajib diisi'],
    trim: true
  },
  // PERBAIKAN: Diubah dari 'roomId' menjadi 'room' agar sinkron dengan request frontend
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: [true, 'Kamar harus ditentukan'] 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: {
    type: Date,
    default: null
  },
  status: { 
    type: String, 
    enum: ['active', 'moved_out'], 
    default: 'active' 
  }
}, {
  timestamps: true // Otomatis membuat createdAt dan updatedAt
});

module.exports = mongoose.model('Tenant', tenantSchema);