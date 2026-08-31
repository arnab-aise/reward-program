import { create } from 'zustand';

const initialState = {
  currentLevel: 0, // Highest unlocked level (0 to 4)
  stageStars: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
  coins: 150,
  energy: 5,
  activeStageModal: null, // The level index currently being viewed/played
  unlockedRewards: [],
  financialHealthScore: 100,
  hasCompletedOnboarding: false,
  playerState: 'idle', // 'idle' | 'walk' | 'jump' | 'celebrate'
  sherpaMessage: "Welcome, traveler. Tap a glowing stage node to begin your ascent.",
  inventory: ['budget_planner'], // tools player has collected
};

export const useGameStore = create((set) => ({
  ...initialState,

  addTool: (toolId) => set((state) => ({ inventory: [...new Set([...state.inventory, toolId])] })),

  setSherpaMessage: (msg) => set({ sherpaMessage: msg }),

  setPlayerState: (state) => set({ playerState: state }),

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  openStageModal: (level) => set({ activeStageModal: level }),
  
  closeStageModal: () => set({ activeStageModal: null }),

  completeStage: (level, starsEarned, coinReward) => set((state) => {
    const currentStars = state.stageStars[level] || 0;
    const bestStars = Math.max(currentStars, starsEarned);
    
    // Unlock next level if this is the highest level and we got at least 1 star
    const nextLevel = (level === state.currentLevel && starsEarned > 0 && level < 4) 
      ? state.currentLevel + 1 
      : state.currentLevel;

    return {
      stageStars: { ...state.stageStars, [level]: bestStars },
      currentLevel: nextLevel,
      coins: state.coins + coinReward,
      energy: Math.max(0, state.energy - 1),
      activeStageModal: null // Close modal on complete
    };
  }),

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  
  unlockReward: (rewardId) => set((state) => ({ 
    unlockedRewards: [...new Set([...state.unlockedRewards, rewardId])] 
  })),

  resetGame: () => set(initialState),
}));
