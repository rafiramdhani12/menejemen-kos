const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: [true, 'Nomor kamar wajib diisi'], 
    unique: true 
  },
  type: { 
    type: String, 
    enum: ['Regular', 'VIP', 'VVIP'], 
    required: [true, 'Tipe kamar wajib dipilih'] 
  },
  pricePerMonth: { 
    type: Number, 
    required: [true, 'Harga per bulan wajib diisi'] 
  },
  facilities: {
    type: [String],
    default: [] // Contoh isi nanti: ['AC', 'Wi-Fi', 'Kamar Mandi Dalam']
  },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'maintenance'], 
    default: 'available' 
  },
  description: { 
    type: String 
  }
}, {
  timestamps: true // Otomatis membuat kolom createdAt dan updatedAt
});

module.exports = mongoose.model('Room', roomSchema);