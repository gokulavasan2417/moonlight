import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  Search,
  Plus,
  CreditCard,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Printer,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { downloadExcelReport } from '../utils/exportToExcel';

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Manual Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    description: 'Special Event & Banquet Setup',
    taxableAmount: 25000,
    paidAmount: 25000
  });

  const fetchData = async () => {
    try {
      const [invRes, payRes, refRes] = await Promise.all([
        api.get(`/billing/invoices?status=${statusFilter}&search=${search}`),
        api.get('/billing/payments'),
        api.get('/billing/refunds'),
      ]);

      if (invRes.data.success) setInvoices(invRes.data.invoices);
      if (payRes.data.success) setPayments(payRes.data.payments);
      if (refRes.data.success) setRefunds(refRes.data.refunds);
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, search]);

  const handleCreateManualInvoice = async (e) => {
    e.preventDefault();
    try {
      const taxable = Number(invoiceForm.taxableAmount);
      const gst = Math.round((taxable * 18) / 100);
      const grandTotal = taxable + gst;
      const paid = Number(invoiceForm.paidAmount);
      const balance = Math.max(0, grandTotal - paid);

      await api.post('/billing/invoices', {
        invoiceType: 'General Bill',
        customerDetails: {
          fullName: invoiceForm.fullName,
          email: invoiceForm.email,
          phone: invoiceForm.phone
        },
        items: [{
          description: invoiceForm.description,
          quantity: 1,
          unitPrice: taxable,
          taxableAmount: taxable,
          gstRate: 18,
          gstAmount: gst,
          total: grandTotal
        }],
        subTotal: taxable,
        gstDetails: { totalGst: gst },
        grandTotal,
        paidAmount: paid,
        balanceDue: balance,
        status: balance <= 0 ? 'Paid' : 'Partially Paid'
      });

      setShowInvoiceModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to create invoice: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      setDownloadingId(invoice._id);
      setDownloadError('');

      const response = await api.get(`/invoices/${invoice._id}/download-pdf`, {
        responseType: 'blob'
      });

      // Handle binary response with Blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = invoice.invoiceNumber ? `${invoice.invoiceNumber}.pdf` : `invoice-${invoice._id}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
      let errMsg = 'Failed to generate and download PDF invoice.';
      if (err.response && err.response.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errMsg = json.message;
        } catch {
          // Keep default message
        }
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setDownloadError(errMsg);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await downloadExcelReport('invoices');
    } catch (err) {
      alert(err.message || 'Failed to export invoices');
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
            Module 6: Financial Operations
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Billing, Tax Invoices & Payments
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {exporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export GST Report</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Generate Manual Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold overflow-x-auto pb-1 max-w-full">
        {[
          { id: 'invoices', label: 'Tax Invoices', count: invoices.length },
          { id: 'payments', label: 'Payment Transactions', count: payments.length },
          { id: 'refunds', label: 'Refunds Log', count: refunds.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-400 bg-slate-900/50 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Invoices View */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {downloadError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{downloadError}</span>
              </div>
              <button
                onClick={() => setDownloadError('')}
                className="text-red-400 hover:text-red-300 font-bold ml-2 px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search invoice number, guest name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 max-w-full">
              {['All', 'Paid', 'Partially Paid', 'Issued', 'Overdue'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
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

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
            <div className="sm:hidden px-4 py-2 text-[11px] text-slate-400 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                👉 Swipe left/right to view all invoice columns
              </span>
              <span className="text-[10px] text-slate-500">{invoices.length} Invoices</span>
            </div>
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full min-w-[850px] text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Guest / Bill To</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Taxable Amt</th>
                    <th className="py-3 px-4">GST (18%)</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">PDF Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-500">
                        No invoices recorded.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-100 block whitespace-nowrap">{inv.customerDetails?.fullName}</strong>
                          <span className="text-slate-500 text-[10px]">{inv.customerDetails?.phone}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(inv.issueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium whitespace-nowrap">₹{inv.subTotal?.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">₹{inv.gstDetails?.totalGst?.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-bold text-slate-100 whitespace-nowrap">
                          ₹{inv.grandTotal?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-400 whitespace-nowrap">
                          ₹{inv.balanceDue?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : inv.status === 'Partially Paid'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(inv)}
                            disabled={downloadingId === inv._id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-wait text-amber-400 hover:text-amber-300 rounded border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                            title="Download Generated PDF Invoice"
                          >
                            {downloadingId === inv._id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                <span>Downloading...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payments View */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
          <div className="sm:hidden px-4 py-2 text-[11px] text-slate-400 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              👉 Swipe left/right to view transactions
            </span>
            <span className="text-[10px] text-slate-500">{payments.length} Payments</span>
          </div>
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[700px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">{p.paymentReference}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 whitespace-nowrap">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{p.paymentType}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{p.paymentMethod}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Create Manual Tax Invoice
            </h3>

            <form onSubmit={handleCreateManualInvoice} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.fullName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={invoiceForm.phone}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={invoiceForm.email}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Service Description</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Taxable Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.taxableAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, taxableAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.paidAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, paidAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Create & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;
