'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  isActive: boolean;
  isVerified?: boolean;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  verificationDocuments?: string[];
  profilePicture?: string;
  createdAt: string;
  specialty?: { name: string } | string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Add User modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'patient', specialty: '', phoneNumber: ''
  });

  // Edit User modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phoneNumber: '', role: 'patient', specialty: '' });

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // View Details Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);

  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';

  useEffect(() => {
    fetchUsers('', filterRole);
  }, [filterRole]);

  const fetchUsers = async (search = '', role = filterRole) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');

      let url = `${API_URL}/api/admin/users?limit=100`;
      if (role) url += `&role=${role}`;
      if (search) url += `&search=${search}`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error loading users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery, filterRole);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean, role: string) => {
    if (role === 'admin' && currentStatus === true) {
      alert('Cannot deactivate an administrator.');
      return;
    }
    setProcessingId(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Error updating user status');
      }
    } catch {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      specialty: typeof user.specialty === 'object' ? user.specialty?.name || '' : user.specialty || ''
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const body: any = {
        name: editForm.name,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        role: editForm.role,
      };
      if (editForm.role === 'doctor') body.specialty = editForm.specialty;

      const res = await fetch(`${API_URL}/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...body } : u));
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        alert(data.message || 'Error updating user');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (user: User) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setProcessingId(deletingUser._id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users/${deletingUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== deletingUser._id));
        setShowDeleteConfirm(false);
        setDeletingUser(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Error deleting user');
      }
    } catch {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'patient', specialty: '', phoneNumber: '' });
        setUsers(prev => [{ ...data, isActive: true, createdAt: new Date().toISOString() }, ...prev]);
        setTimeout(() => fetchUsers('', ''), 500);
      } else {
        alert(data.message || 'Error creating user');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSpecialtyName = (specialty: any) => {
    if (!specialty) return '—';
    if (typeof specialty === 'object') return specialty.name || '—';
    return specialty;
  };

  return (
    <Layout showFloatingPills={false}>
      <div className="min-h-screen bg-gray-50 flex">
        
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed hidden md:flex">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-teal-400">⚡</span> Admin Center
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>📊</span> Overview
            </Link>
            <Link href="/dashboard/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-600 text-white font-medium shadow-sm">
              <span>👥</span> Users
            </Link>
            <Link href="/dashboard/admin/hospitals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>🏥</span> Hospitals
            </Link>
            <Link href="/dashboard/admin/specialties" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition">
              <span>🩺</span> Specialties
            </Link>
            <Link href="/dashboard/admin/kyc" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition relative">
              <span>🛡️</span> Verification
              <span className="absolute right-4 top-3.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            </Link>
            <Link href="/dashboard/admin/payments" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-emerald-800/20 hover:text-emerald-400 transition">
              <span>💰</span> Cashier
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-6 sm:p-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
                <button 
                  onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-red-600 font-bold rounded-lg shadow-sm hover:bg-red-50 hover:border-red-100 transition text-sm flex items-center gap-2"
                >
                  <span>🚪</span> Exit
                </button>
              </div>
              <p className="text-slate-500 mt-1">Manage patients, doctors, and administrators of the FasoHealth system.</p>
            </div>
            
            <div className="flex w-full sm:w-auto gap-4">
              <form onSubmit={handleSearch} className="flex flex-1 sm:max-w-md bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <input 
                  type="text" 
                  placeholder="Search by name, email..." 
                  className="flex-1 px-4 py-2 outline-none text-slate-800"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 transition font-medium border-l border-slate-200">
                  Search
                </button>
              </form>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition whitespace-nowrap"
              >
                + Add
              </button>
            </div>
          </header>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 flex gap-2 flex-wrap">
              <button onClick={() => setFilterRole('')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterRole === '' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
              <button onClick={() => setFilterRole('patient')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterRole === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Patients</button>
              <button onClick={() => setFilterRole('doctor')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterRole === 'doctor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Doctors</button>
              <button onClick={() => setFilterRole('admin')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterRole === 'admin' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Admins</button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading users...</div>
            ) : error ? (
              <div className="p-12 text-center text-red-500">{error}</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No user found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold">User</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Created at</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                              ${user.role === 'doctor' ? 'bg-indigo-100 text-indigo-700' : 
                                user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <div className="font-bold text-slate-900">{user.name}</div>
                               <div className="text-sm text-slate-500">{user.email}</div>
                               {user.phoneNumber && <div className="text-xs text-slate-400">{user.phoneNumber}</div>}
                               {user.role === 'doctor' && <div className="text-xs text-indigo-500 font-medium">{getSpecialtyName(user.specialty)}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                            ${user.role === 'doctor' ? 'bg-indigo-50 text-indigo-700' : 
                              user.role === 'admin' ? 'bg-red-50 text-red-700' : 'bg-teal-50 text-teal-700'}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold 
                            ${user.isActive ? 'bg-emerald-100 text-emerald-800' : 
                              (user.role === 'doctor' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-red-100 text-red-800')}`}>
                            {user.isActive ? '● Active' : (user.role === 'doctor' ? '⏳ Pending' : '● Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                           {new Date(user.createdAt).toLocaleDateString('en-US')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {/* View Button */}
                            <button 
                              onClick={() => { setSelectedUserForView(user); setShowViewModal(true); }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition flex items-center gap-1"
                            >
                              👁️ View
                            </button>

                            {/* Edit Button */}
                            <button 
                              onClick={() => openEditModal(user)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                            >
                              ✏️ Edit
                            </button>

                            {/* Activate / Deactivate */}
                            <button 
                              onClick={() => toggleUserStatus(user._id, user.isActive, user.role)}
                              disabled={processingId === user._id || user.role === 'admin'}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition disabled:opacity-40
                                ${!user.isActive && user.role === 'doctor' ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' : 
                                  (user.isActive ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100')}`}
                            >
                              {processingId === user._id ? '...' : 
                                (!user.isActive && user.role === 'doctor' ? '✅ Approve' : (user.isActive ? '🔒 Deactivate' : '🔓 Activate'))}
                            </button>

                            {/* Delete Button */}
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => confirmDelete(user)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input required type="text" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                  <input required type="email" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password *</label>
                  <input required type="password" minLength={6} className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Role *</label>
                  <select className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="tel" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={newUser.phoneNumber} onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})} />
                </div>
                {newUser.role === 'doctor' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Specialty *</label>
                    <input required type="text" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none" 
                      placeholder="e.g. Cardiologist, Pediatrician..."
                      value={newUser.specialty} onChange={e => setNewUser({...newUser, specialty: e.target.value})} />
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
                <p className="text-sm text-slate-500 mt-0.5">Modifying: <span className="font-semibold text-slate-700">{editingUser.name}</span></p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input required type="text" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                  <input required type="email" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="tel" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} />
                </div>
                {editingUser.role !== 'admin' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                    <select className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>
                )}
                {editForm.role === 'doctor' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Specialty</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-50 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Cardiology, Pediatrics..."
                      value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && deletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to permanently delete <span className="font-bold text-slate-800">{deletingUser.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowDeleteConfirm(false); setDeletingUser(null); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={processingId === deletingUser._id}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50"
              >
                {processingId === deletingUser._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── View User Details Modal ── */}
      {showViewModal && selectedUserForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg
                  ${selectedUserForView.role === 'doctor' ? 'bg-indigo-500' : 
                    selectedUserForView.role === 'admin' ? 'bg-red-500' : 'bg-teal-500'}`}>
                  {selectedUserForView.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black">{selectedUserForView.name}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedUserForView.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Basic Information</h3>
                    <div className="space-y-3">
                       <div className="flex flex-col">
                          <span className="text-xs text-slate-500">Full Name</span>
                          <span className="font-bold text-slate-900">{selectedUserForView.name}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs text-slate-500">Email Address</span>
                          <span className="font-bold text-slate-900">{selectedUserForView.email}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs text-slate-500">Phone Number</span>
                          <span className="font-bold text-slate-900">{selectedUserForView.phoneNumber || 'Not provided'}</span>
                       </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Account Status</h3>
                    <div className="flex gap-2">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedUserForView.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedUserForView.isActive ? 'Active' : 'Inactive'}
                       </span>
                       {selectedUserForView.role === 'doctor' && (
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedUserForView.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {selectedUserForView.isVerified ? '✓ Verified' : '⚠ Unverified'}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                {/* Role Specific & KYC */}
                <div className="space-y-6">
                   {selectedUserForView.role === 'doctor' && (
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Medical Profile</h3>
                        <div className="px-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                           <p className="text-xs text-indigo-600 font-bold mb-1">Specialty</p>
                           <p className="font-black text-indigo-900 text-lg">{getSpecialtyName(selectedUserForView.specialty)}</p>
                        </div>
                      </div>
                   )}

                   <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Onboarding & KYC</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-xs text-slate-500 font-bold uppercase">KYC Status</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                              selectedUserForView.kycStatus === 'approved' ? 'bg-emerald-500 text-white' : 
                              selectedUserForView.kycStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                              {selectedUserForView.kycStatus || 'pending'}
                            </span>
                         </div>
                         <div className="flex justify-between items-center px-1">
                            <span className="text-xs text-slate-500 font-bold uppercase">Joined Date</span>
                            <span className="text-xs font-bold text-slate-700">{new Date(selectedUserForView.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Documents Section */}
              {selectedUserForView.verificationDocuments && selectedUserForView.verificationDocuments.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Verification Documents</h3>
                   <div className="grid grid-cols-2 gap-4">
                      {selectedUserForView.verificationDocuments.map((doc, idx) => (
                        <a 
                          key={idx} 
                          href={doc} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition">📄</span>
                          <div>
                            <p className="text-xs font-black text-slate-900">Document #{idx + 1}</p>
                            <p className="text-[10px] text-teal-600 font-bold">View / Download</p>
                          </div>
                        </a>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button 
                onClick={() => setShowViewModal(false)}
                className="px-8 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition shadow-lg"
               >
                 Close Overview
               </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
