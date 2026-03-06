const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { store } = require('../data/store');

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const jadwalSchema = Joi.object({
    mataKuliah: Joi.string().min(4).required().messages({
        'string.min': 'Nama mata kuliah minimal 4 karakter',
        'any.required': 'Nama mata kuliah wajib diisi',
    }),
    hari: Joi.string().valid(...HARI).required().messages({
        'any.only': 'Hari tidak valid',
        'any.required': 'Hari wajib diisi',
    }),
    jamMulai: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
        'string.pattern.base': 'Format jam mulai tidak valid (HH:MM)',
        'any.required': 'Jam mulai wajib diisi',
    }),
    jamSelesai: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
        'string.pattern.base': 'Format jam selesai tidak valid (HH:MM)',
        'any.required': 'Jam selesai wajib diisi',
    }),
    dosen: Joi.string().allow('').optional(),
    ruangan: Joi.string().allow('').optional(),
    warna: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#2563EB'),
});

// GET all jadwal
router.get('/', auth, (req, res) => {
    const jadwal = store.jadwal.filter((j) => j.userId === req.user.id);
    res.json({ success: true, data: jadwal });
});

// POST create jadwal
router.post('/', auth, validate(jadwalSchema), (req, res) => {
    const newJadwal = {
        id: uuidv4(),
        userId: req.user.id,
        ...req.body,
        createdAt: new Date().toISOString(),
    };
    store.jadwal.push(newJadwal);
    res.status(201).json({ success: true, data: newJadwal, message: 'Jadwal berhasil ditambahkan' });
});

// PUT update jadwal
router.put('/:id', auth, validate(jadwalSchema), (req, res) => {
    const idx = store.jadwal.findIndex((j) => j.id === req.params.id && j.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    store.jadwal[idx] = { ...store.jadwal[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: store.jadwal[idx], message: 'Jadwal berhasil diperbarui' });
});

// DELETE jadwal
router.delete('/:id', auth, (req, res) => {
    const idx = store.jadwal.findIndex((j) => j.id === req.params.id && j.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    store.jadwal.splice(idx, 1);
    res.json({ success: true, message: 'Jadwal berhasil dihapus' });
});

module.exports = router;
