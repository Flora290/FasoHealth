'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../../components/Layout';

export default function AdminCashier() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div></div>;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">Cashier Dashboard 💰</h1>
              <p className="text-slate-500 font-medium">Manage and track all medical transaction across the platform</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/dashboard/admin"
                className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2"
              >
                🏠 Back to Dashboard
              </Link>
              <button 
                  onClick={fetchPayments}
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2"
              >
                  🔄 Refresh
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 text-8xl opacity-10">💵</div>
               <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-2">Total Confirmed</p>
               <h2 className="text-4xl font-black">{totalRevenue.toLocaleString()} FCFA</h2>
            </div>
            <div className="bg-amber-500 rounded-[2rem] p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 text-8xl opacity-10">⌛</div>
               <p className="text-amber-100 font-bold uppercase tracking-widest text-xs mb-2">Total Pending</p>
               <h2 className="text-4xl font-black">{pendingRevenue.toLocaleString()} FCFA</h2>
            </div>
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute -right-4 -top-4 text-8xl opacity-5">📋</div>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Transactions</p>
               <h2 className="text-4xl font-black text-slate-800">{payments.length}</h2>
            </div>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-6">{error}</div>}

          {/* Transactions Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Patient</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Doctor</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Method</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-800">{p.user?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-slate-400">{p.phoneNumber || 'N/A'}</div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 font-medium">
                        Dr. {p.appointment?.doctor?.name || 'N/A'}
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">
                           {p.provider}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900">
                        {p.amount} FCFA
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <div className="text-center py-20 text-slate-400 italic">No transactions found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
