import { create } from 'zustand';

const initialState = {
  employeeId: null, // Set from URL param
  financialData: null, // Derived metrics from dashboard-snapshot
  rawSnapshot: null, // The raw snapshot object
  isFinanceLoading: true,
  hasNoData: false,
  unlockedNodes: ['base_camp'],
  completedNodes: [],
  nodeStars: {},
  weatherState: 'sunrise', // 'sunrise', 'fog', 'storm'
  hasCollapsed: false,
  showShop: false,
  coins: 150,
  energy: 5,
  activeStageModal: null, // The node ID currently being viewed/played
  unlockedRewards: [],
  financialHealthScore: 100,
  hasCompletedOnboarding: false,
  playerState: 'idle', // 'idle' | 'walk' | 'jump' | 'celebrate'
  sherpaMessage: "Welcome, traveler. Tap a glowing stage node to begin your ascent.",
  inventory: ['financial_compass'], // tools player has collected
  budgetCreated: false,
  emergencyFundStatus: 0,
  debtStrategyChosen: null,
  savingsTarget: 0,
};

export const useGameStore = create((set) => ({
  ...initialState,

  addTool: (toolId) => set((state) => ({ inventory: [...new Set([...state.inventory, toolId])] })),

  setSherpaMessage: (msg) => set({ sherpaMessage: msg }),

  setEmployeeId: (id) => set({ employeeId: id }),

  setFinancialData: (metrics, snapshot) => set({ financialData: metrics, rawSnapshot: snapshot }),
  setFinanceStatus: (isLoading, hasNoData) => set({ isFinanceLoading: isLoading, hasNoData: hasNoData }),

  setPlayerState: (state) => set({ playerState: state }),

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  openStageModal: (nodeId) => set({ activeStageModal: nodeId }),
  
  closeStageModal: () => set({ activeStageModal: null }),

  completeNode: (nodeId, starsEarned, coinReward, nextNodesToUnlock = []) => set((state) => {
    const isCompleted = state.completedNodes.includes(nodeId);
    if (isCompleted) return state; 
    
    const hasBackpack = state.inventory.includes('golden_backpack');
    const bonusCoins = hasBackpack ? Math.floor(coinReward * 0.2) : 0;
    
    const hasTent = state.inventory.includes('reinforced_tent');
    const energyRecovery = hasTent ? 1 : 0;
    
    return {
      nodeStars: { ...state.nodeStars, [nodeId]: Math.max(state.nodeStars[nodeId] || 0, starsEarned) },
      completedNodes: [...new Set([...state.completedNodes, nodeId])],
      unlockedNodes: [...new Set([...state.unlockedNodes, ...nextNodesToUnlock])],
      coins: state.coins + coinReward + bonusCoins,
      energy: Math.min(10, state.energy + energyRecovery),
      activeStageModal: null // Close modal on complete
    };
  }),

  setShowShop: (show) => set({ showShop: show }),

  buyGear: (gearId, cost) => set((state) => {
    if (state.coins >= cost && !state.inventory.includes(gearId)) {
      return {
        coins: state.coins - cost,
        inventory: [...state.inventory, gearId]
      };
    }
    return state;
  }),

  deductEnergy: (amount) => set((state) => ({ energy: Math.max(0, state.energy - amount) })),

  triggerCollapse: () => set({ hasCollapsed: true, activeStageModal: null }),

  recoverFromCollapse: (energyRestored, coinCost, resetProgress) => set((state) => ({
    hasCollapsed: false,
    energy: state.energy + energyRestored,
    coins: Math.max(0, state.coins - coinCost),
    completedNodes: resetProgress ? [] : state.completedNodes,
    unlockedNodes: resetProgress ? ['base_camp'] : state.unlockedNodes
  })),

  setWeatherState: (weather) => set({ weatherState: weather }),

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  
  unlockReward: (rewardId) => set((state) => ({ 
    unlockedRewards: [...new Set([...state.unlockedRewards, rewardId])] 
  })),

  setBudgetCreated: (status) => set({ budgetCreated: status }),
  updateEmergencyFund: (amount) => set({ emergencyFundStatus: amount }),
  setDebtStrategy: (strategy) => set({ debtStrategyChosen: strategy }),
  setSavingsTarget: (target) => set({ savingsTarget: target }),

  resetGame: () => set(initialState),
}));
