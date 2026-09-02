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
  const { setEmployeeId, setFinancialData } = useGameStore();

  // Extract employeeId and token from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get('employeeId') || urlParams.get('userId') || 'demo-employee-id';
  const token = urlParams.get('token');

  // If a token is provided in the URL, save it to localStorage for API calls
  useEffect(() => {
    if (token) {
      // Strip "Bearer " if the user accidentally included it in the URL
      const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
      localStorage.setItem('token', cleanToken);
    }
  }, [token]);

  // Fetch financial data
  const { metrics, rawSnapshot, isLoading: isFinanceLoading, hasNoData, error: financeError, askSherpa } = useFinancialData(employeeId);

  // Store employeeId and financial data in game store when available
  useEffect(() => {
    if (employeeId) {
      setEmployeeId(employeeId);
    }
  }, [employeeId, setEmployeeId]);

  useEffect(() => {
    useGameStore.getState().setFinanceStatus(isFinanceLoading, hasNoData);
  }, [isFinanceLoading, hasNoData]);

  useEffect(() => {
    if (metrics && rawSnapshot) {
      setFinancialData(metrics, rawSnapshot);
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

          {showDebug && <DebugPanel />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
