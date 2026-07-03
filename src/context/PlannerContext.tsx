'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, Task, Habit, Note, Goal, UserSettings } from '../types';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';

interface PlannerContextType {
  events: Event[];
  tasks: Task[];
  habits: Habit[];
  notes: Note[];
  goals: Goal[];
  settings: UserSettings;
  
  // Events API
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Tasks API
  addTask: (task: Omit<Task, 'id' | 'completed' | 'order'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (newTasks: Task[]) => Promise<void>;
  
  // Habits API
  addHabit: (title: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  
  // Notes API
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Goals API
  addGoal: (goal: Omit<Goal, 'id' | 'current' | 'completed'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Settings API
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: 'dark', // Đặt dark theme làm mặc định cho đẹp mắt phong cách Glassmorphism!
  font: 'Poppins',
  primaryColor: 'violet',
  language: 'vi',
  timeFormat: '24h'
};

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Guest ID fallback để có thể sử dụng không cần đăng nhập
  const uid = user ? user.uid : 'guest';

  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Synchronize collections in real-time
  useEffect(() => {
    const unsubEvents = db.onSnapshot(uid, 'events', (data) => setEvents(data));
    const unsubTasks = db.onSnapshot(uid, 'tasks', (data) => {
      // Sắp xếp tasks theo thứ tự order
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setTasks(sorted);
    });
    const unsubHabits = db.onSnapshot(uid, 'habits', (data) => setHabits(data));
    const unsubNotes = db.onSnapshot(uid, 'notes', (data) => {
      // Sắp xếp note đã ghim lên đầu, sau đó theo thời gian cập nhật giảm dần
      const sorted = [...data].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setNotes(sorted);
    });
    const unsubGoals = db.onSnapshot(uid, 'goals', (data) => setGoals(data));
    const unsubSettings = db.onSnapshot(uid, 'settings', (data) => {
      if (data && data.length > 0) {
        setSettings(data[0]);
      } else {
        setSettings(defaultSettings);
      }
    });

    return () => {
      unsubEvents();
      unsubTasks();
      unsubHabits();
      unsubNotes();
      unsubGoals();
      unsubSettings();
    };
  }, [uid]);

  // Áp dụng font và theme vào DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Áp dụng Theme
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Áp dụng Font
    root.style.setProperty('--font-custom', settings.font === 'Poppins' ? 'Poppins, sans-serif' : 'Inter, sans-serif');
  }, [settings.theme, settings.font]);

  // --- EVENTS API ---
  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    const id = 'event_' + Math.random().toString(36).substr(2, 9);
    const newEvent: Event = { ...eventData, id };
    await db.setDoc(uid, 'events', id, newEvent);
  };

  const updateEvent = async (event: Event) => {
    await db.setDoc(uid, 'events', event.id, event);
  };

  const deleteEvent = async (id: string) => {
    await db.deleteDoc(uid, 'events', id);
  };

  // --- TASKS API ---
  const addTask = async (taskData: Omit<Task, 'id' | 'completed' | 'order'>) => {
    const id = 'task_' + Math.random().toString(36).substr(2, 9);
    const order = tasks.length;
    const newTask: Task = { ...taskData, id, completed: false, order };
    await db.setDoc(uid, 'tasks', id, newTask);
  };

  const updateTask = async (task: Task) => {
    await db.setDoc(uid, 'tasks', task.id, task);
  };

  const deleteTask = async (id: string) => {
    await db.deleteDoc(uid, 'tasks', id);
  };

  const reorderTasks = async (newTasks: Task[]) => {
    const updated = newTasks.map((t, idx) => ({ ...t, order: idx }));
    setTasks(updated); // Update local state immediately for responsiveness
    await db.saveAll(uid, 'tasks', updated);
  };

  // --- HABITS API ---
  const addHabit = async (title: string) => {
    const id = 'habit_' + Math.random().toString(36).substr(2, 9);
    const newHabit: Habit = {
      id,
      title,
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString()
    };
    await db.setDoc(uid, 'habits', id, newHabit);
  };

  const toggleHabit = async (id: string, date: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    let completedDates = [...habit.completedDates];
    const isCompleted = completedDates.includes(date);

    if (isCompleted) {
      completedDates = completedDates.filter(d => d !== date);
    } else {
      completedDates.push(date);
    }

    // Tính toán streak
    // Streak được tính bằng số ngày liên tiếp trước ngày hiện tại (bao gồm cả hôm nay)
    let streak = 0;
    const sortedDates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (sortedDates.length > 0) {
      let checkDate = new Date(date); // Hoặc tính từ hôm nay
      // Để đơn giản, ta tính chuỗi liên tiếp lùi dần từ ngày gần nhất
      let tempStreak = 0;
      let dateCursor = new Date(sortedDates[0]);
      
      // Kiểm tra xem ngày gần nhất có phải hôm nay hoặc hôm qua không để streak còn hiệu lực
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastCheck = new Date(sortedDates[0]);
      lastCheck.setHours(0,0,0,0);

      if (lastCheck >= yesterday) {
        tempStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i]);
          const diffTime = Math.abs(dateCursor.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
            dateCursor = prevDate;
          } else if (diffDays > 1) {
            break;
          }
        }
        streak = tempStreak;
      }
    }

    await db.setDoc(uid, 'habits', id, { ...habit, completedDates, streak });
  };

  const deleteHabit = async (id: string) => {
    await db.deleteDoc(uid, 'habits', id);
  };

  // --- NOTES API ---
  const addNote = async (noteData: Omit<Note, 'id' | 'updatedAt'>) => {
    const id = 'note_' + Math.random().toString(36).substr(2, 9);
    const newNote: Note = {
      ...noteData,
      id,
      updatedAt: new Date().toISOString()
    };
    await db.setDoc(uid, 'notes', id, newNote);
  };

  const updateNote = async (note: Note) => {
    await db.setDoc(uid, 'notes', note.id, {
      ...note,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteNote = async (id: string) => {
    await db.deleteDoc(uid, 'notes', id);
  };

  // --- GOALS API ---
  const addGoal = async (goalData: Omit<Goal, 'id' | 'current' | 'completed'>) => {
    const id = 'goal_' + Math.random().toString(36).substr(2, 9);
    const newGoal: Goal = {
      ...goalData,
      id,
      current: 0,
      completed: false
    };
    await db.setDoc(uid, 'goals', id, newGoal);
  };

  const updateGoal = async (goal: Goal) => {
    const completed = goal.current >= goal.target;
    await db.setDoc(uid, 'goals', goal.id, { ...goal, completed });
  };

  const deleteGoal = async (id: string) => {
    await db.deleteDoc(uid, 'goals', id);
  };

  // --- SETTINGS API ---
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings); // Update local state for fast UI response
    await db.setDoc(uid, 'settings', 'user_settings', updatedSettings);
  };

  return (
    <PlannerContext.Provider
      value={{
        events,
        tasks,
        habits,
        notes,
        goals,
        settings,
        addEvent,
        updateEvent,
        deleteEvent,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks,
        addHabit,
        toggleHabit,
        deleteHabit,
        addNote,
        updateNote,
        deleteNote,
        addGoal,
        updateGoal,
        deleteGoal,
        updateSettings
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
