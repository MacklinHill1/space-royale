'use client';

import { useRef, useEffect, useState } from 'react';
import { GameEngine, AudioEngine } from './game/GameEngine';
import { useGameState } from '../../hooks/useGameState';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import InventoryUI from '../../components/InventoryUI';
import PostGameSummary from '../../components/PostGameSummary';

export default function Home() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const audioRef = useRef(null);
  const { 
    gamePhase, 
    levelUp, 
    shopOpen, 
    postGameSummary,
    inventory,
    inventoryActions,
    startGame, 
    endGame, 
    returnToMenu, 
    handleStateChange,
    handleSummaryContinue,
  } = useGameState();
  const { isMobile } = useMobileDetect();
  const [showControls, setShowControls] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!audioRef.current) audioRef.current = new AudioEngine();
    
    const canvas = canvasRef.current;
    const engine = new GameEngine(canvas, handleStateChange, audioRef.current, inventoryActions);
    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [handleStateChange, inventoryActions]);

  useEffect(() => {
    if (gamePhase === 'summary' && postGameSummary) {
      // Post-game summary is shown
    }
  }, [gamePhase, postGameSummary]);

  const handleStart = () => {
    startGame();
    if (engineRef.current) {
      engineRef.current.start(isMobile);
    }
  };

  const handleOpenChest = (chestItem) => {
    const rewards = inventoryActions.openChest(chestItem);
    if (rewards) {
      // Show rewards notification (could be a toast or modal)
      console.log('Chest opened:', rewards);
      // TODO: Add visual feedback for rewards
    }
  };

  const handleUseBoost = (boostItem) => {
    if (engineRef.current?.player) {
      const boost = inventoryActions.useBoost(boostItem, engineRef.current.player);
      if (boost) {
        console.log('Boost activated:', boost);
        // TODO: Add visual feedback
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full"
      />

      {gamePhase === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-8 text-white">Space Rocket Royale</h1>
            <div className="flex gap-4 justify-center mb-4">
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Start Game
              </button>
              <button
                onClick={() => setShowControls(!showControls)}
                className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Controls
              </button>
            </div>
            <button
              onClick={() => setShowInventory(true)}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-lg transition-colors"
            >
              📦 Inventory ({inventoryActions.getTotalCount()})
            </button>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-white">Controls</h2>
            <div className="space-y-2 text-white">
              <p><strong>WASD / Arrow Keys:</strong> Move</p>
              <p><strong>Mouse:</strong> Aim</p>
              <p><strong>Left Click:</strong> Shoot</p>
              <p><strong>Space:</strong> Dash</p>
              <p><strong>E:</strong> Use Ability</p>
            </div>
            <button
              onClick={() => setShowControls(false)}
              className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {gamePhase === 'summary' && postGameSummary && (
        <PostGameSummary
          summary={postGameSummary}
          onContinue={handleSummaryContinue}
        />
      )}

      {gamePhase === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 text-red-500">Game Over</h2>
            <button
              onClick={returnToMenu}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors"
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {showInventory && (
        <InventoryUI
          inventory={inventory}
          onOpenChest={handleOpenChest}
          onUseBoost={handleUseBoost}
          onClose={() => setShowInventory(false)}
        />
      )}
    </div>
  );
}
