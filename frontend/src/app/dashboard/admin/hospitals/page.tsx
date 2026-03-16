'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../../components/Layout';
import { getApiUrl } from '../../../../utils/api';

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phoneNumber: '',
    email: '',
    isActive: true
  });

  const API_URL = getApiUrl();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/hospitals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Loading error');
      const data = await res.json();
      setHospitals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/hospitals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setHospitals([...hospitals, data]);
        setShowForm(false);
        setFormData({ name: '', address: '', city: '', phoneNumber: '', email: '', isActive: true });
      } else {
        alert(data.message || 'Error creating hospital');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Do you confirm the deletion of the hospital ${name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/hospitals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHospitals(hospitals.filter(h => h._id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Error during deletion');
      }
    } catch {
      alert('Network error');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/hospitals/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setHospitals(hospitals.map(h => h._id === id ? { ...h, isActive: !currentStatus } : h));
      }
    } catch {
      alert('Network error');
    }
  };

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gray-50 flex">
        
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed hidden md:flex">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-teal-400">⚡</span> Admin Center
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>📊</span> Overview
            </Link>
            <Link href="/dashboard/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>👥</span> Users
            </Link>
            <Link href="/dashboard/admin/hospitals" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-600 text-white font-medium shadow-sm">
              <span>🏥</span> Hospitals
            </Link>
            <Link href="/dashboard/admin/specialties" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>🩺</span> Specialties
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition mt-auto">
              <span>⚙️</span> My Profile
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
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-extrabold text-slate-900">Health Centers</h1>
                <button 
                  onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-red-600 font-bold rounded-lg shadow-sm hover:bg-red-50 hover:border-red-100 transition text-sm flex items-center gap-2"
                >
                  <span>🚪</span> Exit
                </button>
              </div>
              <p className="text-slate-500 mt-1">Manage partner hospitals and clinics of FasoHealth.</p>
            </div>
            
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {showForm ? 'Close the form' : '+ Add a Hospital'}
            </button>
          </header>
          
          {/* Search Bar */}
          <div className="mb-8 max-w-xl">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">🔍</span>
              <input 
                type="text" 
                placeholder="Search by name or city..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Creation Form */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 w-full max-w-3xl bg-gradient-to-br from-white to-teal-50">
              <h3 className="text-lg font-bold text-slate-900 mb-4">New Hospital / Clinic</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Establishment Name *</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone *</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City *</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Physical address *</label>
                  <textarea required rows={2} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none resize-none" 
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition">
                  {isSubmitting ? 'Creating...' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* Hospitals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full p-12 text-center text-slate-500">Loading...</div>
            ) : error ? (
              <div className="col-span-full p-12 text-center text-red-500">{error}</div>
            ) : hospitals.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">No hospital registered.</div>
            ) : (
              hospitals
                .filter(h => 
                  h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  h.city.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(hospital => (
                <div key={hospital._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col transition hover:shadow-md">
                   <div className="flex justify-between items-start mb-4">
                     <h3 className="text-xl font-bold text-slate-900">{hospital.name}</h3>
                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${hospital.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                       {hospital.isActive ? 'Active' : 'Inactive'}
                     </span>
                   </div>
                   
                   <div className="space-y-2 text-sm text-slate-600 mb-6 flex-1">
                     <p className="flex items-start gap-2"><span>📍</span> <span>{hospital.address}, {hospital.city}</span></p>
                     <p className="flex items-center gap-2"><span>📞</span> <span>{hospital.phoneNumber}</span></p>
                     {hospital.email && <p className="flex items-center gap-2"><span>📧</span> <span>{hospital.email}</span></p>}
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                     <button 
                       onClick={() => toggleStatus(hospital._id, hospital.isActive)}
                       className={`px-4 py-2 rounded-lg text-sm font-bold transition ${hospital.isActive ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}
                     >
                       {hospital.isActive ? 'Deactivate' : 'Activate'}
                     </button>
                     <button 
                       onClick={() => handleDelete(hospital._id, hospital.name)}
                       className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition text-sm"
                     >
                       Delete
                     </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
