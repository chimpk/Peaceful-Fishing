
import React from 'react';
import { PlayerSkills } from '../../../core/types';

interface SkillsTabProps {
  skills: PlayerSkills;
  onBuySkill: (skillId: keyof PlayerSkills) => void;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ skills, onBuySkill }) => {
  const skillDefs = [
    { id: 'sharpEye', name: 'MẮT TINH ANH', icon: '👁️', desc: 'Mở rộng đáng kể vùng an toàn khi kéo cá' },
    { id: 'fastHands', name: 'TAY NHANH NHẸN', icon: '⚡', desc: 'Tăng tốc độ thu dây và phản ứng cần' },
    { id: 'lucky', name: 'VẬN MAY ĐẠI DƯƠNG', icon: '🍀', desc: 'Tăng tỷ lệ gặp các loài cá quý hiếm' }
  ];

  return (
    <div className="p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
       {skillDefs.map(s => {
          const currentLevel = skills[s.id as keyof PlayerSkills];
          const cost = (currentLevel + 1) * 2000;
          return (
             <div key={s.id} className="relative bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 flex items-center gap-8 group hover:border-blue-500/30 transition-all shadow-2xl overflow-hidden">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-4xl shrink-0 group-hover:scale-110 transition-transform shadow-inner animate-float">{s.icon}</div>
                <div className="flex-1 relative z-10">
                   <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black text-xl italic tracking-tight">{s.name}</h4>
                      <span className="text-[10px] bg-blue-900/60 text-blue-400 px-4 py-1.5 rounded-full font-black border border-blue-500/20 tracking-widest">CẤP {currentLevel}</span>
                   </div>
                   <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">{s.desc}</p>
                   <button onClick={() => onBuySkill(s.id as keyof PlayerSkills)} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-yellow-400 active:scale-95 transition-all shadow-lg">
                      NÂNG CẤP ({cost.toLocaleString()} 💰)
                   </button>
                </div>
             </div>
          )
       })}
    </div>
  );
};

export default SkillsTab;
