'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';

function AppointmentBookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get('doctorId');

  const [doctor, setDoctor] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(!!doctorId);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  useEffect(() => {
    if (!doctorId && typeof window !== 'undefined') {
       router.push('/search');
    }
  }, [doctorId]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: '',
    reason: '',
    symptoms: '',
    notes: '',
    consultationType: 'in-person',
    paymentMethod: 'cash',
    phoneNumber: ''
  });

  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState('');

  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (form.date && doctorId) fetchSlots();
  }, [form.date]);

  const fetchDoctor = async () => {
    setLoadingDoctor(true);
    try {
      const res = await fetch(`${API_URL}/api/search/doctors/${doctorId}`);
      const data = await res.json();
      setDoctor(data.doctor);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDoctor(false);
    }
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await fetch(`${API_URL}/api/search/slots/${doctorId}?date=${form.date}`);
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) { setError('Please choose a time slot.'); return; }
    
    
    setSubmitting(true); setError('');
    try {
      // 1. Create the appointment first (with 'pending' status)
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          doctor: doctorId,
          availability: selectedSlot.availabilityId,
          date: form.date,
          startTime: selectedSlot.time,
          endTime: selectedSlot.time,
          reason: form.reason,
          symptoms: form.symptoms,
          notes: form.notes,
          consultationType: form.consultationType,
          payment: {
            method: form.paymentMethod === 'cash' ? 'cash' : 'online',
            amount: 2000,
            status: 'pending'
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        // 2. If online payment is needed, stop and show payment step
        if (form.paymentMethod !== 'cash') {
          setCreatedAppointmentId(data._id);
          setPaymentStep(true);
          setSubmitting(false);
          return;
        }

        // 3. Otherwise (cash), finish
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/patient'), 2500);
      } else {
        setError(data.message || 'Error occurred while booking appointment.');
        setSubmitting(false);
      }
    } catch (e) {
      setError('Unable to contact the server.');
      setSubmitting(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!form.phoneNumber) { setError('Please enter your mobile money number.'); return; }
    setPaymentProcessing(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          appointmentId: createdAppointmentId,
          provider: form.paymentMethod,
          phoneNumber: form.phoneNumber,
          amount: 2000
        })
      });

      if (res.ok) {
        // Mocking the successful payment after simulation
        setTimeout(() => {
          setPaymentSuccess(true);
          setPaymentProcessing(false);
          setPaymentStep(false);
          setSuccess(true);
          setTimeout(() => router.push('/dashboard/patient'), 2500);
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.message || 'Payment initiation failed.');
        setPaymentProcessing(false);
      }
    } catch (e) {
      setError('Network error during payment.');
      setPaymentProcessing(false);
    }
  };

  if (loadingDoctor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500" />
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
        <div className="text-7xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-teal-900 mb-2">Appointment confirmed!</h2>
        <p className="text-gray-600 mb-4">Your request has been sent to Dr. {doctor?.name}. You will receive a confirmation.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6 sm:p-12">

      {/* Header */}
      <header className="flex items-center gap-3 mb-10">
        <Link href="/search" className="text-teal-600 hover:text-teal-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-teal-900">📅 Book an Appointment</h1>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Doctor Card */}
        {doctor && (
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-md"
              style={{ background: doctor.specialty?.color ? `${doctor.specialty.color}20` : '#e6fffa' }}>
              {doctor.specialty?.icon || '🩺'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-teal-600">{doctor.specialty?.name}</p>
              {doctor.averageRating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-sm ${s <= Math.round(doctor.averageRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                  <span className="text-xs text-gray-500">({doctor.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-teal-100 p-8 space-y-6">
          {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium">{error}</div>}

          {/* Step 1: Date */}
          <div>
            <label className="block text-sm font-bold text-teal-900 mb-2">1. Choose a date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          {/* Step 2: Time Slot */}
          {form.date && (
            <div>
              <label className="block text-sm font-bold text-teal-900 mb-2">2. Choose a slot</label>
              {loadingSlots ? (
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-orange-50 text-orange-700 p-4 rounded-xl text-sm">
                  No slots available on this date. Try another date.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedSlot?.time === slot.time
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Consultation type */}
          <div>
            <label className="block text-sm font-bold text-teal-900 mb-2">3. Consultation type</label>
            <div className="flex gap-3">
              {[
                { value: 'in-person', label: '🏥 In-person' },
                { value: 'video', label: '💻 Video' },
                { value: 'phone', label: '📞 Phone' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, consultationType: opt.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    form.consultationType === opt.value
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Reason */}
          <div>
            <label className="block text-sm font-bold text-teal-900 mb-2">4. Reason for consultation *</label>
            <input
              type="text"
              required
              placeholder="Ex: Abdominal pain, health check-up..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          {/* Step 5: Symptoms */}
          <div>
            <label className="block text-sm font-bold text-teal-900 mb-2">5. Symptoms (optional)</label>
            <textarea
              rows={3}
              placeholder="Describe your symptoms in detail..."
              value={form.symptoms}
              onChange={e => setForm({ ...form, symptoms: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 resize-none"
            />
          </div>

          {/* Step 6: Payment Method */}
          <div>
            <label className="block text-sm font-bold text-teal-900 mb-4">6. Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <button 
                  type="button" 
                  onClick={() => setForm({ ...form, paymentMethod: 'orange' })}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${form.paymentMethod === 'orange' ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200' : 'bg-white border-slate-100 hover:border-orange-200'}`}
               >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1024px-Orange_logo.svg.png" className="w-8 h-8 rounded-lg" alt="Orange" />
                  <div className="text-left">
                     <p className="text-sm font-bold text-slate-900">Orange Money</p>
                     <p className="text-[10px] text-slate-500">2000 FCFA</p>
                  </div>
               </button>
               <button 
                  type="button" 
                  onClick={() => setForm({ ...form, paymentMethod: 'moov' })}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${form.paymentMethod === 'moov' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}
               >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">MOOV</div>
                  <div className="text-left">
                     <p className="text-sm font-bold text-slate-900">Moov Money</p>
                     <p className="text-[10px] text-slate-500">2000 FCFA</p>
                  </div>
               </button>
               <button 
                  type="button" 
                  onClick={() => setForm({ ...form, paymentMethod: 'cash' })}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${form.paymentMethod === 'cash' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
               >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">💵</div>
                  <div className="text-left">
                     <p className="text-sm font-bold text-slate-900">Cash on Arrival</p>
                     <p className="text-[10px] text-slate-500">Free booking</p>
                  </div>
               </button>
            </div>
          </div>

          {paymentStep && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300">
                  <header className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Complete Payment</h3>
                    <p className="text-slate-500">Confirm your {form.paymentMethod} Money number.</p>
                  </header>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Mobile Number</label>
                      <input 
                        type="tel" 
                        placeholder="+226 XX XX XX XX" 
                        value={form.phoneNumber}
                        onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition font-mono text-lg" 
                      />
                    </div>
                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex justify-between items-center">
                       <span className="text-sm text-teal-800 font-medium">Amount to Pay</span>
                       <span className="text-lg font-black text-teal-900">2000 FCFA</span>
                    </div>
                  </div>

                  {paymentProcessing ? (
                    <div className="text-center py-6">
                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                       <p className="font-bold text-slate-800">Please confirm on your phone...</p>
                       <p className="text-sm text-slate-500">We are waiting for validation from {form.paymentMethod === 'orange' ? 'Orange' : 'Moov'}.</p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                       <button 
                          type="button" 
                          onClick={() => setPaymentStep(false)}
                          className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition"
                       >
                         Cancel
                       </button>
                       <button 
                          type="button" 
                          onClick={handleProcessPayment}
                          className={`flex-1 py-4 font-bold rounded-2xl text-white shadow-lg transition-all ${
                            form.paymentMethod === 'orange' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                          }`}
                       >
                         Pay Now
                       </button>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !selectedSlot || !form.reason}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '⏳ Sending...' : '✅ Confirm appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Layout showFloatingPills={false}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500" /></div>}>
        <AppointmentBookingForm />
      </Suspense>
    </Layout>
  );
}
