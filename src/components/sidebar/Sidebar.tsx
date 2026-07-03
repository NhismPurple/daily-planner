'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Target, 
  StickyNote, 
  BarChart3, 
  Settings, 
  Flame,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlanner } from '../../context/PlannerContext';

export type TabType = 'dashboard' | 'calendar' | 'timeline' | 'todo' | 'habits' | 'goals' | 'notes' | 'stats' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onStartFocusMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  onStartFocusMode
}) => {
  const { user, logout } = useAuth();
  const { settings } = usePlanner();

  const menuItems = [
    { id: 'dashboard', label: settings.language === 'vi' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: settings.language === 'vi' ? 'Lịch trình' : 'Calendar', icon: Calendar },
    { id: 'timeline', label: settings.language === 'vi' ? 'Timeline' : 'Timeline', icon: Clock },
    { id: 'todo', label: settings.language === 'vi' ? 'Công việc' : 'To-do List', icon: CheckSquare },
    { id: 'goals', label: settings.language === 'vi' ? 'Mục tiêu' : 'Goals', icon: Target },
    { id: 'habits', label: settings.language === 'vi' ? 'Thói quen' : 'Habits', icon: Flame },
    { id: 'notes', label: settings.language === 'vi' ? 'Ghi chú' : 'Notes', icon: StickyNote },
    { id: 'stats', label: settings.language === 'vi' ? 'Thống kê' : 'Statistics', icon: BarChart3 },
    { id: 'settings', label: settings.language === 'vi' ? 'Cài đặt' : 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setIsOpen(false); // Đóng drawer trên mobile
  };

  const getPrimaryColorClass = () => {
    switch (settings.primaryColor) {
      case 'blue': return 'bg-blue-600 dark:bg-blue-500';
      case 'purple': return 'bg-purple-600 dark:bg-purple-500';
      case 'rose': return 'bg-rose-600 dark:bg-rose-500';
      case 'emerald': return 'bg-emerald-600 dark:bg-emerald-500';
      case 'violet':
      default:
        return 'bg-violet-600 dark:bg-violet-500';
    }
  };

  const getPrimaryTextClass = () => {
    switch (settings.primaryColor) {
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'rose': return 'text-rose-600 dark:text-rose-400';
      case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
      case 'violet':
      default:
        return 'text-violet-600 dark:text-violet-400';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-4 mb-4">
          <div className={`p-2.5 rounded-2xl text-white shadow-lg ${getPrimaryColorClass()} animate-pulse`}>
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Daily Planner
            </h1>
            <p className="text-[10px] opacity-60 uppercase font-bold tracking-wider">
              {settings.language === 'vi' ? 'Lên kế hoạch thông minh' : 'Smart Planning'}
            </p>
          </div>
        </div>

        {/* Start Focus Mode Quick Button */}
        <button
          onClick={() => {
            onStartFocusMode();
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 mb-6 rounded-2xl text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${getPrimaryColorClass()}`}
        >
          <Flame size={18} className="animate-bounce" />
          <span>{settings.language === 'vi' ? 'Tập trung Pomodoro' : 'Focus Mode'}</span>
        </button>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as TabType)}
                className={`w-full flex items-center space-x-3.5 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? `bg-white/20 dark:bg-white/10 ${getPrimaryTextClass()} shadow-sm font-semibold border-l-4 border-solid`
                    : 'opacity-70 hover:opacity-100 hover:bg-white/10 dark:hover:bg-white/5'
                }`}
                style={{
                  borderLeftColor: isActive ? `rgb(var(--primary-rgb))` : 'transparent'
                }}
              >
                <Icon size={18} className={isActive ? 'scale-110' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="border-t border-white/10 dark:border-white/5 pt-4 mt-4">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm">
          <div className="flex items-center space-x-3 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-9 h-9 rounded-full border border-white/20"
              />
            ) : (
              <div className={`p-2 rounded-full text-white ${getPrimaryColorClass()}`}>
                <User size={16} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">
                {user ? user.displayName : (settings.language === 'vi' ? 'Khách' : 'Guest')}
              </p>
              <p className="text-[10px] opacity-60 truncate">
                {user ? user.email : 'guest_mode'}
              </p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => logout()}
              title={settings.language === 'vi' ? 'Đăng xuất' : 'Logout'}
              className="p-2 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-2rem)] sticky top-4 left-4 rounded-3xl glass-panel z-30 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Header Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl text-white ${getPrimaryColorClass()}`}>
            <Calendar size={18} />
          </div>
          <span className="font-bold tracking-tight">Daily Planner</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 border border-white/10"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay (Drawer) */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-45 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside 
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-64 z-50 bg-[rgb(var(--background-rgb))] border-r border-white/10 dark:border-white/5 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
