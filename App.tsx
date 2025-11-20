import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Overlay from './components/Overlay';
import { GameState } from './types';
import { getGameCommentary } from './services/geminiService';
import { INSURANCE_TIPS, THEME } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [autoMode, setAutoMode] = useState(false);
  
  // AI Feedback State
  const [aiMessage, setAiMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleGameOver = async (finalScore: number, win: boolean) => {
    setGameState(win ? GameState.VICTORY : GameState.GAME_OVER);
    
    // Trigger AI Feedback
    setIsThinking(true);
    const result = win ? 'WIN' : 'LOSS';
    const message = await getGameCommentary(finalScore, result);
    setAiMessage(message);
    setIsThinking(false);
  };

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setAiMessage("");
  };

  // Random tip rotation for the ticker
  const [tickerTip, setTickerTip] = useState(INSURANCE_TIPS[0]);
  useEffect(() => {
    const interval = setInterval(() => {
        setTickerTip(INSURANCE_TIPS[Math.floor(Math.random() * INSURANCE_TIPS.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-900 p-2 select-none">
      
      {/* Header / HUD */}
      <div className="w-full max-w-[800px] flex justify-between items-center bg-zinc-800 p-4 rounded-t-xl border-b-4 border-[#E3001B] shadow-lg z-20">
        <div className="flex flex-col">
            <span className="text-xs text-gray-400">SCORE</span>
            <span className="text-2xl font-mono font-bold text-white">{score.toString().padStart(5, '0')}</span>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Auto Toggle */}
            <button 
                onClick={() => setAutoMode(!autoMode)}
                className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                    autoMode 
                    ? 'bg-[#E3001B] text-white border-[#E3001B] animate-pulse' 
                    : 'bg-transparent text-gray-500 border-gray-600 hover:border-gray-400'
                }`}
            >
                {autoMode ? '🤖 AUTO PILOT ON' : '🤖 ENABLE AUTO'}
            </button>
        </div>

        <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">LIVES</span>
            <div className="flex text-xl text-[#E3001B]">
                {'❤️'.repeat(lives)}
            </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative w-full max-w-[800px] aspect-[4/3] md:aspect-auto md:h-[600px]">
        <Overlay 
            gameState={gameState} 
            score={score} 
            lives={lives} 
            startGame={startGame}
            aiMessage={aiMessage}
            isThinking={isThinking}
        />
        <GameCanvas 
            gameState={gameState}
            setGameState={setGameState}
            score={score}
            setScore={setScore}
            lives={lives}
            setLives={setLives}
            autoMode={autoMode}
            onGameOver={handleGameOver}
        />
      </div>

      {/* Footer Ticker */}
      <div className="w-full max-w-[800px] bg-[#E3001B] text-white py-2 px-4 rounded-b-xl text-center text-sm font-medium shadow-lg">
        📣 {tickerTip}
      </div>

      <div className="mt-4 text-gray-600 text-xs">
        Powered by React, Tailwind & Google Gemini • Mercuries Life Insurance Concept
      </div>
    </div>
  );
};

export default App;
