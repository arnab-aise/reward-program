import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAudio } from '../hooks/useAudio';
import gsap from 'gsap';

export const SherpaShopModal = () => {
  const { coins, inventory, buyGear, showShop, setShowShop } = useGameStore();
  const { playSFX } = useAudio();
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (showShop) {
      playSFX('chime');
      gsap.fromTo(overlayRef.current, 
        { backgroundColor: 'rgba(0,0,0,0)' },
        { backgroundColor: 'rgba(15,23,42,0.8)', duration: 0.5 }
      );
      gsap.fromTo(contentRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }
      );
    }
  }, [showShop, playSFX]);

  if (!showShop) return null;

  const handleClose = () => {
    playSFX('thud');
    gsap.to(contentRef.current, { scale: 0.9, opacity: 0, duration: 0.3 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => setShowShop(false) });
  };

  const shopItems = [
    {
      id: 'grip_boots',
      name: 'Grip Boots',
      description: 'Reduces Energy cost of steep, high-altitude paths.',
      cost: 30,
      icon: '🥾'
    },
    {
      id: 'reinforced_tent',
      name: 'Reinforced Tent',
      description: 'Provides safe shelter, restoring +1 Energy upon completing any stage.',
      cost: 50,
      icon: '⛺'
    },
    {
      id: 'golden_backpack',
      name: 'Golden Backpack',
      description: 'Increases all future coin rewards by +20%.',
      cost: 75,
      icon: '🎒'
    },
    {
      id: 'emergency_dynamite',
      name: 'Emergency Dynamite',
      description: 'True Harbor Emergency Fund: Clears unexpected financial roadblocks.',
      cost: 80,
      icon: '🧨'
    },
    {
      id: 'investment_pickaxe',
      name: 'Investment Pickaxe',
      description: 'True Harbor Investment Account: Required to scale the vertical cliff of wealth.',
      cost: 150,
      icon: '⛏️'
    }
  ];

  const handleBuy = (item) => {
    if (coins >= item.cost && !inventory.includes(item.id)) {
      playSFX('coin');
      buyGear(item.id, item.cost);
    } else {
      playSFX('error');
    }
  };

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div 
        ref={contentRef}
        className="shop-modal-container"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="shop-header-title">Sherpa Shop</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#cbd5e1' }}>Invest your coins into valuable assets.</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🪙</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{coins}</span>
          </div>
        </div>

        <div className="shop-items-list">
          {shopItems.map(item => {
            const isOwned = inventory.includes(item.id);
            const canAfford = coins >= item.cost;
            
            return (
              <div 
                key={item.id}
                className="shop-item"
                style={{
                  background: isOwned ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                  border: isOwned ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="shop-item-icon" style={{ fontSize: '2.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '12px' }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: isOwned ? '#4ade80' : '#f8fafc' }}>
                    {item.name} {isOwned && '✓'}
                  </h3>
                  <p style={{ margin: 0, color: '#94a3b8', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                </div>
                <div>
                  {isOwned ? (
                    <button disabled style={{ background: 'transparent', border: 'none', color: '#4ade80', fontWeight: 'bold', padding: '0.5rem 1rem' }}>Owned</button>
                  ) : (
                    <button 
                      onClick={() => handleBuy(item)}
                      style={{
                        background: canAfford ? 'linear-gradient(to right, #eab308, #ca8a04)' : '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        color: canAfford ? 'white' : '#94a3b8',
                        fontWeight: 'bold',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      🪙 {item.cost}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          className="vn-continue-btn"
          onClick={handleClose}
          style={{ width: '100%', alignSelf: 'center', marginTop: '10px' }}
        >
          Leave Shop
        </button>
      </div>
    </div>
  );
};
