'use client';

import { useState } from 'react';
import { INVENTORY_CATEGORIES, CHEST_DEFINITIONS, BOOST_DEFINITIONS } from '../systems/InventorySystem';

const RARITY_COLORS = {
  common: 'text-gray-400 border-gray-500',
  rare: 'text-blue-400 border-blue-500',
  epic: 'text-purple-400 border-purple-500',
  legendary: 'text-yellow-400 border-yellow-500',
};

export default function InventoryUI({ inventory, onOpenChest, onUseBoost, onClose }) {
  const [activeTab, setActiveTab] = useState(INVENTORY_CATEGORIES.CHESTS);
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = [
    { id: INVENTORY_CATEGORIES.CHESTS, label: 'Chests', icon: '📦' },
    { id: INVENTORY_CATEGORIES.BOOSTS, label: 'Boosts', icon: '⚡' },
    { id: INVENTORY_CATEGORIES.CONSUMABLES, label: 'Items', icon: '🎒' },
  ];

  const renderChestItem = (item) => {
    const def = CHEST_DEFINITIONS[item.type];
    if (!def) return null;

    return (
      <div
        key={item.id}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
          RARITY_COLORS[def.rarity]
        } ${selectedItem?.id === item.id ? 'ring-2 ring-white' : ''}`}
        onClick={() => setSelectedItem(item)}
      >
        <div className="text-4xl mb-2 text-center">{def.icon}</div>
        <div className="text-sm font-bold text-center">{def.name}</div>
        <div className="text-xs text-gray-400 text-center mt-1">{def.description}</div>
      </div>
    );
  };

  const renderBoostItem = (item) => {
    const def = BOOST_DEFINITIONS[item.type];
    if (!def) return null;

    return (
      <div
        key={item.id}
        className={`p-4 border-2 border-green-500 rounded-lg cursor-pointer transition-all hover:scale-105 ${
          selectedItem?.id === item.id ? 'ring-2 ring-white' : ''
        }`}
        onClick={() => setSelectedItem(item)}
      >
        <div className="text-4xl mb-2 text-center">{def.icon}</div>
        <div className="text-sm font-bold text-center text-green-400">{def.name}</div>
        <div className="text-xs text-gray-400 text-center mt-1">{def.description}</div>
        <div className="text-xs text-yellow-400 text-center mt-1">
          Duration: {Math.floor(def.duration / 60)}m
        </div>
      </div>
    );
  };

  const renderItemGrid = () => {
    const items = inventory[activeTab] || [];

    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📭</div>
            <div>No items in this category</div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {items.map(item => {
          if (activeTab === INVENTORY_CATEGORIES.CHESTS) return renderChestItem(item);
          if (activeTab === INVENTORY_CATEGORIES.BOOSTS) return renderBoostItem(item);
          return null;
        })}
      </div>
    );
  };

  const handleUseItem = () => {
    if (!selectedItem) return;

    if (activeTab === INVENTORY_CATEGORIES.CHESTS) {
      onOpenChest?.(selectedItem);
    } else if (activeTab === INVENTORY_CATEGORIES.BOOSTS) {
      onUseBoost?.(selectedItem);
    }

    setSelectedItem(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl px-3"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedItem(null);
              }}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderItemGrid()}
        </div>

        {/* Action Bar */}
        {selectedItem && (
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <button
              onClick={handleUseItem}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              {activeTab === INVENTORY_CATEGORIES.CHESTS ? 'Open Chest' : 'Use Item'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
