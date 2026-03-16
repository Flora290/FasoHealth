'use client';

import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { apiCall } from '../../../utils/api';

interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'urgent' | 'result' | 'payment';
  title: string;
  message: string;
  phoneNumber: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  retryCount: number;
  cost?: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  type: 'appointment' | 'reminder' | 'urgent' | 'result' | 'payment';
  template: string;
  variables: string[];
  language: 'fr' | 'moore' | 'dioula';
}

export default function SMSNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'settings'>('notifications');
  const [user, setUser] = useState<any>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
    fetchTemplates();
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

  const fetchNotifications = async () => {
    try {
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Appointment Reminder',
          message: 'Reminder: Your appointment with Dr. Kaboré is tomorrow at 2:00 PM. National Yalgado Hospital.',
          phoneNumber: '+226 70 10 20 30',
          status: 'delivered',
          sentAt: '2024-03-14T10:00:00',
          deliveredAt: '2024-03-14T10:02:00',
          retryCount: 0,
          cost: 50
        },
        {
          id: '2',
          type: 'urgent',
          title: 'Urgent Change',
          message: 'URGENT: Your 3:00 PM appointment is rescheduled to 4:30 PM. Please confirm.',
          phoneNumber: '+226 70 15 25 35',
          status: 'sent',
          sentAt: '2024-03-14T09:30:00',
          retryCount: 1,
          cost: 50
        },
        {
          id: '3',
          type: 'result',
          title: 'Results Available',
          message: 'Your laboratory results are available. Download them on SmartCare.',
          phoneNumber: '+226 70 20 30 40',
          status: 'pending',
          retryCount: 0,
          cost: 50
        },
        {
          id: '4',
          type: 'payment',
          title: 'Payment Confirmed',
          message: 'Payment of 15,000 FCFA received for your consultation. Thank you!',
          phoneNumber: '+226 70 25 35 45',
          status: 'failed',
          retryCount: 3,
          cost: 0
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      // Mock templates data
      const mockTemplates: SMSTemplate[] = [
        {
          id: '1',
          name: 'Appointment Reminder',
          type: 'appointment',
          template: 'SmartCare: Appointment with Dr. {doctor_name} on {date} at {time}. {hospital}. Cancel: {cancel_link}',
          variables: ['doctor_name', 'date', 'time', 'hospital', 'cancel_link'],
          language: 'fr'
        },
        {
          id: '2',
          name: 'Appointment Confirmation',
          type: 'appointment',
          template: 'SmartCare: Appointment confirmed! Dr. {doctor_name} on {date} at {time}. {hospital}',
          variables: ['doctor_name', 'date', 'time', 'hospital'],
          language: 'fr'
        },
        {
          id: '3',
          name: 'Rappel Moore',
          type: 'reminder',
          template: 'SmartCare: Foogo la wã {doctor_name} {date} {time}. {hospital}. Ka booga: {cancel_link}',
          variables: ['doctor_name', 'date', 'time', 'hospital', 'cancel_link'],
          language: 'moore'
        },
        {
          id: '4',
          name: 'Rappel Dioula',
          type: 'reminder',
          template: 'SmartCare: Rappel {doctor_name} {date} {time}. {hospital}. Annuler: {cancel_link}',
          variables: ['doctor_name', 'date', 'time', 'hospital', 'cancel_link'],
          language: 'dioula'
        },
        {
          id: '5',
          name: 'Urgency',
          type: 'urgent',
          template: 'URGENT SmartCare: {message}. Call {phone} immediately or go to the emergency room.',
          variables: ['message', 'phone'],
          language: 'fr'
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber || (!selectedTemplate && !customMessage)) return;

    try {
      const message = selectedTemplate ? selectedTemplate.template : customMessage;
      
      // Simulate sending SMS
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: selectedTemplate?.type || 'appointment',
        title: selectedTemplate?.name || 'Custom Message',
        message,
        phoneNumber,
        status: 'pending',
        retryCount: 0,
        cost: 50
      };

      setNotifications([newNotification, ...notifications]);
      setShowSendModal(false);
      setPhoneNumber('');
      setCustomMessage('');
      setSelectedTemplate(null);

      // Simulate status update
      setTimeout(() => {
        setNotifications(prev => prev.map(n => 
          n.id === newNotification.id 
            ? { ...n, status: 'sent', sentAt: new Date().toISOString() }
            : n
        ));
      }, 2000);

      setTimeout(() => {
        setNotifications(prev => prev.map(n => 
          n.id === newNotification.id 
            ? { ...n, status: 'delivered', deliveredAt: new Date().toISOString() }
            : n
        ));
      }, 5000);

    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const handleRetry = async (notificationId: string) => {
    try {
      // Simulate retry
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, status: 'pending', retryCount: n.retryCount + 1 }
          : n
      ));

      setTimeout(() => {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'sent', sentAt: new Date().toISOString() }
            : n
        ));
      }, 2000);

      setTimeout(() => {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'delivered', deliveredAt: new Date().toISOString() }
            : n
        ));
      }, 5000);

    } catch (error) {
      console.error('Error retrying SMS:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'sent': return 'Sent';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'reminder': return '⏰';
      case 'urgent': return '🚨';
      case 'result': return '📊';
      case 'payment': return '💳';
      default: return '📱';
    }
  };

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'fr': return '🇫🇷';
      case 'moore': return '🇧🇫';
      case 'dioula': return '🇨🇮';
      default: return '🌍';
    }
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
            <h1 className="text-2xl font-bold text-teal-900 tracking-tight">📶 SMS Notifications</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSendModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              📱 Send SMS
            </button>
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl font-sans">📱</span>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{notifications.length}</h3>
            <p className="text-sm text-gray-600">SMS sent</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-sm text-gray-500">Livrés</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {notifications.filter(n => n.status === 'delivered').length}
            </h3>
            <p className="text-sm text-gray-600">Successfully</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {notifications.filter(n => n.status === 'pending').length}
            </h3>
            <p className="text-sm text-gray-600">In progress</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-sm text-gray-500">Cost</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {notifications.filter(n => n.cost).reduce((sum, n) => sum + (n.cost || 0), 0)}
            </h3>
            <p className="text-sm text-gray-600">Total FCFA</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'notifications' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📱 Notifications
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'templates' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 Templates
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'settings' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">SMS Notifications History</h2>
            
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600">{notification.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {getStatusText(notification.status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.deliveredAt && `Delivered: ${new Date(notification.deliveredAt).toLocaleTimeString('en-US')}`}
                        {notification.sentAt && !notification.deliveredAt && `Sent: ${new Date(notification.sentAt).toLocaleTimeString('en-US')}`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700">{notification.message}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {notification.retryCount > 0 && (
                        <span>⚠️ {notification.retryCount} attempt(s)</span>
                      )}
                      {notification.cost && (
                        <span>💰 {notification.cost} FCFA</span>
                      )}
                    </div>
                    
                    {notification.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(notification.id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        🔄 Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">SMS Templates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.type === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {template.type}
                        </span>
                        <span className="text-sm">{getLanguageFlag(template.language)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 font-mono">{template.template}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Variables:</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowSendModal(true);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    📱 Use this template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">SMS Settings</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">📱 SMS Providers</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🟠</span>
                        <div>
                          <p className="font-medium">Orange SMS</p>
                          <p className="text-sm text-gray-600">0.05 USD/SMS</p>
                        </div>
                      </div>
                      <input type="radio" name="provider" className="w-4 h-4" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🟡</span>
                        <div>
                          <p className="font-medium">MTN SMS</p>
                          <p className="text-sm text-gray-600">0.045 USD/SMS</p>
                        </div>
                      </div>
                      <input type="radio" name="provider" className="w-4 h-4" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🟢</span>
                        <div>
                          <p className="font-medium">Moov SMS</p>
                          <p className="text-sm text-gray-600">0.04 USD/SMS</p>
                        </div>
                      </div>
                      <input type="radio" name="provider" className="w-4 h-4" />
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">⚙️ Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of send attempts
                      </label>
                      <input
                        type="number"
                        defaultValue="3"
                        min="1"
                        max="5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay between attempts (minutes)
                      </label>
                      <input
                        type="number"
                        defaultValue="5"
                        min="1"
                        max="60"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" defaultChecked />
                        <span className="text-sm font-medium text-gray-700">
                          Enable automatic notifications
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" defaultChecked />
                        <span className="text-sm font-medium text-gray-700">
                          Send in multilingual (English/French/Moore/Dioula)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">📊 Statistics and Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        📊 Export statistics
                      </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        📄 Monthly report
                      </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        💰 SMS Billing
                      </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send SMS Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send an SMS</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+226 XX XX XX XX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template (optional)</label>
                  <select
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      setSelectedTemplate(template || null);
                      if (template) {
                        setCustomMessage(template.template);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} {getLanguageFlag(template.language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    rows={4}
                    maxLength={160}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                   />
                  <p className="text-sm text-gray-500 mt-1">
                    {customMessage.length}/160 characters
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-blue-900 mb-2">💡 Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• SMS are limited to 160 characters</li>
                    <li>• Use templates to ensure consistency</li>
                    <li>• Double check the phone number</li>
                    <li>• Urgent SMS have priority</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSendModal(false);
                    setPhoneNumber('');
                    setCustomMessage('');
                    setSelectedTemplate(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendSMS}
                  disabled={!phoneNumber || !customMessage}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📱 Send SMS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
