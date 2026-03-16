'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        if (token && userJson) {
            setIsLoggedIn(true);
            try {
                const user = JSON.parse(userJson);
                setUserRole(user.role);
            } catch (e) {}
        }
    }, []);

    const getDashboardUrl = () => {
        if (userRole === 'admin') return '/dashboard/admin';
        if (userRole === 'doctor') return '/dashboard/doctor';
        return '/dashboard/patient';
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">

            {/* Decorative blurred backgrounds - Enhanced for more depth */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500 rounded-full mix-blend-multiply filter blur-[160px] opacity-60 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-60 animate-pulse delay-[2000ms]"></div>
            <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-sky-400 rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-[1000ms]"></div>

            <div className="z-10 w-full max-w-5xl flex flex-col items-center glass p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(13,148,136,0.3)] animate-fade-in border border-white/60 bg-gradient-to-br from-white/95 via-teal-50/90 to-emerald-100/90 backdrop-blur-2xl">

                <div className="w-full flex justify-between items-center mb-16">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-white">
                            <img src="/images/logo.png" alt="FasoHealth Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">
                            FasoHealth<span className="text-teal-500 text-4xl">.</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/emergency" className="px-6 py-3 rounded-full font-semibold text-red-600 hover:bg-red-50 transition-colors duration-300 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Emergency
                        </Link>
                        <Link href="/login" className="px-6 py-3 rounded-full font-semibold text-teal-800 hover:bg-teal-100 transition-colors duration-300">
                            Log in
                        </Link>
                        <Link href="/register" className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300">
                            Get Started
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-12 w-full">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 text-teal-800 font-medium text-sm border border-teal-200 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                            24/7 Digital Healthcare
                        </div>

                        <h2 className="text-5xl lg:text-7xl font-bold text-slate-800 leading-tight">
                            Premium Healthcare,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-800">
                                At Your Fingertips.
                            </span>
                        </h2>

                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                            Book appointments, connect with specialists, and manage your health journey digitally with 0% Complications and 100% Care.
                        </p>

                        <div className="flex items-center gap-6 pt-4">
                            <button className="px-8 py-4 rounded-full font-bold bg-teal-600 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)] hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(13,148,136,0.3)] transition-all duration-300 text-lg">
                                Book Appointment
                            </button>
                            <a className="font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-2 cursor-pointer group">
                                Learn More
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                    </div>

                    <div className="flex-1 hidden lg:block">
                        <div className="relative w-full max-w-[280px] mx-auto aspect-square flex items-center justify-center">
                            {/* Green signal rings */}
                            <div className="absolute w-full h-full border-2 border-emerald-400 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute w-3/4 h-3/4 border-2 border-emerald-400 rounded-full animate-ping opacity-30 delay-700"></div>
                            <div className="absolute w-1/2 h-1/2 border-2 border-emerald-400 rounded-full animate-ping opacity-40 delay-1000"></div>
                            
                            {/* Central Red Cross Icon */}
                            <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl border-4 border-emerald-500 flex items-center justify-center overflow-hidden z-10 group hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <div className="absolute w-full h-4 bg-emerald-600 rounded-full"></div>
                                    <div className="absolute w-4 h-full bg-emerald-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
                    <div className="bg-teal-50/70 p-6 rounded-2xl border border-teal-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-white text-xl">🏥</span>
                        </div>
                        <h3 className="font-bold text-teal-900 mb-2">Digital Consultations</h3>
                        <p className="text-sm text-teal-600">Connect with doctors remotely via high-quality video calls</p>
                    </div>

                    <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-white text-xl">📅</span>
                        </div>
                        <h3 className="font-bold text-emerald-900 mb-2">Easy Booking</h3>
                        <p className="text-sm text-emerald-600">Schedule appointments instantly</p>
                    </div>

                    <div className="bg-teal-50/70 p-6 rounded-2xl border border-teal-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-white text-xl">💊</span>
                        </div>
                        <h3 className="font-bold text-teal-900 mb-2">Pharmacy Services</h3>
                        <p className="text-sm text-teal-600">Order medicines online</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
