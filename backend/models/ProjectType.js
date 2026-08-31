const mongoose = require('mongoose');

const projectTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: 'indigo' },
  isDefault: { type: Boolean, default: false }
});

// Map MongoDB's _id to id
projectTypeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('ProjectType', projectTypeSchema);