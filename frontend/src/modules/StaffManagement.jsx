import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  UserCheck,
  UserX,
  History,
  Lock,
  Mail,
  Phone,
  Shield,
  KeyRound,
  MapPin,
  Home,
  Globe,
  RefreshCw,
  Key
} from 'lucide-react';
import api from '../services/api';

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    role: 'Receptionist',
    accessScope: 'All Properties',
    assignedLocation: '',
    assignedVilla: '',
    smartAccessPin: `PIN-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const fetchData = async () => {
    try {
      const [uRes, aRes, locRes, vilRes] = await Promise.all([
        api.get('/staff'),
        api.get('/staff/audit-logs'),
        api.get('/villas/locations/all'),
        api.get('/villas'),
      ]);
      if (uRes.data.success) setUsers(uRes.data.users);
      if (aRes.data.success) setAuditLogs(aRes.data.logs);
      if (locRes.data.success) setLocations(locRes.data.locations);
      if (vilRes.data.success) setVillas(vilRes.data.villas);
    } catch (err) {
      console.error('Failed to load staff management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/staff/${id}`, { isActive: !currentStatus });
      fetchData();
    } catch (err) {
      alert('Error updating user status: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', {
        ...formData,
        assignedLocation: formData.accessScope === 'Specific Location' ? formData.assignedLocation : null,
        assignedVilla: formData.accessScope === 'Specific Villa' ? formData.assignedVilla : null,
      });
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        phone: '',
        role: 'Receptionist',
        accessScope: 'All Properties',
        assignedLocation: '',
        assignedVilla: '',
        smartAccessPin: `PIN-${Math.floor(1000 + Math.random() * 9000)}`
      });
      fetchData();
      alert('Staff user and Villa Access credentials created successfully!');
    } catch (err) {
      alert('Error creating user: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Module 10: Security & Administration
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Staff Users, Roles & Compliance Audit Trail
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Staff Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'border-amber-400 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4" /> Staff Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'border-amber-400 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400'
          }`}
        >
          <History className="w-4 h-4" /> Activity & Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Staff Users Table */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Villa / Property Access</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-100">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3.5 px-4 text-slate-400">{u.phone || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {u.accessScope === 'Specific Location' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30 inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          {u.assignedLocation?.name || 'Assigned Branch'}
                        </span>
                      ) : u.accessScope === 'Specific Villa' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1">
                          <Home className="w-3 h-3 text-purple-400" />
                          {u.assignedVilla?.name || 'Assigned Villa'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                          <Globe className="w-3 h-3 text-amber-400" />
                          All 120 Rooms & Properties
                        </span>
                      )}
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Passcode: <strong className="text-amber-300">{u.smartAccessPin || 'PIN-9912'}</strong></span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {u.role !== 'Super Admin' && (
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors ${
                          u.isActive
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Activity Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200">System Activity Audit Log</h3>
            <p className="text-slate-400 text-[11px]">Comprehensive immutable record of reservations, logins, financial payouts, and user alterations.</p>
          </div>

          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-500 font-sans">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-200 font-sans">{log.userName}</td>
                    <td className="py-2.5 px-4 text-amber-400 font-sans">{log.userRole}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans">{log.module}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff User & Villa Access Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Create Staff Account & Villa Access
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Grant staff member access privileges to specific villas, properties, or global multi-location control.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email Address (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@moonlightvilla.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Login Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Role Permission *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-semibold"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Housekeeping Staff">Housekeeping Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98200 00000"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              {/* Property & Villa Access Scope Section */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <label className="block font-bold text-amber-400 uppercase text-[10px] tracking-wider">
                  Villa & Property Access Scope
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'All Properties', label: 'All Properties' },
                    { id: 'Specific Location', label: 'By Branch' },
                    { id: 'Specific Villa', label: 'By Villa' }
                  ].map((scope) => (
                    <button
                      type="button"
                      key={scope.id}
                      onClick={() => setFormData({ ...formData, accessScope: scope.id })}
                      className={`py-1.5 px-2 rounded-lg text-center font-semibold text-[11px] border transition-all ${
                        formData.accessScope === scope.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>

                {formData.accessScope === 'Specific Location' && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Select Assigned Branch/Property *</label>
                    <select
                      value={formData.assignedLocation}
                      onChange={(e) => setFormData({ ...formData, assignedLocation: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    >
                      <option value="">-- Choose Resort Branch --</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name} ({loc.city}, {loc.state})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.accessScope === 'Specific Villa' && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Select Assigned Luxury Villa *</label>
                    <select
                      value={formData.assignedVilla}
                      onChange={(e) => setFormData({ ...formData, assignedVilla: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    >
                      <option value="">-- Choose Villa / Estate --</option>
                      {villas.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name} ({v.propertyLocation?.name || 'Active Location'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 text-[11px]">Smart Gate / Door Passcode PIN</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, smartAccessPin: `PIN-${Math.floor(1000 + Math.random() * 9000)}` })}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.smartAccessPin}
                    onChange={(e) => setFormData({ ...formData, smartAccessPin: e.target.value })}
                    placeholder="PIN-8921"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 font-mono text-amber-400 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded shadow-md"
                >
                  Create Staff Account & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
