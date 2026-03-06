require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');

const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const jadwalRoutes = require('./routes/jadwal');
const tugasRoutes = require('./routes/tugas');
const todoRoutes = require('./routes/todo');
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session (for OAuth)
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'kuliahin-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' },
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Kuliahin API is running!', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/tugas', tugasRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// 404
app.use('/{*splat}', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan` });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\n🚀 Kuliahin API running on http://localhost:${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Demo Login: http://localhost:${PORT}/api/auth/demo-login\n`);
});

module.exports = app;
