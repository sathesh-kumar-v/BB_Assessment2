const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  note: { type: String }
});

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // display name
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  lastModifiedAt: { type: Date, default: Date.now },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  versions: [versionSchema],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
