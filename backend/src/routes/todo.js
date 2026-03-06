const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { store } = require('../data/store');

const todoSchema = Joi.object({
    judul: Joi.string().min(4).required().messages({
        'string.min': 'Judul todo minimal 4 karakter',
        'any.required': 'Judul todo wajib diisi',
    }),
    deskripsi: Joi.string().allow('').optional(),
    selesai: Joi.boolean().default(false),
});

// GET all todo
router.get('/', auth, (req, res) => {
    const todos = store.todo.filter((t) => t.userId === req.user.id);
    res.json({ success: true, data: todos });
});

// POST create todo
router.post('/', auth, validate(todoSchema), (req, res) => {
    const newTodo = {
        id: uuidv4(),
        userId: req.user.id,
        ...req.body,
        selesai: false,
        createdAt: new Date().toISOString(),
    };
    store.todo.push(newTodo);
    res.status(201).json({ success: true, data: newTodo, message: 'Todo berhasil ditambahkan' });
});

// PUT update todo
router.put('/:id', auth, validate(todoSchema), (req, res) => {
    const idx = store.todo.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Todo tidak ditemukan' });
    store.todo[idx] = { ...store.todo[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: store.todo[idx], message: 'Todo berhasil diperbarui' });
});

// PATCH toggle selesai
router.patch('/:id/toggle', auth, (req, res) => {
    const idx = store.todo.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Todo tidak ditemukan' });
    store.todo[idx].selesai = !store.todo[idx].selesai;
    store.todo[idx].updatedAt = new Date().toISOString();
    res.json({ success: true, data: store.todo[idx] });
});

// DELETE todo
router.delete('/:id', auth, (req, res) => {
    const idx = store.todo.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Todo tidak ditemukan' });
    store.todo.splice(idx, 1);
    res.json({ success: true, message: 'Todo berhasil dihapus' });
});

module.exports = router;
