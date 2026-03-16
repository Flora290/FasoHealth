'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import StatsCharts from '../../../components/StatsCharts';
import { apiCall } from '../../../utils/api';

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  topDoctors: Array<{ _id: string; name: string; appointments: number; specialty: string }>;
  usersByRole: Array<{ name: string; value: number; color: string }>;
  appointmentsByMonth: Array<{ date: string; patients: number; doctors: number; appointments: number }>;
  specialties: Array<{ name: string; count: number; color: string }>;
  userGrowth: Array<{ date: string; patients: number; doctors: number; appointments: number }>;
  activePatients: number;
}

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = `http://${window.location.hostname}:5000`;
      const hdr = { 'Authorization': `Bearer ${token}` };

      const userData = await apiCall('/api/auth/profile', { headers: { ...hdr, 'Content-Type': 'application/json' } });
      setAdminUser(userData);

      const statsRes = await fetch(`${API_URL}/api/admin/dashboard?period=year`, { headers: hdr });
      if (statsRes.ok) {
        const d = await statsRes.json();
        const ov = d.overview || {};

        // Map topDoctors: backend uses doctorName and totalAppointments
        const mappedTopDoctors = (d.topDoctors || []).map((doc: any) => ({
          _id: doc.doctor || doc._id || Math.random().toString(),
          name: doc.doctorName || doc.name || 'Unknown',
          appointments: doc.totalAppointments || doc.appointments || 0,
          specialty: doc.specialtyName || doc.specialty || '—',
        }));

        // Map specialties for bar chart from specialtyBreakdown
        const SPECIALTY_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const mappedSpecialties = (d.specialtyBreakdown || [])
          .filter((s: any) => s.specialtyName)
          .map((s: any, i: number) => ({
            name: s.specialtyName,
            count: s.count || 0,
            color: SPECIALTY_COLORS[i % SPECIALTY_COLORS.length],
          }));

        // Map monthly trends for area chart
        const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const mappedMonthly = (d.monthlyTrends || []).map((m: any) => ({
          date: MONTHS[(m._id?.month ?? 1) - 1] || 'N/A',
          appointments: m.total || 0,
          patients: m.completed || 0,
          doctors: m.cancelled || 0,
        }));

        // Map user growth from userStats (by role)
        const patientCount = ov.totalPatients || 0;
        const doctorCount  = ov.totalDoctors  || 0;
        const userGrowthData = [
          { date: 'Start', patients: 0, doctors: 0, appointments: 0 },
          { date: 'Now',   patients: patientCount, doctors: doctorCount, appointments: ov.totalAppointments || 0 },
        ];

        setStats({
          totalUsers:          ov.totalUsers || 0,
          totalDoctors:        ov.totalDoctors || 0,
          totalPatients:       ov.totalPatients || 0,
          totalAppointments:   ov.totalAppointments || 0,
          todayAppointments:   d.todayAppointments || 0,
          activePatients:      d.activePatients || 0,
          topDoctors:          mappedTopDoctors,
          usersByRole: [
            { name: 'Patients', value: ov.totalPatients || 0, color: '#10b981' },
            { name: 'Doctors',  value: ov.totalDoctors  || 0, color: '#3b82f6' },
            { name: 'Admins',   value: ov.totalAdmins   || 0, color: '#f59e0b' },
          ],
          appointmentsByMonth: mappedMonthly,
          specialties:         mappedSpecialties,
          userGrowth:          userGrowthData,
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-200 border-t-teal-600"></div>
            <p className="text-slate-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: '👥', color: 'bg-blue-100 text-blue-600', trend: '+12%' },
    { label: 'Doctors', value: stats?.totalDoctors ?? 0, icon: '👨‍⚕️', color: 'bg-indigo-100 text-indigo-600', trend: '+5%' },
    { label: 'Patients', value: stats?.totalPatients ?? 0, icon: '🧑‍🦰', color: 'bg-teal-100 text-teal-600', trend: '+18%' },
    { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: '📅', color: 'bg-amber-100 text-amber-600', trend: '+3' },
  ];

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gray-50 flex">

        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed hidden md:flex">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-teal-400">⚡</span> Admin Center
            </h2>
            {adminUser && (
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {adminUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{adminUser.name}</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              </div>
            )}
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-600 text-white font-medium shadow-sm">
              <span>📊</span> Overview
            </Link>
            <Link href="/dashboard/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>👥</span> Users
            </Link>
            <Link href="/dashboard/admin/hospitals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>🏥</span> Hospitals
            </Link>
            <Link href="/dashboard/admin/specialties" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>🩺</span> Specialties
            </Link>
            <Link href="/dashboard/admin/kyc" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition relative">
              <span>🛡️</span> Verification
              <span className="absolute right-4 top-3.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            </Link>
            <Link href="/dashboard/admin/payments" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-emerald-800/20 hover:text-emerald-400 transition">
              <span>💰</span> Cashier
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-6 sm:p-10">

          {/* Page Header */}
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Overview</h1>
              <p className="text-slate-500 mt-1">Welcome back, {adminUser?.name || 'Administrator'} — here's what's happening today.</p>
            </div>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="px-6 py-2.5 bg-white border border-slate-200 text-red-600 font-bold rounded-xl shadow-sm hover:bg-red-50 hover:border-red-100 transition flex items-center gap-2"
            >
              <span>🚪</span> Exit
            </button>
          </header>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.color} shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{card.label}</p>
                  <p className="text-3xl font-extrabold text-slate-900 leading-tight">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">{card.trend} this month</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/dashboard/admin/users" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-teal-300 hover:shadow-md transition group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl group-hover:bg-teal-100 transition">👥</div>
                <div>
                  <p className="font-bold text-slate-900">Manage Users</p>
                  <p className="text-sm text-slate-500">Edit, activate, delete accounts</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-teal-600 text-sm font-semibold">Go to Users →</div>
            </Link>

            <Link href="/dashboard/admin/specialties" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-indigo-300 hover:shadow-md transition group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition">🏥</div>
                <div>
                  <p className="font-bold text-slate-900">Specialties</p>
                  <p className="text-sm text-slate-500">Manage medical departments</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-semibold">Go to Specialties →</div>
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">📅</div>
                <div>
                  <p className="font-bold text-slate-900">Appointments</p>
                  <p className="text-sm text-slate-500">{stats?.totalAppointments || 0} total registered</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Today</span>
                  <span className="font-bold text-amber-600">{stats?.todayAppointments || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min(((stats?.todayAppointments || 0) / 20) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Doctors + Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Top Doctors */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">🏆 Top Doctors</h2>
              {(stats?.topDoctors?.length ?? 0) === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {stats!.topDoctors.slice(0, 5).map((doc, i) => (
                    <div key={doc._id || i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                        ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-orange-700'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.specialty}</p>
                      </div>
                      <span className="text-sm font-bold text-teal-600">{doc.appointments}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">📊 Statistics</h2>
              {stats && (
                <StatsCharts
                  usersByRole={stats.usersByRole}
                  appointmentsByMonth={stats.appointmentsByMonth}
                  specialties={stats.specialties}
                  userGrowth={stats.userGrowth}
                />
              )}
            </div>
          </div>

          {/* Active Patients Card */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
            <div>
              <p className="text-teal-100 text-sm font-medium uppercase tracking-wide">Active Patients</p>
              <p className="text-5xl font-extrabold mt-1">{stats?.activePatients ?? 0}</p>
              <p className="text-teal-200 text-sm mt-1">Patients with appointments this month</p>
            </div>
            <div className="text-7xl opacity-20">🧑‍🦰</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
