'use client';

import { useState, useEffect } from 'react';
import { Event } from '../types';

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
    const status = await Notification.requestPermission();
    setPermission(status);
    return status;
  };

  const sendNotification = (title: string, body?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=DailyPlanner'
      });
    }
  };

  // Tự động kiểm tra nhắc nhở
  const setupEventReminders = (events: Event[]) => {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') return () => {};

    const notifiedEvents = new Set<string>();

    const checkInterval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      events.forEach((event) => {
        if (event.completed || event.reminder === 'none' || notifiedEvents.has(event.id)) return;
        if (event.date !== todayStr) return;

        // Tính toán thời gian của sự kiện
        const [hours, minutes] = event.startTime.split(':').map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);

        const diffMinutes = (eventTime.getTime() - now.getTime()) / (1000 * 60);

        let shouldNotify = false;
        let message = '';

        if (event.reminder === 'at-time' && diffMinutes >= 0 && diffMinutes <= 0.5) {
          shouldNotify = true;
          message = `Sự kiện "${event.title}" đang diễn ra ngay bây giờ!`;
        } else if (event.reminder === '5-mins' && diffMinutes > 4.5 && diffMinutes <= 5.1) {
          shouldNotify = true;
          message = `Sự kiện "${event.title}" sẽ diễn ra trong 5 phút nữa.`;
        } else if (event.reminder === '10-mins' && diffMinutes > 9.5 && diffMinutes <= 10.1) {
          shouldNotify = true;
          message = `Sự kiện "${event.title}" sẽ diễn ra trong 10 phút nữa.`;
        }

        if (shouldNotify) {
          sendNotification(`Nhắc nhở lịch trình: ${event.title}`, message);
          notifiedEvents.add(event.id);
        }
      });
    }, 15000); // Kiểm tra mỗi 15 giây

    return () => clearInterval(checkInterval);
  };

  return { permission, requestPermission, sendNotification, setupEventReminders };
};
