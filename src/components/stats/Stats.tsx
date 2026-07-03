'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { usePlanner } from '../../context/PlannerContext';
import { Category } from '../../types';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  subDays 
} from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export const Stats: React.FC = () => {
  const { events, tasks, habits, settings } = usePlanner();
  const [mounted, setMounted] = useState(false);

  // Fix Next.js Hydration issues with Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = settings.language === 'vi' ? vi : enUS;

  // 1. DỮ LIỆU BIỂU ĐỒ TRÒN (CATEGORIES DISTRIBUTION)
  const categoryLabels: Record<Category, string> = {
    work: settings.language === 'vi' ? 'Làm việc' : 'Work',
    study: settings.language === 'vi' ? 'Học tập' : 'Study',
    gym: settings.language === 'vi' ? 'Gym / Sức khỏe' : 'Gym',
    eat: settings.language === 'vi' ? 'Ăn uống' : 'Dining',
    leisure: settings.language === 'vi' ? 'Giải trí' : 'Leisure',
    other: settings.language === 'vi' ? 'Khác' : 'Other'
  };

  const getCategoryData = () => {
    const counts: Record<Category, number> = {
      work: 0, study: 0, gym: 0, eat: 0, leisure: 0, other: 0
    };

    // Đếm trong tasks
    tasks.forEach(t => {
      if (counts[t.category] !== undefined) counts[t.category]++;
    });

    // Đếm trong events
    events.forEach(e => {
      if (counts[e.category] !== undefined) counts[e.category]++;
    });

    return Object.keys(counts).map(cat => ({
      name: categoryLabels[cat as Category],
      value: counts[cat as Category]
    })).filter(item => item.value > 0);
  };

  const pieData = getCategoryData();
  const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#64748b'];

  // 2. DỮ LIỆU BIỂU ĐỒ ĐƯỜNG (COMPLETED ITEMS BY WEEKDAYS)
  const getLineData = () => {
    const today = new Date();
    // Lấy 7 ngày vừa qua
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      const doneEvents = events.filter(e => e.date === dateStr && e.completed).length;
      const doneTasks = tasks.filter(t => t.dueDate === dateStr && t.completed).length;

      return {
        dayName: format(day, 'EEE', { locale: currentLocale }),
        [settings.language === 'vi' ? 'Hoàn thành' : 'Completed']: doneEvents + doneTasks
      };
    });
  };

  const lineData = getLineData();

  // 3. DỮ LIỆU BIỂU ĐỒ CỘT (HABITS PERFORMANCE RATE)
  const getBarData = () => {
    return habits.map(h => {
      // Tỉ lệ hoàn thành = số ngày check / 30 ngày gần đây hoặc tổng số (ở đây mô phỏng là số lần check)
      return {
        habitName: h.title,
        [settings.language === 'vi' ? 'Số lần làm' : 'Checks']: h.completedDates.length,
        [settings.language === 'vi' ? 'Chuỗi ngày' : 'Streak']: h.streak
      };
    });
  };

  const barData = getBarData();

  if (!mounted) {
    return (
      <div className="py-24 text-center opacity-60 text-sm">
        {settings.language === 'vi' ? 'Đang khởi tạo biểu đồ...' : 'Initializing statistics charts...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart: Weekly Completion Performance */}
        <div className="glass-card p-6 flex flex-col justify-between min-h-[350px] bg-white/10 dark:bg-white/5 border-none">
          <div className="mb-4">
            <h3 className="font-bold text-base">
              {settings.language === 'vi' ? 'Tần suất hoàn thành việc (7 ngày)' : 'Completion Rate (Last 7 Days)'}
            </h3>
            <p className="text-xs opacity-60">
              {settings.language === 'vi' ? 'Tổng số nhiệm vụ & sự kiện đã làm xong' : 'Total completed tasks and events'}
            </p>
          </div>

          <div className="flex-1 w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dayName" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 15, 25, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    fontSize: '12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey={settings.language === 'vi' ? 'Hoàn thành' : 'Completed'} 
                  stroke="rgb(var(--primary-rgb))" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Tasks Distribution by Category */}
        <div className="glass-card p-6 flex flex-col justify-between min-h-[350px] bg-white/10 dark:bg-white/5 border-none">
          <div className="mb-4">
            <h3 className="font-bold text-base">
              {settings.language === 'vi' ? 'Phân bổ theo danh mục' : 'Category Distribution'}
            </h3>
            <p className="text-xs opacity-60">
              {settings.language === 'vi' ? 'Tỉ lệ công việc theo phân loại' : 'Ratio of planning items by category'}
            </p>
          </div>

          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center opacity-50 text-xs italic">
              {settings.language === 'vi' ? 'Chưa có đủ dữ liệu để vẽ biểu đồ tròn.' : 'Not enough data to render Pie Chart.'}
            </div>
          ) : (
            <div className="flex-1 w-full h-[250px] flex flex-col sm:flex-row items-center justify-around">
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 15, 25, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1rem',
                        fontSize: '11px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends Custom */}
              <div className="space-y-1.5 text-xs">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="font-semibold opacity-80">{item.name}</span>
                    <span className="opacity-45">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bar Chart: Habits completion checks */}
      <div className="glass-card p-6 min-h-[350px] bg-white/10 dark:bg-white/5 border-none">
        <div className="mb-4">
          <h3 className="font-bold text-base">
            {settings.language === 'vi' ? 'Hiệu suất thói quen' : 'Habit Performance'}
          </h3>
          <p className="text-xs opacity-60">
            {settings.language === 'vi' ? 'So sánh số lần hoàn thành và chuỗi ngày streak' : 'Compare total check-ins and streaks'}
          </p>
        </div>

        {barData.length === 0 ? (
          <div className="py-24 text-center opacity-50 text-xs italic">
            {settings.language === 'vi' ? 'Vui lòng thêm thói quen để xem thống kê.' : 'Add habits first to see statistics.'}
          </div>
        ) : (
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="habitName" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 15, 25, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar 
                  dataKey={settings.language === 'vi' ? 'Số lần làm' : 'Checks'} 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]} 
                />
                <Bar 
                  dataKey={settings.language === 'vi' ? 'Chuỗi ngày' : 'Streak'} 
                  fill="#f59e0b" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
