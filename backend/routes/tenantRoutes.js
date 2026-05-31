const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// IMPORT MITRA KEAMANAN: Hubungkan middleware pengecekan token dan role
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// 1. POST: Mendaftarkan Penyewa Baru / Check-In (ADMIN & STAFF)

router.post('/add', async (req, res) => {
  try {
    const { 
      name, 
      nik, 
      phone, 
      emergencyContact, 
      room, 
      startDate, // Data string dari FE (misal: "2026-05-30")
      amountPaid, 
      periodMonth, 
      paymentMethod 
    } = req.body;

    // == VALIDASI INPUT WAJIB ==
    if (!name || !nik || !room || !startDate) {
      return res.status(400).json({ message: 'Nama, NIK, Kamar, dan Tanggal Mulai wajib diisi!' });
    }

    // 💡 PERBAIKAN LOGIC HITUNG: Mengembalikan Object Date asli sesuai skema model baru lu
    const hitungEndDate = (startDateString, periode) => {
      const date = new Date(startDateString); // Bikin object date dari string input FE
      
      let monthsToAdd = 1;
      if (periode && periode.includes('3')) monthsToAdd = 3;
      else if (periode && periode.includes('6')) monthsToAdd = 6;
      else if (periode && periode.includes('1 Tahun')) monthsToAdd = 12;

      date.setMonth(date.getMonth() + monthsToAdd);
      return date; // ✅ KEMBALIKAN OBJECT DATE (Jangan di-.toISOString()!)
    };

    const calculatedEndDate = hitungEndDate(startDate, periodMonth);


    // == VALIDASI KE DATABASE ==
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: 'Kamar tidak ditemukan!' });
    }
    if (roomDoc.status === 'occupied') {
      return res.status(400).json({ message: 'Kamar sudah diisi oleh orang lain!' });
    }
    const nikExists = await Tenant.findOne({ nik });
    if (nikExists) {
      return res.status(400).json({ message: 'Penyewa dengan NIK ini sudah terdaftar!' });
    }


    // 💡 SINKRONISASI: Masukkan data yang tipenya udah pas dengan skema model
    const newTenant = new Tenant({
      name,
      nik,
      phone,
      emergencyContact,
      room,
      startDate: new Date(startDate), // Konversi string dari FE jadi Object Date
      endDate: calculatedEndDate,     // Object Date hasil hitungan fungsi di atas
      status: 'active'                // Default sesuai skema lu
    });

    const savedTenant = await newTenant.save();

    // Update status kamar menjadi 'occupied'
    roomDoc.status = 'occupied';
    await roomDoc.save();


    // == INTEGRASI TRANSAKSI OTOMATIS ==
    if (amountPaid !== undefined && amountPaid !== null && amountPaid !== '') {
      
      console.log("-> Mencoba membuat data transaksi baru...");
      
      const newTransaction = new Transaction({
        tenant: savedTenant._id,       
        room: room,                    
        tenantName: savedTenant.name,  
        amount: Number(amountPaid), 
        notes: `Pembayaran awal untuk periode: ${periodMonth || '1 Bulan'}`, 
        paymentMethod: paymentMethod === 'Transfer Bank' ? 'Transfer' : 'Cash', 
        status: 'Success'              
      });
      
      const savedTransaction = await newTransaction.save();
      console.log("🎉 DATA TRANSAKSI BERHASIL DISIMPAN:", savedTransaction);

    } else {
      console.warn("⚠️ TRANSAKSI DILEWATI karena amountPaid kosong atau tidak terbaca!");
    }

    res.status(201).json({ 
      message: '🎉 Penyewa berhasil didaftarkan dan pembayaran awal berhasil dicatat!', 
      data: savedTenant 
    });

  } catch (error) {
    console.error("Gagal mendaftarkan penyewa:", error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// 2. GET: Mengambil Semua Data Penyewa (ADMIN, STAFF, OWNER)
router.get('/',  async (req, res) => {
  try {
    const tenants = await Tenant.find().populate('room');
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// 2a. GET: Mengambil Detail Penyewa secara Mendalam (Aggregation Pipeline)
router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;

    const tenantDetail = await Tenant.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(tenantId) } },
      // Join dengan data Kamar
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomDetail'
        }
      },
      { $unwind: { path: '$roomDetail', preserveNullAndEmptyArrays: true } },
      // Join dengan data Transaksi
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'tenant',
          as: 'paymentHistory'
        }
      },
      // Sort transaksi dari yang terbaru
      {
        $addFields: {
          paymentHistory: {
            $sortArray: { input: "$paymentHistory", sortBy: { createdAt: -1 } }
          }
        }
      }
    ]);

    if (!tenantDetail || tenantDetail.length === 0) {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan!' });
    }

    res.status(200).json(tenantDetail[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// 3. PUT: 

router.put('/checkout/:id',  async (req, res) => {
  try {
    const tenantId = req.params.id;

    // 1. Cari data penyewa berdasarkan ID di URL
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan!' });
    }

    // Validasi jika penyewa memang sudah keluar sebelumnya
    if (tenant.status === 'moved_out') {
      return res.status(400).json({ message: 'Penyewa ini sudah berstatus keluar!' });
    }

    // 2. Ubah status penyewa menjadi moved_out
    tenant.status = 'moved_out';
    await tenant.save();

    // 3. OTOMATIS: Ubah status kamar yang ditinggalkan menjadi 'available' (tersedia kembali)
    await Room.findByIdAndUpdate(tenant.roomId, { status: 'available' });

    res.status(200).json({ 
      message: '🎉 Proses Check-Out berhasil! Kamar kosong dan tersedia kembali.', 
      data: tenant 
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;