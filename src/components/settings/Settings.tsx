'use client';

import React from 'react';
import { 
  Palette, 
  Languages, 
  Clock, 
  Type, 
  Monitor,
  Check
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = usePlanner();

  const colorThemes = [
    { id: 'violet', name: settings.language === 'vi' ? 'Tím đậm' : 'Violet', hex: '#7c3aed' },
    { id: 'blue', name: settings.language === 'vi' ? 'Xanh dương' : 'Blue', hex: '#3b82f6' },
    { id: 'purple', name: settings.language === 'vi' ? 'Tím' : 'Purple', hex: '#9333ea' },
    { id: 'rose', name: settings.language === 'vi' ? 'Hồng Rose' : 'Rose', hex: '#f43f5e' },
    { id: 'emerald', name: settings.language === 'vi' ? 'Xanh lục' : 'Emerald', hex: '#10b981' },
  ] as const;

  const handleColorSelect = async (colorId: typeof colorThemes[number]['id']) => {
    // Cập nhật thuộc tính data-primary vào document element để CSS thay đổi màu chủ đạo
    document.documentElement.setAttribute('data-primary', colorId);
    await updateSettings({ primaryColor: colorId });
  };

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    await updateSettings({ theme });
  };

  const handleFontChange = async (font: 'Poppins' | 'Inter') => {
    await updateSettings({ font });
  };

  const handleLanguageChange = async (language: 'vi' | 'en') => {
    await updateSettings({ language });
  };

  const handleTimeFormatChange = async (timeFormat: '12h' | '24h') => {
    await updateSettings({ timeFormat });
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
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-extrabold">
          {settings.language === 'vi' ? 'Cài đặt hệ thống' : 'System Settings'}
        </h2>
        <p className="text-xs opacity-60">
          {settings.language === 'vi' ? 'Tùy biến không gian làm việc của bạn' : 'Personalize your planning environment'}
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. Theme Configuration */}
        <div className="glass-card p-5 bg-white/10 dark:bg-white/5 border-none space-y-4">
          <div className="flex items-center space-x-2.5">
            <Monitor size={18} className="opacity-70" />
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-85">
              {settings.language === 'vi' ? 'Giao diện hiển thị' : 'App Theme'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`py-3.5 px-4 rounded-2xl border border-solid text-sm font-semibold transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-800 shadow-sm font-bold scale-[1.02]'
                  : 'border-white/10 hover:bg-white/5 opacity-70'
              }`}
            >
              ☀️ {settings.language === 'vi' ? 'Nền sáng' : 'Light Mode'}
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`py-3.5 px-4 rounded-2xl border border-solid text-sm font-semibold transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-slate-900 border-white/20 text-white shadow-sm font-bold scale-[1.02]'
                  : 'border-white/10 hover:bg-white/5 opacity-70'
              }`}
            >
              🌙 {settings.language === 'vi' ? 'Nền tối' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* 2. Color Accent Picker */}
        <div className="glass-card p-5 bg-white/10 dark:bg-white/5 border-none space-y-4">
          <div className="flex items-center space-x-2.5">
            <Palette size={18} className="opacity-70" />
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-85">
              {settings.language === 'vi' ? 'Màu sắc chủ đạo' : 'Color Accent'}
            </h3>
          </div>

          <div className="flex flex-wrap gap-4">
            {colorThemes.map((c) => (
              <button
                key={c.id}
                onClick={() => handleColorSelect(c.id)}
                className={`py-2 px-3 rounded-xl border border-solid cursor-pointer flex items-center space-x-2 transition-all ${
                  settings.primaryColor === c.id
                    ? 'border-white bg-white/15 scale-[1.03] font-bold'
                    : 'border-white/15 hover:bg-white/5 opacity-70'
                }`}
              >
                <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                <span className="text-xs">{c.name}</span>
                {settings.primaryColor === c.id && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Typography (Font Selection) */}
        <div className="glass-card p-5 bg-white/10 dark:bg-white/5 border-none space-y-4">
          <div className="flex items-center space-x-2.5">
            <Type size={18} className="opacity-70" />
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-85">
              {settings.language === 'vi' ? 'Phông chữ hệ thống' : 'Typography'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleFontChange('Poppins')}
              className={`py-3.5 px-4 rounded-2xl border border-solid text-sm font-semibold transition-all cursor-pointer font-poppins ${
                settings.font === 'Poppins'
                  ? 'bg-white/10 border-white/20 shadow-sm font-bold scale-[1.02]'
                  : 'border-white/10 hover:bg-white/5 opacity-70'
              }`}
            >
              Poppins Font
            </button>
            <button
              onClick={() => handleFontChange('Inter')}
              className={`py-3.5 px-4 rounded-2xl border border-solid text-sm font-semibold transition-all cursor-pointer font-inter ${
                settings.font === 'Inter'
                  ? 'bg-white/10 border-white/20 shadow-sm font-bold scale-[1.02]'
                  : 'border-white/10 hover:bg-white/5 opacity-70'
              }`}
            >
              Inter Font
            </button>
          </div>
        </div>

        {/* 4. Language & Time Settings */}
        <div className="glass-card p-5 bg-white/10 dark:bg-white/5 border-none grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Language Selector */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <Languages size={18} className="opacity-70" />
              <h4 className="font-bold text-sm uppercase tracking-wider opacity-85">
                {settings.language === 'vi' ? 'Ngôn ngữ' : 'Language'}
              </h4>
            </div>

            <div className="flex bg-white/10 dark:bg-slate-900/50 rounded-xl p-1 backdrop-blur-sm border border-white/5">
              <button
                onClick={() => handleLanguageChange('vi')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  settings.language === 'vi'
                    ? 'bg-white/10 text-white font-bold'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  settings.language === 'en'
                    ? 'bg-white/10 text-white font-bold'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Time format selector */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <Clock size={18} className="opacity-70" />
              <h4 className="font-bold text-sm uppercase tracking-wider opacity-85">
                {settings.language === 'vi' ? 'Định dạng giờ' : 'Time Format'}
              </h4>
            </div>

            <div className="flex bg-white/10 dark:bg-slate-900/50 rounded-xl p-1 backdrop-blur-sm border border-white/5">
              <button
                onClick={() => handleTimeFormatChange('24h')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  settings.timeFormat === '24h'
                    ? 'bg-white/10 text-white font-bold'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                24 Hours (13:00)
              </button>
              <button
                onClick={() => handleTimeFormatChange('12h')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  settings.timeFormat === '12h'
                    ? 'bg-white/10 text-white font-bold'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                12 Hours (1:00 PM)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
