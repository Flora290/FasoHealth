'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getApiUrl } from '../../utils/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const API_URL = getApiUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications?limit=50`, { headers });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PUT', headers });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, { method: 'PUT', headers });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}`, { method: 'DELETE', headers });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) { console.error(e); }
  };

  const getNotifIcon = (type: string) => {
    if (type?.includes('appointment')) return '📅';
    if (type?.includes('review')) return '⭐';
    if (type?.includes('cancel')) return '❌';
    if (type?.includes('confirm')) return '✅';
    return '🔔';
  };

  const getNotifColor = (type: string) => {
    if (type?.includes('cancel')) return 'bg-red-50 border-red-100';
    if (type?.includes('confirm')) return 'bg-green-50 border-green-100';
    if (type?.includes('pending')) return 'bg-yellow-50 border-yellow-100';
    return 'bg-blue-50 border-blue-100';
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6 sm:p-12">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient" className="text-teal-600 hover:text-teal-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-teal-900">🔔 Notifications</h1>
              {unreadCount > 0 && <p className="text-teal-600 text-sm">{unreadCount} unread</p>}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="px-4 py-2 text-sm font-semibold text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-50 transition-all">
              ✓ Mark all as read
            </button>
          )}
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === f ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
              }`}>
              {f === 'all' ? 'All' : 'Unread'}
              {f === 'unread' && unreadCount > 0 && <span className="ml-1 bg-white text-teal-700 rounded-full px-1.5 text-xs">{unreadCount}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all set!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(notif => (
              <div key={notif._id}
                className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all ${getNotifColor(notif.type)} ${!notif.isRead ? 'shadow-sm' : 'opacity-70'}`}>
                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-teal-500" />
                )}

                {/* Icon */}
                <div className="text-2xl flex-shrink-0">{getNotifIcon(notif.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={() => !notif.isRead && markAsRead(notif._id)}>
                  <p className={`font-semibold text-gray-900 ${!notif.isRead ? 'cursor-pointer' : ''}`}>{notif.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Delete */}
                <button onClick={() => deleteNotification(notif._id)} className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
