'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Form

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const backendUrl = `http://${window.location.hostname}:5000/api/auth/forgot-password`;
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Un code de réinitialisation a été envoyé à votre email.');
        setStep(2);
      } else {
        setError(data.message || 'Utilisateur non trouvé');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const backendUrl = `http://${window.location.hostname}:5000/api/auth/reset-password`;
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Votre mot de passe a été réinitialisé avec succès ! Redirection vers la page de connexion...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError(data.message || 'Code invalide ou expiré');
      }
    } catch (err) {
      setError('Échec de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link 
        href="/login" 
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 text-teal-900 font-semibold hover:bg-white/50 transition-all shadow-lg group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Login
      </Link>

      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse delay-700"></div>

      <div className="z-10 w-full max-w-md flex flex-col items-center glass p-10 rounded-3xl shadow-2xl animate-fade-in border border-white/40">
        <div className="flex flex-col items-center mb-10 text-center">
            <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">
                {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
                {step === 1 
                  ? "Enter your email to receive a secure reset code." 
                  : "We've sent a code to your email. Enter it below with your new password."}
            </p>
        </div>

        {error && <div className="w-full bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}
        {success && <div className="w-full bg-teal-100 text-teal-700 p-3 rounded-lg mb-4 text-sm font-semibold">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-teal-900">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-teal-900">Verification Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-center tracking-[0.5em] text-xl font-bold transition-all"
                placeholder="000000"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-teal-900">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-teal-900">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
