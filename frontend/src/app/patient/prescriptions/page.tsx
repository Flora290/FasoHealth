'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { apiCall, getApiUrl } from '../../../utils/api';

interface Prescription {
  _id: string;
  doctor: {
    name: string;
    specialty: string;
    phone: string;
    email: string;
    signature?: string;
  };
  patient: {
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
  appointment: {
    date: string;
    reason: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  diagnosis: string;
  notes: string;
  generalInstructions?: string;
  issuedDate: string;
  validUntil: string;
  qrCode?: string;
  sharedWith: Array<{
    type: 'pharmacy' | 'patient';
    name: string;
    sharedAt: string;
  }>;
}

export default function DigitalPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareType, setShareType] = useState<'pharmacy' | 'patient'>('pharmacy');

  useEffect(() => {
    fetchUserData();
    fetchPrescriptions();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const userData = await apiCall('/api/auth/profile', { headers });
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${getApiUrl()}/api/prescriptions/my`, { headers });
      
      if (!res.ok) throw new Error('Network error');
      
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (prescription: Prescription) => {
    // Simuler le téléchargement du PDF
    const prescriptionData = {
      id: prescription._id,
      issuedDate: prescription.issuedDate,
      doctor: prescription.doctor.name,
      patient: prescription.patient.name,
      medications: prescription.medications
    };

    // Créer un blob PDF simulé
    const blob = new Blob([JSON.stringify(prescriptionData, null, 2)], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordonnance_${prescription._id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!selectedPrescription || !shareEmail) return;

    try {
      // Simuler le partage
      const newShare = {
        type: shareType,
        name: shareEmail,
        sharedAt: new Date().toISOString()
      };

      // Mettre à jour l'ordonnance
      const updatedPrescriptions = prescriptions.map(p => 
        p._id === selectedPrescription._id 
          ? { ...p, sharedWith: [...p.sharedWith, newShare] }
          : p
      );
      setPrescriptions(updatedPrescriptions);

      setShowShareModal(false);
      setShareEmail('');
      alert('Prescription shared successfully!');
    } catch (error) {
      console.error('Error sharing prescription:', error);
    }
  };

  const shareWithPharmacy = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShareType('pharmacy');
    setShowShareModal(true);
  };

  const shareWithPatient = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShareType('patient');
    setShowShareModal(true);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getStatusColor = (validUntil: string) => {
    return isExpired(validUntil) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getStatusText = (validUntil: string) => {
    return isExpired(validUntil) ? 'Expired' : 'Valid';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFloatingPills={true}>
      <div className="min-h-screen p-6 sm:p-12">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient" className="text-teal-600 hover:text-teal-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-teal-900 tracking-tight">📄 Digital Prescriptions</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl font-sans">📋</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Patient</p>
            </div>
          </div>
        </header>

        {/* Prescription List */}
        <div className="space-y-6">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Prescription #{prescription._id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.validUntil)}`}>
                      {getStatusText(prescription.validUntil)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📅 {new Date(prescription.issuedDate).toLocaleDateString('en-US')}</span>
                    <span>👤 Dr. {prescription.doctor?.name || 'Unknown'}</span>
                    <span>🏥 {prescription.doctor?.specialty || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(prescription)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => setSelectedPrescription(prescription)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    👁️ View
                  </button>
                </div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-3">👤 Patient</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{prescription.patient?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{prescription.patient?.age ? `${prescription.patient.age} years old` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{prescription.patient?.gender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{prescription.patient?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-3">📋 Consultation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{prescription.appointment?.date ? new Date(prescription.appointment.date).toLocaleDateString('en-US') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{prescription.appointment?.reason || prescription.diagnosis || 'Consultation'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Validity:</span>
                      <span className="font-medium">{new Date(prescription.validUntil).toLocaleDateString('en-US')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-2">🔍 Diagnostic</h4>
                <p className="text-gray-700 bg-yellow-50 rounded-lg p-3">{prescription.diagnosis || prescription.generalInstructions || 'None provided'}</p>
              </div>

              {/* Medications */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4">💊 Medications</h4>
                <div className="space-y-3">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="bg-blue-50 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-gray-600">Medication</span>
                          <p className="font-medium text-blue-900">{medication.name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Dosage</span>
                          <p className="font-medium">{medication.dosage}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Frequency</span>
                          <p className="font-medium">{medication.frequency}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Duration</span>
                          <p className="font-medium">{medication.duration}</p>
                        </div>
                      </div>
                      {medication.instructions && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <span className="text-xs text-gray-600">Instructions:</span>
                          <p className="text-sm text-blue-800">{medication.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">📝 Doctor's notes</h4>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{prescription.notes}</p>
                </div>
              )}

              {/* Sharing */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">🔄 Partage</h4>
                    {prescription.sharedWith && prescription.sharedWith.length > 0 ? (
                      <div className="space-y-1">
                        {prescription.sharedWith.map((share, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {share.type === 'pharmacy' ? '🏥' : '👤'} {share.name} - {new Date(share.sharedAt).toLocaleDateString('en-US')}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not shared</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareWithPharmacy(prescription)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      🏥 Share with pharmacy
                    </button>
                    <button
                      onClick={() => shareWithPatient(prescription)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      👤 Share with patient
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Modal */}
        {showShareModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Share prescription
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share type
                  </label>
                  <select
                    value={shareType}
                    onChange={(e) => setShareType(e.target.value as 'pharmacy' | 'patient')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="pharmacy">Pharmacy</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {shareType === 'pharmacy' ? "Pharmacy email" : "Patient email"}
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-blue-900 mb-2">📋 Shared Information</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Medications and dosage</li>
                    <li>• Doctor's diagnosis</li>
                    <li>• Validity date</li>
                    <li>• Patient information</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareEmail('');
                    setSelectedPrescription(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={!shareEmail}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {prescriptions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions</h3>
            <p className="text-gray-500 mb-4">You don't have any digital prescriptions yet.</p>
            <Link
              href="/search"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Book an appointment
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
