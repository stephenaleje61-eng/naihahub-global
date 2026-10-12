import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, Shield, Briefcase, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Abuja (FCT)', 'Diaspora / International'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, quickLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<'user' | 'business'>('user');
  const [businessName, setBusinessName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          fullName,
          username,
          state,
          city: city || 'Lagos City',
          role,
          businessName: role === 'business' ? businessName : undefined,
          country: state.includes('Diaspora') ? 'United Kingdom' : 'Nigeria',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (acc: 'admin' | 'chidi' | 'amina' | 'folake') => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(acc);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#008751] to-[#005c36] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">NaijaHub</span>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              Account System
            </span>
          </div>
          <p className="text-xs text-white/80 mt-1">
            {mode === 'login'
              ? 'Log in to access your listings, chat, friends, and business tools.'
              : 'Join millions of Nigerians and international businesses.'}
          </p>

          {/* Quick Demo Switcher Strip */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="text-[11px] font-semibold text-white/90 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Instant Test Switch (No typing needed):</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSwitch('admin')}
                className="text-left px-2 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-medium transition-colors"
              >
                🛡️ Admin Account
              </button>
              <button
                type="button"
                onClick={() => handleQuickSwitch('chidi')}
                className="text-left px-2 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-medium transition-colors"
              >
                📱 Chidi (Seller / Lagos)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSwitch('amina')}
                className="text-left px-2 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-medium transition-colors"
              >
                ✂️ Amina (Tailor / Abuja)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSwitch('folake')}
                className="text-left px-2 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-medium transition-colors"
              >
                🌍 Folake (Diaspora / UK)
              </button>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              mode === 'login'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-[#008751]/5'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              mode === 'register'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-[#008751]/5'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Adeleke"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. babatunde_trade"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Region *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Locality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ikeja, Wuse 2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                      role === 'user'
                        ? 'border-[#008751] bg-[#008751]/10 text-[#008751]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Personal User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('business')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                      role === 'business'
                        ? 'border-[#008751] bg-[#008751]/10 text-[#008751]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Business / Seller
                  </button>
                </div>
              </div>

              {role === 'business' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Solar & Hardware"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : mode === 'login'
              ? 'Log In to NaijaHub'
              : 'Create My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
