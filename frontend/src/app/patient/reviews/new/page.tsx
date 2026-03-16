'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../components/Layout';
import { getApiUrl } from '@/utils/api';

function ReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get('doctorId');
  const appointmentId = searchParams.get('appointmentId');

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [aspects, setAspects] = useState({
    professionalism: 0,
    communication: 0,
    punctuality: 0,
    cleanliness: 0,
    effectiveness: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const aspectLabels: Record<string, string> = {
    professionalism: '👔 Professionalism',
    communication: '💬 Communication',
    punctuality: '⏰ Punctuality',
    cleanliness: '🧹 Cleanliness',
    effectiveness: '💊 Effectiveness'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please provide a global rating.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${getApiUrl()}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ doctor: doctorId, appointment: appointmentId, rating, comment, aspects, wouldRecommend })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/appointments'), 2500);
      } else {
        setError(data.message || 'Error while sending review.');
      }
    } catch {
      setError('Impossible to contact the server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
        <div className="text-7xl mb-4">🌟</div>
        <h2 className="text-2xl font-bold text-teal-900 mb-2">Thank you for your review!</h2>
        <p className="text-gray-600">Your feedback helps other patients choose the right doctor.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-6 sm:p-12">
      <header className="flex items-center gap-3 mb-10">
        <Link href="/appointments" className="text-teal-600 hover:text-teal-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-amber-900">⭐ Leave a Review</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-amber-100 p-8 space-y-8">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium">{error}</div>}

        {/* Global Rating */}
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 mb-4">Global Rating *</p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                className="text-5xl transition-transform hover:scale-110"
              >
                <span className={(hovered || rating) >= s ? 'text-yellow-400' : 'text-gray-200'}>★</span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-2 text-amber-700 font-medium">
              {['', 'Very bad', 'Bad', 'Fair', 'Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        {/* Aspect Ratings */}
        <div>
          <p className="text-sm font-bold text-gray-900 mb-4">Detailed ratings (optional)</p>
          <div className="space-y-4">
            {Object.keys(aspects).map(key => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 w-40">{aspectLabels[key]}</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAspects(prev => ({ ...prev, [key]: s }))}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        (aspects as any)[key] >= s ? 'text-yellow-400' : 'text-gray-200'
                      }`}
                    >★</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Would Recommend Toggle */}
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div>
            <p className="font-bold text-gray-900">Would you recommend this doctor? *</p>
            <p className="text-sm text-gray-600">Your recommendation will help other patients.</p>
          </div>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setWouldRecommend(true)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                wouldRecommend ? 'bg-teal-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              👍 Yes
            </button>
            <button
              type="button"
              onClick={() => setWouldRecommend(false)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                !wouldRecommend ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              👎 No
            </button>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Comment</label>
          <textarea
            rows={4}
            placeholder="Share your experience with this doctor..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '⏳ Sending...' : '⭐ Publish my review'}
        </button>
      </form>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Layout showFloatingPills={false}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400" /></div>}>
        <ReviewForm />
      </Suspense>
    </Layout>
  );
}
