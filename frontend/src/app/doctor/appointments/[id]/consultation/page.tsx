'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../../components/Layout';

export default function ConsultationRoom() {
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Consultation Form Data
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  // Prescription Data
  const [medications, setMedications] = useState<any[]>([]);
  const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
  const [generalInstructions, setGeneralInstructions] = useState('');

  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setAppointment(data);
      // Pre-fill if already exists
      if (data.notes) setNotes(data.notes);
      if (data.diagnosis) setDiagnosis(data.diagnosis);
      if (data.symptoms) setSymptoms(data.symptoms);
      
    } catch (err: any) {
      setError(err.message || 'Error loading details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = () => {
    if (!currentMed.name || !currentMed.dosage || !currentMed.frequency || !currentMed.duration) {
      alert('Please fill in the basic medication information (Name, Dosage, Frequency, Duration).');
      return;
    }
    setMedications([...medications, currentMed]);
    setCurrentMed({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleCompleteConsultation = async () => {
    try {
      setSubmitting(true);
      setError('');

      // 1. Update Appointment (Notes, Diagnosis, Symptoms, and complete status)
      const aptRes = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          notes,
          diagnosis,
          symptoms,
        })
      });
      
      if (!aptRes.ok) {
        const errData = await aptRes.json();
        throw new Error(errData.message || 'Error saving medical record.');
      }

      const statusRes = await fetch(`${API_URL}/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!statusRes.ok) {
         const errData = await statusRes.json();
         throw new Error(errData.message || 'Error closing appointment.');
      }

      // 2. Create Prescription if medications exist
      if (medications.length > 0) {
        const rxRes = await fetch(`${API_URL}/api/prescriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            appointmentId: id,
            medications,
            generalInstructions,
            diagnosis,
            notes
          })
        });
        
        if (!rxRes.ok) {
          const errData = await rxRes.json();
          throw new Error(errData.message || 'Error creating prescription.');
        }
      }

      router.push('/dashboard/doctor');
    } catch (err: any) {
      console.error('Save error:', err);
      // Catch native fetch network errors like CORS or connection refused
      if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
         setError('Unable to connect to the backend server. Make sure port 5000 is open and the server is running.');
      } else {
         setError(err.message || 'An unexpected error occurred.');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div></div>;
  }

  if (!appointment) return <div className="p-12 text-center text-red-500">Not found</div>;

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
        <header className="mb-8 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/doctor" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-teal-600 hover:text-teal-800 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Consultation Room</h1>
              <p className="text-sm text-gray-500">Appointment with <span className="font-semibold text-teal-700">{appointment.patient.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {appointment.payment && (
               <div className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${appointment.payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                 {appointment.payment.status === 'paid' ? '💰 Payment Confirmed' : '⌛ Payment Pending'} ({appointment.payment.amount || 2000} FCFA)
               </div>
             )}
             <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg font-semibold text-sm">
               {new Date(appointment.date).toLocaleDateString('en-US')} • {appointment.startTime}
             </div>
          </div>
        </header>

        {error && (
          <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Medical Record */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Context & Symptoms */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📝</span> Reason and Symptoms
              </h2>
              <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Patient's reason for booking:</p>
                <p className="font-medium text-gray-800">{appointment.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed observations and symptoms</label>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="Note the symptoms described by the patient during the consultation here..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Diagnosis & Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🩺</span> Diagnosis and Medical Notes
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Diagnosis *</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="E.g. Bacterial tonsillitis, Seasonal flu..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Evolution notes (confidential)</label>
                  <textarea
                    rows={5}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="History, recommended treatment, items to check next time..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Prescription Builder */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💊</span> Prescription
              </h2>
              
              {medications.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Prescribed medications</h3>
                  {medications.map((med, idx) => (
                    <div key={idx} className="bg-amber-50 border border-amber-100 p-3 rounded-xl relative group">
                      <button 
                        onClick={() => removeMedication(idx)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <p className="font-bold text-amber-900">{med.name} <span className="text-amber-600 font-normal text-sm">({med.dosage})</span></p>
                      <p className="text-xs text-amber-800 mt-1">{med.frequency} for {med.duration}</p>
                      {med.instructions && <p className="text-xs text-amber-700 mt-1 bg-amber-100/50 p-1 rounded italic">{med.instructions}</p>}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-teal-800 mb-2">Add a medication</p>
                <input
                  type="text" placeholder="Medication name"
                  value={currentMed.name} onChange={e => setCurrentMed({...currentMed, name: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-white border border-teal-200 rounded-lg outline-none focus:border-teal-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text" placeholder="Dosage (e.g. 500mg)"
                    value={currentMed.dosage} onChange={e => setCurrentMed({...currentMed, dosage: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white border border-teal-200 rounded-lg outline-none focus:border-teal-400"
                  />
                  <input
                    type="text" placeholder="Duration (e.g. 5d)"
                    value={currentMed.duration} onChange={e => setCurrentMed({...currentMed, duration: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white border border-teal-200 rounded-lg outline-none focus:border-teal-400"
                  />
                </div>
                <input
                  type="text" placeholder="Frequency (e.g. 1 morning and evening)"
                  value={currentMed.frequency} onChange={e => setCurrentMed({...currentMed, frequency: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-white border border-teal-200 rounded-lg outline-none focus:border-teal-400"
                />
                <input
                  type="text" placeholder="Instructions (e.g. During meals)"
                  value={currentMed.instructions} onChange={e => setCurrentMed({...currentMed, instructions: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-white border border-teal-200 rounded-lg outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="w-full py-2 bg-teal-100 text-teal-700 font-bold rounded-lg hover:bg-teal-200 transition text-sm"
                >
                  + Add to prescription
                </button>
              </div>

              {medications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">General instructions</label>
                  <textarea
                    rows={2}
                    value={generalInstructions}
                    onChange={e => setGeneralInstructions(e.target.value)}
                    placeholder="General recommendations, diet..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-teal-400"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleCompleteConsultation}
              disabled={submitting || !diagnosis}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? 'Saving...' : 'Validate Consultation & Close'}
            </button>
            {!diagnosis && <p className="text-xs text-center text-red-500 mt-2">Diagnosis is required to close the consultation.</p>}
          </div>

        </div>
      </div>
    </Layout>
  );
}
