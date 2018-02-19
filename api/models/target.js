const mongoose = require('mongoose');

const targetSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  type: { type: Number, required: true },
  description: { type: String },
  done: { type: Boolean },
  deadline: { type: mongoose.Schema.Types.Date, required: true },
  parentTargetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Target' }
})

module.exports = mongoose.model('Target', targetSchema);