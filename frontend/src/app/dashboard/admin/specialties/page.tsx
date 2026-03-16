'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';
import { getApiUrl } from '../../../../utils/api';

export default function AdminSpecialtiesPage() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🩺',
    description: '',
    color: 'teal',
    averageConsultationDuration: 30,
    typicalPriceRange: '15000 - 30000 FCFA'
  });

  const API_URL = getApiUrl();

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search/specialties`);
      if (!res.ok) throw new Error('Loading error');
      const data = await res.json();
      setSpecialties(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the specialty: ${name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/specialties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSpecialties(specialties.filter(s => s._id !== id));
      } else {
        alert(data.message || 'Error during deletion');
      }
    } catch {
      alert('Connection error');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/specialties`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSpecialties([...specialties, data]);
        setShowForm(false);
        setFormData({
          name: '', icon: '🩺', description: '', color: 'teal', averageConsultationDuration: 30, typicalPriceRange: ''
        });
      } else {
        alert(data.message || 'Error creating specialty');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
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
            <Link href="/dashboard/admin/hospitals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>🏥</span> Hospitals
            </Link>
            <Link href="/dashboard/admin/specialties" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-600 text-white font-medium shadow-sm">
              <span>🩺</span> Specialties
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
                <h1 className="text-3xl font-extrabold text-slate-900">Medical Specialties</h1>
                <button 
                  onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-red-600 font-bold rounded-lg shadow-sm hover:bg-red-50 hover:border-red-100 transition text-sm flex items-center gap-2"
                >
                  <span>🚪</span> Exit
                </button>
              </div>
              <p className="text-slate-500 mt-1">Manage the medical fields available on FasoHealth.</p>
            </div>
            
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {showForm ? 'Cancel' : '+ New Specialty'}
            </button>
          </header>

          {/* Creation Form */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl bg-gradient-to-br from-white to-teal-50">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Add a specialty</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Name (e.g. Cardiology) *</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Emoji / Icon *</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Short description</label>
                <textarea rows={2} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none resize-none" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create the specialty'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full p-12 text-center text-slate-500">Loading...</div>
            ) : error ? (
              <div className="col-span-full p-12 text-center text-red-500">{error}</div>
            ) : specialties.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500">No specialty found.</div>
            ) : (
              specialties.map(spec => (
                <div key={spec._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition">
                  <div className="text-5xl mb-4 bg-slate-50 w-20 h-20 flex items-center justify-center rounded-2xl shadow-inner">
                    {spec.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{spec.name}</h3>
                  <p className="text-sm text-slate-500 flex-1 mb-6 line-clamp-2">{spec.description || 'No description'}</p>
                  
                  <button 
                    onClick={() => handleDelete(spec._id, spec.name)}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}
