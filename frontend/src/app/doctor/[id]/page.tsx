'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { apiCall } from '../../../utils/api';

export default function DoctorProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      const data = await apiCall(`/api/search/doctors/${id}`);
      setDoctor(data.doctor || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout showFloatingPills={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !doctor) {
    return (
      <Layout showFloatingPills={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link href="/search" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold">Back to search</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6 sm:p-12">
        <header className="mb-8 max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-teal-600 hover:text-teal-800 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-teal-900">Doctor Profile</h1>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-teal-100 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl bg-teal-50 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                {doctor.specialty?.icon || '🩺'}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{doctor.name}</h2>
                <p className="text-teal-600 font-medium text-lg mb-3">{doctor.specialty?.name || 'General Practitioner'}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  {doctor.phoneNumber && <span className="flex items-center gap-1">📞 {doctor.phoneNumber}</span>}
                  <span className="flex items-center gap-1">📧 {doctor.email}</span>
                  <span className="flex items-center gap-1">📍 {doctor.bio ? 'Clinic / Office' : 'Not specified'}</span>
                </div>
                {doctor.bio && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl">{doctor.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats / Info */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 text-center">
                 <h4 className="text-gray-500 text-sm font-semibold uppercase mb-1">Reviews (Anonymous)</h4>
                 <div className="text-2xl font-bold text-gray-900">⭐ {doctor.averageRating ? doctor.averageRating.toFixed(1) : 'N/A'}</div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 text-center">
                 <h4 className="text-gray-500 text-sm font-semibold uppercase mb-1">Avg. Duration</h4>
                 <div className="text-2xl font-bold text-gray-900 transition-all">{doctor.specialty?.averageConsultationDuration || 30} min</div>
               </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-6 text-center text-lg">Quick Actions</h3>
              
              <Link
                href={`/appointments/new?doctorId=${doctor._id}`}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl font-bold mb-3 hover:shadow-lg transition-all"
              >
                <span>📅</span> Book Appointment
              </Link>

              <Link
                href={`/chat?userId=${doctor._id}`}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <span>💬</span> Send a Message
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
