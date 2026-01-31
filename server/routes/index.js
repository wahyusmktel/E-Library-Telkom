const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifySignature } = require('../utils/signature');

const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');
const importRoutes = require('./importRoutes');
const referenceRoutes = require('./referenceRoutes');
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/', authRoutes);
router.use('/book-catalogs', bookRoutes);
router.use('/books', bookRoutes);
router.use('/import', importRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', referenceRoutes);

// File viewing route (centralized)
router.get('/files/view', (req, res) => {
    const { path: filePath, expires, signature } = req.query;
    if (!filePath || !expires || !signature) return res.status(400).json({ message: 'Missing parameters' });
    if (!verifySignature(filePath, expires, signature)) return res.status(403).json({ message: 'Invalid or expired signature' });

    const absolutePath = path.join(__dirname, '../', filePath);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: 'File not found' });
    res.sendFile(absolutePath);
});

module.exports = router;
