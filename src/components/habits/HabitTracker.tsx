'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Flame, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  X 
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import confetti from 'canvas-confetti';

export const HabitTracker: React.FC = () => {
  const { habits, addHabit, toggleHabit, deleteHabit, settings } = usePlanner();
  
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');

  const currentLocale = settings.language === 'vi' ? vi : enUS;

  // Lấy danh sách 7 ngày gần nhất (lùi từ hôm nay)
  const today = new Date();
  const past7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today
  }).reverse(); // Hôm nay nằm ở bên phải hoặc trái. Ta để từ cũ -> mới: reverse() để hôm nay ở cuối (bên phải)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addHabit(title);
    setTitle('');
    setIsOpen(false);
  };

  const handleToggle = async (habitId: string, dateStr: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const habit = habits.find(h => h.id === habitId);
    
    // Nếu check hoàn thành cho HÔM NAY và trước đó chưa hoàn thành -> bắn pháo hoa!
    if (dateStr === todayStr && habit && !habit.completedDates.includes(todayStr)) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e']
      });
    }

    await toggleHabit(habitId, dateStr);
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

  return (
    <div className="space-y-6">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-extrabold">
            {settings.language === 'vi' ? 'Theo dõi thói quen' : 'Habit Tracker'}
          </h2>
          <p className="text-xs opacity-60">
            {settings.language === 'vi' 
              ? 'Xây dựng kỷ luật tự giác qua từng ngày' 
              : 'Build self-discipline day by day'}
          </p>
        </div>

        {/* Add Habit Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center space-x-2 text-white font-medium py-2.5 px-5 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform shadow-lg ${getPrimaryColorClass()}`}
        >
          <Plus size={18} />
          <span>{settings.language === 'vi' ? 'Thêm thói quen' : 'Add Habit'}</span>
        </button>
      </div>

      {/* Habits Table / List */}
      {habits.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
          {settings.language === 'vi' ? 'Chưa có thói quen nào. Hãy tạo mới để bắt đầu theo dõi!' : 'No habits yet. Create one to start tracking!'}
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const isDoneToday = habit.completedDates.includes(todayStr);

            return (
              <div 
                key={habit.id} 
                className="glass-card p-5 bg-white/10 dark:bg-white/5 border-none flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Info: Name, Streak */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className={`p-3.5 rounded-2xl flex-shrink-0 ${
                    isDoneToday 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {isDoneToday ? <CheckCircle size={22} /> : <Flame size={22} className="animate-pulse" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold truncate">{habit.title}</h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <Flame size={14} className="text-orange-500 fill-orange-500" />
                      <span className="text-xs font-extrabold text-orange-500">
                        {habit.streak} {settings.language === 'vi' ? 'ngày liên tiếp' : 'days streak'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Area: 7-Day Check-in Grid */}
                <div className="flex items-center space-x-4 self-end md:self-center">
                  <div className="flex items-center space-x-2">
                    {past7Days.map((day) => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = habit.completedDates.includes(dayStr);
                      const isDayToday = format(day, 'yyyy-MM-dd') === todayStr;

                      return (
                        <div key={day.toString()} className="flex flex-col items-center space-y-1">
                          {/* Day label */}
                          <span className="text-[10px] font-bold uppercase opacity-55">
                            {format(day, 'EE', { locale: currentLocale }).substring(0, 2)}
                          </span>
                          
                          {/* Check Button cell */}
                          <button
                            onClick={() => handleToggle(habit.id, dayStr)}
                            className={`w-9 h-9 rounded-xl border border-solid flex items-center justify-center font-bold text-xs cursor-pointer transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                : isDayToday
                                ? 'border-dashed border-violet-500 hover:bg-violet-500/10 text-violet-500'
                                : 'border-white/20 hover:bg-white/10 opacity-70'
                            }`}
                          >
                            {isCompleted ? '✓' : format(day, 'd')}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delete Habit */}
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 rounded-xl opacity-40 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer self-end md:self-center"
                    title={settings.language === 'vi' ? 'Xóa thói quen' : 'Delete habit'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold">
                {settings.language === 'vi' ? 'Thêm thói quen mới' : 'Add New Habit'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Tên thói quen' : 'Habit Name'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={settings.language === 'vi' ? 'Ví dụ: Đọc sách 30p, Chạy bộ 2km...' : 'e.g. Read 30m, Run 2km...'}
                  className="w-full glass-input"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 font-semibold py-3.5 rounded-2xl cursor-pointer transition-colors text-center text-sm"
                >
                  {settings.language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-semibold py-3.5 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] shadow-lg text-sm ${getPrimaryColorClass()}`}
                >
                  {settings.language === 'vi' ? 'Thêm mới' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
