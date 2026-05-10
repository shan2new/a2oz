import { useEffect, useState } from 'react';
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
  const status = useUserStore((s) => s.status);
  const error = useUserStore((s) => s.error);
  const profile = useUserStore((s) => s.profile);

  // Kick the real CF sync the moment we enter "connecting".
  // ConnectingLog watches store progress and surfaces it; we move to "reveal"
  // once the store reports an idle status with a profile in hand.
  const onSubmit = () => {
    const h = handle.trim();
    if (!h) return;
    setStage('connecting');
    void useUserStore.getState().setHandle(h).catch(() => {
      // error surfaces via the store → ConnectingLog renders it
    });
  };

  useEffect(() => {
    if (stage === 'connecting' && status === 'idle' && profile) {
      // Small beat after "ready." line lands.
      const t = setTimeout(() => setStage('reveal'), 480);
      return () => clearTimeout(t);
    }
  }, [stage, status, profile]);

  const onRetry = () => {
    setStage('input');
    useUserStore.setState({ error: null, status: 'idle' });
  };

  const onEnter = () => navigate('/');

  if (stage === 'reveal' && profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--ed-bg-0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0',
        }}
      >
        <RevealHandle handle={profile.handle} onEnter={onEnter} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ed-bg-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0',
      }}
    >
      <HandleInput
        value={handle}
        onChange={setHandle}
        onSubmit={onSubmit}
        disabled={stage === 'connecting'}
      />

      {stage === 'connecting' && (
        <div
          style={{
            marginTop: 16,
            width: '100%',
            maxWidth: 640,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ConnectingLog handle={handle.trim()} error={error} onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}
