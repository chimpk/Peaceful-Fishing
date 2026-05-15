
import { useState, useEffect } from 'react';
import { LocationType, TimeOfDay, WeatherType } from '../types';

export const useEnvironment = (isDataLoaded: boolean, addNotification: (msg: string, type?: any) => void) => {
  const [currentLocation, setCurrentLocation] = useState<LocationType>('POND');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY');
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [weatherVersion, setWeatherVersion] = useState(0);

  // --- TIME OF DAY CYCLE ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(prev => {
        if (prev === 'DAY') return 'SUNSET';
        if (prev === 'SUNSET') return 'NIGHT';
        return 'DAY';
      });
    }, 90000); 
    return () => clearInterval(interval);
  }, []);

  // --- DYNAMIC WEATHER CYCLE ---
  useEffect(() => {
    if (!isDataLoaded) return;

    // Define context-aware weather options
    let weatherOptions: ('sunny' | 'rainy' | 'stormy' | 'foggy' | 'deep_sea_current' | 'crystal_resonance')[] = ['sunny', 'sunny', 'sunny', 'rainy', 'stormy', 'foggy'];
    
    // Add location-specific special weather
    if (currentLocation === 'OCEAN') {
      weatherOptions.push('deep_sea_current');
    } else if (currentLocation === 'CAVE') {
      weatherOptions = ['sunny', 'sunny', 'foggy', 'foggy', 'crystal_resonance']; 
    }

    const getWeatherName = (w: string) => {
      if (currentLocation === 'CAVE') {
        if (w === 'sunny') return '💎 Khô Ráo';
        if (w === 'foggy') return '🌫️ Hơi Nước';
        if (w === 'crystal_resonance') return '✨ Cộng Hưởng Tinh Thể';
        return '💧 Ẩm Ướt';
      }
      if (timeOfDay === 'NIGHT') {
        if (w === 'sunny') return '🌙 Trời Quang';
        if (w === 'rainy') return '🌧️ Mưa Đêm';
        if (w === 'stormy') return '⛈️ Bão Đêm';
        if (w === 'deep_sea_current') return '🌊 Hải Lưu Ngầm';
        return '🌫️ Sương Mù';
      }
      const names: Record<string, string> = { 
        sunny: '☀️ Trời Nắng', 
        rainy: '🌧️ Trời Mưa', 
        stormy: '⛈️ Bão Lớn', 
        foggy: '🌫️ Sương Mù',
        deep_sea_current: '🌊 Dòng Hải Lưu',
        crystal_resonance: '✨ Cộng Hưởng Tinh Thể'
      };
      return names[w] || w;
    };
    
    const nextInterval = 180000 + Math.random() * 120000;
    const timer = setTimeout(() => {
      const next = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      if (next !== weather) {
        setWeather(next);
        addNotification(`Thời tiết thay đổi: ${getWeatherName(next)}`, 'info');
      }
      setWeatherVersion(v => v + 1);
    }, nextInterval);
    return () => clearTimeout(timer);
  }, [weatherVersion, isDataLoaded, weather, addNotification, currentLocation, timeOfDay]);

  return {
    currentLocation, setCurrentLocation,
    timeOfDay, setTimeOfDay,
    weather, setWeather
  };
};
