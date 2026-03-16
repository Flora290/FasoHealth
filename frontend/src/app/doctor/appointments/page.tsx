'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  symptoms?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  consultationType: 'in-person' | 'video';
  payment?: {
    status: 'pending' | 'paid' | 'refunded';
    amount: number;
    method: 'cash' | 'card' | 'insurance' | 'online';
  };
  specialty: {
    _id: string;
    name: string;
  };
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);

      const res = await fetch(`http://${window.location.hostname}:5000/api/appointments/doctor?${queryParams.toString()}`, { headers });
      const data = await res.json();
      setAppointments(data.appointments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string, cancellationReason?: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const body: any = { status };
      if (cancellationReason) {
        body.cancellationReason = cancellationReason;
      }

      const res = await fetch(`http://${window.location.hostname}:5000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });

      if (res.ok) {
        fetchAppointments();
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'no-show': return 'No-show';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'Emergency';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return urgency;
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
          <h1 className="text-2xl font-bold text-teal-900 tracking-tight">My Appointments</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-show</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({...filter, startDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({...filter, endDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={() => setFilter({ status: '', startDate: '', endDate: '' })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500">No appointments match your search criteria.</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Patient Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-teal-600">
                      {appointment.patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.patient.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>📧 {appointment.patient.email}</span>
                      <span>📱 {appointment.patient.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(appointment.urgency)}`}>
                        {getUrgencyText(appointment.urgency)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {appointment.consultationType === 'video' ? '📹 Video' : '🏥 In-person'}
                      </span>
                      {appointment.payment && (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${appointment.payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {appointment.payment.status === 'paid' ? '💰 PAID' : '⌛ PENDING'} • {appointment.payment.amount || 2000} FCFA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1 lg:text-center">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString('en-US')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Time:</span> {appointment.startTime} - {appointment.endTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Specialty:</span> {appointment.specialty.name}
                    </p>
                    {appointment.reason && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                    )}
                    {appointment.symptoms && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <div className="flex gap-2">
                       <Link
                        href={`/doctor/appointments/${appointment._id}/consultation`}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Start consultation
                      </Link>
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedAppointment(appointment)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Appointment details</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Patient information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedAppointment.patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedAppointment.patient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedAppointment.patient.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Urgency</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedAppointment.urgency)}`}>
                        {getUrgencyText(selectedAppointment.urgency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Appointment information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString('en-US')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Consultation type</p>
                      <p className="font-medium">
                        {selectedAppointment.consultationType === 'video' ? '📹 Video consultation' : '🏥 In-person consultation'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Specialty</p>
                      <p className="font-medium">{selectedAppointment.specialty.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                        {getStatusText(selectedAppointment.status)}
                      </span>
                    </div>
                    {selectedAppointment.payment && (
                       <div>
                         <p className="text-sm text-gray-600">Payment</p>
                         <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedAppointment.payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                           {selectedAppointment.payment.status === 'paid' ? 'Paid' : 'Pending'} • {selectedAppointment.payment.amount || 2000} FCFA
                         </span>
                       </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Medical information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Reason for consultation</p>
                      <p className="font-medium">{selectedAppointment.reason || 'Not specified'}</p>
                    </div>
                    {selectedAppointment.symptoms && (
                      <div>
                        <p className="text-sm text-gray-600">Symptoms</p>
                        <p className="font-medium">{selectedAppointment.symptoms}</p>
                      </div>
                    )}
                    {selectedAppointment.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="font-medium">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedAppointment._id, 'confirmed');
                          setSelectedAppointment(null);
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for decline:');
                          if (reason) {
                            handleStatusUpdate(selectedAppointment._id, 'cancelled', reason);
                            setSelectedAppointment(null);
                          }
                        }}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  
                  {selectedAppointment.status === 'confirmed' && (
                    <>
                      <Link
                        href={`/doctor/appointments/${selectedAppointment._id}/consultation`}
                        className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Start consultation
                      </Link>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for cancellation:');
                          if (reason) {
                            handleStatusUpdate(selectedAppointment._id, 'cancelled', reason);
                            setSelectedAppointment(null);
                          }
                        }}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
