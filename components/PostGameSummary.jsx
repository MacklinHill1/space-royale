'use client';

import { useState, useEffect } from 'react';

const RARITY_COLORS = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

export default function PostGameSummary({ summary, onContinue }) {
  const [revealedItems, setRevealedItems] = useState([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Animate stats reveal
    setTimeout(() => setShowStats(true), 300);

    // Animate items reveal one by one
    if (summary.items && summary.items.length > 0) {
      summary.items.forEach((item, index) => {
        setTimeout(() => {
          setRevealedItems(prev => [...prev, item]);
        }, 1000 + index * 400);
      });
    }
  }, [summary]);

  if (!summary) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg max-w-2xl w-full p-8">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Mission Complete
        </h2>

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-2 gap-6 mb-8 transition-all duration-500 ${
            showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-400">
              {summary.xpGained?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-400">XP Gained</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🪙</div>
            <div className="text-2xl font-bold text-yellow-400">
              {summary.coinsEarned?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-400">Coins Earned</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">💀</div>
            <div className="text-2xl font-bold text-red-400">
              {summary.kills?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-400">Enemies Defeated</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🌊</div>
            <div className="text-2xl font-bold text-blue-400">
              {summary.wave || 0}
            </div>
            <div className="text-sm text-gray-400">Waves Survived</div>
          </div>
        </div>

        {/* Items Obtained */}
        {summary.items && summary.items.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Items Obtained
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {revealedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border-2 border-gray-700 p-4 rounded-lg text-center animate-bounce-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl mb-2">{item.icon || '📦'}</div>
                  <div className={`text-sm font-bold ${RARITY_COLORS[item.rarity] || 'text-white'}`}>
                    {item.name}
                  </div>
                  {item.type && (
                    <div className="text-xs text-gray-500 mt-1 capitalize">
                      {item.type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chests Obtained */}
        {summary.chests && summary.chests.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Chests Obtained
            </h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {summary.chests.map((chest, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border-2 border-yellow-600 p-4 rounded-lg text-center"
                >
                  <div className="text-4xl mb-2">{chest.icon || '📦'}</div>
                  <div className="text-sm font-bold text-yellow-400">
                    {chest.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-colors"
        >
          Continue to Hangar
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-20px);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
