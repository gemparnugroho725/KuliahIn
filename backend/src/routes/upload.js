const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../config/multer');
const auth = require('../middleware/auth');
const { store } = require('../data/store');
const { v4: uuidv4 } = require('uuid');

router.post('/', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
    }

    const fileData = {
        id: uuidv4(),
        userId: req.user.id,
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        createdAt: new Date().toISOString(),
    };

    store.files.push(fileData);
    res.status(201).json({ success: true, data: fileData, message: 'File berhasil diupload' });
});

router.get('/', auth, (req, res) => {
    const files = store.files.filter((f) => f.userId === req.user.id);
    res.json({ success: true, data: files });
});

module.exports = router;
