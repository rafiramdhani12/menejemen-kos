const express = require('express')
const router = express.Router()
const Room = require('../models/Room')
const Transaction = require('../models/Transaction')
const Tenant = require('../models/Tenant')

router.get("/available" , async (req, res) => {
    try{
        const room  = await Room.aggregate([
            {$match: {status: "available"}}, //filtering by status
            {$group: {_id: "$status", count: {$sum: 1}}} 
        ])
        // validasi jika tidak ada datanya agar tidak error
        const result = room.length > 0 ? room[0] : { _id: "available", count: 0 };
        res.status(200).json(result)
    }catch(error){
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
})

router.get("/occupied" , async (req, res) => {
    try{
        const room  = await Room.aggregate([
            {$match: {status: "occupied"}},
            {$group: {_id: "$status", count: {$sum: 1}}}
        ])
        const result = room.length > 0 ? room[0] : { _id: "occupied", count: 0 };
        res.status(200).json(result)
    }catch(error){
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
})



router.get("/all-rooms" , async (req,res) => {
    try{
        const room = await Room.find()
        res.status(200).json(room)
    }catch(error){
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
})

router.get("/omzet" , async (req , res) => {
    try {
        const omzet = await Transaction.aggregate([
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ])
        const result = omzet.length > 0 ? omzet[0] : { _id: null, total: 0 };
        res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
})

router.get("/recent-activity" , async (req,res) => {
    try {
        const tenants = await Tenant.aggregate([
            {$lookup: {
                from: "rooms",
                localField: "room",
                foreignField: "_id",
                as: "roomData"
            }},
            {$unwind: "$roomData"},
            {$sort: {createdAt: -1}},
            {$limit: 10},
            {
                $project:{
                    _id: 1,
                    name: 1,
                    roomNumber: "$roomData.roomNumber",
                    type: "$roomData.type",
                    startDate:1,
                    status:1
                }
            }
        ])
        res.status(200).json(tenants)
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
})


router.get("/stats", async (req, res) => {
    try {
        // 1. Revenue Trend (Last 6 Months)
        const revenueTrend = await Transaction.aggregate([
            {
                $match: {
                    status: "Success",
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 2. Occupancy by Room Type
        const roomDistribution = await Room.aggregate([
            {
                $group: {
                    _id: "$type",
                    total: { $sum: 1 },
                    occupied: {
                        $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({ revenueTrend, roomDistribution });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
})

module.exports = router