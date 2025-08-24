const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const documentController = require('../controllers/document.controller');

// multer storage config - save files with UUID filenames to avoid collisions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random()*1E9)}${ext}`;
    cb(null, filename);
  }
});

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760', 10); // default 10MB

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
  dest: "uploads/",
});

// PUBLIC (if you want to allow read by not logged in users — currently protect read as per requirements)
router.get('/', auth, authorizeRoles('admin','editor','viewer'), documentController.listDocuments);
router.get('/:id', auth, authorizeRoles('admin','editor','viewer'), documentController.getDocument);
router.get('/:id/download', auth, authorizeRoles('admin','editor','viewer'), documentController.download);
router.get('/:id/versions', auth, authorizeRoles('admin','editor','viewer'), documentController.listVersions);

// Upload (create) - editor+admin
router.post('/upload', auth, authorizeRoles('admin','editor'), upload.single('file'), documentController.uploadDocument);

// Replace file (creates new version) - editor+admin
router.post('/:id/replace', auth, authorizeRoles('admin','editor'), upload.single('file'), documentController.replaceDocument);

// Rename - editor+admin
router.put('/:id/rename', auth, authorizeRoles('admin','editor'), documentController.renameDocument);

// Restore version - editor+admin
router.post('/:id/restore-version', auth, authorizeRoles('admin','editor'), documentController.restoreVersion);

// Delete - admin only (soft or hard)
router.delete('/:id', auth, authorizeRoles('admin'), documentController.deleteDocument);

// PUT /api/documents/:id → rename or replace file
router.put("/:id", upload.single("file"), documentController.updateDocument);

module.exports = router;
