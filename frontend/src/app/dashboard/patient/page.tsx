'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { apiCall } from '../../../utils/api';

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch user data
      const userData = await apiCall('/api/auth/profile', { headers });
      setUser(userData);

      // Fetch appointments
      const appointmentsData = await apiCall('/api/appointments/my?limit=5', { headers });
      setAppointments(appointmentsData.appointments || []);

      // Fetch notifications
      const notificationsData = await apiCall('/api/notifications?limit=5', { headers });
      setNotifications(notificationsData.notifications || []);

      // Calculate stats
      const completedAppointments = appointmentsData.appointments?.filter((apt: any) => apt.status === 'completed').length || 0;
      const upcomingAppointments = appointmentsData.appointments?.filter((apt: any) => ['pending', 'confirmed'].includes(apt.status)).length || 0;
      
      setStats({
        totalAppointments: appointmentsData.appointments?.length || 0,
        completedAppointments,
        upcomingAppointments,
        unreadNotifications: notificationsData.unreadCount || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: any) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFloatingPills={true}>
      <div className="min-h-screen p-6 sm:p-12">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-white">
            <img src="/images/logo.png" alt="FasoHealth Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-teal-900 tracking-tight">FasoHealth</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-teal-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {stats.unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
            )}
          </Link>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">Patient</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-teal-800">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            title="Logout"
            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="glass p-8 sm:p-12 rounded-3xl shadow-xl border border-white/40 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden bg-gradient-to-br from-teal-500/10 to-transparent mb-8">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        
        <div className="relative z-10 w-full">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-900 mb-4">
            Welcome, {user?.name}! 👋
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl">
            How are you feeling today? Easily book your next appointment with our specialists.
          </p>
          <div className="relative max-w-md">
            <input 
              type="text" 
              placeholder="Search doctors, specialties..." 
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-teal-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-teal-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedAppointments}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.upcomingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.unreadNotifications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass p-8 rounded-3xl border border-white/40 shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/search" className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm text-center">
            <span className="text-2xl">🔍</span>
            Find a Doctor
          </Link>
          <Link href="/appointments/new" className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm text-center">
            <span className="text-2xl">📅</span>
            Book Appointment
          </Link>
          <Link href="/appointments" className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm text-center">
            <span className="text-2xl">📋</span>
            My Appointments
          </Link>
          <Link href="/notifications" className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm text-center">
            <span className="text-2xl">🔔</span>
            Notifications
            {stats.unreadNotifications > 0 && (
              <span className="bg-white text-amber-700 rounded-full text-xs px-2 py-0.5 font-bold">{stats.unreadNotifications}</span>
            )}
          </Link>
          <Link href="/chat" className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm text-center">
            <span className="text-2xl">💬</span>
            Messaging
          </Link>
          <Link href="/patient/prescriptions" className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm text-center">
            <span className="text-2xl">📄</span>
            Prescriptions
          </Link>
          <Link href="/emergency" className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm text-center col-span-2 md:col-span-1">
            <span className="text-2xl animate-pulse">🆘</span>
            Emergency SOS
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="glass p-8 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h3>
            <Link href="/appointments" className="text-teal-600 hover:text-teal-800 font-medium text-sm">
              Voir tout →
            </Link>
          </div>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun rendez-vous à venir</p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 3).map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-teal-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Dr {appointment.doctor?.name}</p>
                        <p className="text-sm text-gray-500">{appointment.specialty?.name}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(appointment.date).toLocaleDateString('en-US')}</span>
                      <span>{appointment.startTime}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/appointments/${appointment._id}`} className="text-teal-600 hover:text-teal-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="glass p-8 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Notifications</h3>
            <Link href="/notifications" className="text-teal-600 hover:text-teal-800 font-medium text-sm">
              See all →
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications</p>
          ) : (
            <div className="space-y-4">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification._id} className="flex items-start space-x-3 p-3 bg-white/50 rounded-xl border border-teal-50">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      notification.type.includes('appointment') ? 'bg-blue-100' :
                      notification.type.includes('review') ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        notification.type.includes('appointment') ? 'text-blue-600' :
                        notification.type.includes('review') ? 'text-yellow-600' :
                        'text-gray-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString('en-US')} at {new Date(notification.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
}
