'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Target, 
  Calendar,
  CheckCircle2,
  X 
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Goal, GoalType } from '../../types';

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, settings } = usePlanner();

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('daily');
  const [target, setTarget] = useState(5);
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);

  const [activeFilter, setActiveFilter] = useState<GoalType | 'all'>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || target <= 0) return;

    await addGoal({
      title,
      type,
      target,
      deadline
    });

    // Reset Form
    setTitle('');
    setType('daily');
    setTarget(5);
    setDeadline(new Date().toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleIncrement = async (goal: Goal) => {
    const nextVal = goal.current + 1;
    await updateGoal({
      ...goal,
      current: nextVal,
      completed: nextVal >= goal.target
    });
  };

  const handleDecrement = async (goal: Goal) => {
    if (goal.current <= 0) return;
    const nextVal = goal.current - 1;
    await updateGoal({
      ...goal,
      current: nextVal,
      completed: nextVal >= goal.target
    });
  };

  const filteredGoals = activeFilter === 'all' 
    ? goals 
    : goals.filter(g => g.type === activeFilter);

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
      {/* Controls: Filter and Create */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center bg-white/10 dark:bg-white/5 rounded-xl p-1 backdrop-blur-sm">
          {(['all', 'daily', 'weekly', 'monthly'] as (GoalType | 'all')[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize cursor-pointer transition-colors ${
                activeFilter === tab
                  ? 'bg-white/20 text-slate-800 dark:text-white shadow-sm font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              {tab === 'all' 
                ? (settings.language === 'vi' ? 'Tất cả' : 'All') 
                : tab === 'daily'
                ? (settings.language === 'vi' ? 'Hàng ngày' : 'Daily')
                : tab === 'weekly'
                ? (settings.language === 'vi' ? 'Hàng tuần' : 'Weekly')
                : (settings.language === 'vi' ? 'Hàng tháng' : 'Monthly')}
            </button>
          ))}
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center space-x-2 text-white font-medium py-2.5 px-5 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform shadow-lg ${getPrimaryColorClass()}`}
        >
          <Plus size={18} />
          <span>{settings.language === 'vi' ? 'Thêm mục tiêu' : 'Add Goal'}</span>
        </button>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
          {settings.language === 'vi' ? 'Chưa có mục tiêu nào được tạo.' : 'No goals found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            
            return (
              <div 
                key={goal.id} 
                className="glass-card p-5 bg-white/10 dark:bg-white/5 border-none flex flex-col justify-between space-y-4"
              >
                {/* Header: Title, Delete */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 dark:bg-white/5 ${
                      goal.type === 'daily' 
                        ? 'text-blue-500' 
                        : goal.type === 'weekly' 
                        ? 'text-emerald-500' 
                        : 'text-purple-500'
                    }`}>
                      {goal.type === 'daily' 
                        ? (settings.language === 'vi' ? 'Hàng ngày' : 'Daily') 
                        : goal.type === 'weekly'
                        ? (settings.language === 'vi' ? 'Tuần' : 'Weekly')
                        : (settings.language === 'vi' ? 'Tháng' : 'Monthly')}
                    </span>
                    <h3 className={`text-base font-bold truncate mt-1.5 ${goal.completed ? 'line-through opacity-45' : ''}`}>
                      {goal.title}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer ml-3"
                    title={settings.language === 'vi' ? 'Xóa mục tiêu' : 'Delete goal'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress Indicators (SVG Progress ring + stats) */}
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <p className="text-2xl font-black">{goal.current} / {goal.target}</p>
                    <p className="text-[10px] opacity-60 flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>DL: {goal.deadline}</span>
                    </p>
                  </div>

                  {/* Goal Progress Ring */}
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="25"
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="25"
                        strokeWidth="5"
                        strokeDasharray={2 * Math.PI * 25}
                        strokeDashoffset={2 * Math.PI * 25 * (1 - percent / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-500"
                        style={{
                          stroke: goal.completed ? '#10b981' : 'rgb(var(--primary-rgb))'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {goal.completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : `${percent}%`}
                    </div>
                  </div>
                </div>

                {/* Progress controllers (+ / - Buttons) */}
                <div className="flex items-center space-x-3 pt-2.5 border-t border-white/5">
                  <button
                    onClick={() => handleDecrement(goal)}
                    disabled={goal.current <= 0}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => handleIncrement(goal)}
                    disabled={goal.completed}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl text-white font-medium bg-violet-600 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 transition-all cursor-pointer"
                    style={{
                      backgroundColor: goal.completed ? '#10b981' : 'rgb(var(--primary-rgb))'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold">
                {settings.language === 'vi' ? 'Tạo mục tiêu mới' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Tên mục tiêu' : 'Goal Title'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={settings.language === 'vi' ? 'Ví dụ: Đọc sách, uống nước...' : 'e.g. Read books, Drink water...'}
                  className="w-full glass-input"
                />
              </div>

              {/* Goal Type & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">
                    {settings.language === 'vi' ? 'Chu kỳ' : 'Period'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as GoalType)}
                    className="w-full glass-input cursor-pointer bg-slate-900 text-white"
                  >
                    <option value="daily">{settings.language === 'vi' ? 'Hàng ngày' : 'Daily'}</option>
                    <option value="weekly">{settings.language === 'vi' ? 'Hàng tuần' : 'Weekly'}</option>
                    <option value="monthly">{settings.language === 'vi' ? 'Hàng tháng' : 'Monthly'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">
                    {settings.language === 'vi' ? 'Chỉ tiêu' : 'Target'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={target}
                    onChange={(e) => setTarget(parseInt(e.target.value))}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Hạn chót' : 'Deadline'}
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              {/* Actions */}
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
                  {settings.language === 'vi' ? 'Tạo mới' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
