const mongoose = require('mongoose');

const topSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  periodType: { type: Number, required: true },
  type: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  done: { type: Boolean },
  date: { type: String, required: true },
  targetName: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Target' }
})

module.exports = mongoose.model('Top', topSchema);