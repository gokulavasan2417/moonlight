import api from '../services/api';

/**
 * Downloads an Excel (.xlsx) report from the backend with authentication.
 *
 * @param {string} moduleName - Module name (reservations, invoices, expenses, leads, customers, rooms, villas, vendors, payouts, staff)
 * @param {string} [customFilename] - Optional custom filename for the download
 * @returns {Promise<boolean>} - Resolves true on success
 */
export const downloadExcelReport = async (moduleName = 'reservations', customFilename = null) => {
  try {
    const res = await api.get(`/reports/export-excel?module=${encodeURIComponent(moduleName)}`, {
      responseType: 'blob'
    });

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const formattedTitle = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = customFilename || `Moon_Light_Villa_${formattedTitle}_Report_${dateStamp}.xlsx`;

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn(`Axios blob export failed for ${moduleName}, attempting tokenized fallback:`, err.message);

    // Fallback: If blob stream is blocked by browser, try token query parameter download
    const token = localStorage.getItem('moonlight_token');
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const cleanBase = apiBase.endsWith('/api') ? apiBase : `${apiBase.replace(/\/+$/, '')}/api`;

    if (token) {
      const fallbackUrl = `${cleanBase}/reports/export-excel?module=${encodeURIComponent(moduleName)}&token=${encodeURIComponent(token)}`;
      window.open(fallbackUrl, '_blank');
      return true;
    }

    throw new Error(err.response?.data?.message || 'Failed to generate Excel report. Please ensure you are logged in.');
  }
};

export default downloadExcelReport;
