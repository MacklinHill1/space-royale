import { useState, useCallback } from 'react';
import { useInventory } from './useInventory';
import { INVENTORY_CATEGORIES, CHEST_TYPES } from '../systems/InventorySystem';

export function enemyStatScale(wave, sessionTime, playerLevel) {
  const waveScale  = 1 + (wave - 1) * 0.12;
  const timeScale  = 1 + Math.min(sessionTime / 600, 1) * 0.25;
  const levelScale = 1 + (playerLevel - 1) * 0.04;
  return waveScale * timeScale * levelScale;
}

export function useGameState(audio) {
  const inventoryHook = useInventory();
  const [gamePhase, setGamePhase] = useState('menu');
  const [postGameSummary, setPostGameSummary] = useState(null);
  const [levelUp, setLevelUp] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const startGame = useCallback(() => {
    setGamePhase('playing');
    setLevelUp(false);
    setShopOpen(false);
    setPostGameSummary(null);
  }, []);

  const endGame = useCallback((finalStats) => {
    // Generate post-game summary
    const summary = {
      xpGained: finalStats.xp || 0,
      coinsEarned: finalStats.gold || 0,
      kills: finalStats.kills || 0,
      wave: finalStats.wave || 0,
      items: finalStats.itemsObtained || [],
      chests: finalStats.chestsObtained || [],
    };
    
    setPostGameSummary(summary);
    setGamePhase('summary');
  }, []);

  const returnToMenu = useCallback(() => {
    setGamePhase('menu');
    setLevelUp(false);
    setShopOpen(false);
  }, []);

  const handleStateChange = useCallback((state) => {
    if (state.levelUp !== undefined) setLevelUp(state.levelUp);
    if (state.shopOpen !== undefined) setShopOpen(state.shopOpen);
    if (state.gameOver && state.finalStats) {
      endGame(state.finalStats);
    }
  }, [endGame]);

  const handleSummaryContinue = useCallback(() => {
    setGamePhase('menu');
    setPostGameSummary(null);
  }, []);

  return {
    gamePhase,
    levelUp,
    shopOpen,
    postGameSummary,
    inventory: inventoryHook.inventory,
    inventoryActions: inventoryHook,
    startGame,
    endGame,
    returnToMenu,
    handleStateChange,
    handleSummaryContinue,
  };
}
