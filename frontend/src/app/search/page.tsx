'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getApiUrl } from '../../utils/api';

export default function SearchDoctors() {
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [filters, setFilters] = useState({
    specialty: '',
    city: '',
    date: '',
  });

  const API_URL = getApiUrl();

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/api/search/specialties`);
      const data = await res.json();
      setSpecialties(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch specialties', e);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const fetchDoctors = async (params?: any) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params?.specialty) query.set('specialty', params.specialty);
      if (params?.city) query.set('city', params.city);
      if (params?.date) query.set('date', params.date);
      query.set('limit', '20');

      const res = await fetch(`${API_URL}/api/search/doctors?${query.toString()}`);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (e) {
      console.error('Failed to fetch doctors', e);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors(filters);
  };

  const handleSpecialtyFilter = (specialtyId: string) => {
    const newFilters = { ...filters, specialty: specialtyId === filters.specialty ? '' : specialtyId };
    setFilters(newFilters);
    fetchDoctors(newFilters);
  };

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6 sm:p-12">
        
        {/* Header */}
        <header className="flex items-center gap-3 mb-10">
          <Link href="/dashboard/patient" className="text-teal-600 hover:text-teal-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-teal-900">🔍 Find a Doctor</h1>
            <p className="text-teal-600 text-sm mt-1">Search among our qualified health professionals</p>
          </div>
        </header>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🏙️ City..."
            value={filters.city}
            onChange={e => setFilters({ ...filters, city: e.target.value })}
            className="flex-1 px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          />
          <input
            type="date"
            value={filters.date}
            onChange={e => setFilters({ ...filters, date: e.target.value })}
            className="px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            min={new Date().toISOString().split('T')[0]}
          />
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300"
          >
            Search
          </button>
        </form>

        {/* Specialty Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-teal-900 mb-4">Specialties</h2>
          {loadingSpecialties ? (
            <div className="flex gap-3 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleSpecialtyFilter('')}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  filters.specialty === '' 
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
                }`}
              >
                All
              </button>
              {specialties.map(s => (
                <button
                  key={s._id}
                  onClick={() => handleSpecialtyFilter(s._id)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-1 ${
                    filters.specialty === s._id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  {s.icon && <span>{s.icon}</span>} {s.name}
                  {s.doctorCount > 0 && (
                    <span className="ml-1 text-xs opacity-70">({s.doctorCount})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-teal-900">
              {loading ? 'Searching...' : `${doctors.length} doctor(s) found`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🩺</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No doctors found</h3>
              <p className="text-gray-500">Try other search criteria or a different specialty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map(doctor => (
                <div key={doctor._id} className="bg-white rounded-2xl shadow-sm border border-teal-50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {/* Doctor Avatar */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md text-2xl flex-shrink-0"
                      style={{ background: doctor.specialty?.color ? `${doctor.specialty.color}20` : '#e6fffa' }}>
                      {doctor.specialty?.icon || '🩺'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{doctor.name}</h3>
                      <p className="text-teal-600 text-sm font-medium">
                        {doctor.specialty?.name || 'General Practitioner'}
                      </p>
                      {/* Rating */}
                      {doctor.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-sm ${s <= Math.round(doctor.averageRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                          ))}
                          <span className="text-xs text-gray-500">({doctor.totalReviews})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-5">
                    {doctor.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <span>📞</span> <span>{doctor.phoneNumber}</span>
                      </div>
                    )}
                    {doctor.availableSlots > 0 && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <span>✅</span> <span>{doctor.availableSlots} slot(s) available</span>
                      </div>
                    )}
                    {doctor.availableSlots === 0 && filters.date && (
                      <div className="flex items-center gap-2 text-orange-500">
                        <span>⚠️</span> <span>No slots available for this date</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/appointments/new?doctorId=${doctor._id}`}
                      className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl text-center text-sm font-bold hover:shadow-md transition-all"
                    >
                      📅 Book Appointment
                    </Link>
                    <Link
                      href={`/doctor/${doctor._id}`}
                      className="px-4 py-2.5 border border-teal-200 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-50 transition-all"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
