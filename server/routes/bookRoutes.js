const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/', verifyToken, bookController.getAllBooks);
router.post('/', verifyToken, verifyRole(['superadmin']), bookController.createBook);
router.put('/:id', verifyToken, verifyRole(['superadmin']), bookController.updateBook);
router.delete('/:id', verifyToken, verifyRole(['superadmin']), bookController.deleteBook);
router.post('/upload', verifyToken, verifyRole(['superadmin']), upload.single('file'), bookController.uploadFile);
router.post('/remote-download', verifyToken, verifyRole(['superadmin']), bookController.remoteDownload);

module.exports = router;
