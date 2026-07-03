'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Flame, 
  Coffee, 
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import { usePomodoro } from '../../hooks/usePomodoro';
import { usePlanner } from '../../context/PlannerContext';
import { Task } from '../../types';

interface FocusModeProps {
  onExit: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onExit }) => {
  const { tasks, updateTask, settings } = usePlanner();
  const { 
    timeLeft, 
    isActive, 
    mode, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    formatTime,
    setMode
  } = usePomodoro();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);
  const currentFocusedTask = tasks.find(t => t.id === selectedTaskId);

  // Tính % tiến độ Pomodoro
  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const handleToggleTaskComplete = async () => {
    if (currentFocusedTask) {
      await updateTask({
        ...currentFocusedTask,
        completed: true
      });
      setSelectedTaskId(''); // Clear selection after complete
    }
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

  const getPrimaryGlowClass = () => {
    switch (settings.primaryColor) {
      case 'blue': return 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      case 'purple': return 'shadow-[0_0_20px_rgba(147,51,234,0.3)]';
      case 'rose': return 'shadow-[0_0_20px_rgba(244,63,94,0.3)]';
      case 'emerald': return 'shadow-[0_0_20px_rgba(16,185,129,0.3)]';
      case 'violet':
      default:
        return 'shadow-[0_0_20px_rgba(124,58,237,0.3)]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white animate-fadeIn">
      {/* Background soft float orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-pulse [animation-delay:3s]" />

      {/* Header: Exit Button */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-xl bg-white/10 text-orange-400">
            {mode === 'work' ? <Flame size={16} /> : <Coffee size={16} />}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">
            {mode === 'work' 
              ? (settings.language === 'vi' ? 'Thời gian làm việc' : 'Focus Session') 
              : (settings.language === 'vi' ? 'Thời gian nghỉ ngơi' : 'Break Session')}
          </span>
        </div>
        
        <button
          onClick={onExit}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer flex items-center space-x-1.5"
          title={settings.language === 'vi' ? 'Thoát' : 'Exit focus mode'}
        >
          <X size={16} />
          <span className="text-xs font-bold">{settings.language === 'vi' ? 'Thoát' : 'Exit'}</span>
        </button>
      </div>

      {/* Center: Pomodoro Clock & Controls */}
      <div className="flex flex-col items-center justify-center space-y-8 z-10">
        {/* Circular Progress Display */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
          {/* Progress Circle Background */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="125"
              className="stroke-white/5"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="144"
              cy="144"
              r="125"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 125}
              strokeDashoffset={2 * Math.PI * 125 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
              style={{
                stroke: mode === 'work' ? 'rgb(var(--primary-rgb))' : '#10b981'
              }}
            />
          </svg>

          {/* Time digits */}
          <div className="text-center space-y-1">
            <h1 className="text-6xl md:text-7xl font-extrabold font-mono tracking-widest drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
              {formatTime()}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">
              {mode === 'work' ? (settings.language === 'vi' ? 'Tập trung' : 'Work') : (settings.language === 'vi' ? 'Thư giãn' : 'Rest')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-6">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-white/10 hover:bg-white/15 transition-all active:scale-95 cursor-pointer text-slate-300"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={isActive ? pauseTimer : startTimer}
            className={`p-5 rounded-full text-white transition-all active:scale-95 cursor-pointer hover:scale-105 ${getPrimaryColorClass()} ${getPrimaryGlowClass()}`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          {/* Quick toggle mode (work <-> break) */}
          <button
            onClick={() => setMode(mode === 'work' ? 'break' : 'work')}
            className="p-4 rounded-full bg-white/10 hover:bg-white/15 transition-all active:scale-95 cursor-pointer text-slate-300 text-xs font-bold"
          >
            {mode === 'work' ? 'Break' : 'Work'}
          </button>
        </div>
      </div>

      {/* Bottom: Focus Task Selector & Display */}
      <div className="w-full max-w-md mx-auto z-10 space-y-4 pb-6">
        {currentFocusedTask ? (
          /* Focused Task Box */
          <div className="glass-panel p-4.5 rounded-2xl border-white/15 flex items-center justify-between shadow-lg">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-60">
                {settings.language === 'vi' ? 'Nhiệm vụ đang thực hiện' : 'Current Focus Target'}
              </span>
              <p className="font-semibold text-base truncate mt-1">{currentFocusedTask.title}</p>
            </div>

            <button
              onClick={handleToggleTaskComplete}
              className="p-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all cursor-pointer flex-shrink-0 ml-4"
              title={settings.language === 'vi' ? 'Đánh dấu xong' : 'Complete task'}
            >
              <CheckCircle size={18} />
            </button>
          </div>
        ) : (
          /* Selector dropdown list */
          <div className="relative">
            <button
              onClick={() => setShowTaskDropdown(!showTaskDropdown)}
              className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-all flex items-center justify-between border border-white/5 text-sm cursor-pointer"
            >
              <span className="opacity-70">
                {settings.language === 'vi' ? 'Chọn việc cần tập trung hôm nay...' : 'Select a task to focus on...'}
              </span>
              <ChevronDown size={16} />
            </button>

            {showTaskDropdown && activeTasks.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 max-h-[180px] overflow-y-auto rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-md shadow-2xl p-2 space-y-1">
                {activeTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      setShowTaskDropdown(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-white/10 rounded-xl text-xs truncate transition-colors"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
