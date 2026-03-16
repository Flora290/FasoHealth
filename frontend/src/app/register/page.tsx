'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from '../../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      role: 'patient'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [specialties, setSpecialties] = useState<any[]>([]);
  useEffect(() => {
    const fetchSpecialties = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/api/specialties`);
            const data = await res.json();
            if (res.ok) {
                setSpecialties(data.specialties || []);
            }
        } catch (err) {
            console.error('Failed to fetch specialties');
        }
    };
    fetchSpecialties();
  }, []);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const backendUrl = `${getApiUrl()}/api/auth/register`;
        const res = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
            setEmail(formData.email);
            if (data.otpRequired) {
                setShowOtp(true);
                setSuccess(true);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        } else {
            setError(data.message || 'Something went wrong');
        }
    } catch (err) {
        setError('Failed to connect to the server. Is the backend running?');
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const backendUrl = `${getApiUrl()}/api/auth/verify-otp`;
        const res = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        const data = await res.json();

        if (res.ok) {
            if (data.role === 'doctor' && data.message && data.message.includes('approbation')) {
                setSuccess(true);
                setShowOtp(true); // Keep the view but show message
                setTimeout(() => {
                    window.location.href = '/login';
                }, 4000);
                return;
            }

            setSuccess(true);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            
            // Redirect based on role
            if (data.role === 'doctor') {
                window.location.href = '/dashboard/doctor';
            } else if (data.role === 'admin') {
                window.location.href = '/dashboard/admin';
            } else {
                window.location.href = '/dashboard/patient';
            }
        } else {
            setError(data.message || 'Invalid OTP');
        }
    } catch (err) {
        setError('Server error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <Link 
        href="/" 
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 text-teal-900 font-semibold hover:bg-white/50 transition-all shadow-lg group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Home
      </Link>
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse delay-700"></div>
      
      <div className="z-10 w-full max-w-md flex flex-col items-center glass p-8 sm:p-10 rounded-3xl shadow-2xl animate-fade-in border border-white/40">
        
        <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-4 flex items-center justify-center bg-white">
                <img src="/images/logo.png" alt="FasoHealth Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">
                Join FasoHealth
            </h1>
            <p className="text-slate-500 text-sm mt-2 text-center">
                Create an account to start managing your health journey.
            </p>
        </div>
 
        {error && <div className="w-full bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}
        {success && !showOtp && <div className="w-full bg-teal-100 text-teal-800 p-3 rounded-lg mb-4 text-sm font-semibold">Account created successfully! Redirecting...</div>}
        {success && showOtp && <div className="w-full bg-teal-100 text-teal-800 p-3 rounded-lg mb-4 text-sm font-semibold">Verification code sent to your email!</div>}

        {!showOtp ? (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-teal-900" htmlFor="name">Full Name</label>
                    <input 
                        type="text" 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-teal-900" htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-teal-900" htmlFor="password">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-teal-900" htmlFor="role">Role</label>
                    <select 
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800"
                    >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                </div>

                {formData.role === 'doctor' && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-semibold text-teal-900" htmlFor="specialty">Specialty</label>
                        <select 
                            id="specialty"
                            name="specialty"
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800"
                            required
                        >
                            <option value="">Select a specialty</option>
                            {specialties.map((s: any) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 mt-4 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
        ) : (
            <form onSubmit={handleVerifyOTP} className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-4 text-center">
                    <p className="text-slate-600 text-sm">
                        Please enter the 6-digit verification code sent to <span className="font-bold text-teal-900">{email}</span>.
                    </p>
                    <input 
                        type="text" 
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl bg-white/70 border-2 border-teal-100 focus:border-teal-500 focus:outline-none text-center text-3xl font-mono tracking-[0.5em] text-teal-900 shadow-inner"
                        placeholder="000000"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>
                <button 
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-sm text-slate-500 font-semibold hover:text-teal-700 transition-colors"
                >
                    ← Back to Registration
                </button>
            </form>
        )}

        <p className="mt-6 text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 font-bold hover:text-teal-800 transition-colors">
                Log in
            </Link>
        </p>

      </div>
    </main>
  );
}
