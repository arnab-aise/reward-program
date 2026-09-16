import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useGameStore } from '../store/useGameStore';
import { generateLinkToken, exchangePublicToken } from '../services/financeService';
import gsap from 'gsap';
import { useAudio } from '../hooks/useAudio';

export const PlaidLinkChallenge = ({ onComplete }) => {
  const { employeeId } = useGameStore();
  const { playSFX } = useAudio();
  
  const [linkToken, setLinkToken] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLinkBank = async () => {
    setIsProcessing(true);
    setError('');
    playSFX('thud');
    
    if (!employeeId) {
      setError('Player ID not found. Cannot securely link bank.');
      setIsProcessing(false);
      return;
    }
    
    try {
      const token = await generateLinkToken(employeeId);
      setLinkToken(token);
    } catch (e) {
      setError('Failed to securely contact bank. Please try again.');
    }
    setIsProcessing(false);
  };

  const config = {
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      if (!employeeId) return;
      setIsLoading(true);
      try {
        await exchangePublicToken(employeeId, public_token);
        
        // Success animation
        gsap.to('.plaid-container', { 
          scale: 0.9, 
          opacity: 0, 
          duration: 0.3, 
          onComplete: () => onComplete() 
        });
      } catch (e) {
        setError('Failed to securely link bank. Please try again.');
        setIsLoading(false);
      }
    },
    onExit: (err, metadata) => {
      setIsProcessing(false);
      if (err) {
        setError('Bank linking process was exited.');
      }
    },
    onEvent: (eventName, metadata) => {},
  };
  
  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready && linkToken) open();
    // eslint-disable-next-line
  }, [ready, linkToken]);

  return (
    <div className="vn-dialogue-container plaid-container">
      <div className="vn-dialogue-box speaker-sherpa">
        <div className="vn-speaker-badge sherpa">Sherpa</div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, paddingRight: '10px' }}>
          
          <div className="vn-challenge-header">Connect Your Bank Account</div>
          
          {isLoading ? (
            <div style={{ color: '#fff', fontSize: '18px', textAlign: 'center', marginTop: '20px' }}>
              Securing connection... <span style={{ animation: 'pulse 1s infinite' }}>🏔️</span>
            </div>
          ) : (
            <>
              <div className="vn-challenge-desc" style={{ marginBottom: '15px' }}>
                This is a necessary step to allow Take Home to calculate your true discretionary income and map your financial terrain.
                <br /><br />
                <b>What you'll provide:</b> Login credentials so we can securely link your bank account via Plaid.
              </div>

              {error && <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '10px' }}>{error}</div>}

              <button 
                className="vn-continue-btn"
                onClick={handleLinkBank}
                disabled={isProcessing}
                style={{ marginTop: 'auto', width: '100%', textAlign: 'center', opacity: isProcessing ? 0.5 : 1 }} 
              >
                {isProcessing ? 'Contacting Take Home...' : 'Connect Your Bank'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
