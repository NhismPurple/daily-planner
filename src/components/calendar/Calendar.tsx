'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Tag, 
  AlertCircle, 
  Bell, 
  Trash2, 
  Edit3,
  X 
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Event, Priority, Category } from '../../types';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays,
  parseISO
} from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

type CalendarView = 'month' | 'week' | 'day';

export const Calendar: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, settings } = usePlanner();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<CalendarView>('month');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#7c3aed'); // Default violet
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState<Event['reminder']>('none');

  // Drag state
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

  const currentLocale = settings.language === 'vi' ? vi : enUS;

  // Colors list
  const eventColors = [
    { name: 'Violet', hex: '#7c3aed', class: 'bg-violet-500/20 text-violet-500 border-violet-500/30' },
    { name: 'Blue', hex: '#3b82f6', class: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    { name: 'Emerald', hex: '#10b981', class: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
    { name: 'Amber', hex: '#f59e0b', class: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { name: 'Rose', hex: '#f43f5e', class: 'bg-rose-500/20 text-rose-500 border-rose-500/30' },
    { name: 'Indigo', hex: '#6366f1', class: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' },
  ];

  const categoryLabels: Record<Category, string> = {
    work: settings.language === 'vi' ? 'Làm việc' : 'Work',
    study: settings.language === 'vi' ? 'Học tập' : 'Study',
    gym: settings.language === 'vi' ? 'Gym / Sức khỏe' : 'Gym / Health',
    eat: settings.language === 'vi' ? 'Ăn uống' : 'Dining',
    leisure: settings.language === 'vi' ? 'Giải trí' : 'Leisure',
    other: settings.language === 'vi' ? 'Khác' : 'Other'
  };

  // Navigations
  const handleNext = () => {
    if (activeView === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (activeView === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handlePrev = () => {
    if (activeView === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (activeView === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Click cell to Add event
  const handleCellClick = (date: Date) => {
    setSelectedEvent(null);
    setTitle('');
    setDescription('');
    setEventDate(format(date, 'yyyy-MM-dd'));
    setStartTime('09:00');
    setEndTime('10:00');
    setColor('#7c3aed');
    setPriority('medium');
    setCategory('work');
    setLocation('');
    setReminder('none');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setEventDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setColor(event.color);
    setPriority(event.priority);
    setCategory(event.category);
    setLocation(event.location || '');
    setReminder(event.reminder);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData = {
      title,
      description,
      date: eventDate,
      startTime,
      endTime,
      color,
      priority,
      category,
      location,
      reminder,
      completed: selectedEvent ? selectedEvent.completed : false
    };

    if (selectedEvent) {
      await updateEvent({ ...selectedEvent, ...eventData });
    } else {
      await addEvent(eventData);
    }

    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    setIsDetailOpen(false);
  };

  // Drag and Drop sự kiện
  const handleDragStart = (id: string) => {
    setDraggedEventId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dateStr: string) => {
    if (!draggedEventId) return;
    const event = events.find(e => e.id === draggedEventId);
    if (event && event.date !== dateStr) {
      await updateEvent({ ...event, date: dateStr });
    }
    setDraggedEventId(null);
  };

  // --- RENDERING VIEWS ---

  // 1. Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = eachDayOfInterval({ start: startDate, end: endOfWeek(startDate) });

    return (
      <div className="border border-white/10 rounded-2xl overflow-hidden glass-panel bg-white/10 dark:bg-black/10">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/10 dark:bg-white/5 py-3">
          {weekDays.map((day) => (
            <div key={day.toString()} className="text-center text-xs font-bold uppercase tracking-wider opacity-60">
              {format(day, 'EEE', { locale: currentLocale })}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toString()}
                onClick={() => handleCellClick(day)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(dateStr)}
                className={`min-h-[100px] p-2 border-r border-b border-white/10 flex flex-col justify-between transition-colors hover:bg-white/5 cursor-pointer ${
                  !isCurrentMonth ? 'opacity-30' : ''
                }`}
              >
                {/* Date header */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday 
                      ? 'bg-violet-600 text-white shadow-md' 
                      : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] opacity-50 font-bold bg-white/10 py-0.5 px-1.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Day events (max 2 for list rendering, others show indicator) */}
                <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.slice(0, 3).map((event) => {
                    const matchedColor = eventColors.find(c => c.hex === event.color) || eventColors[0];
                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={() => handleDragStart(event.id)}
                        onClick={(e) => handleEventClick(event, e)}
                        className={`text-[10px] font-bold p-1 rounded-lg truncate border border-solid ${matchedColor.class} transition-transform hover:scale-[1.02]`}
                      >
                        {event.startTime} {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[9px] font-bold opacity-60 text-center">
                      + {dayEvents.length - 3} {settings.language === 'vi' ? 'sự kiện' : 'more'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. Week View
  const renderWeekView = () => {
    const startOfCurrentWeek = startOfWeek(currentDate);
    const endOfCurrentWeek = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

    return (
      <div className="border border-white/10 rounded-2xl overflow-hidden glass-panel bg-white/10 dark:bg-black/10">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/10 dark:bg-white/5 py-3">
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toString()} className="text-center space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider opacity-60">
                  {format(day, 'EEE', { locale: currentLocale })}
                </p>
                <p className={`text-base font-extrabold w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                  isToday ? 'bg-violet-600 text-white shadow-md' : ''
                }`}>
                  {format(day, 'd')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hour breakdown */}
        <div className="grid grid-cols-7 divide-x divide-white/10 min-h-[400px]">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = events.filter(e => e.date === dateStr);

            return (
              <div 
                key={day.toString()} 
                onClick={() => handleCellClick(day)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(dateStr)}
                className="p-2 space-y-2 min-h-[350px] hover:bg-white/5 transition-colors cursor-pointer"
              >
                {dayEvents.map((event) => {
                  const matchedColor = eventColors.find(c => c.hex === event.color) || eventColors[0];
                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={() => handleDragStart(event.id)}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`p-2 rounded-xl text-[10px] md:text-xs font-bold border border-solid ${matchedColor.class} transition-transform hover:scale-[1.02] shadow-sm`}
                    >
                      <p className="truncate">{event.title}</p>
                      <p className="opacity-70 mt-0.5 text-[9px]">🕒 {event.startTime} - {event.endTime}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Day View
  const renderDayView = () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayEvents = events.filter(e => e.date === dateStr);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Hour lists timeline */}
        <div className="md:col-span-3 border border-white/10 rounded-2xl glass-panel p-6 max-h-[500px] overflow-y-auto bg-white/10 dark:bg-black/10">
          <h3 className="font-extrabold text-sm opacity-60 uppercase tracking-widest border-b border-white/10 pb-3 mb-4">
            {settings.language === 'vi' ? 'Dòng thời gian sự kiện' : 'Event Timeline'}
          </h3>

          <div className="space-y-4">
            {hours.map((hour) => {
              const hourStr = `${hour.toString().padStart(2, '0')}:00`;
              const hourEvents = dayEvents.filter(e => e.startTime.startsWith(hour.toString().padStart(2, '0')));

              return (
                <div key={hour} className="flex items-start space-x-4">
                  <span className="w-12 text-xs font-mono font-bold opacity-50 py-1">{hourStr}</span>
                  <div 
                    onClick={() => {
                      const d = new Date(currentDate);
                      handleCellClick(d);
                    }}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(dateStr)}
                    className="flex-1 min-h-[45px] border-t border-dashed border-white/10 py-1.5 flex flex-wrap gap-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors px-2"
                  >
                    {hourEvents.map((event) => {
                      const matchedColor = eventColors.find(c => c.hex === event.color) || eventColors[0];
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={() => handleDragStart(event.id)}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`p-2 rounded-xl text-xs font-bold border border-solid cursor-pointer ${matchedColor.class} transition-transform hover:scale-[1.02] shadow-sm max-w-[200px] truncate`}
                        >
                          {event.title} ({event.startTime} - {event.endTime})
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side summary details card */}
        <div className="glass-card p-6 flex flex-col justify-between bg-white/15 dark:bg-white/5 border-none">
          <div className="space-y-4">
            <h3 className="font-bold text-base">
              {settings.language === 'vi' ? 'Lịch hôm nay' : "Today's Schedule"}
            </h3>
            <p className="text-xs opacity-60">
              {format(currentDate, 'EEEE, d MMMM yyyy', { locale: currentLocale })}
            </p>
            
            {dayEvents.length === 0 ? (
              <p className="text-xs opacity-50 italic py-12 text-center">
                {settings.language === 'vi' ? 'Không có lịch trình nào.' : 'No scheduled events.'}
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {dayEvents.map((event) => {
                  const matchedColor = eventColors.find(c => c.hex === event.color) || eventColors[0];
                  return (
                    <div 
                      key={event.id} 
                      onClick={(e) => handleEventClick(event, e)}
                      className={`p-3 rounded-2xl border border-solid cursor-pointer hover:scale-[1.01] transition-transform ${matchedColor.class}`}
                    >
                      <p className="font-semibold text-xs truncate">{event.title}</p>
                      <p className="text-[10px] opacity-70 mt-1">🕒 {event.startTime} - {event.endTime}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => handleCellClick(currentDate)}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-white font-medium bg-violet-600 dark:bg-violet-500 hover:scale-[1.02] transition-transform shadow-lg cursor-pointer"
          >
            <Plus size={16} />
            <span className="text-sm">{settings.language === 'vi' ? 'Thêm sự kiện' : 'Add Event'}</span>
          </button>
        </div>
      </div>
    );
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
      {/* Calendar Controls header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Month Selector Title */}
        <div className="flex items-center space-x-4">
          <h2 className="text-xl md:text-2xl font-extrabold capitalize min-w-[150px]">
            {format(currentDate, activeView === 'day' ? 'd MMMM yyyy' : 'MMMM yyyy', { locale: currentLocale })}
          </h2>
          <div className="flex items-center space-x-1.5 bg-white/10 dark:bg-white/5 rounded-xl p-1 backdrop-blur-sm">
            <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-white/15 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleToday} className="px-2.5 py-1 text-xs font-semibold hover:bg-white/15 rounded-lg cursor-pointer">
              {settings.language === 'vi' ? 'Hôm nay' : 'Today'}
            </button>
            <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-white/15 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View Switchers & Create Button */}
        <div className="flex items-center space-x-4 self-end sm:self-center">
          {/* Switchers */}
          <div className="flex items-center bg-white/10 dark:bg-white/5 rounded-xl p-1 backdrop-blur-sm">
            {(['month', 'week', 'day'] as CalendarView[]).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize cursor-pointer transition-colors ${
                  activeView === view 
                    ? 'bg-white/20 text-slate-800 dark:text-white shadow-sm font-bold' 
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {view === 'month' ? (settings.language === 'vi' ? 'Tháng' : 'Month') : view === 'week' ? (settings.language === 'vi' ? 'Tuần' : 'Week') : (settings.language === 'vi' ? 'Ngày' : 'Day')}
              </button>
            ))}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => handleCellClick(new Date())}
            className={`p-2.5 rounded-xl text-white shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer ${getPrimaryColorClass()}`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {activeView === 'month' && renderMonthView()}
      {activeView === 'week' && renderWeekView()}
      {activeView === 'day' && renderDayView()}

      {/* Add / Edit Event Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold">
                {selectedEvent 
                  ? (settings.language === 'vi' ? 'Cập nhật sự kiện' : 'Edit Event') 
                  : (settings.language === 'vi' ? 'Tạo lịch trình mới' : 'Create Event')}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-xl hover:bg-white/15 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Tiêu đề' : 'Title'}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={settings.language === 'vi' ? 'Tên sự kiện...' : 'Event name...'}
                  className="w-full glass-input"
                />
              </div>

              {/* Event description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Mô tả chi tiết' : 'Description'}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={settings.language === 'vi' ? 'Thêm mô tả (nếu có)...' : 'Add description...'}
                  rows={2}
                  className="w-full glass-input resize-none"
                />
              </div>

              {/* Date & Start/End time row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Ngày' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Giờ bắt đầu' : 'Start Time'}</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Giờ kết thúc' : 'End Time'}</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Mức độ ưu tiên' : 'Priority'}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full glass-input cursor-pointer bg-slate-900 text-white"
                  >
                    <option value="low">{settings.language === 'vi' ? 'Thấp' : 'Low'}</option>
                    <option value="medium">{settings.language === 'vi' ? 'Trung bình' : 'Medium'}</option>
                    <option value="high">{settings.language === 'vi' ? 'Cao' : 'High'}</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Danh mục' : 'Category'}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full glass-input cursor-pointer bg-slate-900 text-white"
                  >
                    {Object.keys(categoryLabels).map((cat) => (
                      <option key={cat} value={cat}>{categoryLabels[cat as Category]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Reminder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Địa điểm' : 'Location'}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="📍 VP công ty, phòng gym..."
                    className="w-full glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Nhắc nhở' : 'Reminder'}</label>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value as any)}
                    className="w-full glass-input cursor-pointer bg-slate-900 text-white"
                  >
                    <option value="none">{settings.language === 'vi' ? 'Không nhắc nhở' : 'No Reminder'}</option>
                    <option value="at-time">{settings.language === 'vi' ? 'Vào lúc sự kiện' : 'At Event Time'}</option>
                    <option value="5-mins">{settings.language === 'vi' ? 'Trước 5 phút' : '5 Minutes Before'}</option>
                    <option value="10-mins">{settings.language === 'vi' ? 'Trước 10 phút' : '10 Minutes Before'}</option>
                  </select>
                </div>
              </div>

              {/* Colors selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">{settings.language === 'vi' ? 'Màu nhãn sự kiện' : 'Event Color'}</label>
                <div className="flex items-center space-x-3.5">
                  {eventColors.map((colorObj) => (
                    <button
                      key={colorObj.hex}
                      type="button"
                      onClick={() => setColor(colorObj.hex)}
                      className="w-8 h-8 rounded-full border border-solid border-white/20 cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
                      style={{
                        backgroundColor: colorObj.hex
                      }}
                    >
                      {color === colorObj.hex && <span className="text-white text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 font-semibold py-3 rounded-2xl cursor-pointer transition-colors text-center"
                >
                  {settings.language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-semibold py-3 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] shadow-lg ${getPrimaryColorClass()}`}
                >
                  {selectedEvent ? (settings.language === 'vi' ? 'Lưu thay đổi' : 'Save') : (settings.language === 'vi' ? 'Thêm mới' : 'Add Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Detail Modal */}
      {isDetailOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl space-y-4 animate-scaleUp">
            {/* Detail Color Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <span className="w-4.5 h-4.5 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                <span className="text-xs uppercase font-bold tracking-wider opacity-60">
                  {categoryLabels[selectedEvent.category]}
                </span>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-1 rounded-lg hover:bg-white/15 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Title & Time */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight">{selectedEvent.title}</h3>
              <div className="flex items-center space-x-1.5 text-xs opacity-75">
                <Clock size={14} />
                <span>{selectedEvent.date} ({selectedEvent.startTime} - {selectedEvent.endTime})</span>
              </div>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <p className="text-xs md:text-sm bg-white/10 dark:bg-white/5 p-3 rounded-2xl leading-relaxed">
                {selectedEvent.description}
              </p>
            )}

            {/* Location & Reminder */}
            <div className="space-y-2 text-xs opacity-75 pt-1">
              {selectedEvent.location && (
                <div className="flex items-center space-x-2">
                  <MapPin size={14} />
                  <span>📍 {selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.reminder !== 'none' && (
                <div className="flex items-center space-x-2">
                  <Bell size={14} />
                  <span>
                    🔔 {settings.language === 'vi' ? 'Nhắc trước ' : 'Reminder '}
                    {selectedEvent.reminder === 'at-time' 
                      ? (settings.language === 'vi' ? 'đúng giờ' : 'at event time') 
                      : selectedEvent.reminder === '5-mins'
                      ? (settings.language === 'vi' ? '5 phút' : '5 mins')
                      : (settings.language === 'vi' ? '10 phút' : '10 mins')
                    }
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <AlertCircle size={14} />
                <span className="capitalize">
                  ⚠️ {settings.language === 'vi' ? 'Mức ưu tiên: ' : 'Priority: '}
                  {selectedEvent.priority === 'high' 
                    ? (settings.language === 'vi' ? 'Cao' : 'High') 
                    : selectedEvent.priority === 'medium'
                    ? (settings.language === 'vi' ? 'Trung bình' : 'Medium')
                    : (settings.language === 'vi' ? 'Thấp' : 'Low')
                  }
                </span>
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center space-x-3 pt-3 border-t border-white/10">
              <button
                onClick={() => handleOpenEdit(selectedEvent)}
                className="flex-1 bg-white/10 hover:bg-white/15 font-semibold py-2.5 rounded-2xl flex items-center justify-center space-x-1.5 cursor-pointer text-xs transition-colors"
              >
                <Edit3 size={14} />
                <span>{settings.language === 'vi' ? 'Chỉnh sửa' : 'Edit'}</span>
              </button>
              <button
                onClick={() => handleDelete(selectedEvent.id)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-2.5 rounded-2xl flex items-center justify-center space-x-1.5 cursor-pointer text-xs transition-colors"
              >
                <Trash2 size={14} />
                <span>{settings.language === 'vi' ? 'Xóa bỏ' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
