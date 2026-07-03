'use client';

import { useState, useEffect, useRef } from 'react';
import { useNotification } from './useNotification';

export type PomodoroMode = 'work' | 'break';

export const usePomodoro = (initialWorkMinutes = 25, initialBreakMinutes = 5) => {
  const { sendNotification } = useNotification();
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialWorkMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Đọc cấu hình từ localStorage nếu có
  useEffect(() => {
    const savedMode = localStorage.getItem('pomodoro_mode') as PomodoroMode;
    const savedTime = localStorage.getItem('pomodoro_time_left');
    const savedActive = localStorage.getItem('pomodoro_is_active') === 'true';

    if (savedMode) setMode(savedMode);
    if (savedTime) setTimeLeft(parseInt(savedTime));
    
    // Không tự động chạy lại khi load trang để tránh phiền toái, nhưng khôi phục thời gian
  }, []);

  // Lưu trạng thái vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('pomodoro_mode', mode);
    localStorage.setItem('pomodoro_time_left', timeLeft.toString());
    localStorage.setItem('pomodoro_is_active', isActive.toString());
  }, [mode, timeLeft, isActive]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode('work');
    setTimeLeft(initialWorkMinutes * 60);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Hết giờ
            setIsActive(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            const nextMode = mode === 'work' ? 'break' : 'work';
            const nextTime = (nextMode === 'work' ? initialWorkMinutes : initialBreakMinutes) * 60;
            
            setMode(nextMode);
            setTimeLeft(nextTime);

            // Báo hiệu âm thanh
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Note A5
              gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.5); // Kêu trong 0.5s
            } catch (e) {
              console.log('AudioContext not allowed yet');
            }

            // Gửi thông báo
            sendNotification(
              nextMode === 'break' ? 'Hết giờ làm việc! 🎉' : 'Hết giờ giải lao! 💪',
              nextMode === 'break' ? 'Hãy dành 5 phút để thư giãn mắt và uống nước nhé.' : 'Đã đến lúc tập trung hoàn thành các mục tiêu tiếp theo.'
            );

            return nextTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode, initialWorkMinutes, initialBreakMinutes, sendNotification]);

  // Format giây -> MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive,
    mode,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    setMode: (newMode: PomodoroMode) => {
      setMode(newMode);
      setTimeLeft((newMode === 'work' ? initialWorkMinutes : initialBreakMinutes) * 60);
      setIsActive(false);
    }
  };
};
