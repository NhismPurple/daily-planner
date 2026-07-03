'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Tag,
  AlertCircle
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Event } from '../../types';
import { format, addDays, subDays } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export const Timeline: React.FC = () => {
  const { events, updateEvent, settings } = usePlanner();
  const [targetDate, setTargetDate] = useState(new Date());

  const currentLocale = settings.language === 'vi' ? vi : enUS;
  const dateStr = format(targetDate, 'yyyy-MM-dd');

  // Lọc sự kiện của ngày được chọn và sắp xếp theo giờ bắt đầu
  const dayEvents = events
    .filter(e => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleNextDay = () => setTargetDate(addDays(targetDate, 1));
  const handlePrevDay = () => setTargetDate(subDays(targetDate, 1));
  const handleToday = () => setTargetDate(new Date());

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-rose-500';
      case 'medium': return 'border-amber-500';
      case 'low':
      default:
        return 'border-blue-500';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-amber-500';
      case 'low':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selector Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-extrabold capitalize">
          {format(targetDate, 'EEEE, d MMMM yyyy', { locale: currentLocale })}
        </h2>
        <div className="flex items-center space-x-1.5 bg-white/10 dark:bg-white/5 rounded-xl p-1 backdrop-blur-sm">
          <button onClick={handlePrevDay} className="p-1.5 rounded-lg hover:bg-white/15 cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleToday} className="px-2.5 py-1 text-xs font-semibold hover:bg-white/15 rounded-lg cursor-pointer">
            {settings.language === 'vi' ? 'Hôm nay' : 'Today'}
          </button>
          <button onClick={handleNextDay} className="p-1.5 rounded-lg hover:bg-white/15 cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Vertical Timeline Axis Container */}
      {dayEvents.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
          {settings.language === 'vi' 
            ? 'Không có lịch trình nào cho ngày này. Hãy tạo một sự kiện mới trong tab Lịch trình!' 
            : 'No events scheduled for this day. Go to Calendar to create one!'}
        </div>
      ) : (
        <div className="relative pl-6 md:pl-28 py-4 space-y-8">
          {/* Vertical Glowing Line */}
          <div className="absolute left-[13px] md:left-[93px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]" />

          {dayEvents.map((event) => {
            return (
              <div key={event.id} className="relative group flex flex-col md:flex-row md:items-start">
                
                {/* Time Indicator (Absolute position on left on desktop) */}
                <div className="hidden md:flex absolute left-[-95px] w-20 flex-col items-end pr-4 text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-base">{event.startTime}</span>
                  <span className="text-[10px] opacity-60 mt-0.5">{event.endTime}</span>
                </div>

                {/* Timeline node/dot on the vertical line */}
                <div 
                  className={`absolute left-[-18px] md:left-[-19.5px] top-1.5 w-[11px] h-[11px] rounded-full border-2 border-solid bg-slate-900 z-10 transition-transform group-hover:scale-125 shadow-[0_0_8px_rgba(255,255,255,0.4)] ${
                    getPriorityBorderColor(event.priority)
                  }`}
                  style={{
                    boxShadow: `0 0 10px ${event.color}`
                  }}
                />

                {/* Content Card */}
                <div className="flex-1 glass-card p-5 bg-white/10 dark:bg-white/5 border-none flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info: Check button + Text details */}
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => updateEvent({ ...event, completed: !event.completed })}
                      className={`mt-1 transition-colors cursor-pointer ${
                        event.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {event.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Mobile-only time indicator */}
                      <div className="flex md:hidden items-center space-x-1 text-xs opacity-60 font-mono font-bold mb-1">
                        <Clock size={12} />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <h3 className={`text-base font-bold truncate ${event.completed ? 'line-through opacity-40' : ''}`}>
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className={`text-xs opacity-75 line-clamp-2 leading-relaxed ${event.completed ? 'opacity-30' : ''}`}>
                          {event.description}
                        </p>
                      )}

                      {/* Metatags */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] md:text-xs">
                        {event.location && (
                          <span className="flex items-center space-x-1 opacity-60">
                            <MapPin size={12} />
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                        
                        <span className="opacity-30">•</span>

                        <span className="flex items-center space-x-1 opacity-60">
                          <Tag size={12} />
                          <span className="capitalize">
                            {settings.language === 'vi' ? 'Mục: ' : 'Category: '}
                            {event.category}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Info: Priority indicator badge */}
                  <div className="flex items-center md:flex-col justify-between md:items-end flex-shrink-0 self-stretch border-t border-white/5 md:border-t-0 pt-2.5 md:pt-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: event.color }} 
                      title="Màu sự kiện"
                    />
                    <div className="md:mt-3 flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider opacity-85">
                      <AlertCircle size={12} className={event.priority === 'high' ? 'text-rose-500' : 'text-slate-400'} />
                      <span className={event.priority === 'high' ? 'text-rose-500' : ''}>
                        {event.priority === 'high' 
                          ? (settings.language === 'vi' ? 'Ưu tiên cao' : 'High') 
                          : event.priority === 'medium'
                          ? (settings.language === 'vi' ? 'T.Bình' : 'Medium')
                          : (settings.language === 'vi' ? 'Thấp' : 'Low')}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
