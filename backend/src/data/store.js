const { v4: uuidv4 } = require('uuid');

// In-memory store
const store = {
  users: [
    {
      id: 'user-demo-1',
      googleId: 'demo-google-id',
      name: 'Budi Mahasiswa',
      email: 'budi@student.ac.id',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
      preferences: {
        notifJadwal: true,
        notifDeadline: true,
        notifBrowser: false,
      },
      createdAt: new Date().toISOString(),
    },
  ],

  jadwal: [
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      mataKuliah: 'Pemrograman Web',
      hari: 'Senin',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      dosen: 'Dr. Andi Santoso',
      ruangan: 'Lab Komputer 1',
      warna: '#2563EB',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      mataKuliah: 'Basis Data',
      hari: 'Selasa',
      jamMulai: '10:00',
      jamSelesai: '12:00',
      dosen: 'Prof. Siti Rahma',
      ruangan: 'Ruang 302',
      warna: '#7C3AED',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      mataKuliah: 'Kalkulus II',
      hari: 'Rabu',
      jamMulai: '13:00',
      jamSelesai: '15:00',
      dosen: 'Dr. Hendra Wijaya',
      ruangan: 'Ruang 201',
      warna: '#059669',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      mataKuliah: 'Jaringan Komputer',
      hari: 'Kamis',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      dosen: 'Ir. Bambang Susilo',
      ruangan: 'Lab Jaringan',
      warna: '#DC2626',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      mataKuliah: 'Rekayasa Perangkat Lunak',
      hari: 'Jumat',
      jamMulai: '09:00',
      jamSelesai: '11:00',
      dosen: 'Dr. Maya Putri',
      ruangan: 'Ruang 401',
      warna: '#D97706',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      mataKuliah: 'Pemrograman Web',
      hari: 'Jumat',
      jamMulai: '13:00',
      jamSelesai: '15:00',
      dosen: 'Dr. Andi Santoso',
      ruangan: 'Lab Komputer 1',
      warna: '#2563EB',
      createdAt: new Date().toISOString(),
    },
  ],

  tugas: [
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Buat REST API dengan Express.js',
      deskripsi: 'Membuat backend API untuk aplikasi manajemen tugas menggunakan Express.js dan MongoDB. Implementasikan endpoint CRUD untuk users, tasks, dan categories.',
      mataKuliah: 'Pemrograman Web',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'dikerjakan',
      prioritas: 'tinggi',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Laporan Praktikum Basis Data',
      deskripsi: 'Membuat laporan lengkap hasil praktikum normalisasi database dan implementasi query kompleks menggunakan PostgreSQL.',
      mataKuliah: 'Basis Data',
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'belum',
      prioritas: 'tinggi',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Soal Latihan Kalkulus BAB 5',
      deskripsi: 'Mengerjakan soal latihan integral lipat dari buku referensi halaman 234-256.',
      mataKuliah: 'Kalkulus II',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'belum',
      prioritas: 'sedang',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Proposal Proyek RPL',
      deskripsi: 'Membuat dokumen proposal untuk proyek akhir mata kuliah RPL, termasuk diagram use case, ERD, dan rancangan arsitektur sistem.',
      mataKuliah: 'Rekayasa Perangkat Lunak',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'selesai',
      prioritas: 'tinggi',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Analisis Topologi Jaringan',
      deskripsi: 'Menganalisis dan membandingkan berbagai topologi jaringan (star, bus, ring, mesh) beserta kelebihan dan kekurangannya.',
      mataKuliah: 'Jaringan Komputer',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'dikerjakan',
      prioritas: 'sedang',
      createdAt: new Date().toISOString(),
    },
  ],

  todo: [
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Baca materi pemrograman web minggu ini',
      deskripsi: 'Bab 7 - RESTful API Design Principles',
      selesai: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Download slide Basis Data dari LMS',
      deskripsi: 'Materi normalisasi 3NF dan query optimization',
      selesai: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Beli buku Kalkulus Purcell edisi 9',
      deskripsi: 'Tersedia di toko buku kampus lt.2',
      selesai: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Booking ruang diskusi kelompok RPL',
      deskripsi: 'Untuk diskusi proposal proyek minggu depan',
      selesai: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: 'user-demo-1',
      judul: 'Install Cisco Packet Tracer',
      deskripsi: 'Untuk keperluan simulasi praktikum jaringan',
      selesai: true,
      createdAt: new Date().toISOString(),
    },
  ],

  files: [],
};

// Helper functions
const findUserById = (id) => store.users.find((u) => u.id === id);
const findUserByGoogleId = (googleId) => store.users.find((u) => u.googleId === googleId);

const createUser = (data) => {
  const user = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
  store.users.push(user);
  return user;
};

module.exports = { store, findUserById, findUserByGoogleId, createUser };
