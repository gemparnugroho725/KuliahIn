const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kuliahin-super-secret-jwt-key-2024';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const generateToken = (user) =>
    jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

// DEV: Demo login (bypass OAuth for local testing)
router.get('/demo-login', (req, res) => {
    const { findUserById } = require('../data/store');
    const user = findUserById('user-demo-1');
    if (!user) return res.status(404).json({ success: false, message: 'Demo user tidak ditemukan' });
    const token = generateToken(user);
    res.json({ success: true, token, user });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login?error=oauth_failed` }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
    }
);

// Get current user
router.get('/me', require('../middleware/auth'), (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ success: true, user: userWithoutPassword });
});

// Update preferences
router.put('/preferences', require('../middleware/auth'), (req, res) => {
    const { notifJadwal, notifDeadline, notifBrowser } = req.body;
    req.user.preferences = { notifJadwal, notifDeadline, notifBrowser };
    res.json({ success: true, user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Berhasil logout' });
});

module.exports = router;
