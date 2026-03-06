const errorHandler = (err, req, res, next) => {
    console.error('[ERROR]', err.message);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar. Maksimal 10MB.' });
    }
    if (err.name === 'MulterError') {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }

    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server.',
    });
};

module.exports = errorHandler;
