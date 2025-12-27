const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//All Equipments list
router.get('/', async (req, res) => {
  const equipment = await Equipment.find();
  res.json(equipment);
});

//Equipments list by id
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment)
      return res
        .status(404)
        .json({ error: 'Equipment with given id not found!' });
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
