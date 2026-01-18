
import React, { useState, useEffect, useRef } from 'react';

interface GameProps {
  onReward: (amount: number) => void;
  baseReward: number;
}

const TimerBar: React.FC<{ current: number; total: number; color: string }> = ({ current, total, color }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
      <div 
        className={`h-full transition-all duration-1000 ease-linear ${color}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const GemMatcher: React.FC<GameProps> = ({ onReward, baseReward }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hits, setHits] = useState<{ id: number; x: number; y: number }[]>([]);
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setScore(0);
    setTimeLeft(20);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsFinished(true);
      const bonus = Math.floor(score / 5);
      onReward(baseReward + bonus);
    }
  }, [timeLeft, isPlaying, score, baseReward]);

  const handleGemClick = (e: React.MouseEvent) => {
    if (isPlaying) {
      setScore(s => s + 1);
      const newHit = { id: Date.now(), x: e.clientX, y: e.clientY };
      setHits(prev => [...prev, newHit]);
      setTimeout(() => setHits(prev => prev.filter(h => h.id !== newHit.id)), 400);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-[2.5rem] border border-blue-500/30 text-center flex flex-col h-full relative overflow-hidden group">
      <h3 className="text-xl font-black text-blue-400 mb-2 tracking-tight">Gem Matcher</h3>
      
      {!isPlaying && !isFinished && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center text-5xl animate-bounce">💎</div>
          <p className="text-xs text-gray-400 max-w-[200px]">Click the gems fast! You have 20 seconds to earn bonus coins.</p>
          <button onClick={startGame} className="bg-blue-600 px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/30 text-sm">
            START EARNING
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <span className="text-yellow-500 font-black text-lg">SCORE: {score}</span>
            <span className="text-blue-400 font-mono font-bold">{timeLeft}s</span>
          </div>
          <TimerBar current={timeLeft} total={20} color="bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          
          <div className="grid grid-cols-4 gap-2 flex-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <button 
                key={i} 
                onClick={handleGemClick}
                className="aspect-square rounded-2xl bg-white/5 hover:bg-blue-500/30 active:bg-blue-400 active:scale-90 transition-all flex items-center justify-center text-2xl border border-white/5"
              >
                💎
              </button>
            ))}
          </div>
        </div>
      )}

      {isFinished && (
        <div className="space-y-6 flex-1 flex flex-col justify-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-5xl mx-auto border-2 border-green-500/30">🏆</div>
          <h4 className="text-2xl font-black text-green-400">SESSION COMPLETE!</h4>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <p className="text-gray-400 text-sm mb-1 uppercase font-bold tracking-widest">Rewards Claimed</p>
            <p className="text-yellow-400 font-black text-3xl">+{baseReward + Math.floor(score/5)} Coins</p>
          </div>
          <button onClick={startGame} className="text-blue-400 hover:text-white transition font-black text-sm uppercase tracking-widest">
            Play Again
          </button>
        </div>
      )}

      {hits.map(hit => (
        <div key={hit.id} className="hit-effect" style={{ left: hit.x, top: hit.y, position: 'fixed' }}>
          +1
        </div>
      ))}
    </div>
  );
};

export const SpeedClicker: React.FC<GameProps> = ({ onReward, baseReward }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);
  const [hits, setHits] = useState<{ id: number; x: number; y: number }[]>([]);
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setScore(0);
    setTimeLeft(15);
    moveTarget();
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const moveTarget = () => {
    const t = Math.random() * 70 + 15;
    const l = Math.random() * 70 + 15;
    setTargetPos({ top: `${t}%`, left: `${l}%` });
  };

  const handleHit = (e: React.MouseEvent) => {
    if (isPlaying) {
      setScore(s => s + 1);
      const newHit = { id: Date.now(), x: e.clientX, y: e.clientY };
      setHits(prev => [...prev, newHit]);
      setTimeout(() => setHits(prev => prev.filter(h => h.id !== newHit.id)), 400);
      moveTarget();
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsFinished(true);
      onReward(baseReward + (score * 2));
    }
  }, [timeLeft, isPlaying, score, baseReward]);

  return (
    <div className="glass-panel p-6 rounded-[2.5rem] border border-purple-500/30 text-center flex flex-col h-full relative overflow-hidden min-h-[400px]">
      <h3 className="text-xl font-black text-purple-400 mb-2 tracking-tight">Speed Clicker</h3>

      {!isPlaying && !isFinished && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-purple-500/20 rounded-3xl flex items-center justify-center text-5xl animate-pulse">🎯</div>
          <p className="text-xs text-gray-400 max-w-[200px]">How many times can you hit the target in 15 seconds?</p>
          <button onClick={startGame} className="bg-purple-600 px-10 py-4 rounded-2xl font-black hover:bg-purple-700 transition active:scale-95 shadow-lg shadow-purple-500/30 text-sm">
            START CHALLENGE
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="flex-1 w-full relative flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <span className="text-yellow-500 font-black text-lg">HITS: {score}</span>
            <span className="text-purple-400 font-mono font-bold">{timeLeft}s</span>
          </div>
          <TimerBar current={timeLeft} total={15} color="bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          
          <div className="flex-1 w-full relative">
            <button 
              onClick={handleHit}
              style={{ top: targetPos.top, left: targetPos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-700 rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-75 transition-all z-20 border-4 border-white/20"
            >
              🎯
            </button>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="space-y-6 flex-1 flex flex-col justify-center animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-5xl mx-auto border-2 border-green-500/30">🔥</div>
          <h4 className="text-2xl font-black text-green-400">GREAT WORK!</h4>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <p className="text-gray-400 text-sm mb-1 uppercase font-bold tracking-widest">Total Reward</p>
            <p className="text-yellow-400 font-black text-3xl">+{baseReward + (score * 2)} Coins</p>
          </div>
          <button onClick={startGame} className="text-purple-400 hover:text-white transition font-black text-sm uppercase tracking-widest">
            Play Again
          </button>
        </div>
      )}

      {hits.map(hit => (
        <div key={hit.id} className="hit-effect" style={{ left: hit.x, top: hit.y, position: 'fixed' }}>
          HIT!
        </div>
      ))}
    </div>
  );
};
