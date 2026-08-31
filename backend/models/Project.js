const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, required: true },
  link: { type: String, default: '' },
  isLive: { type: Boolean, default: false },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  status: { type: String, enum: ['Active', 'Inactive', 'In progress'], required: true },
  tags: { type: [String], default: [] },
  techStack: { type: [String], default: [] },
  githubUrl: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { 
  timestamps: true // Automatically handles createdAt and updatedAt
});

// Map MongoDB's _id to the id field expected by the frontend
projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Project', projectSchema);