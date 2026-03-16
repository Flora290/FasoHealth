'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DoctorAvailability() {
  const [user, setUser] = useState<any>(null);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    slotDuration: 30,
    maxAppointments: 1,
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringEndDate: '',
    consultationType: 'in-person',
    location: {
      address: '',
      city: '',
      postalCode: ''
    }
  });

  const fetchAvailabilities = async () => {
    if (!user) return; // Don't fetch if user is not available yet
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await fetch(`http://${window.location.hostname}:5000/api/availability/doctor/${user._id}?startDate=${startDate}&endDate=${endDate}`, { headers });
      const data = await res.json();
      
      // Ensure data is always an array
      setAvailabilities(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      setAvailabilities([]); // Set to empty array on error
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAvailabilities();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const userRes = await fetch(`http://${window.location.hostname}:5000/api/auth/profile`, { headers });
      const userData = await userRes.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`http://${window.location.hostname}:5000/api/availability`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          date: '',
          startTime: '',
          endTime: '',
          slotDuration: 30,
          maxAppointments: 1,
          isRecurring: false,
          recurringPattern: 'weekly',
          recurringEndDate: '',
          consultationType: 'in-person',
          location: {
            address: '',
            city: '',
            postalCode: ''
          }
        });
        fetchAvailabilities();
      }
    } catch (error) {
      console.error('Error creating availability:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`http://${window.location.hostname}:5000/api/availability/${id}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        fetchAvailabilities();
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
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
          <h1 className="text-2xl font-bold text-teal-900 tracking-tight">Manage Availability</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Availability
        </button>
      </header>

      {/* Add Availability Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Availability</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation type</label>
                    <select
                      value={formData.consultationType}
                      onChange={(e) => setFormData({...formData, consultationType: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="in-person">In-person</option>
                      <option value="video">Video</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration per slot (minutes)</label>
                    <select
                      value={formData.slotDuration}
                      onChange={(e) => setFormData({...formData, slotDuration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum number of patients</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.maxAppointments || ''}
                      onChange={(e) => setFormData({...formData, maxAppointments: e.target.value ? parseInt(e.target.value) : '' as any})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700">
                      Recurring Availability
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence Pattern</label>
                        <select
                          value={formData.recurringPattern}
                          onChange={(e) => setFormData({...formData, recurringPattern: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence End Date</label>
                        <input
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData({...formData, recurringEndDate: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Consultation Location</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.location.address}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="123 Rue de la Santé"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.location.city}
                          onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Ouagadougou"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal code</label>
                        <input
                          type="text"
                          value={formData.location.postalCode}
                          onChange={(e) => setFormData({...formData, location: {...formData.location, postalCode: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="01 BP 1234"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Add Availability
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Availabilities List */}
      <div className="space-y-6">
        {availabilities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No availability</h3>
            <p className="text-gray-500 mb-4">Start by adding your availability to allow patients to book appointments.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add your first availability
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availabilities.map((availability) => (
              <div key={availability._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(availability.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {availability.startTime} - {availability.endTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    availability.consultationType === 'video' ? 'bg-blue-100 text-blue-800' :
                    availability.consultationType === 'both' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {availability.consultationType === 'video' ? '📹 Video' :
                     availability.consultationType === 'both' ? '🏥📹 Both' :
                     '🏥 In-person'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration per slot:</span>
                    <span className="font-medium">{availability.slotDuration} min</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available slots:</span>
                    <span className="font-medium">{availability.maxAppointments}</span>
                  </div>

                  {availability.isRecurring && (
                    <div className="bg-teal-50 p-2 rounded-lg">
                      <p className="text-xs text-teal-800 font-medium">
                        ♻️ Recurring: {availability.recurringPattern === 'daily' ? 'Daily' : 
                                  availability.recurringPattern === 'weekly' ? 'Weekly' : 'Monthly'}
                      </p>
                    </div>
                  )}

                  {availability.location && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">📍 {availability.location.address}</p>
                      <p>{availability.location.city}, {availability.location.postalCode}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Created on {new Date(availability.createdAt).toLocaleDateString('en-US')}
                  </div>
                  <button
                    onClick={() => handleDelete(availability._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
