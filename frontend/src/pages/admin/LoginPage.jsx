import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@moonlightvilla.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/erp/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80"
          alt="Estate Twilight"
          className="w-full h-full object-cover opacity-20 filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg">
            <Moon className="w-6 h-6 fill-amber-400/20 text-amber-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-slate-100">
            MOON LIGHT VILLA
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mt-1">
            ERP Management System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@moonlightvilla.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access ERP Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Role Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-xs">
          <p className="text-[11px] text-slate-400 font-semibold mb-2 text-center uppercase tracking-wider">
            Quick 1-Click Role Logins:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@moonlightvilla.com')}
              className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 text-left"
            >
              <strong className="text-amber-400 block">Super Admin</strong>
              <span className="text-[10px] text-slate-500">Full Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('manager@moonlightvilla.com')}
              className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 text-left"
            >
              <strong className="text-amber-400 block">Manager</strong>
              <span className="text-[10px] text-slate-500">Ops & Bookings</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('sales@moonlightvilla.com')}
              className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 text-left"
            >
              <strong className="text-amber-400 block">Sales Executive</strong>
              <span className="text-[10px] text-slate-500">CRM & Leads</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('accounts@moonlightvilla.com')}
              className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 text-left"
            >
              <strong className="text-amber-400 block">Accountant</strong>
              <span className="text-[10px] text-slate-500">Billing & GST</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/home" className="text-xs text-slate-400 hover:text-amber-400 transition-colors">
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
