const mongoose = require('mongoose');


const Equipment = new mongoose.Schema({
    name: {type: String, required: true},
    serialNumber:{type:String, unique: true},
    purchaseDate: {type: Date},
    warrantyInfo:{type: String},
    location: {type: String},
    defaultTeamId: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
    isActive: {type: Boolean, default: true}
}, {timestamps: true});


module.exports = mongoose.model('Equipment', Equipment);