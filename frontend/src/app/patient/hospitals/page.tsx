'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { apiCall } from '../../../utils/api';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  specialties: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  rating?: number;
  isOpen: boolean;
  emergency: boolean;
}

export default function HospitalLocator() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
    getUserLocation();
    fetchHospitals();
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

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback: Ouagadougou coordinates
          setUserLocation({ lat: 12.3714, lng: -1.5197 });
        }
      );
    } else {
      // Fallback
      setUserLocation({ lat: 12.3714, lng: -1.5197 });
    }
  };

  const fetchHospitals = async () => {
    try {
      // Mock data for now (remplacer par appel API réel)
      const mockHospitals: Hospital[] = [
        {
          _id: '1',
          name: 'Yalgado Ouédraogo National Hospital',
          address: '03 BP 698, Ouagadougou',
          city: 'Ouagadougou',
          phone: '+226 50 30 71 00',
          email: 'contact@hny.bf',
          specialties: ['Cardiology', 'Pediatrics', 'Emergency', 'Maternity'],
          coordinates: { lat: 12.3714, lng: -1.5197 },
          rating: 4.5,
          isOpen: true,
          emergency: true
        },
        {
          _id: '2',
          name: 'Yalgado University Hospital Center',
          address: 'Avenue Kwamé N\'Krumah, Ouagadougou',
          city: 'Ouagadougou',
          phone: '+226 50 30 72 00',
          email: 'info@chu-yo.bf',
          specialties: ['Neurology', 'Orthopedics', 'Surgery', 'Emergency'],
          coordinates: { lat: 12.3650, lng: -1.5250 },
          rating: 4.3,
          isOpen: true,
          emergency: true
        },
        {
          _id: '3',
          name: 'La Médicale Polyclinic',
          address: 'Avenue Kwamé N\'Krumah, Ouagadougou',
          city: 'Ouagadougou',
          phone: '+226 50 31 00 00',
          email: 'contact@polymedicale.bf',
          specialties: ['General Medicine', 'Pediatrics', 'Gynecology'],
          coordinates: { lat: 12.3800, lng: -1.5100 },
          rating: 4.1,
          isOpen: false,
          emergency: false
        },
        {
          _id: '4',
          name: 'Bambino Clinic',
          address: 'Zone du Bois, Ouagadougou',
          city: 'Ouagadougou',
          phone: '+226 50 49 00 00',
          email: 'contact@bambino.bf',
          specialties: ['Pediatrics', 'Neonatology', 'Pediatric Surgery'],
          coordinates: { lat: 12.3550, lng: -1.5050 },
          rating: 4.7,
          isOpen: true,
          emergency: false
        },
        {
          _id: '5',
          name: 'Bogodogo District Hospital',
          address: 'Bogodogo, Ouagadougou',
          city: 'Ouagadougou',
          phone: '+226 50 30 80 00',
          email: 'info@hdb.bf',
          specialties: ['Emergency', 'General Medicine', 'Maternity'],
          coordinates: { lat: 12.3900, lng: -1.5300 },
          rating: 3.8,
          isOpen: true,
          emergency: true
        }
      ];

      // Calculate distances if user location is available
      if (userLocation) {
        const hospitalsWithDistance = mockHospitals.map(hospital => ({
          ...hospital,
          distance: calculateDistance(userLocation, hospital.coordinates)
        }));
        setHospitals(hospitalsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
      } else {
        setHospitals(mockHospitals);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (userLoc: { lat: number; lng: number }, hospitalLoc: { lat: number; lng: number }): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (hospitalLoc.lat - userLoc.lat) * Math.PI / 180;
    const dLng = (hospitalLoc.lng - userLoc.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(hospitalLoc.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDirections = (hospital: Hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.coordinates.lat},${hospital.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || hospital.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const specialties = ['Cardiology', 'Pediatrics', 'Emergency', 'Maternity', 'Neurology', 'Orthopedics', 'Surgery', 'Gynecology', 'General Medicine'];

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
            <h1 className="text-2xl font-bold text-teal-900 tracking-tight">📍 Hospital Location</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl font-sans">🗺️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Patient</p>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hospital name or address..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick filters</label>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                  🚨 Emergency
                </button>
                <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                  🟢 Open
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hospitals map</h2>
            <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <p className="text-gray-600 mb-2">Interactive hospitals map</p>
                <p className="text-sm text-gray-500">Google Maps integration planned</p>
                <div className="mt-4 space-y-2">
                  {filteredHospitals.slice(0, 3).map((hospital, index) => (
                    <div key={hospital._id} className="text-xs text-gray-600">
                      📍 {hospital.name} - {hospital.distance ? `${hospital.distance.toFixed(1)} km` : 'Unknown distance'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hospital List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredHospitals.map((hospital) => (
              <div key={hospital._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => setSelectedHospital(hospital)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{hospital.name}</h3>
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hospital.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hospital.isOpen ? '🟢 Open' : '🔴 Closed'}
                      </span>
                      {hospital.emergency && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          🚨 Emergency
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {hospital.distance && (
                      <p className="text-lg font-bold text-green-600">{hospital.distance.toFixed(1)} km</p>
                    )}
                    {hospital.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-medium">{hospital.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {hospital.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>📞 {hospital.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(hospital);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      🗺️ Directions
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${hospital.phone}`;
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      📞 Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Detail Modal */}
        {selectedHospital && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedHospital.name}</h2>
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-medium">{selectedHospital.address}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-medium">{selectedHospital.phone}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium">{selectedHospital.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Distance</p>
                      <p className="font-medium">{selectedHospital.distance ? `${selectedHospital.distance.toFixed(1)} km` : 'Unknown distance'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Available specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHospital.specialties.map((specialty, index) => (
                        <span key={index} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => getDirections(selectedHospital)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      🗺️ Get directions
                    </button>
                    <button
                      onClick={() => window.location.href = `tel:${selectedHospital.phone}`}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                    >
                      📞 Call now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
