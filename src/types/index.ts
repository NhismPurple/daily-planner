export type Priority = 'low' | 'medium' | 'high';

export type Category = 'study' | 'work' | 'gym' | 'eat' | 'leisure' | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // Định dạng YYYY-MM-DD
  startTime: string; // Định dạng HH:MM
  endTime: string; // Định dạng HH:MM
  color: string; // Mã màu HEX hoặc CSS class
  priority: Priority;
  category: Category;
  location?: string;
  reminder: 'none' | 'at-time' | '5-mins' | '10-mins';
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // Định dạng YYYY-MM-DD
  priority: Priority;
  category: Category;
  order: number;
}

export interface Habit {
  id: string;
  title: string;
  completedDates: string[]; // Danh sách các ngày đã hoàn thành (YYYY-MM-DD)
  streak: number; // Số ngày liên tục hiện tại
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'green' | 'pink' | 'purple' | 'blue';
  pinned: boolean;
  updatedAt: string;
}

export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  target: number; // Ví dụ: 5 công việc, 8 ly nước
  current: number;
  completed: boolean;
  deadline: string; // Định dạng YYYY-MM-DD
}

export interface UserSettings {
  theme: 'light' | 'dark';
  font: 'Inter' | 'Poppins';
  primaryColor: 'blue' | 'purple' | 'violet' | 'rose' | 'emerald';
  language: 'vi' | 'en';
  timeFormat: '12h' | '24h';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
