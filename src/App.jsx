import React, { useState, useEffect } from 'react';
import { DebugPanel } from './components/DebugPanel';
import { MountainPath } from './components/MountainPath';
import { GameHUD } from './components/GameHUD';
import { WeatherOverlay } from './components/WeatherOverlay';
import { RewardCard } from './components/RewardCard';
import { Onboarding } from './components/Onboarding';
import { StageModal } from './components/StageModal';
import { CollapseModal } from './components/CollapseModal';
import { SherpaShopModal } from './components/SherpaShopModal';
import { useFinancialData } from './hooks/useFinancialData';
import { useGameStore } from './store/useGameStore';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', background: '#000', width: '100%', height: '100vh', boxSizing: 'border-box' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [showDebug, setShowDebug] = useState(false);
  const { setEmployeeId, setFinancialData, setPlayerName, setFinanceStatus } = useGameStore();

  // Extract parameters from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get('employeeId') || urlParams.get('userId') || 'demo-employee-id';
  const token = urlParams.get('token');
  const rawName = urlParams.get('name') || urlParams.get('firstName') || 'Climber';
  
  // Extract only the first name if a full name is provided
  const firstName = rawName.split(' ')[0];

  // If a token is provided in the URL, save it to localStorage for API calls
  useEffect(() => {
    if (token) {
      // Strip "Bearer " if the user accidentally included it in the URL
      const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
      localStorage.setItem('token', cleanToken);
    }
  }, [token]);

  // Fetch financial data
  const { metrics, rawSnapshot, isLoading: isFinanceLoading, hasNoData, error: financeError, askSherpa, refetch } = useFinancialData(employeeId);

  // Store employeeId and financial data in game store when available
  useEffect(() => {
    if (employeeId) {
      setEmployeeId(employeeId);
      setPlayerName(firstName);
    }
    setFinanceStatus(isFinanceLoading, hasNoData);
  }, [employeeId, firstName, isFinanceLoading, hasNoData, setEmployeeId, setPlayerName, setFinanceStatus]);

  // Listen for the custom refetch event
  useEffect(() => {
    const handleRefetch = () => {
      refetch();
    };
    window.addEventListener('refetchFinancialData', handleRefetch);
    return () => {
      window.removeEventListener('refetchFinancialData', handleRefetch);
    };
  }, [refetch]);

  useEffect(() => {
    useGameStore.getState().setFinanceStatus(isFinanceLoading, hasNoData);
  }, [isFinanceLoading, hasNoData]);

  useEffect(() => {
    if (metrics && rawSnapshot) {
      setFinancialData(metrics, rawSnapshot);
      // Compute initial weather for base_camp and recommended branch
      useGameStore.getState().computeStageWeather('base_camp', metrics, useGameStore.getState().inventory);
      useGameStore.getState().computeRecommendedBranch(metrics);
    }
  }, [metrics, rawSnapshot, setFinancialData]);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <WeatherOverlay />
        
        {/* The Map */}
        <MountainPath />

        {/* UI Layer constrained to mobile-like width */}
        <div className="ui-wrapper">
          <GameHUD />
          <StageModal />
          <CollapseModal />
          <SherpaShopModal />
          <Onboarding />
          <RewardCard />
          
          {/* Dev Settings Toggle */}
          <button 
            onClick={() => setShowDebug(!showDebug)}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              zIndex: 9999
            }}
          >
            Dev
          </button>

          {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
