const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document.model');
const { isAllowedFile } = require('../utils/fileValidator');
const { info, error } = require('../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const VERSIONS_DIR = path.join(__dirname, '..', 'versions');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR);

// Upload handler (used by route)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded'});

    // validate file extension
    if (!isAllowedFile(req.file.originalname)) {
      // delete temp file if any
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File type not allowed' });
    }

    const doc = new Document({
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      lastModifiedBy: req.user._id,
      versions: [{
        versionNumber: 1,
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user._id
      }]
    });

    await doc.save();
    res.status(201).json({ message: 'Uploaded', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// List documents with filtering, search & pagination
exports.listDocuments = async (req, res) => {
  try {
    const { q, type, uploader, page = 1, limit = 20, includeDeleted = false } = req.query;
    const filter = {};

    if (!JSON.parse(String(includeDeleted).toLowerCase())) filter.isDeleted = false;

    if (q) filter.name = { $regex: q, $options: 'i' };
    if (type) filter.mimeType = { $regex: type, $options: 'i' };
    if (uploader) filter.uploadedBy = uploader;

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const docs = await Document.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Document.countDocuments(filter);
    res.json({ docs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

// Get single document metadata
exports.getDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
};

// Download file
exports.download = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });

    const filePath = path.join(__dirname, '..', doc.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });

    res.download(filePath, doc.originalName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Download failed' });
  }
};

// Rename document
exports.renameDocument = async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ message: 'newName required' });

    const doc = await Document.findById(req.params.id);
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });

    doc.name = newName;
    doc.lastModifiedAt = new Date();
    doc.lastModifiedBy = req.user._id;
    await doc.save();

    res.json({ message: 'Renamed', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Rename failed' });
  }
};

// Replace document (creates new version)
exports.replaceDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const doc = await Document.findById(req.params.id);
    if (!doc || doc.isDeleted) {
      // cleanup uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Document not found' });
    }

    // save previous file as a version copy into versions folder
    const prevVersionNumber = doc.versions.length ? doc.versions[doc.versions.length - 1].versionNumber : 1;
    const newVersionNumber = prevVersionNumber + 1;

    // move new file into uploads (multer already placed into uploads), but ensure path is consistent
    const newFilePath = `/uploads/${req.file.filename}`;

    // push new version entry
    const versionEntry = {
      versionNumber: newVersionNumber,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: newFilePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      note: req.body.note || ''
    };

    doc.versions.push(versionEntry);

    // update current metadata to point to new file
    doc.path = newFilePath;
    doc.originalName = req.file.originalname;
    doc.mimeType = req.file.mimetype;
    doc.size = req.file.size;
    doc.lastModifiedAt = new Date();
    doc.lastModifiedBy = req.user._id;

    await doc.save();

    res.json({ message: 'Replaced - new version created', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Replace failed' });
  }
};

// List versions
exports.listVersions = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('versions.uploadedBy', 'name email');
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });
    res.json({ versions: doc.versions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch versions' });
  }
};

// Restore version (make a past version the current one)
exports.restoreVersion = async (req, res) => {
  try {
    const { versionNumber } = req.body;
    if (!versionNumber) return res.status(400).json({ message: 'versionNumber is required' });

    const doc = await Document.findById(req.params.id);
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });

    const version = doc.versions.find(v => v.versionNumber === Number(versionNumber));
    if (!version) return res.status(404).json({ message: 'Version not found' });

    // copy current file into versions (as next version) if needed
    const prevVersionNumber = doc.versions.length ? doc.versions[doc.versions.length - 1].versionNumber : 1;
    const newVersionNumber = prevVersionNumber + 1;

    // create a new version entry representing the restored state
    const restored = {
      versionNumber: newVersionNumber,
      filename: path.basename(version.path),
      originalName: version.originalName,
      path: version.path,
      mimeType: version.mimeType,
      size: version.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      note: `Restored from v${version.versionNumber}`
    };

    doc.versions.push(restored);

    // set doc current metadata to version
    doc.path = version.path;
    doc.originalName = version.originalName;
    doc.mimeType = version.mimeType;
    doc.size = version.size;
    doc.lastModifiedAt = new Date();
    doc.lastModifiedBy = req.user._id;

    await doc.save();
    res.json({ message: 'Restored version', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Restore failed' });
  }
};

// Delete (soft or hard)
exports.deleteDocument = async (req, res) => {
  try {
    const hard = String(req.query.hard || 'false').toLowerCase() === 'true';
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (hard) {
      // delete files associated: current and versions (attempt)
      try {
        const removeIfExists = (p) => {
          const full = path.join(__dirname, '..', p);
          if (fs.existsSync(full)) fs.unlinkSync(full);
        };
        removeIfExists(doc.path);
        doc.versions.forEach(v => removeIfExists(v.path));
      } catch (err) {
        // just log
        console.error('Error removing files during hard delete:', err);
      }
      await Document.deleteOne({ _id: doc._id });
      return res.json({ message: 'Document permanently deleted' });
    } else {
      doc.isDeleted = true;
      doc.deletedAt = new Date();
      await doc.save();
      return res.json({ message: 'Document soft-deleted' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // If user sent a new file, replace the old one
    if (req.file) {
      // delete old file if needed
      if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
      doc.path = req.file.path;
      doc.originalName = req.file.originalname;
    }

    // If user sent a new name, update it
    if (name) {
      doc.name = name;
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error("Update failed", err);
    res.status(500).json({ message: "Server error" });
  }
};
