const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Dummy AI summary generator
const generateSummary = (text) => {
    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const keyPhrases = text
        .split(/\s+/)
        .filter((w) => w.length > 5)
        .slice(0, 8)
        .join(', ');

    return {
        ringkasan: `Berdasarkan catatan/materi yang diberikan, terdapat ${wordCount} kata yang membahas topik-topik penting. ${sentences.length > 2 ? `Terdapat ${sentences.length} poin utama yang dijelaskan.` : ''
            } Materi ini mencakup konsep-konsep kunci yang relevan untuk pemahaman mendalam.`,
        poinPenting: [
            `Dokumen memiliki ${wordCount} kata dengan ${sentences.length} kalimat utama`,
            `Kata kunci teridentifikasi: ${keyPhrases || 'belum terdeteksi'}`,
            'Struktur materi bersifat informatif dan deskriptif',
            'Disarankan untuk membuat flashcard dari poin-poin utama',
        ],
        rekomendasiBelajar: [
            'Baca kembali bagian yang paling kompleks minimal 2 kali',
            'Buat mind map dari topik-topik utama',
            'Diskusikan dengan teman sekelas untuk pemahaman lebih dalam',
            'Kerjakan latihan soal terkait materi ini',
        ],
        estimasiWaktuBelajar: `${Math.ceil(wordCount / 200)} - ${Math.ceil(wordCount / 150)} menit`,
        tingkatKompleksitas: wordCount > 500 ? 'Tinggi' : wordCount > 200 ? 'Sedang' : 'Rendah',
    };
};

// POST /api/ai/summary
router.post('/summary', auth, async (req, res) => {
    try {
        const { teks, namaFile } = req.body;

        if (!teks || teks.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Teks terlalu pendek. Minimal 10 karakter untuk membuat ringkasan.',
            });
        }

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const summary = generateSummary(teks);

        res.json({
            success: true,
            data: {
                ...summary,
                sumber: namaFile || 'Catatan manual',
                diGenerasiPada: new Date().toISOString(),
                model: 'Kuliahin AI v1.0 (Demo)',
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal membuat ringkasan. Coba lagi.' });
    }
});

module.exports = router;
