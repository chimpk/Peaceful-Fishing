
import React from 'react';

export const BubblesBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/10 blur-[1px] animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-20px`,
            width: `${Math.random() * 15 + 5}px`,
            height: `${Math.random() * 15 + 5}px`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.1
          }}
        />
      ))}
    </div>
  );
};
