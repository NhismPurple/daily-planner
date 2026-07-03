'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  conditionCode: number;
  conditionText: string;
  icon: string;
}

// Map WMO Weather Interpretation Codes (WW) to readable texts & icons
const getWeatherCondition = (code: number, isDark: boolean = false): { text: string; icon: string } => {
  if (code === 0) return { text: 'Trời quang', icon: '☀️' };
  if (code >= 1 && code <= 3) return { text: 'Ít mây', icon: '⛅' };
  if (code === 45 || code === 48) return { text: 'Có sương mù', icon: '🌫️' };
  if (code >= 51 && code <= 57) return { text: 'Mưa phùn', icon: '🌧️' };
  if (code >= 61 && code <= 67) return { text: 'Mưa rào', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { text: 'Tuyết rơi', icon: '❄️' };
  if (code >= 80 && code <= 82) return { text: 'Mưa rào nhẹ', icon: '🌧️' };
  if (code >= 85 && code <= 86) return { text: 'Mưa tuyết', icon: '🌨️' };
  if (code >= 95 && code <= 99) return { text: 'Có giông bão', icon: '⛈️' };
  return { text: 'Nắng ấm', icon: '☀️' };
};

export const useWeather = (lang: 'vi' | 'en' = 'vi') => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        if (!res.ok) throw new Error('Không thể lấy dữ liệu thời tiết');
        
        const data = await res.json();
        const current = data.current_weather;
        const condition = getWeatherCondition(current.weathercode);
        
        // Dịch nghĩa nếu là tiếng Anh
        let conditionText = condition.text;
        if (lang === 'en') {
          if (current.weathercode === 0) conditionText = 'Clear sky';
          else if (current.weathercode >= 1 && current.weathercode <= 3) conditionText = 'Partly cloudy';
          else if (current.weathercode === 45 || current.weathercode === 48) conditionText = 'Foggy';
          else if (current.weathercode >= 51 && current.weathercode <= 67) conditionText = 'Rainy';
          else if (current.weathercode >= 71 && current.weathercode <= 77) conditionText = 'Snowy';
          else if (current.weathercode >= 80 && current.weathercode <= 82) conditionText = 'Showers';
          else if (current.weathercode >= 95 && current.weathercode <= 99) conditionText = 'Thunderstorm';
          else conditionText = 'Sunny';
        }

        setWeather({
          temp: Math.round(current.temperature),
          conditionCode: current.weathercode,
          conditionText,
          icon: condition.icon
        });
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Lỗi thời tiết');
      } finally {
        setLoading(false);
      }
    };

    // Mặc định là Hà Nội (21.0285, 105.8542)
    const defaultLat = 21.0285;
    const defaultLng = 105.8542;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback sang Hà Nội nếu bị từ chối location
          fetchWeather(defaultLat, defaultLng);
        }
      );
    } else {
      fetchWeather(defaultLat, defaultLng);
    }
  }, [lang]);

  return { weather, loading, error };
};
