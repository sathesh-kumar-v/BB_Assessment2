const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');           // protect if you want
const authorizeRoles = require('../middleware/role.middleware'); // optional
const onlyofficeController = require('../controllers/onlyoffice.controller');

// Create editor config for a document
router.get('/config/:id', auth, authorizeRoles('admin','editor','viewer'), onlyofficeController.getConfig);

// Callback receiver (DocumentServer -> your backend)
router.post('/callback/:id', onlyofficeController.callback);

module.exports = router;
