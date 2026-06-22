const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: [true, 'ID Penyewa wajib disertakan'] 
  },
  //  Diubah dari 'roomId' jadi 'room' 
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: [true, 'ID Kamar wajib disertakan'] 
  },
  
  tenantName: {
    type: String,
    required: [true, 'Nama penyewa wajib dicatat']
  },
  
  amount: { 
    type: Number, 
    required: [true, 'Jumlah pembayaran wajib diisi'] 
  },
 
  notes: { 
    type: String, 
    required: [true, 'Periode bulan atau catatan pembayaran wajib diisi'] 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Transfer', 'Cash'], 
    default: 'Cash' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Success', 'Failed'], 
    default: 'Success' 
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Transaction', transactionSchema);