
import { useState, useEffect } from 'react';
import { LocationType, TimeOfDay, WeatherType } from '../types';

export const useEnvironment = (isDataLoaded: boolean, addNotification: (msg: string, type?: any) => void) => {
  const [currentLocation, setCurrentLocation] = useState<LocationType>('POND');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY');
  const [weatherPerLocation, setWeatherPerLocation] = useState<Record<LocationType, WeatherType>>({
    POND: 'sunny',
    OCEAN: 'sunny',
    CAVE: 'sunny'
  });
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

    // Define context-aware weather options (including special weathers)
    type WeatherOption = 'sunny' | 'rainy' | 'stormy' | 'foggy' | 'deep_sea_current' | 'crystal_resonance' | 'meteor_shower' | 'rainbow' | 'aurora' | 'falling_stalactite';
    let weatherOptions: WeatherOption[] = ['sunny', 'sunny', 'sunny', 'rainy', 'stormy', 'foggy'];
    
    // Add location-specific special weather
    if (currentLocation === 'OCEAN') {
      weatherOptions.push('deep_sea_current');
      if (timeOfDay === 'DAY') weatherOptions.push('rainbow');
      if (timeOfDay === 'NIGHT') weatherOptions.push('meteor_shower');
      weatherOptions.push('aurora');
    } else if (currentLocation === 'CAVE') {
      weatherOptions = ['sunny', 'sunny', 'foggy', 'foggy', 'crystal_resonance', 'falling_stalactite'];
    } else {
      if (timeOfDay === 'NIGHT') weatherOptions.push('meteor_shower');
      if (timeOfDay === 'DAY') weatherOptions.push('rainbow');
    }

    const getWeatherName = (w: string) => {
      if (currentLocation === 'CAVE') {
        if (w === 'sunny') return '💎 Khô Ráo';
        if (w === 'foggy') return '🌫️ Hơi Nước';
        if (w === 'crystal_resonance') return '✨ Cộng Hưởng Tinh Thể';
        if (w === 'falling_stalactite') return '🏔️ Thạch Nhũ Rơi';
        return '💧 Ẩm Ướt';
      }
      if (timeOfDay === 'NIGHT') {
        if (w === 'sunny') return '🌙 Trời Quang';
        if (w === 'rainy') return '🌧️ Mưa Đêm';
        if (w === 'stormy') return '⛈️ Bão Đêm';
        if (w === 'deep_sea_current') return '🌊 Hải Lưu Ngầm';
        if (w === 'meteor_shower') return '🌠 Mưa Sao Băng';
        if (w === 'aurora') return '🌌 Cực Quang Huyền Bí';
        return '🌫️ Sương Mù';
      }
      const names: Record<string, string> = { 
        sunny: '☀️ Trời Nắng', 
        rainy: '🌧️ Trời Mưa', 
        stormy: '⛈️ Bão Lớn', 
        foggy: '🌫️ Sương Mù',
        deep_sea_current: '🌊 Dòng Hải Lưu',
        crystal_resonance: '✨ Cộng Hưởng Tinh Thể',
        meteor_shower: '🌠 Mưa Sao Băng',
        rainbow: '🌈 Cầu Vồng May Mắn',
        aurora: '🌌 Cực Quang'
      };
      return names[w] || w;
    };
    
    const nextInterval = 180000 + Math.random() * 120000;
    const timer = setTimeout(() => {
      const next = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      const currentLocWeather = weatherPerLocation[currentLocation];
      if (next !== currentLocWeather) {
        setWeatherPerLocation(prev => ({ ...prev, [currentLocation]: next }));
        addNotification(`Thời tiết ${currentLocation === 'POND' ? 'Ao Làng' : currentLocation === 'OCEAN' ? 'Đại Dương' : 'Hang Tối'} thay đổi: ${getWeatherName(next)}`, 'info');
      }
      setWeatherVersion(v => v + 1);
    }, nextInterval);
    return () => clearTimeout(timer);
  }, [weatherVersion, isDataLoaded, weatherPerLocation, addNotification, currentLocation, timeOfDay]);

  return {
    currentLocation, setCurrentLocation,
    timeOfDay, setTimeOfDay,
    weather: weatherPerLocation[currentLocation]
  };
};
