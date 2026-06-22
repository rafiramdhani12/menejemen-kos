const express = require('express');
const router = express.Router();
const Facility = require('../models/facility');

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Facility.findOne({ name });

    if (exists) {
      return res.status(400).json({
        message: 'Fasilitas sudah ada'
      });
    }

    const facility = await Facility.create({
      name
    });

    res.status(201).json(facility);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find();

    res.status(200).json(facilities);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!facility) {
      return res.status(404).json({
        message: 'Fasilitas tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Fasilitas berhasil diperbarui',
      data: facility
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Fasilitas berhasil dihapus'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;