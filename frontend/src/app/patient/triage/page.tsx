'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { apiCall } from '../../../utils/api';

interface TriageResult {
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  specialty: string;
  recommendedAction: string;
  symptoms: string[];
  confidence: number;
}

export default function MedicalTriage() {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [history, setHistory] = useState<TriageResult[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
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

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    
    try {
      // Simuler l'analyse IA (remplacer par appel API réel)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults: TriageResult = {
        urgency: symptoms.toLowerCase().includes('urgence') || symptoms.toLowerCase().includes('douleur') ? 'high' : 'medium',
        specialty: determineSpecialty(symptoms),
        recommendedAction: getRecommendedAction(symptoms),
        symptoms: extractSymptoms(symptoms),
        confidence: Math.floor(Math.random() * 20) + 80 // 80-99%
      };

      setResult(mockResults);
      setHistory([mockResults, ...history.slice(0, 4)]);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const determineSpecialty = (symptoms: string): string => {
    const lowerSymptoms = symptoms.toLowerCase();
    
    if (lowerSymptoms.includes('heart') || lowerSymptoms.includes('chest') || lowerSymptoms.includes('palpitation')) {
      return 'Cardiology';
    } else if (lowerSymptoms.includes('child') || lowerSymptoms.includes('baby') || lowerSymptoms.includes('pediatrics')) {
      return 'Pediatrics';
    } else if (lowerSymptoms.includes('woman') || lowerSymptoms.includes('pregnancy') || lowerSymptoms.includes('gynecology')) {
      return 'Gynecology';
    } else if (lowerSymptoms.includes('head') || lowerSymptoms.includes('migraine') || lowerSymptoms.includes('neuro')) {
      return 'Neurology';
    } else if (lowerSymptoms.includes('skin') || lowerSymptoms.includes('dermatology')) {
      return 'Dermatology';
    } else if (lowerSymptoms.includes('eyes') || lowerSymptoms.includes('ophthalmology')) {
      return 'Ophthalmology';
    } else if (lowerSymptoms.includes('stomach') || lowerSymptoms.includes('digestion')) {
      return 'Gastroenterology';
    } else {
      return 'General Medicine';
    }
  };

  const getRecommendedAction = (symptoms: string): string => {
    const lowerSymptoms = symptoms.toLowerCase();
    
    if (lowerSymptoms.includes('emergency') || lowerSymptoms.includes('severe')) {
      return 'Consult the emergency room immediately';
    } else if (lowerSymptoms.includes('strong pain') || lowerSymptoms.includes('intense')) {
      return 'Make an appointment within 24 hours';
    } else if (lowerSymptoms.includes('light') || lowerSymptoms.includes('mild')) {
      return 'Consult your primary care physician';
    } else {
      return 'Make an appointment with a specialist';
    }
  };

  const extractSymptoms = (symptoms: string): string[] => {
    const commonSymptoms = ['fever', 'pain', 'fatigue', 'headache', 'cough', 'nausea', 'dizziness', 'shortness of breath'];
    const found: string[] = [];
    
    commonSymptoms.forEach(symptom => {
      if (symptoms.toLowerCase().includes(symptom)) {
        found.push(symptom);
      }
    });
    
    return found.length > 0 ? found : ['general symptoms'];
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '✅';
      default: return '📋';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'Emergency';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Normal';
    }
  };

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
            <h1 className="text-2xl font-bold text-teal-900 tracking-tight">🧠 AI Medical Triage</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl font-sans">AI</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Patient</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Triage Interface */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Describe your symptoms</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What symptoms are you experiencing? (be as precise as possible)
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="E.g.: I have a headache since this morning, with fever and nausea..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <p>🤖 AI will analyze your symptoms to guide you</p>
                    <p>⚡ Real-time analysis with personalized recommendations</p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={!symptoms.trim() || isAnalyzing}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze my symptoms'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Result Section */}
            {result && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Analysis results</h2>
                
                <div className="space-y-6">
                  {/* Urgency Level */}
                  <div className={`p-6 rounded-xl border-2 ${getUrgencyColor(result.urgency)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getUrgencyIcon(result.urgency)}</span>
                        <div>
                          <h3 className="text-lg font-bold">Urgency level</h3>
                          <p className="text-sm opacity-80">{getUrgencyText(result.urgency)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{result.confidence}%</p>
                        <p className="text-sm opacity-80">Confidence</p>
                      </div>
                    </div>
                  </div>

                  {/* Specialty Recommendation */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Recommended specialty</h3>
                    <p className="text-blue-700 font-medium">{result.specialty}</p>
                  </div>

                  {/* Recommended Action */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-900 mb-2">Recommended action</h3>
                    <p className="text-green-700">{result.recommendedAction}</p>
                  </div>

                  {/* Symptoms Detected */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-3">Detected symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.symptoms.map((symptom, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                      📅 Book an appointment
                    </button>
                    <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium">
                      💬 Consult a doctor online
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Quick Tips */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Tips</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Be precise in your description</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Indicate the duration of symptoms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Mention the intensity of the pain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Specify the triggering factors</span>
                </li>
              </ul>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Recent analyses</h3>
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                          {getUrgencyIcon(item.urgency)} {getUrgencyText(item.urgency)}
                        </span>
                        <span className="text-xs text-gray-500">{index + 1} analysis/es ago</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.specialty}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.symptoms.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Info */}
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <h3 className="text-lg font-bold text-red-900 mb-4">🚨 In case of emergency</h3>
              <div className="space-y-3 text-sm">
                <p className="text-red-700 font-medium">Dial immediately:</p>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-600">15</p>
                  <p className="text-xs text-red-600">Ambulance / Emergency</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xl font-bold text-red-600">17</p>
                  <p className="text-xs text-red-600">Police</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xl font-bold text-red-600">18</p>
                  <p className="text-xs text-red-600">Firefighters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
