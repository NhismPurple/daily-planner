'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  ArrowUpDown, 
  Filter, 
  Tag, 
  CalendarDays,
  Check,
  X
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Task, Priority, Category } from '../../types';

export const TodoList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, reorderTasks, settings } = usePlanner();

  // State form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, active, completed
  const [sortBy, setSortBy] = useState<'order' | 'date' | 'priority'>('order');

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Categories helper
  const categoryLabels: Record<Category, string> = {
    work: settings.language === 'vi' ? 'Làm việc' : 'Work',
    study: settings.language === 'vi' ? 'Học tập' : 'Study',
    gym: settings.language === 'vi' ? 'Gym / Sức khỏe' : 'Gym / Health',
    eat: settings.language === 'vi' ? 'Ăn uống' : 'Dining',
    leisure: settings.language === 'vi' ? 'Giải trí' : 'Leisure',
    other: settings.language === 'vi' ? 'Khác' : 'Other'
  };

  const categoryColors: Record<Category, string> = {
    work: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    study: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    gym: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    eat: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    leisure: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    other: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
  };

  const handleOpenAdd = () => {
    setTitle('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setPriority('medium');
    setCategory('work');
    setEditingTask(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setCategory(task.category);
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      // Edit mode
      await updateTask({
        ...editingTask,
        title,
        dueDate,
        priority,
        category
      });
    } else {
      // Add mode
      await addTask({
        title,
        dueDate,
        priority,
        category
      });
    }

    setIsAddOpen(false);
  };

  // Logic Sắp xếp & Bộ lọc
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const filteredTasks = tasks
    .filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || t.category === filterCategory;
      const matchPri = filterPriority === 'all' || t.priority === filterPriority;
      const matchStatus = 
        filterStatus === 'all' 
          ? true 
          : filterStatus === 'completed' 
          ? t.completed 
          : !t.completed;
      return matchSearch && matchCat && matchPri && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return a.order - b.order; // Sắp xếp kéo thả
    });

  // Drag and Drop Logic
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;

    const reordered = [...filteredTasks];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIdx, 0, draggedItem);

    // Cập nhật lại mảng tasks chính
    const updatedTasks = [...tasks];
    reordered.forEach((item, index) => {
      const origIdx = updatedTasks.findIndex(t => t.id === item.id);
      if (origIdx > -1) {
        updatedTasks[origIdx].order = index;
      }
    });

    await reorderTasks(updatedTasks);
    setDraggedIndex(null);
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
      {/* Tool control bar: Search, Filters & Add button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={settings.language === 'vi' ? 'Tìm kiếm công việc...' : 'Search tasks...'}
            className="w-full glass-input pl-11"
          />
        </div>

        {/* Buttons and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className={`flex items-center space-x-2 text-white font-medium py-2.5 px-5 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform shadow-lg ${getPrimaryColorClass()}`}
          >
            <Plus size={18} />
            <span>{settings.language === 'vi' ? 'Thêm nhiệm vụ' : 'Add Task'}</span>
          </button>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center justify-between bg-white/20 dark:bg-white/5 border-none">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter Category */}
          <div className="flex items-center space-x-2">
            <Tag size={14} className="opacity-60" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer p-1"
            >
              <option className="bg-slate-900 text-white" value="all">{settings.language === 'vi' ? 'Tất cả danh mục' : 'All Categories'}</option>
              {Object.keys(categoryLabels).map((cat) => (
                <option key={cat} className="bg-slate-900 text-white" value={cat}>{categoryLabels[cat as Category]}</option>
              ))}
            </select>
          </div>

          {/* Filter Priority */}
          <div className="flex items-center space-x-2">
            <AlertTriangle size={14} className="opacity-60" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer p-1"
            >
              <option className="bg-slate-900 text-white" value="all">{settings.language === 'vi' ? 'Tất cả độ ưu tiên' : 'All Priorities'}</option>
              <option className="bg-slate-900 text-white" value="high">{settings.language === 'vi' ? 'Ưu tiên Cao' : 'High Priority'}</option>
              <option className="bg-slate-900 text-white" value="medium">{settings.language === 'vi' ? 'Ưu tiên Trung bình' : 'Medium Priority'}</option>
              <option className="bg-slate-900 text-white" value="low">{settings.language === 'vi' ? 'Ưu tiên Thấp' : 'Low Priority'}</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center space-x-2">
            <Filter size={14} className="opacity-60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer p-1"
            >
              <option className="bg-slate-900 text-white" value="all">{settings.language === 'vi' ? 'Tất cả trạng thái' : 'All Status'}</option>
              <option className="bg-slate-900 text-white" value="active">{settings.language === 'vi' ? 'Chưa hoàn thành' : 'Active'}</option>
              <option className="bg-slate-900 text-white" value="completed">{settings.language === 'vi' ? 'Đã hoàn thành' : 'Completed'}</option>
            </select>
          </div>
        </div>

        {/* Sort option */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown size={14} className="opacity-60" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer p-1"
          >
            <option className="bg-slate-900 text-white" value="order">{settings.language === 'vi' ? 'Kéo thả tùy chỉnh' : 'Custom Order'}</option>
            <option className="bg-slate-900 text-white" value="date">{settings.language === 'vi' ? 'Theo Hạn chót' : 'By Due Date'}</option>
            <option className="bg-slate-900 text-white" value="priority">{settings.language === 'vi' ? 'Theo Độ ưu tiên' : 'By Priority'}</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
          {settings.language === 'vi' ? 'Không tìm thấy công việc nào thỏa mãn bộ lọc.' : 'No tasks match current filter options.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => (
            <div
              key={task.id}
              draggable={sortBy === 'order'}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`glass-card p-4 flex items-center justify-between border-l-4 border-solid transition-all duration-200 ${
                draggedIndex === idx ? 'opacity-40 scale-95 border-dashed' : ''
              } ${sortBy === 'order' ? 'cursor-grab active:cursor-grabbing' : ''} bg-white/10 dark:bg-white/5`}
              style={{
                borderLeftColor: 
                  task.priority === 'high' 
                    ? '#f43f5e' 
                    : task.priority === 'medium'
                    ? '#f59e0b'
                    : '#3b82f6'
              }}
            >
              {/* Left Info: Checkbox + Title */}
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => updateTask({ ...task, completed: !task.completed })}
                  className="custom-checkbox"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm md:text-base font-semibold truncate ${task.completed ? 'line-through opacity-40' : ''}`}>
                    {task.title}
                  </p>
                  
                  {/* Meta tags line */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] md:text-xs">
                    {/* Due Date */}
                    <span className="flex items-center space-x-1 opacity-60">
                      <CalendarDays size={12} />
                      <span>{task.dueDate}</span>
                    </span>
                    <span className="opacity-30">•</span>
                    {/* Category pill */}
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] md:text-[10px] font-bold ${categoryColors[task.category]}`}>
                      {categoryLabels[task.category]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Edit / Delete actions */}
              <div className="flex items-center space-x-1.5 ml-4">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
                  title={settings.language === 'vi' ? 'Sửa' : 'Edit'}
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                  title={settings.language === 'vi' ? 'Xóa' : 'Delete'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Task Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold">
                {editingTask 
                  ? (settings.language === 'vi' ? 'Cập nhật nhiệm vụ' : 'Edit Task') 
                  : (settings.language === 'vi' ? 'Thêm nhiệm vụ mới' : 'Add New Task')}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Tiêu đề' : 'Title'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={settings.language === 'vi' ? 'Nhập tên công việc...' : 'Enter task title...'}
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">
                    {settings.language === 'vi' ? 'Hạn chót' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">
                    {settings.language === 'vi' ? 'Độ ưu tiên' : 'Priority'}
                  </label>
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
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Danh mục' : 'Category'}
                </label>
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

              {/* Action buttons */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 font-semibold py-3.5 rounded-2xl cursor-pointer transition-colors text-center text-sm"
                >
                  {settings.language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-semibold py-3.5 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] shadow-lg text-sm ${getPrimaryColorClass()}`}
                >
                  {editingTask ? (settings.language === 'vi' ? 'Lưu thay đổi' : 'Save Changes') : (settings.language === 'vi' ? 'Thêm mới' : 'Add Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
