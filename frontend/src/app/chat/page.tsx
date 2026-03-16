'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getApiUrl } from '@/utils/api';

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchUser();
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/profile`, { headers });
      setUser(await res.json());
    } catch (e) {}
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/appointments/my?status=confirmed&limit=20`, { headers });
      const data = await res.json();
      // Use confirmed appointments as "conversations" with doctors
      const convs = (data.appointments || []).map((apt: any) => ({
        id: apt._id,
        doctor: apt.doctor,
        specialty: apt.specialty,
        appointmentDate: apt.date,
        lastMessage: null,
      }));
      setConversations(convs);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const fetchMessages = async (conv: any) => {
    setSelectedConversation(conv);
    setMessages([]);
    try {
      const res = await fetch(`${getApiUrl()}/api/messages?recipientId=${conv.doctor?._id}&limit=50`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      // API might not expose this route yet - show placeholder
      setMessages([]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    const tempMsg = {
      _id: Date.now().toString(),
      content: newMessage,
      sender: { _id: user?._id || 'me' },
      createdAt: new Date().toISOString(),
      pending: true
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    try {
      const res = await fetch(`${getApiUrl()}/api/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipient: selectedConversation.doctor?._id,
          content: newMessage,
          appointment: selectedConversation.id
        })
      });
      if (res.ok) {
        const sent = await res.json();
        setMessages(prev => prev.map(m => m._id === tempMsg._id ? { ...sent, pending: false } : m));
      }
    } catch (e) {
      setMessages(prev => prev.map(m => m._id === tempMsg._id ? { ...m, error: true, pending: false } : m));
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 shadow-sm">
          <Link href="/dashboard/patient" className="text-teal-600 hover:text-teal-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900">💬 Messaging</h1>
        </header>

        <div className="flex flex-1 h-0 overflow-hidden">
          
          {/* Sidebar — Conversations */}
          <aside className="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-500">Your doctors</p>
            </div>
            
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm text-gray-500">No conversation</p>
                <p className="text-xs text-gray-400 mt-1">Your confirmed doctors will appear here</p>
                <Link href="/search" className="mt-4 text-sm text-teal-600 font-semibold hover:text-teal-800">
                  Find a doctor →
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => fetchMessages(conv)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                      selectedConversation?.id === conv.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">
                      🩺
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{conv.doctor?.name}</p>
                      <p className="text-xs text-teal-600 truncate">{conv.specialty?.name || 'Doctor'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Chat Area */}
          <main className="flex-1 flex flex-col min-w-0">
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">Select a conversation</h2>
                <p className="text-gray-400 text-sm">Choose a doctor from the list to start chatting</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-lg">🩺</div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedConversation.doctor?.name}</p>
                    <p className="text-xs text-teal-600">{selectedConversation.specialty?.name || 'Doctor'}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">👋</div>
                      <p className="text-gray-500 text-sm">Start the conversation with your doctor</p>
                    </div>
                  )}
                  {messages.map(msg => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                          isMe 
                            ? 'bg-teal-600 text-white rounded-br-sm' 
                            : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-sm'
                        } ${msg.pending ? 'opacity-70' : ''} ${msg.error ? 'border-red-200' : ''}`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-teal-200' : 'text-gray-400'}`}>
                            {msg.pending ? '⏳' : msg.error ? '❌' : new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="bg-white border-t border-gray-100 p-4 flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
