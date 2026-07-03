'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  CloudRain, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  CalendarDays, 
  AlertCircle,
  CheckSquare
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useWeather } from '../../hooks/useWeather';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 800; // 0.8s
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{count}</span>;
};

export const Dashboard: React.FC = () => {
  const { events, tasks, settings, updateTask } = usePlanner();
  const { weather, loading: weatherLoading } = useWeather(settings.language);
  const [time, setTime] = useState(new Date());

  // Clock runner
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (settings.language === 'vi') {
      if (hour < 12) return 'Chào buổi sáng, hôm nay bạn có gì cần làm?';
      if (hour < 18) return 'Chào buổi chiều, hãy hoàn thành các mục tiêu nào!';
      return 'Chào buổi tối, hôm nay của bạn thế nào?';
    } else {
      if (hour < 12) return 'Good morning! What are you planning for today?';
      if (hour < 18) return 'Good afternoon! Let us achieve our goals!';
      return 'Good evening! How was your day?';
    }
  };

  const currentLocale = settings.language === 'vi' ? vi : enUS;

  // Lấy ra danh sách Tasks & Events trong ngày hôm nay (YYYY-MM-DD)
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayEvents = events.filter(e => e.date === todayStr);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  const totalItems = todayEvents.length + todayTasks.length;
  const completedEvents = todayEvents.filter(e => e.completed).length;
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const completedItems = completedEvents + completedTasks;
  const incompleteItems = totalItems - completedItems;

  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

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
    <div className="space-y-6">
      {/* Header section with Clock & Greeting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Greetings */}
        <div className="md:col-span-2 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 bg-clip-text text-transparent">
            {getGreeting()}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm opacity-70">
            <span className="font-semibold text-base capitalize">
              {format(time, 'EEEE, d MMMM yyyy', { locale: currentLocale })}
            </span>
            <span className="w-1.5 h-1.5 bg-current rounded-full" />
            {weatherLoading ? (
              <span className="animate-pulse">Đang tải thời tiết...</span>
            ) : weather ? (
              <span className="flex items-center space-x-1.5 bg-white/10 dark:bg-white/5 py-1 px-3 rounded-full backdrop-blur-sm border border-white/5">
                <span>{weather.icon}</span>
                <span>{weather.temp}°C</span>
                <span>•</span>
                <span>{weather.conditionText}</span>
              </span>
            ) : (
              <span>Hà Nội, VN</span>
            )}
          </div>
        </div>

        {/* Large Live Digital Clock */}
        <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-white/30 to-white/10 dark:from-white/5 dark:to-white/0 border-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <span className="text-4xl md:text-5xl font-extrabold font-mono tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-md">
            {format(time, settings.timeFormat === '24h' ? 'HH:mm:ss' : 'hh:mm:ss a')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mt-1.5">
            {settings.language === 'vi' ? 'Đồng hồ hệ thống' : 'System Time'}
          </span>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Ring Card */}
        <div className="glass-card p-6 flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-2">
          <div className="space-y-2">
            <p className="text-sm font-medium opacity-70">
              {settings.language === 'vi' ? 'Tiến độ hôm nay' : "Today's Progress"}
            </p>
            <p className="text-3xl font-extrabold tracking-tight">
              <AnimatedCounter value={progressPercent} />%
            </p>
            <p className="text-xs opacity-60">
              {settings.language === 'vi' 
                ? `Đã hoàn thành ${completedItems}/${totalItems} đầu việc`
                : `Completed ${completedItems}/${totalItems} items today`
              }
            </p>
          </div>
          {/* Progress Ring SVG */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className="transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  stroke: 'rgb(var(--primary-rgb))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Stats Card: Done */}
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold opacity-60">
              {settings.language === 'vi' ? 'Đã Hoàn Thành' : 'Completed'}
            </p>
            <h3 className="text-2xl font-bold">
              <AnimatedCounter value={completedItems} />
            </h3>
            <p className="text-[10px] opacity-50 mt-0.5">Tasks + Events</p>
          </div>
        </div>

        {/* Stats Card: Pending */}
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-2xl">
            <Circle size={24} className="animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-semibold opacity-60">
              {settings.language === 'vi' ? 'Chưa Hoàn Thành' : 'Pending'}
            </p>
            <h3 className="text-2xl font-bold">
              <AnimatedCounter value={incompleteItems} />
            </h3>
            <p className="text-[10px] opacity-50 mt-0.5">Tasks + Events</p>
          </div>
        </div>
      </div>

      {/* Main split grid: Focus list & Timeline preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick To-do Lists */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-semibold flex items-center space-x-2">
              <CheckSquare size={18} className={getPrimaryTextClass()} />
              <span>{settings.language === 'vi' ? 'Nhiệm vụ hôm nay' : "Today's Tasks"}</span>
            </h3>
            <span className="text-xs opacity-60 bg-white/15 dark:bg-white/5 py-1 px-2.5 rounded-full font-bold">
              {todayTasks.length}
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="py-12 text-center opacity-50 text-sm">
              {settings.language === 'vi' ? 'Không có nhiệm vụ nào cho hôm nay! 🎉' : 'No tasks assigned for today! 🎉'}
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/15 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => updateTask({ ...task, completed: !task.completed })}
                      className="custom-checkbox"
                    />
                    <span className={`text-sm font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    task.priority === 'high' 
                      ? 'bg-rose-500/10 text-rose-500' 
                      : task.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'T.Bình' : 'Thấp'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule preview */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-semibold flex items-center space-x-2">
              <CalendarDays size={18} className={getPrimaryTextClass()} />
              <span>{settings.language === 'vi' ? 'Sự kiện sắp diễn ra' : 'Upcoming Events'}</span>
            </h3>
            <span className="text-xs opacity-60 bg-white/15 dark:bg-white/5 py-1 px-2.5 rounded-full font-bold">
              {todayEvents.length}
            </span>
          </div>

          {todayEvents.length === 0 ? (
            <div className="py-12 text-center opacity-50 text-sm">
              {settings.language === 'vi' ? 'Không có lịch trình nào hôm nay.' : 'No scheduled events for today.'}
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {todayEvents.map((event) => (
                <div key={event.id} className="relative pl-4 border-l-2 border-solid" style={{ borderLeftColor: event.color || 'rgb(var(--primary-rgb))' }}>
                  <p className="text-sm font-semibold truncate">{event.title}</p>
                  <p className="text-xs opacity-60">
                    {event.startTime} - {event.endTime}
                  </p>
                  {event.location && (
                    <p className="text-[10px] opacity-50 truncate mt-0.5">📍 {event.location}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
