import React from 'react';
import { GameState, Position } from '../types';
import { LOGO_URL, THEME } from '../constants';

interface OverlayProps {
  gameState: GameState;
  score: number;
  lives: number;
  startGame: () => void;
  aiMessage: string;
  isThinking: boolean;
}

const Overlay: React.FC<OverlayProps> = ({ gameState, score, lives, startGame, aiMessage, isThinking }) => {
  if (gameState === GameState.PLAYING) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 backdrop-blur-sm rounded-lg">
      <img src={LOGO_URL} alt="Mercuries Life" className="w-48 mb-8 animate-pulse" />
      
      {gameState === GameState.MENU && (
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">
            保衛未來大作戰
          </h1>
          <p className="text-gray-300 mb-8 text-lg">Breakout: Insurance Edition</p>
          
          <div className="flex flex-col gap-4 items-center">
             <div className="text-gray-400 text-sm mb-4">
                <p>📄 Catch Contracts for Points</p>
                <p>❤️ Catch Hearts for Lives</p>
             </div>
             <button 
                onClick={startGame}
                className="px-8 py-4 bg-[#E3001B] hover:bg-red-700 text-white text-xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all"
             >
                開始遊戲 (START)
             </button>
          </div>
        </div>
      )}

      {(gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
        <div className="text-center p-8 bg-gray-900 border-2 border-red-600 rounded-xl shadow-2xl max-w-md mx-4">
            <h2 className={`text-5xl font-bold mb-4 ${gameState === GameState.VICTORY ? 'text-yellow-400' : 'text-gray-400'}`}>
                {gameState === GameState.VICTORY ? 'MISSION COMPLETE!' : 'GAME OVER'}
            </h2>
            
            <div className="text-2xl text-white mb-6">
                Final Score: <span className="text-[#E3001B] font-mono font-bold">{score}</span>
            </div>

            {/* AI Coach Section */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700 min-h-[80px] flex items-center justify-center">
                {isThinking ? (
                    <div className="flex items-center space-x-2 text-gray-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-150"></div>
                        <span>AI 教練分析中...</span>
                    </div>
                ) : (
                    <p className="text-gray-200 italic text-lg">"{aiMessage}"</p>
                )}
            </div>

            <button 
                onClick={startGame}
                className="px-8 py-3 bg-white text-[#E3001B] hover:bg-gray-100 font-bold rounded-full shadow-md transition-colors"
            >
                再玩一次 (Play Again)
            </button>
        </div>
      )}
    </div>
  );
};

export default Overlay;
