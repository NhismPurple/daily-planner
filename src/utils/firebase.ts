import { UserProfile, Event, Task, Habit, Note, Goal, UserSettings } from '../types';

// Mock User Database in LocalStorage
const USERS_KEY = 'daily_planner_users';
const CURRENT_USER_KEY = 'daily_planner_current_user';

const getMockUsers = (): any[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMockUsers = (users: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Subscriptions for Realtime Updates
const listeners: { [key: string]: Function[] } = {};

export const subscribeToCollection = (collectionName: string, callback: Function) => {
  if (!listeners[collectionName]) {
    listeners[collectionName] = [];
  }
  listeners[collectionName].push(callback);
  return () => {
    listeners[collectionName] = listeners[collectionName].filter(cb => cb !== callback);
  };
};

export const notifyCollectionChange = (collectionName: string, data: any) => {
  if (listeners[collectionName]) {
    listeners[collectionName].forEach(callback => callback(data));
  }
};

// --- AUTHENTICATION MOCK ---
export const auth = {
  currentUser: null as UserProfile | null,
  
  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => {
    if (typeof window === 'undefined') return () => {};
    
    // Load current user from localStorage
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    auth.currentUser = savedUser ? JSON.parse(savedUser) : null;
    callback(auth.currentUser);

    const handleAuthChange = (e: CustomEvent) => {
      callback(e.detail);
    };

    window.addEventListener('auth-state-changed' as any, handleAuthChange);
    return () => {
      window.removeEventListener('auth-state-changed' as any, handleAuthChange);
    };
  },

  signInWithEmailAndPassword: async (email: string, pass: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
    const users = getMockUsers();
    const user = users.find(u => u.email === email && u.password === pass);
    if (!user) {
      throw new Error('Sai tài khoản hoặc mật khẩu!');
    }
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`
    };
    auth.currentUser = profile;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: profile }));
    return profile;
  },

  createUserWithEmailAndPassword: async (email: string, pass: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getMockUsers();
    if (users.some(u => u.email === email)) {
      throw new Error('Email này đã được đăng ký!');
    }
    const newUid = 'user_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      uid: newUid,
      email,
      password: pass,
      displayName: email.split('@')[0]
    };
    users.push(newUser);
    saveMockUsers(users);

    const profile: UserProfile = {
      uid: newUid,
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newUid}`
    };
    auth.currentUser = profile;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: profile }));
    return profile;
  },

  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    auth.currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
  },

  signInWithPopup: async (provider: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUid = 'provider_' + Math.random().toString(36).substr(2, 9);
    const profile: UserProfile = {
      uid: newUid,
      email: `${provider.toLowerCase()}_user@gmail.com`,
      displayName: `${provider} User`,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newUid}`
    };
    auth.currentUser = profile;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: profile }));
    return profile;
  }
};

export const GoogleAuthProvider = 'Google';
export const GithubAuthProvider = 'GitHub';

// --- FIRESTORE MOCK (OFFLINE CACHE & REALTIME) ---
const getDataKey = (uid: string, collection: string) => `daily_planner_${uid}_${collection}`;

export const db = {
  // Lắng nghe dữ liệu realtime
  onSnapshot: (uid: string, collectionName: string, callback: (data: any[]) => void) => {
    if (typeof window === 'undefined') return () => {};
    
    const key = getDataKey(uid, collectionName);
    const loadAndCallback = () => {
      const savedData = localStorage.getItem(key);
      const dataList = savedData ? JSON.parse(savedData) : [];
      callback(dataList);
    };

    // Load ban đầu
    loadAndCallback();

    // Đăng ký lắng nghe thay đổi
    const unsubscribe = subscribeToCollection(key, (updatedData: any[]) => {
      callback(updatedData);
    });

    return unsubscribe;
  },

  // Ghi hoặc cập nhật tài liệu
  setDoc: async (uid: string, collectionName: string, docId: string, data: any) => {
    const key = getDataKey(uid, collectionName);
    const savedData = localStorage.getItem(key);
    let dataList = savedData ? JSON.parse(savedData) : [];

    const index = dataList.findIndex((item: any) => item.id === docId);
    if (index > -1) {
      dataList[index] = { ...dataList[index], ...data, id: docId };
    } else {
      dataList.push({ ...data, id: docId });
    }

    localStorage.setItem(key, JSON.stringify(dataList));
    notifyCollectionChange(key, dataList);
  },

  // Xóa tài liệu
  deleteDoc: async (uid: string, collectionName: string, docId: string) => {
    const key = getDataKey(uid, collectionName);
    const savedData = localStorage.getItem(key);
    if (!savedData) return;

    let dataList = JSON.parse(savedData);
    dataList = dataList.filter((item: any) => item.id !== docId);

    localStorage.setItem(key, JSON.stringify(dataList));
    notifyCollectionChange(key, dataList);
  },

  // Ghi đè toàn bộ danh sách (hữu ích cho sắp xếp kéo thả)
  saveAll: async (uid: string, collectionName: string, dataList: any[]) => {
    const key = getDataKey(uid, collectionName);
    localStorage.setItem(key, JSON.stringify(dataList));
    notifyCollectionChange(key, dataList);
  }
};
