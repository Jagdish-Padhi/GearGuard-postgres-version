const mongoose = require('mongoose');

const MaintenanceRequest = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    type: {
      type: String,
      enum: ['Corrective', 'Preventive'],
      default: 'Corrective',
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Repaired', 'Scrap'],
      default: 'New',
    },
    scheduledDate: { type: Date },
    duration: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('MaintenanceRequest', MaintenanceRequest);
