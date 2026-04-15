import { useState } from 'react';
import { API, parseJwtId } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

export default function AuthScreen({ onLogin, hidden }) {
  const [tab, setTab] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  const showToast = useToast();

  function switchTab(t) {
    setTab(t);
    setError('');
  }

  async function login() {
    setError('');
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('Please enter username and password');
      return;
    }
    setLoadingLogin(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message || 'username/password is wrong');
      
      const token = data.data;
      const myId = parseJwtId(token);
      onLogin({ token, myId, myUsername: loginUsername });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingLogin(false);
    }
  }

  async function register() {
    setError('');
    if (!regUsername.trim() || !regPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passRegex.test(regPassword)) {
      setError('Password must contain letters, numbers, special characters and min len 8');
      return;
    }

    setLoadingReg(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message || 'Registration failed');
      
      showToast('Account created! Sign in now ✓', 'success');
      setLoginUsername(regUsername);
      setRegUsername('');
      setRegPassword('');
      switchTab('login');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingReg(false);
    }
  }

  function handleKeyDown(e, action) {
    if (e.key === 'Enter') action();
  }

  return (
    <div className={`auth-screen${hidden ? ' hidden' : ''}`}>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <span className="auth-logo-text">PingMe</span>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>
            Sign In
          </button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {tab === 'login' && (
          <div>
            <label className="auth-label">Username</label>
            <input
              type="text"
              className="auth-input"
              placeholder="your_username"
              autoComplete="username"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              onKeyDown={e => handleKeyDown(e, login)}
            />
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              autoComplete="current-password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              onKeyDown={e => handleKeyDown(e, login)}
            />
            <button className="auth-btn" onClick={login} disabled={loadingLogin}>
              {loadingLogin ? <span className="spinner" /> : 'Sign In'}
            </button>
          </div>
        )}

        {tab === 'register' && (
          <div>
            <label className="auth-label">Username</label>
            <input
              type="text"
              className="auth-input"
              placeholder="choose_username"
              autoComplete="username"
              value={regUsername}
              onChange={e => setRegUsername(e.target.value)}
              onKeyDown={e => handleKeyDown(e, register)}
            />
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              autoComplete="new-password"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              onKeyDown={e => handleKeyDown(e, register)}
            />
            <button className="auth-btn" onClick={register} disabled={loadingReg}>
              {loadingReg ? <span className="spinner" /> : 'Create Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}