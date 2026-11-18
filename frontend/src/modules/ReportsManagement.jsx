import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  FileText,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { downloadExcelReport } from '../utils/exportToExcel';

const ReportsManagement = () => {
  const [selectedModule, setSelectedModule] = useState('reservations');
  const [dateRange, setDateRange] = useState('This Month');
  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const modulesList = [
    { id: 'reservations', name: 'Reservations & Stays', endpoint: '/reservations' },
    { id: 'invoices', name: 'Invoices & GST Collection', endpoint: '/billing/invoices' },
    { id: 'expenses', name: 'Operational Expenses', endpoint: '/finance/expenses' },
    { id: 'leads', name: 'CRM Leads & Conversion', endpoint: '/crm/leads' },
    { id: 'customers', name: 'Customer Lifetime Value', endpoint: '/customers' },
    { id: 'payouts', name: 'Disbursements & Payouts', endpoint: '/finance/payouts' },
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const active = modulesList.find((m) => m.id === selectedModule);
      const res = await api.get(active.endpoint);
      if (res.data.success) {
        if (selectedModule === 'reservations') setReportData(res.data.reservations || []);
        else if (selectedModule === 'invoices') setReportData(res.data.invoices || []);
        else if (selectedModule === 'expenses') setReportData(res.data.expenses || []);
        else if (selectedModule === 'leads') setReportData(res.data.leads || []);
        else if (selectedModule === 'customers') setReportData(res.data.customers || []);
        else if (selectedModule === 'payouts') setReportData(res.data.payouts || []);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedModule, dateRange]);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await downloadExcelReport(selectedModule);
    } catch (err) {
      alert(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Module 11: Business Intelligence
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Centralized Reports & Analytics
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {exporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 fill-slate-950 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Selected (Excel .xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Bar: Module Selector & Date Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        {/* Module Picker */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-slate-400 whitespace-nowrap">Report Domain:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
          >
            {modulesList.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['Today', 'This Week', 'This Month', 'Last Month', 'This Year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                dateRange === range
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 uppercase tracking-wider block">Total Records Generated</span>
          <strong className="text-2xl font-serif text-slate-100 block mt-2">{reportData.length} Records</strong>
          <span className="text-[11px] text-amber-400 mt-1 block">Live synchronized MongoDB dataset</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 uppercase tracking-wider block">Active Report Type</span>
          <strong className="text-xl font-bold text-slate-100 block mt-2 capitalize">{selectedModule} Summary</strong>
          <span className="text-[11px] text-slate-400 mt-1 block">Filter window: {dateRange}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 uppercase tracking-wider block">Compliance & Exports</span>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
              Excel Export Ready
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-semibold">
              Printable Format
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Formatted for hospitality accounts</span>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs printable-area">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <span className="font-semibold text-slate-200">
            {modulesList.find((m) => m.id === selectedModule)?.name} - Report Table
          </span>
          <span className="text-[10px] text-slate-400">Generated on {new Date().toLocaleDateString()}</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {selectedModule === 'reservations' && (
            <table className="w-full min-w-[750px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Advance Paid</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportData.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{r.bookingReference}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-100">{r.guestDetails?.fullName}</td>
                    <td className="py-2.5 px-4 text-slate-400">{r.guestDetails?.phone}</td>
                    <td className="py-2.5 px-4 text-slate-400">{new Date(r.checkIn).toLocaleDateString()}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">₹{r.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-emerald-400">₹{r.pricing?.advancePaid?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-amber-400">₹{r.pricing?.balanceDue?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px] font-semibold">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'invoices' && (
            <table className="w-full min-w-[750px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Billed To</th>
                  <th className="py-3 px-4">Taxable</th>
                  <th className="py-3 px-4">GST (18%)</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportData.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{i.invoiceNumber}</td>
                    <td className="py-2.5 px-4 text-slate-100">{i.customerDetails?.fullName}</td>
                    <td className="py-2.5 px-4">₹{i.subTotal?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">₹{i.gstDetails?.totalGst?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">₹{i.grandTotal?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-amber-400">₹{i.balanceDue?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px] font-semibold">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'expenses' && (
            <table className="w-full min-w-[700px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Voucher</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportData.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{e.expenseNumber}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-100">{e.title}</td>
                    <td className="py-2.5 px-4 text-slate-400">{e.categoryName}</td>
                    <td className="py-2.5 px-4 text-slate-300">{e.paidTo}</td>
                    <td className="py-2.5 px-4 font-bold text-red-400">₹{e.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-slate-400">{e.paymentMethod}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px] font-semibold">{e.approvalStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'leads' && (
            <table className="w-full min-w-[700px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Lead Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Estimated Budget</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportData.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-medium text-slate-100">{l.fullName}</td>
                    <td className="py-2.5 px-4 text-amber-400 font-mono">{l.phone}</td>
                    <td className="py-2.5 px-4 text-slate-400">{l.email}</td>
                    <td className="py-2.5 px-4 text-slate-300">{l.source}</td>
                    <td className="py-2.5 px-4 font-bold">₹{l.estimatedBudget?.toLocaleString('en-IN') || 'N/A'}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px] font-semibold">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'customers' && (
            <table className="w-full min-w-[700px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Stays Count</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Repeat Guest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportData.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-medium text-slate-100">{c.fullName}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">{c.phone}</td>
                    <td className="py-2.5 px-4 text-slate-400">{c.email}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">{c.totalBookingsCount}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">₹{c.totalSpent?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">{c.isRepeatGuest ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'payouts' && (
            <table className="w-full min-w-[700px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportData.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{p.payoutReference}</td>
                    <td className="py-2.5 px-4 text-slate-300">{p.payoutType}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-100">{p.recipientName}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-slate-400">{p.paymentMethod}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px] font-semibold">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
