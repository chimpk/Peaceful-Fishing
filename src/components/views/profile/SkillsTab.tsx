
import React from 'react';
import { PlayerSkills } from '../../../types';
import { soundManager } from '../../../core/systems/soundManager';

interface SkillsTabProps {
  skills: PlayerSkills;
  buySkill: (skillId: keyof PlayerSkills) => void;
  playerLevel: number;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ skills, buySkill, playerLevel }) => {
  const skillDefs = [
    { id: 'sharpEye', name: 'MẮT TINH ANH', icon: '👁️', desc: 'Mở rộng đáng kể vùng an toàn khi kéo cá', req: 3 },
    { id: 'fastHands', name: 'TAY NHANH NHẸN', icon: '⚡', desc: 'Tăng tốc độ thu dây và phản ứng cần', req: 7 },
    { id: 'lucky', name: 'VẬN MAY ĐẠI DƯƠNG', icon: '🍀', desc: 'Tăng tỷ lệ gặp các loài cá quý hiếm', req: 12 },
    { id: 'focus', name: 'KỸ NĂNG: TẬP TRUNG (F)', icon: '🧘', desc: 'Nhấn F khi kéo cá để làm chậm tension trong 3 giây', req: 15, isSpecial: true },
    { id: 'powerReel', name: 'KỸ NĂNG: KÉO MẠNH (G)', icon: '🦾', desc: 'Nhấn G khi kéo cá để tăng tốc độ thu dây trong 2 giây', req: 20, isSpecial: true },
    { id: 'deepSeaDiver', name: 'THỢ LẶN HANG SÂU', icon: '🤿', desc: 'Tăng 25% vàng và kinh nghiệm khi câu cá trong Hang động', req: 25 },
    { id: 'weatherExpert', name: 'CHUYÊN GIA THỜI TIẾT', icon: '🌡️', desc: 'Giảm 50% các tác động tiêu cực của thời tiết xấu', req: 30 },
    { id: 'masterAngler', name: 'BẬC THẦY CÂU CÁ', icon: '🏆', desc: 'Tăng đáng kể tỷ lệ gặp cá Thần Thoại và Huyền Thoại', req: 40 }
  ];

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-300">
       {skillDefs.map(s => {
          const currentLevel = skills[s.id as keyof PlayerSkills];
          const cost = (currentLevel + 1) * 2000;
          const isSpecial = s.isSpecial;
          const isLocked = playerLevel < (s.req || 0);
          
          return (
             <div key={s.id} className={`relative glass-card p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 transition-all overflow-hidden ${isLocked ? 'opacity-40 grayscale' : 'group hover:border-blue-500/40'}`}>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl shrink-0 group-hover:rotate-6 transition-transform shadow-inner animate-float">{s.icon}</div>
                <div className="flex-1 w-full">
                   <div className="flex justify-between items-center mb-1 md:mb-2">
                      <h4 className="font-black text-lg md:text-xl italic tracking-tighter text-white drop-shadow-md">{s.name}</h4>
                      {!isSpecial && !isLocked && (
                         <span className="text-[8px] md:text-[9px] bg-blue-900/40 text-blue-300 px-2 md:px-3 py-1 rounded-full font-black border border-blue-500/20 tracking-widest uppercase">CẤP {currentLevel}</span>
                      )}
                   </div>
                   <p className="text-[10px] md:text-xs text-slate-400 mb-4 md:mb-6 font-medium leading-tight opacity-80">{s.desc}</p>
                   
                   {isLocked ? (
                      <div className="w-full py-2 md:py-3 bg-slate-950/40 text-slate-500 rounded-lg md:rounded-xl font-black text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] text-center border border-white/5 uppercase">
                         KHÓA ĐẾN CẤP {s.req} 🔒
                      </div>
                   ) : isSpecial && currentLevel > 0 ? (
                      <div className="w-full py-2 md:py-3 bg-blue-500/20 text-blue-300 rounded-lg md:rounded-xl font-black text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] text-center border border-blue-500/30 uppercase">
                         KỸ NĂNG ĐÃ BẬT ✨
                      </div>
                   ) : (
                      <button 
                        onClick={() => { soundManager.playClick(); buySkill(s.id as keyof PlayerSkills); }} 
                        className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] transition-all active:scale-95 shadow-xl uppercase ${isSpecial ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      >
                         {isSpecial ? 'KÍCH HOẠT' : `NÂNG CẤP (${cost.toLocaleString()} V)`}
                      </button>
                   )}
                </div>
             </div>
          )
       })}
    </div>
  );
};

export default SkillsTab;
