const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // PERBAIKAN: Diubah dari 'tenantId' menjadi 'tenant' agar sinkron dengan request frontend
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: [true, 'ID Penyewa wajib disertakan'] 
  },
  // PERBAIKAN: Diubah dari 'roomId' menjadi 'room' agar sinkron dengan request frontend
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: [true, 'ID Kamar wajib disertakan'] 
  },
  // TAMBAHAN AMAN: Menyimpan nama teks penyewa secara langsung agar jika data tenant dihapus/pindah, catatan nama di riwayat transaksi tidak hilang/blank
  tenantName: {
    type: String,
    required: [true, 'Nama penyewa wajib dicatat']
  },
  // PERBAIKAN: Diubah dari 'amountPaid' menjadi 'amount' agar klop dengan frontend
  amount: { 
    type: Number, 
    required: [true, 'Jumlah pembayaran wajib diisi'] 
  },
  // PERBAIKAN: Diubah dari 'periodMonth' menjadi 'notes' atau biarkan periodMonth (di frontend kita pakai field 'notes' untuk menampung teks "Bayar Kos Bulan Juni 2026")
  notes: { 
    type: String, 
    required: [true, 'Periode bulan atau catatan pembayaran wajib diisi'] 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Transfer', 'Cash'], 
    default: 'Cash' // Memberikan nilai default aman jika frontend tidak mengirimkan tipe
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Success', 'Failed'], 
    default: 'Success' 
  }
}, {
  timestamps: true // Otomatis mencatat tanggal pembayaran lewat createdAt (lokal sistem sewa)
});

module.exports = mongoose.model('Transaction', transactionSchema);