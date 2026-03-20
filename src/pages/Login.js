import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab]   = useState('signin'); // 'signin' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setErr('');
    if (!form.email || !form.password) return setErr('Please fill all fields.');
    if (tab === 'signup' && !form.name) return setErr('Name is required.');
    setBusy(true);
    await new Promise(r => setTimeout(r, 700));
    login({
      id: 'u_' + Date.now(),
      name: form.name || form.email.split('@')[0],
      email: form.email,
    });
    setBusy(false);
  };

  const guest = () => login({ id: 'guest', name: 'Guest', email: 'guest@converge.ai' });

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="lg-orb lg-1" /><div className="lg-orb lg-2" /><div className="lg-orb lg-3" />
      </div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="#4f80ff" opacity=".9"/>
              <path d="M14 7L20 10.5V17.5L14 21L8 17.5V10.5L14 7Z" fill="#080b12"/>
              <circle cx="14" cy="14" r="3" fill="#4f80ff"/>
            </svg>
          </div>
          <div>
            <h1 className="login-brand-name">Converge AI</h1>
            <p className="login-brand-sub">One interface · Every AI</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={tab === 'signin' ? 'active' : ''} onClick={() => setTab('signin')}>Sign In</button>
          <button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>Sign Up</button>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={submit}>
          {tab === 'signup' && (
            <div className="lg-field">
              <label>Full Name</label>
              <input type="text" placeholder="Your name" value={form.name} onChange={set('name')} />
            </div>
          )}
          <div className="lg-field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="lg-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
          </div>
          {err && <div className="lg-err">{err}</div>}
          <button className="lg-btn" type="submit" disabled={busy}>
            {busy ? <span className="lg-spin" /> : (tab === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="login-divider"><span>or</span></div>
        <button className="lg-guest" onClick={guest}>Continue as Guest →</button>
      </div>
    </div>
  );
}
