const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction'); 
const Tenant = require('../models/tenant');

// POST: Mencatat Pembayaran Baru & Otomatis Memperpanjang Masa Sewa Tenant
router.post('/add', async (req, res) => {
  try {
    // 1. Ambil input dari body (Gunakan penamaan yang seragam dengan skema biar gak pusing)
    const { tenantId, amount, notes, paymentMethod, status } = req.body;

    // Validasi input kosong wajib
    if (!tenantId || !amount || !notes) {
      return res.status(400).json({ message: 'ID Penyewa, Jumlah Bayar, dan Catatan Periode wajib diisi!' });
    }

    // 2. Cek apakah penyewa ada di database
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan!' });
    }

    // Pastikan tenant tersebut punya kamar saat ini
    if (!tenant.room) {
      return res.status(400).json({ message: 'Penyewa ini belum didaftarkan ke kamar manapun!' });
    }

    // 3. Buat dokumen transaksi baru sesuai struktur presisi Schema
    const newTransaction = new Transaction({
      tenant: tenantId,          // Sesuai skema: ref ke Tenant
      room: tenant.room,         // Sesuai skema: ref ke Room
      tenantName: tenant.name,   // Sesuai skema: Menyimpan nama string (Required)
      amount: Number(amount),    // Sesuai skema: Number
      notes,                     // Sesuai skema: String catatan periode bulan
      paymentMethod: paymentMethod || 'Cash',
      status: status || 'Success'
    });

    // 4. Jika status transaksi sukses, otomatis perpanjang tanggal jatuh tempo (endDate) si tenant!
    if (newTransaction.status === 'Success') {
      const currentEndDate = new Date(tenant.endDate || tenant.startDate);
      
      // Tambah 1 bulan ke depan dari tanggal jatuh tempo sebelumnya
      currentEndDate.setMonth(currentEndDate.getMonth() + 1);
      
      tenant.endDate = currentEndDate;
      await tenant.save();
    }

    // 5. Simpan data transaksi ke MongoDB
    await newTransaction.save();
    
    res.status(201).json({ 
      message: '🎉 Pembayaran berhasil dicatat & masa sewa tenant berhasil diperbarui!', 
      data: newTransaction 
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// GET: Mengambil Semua Riwayat Transaksi (Sudah Benar Pakai Populate)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('tenant', 'name phone') 
      .populate('room', 'roomNumber type')
      .sort({ createdAt: -1 }); // Urutkan dari transaksi terbaru
      
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// POST: Mencatat Pembayaran Sewa Bulanan Berdasarkan Durasi Pilihan Admin
router.post('/pay-rent', async (req, res) => {
  try {
    const { tenantId, durationMonths, amountPaid, paymentMethod } = req.body;

    if (!tenantId || !durationMonths || !amountPaid) {
      return res.status(400).json({ message: 'Data pembayaran tidak lengkap!' });
    }

    // 1. Cari data tenant dan detail kamarnya
    const tenant = await Tenant.findById(tenantId).populate('room');
    if (!tenant) {
      return res.status(404).json({ message: 'Penghuni tidak ditemukan!' });
    }
    if (!tenant.room) {
      return res.status(400).json({ message: 'Penghuni ini belum memiliki kamar aktif!' });
    }

    // 2. Buat Transaksi Baru menyesuaikan Schema MongoDB
    const newTransaction = new Transaction({
      tenant: tenant._id,
      room: tenant.room._id,
      tenantName: tenant.name,
      amount: Number(amountPaid),
      notes: `Pembayaran Sewa Bulanan (Durasi: ${durationMonths} Bulan)`,
      paymentMethod: paymentMethod || 'Cash',
      status: 'Success'
    });

    // 3. LOGIKA MAJUKAN TANGGAL: Perpanjang masa sewa (endDate) tenant
    // Jika tanggal sekarang sudah melewati masa sewa, hitung perpanjangan mulai dari tanggal hari ini.
    // Jika masa sewa masih aktif, akumulasikan/tambahkan dari tanggal jatuh tempo terakhirnya.
    const now = new Date();
    let baseDate = new Date(tenant.endDate || tenant.startDate || now);
    
    if (baseDate < now) {
      baseDate = now;
    }

    baseDate.setMonth(baseDate.getMonth() + Number(durationMonths));
    tenant.endDate = baseDate;
    
    // Simpan pembaruan tanggal sewa tenant dan log transaksinya
    await tenant.save();
    await newTransaction.save();

    res.status(201).json({
      message: '🎉 Pembayaran berhasil dicatat & masa sewa diperpanjang!',
      data: newTransaction
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;