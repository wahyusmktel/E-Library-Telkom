const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/template/:type', verifyToken, importController.getTemplate);
router.post('/:type', verifyToken, verifyRole(['superadmin']), upload.single('file'), importController.startImport);
router.get('/status/:jobId', verifyToken, importController.getImportStatus);

module.exports = router;
