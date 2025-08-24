const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');           // protect if you want
const authorizeRoles = require('../middleware/role.middleware'); // optional
const onlyofficeController = require('../controllers/onlyoffice.controller');

// Create editor config for a document
router.get('/config/:id', auth, authorizeRoles('admin','editor','viewer'), onlyofficeController.getConfig);

// Callback receiver (DocumentServer -> your backend)
router.post('/callback/:id', onlyofficeController.callback);


// router.post("/config", (req, res) => {
//   const { fileUrl, fileName } = req.body;

//   const config = {
//     document: {
//       fileType: fileName.split(".").pop(),
//       title: fileName,
//       url: `http://host.docker.internal:5000/${document.fileName}`,
//     },
//     editorConfig: {
//       callbackUrl: "`http://host.docker.internal:5000/api/onlyoffice/callback/${doc._id}`", // receives save updates
//     },
//   };

//   res.json({
//     editorUrl: `http://localhost:8080/office?config=${encodeURIComponent(
//       JSON.stringify(config)
//     )}`,
//   });
// });


module.exports = router;
