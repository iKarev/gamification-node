const mongoose = require('mongoose');

const doingSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  type: { type: Number, required: true },
  periodType: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  multiplier: { type: Number },
  implements: [{
    date: { type: String, required: true },
    value: { type: Boolean, required: true }
  }]
})

module.exports = mongoose.model('Doing', doingSchema);