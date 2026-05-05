import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Login from './pages/Login';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Still checking auth
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-slate-600 text-sm">Carregando…</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={session ? <Home session={session} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />
    </Routes>
  );
}
