import { format, isBefore, addMinutes, isSameDay, addDays, parse } from 'date-fns';
import { supabase } from './supabase';

class NotificationService {
    constructor() {
        this.interval = null;
        this.notifiedEvents = JSON.parse(localStorage.getItem('kuliahin_notified_events') || '{}');
        this.onNotification = null; // Callback for in-app UI
    }

    start(onNotificationCallback = null) {
        if (this.interval) return;
        
        if (onNotificationCallback) {
            this.onNotification = onNotificationCallback;
        }

        console.log("[Notification Engine] Starting...");
        // initial check
        this.check();
        
        // check every minute
        this.interval = setInterval(() => {
            this.check();
        }, 60000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.onNotification = null;
            console.log("[Notification Engine] Stopped.");
        }
    }

    async check() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // User not logged in
        
        const prefs = JSON.parse(localStorage.getItem('kuliahin_prefs') || '{}');
        const now = new Date();

        // 1. Check Schedules
        if (prefs.notifJadwal) {
            this.checkSchedules(now, prefs);
        }

        // 2. Check Tasks
        if (prefs.notifDeadline) {
            this.checkTasks(now, prefs);
        }
    }

    getReminderMinutes(value, unit) {
        const val = parseInt(value) || 0;
        if (unit === 'hours') return val * 60;
        if (unit === 'days') return val * 1440;
        return val; // default minutes
    }

    async checkSchedules(now, prefs) {
        // Fetch today's schedule
        const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][now.getDay()];
        const { data: jadwal } = await supabase
            .from('jadwal')
            .select('*')
            .eq('hari', hariIndo);

        if (!jadwal || jadwal.length === 0) return;

        const minutesBefore = this.getReminderMinutes(prefs.jadwalReminderValue || 15, prefs.jadwalReminderUnit || 'minutes');

        jadwal.forEach(item => {
            const eventId = `jadwal_${item.id}_${format(now, 'yyyy-MM-dd')}`;
            if (this.notifiedEvents[eventId]) return;

            // Parse jamMulai (e.g., '08:00')
            try {
                const startTime = parse(item.jamMulai, 'HH:mm', now);
                const timeDiffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);

                if (timeDiffMinutes > 0 && timeDiffMinutes <= minutesBefore) {
                    const unitLabel = prefs.jadwalReminderUnit === 'hours' ? 'jam' : 'menit';
                    const amount = prefs.jadwalReminderValue || 15;
                    this.triggerNotification(
                        `Kelas Segera Dimulai!`,
                        `Mata Kuliah ${item.mataKuliah} akan dimulai dalam ${amount} ${unitLabel} di ruang ${item.ruangan || '-'}.`,
                        eventId
                    );
                }
            } catch (error) {
                console.error("Error parsing schedule time", error);
            }
        });
    }

    async checkTasks(now, prefs) {
        // Fetch pending tasks
        const { data: tugas, error } = await supabase
            .from('tugas')
            .select('*')
            .in('status', ['belum', 'dikerjakan']);

        if (error) {
            console.error("[Notification Engine] Error fetching tasks:", error);
            return;
        }

        if (!tugas || tugas.length === 0) {
            console.log("[Notification Engine] No pending tasks found.");
            return;
        }

        const reminderThresholdMinutes = this.getReminderMinutes(prefs.tugasReminderValue || 1, prefs.tugasReminderUnit || 'days');
        console.log(`[Notification Engine] Checking ${tugas.length} tasks. Threshold: ${reminderThresholdMinutes} minutes.`);

        tugas.forEach(item => {
            const eventId = `tugas_${item.id}`;
            const deadline = new Date(item.deadline);
            const timeDiffMinutes = (deadline.getTime() - now.getTime()) / (1000 * 60);

            console.log(`[Notification Engine] Task: "${item.judul}". Deadline: ${item.deadline}. Diff: ${Math.round(timeDiffMinutes)}min.`);

            if (this.notifiedEvents[eventId]) {
                console.log(`[Notification Engine] Task "${item.judul}" already notified.`);
                return;
            }

            if (timeDiffMinutes > 0 && timeDiffMinutes <= reminderThresholdMinutes) {
                const hoursLeft = Math.round(timeDiffMinutes / 60);
                console.log(`[Notification Engine] TRIGGERING notification for "${item.judul}"!`);
                this.triggerNotification(
                    `Pengingat Tugas!`,
                    `Tugas ${item.judul} (${item.mataKuliah}) jatuh tempo dalam ${hoursLeft} jam.`,
                    eventId
                );
            }
        });
    }

    triggerNotification(title, body, eventId) {
        const prefs = JSON.parse(localStorage.getItem('kuliahin_prefs') || '{}');
        
        // 1. Browser Notification
        if ('Notification' in window && Notification.permission === 'granted' && prefs.notifBrowser !== false) {
            new Notification(title, {
                body,
                icon: '/icons/icon-192.png',
            });
        }

        // 2. In-App Notification (UI Context)
        if (this.onNotification) {
            this.onNotification({ title, message: body, eventId });
        }

        // Mark as notified
        this.notifiedEvents[eventId] = true;
        localStorage.setItem('kuliahin_notified_events', JSON.stringify(this.notifiedEvents));
    }


}

export const notificationEngine = new NotificationService();
