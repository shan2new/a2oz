import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { HandleInput } from './HandleInput';
import { ConnectingLog } from './ConnectingLog';
import { RevealHandle } from './RevealHandle';

type Stage = 'input' | 'connecting' | 'reveal';

export default function Onboarding() {
  const [stage, setStage] = useState<Stage>('input');
  const [handle, setHandle] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!handle.trim()) return;
    setStage('connecting');
  };

  const handleConnectComplete = () => {
    setStage('reveal');
  };

  const handleEnter = () => {
    useUserStore.getState().setHandle(handle.trim());
    navigate('/');
  };

  // Full-screen reveal takes over the entire layout
  if (stage === 'reveal') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--ed-bg-0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0',
      }}>
        <RevealHandle handle={handle.trim()} onEnter={handleEnter} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ed-bg-0)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 0',
    }}>
      {/* Stage 1: handle input */}
      <HandleInput
        value={handle}
        onChange={setHandle}
        onSubmit={handleSubmit}
        disabled={stage === 'connecting'}
      />

      {/* Stage 2: connecting log appears below the input */}
      {stage === 'connecting' && (
        <div style={{ marginTop: 16, width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'center' }}>
          <ConnectingLog
            handle={handle.trim()}
            onComplete={handleConnectComplete}
          />
        </div>
      )}
    </div>
  );
}
