'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { apiCall } from '../../../utils/api';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'card' | 'bank_transfer';
  icon: string;
  provider?: string;
  fees?: number;
}

interface Appointment {
  _id: string;
  doctor: {
    name: string;
    specialty: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  price: number;
  status: string;
}

export default function PaymentPage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'confirmation'>('method');
  const [user, setUser] = useState<any>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchAppointment();
    fetchPaymentMethods();
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

  const fetchAppointment = async () => {
    try {
      // Mock appointment data (remplacer par appel API réel)
      const mockAppointment: Appointment = {
        _id: '1',
        doctor: {
          name: 'Dr. Kaboré',
          specialty: 'Cardiologie'
        },
        date: '2024-03-15',
        startTime: '14:00',
        endTime: '15:00',
        consultationType: 'in-person',
        price: 15000, // FCFA
        status: 'confirmed'
      };
      setAppointment(mockAppointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      // Mock payment methods (remplacer par appel API réel)
      const mockMethods: PaymentMethod[] = [
        {
          id: 'orange_money',
          name: 'Orange Money',
          type: 'mobile_money',
          icon: '🟠',
          provider: 'Orange',
          fees: 0
        },
        {
          id: 'mtn_money',
          name: 'MTN Mobile Money',
          type: 'mobile_money',
          icon: '🟡',
          provider: 'MTN',
          fees: 0
        },
        {
          id: 'moov_money',
          name: 'Moov Money',
          type: 'mobile_money',
          icon: '🟢',
          provider: 'Moov',
          fees: 0
        },
        {
          id: 'wave',
          name: 'Wave',
          type: 'mobile_money',
          icon: '🌊',
          provider: 'Wave',
          fees: 0
        },
        {
          id: 'visa',
          name: 'Carte Visa',
          type: 'card',
          icon: '💳',
          fees: 2.5 // 2.5%
        },
        {
          id: 'mastercard',
          name: 'Mastercard',
          type: 'card',
          icon: '💳',
          fees: 2.5 // 2.5%
        }
      ];
      setPaymentMethods(mockMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod || !appointment) return;

    setProcessing(true);
    
    try {
      // Simuler le processus de paiement
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simuler le succès du paiement
      setPaymentStep('confirmation');
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 600); // Assuming 600 FCFA = 1 USD for mock purposes
  };

  const calculateFees = () => {
    if (!selectedMethod || !appointment) return 0;
    
    if (selectedMethod.type === 'card' && selectedMethod.fees) {
      return appointment.price * (selectedMethod.fees / 100);
    }
    return 0;
  };

  const getTotalAmount = () => {
    if (!appointment) return 0;
    return appointment.price + calculateFees();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
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
            <h1 className="text-2xl font-bold text-teal-900 tracking-tight">💳 Online Payment</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl font-sans">💳</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Patient</p>
            </div>
          </div>
        </header>

        {appointment && (
          <div className="max-w-4xl mx-auto">
            
            {/* Appointment Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Appointment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium">{appointment.doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty:</span>
                      <span className="font-medium">{appointment.doctor.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(appointment.date).toLocaleDateString('en-US')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{appointment.startTime} - {appointment.endTime}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {appointment.consultationType === 'in-person' ? '🏥 In-person' : '📹 Video'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">✅ Confirmed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation:</span>
                      <span className="font-medium">{formatPrice(appointment.price)}</span>
                    </div>
                    {selectedMethod && selectedMethod.fees && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fees (2.5%):</span>
                        <span className="font-medium">{formatPrice(calculateFees())}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-lg text-green-600">{formatPrice(getTotalAmount())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Process */}
            {paymentStep === 'method' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Choose payment method</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method);
                        setPaymentStep('details');
                      }}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedMethod?.id === method.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{method.icon}</div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900">{method.name}</h3>
                          {method.type === 'card' && (
                            <p className="text-sm text-gray-600">Fees: {method.fees}%</p>
                          )}
                          {method.type === 'mobile_money' && (
                            <p className="text-sm text-gray-600">Instant and secure</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentStep === 'details' && selectedMethod && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setPaymentStep('method')}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment details - {selectedMethod.name}
                  </h2>
                </div>

                {selectedMethod.type === 'mobile_money' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedMethod.provider} phone number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+226 XX XX XX XX"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-bold text-blue-900 mb-2">Payment Instructions</h3>
                      <ol className="text-sm text-blue-800 space-y-2">
                        <li>1. You will receive an OTP code via SMS</li>
                        <li>2. Enter the code to confirm payment</li>
                        <li>3. Payment will be processed instantly</li>
                      </ol>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={!phoneNumber || processing}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </span>
                      ) : (
                        `Payer ${formatPrice(getTotalAmount())}`
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name on card</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Jean Kaboré"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiration date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-xl p-4">
                      <h3 className="font-bold text-yellow-900 mb-2">🔒 Secure payment</h3>
                      <p className="text-sm text-yellow-800">
                        Your banking information is encrypted and secure. We never store your card data.
                      </p>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={!cardNumber || !cardName || !cardExpiry || !cardCvv || processing}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </span>
                      ) : (
                        `Payer ${formatPrice(getTotalAmount())}`
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {paymentStep === 'confirmation' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment successful!</h2>
                <p className="text-gray-600 mb-8">
                  Your payment of {formatPrice(getTotalAmount())} has been processed successfully.
                  A receipt has been sent to your email address.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Transaction Details</h3>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">TXN{Date.now()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium">{selectedMethod?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date().toLocaleDateString('en-US')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-green-600">{formatPrice(getTotalAmount())}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    📄 Print receipt
                  </button>
                  <Link
                    href="/dashboard/patient"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl hover:shadow-lg transition-all font-medium text-center"
                  >
                    Back to dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
