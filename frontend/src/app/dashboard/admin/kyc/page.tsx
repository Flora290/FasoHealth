'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';
import { apiCall } from '../../../../utils/api';

export default function AdminKycPage() {
  const router = useRouter();
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/admin/kyc/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingDoctors(data || []);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (doctorId: string, status: 'approved' | 'rejected') => {
    setProcessingId(doctorId);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/kyc/${doctorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setMessage({ text: `Doctor ${status} successfully`, type: 'success' });
        setPendingDoctors(prev => prev.filter(d => d._id !== doctorId));
      } else {
        const data = await res.json();
        setMessage({ text: data.message || 'Error processing request', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-200 border-t-teal-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8 flex items-center gap-4">
             <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition text-slate-500 hover:text-teal-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </button>
             <div>
               <h1 className="text-3xl font-extrabold text-slate-900">Doctor Verification Queue</h1>
               <p className="text-slate-500 mt-1">Review professional documents and approve doctor accounts.</p>
             </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            } font-medium flex items-center gap-3`}>
              <span>{message.type === 'success' ? '✅' : '❌'}</span>
              {message.text}
            </div>
          )}

          {pendingDoctors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
               <div className="text-6xl mb-4 text-slate-200">🛡️</div>
               <h2 className="text-xl font-bold text-slate-900">Queue is empty</h2>
               <p className="text-slate-500">There are no pending doctor verification requests at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingDoctors.map((doctor) => (
                <div key={doctor._id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                   <div className="p-8 md:w-1/3 bg-slate-50 border-r border-slate-100">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                            {doctor.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
                            <p className="text-teal-600 font-semibold text-sm">{doctor.specialty?.name || 'General Practitioner'}</p>
                         </div>
                      </div>
                      
                      <div className="space-y-3">
                         <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Email</span>
                            <span className="text-sm font-medium text-slate-700">{doctor.email}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Phone</span>
                            <span className="text-sm font-medium text-slate-700">{doctor.phoneNumber || 'N/A'}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Registered</span>
                            <span className="text-sm font-medium text-slate-700">{new Date(doctor.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                         <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <span>📄</span> Submitted Documents ({doctor.verificationDocuments?.length || 0})
                         </h4>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {doctor.verificationDocuments?.length > 0 ? (
                              doctor.verificationDocuments.map((doc: string, idx: number) => (
                                <a 
                                  key={idx} 
                                  href={`${API_URL}${doc}`} 
                                  target="_blank" 
                                  className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-teal-300 hover:bg-teal-50 transition-all flex items-center justify-between group"
                                >
                                   <div className="flex items-center gap-3">
                                      <span className="text-xl">📄</span>
                                      <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">Document #{idx + 1}</span>
                                   </div>
                                   <span className="text-[10px] font-black uppercase text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                                </a>
                              ))
                            ) : (
                              <p className="text-sm text-amber-600 font-medium col-span-2">No documents uploaded yet.</p>
                            )}
                         </div>
                      </div>

                      <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                         <button 
                            disabled={processingId === doctor._id}
                            onClick={() => handleAction(doctor._id, 'approved')}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all disabled:opacity-50"
                         >
                            {processingId === doctor._id ? 'Processing...' : 'Approve Doctor'}
                         </button>
                         <button 
                            disabled={processingId === doctor._id}
                            onClick={() => handleAction(doctor._id, 'rejected')}
                            className="px-8 py-4 border border-rose-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-all disabled:opacity-50"
                         >
                            Reject
                         </button>
                      </div>
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
