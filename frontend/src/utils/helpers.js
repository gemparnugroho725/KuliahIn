import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'd MMM yyyy', { locale: id });
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'd MMM yyyy, HH:mm', { locale: id });
};

export const getDeadlineInfo = (dateStr) => {
    if (!dateStr) return { text: '-', class: 'deadline-ok' };
    const date = new Date(dateStr);
    const diff = differenceInDays(date, new Date());

    if (isPast(date)) return { text: 'Terlambat!', class: 'deadline-urgent' };
    if (isToday(date)) return { text: 'Hari ini!', class: 'deadline-urgent' };
    if (isTomorrow(date)) return { text: 'Besok', class: 'deadline-soon' };
    if (diff <= 3) return { text: `${diff} hari lagi`, class: 'deadline-soon' };
    return { text: formatDate(dateStr), class: 'deadline-ok' };
};

export const getTodayName = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
};

export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
};

export const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const STATUS_CONFIG = {
    belum: { label: 'Belum Dikerjakan', badgeClass: 'badge-gray' },
    dikerjakan: { label: 'Sedang Dikerjakan', badgeClass: 'badge-yellow' },
    selesai: { label: 'Selesai', badgeClass: 'badge-green' },
};

export const PRIORITAS_CONFIG = {
    rendah: { label: 'Rendah', badgeClass: 'badge-blue' },
    sedang: { label: 'Sedang', badgeClass: 'badge-yellow' },
    tinggi: { label: 'Tinggi', badgeClass: 'badge-red' },
};

export const WARNA_OPTIONS = [
    '#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706',
    '#0EA5E9', '#DB2777', '#0D9488', '#EA580C', '#65A30D',
];
