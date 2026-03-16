'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { apiCall } from '../../../utils/api';

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [availability, setAvailability] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
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

      // Fetch doctor stats
      const statsData = await apiCall('/api/doctor/stats', { headers });
      setStats(statsData);

      // Fetch appointments
      const appointmentsData = await apiCall('/api/appointments/doctor?limit=5', { headers });
      setAppointments(appointmentsData.appointments || []);

      // Fetch availability
      const availabilityData = await apiCall(`/api/doctor/availability-overview?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`, { headers });
      setAvailability(availabilityData.availabilities || []);

      // Fetch recent reviews
      const reviewsData = await apiCall(`/api/reviews/doctor/${userData._id}?limit=3&showUnverified=true`, { headers });
      setReviews(reviewsData.reviews || []);

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
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: any) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'no-show': return 'No-show';
      default: return status;
    }
  };

  const handleAppointmentAction = async (appointmentId: any, action: any) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const status = action === 'confirm' ? 'confirmed' : 'cancelled';
      await apiCall(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });

      if (true) {
        // Refresh appointments
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <Layout showFloatingPills={true}>
      <div className="min-h-screen p-6 sm:p-12 relative overflow-hidden">
      
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse delay-700"></div>

      {/* Header */}
      <header className="flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-white">
            <img src="/images/logo.png" alt="FasoHealth Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-teal-900 tracking-tight">FasoHealth <span className="text-teal-500">Doctor</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Dr {user?.name}</p>
            <p className="text-xs text-slate-500">Doctor</p>
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
            Hello Dr {user?.name}! 👋
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl">
            Manage your appointments and availability. Track your statistics and stay connected with your patients.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/doctor/availability" className="flex items-center justify-center px-6 py-3 bg-gradient-r from-teal-500 to-teal-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Manage Availability
            </Link>
            <Link href="/doctor/appointments" className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Appointments
            </Link>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.overall?.totalAppointments || 0}</p>
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
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overall?.completionRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overall?.averageRating || 0}/5</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overall?.totalSlots || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Appointments Section */}
        <section className="glass p-8 rounded-3xl shadow-xl border border-white/40">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-teal-900 mb-6 flex items-center gap-3">
               <span className="text-4xl">📅</span> Your Appointments
            </h2>
            <Link href="/doctor/appointments" className="text-teal-600 hover:text-teal-800 font-medium text-sm">
              See all →
            </Link>
          </div>
          
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment._id} className="bg-white/70 p-5 rounded-2xl shadow-sm border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-md">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-xl border border-teal-200">
                        {appointment.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                          <p className="font-bold text-slate-800 text-lg">{appointment.patient?.name}</p>
                          <p className="text-sm text-slate-500">{new Date(appointment.date).toLocaleDateString('en-US')} • {appointment.startTime}</p>
                          <p className="text-xs text-slate-400 mt-1">{appointment.reason || 'No reason specified'}</p>
                      </div>
                  </div>

                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                      {appointment.payment && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${appointment.payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {appointment.payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      )}
                    </span>
                    {appointment.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleAppointmentAction(appointment._id, 'confirm')}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => handleAppointmentAction(appointment._id, 'cancel')}
                            className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl shadow-sm transition-colors text-sm"
                          >
                            Decline
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews and Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reviews */}
          <div className="glass p-8 rounded-3xl border border-white/40 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Reviews</h3>
              <Link href="/doctor/reviews" className="text-teal-600 hover:text-teal-800 font-medium text-sm">
                See all →
              </Link>
            </div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review._id} className="p-4 bg-white/50 rounded-xl border border-teal-50 relative group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{review.patient?.name}</p>
                          {!review.isVerified && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Pending</span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500 font-medium">{review.rating}/5</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 italic">"{review.comment}"</p>

                    {/* Categorical Ratings (Aspects) */}
                    {review.aspects && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 pt-4 border-t border-teal-50/50">
                        {Object.entries({
                          Professionalism: '👔',
                          Communication: '💬',
                          Punctuality: '⏰',
                          Cleanliness: '🧹',
                          Effectiveness: '💊'
                        }).map(([label, emoji]) => {
                          const score = review.aspects[label.toLowerCase()];
                          if (!score) return null;
                          return (
                            <div key={label} className="flex flex-col">
                              <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                                {emoji} {label}
                              </span>
                              <div className="flex text-[10px] text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < score ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {review.response && (
                      <div className="mt-2 p-3 bg-teal-50/50 border border-teal-100/50 rounded-xl">
                        <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-1">Your response:</p>
                        <p className="text-sm text-teal-700">{review.response.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Availability Overview */}
          {availability.length > 0 && (
            <div className="glass p-8 rounded-3xl border border-white/40 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Weekly Availability</h3>
                <Link href="/doctor/availability" className="text-teal-600 hover:text-teal-800 font-medium text-sm">
                  Manage →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {availability.slice(0, 4).map((avail, index) => (
                  <div key={index} className="p-4 bg-white/50 rounded-xl border border-teal-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 text-capitalize">
                        {new Date(avail.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        avail.isFullyBooked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {avail.isFullyBooked ? 'Full' : `${avail.availableSlots} slots`}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{avail.startTime} - {avail.endTime}</p>
                      <p>{avail.consultationType === 'video' ? '📹 Video Consultation' : '🏥 In-person Consultation'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </Layout>
  );
}
