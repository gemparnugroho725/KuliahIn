const jwt = require('jsonwebtoken');
const { findUserById } = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'kuliahin-super-secret-jwt-key-2024';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User tidak ditemukan.' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token kadaluarsa. Silakan login kembali.' });
        }
        return res.status(401).json({ success: false, message: 'Token tidak valid.' });
    }
};

module.exports = authMiddleware;
