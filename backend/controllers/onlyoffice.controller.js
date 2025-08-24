const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document.model');

const OO_SECRET = process.env.ONLYOFFICE_JWT_SECRET || 'SuperSecret_ChangeMe';
const DS_URL    = process.env.ONLYOFFICE_DS_URL || 'http://localhost:8085';
const APP_URL   = process.env.APP_PUBLIC_BASE || 'http://localhost:5000';

// Build a stable key for OnlyOffice. Change when new version is created.
function buildDocKey(doc) {
  // unique key length <= 128 recommended
  return `${doc._id}-${doc.updatedAt.getTime()}`;
}

// GET /api/onlyoffice/config/:id
// exports.getConfig = async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });

//     // The URL OnlyOffice will use to download the file (container -> host)
//     const fileUrlForDS = `http://host.docker.internal:5000/uploads/${doc.versions[doc.versions.length-1].filename}`;

//     // Callback URL DocumentServer will call to save changes
//     const callbackUrl = `http://host.docker.internal:5000/api/onlyoffice/callback/${doc._id}`;

//     // Detect documentType from mime
//     let documentType = 'text';
//     if (/spreadsheet/i.test(doc.mimeType)) documentType = 'spreadsheet';
//     else if (/presentation/i.test(doc.mimeType)) documentType = 'presentation';

//     const config = {
//       document: {
//         fileType: (doc.originalName.split('.').pop() || '').toLowerCase(),
//         key: buildDocKey(doc),
//         title: doc.name,
//         url: fileUrlForDS,
//         permissions: {
//           download: true,
//           print: true,
//           edit: true, // set false for viewers
//           comment: true
//         }
//       },
//       editorConfig: {
//         mode: 'edit', // or 'view'
//         callbackUrl,
//         user: {
//           id: String(req.user?._id || 'guest'),
//           name: req.user?.name || 'Guest'
//         }
//       }
//     };

//     // Sign with JWT so DS accepts it
//     const token = jwt.sign(config, OO_SECRET);
//     res.json({
//       config,
//       token,
//       docServerApiJs: `${DS_URL}/web-apps/apps/api/documents/api.js`
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to build config' });
//   }
// };

// GET /api/onlyoffice/config/:id
exports.getConfig = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });

    const fileUrlForDS = `${process.env.APP_PUBLIC_BASE}/uploads/${doc.versions[doc.versions.length-1].filename}`;
    const callbackUrl  = `${process.env.APP_PUBLIC_BASE}/api/onlyoffice/callback/${doc._id}`;

    let documentType = 'text';
    if (/spreadsheet/i.test(doc.mimeType)) documentType = 'spreadsheet';
    else if (/presentation/i.test(doc.mimeType)) documentType = 'presentation';

    const config = {
      document: {
        fileType: (doc.originalName.split('.').pop() || '').toLowerCase(),
        key: `${doc._id}-${doc.updatedAt.getTime()}`,
        title: doc.name,
        url: fileUrlForDS,
        permissions: {
          download: true,
          print: true,
          edit: true,
          comment: true
        }
      },
      editorConfig: {
        mode: 'edit',
        callbackUrl,
        user: {
          id: String(req.user?._id || 'guest'),
          name: req.user?.name || 'Guest'
        }
      }
    };

    // Sign config
    const token = jwt.sign(config, OO_SECRET);

    // ⚠️ Embed token inside config too
    config.token = token;

    res.json({
      config,
      token,
      docServerApiJs: `http://host.docker.internal:8085/web-apps/apps/api/documents/api.js`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to build config' });
  }
};


// POST /api/onlyoffice/callback/:id
exports.callback = async (req, res) => {
  try {
    const body = req.body || {};

    // Verify JWT if enabled
    try {
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || body.token;
      if (token) jwt.verify(token, OO_SECRET);
    } catch (e) {
      console.warn('OnlyOffice callback JWT verify failed:', e.message);
      // return res.status(401).json({ error: 'Invalid callback token' });
    }

    const { id } = req.params;
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Only process MustSave (2) or ForceSave (6)
    if (body.status === 2 || body.status === 6) {
      const downloadUrl = body.url; 
      const resp = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(resp.data);

      const ext = path.extname(doc.originalName) || '.docx';
      const filename = `${Date.now()}-${Math.round(Math.random()*1E9)}${ext}`;
      const serverRelative = `/uploads/${filename}`;
      const absPath = path.join(__dirname, '..', serverRelative);

      fs.writeFileSync(absPath, buffer);

      // Update DB with new version
      const nextVersion = (doc.versions?.[doc.versions.length-1]?.versionNumber || 0) + 1;
      doc.versions.push({
        versionNumber: nextVersion,
        filename,
        originalName: doc.originalName,
        path: serverRelative,
        mimeType: doc.mimeType,
        size: buffer.length,
        uploadedBy: doc.lastModifiedBy || doc.uploadedBy
      });

      doc.path = serverRelative;
      doc.size = buffer.length;
      doc.lastModifiedAt = new Date();

      await doc.save();

      return res.json({ error: 0 });
    }

    // For other statuses: just acknowledge
    return res.json({ error: 0 });

  } catch (err) {
    console.error('Callback error:', err);
    return res.json({ error: 1 });
  }
};

exports.getEditorConfig = (req, res) => {
  const file = req.fileDoc; // fetched from DB

  const config = {
    document: {
      fileType: file.extension,
      key: file._id.toString(),
      title: file.name,
      url: `http://host.docker.internal:5000/uploads/${file.filename}`,
    },
    editorConfig: {
      callbackUrl: `http://host.docker.internal:5000/api/onlyoffice/callback/${file._id}`,
      user: {
        id: req.user._id.toString(),
        name: req.user.name
      }
    },
    token: null,
  };

  // ✅ Sign the config with the same secret as in local.json
  const token = jwt.sign(config, process.env.ONLYOFFICE_JWT_SECRET);

  // ✅ Attach token inside config (browser requires it)
  config.token = token;

  res.json({
    config,
    docServerApiJs: "http://localhost:8080/web-apps/apps/api/documents/api.js"
});
};
