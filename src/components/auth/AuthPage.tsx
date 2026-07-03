'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlanner } from '../../context/PlannerContext';

interface AuthPageProps {
  onGuestMode: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onGuestMode }) => {
  const { login, register, loginWithProvider } = useAuth();
  const { settings } = usePlanner();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error(settings.language === 'vi' ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!');
        }
        if (password.length < 6) {
          throw new Error(settings.language === 'vi' ? 'Mật khẩu phải từ 6 ký tự trở lên!' : 'Password must be at least 6 characters!');
        }
        await register(email, password);
      } else {
        // Forgot password simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessage(
          settings.language === 'vi' 
            ? 'Đã gửi link khôi phục mật khẩu vào Email của bạn!' 
            : 'Password reset link sent to your email!'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'Google' | 'GitHub') => {
    setError(null);
    setLoading(true);
    try {
      await loginWithProvider(provider);
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập mạng xã hội');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl space-y-6 z-10 border-white/10 shadow-2xl animate-scaleUp">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-violet-600/35 text-white mb-2 shadow-lg shadow-violet-500/20 border border-violet-500/30 animate-pulse">
            <Calendar size={28} />
          </div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Daily Planner
          </h2>
          <p className="text-xs opacity-65 font-medium">
            {settings.language === 'vi' ? 'Quản lý lịch trình khoa học & hiện đại' : 'Scientific & Modern schedule management'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Auth form content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase opacity-65 tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full glass-input pl-11 text-sm"
              />
            </div>
          </div>

          {/* Password input (not visible in Forgot mode) */}
          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-65 tracking-wider">
                {settings.language === 'vi' ? 'Mật khẩu' : 'Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-11 text-sm"
                />
              </div>
            </div>
          )}

          {/* Confirm Password (only in Register mode) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-65 tracking-wider">
                {settings.language === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-11 text-sm"
                />
              </div>
            </div>
          )}

          {/* Forgot Password trigger */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
              >
                {settings.language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 font-bold text-sm tracking-wide shadow-lg shadow-violet-500/10 cursor-pointer flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>
              {loading 
                ? (settings.language === 'vi' ? 'Đang xử lý...' : 'Processing...') 
                : mode === 'login' 
                ? (settings.language === 'vi' ? 'Đăng nhập' : 'Sign In') 
                : mode === 'register' 
                ? (settings.language === 'vi' ? 'Tạo tài khoản' : 'Sign Up')
                : (settings.language === 'vi' ? 'Gửi link khôi phục' : 'Reset Password')}
            </span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-4 text-xs opacity-50">
          <div className="absolute left-0 right-0 h-[1px] bg-white/10" />
          <span className="bg-slate-900/90 px-3 z-10">
            {settings.language === 'vi' ? 'Hoặc đăng nhập bằng' : 'Or continue with'}
          </span>
        </div>

        {/* OAuth Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleProviderLogin('Google')}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4.5 h-4.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleProviderLogin('GitHub')}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Quick Switch mode or Guest entry */}
        <div className="space-y-4 pt-2 text-center text-xs">
          <p className="opacity-80">
            {mode === 'login' ? (
              <>
                {settings.language === 'vi' ? 'Chưa có tài khoản? ' : "Don't have an account? "}
                <button onClick={() => setMode('register')} className="text-violet-400 hover:text-violet-300 font-bold cursor-pointer">
                  {settings.language === 'vi' ? 'Đăng ký ngay' : 'Register here'}
                </button>
              </>
            ) : (
              <>
                {settings.language === 'vi' ? 'Đã có tài khoản? ' : 'Already have an account? '}
                <button onClick={() => setMode('login')} className="text-violet-400 hover:text-violet-300 font-bold cursor-pointer">
                  {settings.language === 'vi' ? 'Đăng nhập' : 'Sign in'}
                </button>
              </>
            )}
          </p>

          <button
            type="button"
            onClick={onGuestMode}
            className="text-slate-400 hover:text-white font-semibold underline underline-offset-4 cursor-pointer"
          >
            {settings.language === 'vi' ? 'Trải nghiệm nhanh (Chế độ Khách)' : 'Use without account (Guest Mode)'}
          </button>
        </div>

      </div>
    </div>
  );
};
