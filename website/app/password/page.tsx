'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      router.refresh();
      router.push('/');
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#161d18',
      fontFamily: 'DM Sans, sans-serif',
      padding: '24px'
    }}>

      {/* Logo */}
      <div style={{
        fontFamily: 'Dela Gothic One, sans-serif',
        fontSize: 'clamp(36px, 9vw, 72px)',
        color: '#D4D5D9',
        letterSpacing: '0.06em',
        marginBottom: '6px',
        textAlign: 'center',
        lineHeight: 1
      }}>
        WILD WILD
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '10px',
        letterSpacing: '0.32em',
        color: '#6B5B6E',
        textTransform: 'uppercase',
        marginBottom: '6px',
        textAlign: 'center'
      }}>
        DEFEND THE HABITAT
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '10px',
        color: '#4A4A4A',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginBottom: '52px',
        textAlign: 'center'
      }}>
        INDIAN WILDLIFE-INSPIRED APPAREL
      </div>

      {/* Divider */}
      <div style={{
        width: '40px',
        height: '1px',
        background: 'rgba(165, 139, 111, 0.3)',
        marginBottom: '32px'
      }} />

      {/* Message */}
      <p style={{
        color: '#A58B6F',
        fontSize: '13px',
        marginBottom: '32px',
        textAlign: 'center',
        maxWidth: '280px',
        lineHeight: '1.8',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.02em'
      }}>
        The store is not open yet.<br />
        Enter your preview password below.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '300px'
        }}
      >
        <input
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Preview password"
          autoComplete="current-password"
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${error ? '#B32428' : 'rgba(255,255,255,0.10)'}`,
            borderRadius: '8px',
            color: '#D4D5D9',
            fontSize: '15px',
            padding: '14px 18px',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'border-color 0.2s ease'
          }}
        />

        {error && (
          <p style={{
            color: '#B32428',
            fontSize: '12px',
            margin: '0',
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.04em'
          }}>
            Incorrect password. Try again.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || password.length === 0}
          style={{
            background: loading ? '#4A3D4D' : '#6B5B6E',
            color: '#D4D5D9',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            padding: '14px',
            cursor: loading || password.length === 0 ? 'not-allowed' : 'pointer',
            width: '100%',
            opacity: password.length === 0 ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Entering...' : 'Enter'}
        </button>
      </form>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '28px',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '10px',
        color: '#2a2a2a',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textAlign: 'center'
      }}>
        © 2026 Wild Wild — All Rights Reserved
      </div>

    </div>
  );
}
