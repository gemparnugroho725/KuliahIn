import { supabase } from './supabase';

// ========================
// Helper: wrap Supabase response to match existing page format { data: { data: [...] } }
// ========================
const wrap = (data) => ({ data: { data, success: true } });

// ========================
// JADWAL
// ========================
export const jadwalAPI = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('jadwal')
            .select('*')
            .order('"createdAt"', { ascending: false });
        if (error) throw error;
        return wrap(data);
    },
    create: async (form) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('jadwal')
            .insert({ ...form, userId: user.id })
            .select()
            .single();
        if (error) throw error;

        // Trigger immediate check
        import('./NotificationEngine').then(({ notificationEngine }) => {
            notificationEngine.check();
        });

        return wrap(data);
    },
    update: async (id, form) => {
        const { data, error } = await supabase
            .from('jadwal')
            .update(form)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return wrap(data);
    },
    delete: async (id) => {
        const { error } = await supabase.from('jadwal').delete().eq('id', id);
        if (error) throw error;
        return wrap(null);
    },
};

// ========================
// TUGAS
// ========================
export const tugasAPI = {
    getAll: async (params = {}) => {
        let query = supabase.from('tugas').select('*').order('deadline', { ascending: true });
        if (params.status) query = query.eq('status', params.status);
        if (params.mataKuliah) query = query.eq('"mataKuliah"', params.mataKuliah);
        if (params.prioritas) query = query.eq('prioritas', params.prioritas);
        const { data, error } = await query;
        if (error) throw error;
        return wrap(data);
    },
    create: async (form) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('tugas')
            .insert({ ...form, userId: user.id })
            .select()
            .single();
        if (error) throw error;
        
        // Trigger immediate check in case the new task is already within threshold
        import('./NotificationEngine').then(({ notificationEngine }) => {
            notificationEngine.check();
        });

        return wrap(data);
    },
    update: async (id, form) => {
        const { data, error } = await supabase
            .from('tugas')
            .update(form)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return wrap(data);
    },
    updateStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('tugas')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return wrap(data);
    },
    delete: async (id) => {
        const { error } = await supabase.from('tugas').delete().eq('id', id);
        if (error) throw error;
        return wrap(null);
    },
};

// ========================
// TODO
// ========================
export const todoAPI = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('todo')
            .select('*')
            .order('"createdAt"', { ascending: false });
        if (error) throw error;
        return wrap(data);
    },
    create: async (form) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('todo')
            .insert({ ...form, selesai: false, userId: user.id })
            .select()
            .single();
        if (error) throw error;
        return wrap(data);
    },
    update: async (id, form) => {
        const { data, error } = await supabase
            .from('todo')
            .update(form)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return wrap(data);
    },
    toggle: async (id) => {
        // Get current state then toggle
        const { data: current } = await supabase.from('todo').select('selesai').eq('id', id).single();
        const { data, error } = await supabase
            .from('todo')
            .update({ selesai: !current.selesai })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return wrap(data);
    },
    delete: async (id) => {
        const { error } = await supabase.from('todo').delete().eq('id', id);
        if (error) throw error;
        return wrap(null);
    },
};

// ========================
// UPLOAD (Supabase Storage)
// ========================
export const uploadAPI = {
    upload: async (formData) => {
        const file = formData.get('file');
        if (!file) throw new Error('Tidak ada file yang dipilih');
        if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran file terlalu besar. Maksimal 10MB.');

        const { data: { user } } = await supabase.auth.getUser();
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;

        const { data, error } = await supabase.storage.from('uploads').upload(path, file);
        if (error) throw error;

        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
        return wrap({
            originalName: file.name,
            filename: path,
            mimetype: file.type,
            size: file.size,
            url: urlData.publicUrl,
            createdAt: new Date().toISOString(),
        });
    },
};

// ========================
// AI Summary (client-side dummy)
// ========================
export const aiAPI = {
    generateSummary: async (teks, namaFile) => {
        // Simulate delay
        await new Promise((r) => setTimeout(r, 1200));
        const wordCount = teks.split(/\s+/).filter(Boolean).length;
        const sentences = teks.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        const keyPhrases = teks.split(/\s+/).filter((w) => w.length > 5).slice(0, 8).join(', ');

        return wrap({
            ringkasan: `Berdasarkan catatan/materi yang diberikan, terdapat ${wordCount} kata yang membahas topik-topik penting. ${sentences.length > 2 ? `Terdapat ${sentences.length} poin utama yang dijelaskan.` : ''} Materi ini mencakup konsep-konsep kunci yang relevan untuk pemahaman mendalam.`,
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
            sumber: namaFile || 'Catatan manual',
            diGenerasiPada: new Date().toISOString(),
            model: 'Kuliahin AI v1.0',
        });
    },
};

// Legacy export for backward compat
export const authAPI = {
    updatePreferences: async (prefs) => {
        // Store prefs in localStorage since Supabase doesn't have custom user fields without extra tables
        localStorage.setItem('kuliahin_prefs', JSON.stringify(prefs));
        return { data: { success: true } };
    },
};
