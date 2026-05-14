
import { useState, useEffect, useCallback } from 'react';
import { GameState, UIView } from '../types';

export const useCompetition = (gameState: GameState, setGameState: (s: GameState) => void, setActiveView: (v: UIView) => void, addNotification: (msg: string, type?: any) => void) => {
  const [competitionMode, setCompetitionMode] = useState<boolean>(false);
  const [competitionTimeLeft, setCompetitionTimeLeft] = useState<number>(180); 
  const [competitionScore, setCompetitionScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<{ score: number; date: string }[]>([]);
  const [sessionFishCount, setSessionFishCount] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (competitionMode && competitionTimeLeft > 0 && gameState !== GameState.BOSS_FIGHT) {
      timer = setInterval(() => {
        setCompetitionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCompetitionMode(false);
            setGameState(GameState.START);
            setActiveView(UIView.RESULTS);
            
            setCompetitionScore(finalScore => {
               setLeaderboard(prevLb => {
                 const newEntry = { score: finalScore, date: new Date().toLocaleDateString('vi-VN') };
                 return [...prevLb, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
               });
               return finalScore;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [competitionMode, competitionTimeLeft, gameState, setGameState, setActiveView]);

  const startCompetition = useCallback(() => {
    setCompetitionMode(true);
    setCompetitionTimeLeft(180);
    setCompetitionScore(0);
    setSessionFishCount(0);
    setGameState(GameState.IDLE);
    setActiveView(UIView.GAME);
    addNotification("CHẾ ĐỘ THI ĐẤU BẮT ĐẦU! Cố gắng kiếm nhiều vàng nhất trong 3 phút!", 'info');
  }, [setGameState, setActiveView, addNotification]);

  return {
    competitionMode, setCompetitionMode,
    competitionTimeLeft, setCompetitionTimeLeft,
    competitionScore, setCompetitionScore,
    leaderboard, setLeaderboard,
    sessionFishCount, setSessionFishCount,
    startCompetition
  };
};
