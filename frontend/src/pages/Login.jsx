import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Email ou senha incorretos.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="text-slate-200 font-semibold text-lg">SAP Knowledge</span>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-[#0f1929] border border-[#1e293b] rounded-xl px-8 py-8 flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#1a1a2e] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-600 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#1a1a2e] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-600 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
