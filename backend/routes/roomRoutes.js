const express = require('express');
const router = express.Router();
const Room = require('../models/Room'); 
const Tenant = require('../models/Tenant');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// 1. POST: Menambah Kamar Kos Baru (HANYA OWNER)

router.post('/add',  async (req, res) => {
  try {
    const { roomNumber, type, pricePerMonth, size ,facilities, description } = req.body;

    // Validate
    if (!roomNumber || !pricePerMonth) {
      return res.status(400).json({ message: 'Nomor kamar dan harga sewa wajib diisi!' });
    }
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Nomor kamar sudah terdaftar!' });
    }

    // Membuat objek kamar baru
    const newRoom = new Room({
      roomNumber,
      type,
      pricePerMonth,
      size,
      facilities,
      description
    });

    // Simpan ke MongoDB
    await newRoom.save();
    res.status(201).json({ message: 'Kamar berhasil ditambahkan!', data: newRoom });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// 2. GET: Mengambil Semua Data Kamar Kos 

router.get('/', async (req, res) => {
  try {
    // ambil data tenant keperluan agregation
    // const activeTenants = await Tenant.find({status: 'active' }).populate('room');
    const rooms = await Room.find().populate('tenant', 'name phone');

    // const roomsWithTenant = rooms.map((room) => {
    //   const matchingTenant = activeTenants.find(t => t.room && t.room._id.toString() === room._id.toString());

    //   return{
    //     _id:room._id,
    //     roomNumber: room.roomNumber,
    //     type: room.type,
    //     pricePerMonth: room.pricePerMonth,
    //     size: room.size,
    //     facilities: room.facilities,
    //     description: room.description,
    //     tenant: matchingTenant ? {name : matchingTenant.name , phone: matchingTenant.phone} : null
    //   }
    // })

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

router.get("/available", async (req, res) => {
  try {
    const rooms = await Room.find({ status: "available" });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
});

module.exports = router;