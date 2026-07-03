import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { PlannerProvider } from '../context/PlannerContext';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Daily Planner - Lập Lịch Trình & Quản Lý Công Việc Hàng Ngày',
  description: 'Website Daily Planner hiện đại với phong cách Glassmorphism UI. Hỗ trợ quản lý lịch trình dạng Google Calendar, To-do list kéo thả, Pomodoro Focus Mode, thống kê Recharts và Habit tracker thông minh.',
  keywords: 'daily planner, quản lý lịch trình, to-do list, pomodoro, habit tracker, calendar app, glassmorphism planner',
  authors: [{ name: 'Antigravity Developer' }],
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${poppins.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col relative antialiased">
        {/* Animated Glassmorphism Background Elements */}
        <div className="animated-bg" />
        <div className="orb w-[300px] h-[300px] bg-blue-500/20 top-[10%] left-[10%]" />
        <div className="orb w-[350px] h-[350px] bg-purple-500/20 bottom-[15%] right-[5%] [animation-delay:4s]" />
        <div className="orb w-[200px] h-[200px] bg-pink-500/10 top-[50%] left-[45%] [animation-delay:8s]" />

        <AuthProvider>
          <PlannerProvider>
            {children}
          </PlannerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
