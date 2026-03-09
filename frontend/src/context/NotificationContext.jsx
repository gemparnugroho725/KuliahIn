import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('kuliahin_inapp_notifications') || '[]');
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('kuliahin_inapp_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = useCallback((notif) => {
        const newNotif = {
            // Combine timestamp and eventId/random to ensure absolute uniqueness
            id: `${Date.now()}-${notif.eventId || Math.random()}`,
            title: notif.title,
            message: notif.message,
            time: new Date().toISOString(),
            read: false,
            eventId: notif.eventId
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        localStorage.removeItem('kuliahin_notified_events');
        // Reload to ensure engine state resets
        window.location.reload();
    }, []);

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const value = useMemo(() => ({
        notifications,
        addNotification,
        markAsRead,
        clearAll,
        unreadCount
    }), [notifications, addNotification, markAsRead, clearAll, unreadCount]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
