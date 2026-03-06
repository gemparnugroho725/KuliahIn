const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { store } = require('../data/store');

const tugasSchema = Joi.object({
    judul: Joi.string().min(4).required().messages({
        'string.min': 'Judul tugas minimal 4 karakter',
        'any.required': 'Judul tugas wajib diisi',
    }),
    deskripsi: Joi.string().allow('').optional(),
    mataKuliah: Joi.string().required().messages({ 'any.required': 'Mata kuliah wajib diisi' }),
    deadline: Joi.string().isoDate().required().messages({
        'string.isoDate': 'Format deadline tidak valid',
        'any.required': 'Deadline wajib diisi',
    }),
    status: Joi.string().valid('belum', 'dikerjakan', 'selesai').default('belum'),
    prioritas: Joi.string().valid('rendah', 'sedang', 'tinggi').default('sedang'),
});

// GET all tugas (with filter)
router.get('/', auth, (req, res) => {
    let tugas = store.tugas.filter((t) => t.userId === req.user.id);

    if (req.query.status) {
        tugas = tugas.filter((t) => t.status === req.query.status);
    }
    if (req.query.mataKuliah) {
        tugas = tugas.filter((t) => t.mataKuliah === req.query.mataKuliah);
    }
    if (req.query.prioritas) {
        tugas = tugas.filter((t) => t.prioritas === req.query.prioritas);
    }

    // Sort by deadline ascending
    tugas.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    res.json({ success: true, data: tugas });
});

// POST create tugas
router.post('/', auth, validate(tugasSchema), (req, res) => {
    const newTugas = {
        id: uuidv4(),
        userId: req.user.id,
        ...req.body,
        createdAt: new Date().toISOString(),
    };
    store.tugas.push(newTugas);
    res.status(201).json({ success: true, data: newTugas, message: 'Tugas berhasil ditambahkan' });
});

// PUT update tugas
router.put('/:id', auth, validate(tugasSchema), (req, res) => {
    const idx = store.tugas.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    store.tugas[idx] = { ...store.tugas[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: store.tugas[idx], message: 'Tugas berhasil diperbarui' });
});

// PATCH update status only
router.patch('/:id/status', auth, (req, res) => {
    const { status } = req.body;
    if (!['belum', 'dikerjakan', 'selesai'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }
    const idx = store.tugas.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    store.tugas[idx].status = status;
    store.tugas[idx].updatedAt = new Date().toISOString();
    res.json({ success: true, data: store.tugas[idx], message: 'Status tugas diperbarui' });
});

// DELETE tugas
router.delete('/:id', auth, (req, res) => {
    const idx = store.tugas.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    store.tugas.splice(idx, 1);
    res.json({ success: true, message: 'Tugas berhasil dihapus' });
});

module.exports = router;
