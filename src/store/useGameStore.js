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
  recommendedBranch: null, // 'aggressive_cliff' | 'steady_trail' | null
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

  setRecommendedBranch: (branch) => set({ recommendedBranch: branch }),

  // Per-stage weather computation based on financial readiness
  computeStageWeather: (stageId, metrics, inventory) => set(() => {
    if (!metrics && stageId !== 'base_camp') {
      return { weatherState: 'fog', sherpaMessage: '🌫️ No financial data available. Connect your bank account at Base Camp to clear the fog.' };
    }

    const m = metrics || {};
    const tdi = m.tdi || 0;
    const income = m.income || 0;
    const overdue = m.overdueBillsCount || 0;
    const ratio = m.salaryBillRatio || 0;
    const budgetHealth = m.budgetHealth || 'no_budget';
    const tdiPercent = income > 0 ? (tdi / income) * 100 : 0;
    const inv = inventory || [];

    let weather = 'sunrise';
    let advice = '';

    switch (stageId) {
      case 'base_camp':
        if (!metrics) {
          weather = 'storm';
          advice = '⛈️ Storm conditions at Base Camp! You have not yet connected your bank account. Without it, we cannot map your financial terrain. Use the secure portal below to link your account and clear the storm.';
        } else {
          // If bank is linked, Base Camp reflects OVERALL financial health as a preview of the mountain
          if (tdi <= 0 || overdue >= 3 || ratio > 80) {
            weather = 'storm';
            advice = '⛈️ Your bank is linked, but I see a massive storm on the mountain above us based on your data! Your overall financial health is at high risk. We have a lot of work to do on this climb.';
          } else if ((tdi > 0 && overdue > 0) || ratio > 60) {
            weather = 'fog';
            advice = '🌫️ Your bank is linked, but there is fog resting on the mountain. Your overall financial health shows some risky areas we will need to navigate carefully.';
          } else {
            weather = 'sunrise';
            advice = '☀️ Clear skies at Base Camp! Your bank is securely linked and your overall financial health looks strong. You are ready to begin a smooth ascent.';
          }
        }
        break;

      case 'snapshot_summary':
        if (!metrics) {
          weather = 'storm';
          advice = '⛈️ Storm at The Lookout! No snapshot data is available. Head back to Base Camp to connect your bank account first.';
        } else {
          if (tdi <= 0 || overdue >= 3 || ratio > 80) {
            weather = 'storm';
            advice = '⛈️ Storm at The Lookout! Your snapshot reveals severe financial trouble ahead. Ask the right questions below to understand what we are up against.';
          } else if ((tdi > 0 && overdue > 0) || ratio > 60) {
            weather = 'fog';
            advice = '🌫️ Fog at The Lookout! Your snapshot reveals a few warning signs. Ask the right questions below to identify the risks.';
          } else {
            weather = 'sunrise';
            advice = '☀️ The Lookout is clear! Your snapshot reveals a strong foundation. Ask the questions below to understand your position.';
          }
        }
        break;

      case 'budget_ridge':
        if (budgetHealth === 'over_budget') {
          weather = 'storm';
          advice = '⛈️ A storm rages at Budget Ridge! You are spending more than your budget allows. Precautions: Open Take Home and restructure your budget using the 50/30/20 rule. You may need to purchase Grip Boots from the Sherpa Shop to reduce the energy cost of this climb.';
        } else if (budgetHealth === 'warning' || budgetHealth === 'no_budget') {
          weather = 'fog';
          advice = '🌫️ Fog at Budget Ridge. ' + (budgetHealth === 'no_budget'
            ? 'You have not set up a budget yet. Create one using the 50/30/20 rule to clear the fog and see the path ahead.'
            : 'You are approaching your budget limit. Review your spending categories in Take Home to stay on track.');
        } else {
          weather = 'sunrise';
          advice = '☀️ Sunrise at Budget Ridge! Your budget is on track. Your disciplined spending is keeping the skies clear. Keep it up!';
        }
        break;

      case 'aggressive_cliff':
        if (overdue >= 3) {
          weather = 'storm';
          advice = `⛈️ A dangerous storm at Aggressive Cliff! You have ${overdue} overdue bills creating treacherous conditions. Precautions: You must clear at least some overdue bills in Take Home before this path is safe. Consider buying Emergency Dynamite from the Sherpa Shop to blast through the obstacles.`;
        } else if (overdue > 0) {
          weather = 'fog';
          advice = `🌫️ Fog on Aggressive Cliff. You have ${overdue} overdue bill(s). Pay them down in Take Home to improve visibility. The Avalanche strategy — attacking highest interest rates first — will clear this fog fastest.`;
        } else {
          weather = 'sunrise';
          advice = '☀️ Clear skies on Aggressive Cliff! No overdue bills detected. You are in a strong position to tackle your highest-interest debt head-on.';
        }
        break;

      case 'steady_trail':
        if (tdiPercent < 5) {
          weather = 'storm';
          advice = '⛈️ Storm on the Steady Trail! Your True Discretionary Income is dangerously low — you have almost no savings buffer. Precautions: Review your bills in Take Home and eliminate non-essential expenses. You may need a Reinforced Tent from the Sherpa Shop to weather this storm.';
        } else if (tdiPercent < 20) {
          weather = 'fog';
          advice = '🌫️ Fog on the Steady Trail. Your savings buffer exists but is thin. Build it up by setting automatic savings in Take Home. The Snowball strategy will help you build momentum with quick wins.';
        } else {
          weather = 'sunrise';
          advice = '☀️ Sunrise on the Steady Trail! Your True Discretionary Income is healthy — you have a solid savings buffer. Perfect conditions for building your emergency fund.';
        }
        break;

      case 'debt_avalanche':
        if (ratio > 60) {
          weather = 'storm';
          advice = `⛈️ An avalanche is coming! Your bills consume ${ratio.toFixed(0)}% of your income — that is dangerously high. Precautions: Use Take Home's Debt Planner to prioritize which debts to attack first. You may need Emergency Dynamite from the Sherpa Shop to clear the rockslide blocking this path.`;
        } else if (ratio > 40) {
          weather = 'fog';
          advice = `🌫️ Fog in the avalanche zone. Your bills consume ${ratio.toFixed(0)}% of your income. Manageable, but risky. Use Take Home's Debt Planner to create a strategy before the fog thickens.`;
        } else {
          weather = 'sunrise';
          advice = `☀️ Clear skies through the avalanche zone! Your bills only consume ${ratio.toFixed(0)}% of your income. You have strong control over your debt. Keep pushing forward!`;
        }
        break;

      case 'savings_camp':
        if (tdi <= 0) {
          weather = 'storm';
          advice = '⛈️ Storm at Savings Camp! Your True Discretionary Income is negative — you are spending more than you earn. Precautions: You cannot save until you fix this. Go back to Take Home, review your bills, and cut non-essential spending. A Reinforced Tent from the Sherpa Shop will help you survive here.';
        } else if (tdiPercent < 10) {
          weather = 'fog';
          advice = '🌫️ Fog at Savings Camp. You have some discretionary income, but it is slim. Set up small automated savings goals in Take Home to start building momentum, even if the amounts are small.';
        } else {
          weather = 'sunrise';
          advice = `☀️ Sunrise at Savings Camp! You have strong discretionary income to work with. Set up automated savings goals in Take Home and watch your wealth grow. You are on the right path!`;
        }
        break;

      case 'summit':
        const toolsNeeded = ['financial_compass', 'budget_planner', 'debt_axe', 'savings_beacon'];
        const missing = toolsNeeded.filter(t => !inv.includes(t));
        if (missing.length >= 3) {
          weather = 'storm';
          advice = `⛈️ A fierce storm blocks the Summit! You are missing ${missing.length} essential tools. Go back and complete the earlier stages to earn them. The summit demands full financial mastery.`;
        } else if (missing.length > 0) {
          weather = 'fog';
          advice = `🌫️ Fog near the Summit. You are close, but still missing ${missing.length} tool(s). Complete the remaining stages below to earn them and clear the path to the top.`;
        } else {
          weather = 'sunrise';
          advice = '☀️ The summit is in sight and the sky is crystal clear! You have all the tools and the financial discipline to reach the top. Claim your reward!';
        }
        break;

      default:
        weather = 'sunrise';
        advice = '☀️ The path ahead is clear.';
    }

    return { weatherState: weather, sherpaMessage: advice };
  }),

  // Compute which branch to recommend based on financial data
  computeRecommendedBranch: (metrics) => set(() => {
    if (!metrics) return { recommendedBranch: null };
    const { overdueBillsCount, salaryBillRatio } = metrics;

    if (overdueBillsCount > 0 || salaryBillRatio > 50) {
      return { recommendedBranch: 'aggressive_cliff' };
    } else {
      return { recommendedBranch: 'steady_trail' };
    }
  }),

  resetGame: () => set(initialState),
}));
