'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlanner } from '../context/PlannerContext';
import { useNotification } from '../hooks/useNotification';
import { Sidebar, TabType } from '../components/sidebar/Sidebar';
import { AuthPage } from '../components/auth/AuthPage';
import { Dashboard } from '../components/dashboard/Dashboard';
import { Calendar } from '../components/calendar/Calendar';
import { Timeline } from '../components/timeline/Timeline';
import { TodoList } from '../components/todo/TodoList';
import { Goals } from '../components/goals/Goals';
import { HabitTracker } from '../components/habits/HabitTracker';
import { Notes } from '../components/notes/Notes';
import { Stats } from '../components/stats/Stats';
import { Settings } from '../components/settings/Settings';
import { FocusMode } from '../components/focus/FocusMode';
import { BellRing } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { events, settings } = usePlanner();
  const { permission, requestPermission, setupEventReminders } = useNotification();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Khởi chạy Browser Notification Reminder khi danh sách sự kiện thay đổi
  useEffect(() => {
    if (events.length > 0) {
      const cleanup = setupEventReminders(events);
      return () => cleanup();
    }
  }, [events, setupEventReminders]);

  // Thiết lập data-primary màu sắc trên document root ban đầu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-primary', settings.primaryColor);
    }
  }, [settings.primaryColor]);

  // 1. LOADING SCREEN
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white space-y-4">
        {/* Loading Spinner ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute w-full h-full border-4 border-white/10 rounded-full" />
          <div className="absolute w-full h-full border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60 animate-pulse">
          Đang khởi tạo lịch trình...
        </p>
      </div>
    );
  }

  // 2. AUTHENTICATION REQUIRED (If no user & not guest mode)
  if (!user && !isGuestMode) {
    return <AuthPage onGuestMode={() => setIsGuestMode(true)} />;
  }

  // 3. FOCUS MODE POMODORO TIMER FULLSCREEN
  if (isFocusMode) {
    return <FocusMode onExit={() => setIsFocusMode(false)} />;
  }

  // 4. MAIN WORKSPACE LAYOUT
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <Calendar />;
      case 'timeline':
        return <Timeline />;
      case 'todo':
        return <TodoList />;
      case 'goals':
        return <Goals />;
      case 'habits':
        return <HabitTracker />;
      case 'notes':
        return <Notes />;
      case 'stats':
        return <Stats />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  const getPrimaryTextClass = () => {
    switch (settings.primaryColor) {
      case 'blue': return 'text-blue-500 dark:text-blue-400';
      case 'purple': return 'text-purple-500 dark:text-purple-400';
      case 'rose': return 'text-rose-500 dark:text-rose-400';
      case 'emerald': return 'text-emerald-500 dark:text-emerald-400';
      case 'violet':
      default:
        return 'text-violet-500 dark:text-violet-400';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen p-0 lg:p-4 gap-4 relative">
      
      {/* Floating Notification Permission Banner */}
      {permission === 'default' && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm glass-panel p-4.5 rounded-2xl flex items-center justify-between border-violet-500/20 shadow-2xl animate-slideIn">
          <div className="flex items-start space-x-3 mr-4">
            <div className="p-2 bg-violet-600/10 text-violet-400 rounded-xl flex-shrink-0 mt-0.5">
              <BellRing size={16} />
            </div>
            <div className="space-y-0.5 text-xs">
              <p className="font-bold">
                {settings.language === 'vi' ? 'Bật nhắc nhở thông báo?' : 'Enable Notifications?'}
              </p>
              <p className="opacity-70 leading-relaxed">
                {settings.language === 'vi' 
                  ? 'Nhận thông báo đẩy trên trình duyệt trước khi sự kiện bắt đầu.'
                  : 'Receive push alerts on browser before your calendar event starts.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => requestPermission()}
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
          >
            {settings.language === 'vi' ? 'Đồng ý' : 'Allow'}
          </button>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        onStartFocusMode={() => setIsFocusMode(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 glass-panel rounded-none lg:rounded-3xl p-6 lg:p-8 min-h-[calc(100vh-2rem)] overflow-y-auto z-10">
        {renderActiveTabContent()}
      </main>
    </div>
  );
}
