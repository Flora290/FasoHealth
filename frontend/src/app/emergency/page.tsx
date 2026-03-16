'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmergencyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/emergency`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="text-teal-600 font-bold flex items-center gap-2">
            ← Back to Home
          </Link>
          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold animate-pulse">
            Burkina Faso Emergency Line
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4">Medical Emergencies</h1>
        <p className="text-slate-600 mb-12 max-w-2xl">
          In case of a life-threatening emergency, contact one of the services below immediately. 
          These numbers are available 24/7 from any phone in Burkina Faso.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {data?.emergencyNumbers.map((item: any) => (
            <div key={item.number} className={`p-8 rounded-3xl border-2 transition-all hover:scale-[1.02] ${
              ['18', '15'].includes(item.number) 
              ? 'bg-red-50 border-red-200 shadow-xl shadow-red-500/10' 
              : 'bg-white border-slate-100 shadow-lg'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-4xl font-black ${['18', '15'].includes(item.number) ? 'text-red-600' : 'text-teal-600'}`}>
                  {item.number}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  ['18', '15'].includes(item.number) ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {['18', '15'].includes(item.number) ? 'Absolute Priority' : 'Assistance'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{item.name}</h3>
              <p className="text-slate-500 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <span className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">🏥</span>
          Hospitals & Health Centers
        </h2>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">Facility</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4">Contact</th>
                </tr>
              </thead>
              <tbody>
                {data?.hospitals.map((h: any) => (
                  <tr key={h.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800">{h.name}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500">
                      {h.address}, {h.city}
                    </td>
                    <td className="px-8 py-6">
                      <a href={`tel:${h.number}`} className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline">
                        <span>📞</span> {h.number}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
