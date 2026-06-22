const express = require('express');
const router = express.Router();
const Room = require('../models/room'); 
const Tenant = require('../models/tenant');

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
    // Tambahkan .populate('tenant') agar virtual field-nya ikut ke-render sebagai null/array kosong (aman buat FE)
    const rooms = await Room.find({ status: "available" }).populate('tenant');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
});


router.get('/:id' , async (req,res) => {
  try {
    const room = await Room.findById(req.params.id).populate('tenant')
    res.status(200).json(room)
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
})


router.put("/:id" , async(req,res)=>{
  try {
    const { roomNumber, type, pricePerMonth, size ,facilities, description } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        roomNumber,
        type,
        pricePerMonth,
        size,
        facilities,
        description
      },
      {
        new:true,
        runValidators:true
      }
    )

    if(!room){
      return res.status(404).json({
        message:'kamar tidak ditemukan'
      })
    }

    res.status(200).json({
      message:'kamar berhasil di update',
      data:room
    })

  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
})

router.delete("/:id" , async(req,res) => {
  try {
    const room = await Room.findOneAndDelete(req.params.id)
    res.status(200).json({
      message : "kamar berhasil di hapus",
      data : room
    })
  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
})


module.exports = router;