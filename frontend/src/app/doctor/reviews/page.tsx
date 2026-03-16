'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiCall } from '../../../utils/api';

interface Review {
  _id: string;
  patient: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  aspects: {
    professionalism: number;
    communication: number;
    punctuality: number;
    cleanliness: number;
    effectiveness: number;
  };
  wouldRecommend: boolean;
  treatmentOutcome?: string;
  waitTime?: string;
  isVerified: boolean;
  response?: {
    text: string;
    respondedAt: string;
    respondedBy: string;
  };
  helpful: {
    count: number;
    users: string[];
  };
  createdAt: string;
}

export default function DoctorReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState({
    rating: '',
    verified: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

      // Get user info first
      const userData = await apiCall('/api/auth/profile', { headers });

      // Fetch reviews with stats
      const queryParams = new URLSearchParams();
      if (filter.rating) queryParams.append('rating', filter.rating);
      if (filter.verified) queryParams.append('verified', filter.verified);

      const data = await apiCall(`/api/reviews/doctor/${userData._id}?${queryParams.toString()}&showUnverified=true`, { headers });
      
      setReviews(data.reviews || []);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const handleResponse = async (reviewId: string) => {
    if (!responseText.trim()) return;

    try {
      await apiCall(`/api/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ text: responseText })
      });

      setResponseText('');
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await apiCall(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 sm:p-12">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/doctor" className="text-teal-600 hover:text-teal-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-teal-900 tracking-tight">My Reviews</h1>
        </div>
      </header>

      {/* Stats Overview */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Global Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex text-yellow-400">
                  {getRatingStars(Math.round(stats.averageRating))}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating}/5</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.recommendationRate}%</p>
              <p className="text-sm text-gray-600">Would Recommend</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.verifiedCount || 0}</p>
              <p className="text-sm text-gray-600">Verified Reviews</p>
            </div>
          </div>

          {/* Aspect Ratings */}
          {stats.aspectRatings && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Ratings</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">👔</div>
                  <p className="text-sm text-gray-600">Professionalism</p>
                  <p className="font-bold text-gray-900">{stats.aspectRatings.professionalism}/5</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💬</div>
                  <p className="text-sm text-gray-600">Communication</p>
                  <p className="font-bold text-gray-900">{stats.aspectRatings.communication}/5</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⏰</div>
                  <p className="text-sm text-gray-600">Punctuality</p>
                  <p className="font-bold text-gray-900">{stats.aspectRatings.punctuality}/5</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🧼</div>
                  <p className="text-sm text-gray-600">Cleanliness</p>
                  <p className="font-bold text-gray-900">{stats.aspectRatings.cleanliness}/5</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💊</div>
                  <p className="text-sm text-gray-600">Effectiveness</p>
                  <p className="font-bold text-gray-900">{stats.aspectRatings.effectiveness}/5</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={filter.rating}
              onChange={(e) => setFilter({...filter, rating: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification status</label>
            <select
              value={filter.verified}
              onChange={(e) => setFilter({...filter, verified: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All reviews</option>
              <option value="true">Verified only</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">You haven't received any reviews from your patients yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{review.patient.name}</h3>
                    {review.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex text-yellow-400">
                      {getRatingStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">{review.rating}/5</span>
                    <span className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    className="text-sm text-gray-500 hover:text-teal-600 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 019.215 21H8.786a2 2 0 01-1.789-2.894l3.5-7A2 2 0 0112.215 6H14z" />
                    </svg>
                    Helpful ({review.helpful.count})
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Aspect Ratings */}
              {review.aspects && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Rated aspects:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="text-center">
                      <div className="text-lg mb-1">👔</div>
                      <p className="text-xs text-gray-600">Professionalism</p>
                      <p className="font-bold text-sm">{review.aspects.professionalism}/5</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg mb-1">💬</div>
                      <p className="text-xs text-gray-600">Communication</p>
                      <p className="font-bold text-sm">{review.aspects.communication}/5</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg mb-1">⏰</div>
                      <p className="text-xs text-gray-600">Punctuality</p>
                      <p className="font-bold text-sm">{review.aspects.punctuality}/5</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg mb-1">🧼</div>
                      <p className="text-xs text-gray-600">Cleanliness</p>
                      <p className="font-bold text-sm">{review.aspects.cleanliness}/5</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg mb-1">💊</div>
                      <p className="text-xs text-gray-600">Effectiveness</p>
                      <p className="font-bold text-sm">{review.aspects.effectiveness}/5</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                {review.wouldRecommend && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    ✅ Recommends
                  </span>
                )}
                {review.treatmentOutcome && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Outcome: {review.treatmentOutcome}
                  </span>
                )}
                {review.waitTime && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Wait time: {review.waitTime}
                  </span>
                )}
              </div>

              {/* Response */}
              {review.response ? (
                <div className="bg-teal-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-teal-900">Your response:</h4>
                    <span className="text-xs text-teal-600">
                      {new Date(review.response.respondedAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  <p className="text-sm text-teal-700">{review.response.text}</p>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Respond to this review
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Respond to review</h2>
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{selectedReview.patient.name}</h3>
                  <div className="flex text-yellow-400">
                    {getRatingStars(selectedReview.rating)}
                  </div>
                  <span className="text-sm text-gray-500">{selectedReview.rating}/5</span>
                </div>
                <p className="text-gray-700 italic">"{selectedReview.comment}"</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleResponse(selectedReview._id);
              }}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your response</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Thank the patient for their review and address their comments..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReview(null);
                      setResponseText('');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Send response
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
