'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: ''
  });

  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Error loading profile');
      
      const userData = await res.json();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        password: '',
        role: userData.role || ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const bodyParams: any = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };
      
      // Only include password if the user typed a new one
      if (formData.password) {
        bodyParams.password = formData.password;
      }

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(bodyParams)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Profile updated successfully!');
        // Update local storage info if needed
        localStorage.setItem('userName', data.name);
        // Clear password field
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        setError(data.message || 'Error during update');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout showFloatingPills={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-8 flex items-center gap-4">
             <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition text-slate-500 hover:text-teal-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </button>
             <div>
               <h1 className="text-3xl font-extrabold text-slate-900">My Profile ({formData.role === 'admin' ? 'Administrator' : formData.role === 'doctor' ? 'Doctor' : 'Patient'})</h1>
               <p className="text-slate-500 mt-1">Manage your personal information and security settings.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
               <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{formData.name}</h2>
                    <p className="text-slate-500">{formData.email}</p>
                  </div>
               </div>
            </div>

            <div className="p-8 space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">{error}</div>}
              {success && <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm font-medium">{success}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    placeholder="+226 XX XX XX XX"
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    placeholder="Leave empty to keep current password"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>

          {formData.role === 'doctor' && (
            <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">📋</span> Professional Verification (KYC)
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Submit your medical license and ID to activate your account.</p>
               </div>
               
               <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between p-6 rounded-2xl border bg-slate-50 border-slate-100">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          user?.kycStatus === 'approved' ? 'bg-green-100 text-green-600' :
                          user?.kycStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {user?.kycStatus === 'approved' ? '✓' : user?.kycStatus === 'rejected' ? '✗' : '!'}
                        </div>
                        <div>
                           <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Verification Status</p>
                           <p className="font-bold text-slate-800 capitalize">{user?.kycStatus || 'Pending'}</p>
                        </div>
                     </div>
                     {user?.kycStatus === 'approved' && (
                       <span className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-200">Verified Professional</span>
                     )}
                  </div>

                  <div className="space-y-4">
                     <label className="block text-sm font-semibold text-slate-700">Upload New Document</label>
                     <div className="flex items-center gap-4">
                        <input 
                           type="file" 
                           id="doc-upload"
                           className="hidden" 
                           onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (!file) return;
                             
                             const token = localStorage.getItem('token');
                             const fd = new FormData();
                             fd.append('document', file);
                             
                             try {
                               const res = await fetch(`${API_URL}/api/users/kyc-documents`, {
                                 method: 'POST',
                                 headers: { 'Authorization': `Bearer ${token}` },
                                 body: fd
                               });
                               const result = await res.json();
                               if (res.ok) {
                                 setSuccess('Document uploaded successfully!');
                                 fetchProfile();
                               } else {
                                 setError(result.message || 'Error uploading document');
                               }
                             } catch (err) {
                               setError('Network error');
                             }
                           }}
                        />
                        <button 
                           onClick={() => document.getElementById('doc-upload')?.click()}
                           className="px-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center gap-3 text-slate-600 group flex-1"
                        >
                           <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">📄</span>
                           <div className="text-left">
                              <p className="font-bold text-sm">Select Proof (PDF, JPG, PNG)</p>
                              <p className="text-[10px] text-slate-400">Max 10MB per document</p>
                           </div>
                        </button>
                     </div>
                  </div>

                  {user?.verificationDocuments?.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-800">Submitted Documents</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.verificationDocuments.map((doc: string, idx: number) => (
                          <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                             <div className="flex items-center gap-2 text-slate-600 overflow-hidden">
                                <span>📄</span>
                                <span className="truncate max-w-[150px]">{doc.split('-').pop()}</span>
                             </div>
                             <a href={`${API_URL}${doc}`} target="_blank" className="text-teal-600 font-bold hover:underline">View</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
