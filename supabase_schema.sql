-- ========================================================
-- KULIAHIN – Supabase Schema (Fixed Idempotent Version)
-- Jalankan script ini di Supabase SQL Editor
-- ========================================================

-- =====================
-- 1. CREATE TABLES (IF NOT EXISTS)
-- =====================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','banned')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS todo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  judul TEXT NOT NULL CHECK (length(judul) >= 4),
  deskripsi TEXT,
  selesai BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 2. ENABLE RLS
-- =====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal ENABLE ROW LEVEL SECURITY;
ALTER TABLE tugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo ENABLE ROW LEVEL SECURITY;

-- =====================
-- 3. MANAGE POLICIES (DROP & CREATE)
-- =====================

-- Profiles: Sangat sederhana untuk menghindari Infinite Loop.
-- User hanya bisa melihat datanya sendiri. Admin akan memanajemen user dari Dashboard Supabase langsung.
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

CREATE POLICY "profiles_policy" ON profiles FOR ALL
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- Jadwal
DROP POLICY IF EXISTS "jadwal_policy" ON jadwal;
CREATE POLICY "jadwal_policy" ON jadwal FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- Tugas
DROP POLICY IF EXISTS "tugas_policy" ON tugas;
CREATE POLICY "tugas_policy" ON tugas FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- Todo
DROP POLICY IF EXISTS "todo_policy" ON todo;
CREATE POLICY "todo_policy" ON todo FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- =====================
-- 5. STORAGE BUCKET & POLICIES
-- =====================

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "uploads_insert_policy" ON storage.objects;
CREATE POLICY "uploads_insert_policy" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "uploads_select_policy" ON storage.objects;
CREATE POLICY "uploads_select_policy" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "uploads_delete_policy" ON storage.objects;
CREATE POLICY "uploads_delete_policy" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================
-- 6. TRIGGERS (Auto-sync auth.users to profiles)
-- =====================

-- This function automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Mahasiswa'),
    'user' -- Semua default 'user', nanti diubah manual di Supabase oleh admin
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on insert to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
