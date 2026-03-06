-- ========================================================
-- KULIAHIN – Supabase Schema
-- Jalankan script ini di Supabase SQL Editor
-- ========================================================

-- =====================
-- TABLE: jadwal
-- =====================
CREATE TABLE IF NOT EXISTS jadwal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "mataKuliah" TEXT NOT NULL CHECK (length("mataKuliah") >= 4),
  hari TEXT NOT NULL CHECK (hari IN ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')),
  "jamMulai" TEXT NOT NULL,
  "jamSelesai" TEXT NOT NULL,
  dosen TEXT,
  ruangan TEXT,
  warna TEXT DEFAULT '#2563EB',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TABLE: tugas
-- =====================
CREATE TABLE IF NOT EXISTS tugas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  judul TEXT NOT NULL CHECK (length(judul) >= 4),
  deskripsi TEXT,
  "mataKuliah" TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'belum' CHECK (status IN ('belum','dikerjakan','selesai')),
  prioritas TEXT DEFAULT 'sedang' CHECK (prioritas IN ('rendah','sedang','tinggi')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TABLE: todo
-- =====================
CREATE TABLE IF NOT EXISTS todo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  judul TEXT NOT NULL CHECK (length(judul) >= 4),
  deskripsi TEXT,
  selesai BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE jadwal ENABLE ROW LEVEL SECURITY;
ALTER TABLE tugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo ENABLE ROW LEVEL SECURITY;

-- Jadwal: hanya bisa CRUD milik sendiri
CREATE POLICY "jadwal_policy" ON jadwal FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- Tugas: hanya bisa CRUD milik sendiri
CREATE POLICY "tugas_policy" ON tugas FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- Todo: hanya bisa CRUD milik sendiri
CREATE POLICY "todo_policy" ON todo FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- =====================
-- STORAGE BUCKET
-- =====================
-- Jalankan ini SETELAH membuat bucket "uploads" secara manual di Supabase Storage dashboard
-- atau gunakan SQL berikut:

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Izinkan user yang login untuk upload ke bucket mereka
CREATE POLICY "uploads_insert_policy" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "uploads_select_policy" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "uploads_delete_policy" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
