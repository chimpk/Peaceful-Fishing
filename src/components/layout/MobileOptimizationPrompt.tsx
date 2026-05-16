
import React from 'react';
import { requestFullScreen, lockOrientation } from '../../utils/mobileUtils';

interface MobilePromptProps {
  onDismiss: () => void;
}

const MobileOptimizationPrompt: React.FC<MobilePromptProps> = ({ onDismiss }) => {
  const handleOptimize = async () => {
    await requestFullScreen(document.documentElement);
    await lockOrientation();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg className="w-10 h-10 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Tối Ưu Mobile</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Để có trải nghiệm tốt nhất, vui lòng chuyển sang chế độ <span className="text-cyan-400 font-semibold">Toàn màn hình</span> và <span className="text-cyan-400 font-semibold">Xoay ngang</span> thiết bị.
        </p>

        <button
          onClick={handleOptimize}
          className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-900/20 active:scale-95 transition-all mb-4"
        >
          BẮT ĐẦU TỐI ƯU
        </button>
        
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-white transition-colors text-sm font-medium"
        >
          Để sau
        </button>
      </div>

      {/* Portrait warning */}
      <div className="mt-12 md:hidden">
        <div className="flex items-center gap-3 text-amber-400 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm2 2h12v12H6V6z" />
          </svg>
          <span className="font-medium">Hãy xoay ngang điện thoại!</span>
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizationPrompt;
