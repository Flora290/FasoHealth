'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`${API_URL}/api/appointments/my?${params.toString()}`, { headers });
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: 'Pending',  color: 'text-yellow-700', bg: 'bg-yellow-100' },
    confirmed: { label: 'Confirmed',    color: 'text-green-700',  bg: 'bg-green-100' },
    completed: { label: 'Completed',     color: 'text-blue-700',   bg: 'bg-blue-100' },
    cancelled: { label: 'Cancelled',      color: 'text-red-700',    bg: 'bg-red-100' },
  };

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6 sm:p-12">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient" className="text-teal-600 hover:text-teal-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-extrabold text-teal-900">📋 My Appointments</h1>
          </div>
          <Link href="/appointments/new" className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
            + New Appointment
          </Link>
        </header>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: '⏳ Pending' },
            { value: 'confirmed', label: '✅ Confirmed' },
            { value: 'completed', label: '🏁 Completed' },
            { value: 'cancelled', label: '❌ Cancelled' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === f.value ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No appointments</h3>
            <p className="text-gray-500 mb-6">You don't have any appointments in this category.</p>
            <Link href="/search" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-2xl font-bold hover:shadow-lg transition-all">
              🔍 Find a doctor
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => {
              const meta = statusMeta[apt.status] || { label: apt.status, color: 'text-gray-700', bg: 'bg-gray-100' };
              return (
                <div key={apt._id} className="bg-white rounded-2xl shadow-sm border border-teal-50 p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl flex-shrink-0">
                        {apt.consultationType === 'video' ? '💻' : apt.consultationType === 'phone' ? '📞' : '🏥'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Dr. {apt.doctor?.name}</h3>
                        <p className="text-teal-600 text-sm">{apt.specialty?.name || apt.doctor?.specialty}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📅 {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                          <span>🕐 {apt.startTime}</span>
                        </div>
                        {apt.reason && <p className="text-sm text-gray-600 mt-1">📋 {apt.reason}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                      {apt.status === 'completed' && (
                        <Link href={`/patient/reviews/new?doctorId=${apt.doctor?._id}&appointmentId=${apt._id}`}
                          className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 whitespace-nowrap">
                          ⭐ Rate Consultation
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
