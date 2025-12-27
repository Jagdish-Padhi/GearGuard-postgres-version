const mongoose = require('mongoose');

const Team = new mongoose.Schema(
  {
    name: { type: String, required: true },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timeStamps: true }
);

module.exports = mongoose.model('Team', Team);
