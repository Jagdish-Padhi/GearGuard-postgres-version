const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Equipment = require('../models/Equipment');

//Creating a maintenance request
router.post('/', async (req, res) => {
  try {
    const { equipmentId, type, scheduledDate, subject, assignedTo } = req.body;
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment)
      return res.status(404).json({ error: 'Equipment not found' });
    const request = new MaintenanceRequest({
      subject,
      type,
      equipmentId,
      teamId: equipment.defaultTeamId,
      scheduledDate,
      assignedTo,
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Getting all requests
router.get('/', async (req, res) => {
  const requests = await MaintenanceRequest.find();
  res.json(requests);
});

//Updating request
router.patch('/:id', async (req, res) => {
  try {
    const { status, duration, assignedTo } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!req) return res.status(404).json({ error: 'Request not found!' });

    if (status) {
      if (status === 'In Progress' && request.status === 'New')
        request.status = 'In Progress';
      else if (
        (status === 'Repaired' || status === 'Scrap') &&
        request.status === 'In Progress'
      ) {
        request.status = status;
        if (status === 'Repaired' && duration) request.duration = duration;
        if (status === 'Scrap') {
          const equipment = await Equipment.findById(request.equipmentId);
          equipment.isActive = false;
          await equipment.save();
        }
      } else
        return res.status(400).json({ error: 'Invalid status transition' });
    }
    if (assignedTo) request.assignedTo = assignedTo;

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
