import React, { useState, useEffect } from 'react';
import {
  Users2,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  CheckCircle,
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const CRMManagement = () => {
  const [leads, setLeads] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [leadForm, setLeadForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    source: 'Call / WhatsApp',
    estimatedBudget: 80000,
    message: ''
  });

  const [followUpForm, setFollowUpForm] = useState({
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    channel: 'Call',
    priority: 'Medium',
    notes: ''
  });

  const fetchLeads = async () => {
    try {
      const [leadsRes, quotsRes, follRes] = await Promise.all([
        api.get(`/crm/leads?status=${statusFilter}&search=${search}`),
        api.get('/crm/quotations'),
        api.get('/crm/followups')
      ]);

      if (leadsRes.data.success) setLeads(leadsRes.data.leads);
      if (quotsRes.data.success) setQuotations(leadsRes.data.quotations || []);
      if (follRes.data.success) setFollowUps(follRes.data.followUps || []);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, search]);

  const handleUpdateLeadStatus = async (id, newStatus) => {
    try {
      await api.put(`/crm/leads/${id}`, { status: newStatus });
      fetchLeads();
    } catch (err) {
      alert('Failed to update lead status: ' + err.message);
    }
  };

  const handleConvertLead = async (id) => {
    if (!window.confirm('Convert this lead to a registered Customer profile?')) return;
    try {
      const res = await api.post(`/crm/leads/${id}/convert`);
      if (res.data.success) {
        alert('Lead successfully converted to Customer profile!');
        fetchLeads();
      }
    } catch (err) {
      alert('Failed to convert lead: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crm/leads', leadForm);
      setShowLeadModal(false);
      setLeadForm({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        source: 'Call / WhatsApp',
        estimatedBudget: 80000,
        message: ''
      });
      fetchLeads();
    } catch (err) {
      alert('Failed to create lead: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await api.post('/crm/followups', {
        ...followUpForm,
        lead: selectedLead._id
      });
      setShowFollowUpModal(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      alert('Failed to schedule follow-up: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Module 4: CRM & Guest Acquisition
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Enquiries, Leads & Follow-ups
          </h1>
        </div>

        <button
          onClick={() => setShowLeadModal(true)}
          className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Lead
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lead by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'New', 'Contacted', 'Follow-up', 'Interested', 'Quotation Sent', 'Converted', 'Lost'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Lead Name</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4">Origin / Source</th>
              <th className="py-3 px-4">Budget / Est.</th>
              <th className="py-3 px-4">Stage Status</th>
              <th className="py-3 px-4">Last Remark</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500">
                  No leads matching current filter.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-slate-100 block">{lead.fullName}</strong>
                    <span className="text-[10px] text-slate-500">{lead.city || 'Location N/A'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <a href={`tel:${lead.phone}`} className="text-amber-400 hover:underline flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3" /> {lead.phone}
                    </a>
                    {lead.email && <span className="text-slate-400 text-[11px] block">{lead.email}</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {lead.estimatedBudget ? `₹${lead.estimatedBudget.toLocaleString('en-IN')}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateLeadStatus(lead._id, e.target.value)}
                      className={`text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-950 border ${
                        lead.status === 'Converted'
                          ? 'border-emerald-500 text-emerald-400'
                          : lead.status === 'Lost'
                          ? 'border-red-500 text-red-400'
                          : 'border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {['New', 'Contacted', 'Follow-up', 'Interested', 'Quotation Sent', 'Converted', 'Lost'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                    {lead.notes?.[0]?.text || 'No remarks recorded'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowFollowUpModal(true);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px]"
                      title="Schedule Follow-up"
                    >
                      Follow-up
                    </button>
                    {lead.status !== 'Converted' && (
                      <button
                        onClick={() => handleConvertLead(lead._id)}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-semibold border border-emerald-500/30"
                        title="Convert to Customer"
                      >
                        Convert
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Follow-up Modal */}
      {showFollowUpModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100">
              Schedule Follow-Up: {selectedLead.fullName}
            </h3>

            <form onSubmit={handleCreateFollowUp} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  required
                  value={followUpForm.scheduledDate}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, scheduledDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Communication Channel</label>
                <select
                  value={followUpForm.channel}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, channel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  <option value="Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">In-Person Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Priority</label>
                <select
                  value={followUpForm.priority}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, priority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Discussion Agenda / Notes</label>
                <textarea
                  rows="2"
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  placeholder="e.g. Send wedding photoshoot package quotation"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Add New Guest Enquiry / Lead
            </h3>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.fullName}
                  onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Lead Source</label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  >
                    <option value="Call / WhatsApp">Call / WhatsApp</option>
                    <option value="Website Direct">Website Direct</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Est. Budget (₹)</label>
                  <input
                    type="number"
                    value={leadForm.estimatedBudget}
                    onChange={(e) => setLeadForm({ ...leadForm, estimatedBudget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Initial Enquiry Notes</label>
                <textarea
                  rows="2"
                  value={leadForm.message}
                  onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  placeholder="e.g. Planning a 3-night birthday celebration for 12 adults."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMManagement;
