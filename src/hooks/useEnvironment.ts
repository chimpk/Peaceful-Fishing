
import { useState, useEffect } from 'react';
import { LocationType, TimeOfDay } from '../types';

export const useEnvironment = (isDataLoaded: boolean, addNotification: (msg: string, type?: any) => void) => {
  const [currentLocation, setCurrentLocation] = useState<LocationType>('POND');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY');
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'stormy' | 'foggy'>('sunny');
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
    const weatherOptions: ('sunny' | 'rainy' | 'stormy' | 'foggy')[] = ['sunny', 'sunny', 'sunny', 'rainy', 'stormy', 'foggy'];
    const weatherNames = { sunny: '☀️ Trời Nắng', rainy: '🌧️ Trời Mưa', stormy: '⛈️ Bão Lớn', foggy: '🌫️ Sương Mù' };
    
    const nextInterval = 180000 + Math.random() * 120000;
    const timer = setTimeout(() => {
      const next = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      if (next !== weather) {
        setWeather(next);
        addNotification(`Thời tiết thay đổi: ${weatherNames[next]}`, 'info');
      }
      setWeatherVersion(v => v + 1);
    }, nextInterval);
    return () => clearTimeout(timer);
  }, [weatherVersion, isDataLoaded, weather, addNotification]);

  return {
    currentLocation, setCurrentLocation,
    timeOfDay, setTimeOfDay,
    weather, setWeather
  };
};
