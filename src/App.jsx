import React, { useState } from 'react';
import { DebugPanel } from './components/DebugPanel';
import { MountainPath } from './components/MountainPath';
import { GameHUD } from './components/GameHUD';
import { WeatherOverlay } from './components/WeatherOverlay';
import { RewardCard } from './components/RewardCard';
import { Onboarding } from './components/Onboarding';
import { StageModal } from './components/StageModal';
import { CollapseModal } from './components/CollapseModal';
import { SherpaShopModal } from './components/SherpaShopModal';
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
